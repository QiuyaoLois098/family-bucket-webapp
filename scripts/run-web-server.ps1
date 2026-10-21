#Requires -Version 5.1
# Double-click via "Run Web Server.vbs": start API + Vite and open the preview.

$ErrorActionPreference = "Stop"
$LogPath = Join-Path $env:TEMP "family-bucket-web-server.log"

function Write-Step([string]$Message) {
  $line = "[web-server] $Message"
  Write-Host $line
  Add-Content -LiteralPath $LogPath -Value "$(Get-Date -Format o) $line" -ErrorAction SilentlyContinue
}

try {
  Set-Content -LiteralPath $LogPath -Value "$(Get-Date -Format o) start" -ErrorAction SilentlyContinue

  $RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
  $ApiPort = 3002
  $VitePort = 5188
  $AppUrl = "http://localhost:$VitePort/"

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
    throw "npm not found. Install Node.js, then double-click this file again."
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
      Start-Sleep -Milliseconds 400
    }
    throw "Port $PortToCheck did not become ready within ${TimeoutSec}s. See the npm window for errors."
  }

  Set-Location -LiteralPath $RepoRoot
  $npm = Find-Npm
  Write-Step "Repo: $RepoRoot"
  Write-Step "npm:  $npm"

  $missingDeps =
    -not (Test-Path -LiteralPath (Join-Path $RepoRoot "node_modules")) -or
    -not (Test-Path -LiteralPath (Join-Path $RepoRoot "client\node_modules")) -or
    -not (Test-Path -LiteralPath (Join-Path $RepoRoot "server\node_modules"))

  if ($missingDeps) {
    Write-Step "Installing npm packages (first run)..."
    & $npm run install:all
    if ($LASTEXITCODE -ne 0) { throw "npm run install:all failed." }
  }

  $apiUp = Test-PortOpen $ApiPort
  $viteUp = Test-PortOpen $VitePort

  if (-not ($apiUp -and $viteUp)) {
    Write-Step "Starting npm run dev (API :$ApiPort, Vite :$VitePort)"
    Start-Process `
      -FilePath $npm `
      -ArgumentList @("run", "dev") `
      -WorkingDirectory $RepoRoot
    Write-Step "Waiting for API :$ApiPort ..."
    Wait-ForPort $ApiPort
    Write-Step "Waiting for Vite :$VitePort ..."
    Wait-ForPort $VitePort
  } else {
    Write-Step "Already running (API :$ApiPort, Vite :$VitePort)"
  }

  Write-Step "Opening $AppUrl"
  Start-Process $AppUrl
  Write-Step "Done. Close the npm window to stop the server."
  Start-Sleep -Seconds 2
  exit 0
}
catch {
  $msg = $_.Exception.Message
  Write-Step "ERROR: $msg"
  try {
    Add-Type -AssemblyName System.Windows.Forms
    [System.Windows.Forms.MessageBox]::Show(
      "Web server failed to start:`n`n$msg`n`nLog: $LogPath",
      "Run Web Server",
      [System.Windows.Forms.MessageBoxButtons]::OK,
      [System.Windows.Forms.MessageBoxIcon]::Error
    ) | Out-Null
  } catch {}
  Read-Host "Press Enter to close"
  exit 1
}
