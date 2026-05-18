# TG Cloud KV Kurulum Notu

Bu doküman, ALKAM Mali Telegram Cloud fazında kullanılacak Cloudflare KV kuyruğunun güvenli kurulum notudur.

## Amaç

Telegram webhook ile gelen mesaj, belge, fotoğraf ve açıklamalar bilgisayar açık olmadan Cloudflare Worker tarafından alınacak ve `TG_QUEUE` KV kuyruğuna yazılacaktır.

Bu aşama yalnızca kuyruk oluşturur. Kesin cari, banka, kasa veya Moka kaydı oluşturmaz.

## Güvenlik Kuralları

- Gerçek Telegram bot token değeri repoya yazılmayacak.
- Gerçek Cloudflare KV namespace ID değerleri repoya yazılmayacak.
- Bilinmeyen cari otomatik açılmayacak.
- Onay Merkezi onayı olmadan kesin kayıt oluşmayacak.
- `TG_QUEUE` sadece geçici/ön okuma kuyruğu gibi davranacak.

## KV Namespace Oluşturma

Cloudflare panelinden veya Wrangler CLI ile iki ayrı KV namespace oluşturulmalıdır:

1. Production KV namespace
2. Preview/test KV namespace

Örnek isimlendirme:

```text
ALKAM_TG_QUEUE
ALKAM_TG_QUEUE_PREVIEW
```

## wrangler Dosyasına Bağlama

`wrangler.tg-cloud.example.toml` dosyası örnek şablondur. Gerçek deploy için bu dosya kopyalanıp gizli olmayan çalışma dosyasına dönüştürülmelidir.

Örnek alanlar:

```toml
[[kv_namespaces]]
binding = "TG_QUEUE"
id = "BURAYA_KV_NAMESPACE_ID"
preview_id = "BURAYA_PREVIEW_KV_NAMESPACE_ID"
```

Gerçek `id` ve `preview_id` değerleri repoya commitlenmemelidir.

## Test Mantığı

İlk testlerde hedef şu olmalıdır:

1. `GET /` servis hazır cevabı dönmeli.
2. `POST /telegram/webhook` sahte Telegram update JSON kabul etmeli.
3. Gelen kayıt `TG_QUEUE` içine yazılmalı.
4. `GET /queue` son kayıtları listelemeli.
5. Kayıtların durumu sadece `Kuyrukta` olmalı.

## Kabul Kriterleri

- Worker deploy edilebilir olmalı.
- KV binding adı `TG_QUEUE` olmalı.
- Gerçek token ve gerçek KV ID repoda olmamalı.
- Kuyruğa yazılan kayıt Onay Merkezi adayı niteliğinde olmalı.
- Kesin muhasebe/cari/banka/kasa/Moka hareketi oluşmamalı.
