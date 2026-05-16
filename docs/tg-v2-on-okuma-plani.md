# TG Evrak v2 Ön Okuma Planı

## Amaç

TG temiz v1 üzerine dosya / belge ön okuma katmanı eklemek.

## v2 İlk Parça

Bu aşamada gerçek otomatik OCR veya tam dosya ayrıştırma yapılmayacak. Önce kullanıcı dosya adı, belge türü ve açıklama girecek; sistem bunlardan cari adayı, tutar, tarih ve işlem tipi tahmini üretip Onay Merkezi önerisi oluşturacak.

## Girdi Alanları

- Belge türü
- Dosya adı / referans
- Açıklama / mesaj
- Cari adayı
- Tutar
- Tarih
- İşlem tipi

## Belge Türleri

- Excel
- CSV
- PDF
- Dekont görseli
- Ekran görüntüsü
- Moka / POS bildirimi
- Masraf fişi

## Çıktı

Sadece `alkam_operation_suggestions_v1` içine `Onay bekliyor` durumunda öneri yazılacak.

## Güvenlik

- Kesin cari hareketi oluşturulmaz.
- Banka / kasa / Moka kaydı oluşturulmaz.
- Dosya içeriği yanlış okunursa kesin kayıt oluşmaz.
- Kullanıcı onayı olmadan hiçbir finansal işlem yazılmaz.

## Sonraki Fazlar

1. Excel / CSV dosyası gerçek okuma.
2. PDF metin çıkarma.
3. Görsel / dekont OCR.
4. Gerçek Telegram bot bağlantısı.
