# LAB PR15 Stres Test Planı

## Amaç

Production'a geçmeden önce ALKAM Mali / İstasyonALKAM programının klonunda yüzlerce işlem simülasyonu yapmak.

## Test Branch

```text
lab-pr15
```

## Test Edilecek Alanlar

```text
Cari seçme / cari detay
Manuel hareket ekleme
Tahakkuk / tahsilat ayrımı
Onay Merkezi
Telegram Gelen Kutusu simülasyonu
Ödeme sözü / vade / alarm
Cari kartında takip görünümü
Banka bekleyen kayıtları
Cari eşleştirme önerileri
Moka United hesap hareketi
Otomasyon Kontrol Merkezi
Tüm otomatik işleri kapat
Yedek indirme
Raporlar
Mobil cari geçişi
Cari sabit başlık
```

## Yapılacak Simülasyonlar

```text
100 adet cari hareketi
50 adet tahsilat
50 adet tahakkuk
25 adet ödeme sözü
25 adet Telegram mesajı
20 adet Onay Merkezi kaydı
20 adet banka / hesap hareketi
10 adet Moka hareketi
10 otomasyon kuralı aç / kapat testi
Yedek alma testi
Mobil görünüm testi
```

## Güvenlik Kuralı

```text
Production'a dokunulmaz.
Main branch'e merge yapılmaz.
Onaysız kesin cari kaydı oluşmamalı.
Riskli otomasyonlar varsayılan kapalı kalmalı.
Tüm testler lab-pr15 üzerinde yapılır.
```

## Başarı Kriteri

```text
Bot testleri geçecek.
Stres testinde hata fırlamayacak.
Cari bakiyeleri bozulmayacak.
Otomasyon bayrakları güvenli kalacak.
Telegram simülasyonları Onay Merkezi'ne düşecek.
Mobilde cari detay kullanılabilir kalacak.
```
