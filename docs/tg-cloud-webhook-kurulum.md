# TG Cloud Telegram Webhook Kurulum Notu

Bu doküman, ALKAM Mali Telegram Cloud fazında Telegram bot webhook bağlantısının güvenli şekilde kurulması için hazırlanmıştır.

## Amaç

Telegram botuna gelen mesaj, dekont, ekran görüntüsü, PDF, Excel veya CSV bilgisinin Cloudflare Worker endpointine düşmesi ve önce Onay Merkezi kuyruğuna alınmasıdır.

Bu faz kesin kayıt oluşturmaz.

## Endpoint Yapısı

Worker iskeletinde beklenen endpointler:

```text
GET  /
POST /telegram/webhook
GET  /queue
```

- `GET /`: Servis hazır kontrolü.
- `POST /telegram/webhook`: Telegram update alır, normalize eder, `TG_QUEUE` kuyruğuna yazar.
- `GET /queue`: Kuyruktaki son kayıtları listeler.

## Telegram Webhook Kurulumu

Gerçek bot token repoya yazılmayacaktır. Token sadece güvenli ortamda kullanılacaktır.

Webhook set etme komutu mantığı:

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=https://<WORKER_DOMAIN>/telegram/webhook"
```

Buradaki değerler placeholderdır:

```text
<TELEGRAM_BOT_TOKEN> = Telegram BotFather tarafından verilen gerçek token
<WORKER_DOMAIN> = Cloudflare Worker yayın adresi
```

## Webhook Kontrolü

Webhook durumunu kontrol etmek için:

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getWebhookInfo"
```

Beklenen kontrol:

- URL doğru Worker endpointini göstermeli.
- Son hata alanı boş olmalı.
- Pending update sayısı takip edilmeli.

## Güvenlik Kuralları

- Token kod içine yazılmayacak.
- Token GitHub'a commitlenmeyecek.
- Worker ilk fazda sadece kuyruk yazacak.
- Onay Merkezi onayı olmadan cari/banka/kasa/Moka kaydı oluşmayacak.
- Bilinmeyen cari otomatik açılmayacak.

## Test Senaryosu

1. Worker preview/deploy adresinde `GET /` çalıştırılır.
2. Sahte Telegram update ile `POST /telegram/webhook` denenir.
3. `GET /queue` ile kayıt kontrol edilir.
4. Telegram gerçek webhook sadece preview testlerinden sonra set edilir.
5. Production merge için ayrıca kullanıcı onayı alınır.

## Kabul Kriterleri

- Mesaj kuyruğa düşmeli.
- Dosya bilgisi varsa `fileId`, `fileName`, `mimeType`, `fileSize` alanları korunmalı.
- Tutar sadece öneri olarak yakalanmalı.
- Cari adayı kesin cari kaydı sayılmamalı.
- Hiçbir kesin muhasebe hareketi oluşmamalı.
