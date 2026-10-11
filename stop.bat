@echo off
title tdevbing Stopper
color 0c

echo ===================================================
echo     DUNG TOAN BO HE THONG TDEVBING LOCAL APP
echo ===================================================
echo.
echo [*] 1. Dang dong cac cua so tien trinh Backend va Frontend...

taskkill /F /FI "WINDOWTITLE eq tdevbing - Backend Server*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq tdevbing - Frontend Web*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq tdevbing*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq BingAuto*" >nul 2>&1

powershell -NoProfile -Command "Get-Process -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like '*tdevbing*' -or $_.MainWindowTitle -like '*BingAuto*' } | Stop-Process -Force -ErrorAction SilentlyContinue" >nul 2>&1

echo [*] 2. Dang giai phong Port 5000 va 5173...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 5000, 5173 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }" >nul 2>&1

echo.
echo ===================================================
echo [OK] DA DONG SACH TOAN BO CUA SO VA TIEN TRINH TDEVBING!
echo ===================================================
echo.
ping 127.0.0.1 -n 2 >nul
exit
