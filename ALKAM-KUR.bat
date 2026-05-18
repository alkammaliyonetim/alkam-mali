@echo off
setlocal
cd /d "%~dp0"

echo ========================================
echo  ALKAM Mali TG Cloud Tek Tik Kurulum
echo ========================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\alkam-check.ps1"
if errorlevel 1 goto error

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\alkam-test.ps1"
if errorlevel 1 goto error

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\alkam-report.ps1"
if errorlevel 1 goto error

echo.
echo Kurulum yardimcisi tamamlandi.
pause
exit /b 0

:error
echo.
echo HATA: Kurulum yardimcisi tamamlanamadi. Yukaridaki mesaji kontrol edin.
pause
exit /b 1
