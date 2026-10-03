@echo off
setlocal

REM ALKAM Mali iSTasyon - Sabah Baslangic Dosyasi
REM Bu dosya yerel bilgisayarda calisir. GitHub'a sifre/token yazilmaz.

set ALKAM_HOME=C:\ALKAM\automation
set ALKAM_LOG=%ALKAM_HOME%\logs
set ALKAM_URL=https://alkam-mali.pages.dev/

if not exist "%ALKAM_HOME%" mkdir "%ALKAM_HOME%"
if not exist "%ALKAM_LOG%" mkdir "%ALKAM_LOG%"

echo [%date% %time%] ALKAM sabah baslangic basladi >> "%ALKAM_LOG%\alkam-start.log"

REM Chrome varsa Chrome ile ac, yoksa varsayilan tarayici ile ac.
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
  start "ALKAM Mali" "C:\Program Files\Google\Chrome\Application\chrome.exe" --new-window "%ALKAM_URL%"
) else (
  start "ALKAM Mali" "%ALKAM_URL%"
)

echo [%date% %time%] ALKAM panel acildi >> "%ALKAM_LOG%\alkam-start.log"

REM Ileride burada yerel bot baslatilacak:
REM cd /d C:\ALKAM\automation
REM node alkam-local-bot.js >> "%ALKAM_LOG%\alkam-bot.log" 2>&1

endlocal
