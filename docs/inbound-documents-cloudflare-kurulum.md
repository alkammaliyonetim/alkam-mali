# Cloudflare Gelen Belge Kurulumu

Bu belge, WhatsApp veya Telegram'a gonderilen dosyalarin ALKAM programina aday belge olarak dusmesi icin gereken Cloudflare Pages Functions kurulumunu anlatir.

## Eklenen Endpointler

- `functions/api/inbound-documents.js`
- `functions/api/inbound-media.js`
- `functions/api/ocr-documents.js`

Canli deploy sonrasinda endpoint adresleri:

- Gelen belge kuyruğu: `https://alkam-mali.pages.dev/api/inbound-documents`
- Telegram webhook: `https://alkam-mali.pages.dev/api/inbound-documents?provider=telegram`
- WhatsApp webhook: `https://alkam-mali.pages.dev/api/inbound-documents?provider=whatsapp`
- Telegram/WhatsApp medya indirme bilgisi: `https://alkam-mali.pages.dev/api/inbound-media`
- OCR/AI aday okuma: `https://alkam-mali.pages.dev/api/ocr-documents`

## Gerekli Cloudflare Binding

Cloudflare Pages projesinde KV namespace olustur:

- Binding adi: `ALKAM_INBOUND_KV`

Bu KV, gelen belge adaylarini `queue:pending` anahtarinda saklar.

## Ortam Degiskenleri

- `ALKAM_WEBHOOK_SECRET`: Genel webhook guvenlik anahtari. Sistem `X-ALKAM-Webhook-Secret` header'i ile kontrol eder.
- `WHATSAPP_VERIFY_TOKEN`: WhatsApp Business webhook dogrulama tokeni.
- `TELEGRAM_BOT_TOKEN`: Telegram dosyasini Bot API ile indirmek icin kullanilir.
- `WHATSAPP_ACCESS_TOKEN`: WhatsApp media API ile dosya bilgisini almak icin kullanilir.
- `ALKAM_OCR_ENDPOINT`: Harici OCR/AI servisi endpoint'i. Tanimli degilse sistem guvenli aday cikarma motorunu kullanir.
- `ALKAM_OCR_TOKEN`: Harici OCR/AI servisi yetki tokeni.

## Telegram Kurulumu

Telegram bot olusturulduktan sonra webhook su adrese verilir:

`https://alkam-mali.pages.dev/api/inbound-documents?provider=telegram`

Telegram mesajinda belge, fotograf veya aciklama varsa endpoint bunu aday belgeye cevirir ve KV kuyruğuna ekler. Dosya indirme bilgisi `inbound-media` endpoint'i ile alinabilir.

## WhatsApp Kurulumu

Meta WhatsApp Business Cloud API webhook adresi:

`https://alkam-mali.pages.dev/api/inbound-documents?provider=whatsapp`

Dogrulama icin `WHATSAPP_VERIFY_TOKEN` Cloudflare ortam degiskeni ile Meta panelindeki verify token ayni olmalidir. Media id geldikten sonra `inbound-media` endpoint'i dosya URL bilgisini alir.

## OCR/AI Kurulumu

`/api/ocr-documents` endpoint'i iki modda calisir:

1. `ALKAM_OCR_ENDPOINT` tanimliysa belge verisini harici OCR/AI servisine yollar.
2. Harici servis yoksa metin, dosya adi veya caption uzerinden guvenli aday okuma yapar.

Bu sayede program gercek OCR servisi baglanmadan da aday kayit uretebilir; servis baglandiginda ayni onay akisi devam eder.

## Guvenlik

- `ALKAM_WEBHOOK_SECRET` tanimliysa POST istekleri `X-ALKAM-Webhook-Secret` header'i olmadan kabul edilmez.
- Gelen belge sadece `pending` durumunda kuyruğa girer.
- Ayni kanal + ayni mesaj id tekrar gelirse mukerrer olarak isaretlenir.
- Kesin cari veya banka kaydi webhook/OCR endpointleri tarafindan olusturulmaz.
- Cari ve hesap islemi sadece onay ekranindan yetkili kullanici aksiyonu ile tamamlanir.

## Tamamlanan Parcalar

- Mesaj yakalama endpoint'i
- Gelen belge kuyruğu
- Medya indirme bilgisi endpoint'i
- OCR/AI aday okuma endpoint'i
- Moka/POS ve banka onay ekranlari
- Tek tik onayla cari + hesap isleme mantigi

## Panelde Yapilacak Ayarlar

Cloudflare Pages > Settings > Functions altinda:

1. KV namespace olustur ve `ALKAM_INBOUND_KV` olarak bagla.
2. Production ve Preview ortam degiskenlerini gir.
3. Deploy'u tekrar calistir.
4. `/api/inbound-documents` adresinde `configured: true` gorunene kadar kontrol et.
