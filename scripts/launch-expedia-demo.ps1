#Requires -Version 5.1
# Start the Family Bucket dev server and open Expedia left/right
# in borderless fullscreen (kiosk) windows on monitor 1 and monitor 2.

$ErrorActionPreference = "Stop"
$LogPath = Join-Path $env:TEMP "expedia-demo-launch.log"

function Write-Step([string]$Message) {
  $line = "[expedia-demo] $Message"
  Write-Host $line
  Add-Content -LiteralPath $LogPath -Value "$(Get-Date -Format o) $line" -ErrorAction SilentlyContinue
}

try {
  Set-Content -LiteralPath $LogPath -Value "$(Get-Date -Format o) start" -ErrorAction SilentlyContinue

  $RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
  # Dev split: Express API on 3002, Vite SPA on 5188.
  # Browser pages must hit Vite; 3002/expedia-left returns Cannot GET in dev.
  $ApiPort = 3002
  $VitePort = 5188
  $LeftUrl = "http://localhost:$VitePort/expedia-left"
  $RightUrl = "http://localhost:$VitePort/expedia-right"
  $LeftProfile = Join-Path $env:TEMP "expedia-demo-left"
  $RightProfile = Join-Path $env:TEMP "expedia-demo-right"

  function Find-Browser {
    $candidates = @(
      "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe",
      "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
      "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe",
      "${env:ProgramFiles}\Microsoft\Edge\Application\msedge.exe",
      "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
    )
    foreach ($path in $candidates) {
      if ($path -and (Test-Path -LiteralPath $path)) { return $path }
    }
    throw "Chrome or Edge not found. Install Google Chrome or Microsoft Edge."
  }

  function Find-Npm {
    $cmd = Get-Command npm.cmd -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    $cmd = Get-Command npm -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }

    $candidates = @(
      "$env:APPDATA\npm\npm.cmd",
      "${env:ProgramFiles}\nodejs\npm.cmd",
      "${env:ProgramFiles(x86)}\nodejs\npm.cmd"
    )
    foreach ($path in $candidates) {
      if (Test-Path -LiteralPath $path) { return $path }
    }
    throw "npm not found. Open a terminal, run npm -v, then try again."
  }

  function Test-PortOpen([int]$PortToCheck) {
    try {
      $client = New-Object System.Net.Sockets.TcpClient
      $iar = $client.BeginConnect("127.0.0.1", $PortToCheck, $null, $null)
      $ok = $iar.AsyncWaitHandle.WaitOne(400)
      if ($ok -and $client.Connected) {
        $client.EndConnect($iar)
        $client.Close()
        return $true
      }
      $client.Close()
    } catch {}
    return $false
  }

  function Wait-ForPort([int]$PortToCheck, [int]$TimeoutSec = 90) {
    $deadline = (Get-Date).AddSeconds($TimeoutSec)
    while ((Get-Date) -lt $deadline) {
      if (Test-PortOpen $PortToCheck) { return }
      Start-Sleep -Milliseconds 500
    }
    throw "Port $PortToCheck did not become ready within ${TimeoutSec}s."
  }

  function Get-MonitorBounds {
    Add-Type -AssemblyName System.Windows.Forms
    $screens = [System.Windows.Forms.Screen]::AllScreens
    if (-not $screens -or $screens.Count -eq 0) {
      throw "No displays detected."
    }

    # Physical left-to-right: leftmost screen gets expedia-left.
    $ordered = @($screens | Sort-Object { $_.Bounds.X }, { $_.Bounds.Y })
    $monitorLeft = $ordered[0]
    $monitorRight = if ($ordered.Count -gt 1) { $ordered[$ordered.Count - 1] } else { $ordered[0] }

    return @{
      Left  = $monitorLeft.Bounds
      Right = $monitorRight.Bounds
      Count = $screens.Count
    }
  }

  function Start-DevServerIfNeeded {
    $apiUp = Test-PortOpen $ApiPort
    $viteUp = Test-PortOpen $VitePort
    if ($apiUp -and $viteUp) {
      Write-Step "Dev already running (API :$ApiPort, Vite :$VitePort)"
      return
    }

    if (-not $apiUp -or -not $viteUp) {
      $npm = Find-Npm
      Write-Step "Starting npm run dev via $npm"
      Start-Process `
        -FilePath $npm `
        -ArgumentList @("run", "dev") `
        -WorkingDirectory $RepoRoot `
        -WindowStyle Minimized | Out-Null
    }

    Write-Step "Waiting for API :$ApiPort ..."
    Wait-ForPort $ApiPort
    Write-Step "Waiting for Vite :$VitePort ..."
    Wait-ForPort $VitePort
    Write-Step "Ready - opening $LeftUrl and $RightUrl"
  }

  function Start-KioskWindow {
    param(
      [string]$Browser,
      [string]$Url,
      [string]$UserDataDir,
      [System.Drawing.Rectangle]$Bounds
    )

    if (-not (Test-Path -LiteralPath $UserDataDir)) {
      New-Item -ItemType Directory -Path $UserDataDir | Out-Null
    }

    # Oversize slightly — Chrome kiosk + DPI scaling often leaves a 1px edge gap.
    $w = [Math]::Max(1, $Bounds.Width + 4)
    $h = [Math]::Max(1, $Bounds.Height + 4)
    $argList = @(
      "--user-data-dir=$UserDataDir",
      "--new-window",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-session-crashed-bubble",
      "--disable-features=TranslateUI",
      "--autoplay-policy=no-user-gesture-required",
      "--window-position=$($Bounds.X),$($Bounds.Y)",
      "--window-size=$w,$h",
      "--kiosk",
      $Url
    )

    Start-Process -FilePath $Browser -ArgumentList $argList | Out-Null
  }

  Write-Step "Repo: $RepoRoot"
  Write-Step "Left URL:  $LeftUrl"
  Write-Step "Right URL: $RightUrl"
  $browser = Find-Browser
  Write-Step "Browser: $browser"

  $monitors = Get-MonitorBounds
  if ($monitors.Count -lt 2) {
    Write-Step "Only one monitor detected - both windows will use that display."
  } else {
    $l = $monitors.Left
    $r = $monitors.Right
    Write-Step ("Monitor 1 (left): {0}x{1} at {2},{3}" -f $l.Width, $l.Height, $l.X, $l.Y)
    Write-Step ("Monitor 2 (right): {0}x{1} at {2},{3}" -f $r.Width, $r.Height, $r.X, $r.Y)
  }

  Start-DevServerIfNeeded

  Write-Step "Opening expedia-left on monitor 1 (kiosk)..."
  Start-KioskWindow -Browser $browser -Url $LeftUrl -UserDataDir $LeftProfile -Bounds $monitors.Left
  Start-Sleep -Milliseconds 700
  Write-Step "Opening expedia-right on monitor 2 (kiosk)..."
  Start-KioskWindow -Browser $browser -Url $RightUrl -UserDataDir $RightProfile -Bounds $monitors.Right

  Write-Step "Done. Press Esc in a kiosk window to exit that window."
  exit 0
}
catch {
  $msg = $_.Exception.Message
  Write-Step "ERROR: $msg"
  try {
    Add-Type -AssemblyName System.Windows.Forms
    [System.Windows.Forms.MessageBox]::Show(
      "Expedia Demo failed to launch:`n`n$msg`n`nLog: $LogPath",
      "Expedia Demo",
      [System.Windows.Forms.MessageBoxButtons]::OK,
      [System.Windows.Forms.MessageBoxIcon]::Error
    ) | Out-Null
  } catch {
    # last resort
  }
  exit 1
}
