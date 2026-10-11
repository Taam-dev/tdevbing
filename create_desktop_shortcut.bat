@echo off
title Tao Shortcut tdevbing
color 0a

echo [*] Dang tao shortcut tdevbing ngoai man hinh Desktop...
powershell -NoProfile -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut([System.IO.Path]::Combine([Environment]::GetFolderPath('Desktop'), 'tdevbing.lnk')); $s.TargetPath = '%~dp0tdevbing.exe'; $s.WorkingDirectory = '%~dp0'; $s.IconLocation = '%~dp0tdevbing.exe,0'; $s.Description = 'tdevbing - Microsoft Rewards Automation App'; $s.Save()"

echo.
echo ===================================================
echo [OK] DA TAO SHORTCUT THANH CONG NGOAI DESKTOP!
echo Ban co the mo truc tiep tdevbing tu man hinh Desktop!
echo ===================================================
echo.
pause
