# İstasyON / ALKAM Mali Temel Mimari

## Ana Program

Programın esas alınacak sürümü:

```text
https://0e46431c.alkam-mali.pages.dev/admin.html
```

Bu adres kullanıcı tarafından beğenilen ve bundan sonra korunacak ana program sürümüdür.

## Değişmez Kurallar

1. Mevcut program bozulmayacak.
2. Cari Ekstre, Dashboard, Cariler, Hesaplar, Onay Merkezi, Otomasyon, Raporlar ve Yedekleme korunacak.
3. Ayrı kabuk, iframe, geçici preview sayfası veya bağımsız otomasyon sayfası kullanılmayacak.
4. Yeni özellikler mevcut programın içine modül olarak eklenecek.
5. Hiçbir dış veri ana cari ekstresine doğrudan yazmayacak.
6. Her dış veri önce staging alanına düşecek.
7. Staging kayıtları Onay Merkezi'nde gösterilecek.
8. Kullanıcı onayı olmadan ana kayıt oluşmayacak.
9. Her işlem audit log'a yazılacak.
10. Önceki özellikler kullanıcı onayı olmadan silinmeyecek.

## Ana Modüller

### Dashboard

Amaç: Kullanıcının bugün finansal olarak neye bakması gerektiğini göstermesi.

İçerik:
- Toplam cari bakiye
- Tahsilat riski
- Vadesi geçenler
- Onay bekleyen dış kayıtlar
- Banka / kasa / Moka özeti

### Cariler

Ana kayıt merkezi.

İçerik:
- Cari kart
- Cari ekstre
- Aylık muhasebe ücreti
- Tahakkuk
- Tahsilat
- Ödeme sözü
- Risk durumu

### Hesaplar

Finansal hesap merkezi.

İçerik:
- Kasa
- Banka
- Moka United
- Çek
- Senet
- Hesaplar arası transfer

### Onay Merkezi

Dış kaynaklardan gelen verinin kontrol merkezi.

İçerik:
- Bekleyen kayıtlar
- Mükerrer kontrol
- Cari eşleşme önerisi
- Güven puanı
- Onay / red / incelemede durumları
- Ana kayda işleme

### Otomasyon

Bütün dış veri ve zamanlı işler buradan yönetilecek.

Alt modüller:
- Dış Veri Aktarım Merkezi
- Bizmu Aktarım
- Luca Aktarım
- Banka Aktarım
- Moka Aktarım
- Excel Aktarım
- Telegram / WhatsApp Aktarım
- Zamanlı İşler

### Raporlar

Yönetim ve kontrol raporları.

İçerik:
- Cari raporu
- Tahsilat raporu
- Vadesi geçenler
- Aylık yönetim özeti
- Luca karşılaştırma raporu
- Banka / Moka denklik raporu

### Yedekleme

Güvenlik ve geri dönüş merkezi.

İçerik:
- JSON yedek
- Excel dışa aktarım
- Versiyon kaydı
- Geri yükleme
- Audit log dışa aktarım

## Dış Kaynak Mantığı

Dış kaynaklar ana sistem değildir. Sadece veri sağlar.

Kaynaklar:
- Bizmu: geçiş verisi
- Luca: resmi muhasebe kontrol verisi
- Banka: hesap hareketi
- Moka: kart tahsilatı ve banka aktarımı
- Excel: toplu veri aktarımı
- Telegram / WhatsApp: dekont, ödeme sözü, saha bildirimi

## Staging Akışı

```text
Dış kaynak
→ Staging
→ Mükerrer kontrol
→ Cari eşleşme
→ Güven puanı
→ Onay Merkezi
→ Kullanıcı onayı
→ Ana cari ekstresi / hesap hareketi
→ Audit log
```

## Kayıt Tipleri

- cari
- satış
- tahakkuk
- tahsilat
- ödeme
- masraf
- banka hareketi
- moka hareketi
- luca mizan
- luca muavin
- beyanname
- görev

## Zamanlı İşler

### Haftalık

- Tahsilat kontrolü
- Riskli cari kontrolü
- Bekleyen onay kontrolü
- Banka / Moka eşleşmeyen kontrolü

### Aylık

- Aylık muhasebe ücreti tahakkuku
- KDV hazırlık kontrolü
- Muhtasar / SGK kontrolü
- Cari mutabakat kontrolü
- Banka ekstresi kontrolü

### Üç Aylık

- Geçici vergi hazırlık kontrolü
- Mizan / gelir gider kontrolü
- Cari risk raporu
- Yönetim raporu

### Yıllık

- Kapanış kontrolü
- Kurumlar / gelir vergisi hazırlığı
- Defter kapanış kontrolü
- Yıllık cari mutabakat

## Geliştirme Sırası

1. Programın beğenilen sürümünü koru.
2. Otomasyon bölümüne Dış Veri Aktarım Merkezi kartını ekle.
3. Staging veri modelini program içine bağla.
4. Onay Merkezi'ne staging kayıtlarını göster.
5. Bizmu verilerini staging'e düşür.
6. Banka / Moka / Excel / Telegram için aynı standardı uygula.
7. Luca resmi veri modülünü ekle.
8. Zamanlı işler takvimini aktif hale getir.
9. Her modül için rapor ve denklik kontrolü ekle.

## Not

Bu dosya İstasyON / ALKAM Mali projesinin temel mimari belgesidir. Yeni geliştirmelerde bu kurallar esas alınacaktır.
