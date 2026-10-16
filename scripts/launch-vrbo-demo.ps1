#Requires -Version 5.1
# Start the Family Bucket dev server and open Vrbo left/right
# in borderless fullscreen (kiosk) windows on monitor 1 and monitor 2.

$ErrorActionPreference = "Stop"
$LogPath = Join-Path $env:TEMP "vrbo-demo-launch.log"

function Write-Step([string]$Message) {
  $line = "[vrbo-demo] $Message"
  Write-Host $line
  Add-Content -LiteralPath $LogPath -Value "$(Get-Date -Format o) $line" -ErrorAction SilentlyContinue
}

try {
  Set-Content -LiteralPath $LogPath -Value "$(Get-Date -Format o) start" -ErrorAction SilentlyContinue

  $RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
  # Dev split: Express API on 3002, Vite SPA on 5188.
  # Browser pages must hit Vite; 3002/vrbo-left returns Cannot GET in dev.
  $ApiPort = 3002
  $VitePort = 5188
  $LeftUrl = "http://localhost:$VitePort/vrbo-left"
  $RightUrl = "http://localhost:$VitePort/vrbo-right"
  $LeftProfile = Join-Path $env:TEMP "vrbo-demo-left"
  $RightProfile = Join-Path $env:TEMP "vrbo-demo-right"

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

  function Get-ScreenByDisplayNumber {
    param(
      [System.Windows.Forms.Screen[]]$Screens,
      [int]$Number
    )
    $match = $Screens | Where-Object { $_.DeviceName -match ("DISPLAY{0}$" -f $Number) } | Select-Object -First 1
    if ($match) { return $match }
    # Fallback: 1-based index in left-to-right order
    $ordered = @($Screens | Sort-Object { $_.Bounds.X }, { $_.Bounds.Y })
    $idx = $Number - 1
    if ($idx -ge 0 -and $idx -lt $ordered.Count) { return $ordered[$idx] }
    return $null
  }

  function Get-MonitorBounds {
    Add-Type -AssemblyName System.Windows.Forms
    $screens = [System.Windows.Forms.Screen]::AllScreens
    if (-not $screens -or $screens.Count -eq 0) {
      throw "No displays detected."
    }

    # Windows display numbers: 2 → vrbo-left, 3 → vrbo-right.
    $monitorLeft = Get-ScreenByDisplayNumber -Screens $screens -Number 2
    $monitorRight = Get-ScreenByDisplayNumber -Screens $screens -Number 3
    if (-not $monitorLeft) { throw "Display 2 not found. Connected: $($screens.DeviceName -join ', ')" }
    if (-not $monitorRight) { throw "Display 3 not found. Connected: $($screens.DeviceName -join ', ')" }

    return @{
      Monitor2 = $monitorLeft.Bounds
      Monitor3 = $monitorRight.Bounds
      Count    = $screens.Count
      Labels   = @{
        Monitor2 = $monitorLeft.DeviceName
        Monitor3 = $monitorRight.DeviceName
      }
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
  $m2 = $monitors.Monitor2
  $m3 = $monitors.Monitor3
  Write-Step ("Monitor 2 ({0}): {1}x{2} at {3},{4} → vrbo-left" -f $monitors.Labels.Monitor2, $m2.Width, $m2.Height, $m2.X, $m2.Y)
  Write-Step ("Monitor 3 ({0}): {1}x{2} at {3},{4} → vrbo-right" -f $monitors.Labels.Monitor3, $m3.Width, $m3.Height, $m3.X, $m3.Y)

  Start-DevServerIfNeeded

  Write-Step "Opening vrbo-left on monitor 2 (kiosk)..."
  Start-KioskWindow -Browser $browser -Url $LeftUrl -UserDataDir $LeftProfile -Bounds $monitors.Monitor2
  Start-Sleep -Milliseconds 700
  Write-Step "Opening vrbo-right on monitor 3 (kiosk)..."
  Start-KioskWindow -Browser $browser -Url $RightUrl -UserDataDir $RightProfile -Bounds $monitors.Monitor3

  Write-Step "Done. Press Esc in a kiosk window to exit that window."
  exit 0
}
catch {
  $msg = $_.Exception.Message
  Write-Step "ERROR: $msg"
  try {
    Add-Type -AssemblyName System.Windows.Forms
    [System.Windows.Forms.MessageBox]::Show(
      "Vrbo Demo failed to launch:`n`n$msg`n`nLog: $LogPath",
      "Vrbo Demo",
      [System.Windows.Forms.MessageBoxButtons]::OK,
      [System.Windows.Forms.MessageBoxIcon]::Error
    ) | Out-Null
  } catch {
    # last resort
  }
  exit 1
}
