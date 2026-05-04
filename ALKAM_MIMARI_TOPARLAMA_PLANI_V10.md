# ALKAM MALİ İstasyON - Mimari Toparlama Planı v10

Bu dosya mevcut çalışan sistemi bozmadan, patch dosyalarını kontrollü ve sürdürülebilir bir mimariye taşımak için hazırlanmıştır.

## Değişmez Kurallar

1. Cari ekstresi ana kayıt / ana defterdir.
2. Banka hareketleri doğrulama ve onay katmanıdır.
3. Onaysız banka hareketi cari / finans kayıtlarına işlenmez.
4. Moka United bankaya aktarımı cari tahsilatı sayılmaz.
5. Tahakkuk ve tahsilat öncesi yedek alınır.
6. Mükerrer kayıt engellenir.
7. Emin olunmayan işlemler onaya düşer.
8. Önceki özellikler kullanıcı onayı olmadan silinmez.
9. 2026 Geçiş kavramı / sekmesi kullanılmaz.

## Mevcut Durum

Sistem şu anda çok sayıda güvenli patch dosyasıyla çalışmaktadır. Bu tercih hızlı geliştirme ve eski özellikleri bozmama açısından doğruydu. Ancak orta vadede bakım için dosyalar modül ailelerine ayrılmalıdır.

## Hedef Klasör Yapısı

```text
/core
  alkam-cari-core.js
  alkam-last-amounts.js
  alkam-balance-highlight.js

/finance
  alkam-finans-flow.js
  alkam-tahsilat.js
  alkam-moka.js

/bank
  alkam-banka-onay.js
  alkam-banka-import.js
  alkam-banka-history.js
  alkam-banka-export.js

/reliability
  alkam-reliability-guard.js
  alkam-data-quality.js
  alkam-guvenilirlik-raporu.js
  alkam-saglik-kontrol.js
  alkam-gunluk-kontrol.js

/ui
  alkam-professional-ui.js
  alkam-control-center.js
  alkam-action-bar.js
  alkam-tek-kontrol-rozeti.js

/system
  alkam-modul-registry.js
  alkam-system-manifest.js
  alkam-loader-kontrol.js
```

## Migration Sırası

### Aşama 1 - Dokümantasyon ve Envanter
- Mevcut modüllerin listesi çıkarıldı.
- Modül Registry eklendi.
- Loader Kontrol eklendi.
- Sistem Manifestosu eklendi.

### Aşama 2 - Loader Standardizasyonu
- `_worker.js` içindeki script listesi tek registry tabanlı yapıya çevrilecek.
- Script sırası sabit kalacak.
- Her modül kendi `version`, `test`, `run` fonksiyonunu koruyacak.
- Eski dosyalar kaldırılmayacak; önce yeni yapı paralel çalışacak.

### Aşama 3 - Core Modüllerin Taşınması
- Cari Core
- Son Tutarlar
- Bakiye Vurgusu
- Data Quality

Bu aşamada cari ekstresi ve bakiye mantığı kesinlikle değiştirilmeyecek.

### Aşama 4 - Finans ve Tahsilat Modülleri
- Finans hesapları
- Tahsilat
- Moka United aktarımı

Moka aktarımı cari tahsilatı sayılmaz kuralı korunacak.

### Aşama 5 - Banka Onay Sistemi
- Banka import
- Validasyon
- Hatalı satır tablosu
- Onay merkezi
- Geçmiş
- CSV dışa aktarım

Onaysız işlem yasağı korunacak.

### Aşama 6 - UI Temizliği
- Action bar sadeleştirilecek.
- Kontrol Merkezi tek merkez haline getirilecek.
- Fazla rozetler tek kontrol rozetinde kalacak.
- Ana ekran profesyonel yönetici görünümünü koruyacak.

### Aşama 7 - Kalıcı Veri Katmanı
- LocalStorage geçici katman olarak kalacak.
- Supabase kalıcı tablo yapıları hazırlanacak.
- Önce okuma / yedek / test yapılacak.
- Sonra kontrollü yazma açılacak.

## Supabase İçin Önerilen Ana Tablolar

```text
cariler
cari_hareketleri
tahakkuklar
tahsilatlar
finans_hesaplari
finans_hareketleri
banka_import_raw
banka_onay_bekleyen
banka_islenen
banka_reddedilen
sistem_yedekleri
sistem_loglari
modul_surumleri
gunluk_kontrol_ozetleri
```

## Kontrol Listesi

Her güncellemeden sonra mutlaka:

- Yapılanlar listesi verilecek.
- Kalanlar listesi verilecek.
- Kontrol ettiklerim listesi verilecek.
- Eski özellik silinip silinmediği kontrol edilecek.
- Banka / Moka / cari / tahakkuk güvenlik kuralları kontrol edilecek.

## Sonraki Teknik Hamle

Bir sonraki adım olarak `_worker.js` içindeki script listesi tek yerde daha okunur hale getirilecek ve script sırası ayrıca kontrol edilecek. Mevcut çalışan scriptler silinmeyecek.
