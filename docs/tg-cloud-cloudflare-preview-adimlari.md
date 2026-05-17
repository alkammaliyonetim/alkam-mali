# TG Cloud Cloudflare Preview Adımları

Bu doküman, PR #26 production'a alınmadan önce Cloudflare preview/deploy testinin nasıl yapılacağını standartlaştırır.

## Amaç

Worker'ın gerçek Cloudflare ortamında çalıştığını doğrulamak; fakat production merge/deploy yapmadan önce sadece kontrollü preview/test yapmak.

## Ön Koşullar

- PR GitHub checkleri yeşil olmalı.
- `npm run test:tg-cloud` başarılı olmalı.
- Gerçek Telegram bot token repoya yazılmamalı.
- Gerçek KV namespace ID repoya yazılmamalı.
- Secret değerleri GitHub'a commitlenmemeli.

## 1. Wrangler Dosyasını Hazırlama

Örnek dosya kopyalanır:

```bash
cp wrangler.tg-cloud.example.toml wrangler.tg-cloud.toml
```

`wrangler.tg-cloud.toml` içine gerçek KV ID değerleri lokal ortamda girilir. Bu dosya repoya commitlenmemelidir.

Önemli: `.gitignore` içinde gerçek wrangler dosyası korunmalıdır. Repoda sadece `wrangler.tg-cloud.example.toml` kalmalıdır.

## 2. KV Namespace Oluşturma

Örnek komut mantığı:

```bash
wrangler kv namespace create ALKAM_TG_QUEUE
wrangler kv namespace create ALKAM_TG_QUEUE_PREVIEW --preview
```

Dönen `id` ve `preview_id` değerleri sadece lokal `wrangler.tg-cloud.toml` içine yazılır.

## 3. Secret Değerlerini Girme

```bash
wrangler secret put TELEGRAM_WEBHOOK_SECRET --config wrangler.tg-cloud.toml
wrangler secret put QUEUE_READ_SECRET --config wrangler.tg-cloud.toml
```

Bu değerler terminalden girilir, dosyaya yazılmaz.

## 4. Preview / Dev Çalıştırma

Önce lokal/preview davranışı kontrol edilir:

```bash
wrangler dev --config wrangler.tg-cloud.toml
```

Beklenen servis hazır cevabı:

```bash
curl "http://localhost:8787/"
```

```json
{
  "ok": true,
  "service": "ALKAM TG Cloud",
  "status": "ready"
}
```

## 5. Lokal Webhook Testleri

Secretsız webhook 401 dönmeli:

```bash
curl -X POST "http://localhost:8787/telegram/webhook" \
  -H "content-type: application/json" \
  -d @fixtures/tg-cloud-sample-update.json
```

Doğru secret ile kayıt kuyruğa düşmeli:

```bash
curl -X POST "http://localhost:8787/telegram/webhook" \
  -H "content-type: application/json" \
  -H "x-telegram-bot-api-secret-token: <TELEGRAM_WEBHOOK_SECRET>" \
  -d @fixtures/tg-cloud-sample-update.json
```

Kuyruk Bearer ile okunmalı:

```bash
curl "http://localhost:8787/queue" \
  -H "Authorization: Bearer <QUEUE_READ_SECRET>"
```

URL query secret reddedilmeli:

```bash
curl "http://localhost:8787/queue?secret=<QUEUE_READ_SECRET>"
```

Beklenen status: `401`

## 6. Gerçek Cloudflare Preview / Test Deploy

Production merge onayı alınmadan kalıcı production routing yapılmamalıdır.

Test deploy gerekiyorsa önce ayrı isim veya preview ortamı tercih edilmelidir:

```bash
wrangler deploy --config wrangler.tg-cloud.toml --dry-run
```

Dry-run başarılı olmadan deploy yapılmamalıdır.

Eğer deploy testi yapılacaksa çıkan Worker domaini not edilir ve `docs/tg-cloud-test-senaryolari.md` adımları bu domain üzerinde tekrar edilir.

## 7. Telegram Webhook Bağlama

Gerçek Telegram webhook sadece şu şartlar sağlandıktan sonra bağlanır:

- GitHub checks yeşil.
- Lokal simülasyon testi yeşil.
- Cloudflare Worker endpoint testleri yeşil.
- Secret testleri yeşil.
- Kuyruk okuma güvenlik testleri yeşil.
- Kullanıcı açık onay verdi.

Webhook set etme komutu:

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
  -d "url=https://<WORKER_DOMAIN>/telegram/webhook" \
  -d "secret_token=<TELEGRAM_WEBHOOK_SECRET>"
```

## 8. Başarı Kriterleri

- `GET /` hazır cevabı döner.
- Webhook secretsız 401 döner.
- Doğru webhook secret ile kayıt `Kuyrukta` oluşur.
- `/queue` secretsız 401 döner.
- `/queue?secret=...` 401 döner.
- `/queue` Bearer veya admin header ile okunur.
- Kuyruk kaydı kesin cari/banka/kasa/Moka hareketi oluşturmaz.
- Onay Merkezi entegrasyonu ayrı faz olarak kalır.

## 9. Production Kararı

Bu adımlar tamamlanmadan PR ready yapılmamalı, production merge/deploy yapılmamalıdır.

Production için ayrıca kullanıcıdan açık onay alınmalıdır.
