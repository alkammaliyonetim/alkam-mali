# ALKAM Mali Günlük Otomasyon Çalışma Planı

Bu dosya canlı programı değiştirmez. Amaç, ALKAM Mali iSTasyon için günlük otomasyon çalışma düzenini netleştirmektir.

## Ana Hedef

- Bilgisayar sabah otomatik açılsın.
- ALKAM Mali ve gerekli botlar otomatik başlasın.
- Banka, Telegram, Moka ve cari kontrol akışları gün içinde hazır olsun.
- Onaysız hiçbir finansal kayıt cariye kesin işlenmesin.
- Gün sonunda yedek alınıp bilgisayar güvenli kapansın.

## Günlük Akış

### 09:00 - Açılış

1. Bilgisayar BIOS/UEFI RTC alarmı ile açılır.
2. Windows otomatik kullanıcı oturumuna hazırlanır.
3. Başlangıç görevi ALKAM Mali bot başlatıcıyı çalıştırır.
4. Chrome veya Edge ALKAM Mali canlı panelini açar.
5. Yerel bot log dosyası oluşturulur.
6. Cari veri, Onay Merkezi, Hesaplar ve Otomasyon ekranları smoke testten geçer.

### Gün İçinde

1. Banka ekstresi yüklendiğinde önce ön izleme yapılır.
2. Eşleşen kayıtlar Onay Merkezi'ne öneri olarak düşer.
3. Telegram mesajları önce ön izleme alanına aktarılır.
4. Kullanıcı onayı olmadan kesin cari hareketi oluşmaz.
5. Moka United tahsilatları manuel/denetimli takip edilir.
6. Hatalar loglanır.

### 20:00 - Kapanış

1. Gün sonu yedek alınır.
2. Açık onay kayıtları raporlanır.
3. Bot logu kaydedilir.
4. Windows görev zamanlayıcı bilgisayarı güvenli kapatır.

## Windows Tarafı

### Sabah Açılışı

BIOS/UEFI içinde şu özellik aranacak:

- Wake on RTC
- Power On By RTC
- Resume By Alarm
- RTC Alarm Power On

Hedef saat: 09:00

### Akşam Kapanışı

Windows Görev Zamanlayıcı ile günlük 20:00 görevi:

```bat
shutdown /s /f /t 60
```

## Başlangıçta Çalışacak Dosyalar

Önerilen yerel klasör:

```text
C:\ALKAM\automation\
```

Önerilen başlangıç dosyası:

```text
C:\ALKAM\automation\alkam-start.bat
```

İlk hedef:

1. Tarayıcıyı canlı ALKAM Mali adresiyle açmak.
2. Bot log klasörünü oluşturmak.
3. İleride Puppeteer/Playwright botunu başlatmak.

## Güvenlik Kuralları

- Telegram bot token koda yazılmayacak.
- Şifreler GitHub'a konmayacak.
- Onaysız cari hareketi yazılmayacak.
- Finansal mutasyonlar loglanacak.
- Mükerrer kayıt kontrolü zorunlu olacak.
- Hata durumunda işlem duracak, kayıt yazılmayacak.

## Öncelik Sırası

1. Cari ekranı stabil hale getirilecek.
2. Banka ekstresi yükleme ve Onay Merkezi hattı tamamlanacak.
3. Telegram mesaj alma ve Onay Merkezi hattı tamamlanacak.
4. Moka United günlük takip hattı tamamlanacak.
5. Windows otomatik açılış/kapanış kurulacak.
6. Gün sonu yedekleme otomatik hale getirilecek.
