# ALKAM Windows Otomasyon Kurulumu

Bu klasör, ALKAM Mali iSTasyon için yerel Windows başlangıç/kapanış dosyalarını içerir.

## Dosyalar

- `alkam-start.bat`: Sabah bilgisayar açıldıktan sonra ALKAM Mali panelini açar ve log yazar.
- `alkam-shutdown.bat`: Gün sonunda log yazar ve bilgisayarı güvenli kapatır.

## Önerilen Yerel Klasör

Dosyalar yerel bilgisayarda şu klasöre kopyalanacak:

```text
C:\ALKAM\automation\
```

Log klasörü otomatik oluşur:

```text
C:\ALKAM\automation\logs\
```

## Sabah 09:00 Açılış

Bilgisayar kapalıyken açılması Windows ile değil, BIOS/UEFI ile yapılır.

BIOS/UEFI içinde şu seçeneklerden biri aranacak:

- Wake on RTC
- Power On By RTC
- Resume By Alarm
- RTC Alarm Power On

Saat: 09:00

## Windows Başlangıç Görevi

Bilgisayar açıldıktan sonra `alkam-start.bat` çalıştırılır.

Windows Görev Zamanlayıcı önerisi:

- Trigger: At log on veya At startup
- Action: Start a program
- Program: `C:\ALKAM\automation\alkam-start.bat`

## Akşam 20:00 Kapanış

Windows Görev Zamanlayıcı ile günlük 20:00 görevi oluşturulur.

- Trigger: Daily 20:00
- Action: Start a program
- Program: `C:\ALKAM\automation\alkam-shutdown.bat`

## Güvenlik

- Telegram bot token dosyalara yazılmayacak.
- Şifreler GitHub'a konmayacak.
- Botlar ilk aşamada sadece okuma/ön izleme/onay mantığıyla çalışacak.
- Onaysız cari hareketi yazılmayacak.
