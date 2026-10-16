#Requires -Version 5.1
<#
.SYNOPSIS
  Creates a Desktop shortcut that launches the Expedia dual-monitor demo.
#>
$ErrorActionPreference = "Stop"

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$Vbs = Join-Path $PSScriptRoot "Launch Expedia Demo.vbs"
$Desktop = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $Desktop "Expedia Demo.lnk"

if (-not (Test-Path -LiteralPath $Vbs)) {
  throw "Missing launcher: $Vbs"
}

$wsh = New-Object -ComObject WScript.Shell
$shortcut = $wsh.CreateShortcut($ShortcutPath)
$shortcut.TargetPath = $Vbs
$shortcut.WorkingDirectory = $RepoRoot
$shortcut.WindowStyle = 7
$shortcut.Description = "Start Family Bucket dev server + Expedia left/right kiosk windows"
# Prefer Chrome/Edge icon if present
$iconCandidates = @(
  "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles}\Microsoft\Edge\Application\msedge.exe",
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
)
foreach ($icon in $iconCandidates) {
  if ($icon -and (Test-Path -LiteralPath $icon)) {
    $shortcut.IconLocation = "$icon,0"
    break
  }
}
$shortcut.Save()

Write-Host "Desktop shortcut created:"
Write-Host "  $ShortcutPath"
Write-Host ""
Write-Host "Double-click ""Expedia Demo"" on your Desktop to launch."
