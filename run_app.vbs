Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd.exe /c start.bat", 0, False
Set WshShell = Nothing
