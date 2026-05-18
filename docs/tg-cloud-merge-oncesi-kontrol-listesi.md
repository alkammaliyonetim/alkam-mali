# TG Cloud Merge Öncesi Kontrol Listesi

Bu kontrol listesi tamamlanmadan PR ready/merge yapılmamalıdır.

## Kod Güvenliği

- [ ] Gerçek Telegram bot token repoda yok.
- [ ] Gerçek Cloudflare KV namespace ID repoda yok.
- [ ] Gerçek secret değerleri repoda yok.
- [ ] `POST /telegram/webhook` secret header olmadan 401 dönüyor.
- [ ] `GET /queue` admin secret olmadan 401 dönüyor.
- [ ] `GET /queue?secret=...` kabul edilmiyor.
- [ ] Worker hata durumunda düz JSON hata cevabı dönüyor.
- [ ] Response header içinde `cache-control: no-store` var.

## Tek Tık Kurulum Kontrolü

- [ ] `ALKAM-KUR.bat` mevcut.
- [ ] `tools/alkam-check.ps1` mevcut.
- [ ] `tools/alkam-test.ps1` mevcut.
- [ ] `tools/alkam-report.ps1` mevcut.
- [ ] `npm run test:pc-setup` başarılı.
- [ ] Kurulum akışı sadece lokal kontrol, test ve rapor üretimi yapıyor.

## Muhasebe / Operasyon Güvenliği

- [ ] Kesin cari kaydı oluşturmuyor.
- [ ] Bilinmeyen cari otomatik açmıyor.
- [ ] Banka hareketi oluşturmuyor.
- [ ] Kasa hareketi oluşturmuyor.
- [ ] Moka hareketi oluşturmuyor.
- [ ] Sadece `Kuyrukta` statüsünde Onay Merkezi adayı üretiyor.
- [ ] `suggested.confidence` ilk fazda `0` kalıyor.

## Cloudflare Preview Testleri

- [ ] KV namespace oluşturuldu.
- [ ] `TG_QUEUE` binding tanımlandı.
- [ ] Gerekli Cloudflare gizli değerleri girildi.
- [ ] `GET /` hazır cevabı veriyor.
- [ ] Sahte update fixture ile doğru header kullanılarak webhook testi geçti.
- [ ] Webhook yetkisiz istekte 401 verdi.
- [ ] `/queue` yetkili header ile okundu.
- [ ] `/queue` yetkisiz istekte 401 verdi.
- [ ] `/queue?secret=...` 401 verdi.

## Veri Kontrolü

- [ ] Kuyruğa düşen kayıt `source = Telegram Cloud` içeriyor.
- [ ] Kuyruğa düşen kayıt `status = Kuyrukta` içeriyor.
- [ ] Test kaydında `suggested.amount = 1250.75` görünüyor.
- [ ] Test kaydında `suggested.date = 2026-05-17` görünüyor.
- [ ] Test kaydında dosya alanları korunuyor.
- [ ] Test kaydında kesin cari eşleşmesi yapılmıyor.

## Production Kararı

- [ ] PR hâlâ draft mı kontrol edildi.
- [ ] Preview test sonuçları kullanıcıya özetlendi.
- [ ] Kullanıcı production merge için açık onay verdi.
- [ ] Kullanıcı deploy için açık onay verdi.

## Not

Bu PR, production'a alındığında bile tek başına kesin muhasebe hareketi üretmemelidir. Onay Merkezi entegrasyonu ve kesin kayıt üretimi ayrı PR/faz konusu olacaktır.
