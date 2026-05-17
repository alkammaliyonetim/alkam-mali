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
- `GET /queue`: Kuyruktaki son kayıtları listeler; admin secret olmadan açılmaz.

## Zorunlu Secret Değerleri

Gerçek değerler repoya yazılmayacaktır. Cloudflare Worker secret olarak tanımlanacaktır.

Gerekli secret isimleri:

```text
TELEGRAM_WEBHOOK_SECRET
QUEUE_READ_SECRET
```

- `TELEGRAM_WEBHOOK_SECRET`: Telegram'ın webhook çağrısında göndereceği secret token ile aynı olmalı.
- `QUEUE_READ_SECRET`: `/queue` endpointini sadece ALKAM Mali Onay Merkezi veya yetkili admin okuyabilsin diye kullanılır.

Örnek Wrangler komut mantığı:

```bash
wrangler secret put TELEGRAM_WEBHOOK_SECRET
wrangler secret put QUEUE_READ_SECRET
```

Komut çalışınca değer terminalden girilir; değer dosyaya yazılmaz.

## Telegram Webhook Kurulumu

Gerçek bot token repoya yazılmayacaktır. Token sadece güvenli ortamda kullanılacaktır.

Webhook set etme komutu mantığı:

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
  -d "url=https://<WORKER_DOMAIN>/telegram/webhook" \
  -d "secret_token=<TELEGRAM_WEBHOOK_SECRET>"
```

Buradaki değerler placeholderdır:

```text
<TELEGRAM_BOT_TOKEN> = Telegram BotFather tarafından verilen gerçek token
<WORKER_DOMAIN> = Cloudflare Worker yayın adresi
<TELEGRAM_WEBHOOK_SECRET> = Cloudflare Worker secret ile aynı güvenli değer
```

Worker, Telegram'dan gelen `x-telegram-bot-api-secret-token` header değerini kontrol eder. Bu değer doğru değilse kayıt kuyruğa alınmaz.

## Webhook Kontrolü

Webhook durumunu kontrol etmek için:

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getWebhookInfo"
```

Beklenen kontrol:

- URL doğru Worker endpointini göstermeli.
- Son hata alanı boş olmalı.
- Pending update sayısı takip edilmeli.

## Kuyruk Okuma Kontrolü

`/queue` endpointi admin secret olmadan açılmamalıdır.

Örnek:

```bash
curl "https://<WORKER_DOMAIN>/queue" \
  -H "Authorization: Bearer <QUEUE_READ_SECRET>"
```

Alternatif header:

```bash
curl "https://<WORKER_DOMAIN>/queue" \
  -H "x-alkam-admin-secret: <QUEUE_READ_SECRET>"
```

## Güvenlik Kuralları

- Token kod içine yazılmayacak.
- Secret değerleri GitHub'a commitlenmeyecek.
- Worker ilk fazda sadece kuyruk yazacak.
- Onay Merkezi onayı olmadan cari/banka/kasa/Moka kaydı oluşmayacak.
- Bilinmeyen cari otomatik açılmayacak.
- `/queue` halka açık bırakılmayacak.

## Test Senaryosu

1. Worker preview/deploy adresinde `GET /` çalıştırılır.
2. Cloudflare secret değerleri girilir.
3. Sahte Telegram update ile `POST /telegram/webhook` doğru secret header ile denenir.
4. Secret olmadan deneme yapılır; 401 dönmeli.
5. `GET /queue` admin secret ile kontrol edilir.
6. Admin secret olmadan `/queue` denenir; 401 dönmeli.
7. Telegram gerçek webhook sadece preview testlerinden sonra set edilir.
8. Production merge için ayrıca kullanıcı onayı alınır.

## Kabul Kriterleri

- Mesaj kuyruğa düşmeli.
- Secret yanlışsa veya eksikse kayıt kuyruğa düşmemeli.
- `/queue` admin secret olmadan veri göstermemeli.
- Dosya bilgisi varsa `fileId`, `fileName`, `mimeType`, `fileSize` alanları korunmalı.
- Tutar sadece öneri olarak yakalanmalı.
- Cari adayı kesin cari kaydı sayılmamalı.
- Hiçbir kesin muhasebe hareketi oluşmamalı.
