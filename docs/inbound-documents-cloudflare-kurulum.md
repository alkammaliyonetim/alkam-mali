# Cloudflare Gelen Belge Kurulumu

Bu belge, WhatsApp veya Telegram'a gonderilen dosyalarin ALKAM programina aday belge olarak dusmesi icin gereken Cloudflare Pages Functions kurulumunu anlatir.

## Eklenen Endpoint

`functions/api/inbound-documents.js`

Canli deploy sonrasinda endpoint adresleri:

- Gelen belge kuyruğu: `https://alkam-mali.pages.dev/api/inbound-documents`
- Telegram webhook: `https://alkam-mali.pages.dev/api/inbound-documents?provider=telegram`
- WhatsApp webhook: `https://alkam-mali.pages.dev/api/inbound-documents?provider=whatsapp`

## Gerekli Cloudflare Binding

Cloudflare Pages projesinde KV namespace olustur:

- Binding adi: `ALKAM_INBOUND_KV`

Bu KV, gelen belge adaylarini `queue:pending` anahtarinda saklar.

## Ortam Degiskenleri

Istege bagli ama onerilen degiskenler:

- `ALKAM_WEBHOOK_SECRET`: Genel webhook guvenlik anahtari. Sistem `X-ALKAM-Webhook-Secret` header'i ile kontrol eder.
- `WHATSAPP_VERIFY_TOKEN`: WhatsApp Business webhook dogrulama tokeni.
- `TELEGRAM_BOT_TOKEN`: Ileride Telegram dosyasini bot API ile indirmek icin kullanilacak token.
- `WHATSAPP_ACCESS_TOKEN`: Ileride WhatsApp media API ile dosya indirmek icin kullanilacak token.

## Telegram Kurulumu

Telegram bot olusturulduktan sonra webhook su adrese verilir:

`https://alkam-mali.pages.dev/api/inbound-documents?provider=telegram`

Telegram mesajinda belge, fotograf veya aciklama varsa endpoint bunu aday belgeye cevirir ve KV kuyruğuna ekler.

## WhatsApp Kurulumu

Meta WhatsApp Business Cloud API webhook adresi:

`https://alkam-mali.pages.dev/api/inbound-documents?provider=whatsapp`

Dogrulama icin `WHATSAPP_VERIFY_TOKEN` Cloudflare ortam degiskeni ile Meta panelindeki verify token ayni olmalidir.

## Guvenlik

- `ALKAM_WEBHOOK_SECRET` tanimliysa POST istekleri `X-ALKAM-Webhook-Secret` header'i olmadan kabul edilmez.
- Gelen belge sadece `pending` durumunda kuyruğa girer.
- Ayni kanal + ayni mesaj id tekrar gelirse mukerrer olarak isaretlenir.
- Kesin cari veya banka kaydi bu endpoint tarafindan olusturulmaz.

## Eksik Olan Sonraki Parca

Bu PR endpoint ve kuyruk altyapisini ekler. Gercek dosya icerigini indirmek ve OCR/AI ile okumak icin ikinci asamada su parcalar eklenecek:

- Telegram file_id ile dosya indirme
- WhatsApp media id ile dosya indirme
- R2 veya Supabase Storage'a belge kaydetme
- OCR/AI servisine belge gonderme
- OCR sonucunu `moka-pos-mutabakat.html` onay ekranina otomatik yansitma

Bu siralama guvenlidir; once mesaj yakalama ve kuyruk, sonra dosya indirme/OCR, en son muhasebe onay akisi tamamlanir.
