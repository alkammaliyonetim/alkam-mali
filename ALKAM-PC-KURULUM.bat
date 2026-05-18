@echo off
setlocal
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\alkam-pc-setup.ps1"
pause
