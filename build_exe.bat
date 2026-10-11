@echo off
title Build tdevbing.exe
color 0b

echo ===================================================
echo             BUILD TDEVBING.EXE STANDALONE
echo ===================================================
echo.

set "ROOT=%~dp0"
set "CSC=C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"

if not exist "%CSC%" (
    echo [ERROR] Khong tim thay trinh bien dich csc.exe tai:
    echo %CSC%
    pause
    exit /b 1
)

echo [*] 1. Dang build Frontend bundle...
cd /d "%ROOT%frontend"
call npm.cmd run build

echo.
echo [*] 2. Dang bien dich tdevbing.exe voi Icon tuy chinh...
cd /d "%ROOT%"
"%CSC%" /target:winexe /win32icon:"%ROOT%assets\icon.ico" /out:"%ROOT%tdevbing.exe" "%ROOT%launcher\Program.cs"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ===================================================
    echo [OK] DA BUILD THANH CONG TDEVBING.EXE!
    echo File nam tai: %ROOT%tdevbing.exe
    echo ===================================================
) else (
    echo.
    echo [FAIL] Co loi trong qua trinh bien dich.
)

echo.
pause
