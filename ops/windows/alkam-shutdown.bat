@echo off
setlocal

REM ALKAM Mali iSTasyon - Gun Sonu Kapanis Dosyasi
REM Once log yazar, sonra bilgisayari guvenli kapatir.

set ALKAM_HOME=C:\ALKAM\automation
set ALKAM_LOG=%ALKAM_HOME%\logs

if not exist "%ALKAM_HOME%" mkdir "%ALKAM_HOME%"
if not exist "%ALKAM_LOG%" mkdir "%ALKAM_LOG%"

echo [%date% %time%] ALKAM gun sonu kapanis basladi >> "%ALKAM_LOG%\alkam-shutdown.log"

REM Ileride burada gun sonu yedek scripti calisacak:
REM call C:\ALKAM\automation\alkam-backup.bat

echo [%date% %time%] Bilgisayar 60 saniye sonra kapatilacak >> "%ALKAM_LOG%\alkam-shutdown.log"
shutdown /s /f /t 60

endlocal
