@echo off
title tdevbing Desktop Starter
color 0b

echo ===================================================
echo       KHOI DONG TDEVBING - DESKTOP LOCAL APP
echo ===================================================
echo.

set "ROOT=%~dp0"

echo [*] 0. Dang kiem tra va giai phong port 5000 va 5173...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 5000, 5173 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }" >nul 2>&1
ping 127.0.0.1 -n 2 >nul

echo [*] 1. Dang khoi dong Backend Server (Port 5000)...
start "tdevbing - Backend Server" /min /D "%ROOT%backend" cmd /k "node server.js"

echo [*] 2. Dang khoi dong Frontend Web (Port 5173)...
start "tdevbing - Frontend Web" /min /D "%ROOT%frontend" cmd /k "npm.cmd run dev"

echo [*] 3. Dang cho server khoi tao...
ping 127.0.0.1 -n 4 >nul

:: Tim kiem trinh duyet Chromium de chay App Mode doc lap
set "APP_BROWSER="
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" set "APP_BROWSER=C:\Program Files\Google\Chrome\Application\chrome.exe"
if not defined APP_BROWSER if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" set "APP_BROWSER=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
if not defined APP_BROWSER if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" set "APP_BROWSER=%LocalAppData%\Google\Chrome\Application\chrome.exe"
if not defined APP_BROWSER if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" set "APP_BROWSER=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not defined APP_BROWSER if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe" set "APP_BROWSER=C:\Program Files\Microsoft\Edge\Application\msedge.exe"

if defined APP_BROWSER (
    echo [*] 4. Dang mo Cua So Ung Dung tdevbing (Native Window)...
    start "" "%APP_BROWSER%" --app=http://localhost:5173 --window-size=1360,860
) else (
    echo [*] 4. Dang mo Dashboard tren trinh duyet mac dinh...
    start http://localhost:5173
)

echo.
echo ===================================================
echo [OK] DA KHOI DONG THANH CONG TDEVBING!
echo.
echo      - Cua so App dang chay rieng biet.
echo      - De tat he thong: Chay file stop.bat
echo ===================================================
echo.
ping 127.0.0.1 -n 3 >nul
exit
