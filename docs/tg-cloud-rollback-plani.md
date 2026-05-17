# TG Cloud Rollback Planı

Bu doküman, TG Cloud Worker production'a yaklaştırılmadan önce geri dönüş planını netleştirir.

## Amaç

Telegram Cloud webhook veya Cloudflare Worker tarafında sorun çıkarsa sistemi hızlıca güvenli moda almak.

## Temel Kural

Rollback sırasında da hiçbir kesin cari, banka, kasa veya Moka kaydı otomatik oluşturulmayacaktır.

## Risk Senaryoları

### 1. Telegram Webhook Hatalı Çalışıyor

Belirti:

- Telegram mesajları kuyruğa düşmüyor.
- Telegram tarafında webhook error görünüyor.
- Worker 401/500 döndürüyor.

İlk aksiyon:

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getWebhookInfo"
```

Gerekirse webhook devre dışı bırakılır:

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/deleteWebhook"
```

Beklenen sonuç:

- Telegram artık Worker'a update göndermeyi bırakır.
- Eski TG v1/v2/v3 production yapıları etkilenmez.

### 2. Worker Queue Okunamıyor

Belirti:

- `/queue` admin secret ile okunamıyor.
- `worker_error` dönüyor.
- KV binding hatası var.

Kontrol:

- `TG_QUEUE` binding doğru mu?
- KV namespace ID doğru mu?
- `QUEUE_READ_SECRET` doğru ortamda tanımlı mı?
- `wrangler.tg-cloud.toml` lokal dosyası repoya commitlenmemiş mi?

Güvenli aksiyon:

- Worker deploy geri alınır veya webhook kapatılır.
- Kuyruk okunmadan kesin kayıt oluşturulmadığı için muhasebe verisi etkilenmez.

### 3. Yetkisiz Erişim Şüphesi

Belirti:

- `/queue` erişim loglarında şüpheli denemeler var.
- Telegram webhook secret sızmış olabilir.
- Queue read secret sızmış olabilir.

Aksiyon:

1. Telegram webhook silinir:

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/deleteWebhook"
```

2. Cloudflare secret değerleri yenilenir:

```bash
wrangler secret put TELEGRAM_WEBHOOK_SECRET --config wrangler.tg-cloud.toml
wrangler secret put QUEUE_READ_SECRET --config wrangler.tg-cloud.toml
```

3. Yeni secret ile webhook tekrar sadece testten sonra set edilir.

### 4. Yanlış Worker Deploy Edildi

Aksiyon:

- Son çalışan deploy'a Cloudflare dashboard üzerinden geri dönülür.
- Geri dönüş mümkün değilse webhook kapatılır.
- PR #26 merge/deploy geçmişi kontrol edilir.

## Rollback Sonrası Kontrol Listesi

- [ ] Telegram webhook kapalı veya doğru endpointte.
- [ ] `/queue` secretsız erişilemiyor.
- [ ] `/queue?secret=...` erişilemiyor.
- [ ] Admin secret yenilendiyse eski secret çalışmıyor.
- [ ] Yeni kayıtlar kesin cari/banka/kasa/Moka hareketi üretmedi.
- [ ] Onay Merkezi tarafında bekleyen kayıtlar manuel kontrol edildi.
- [ ] Kullanıcıya yapılan/kalan/kontrol listesi verildi.

## Güvenli Mod

Sorun halinde en güvenli mod:

1. Telegram webhook'u kapat.
2. Worker deploy'u geri al veya erişimi durdur.
3. Queue içeriğini sadece manuel incele.
4. Kesin kayıt üretme.
5. Yeni PR açmadan production'a dokunma.

## Production Notu

Bu rollback planı test edilmeden veya en azından ekip tarafından okunmadan production merge/deploy yapılmamalıdır.
