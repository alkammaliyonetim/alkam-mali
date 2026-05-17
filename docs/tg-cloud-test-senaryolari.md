# TG Cloud Test Senaryoları

Bu doküman, TG Cloud Worker PR'ı production'a alınmadan önce yapılacak minimum güvenlik ve işlev testlerini listeler.

## Test Ön Koşulları

Cloudflare Worker ortamında şu değerler tanımlı olmalıdır:

```text
TG_QUEUE KV binding
TELEGRAM_WEBHOOK_SECRET
QUEUE_READ_SECRET
```

Gerçek secret değerleri GitHub'a yazılmayacaktır.

## 1. Servis Hazır Testi

```bash
curl "https://<WORKER_DOMAIN>/"
```

Beklenen cevap:

```json
{
  "ok": true,
  "service": "ALKAM TG Cloud",
  "status": "ready"
}
```

## 2. Webhook Secretsız İstek Reddedilmeli

```bash
curl -X POST "https://<WORKER_DOMAIN>/telegram/webhook" \
  -H "content-type: application/json" \
  -d @fixtures/tg-cloud-sample-update.json
```

Beklenen davranış:

```json
{
  "ok": false,
  "error": "unauthorized_telegram_webhook"
}
```

HTTP status: `401`

## 3. Webhook Doğru Secret ile Kuyruğa Yazmalı

```bash
curl -X POST "https://<WORKER_DOMAIN>/telegram/webhook" \
  -H "content-type: application/json" \
  -H "x-telegram-bot-api-secret-token: <TELEGRAM_WEBHOOK_SECRET>" \
  -d @fixtures/tg-cloud-sample-update.json
```

Beklenen davranış:

```json
{
  "ok": true,
  "queued": "TGCL-...",
  "status": "Kuyrukta"
}
```

## 4. Kuyruk Secretsız Okunmamalı

```bash
curl "https://<WORKER_DOMAIN>/queue"
```

Beklenen davranış:

```json
{
  "ok": false,
  "error": "unauthorized_queue_read"
}
```

HTTP status: `401`

## 5. Kuyruk URL Secret ile Okunmamalı

```bash
curl "https://<WORKER_DOMAIN>/queue?secret=<QUEUE_READ_SECRET>"
```

Beklenen davranış:

```json
{
  "ok": false,
  "error": "unauthorized_queue_read"
}
```

HTTP status: `401`

## 6. Kuyruk Bearer ile Okunmalı

```bash
curl "https://<WORKER_DOMAIN>/queue" \
  -H "Authorization: Bearer <QUEUE_READ_SECRET>"
```

Beklenen davranış:

```json
{
  "ok": true,
  "items": []
}
```

Kuyruğa test kaydı düştüyse `items` boş olmayabilir.

## 7. Kuyruk Admin Header ile Okunmalı

```bash
curl "https://<WORKER_DOMAIN>/queue" \
  -H "x-alkam-admin-secret: <QUEUE_READ_SECRET>"
```

Beklenen davranış:

```json
{
  "ok": true,
  "items": []
}
```

## 8. Kuyruk Kaydı İçerik Kontrolü

Kuyruğa düşen örnek kayıtta şu alanlar görülmelidir:

```text
source = Telegram Cloud
status = Kuyrukta
suggested.amount = 1250.75
suggested.date = 2026-05-17
suggested.confidence = 0
suggested.reason = Cloud webhook sadece kuyruk kaydı oluşturdu; kesin kayıt yok.
```

## Kabul Kararı

Bu testler geçmeden PR ready/merge yapılmamalıdır. Production merge/deploy için ayrıca kullanıcı onayı alınmalıdır.
