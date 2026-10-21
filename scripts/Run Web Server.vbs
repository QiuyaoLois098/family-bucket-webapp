' Double-click to start the Family Bucket web app (API + Vite) and open the preview.
Option Explicit

Dim shell, fso, scriptDir, ps1, cmd
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
ps1 = scriptDir & "\run-web-server.ps1"

If Not fso.FileExists(ps1) Then
  MsgBox "Missing run-web-server.ps1 next to this launcher.", vbCritical, "Run Web Server"
  WScript.Quit 1
End If

' Normal console so you can see logs and close the window to stop the server.
cmd = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File """ & ps1 & """"
shell.Run cmd, 1, False
