# TG Cloud Panel Öncelikli Preview Notu

Bu not, Issue #27 için güncel çalışma yönünü tarif eder.

## Karar

Kullanıcı PC tarafında klasör, terminal ve uzun komut zinciriyle uğraşmayacaktır.

Bu nedenle ana yol:

- GitHub tarafında kod ve testler hazırlanır.
- Cloudflare tarafında ayarlar panelden yapılır.
- Lokal kurulum sadece opsiyonel destek olarak kalır.
- PR #26 draft kalır.
- Production için ayrıca açık onay gerekir.

## Panelden Yapılacaklar

- Doğru Cloudflare hesabı kontrol edilir.
- TG Cloud için ayrı Worker/test alanı hazırlanır.
- `workers/tg-cloud-worker.js` içeriği test Worker kaynağı olarak kullanılır.
- KV alanı oluşturulur.
- Worker binding adı `TG_QUEUE` olarak ayarlanır.
- Gerekli gizli değerler sadece Cloudflare panelinde tutulur.
- Gerçek değerler GitHub, issue, PR yorumu veya ChatGPT mesajına yazılmaz.

## Test Edilecekler

- `GET /` hazır cevabı verir.
- Yetkisiz webhook testi 401 döner.
- Yetkili webhook testi 200 döner.
- Yetkisiz queue okuma 401 döner.
- URL query ile queue okuma 401 döner.
- Yetkili header ile queue okuma 200 döner.

## Kuyruk Kontrolü

Test kaydında beklenenler:

- `source = Telegram Cloud`
- `status = Kuyrukta`
- `suggested.amount = 1250.75`
- `suggested.date = 2026-05-17`
- `suggested.confidence = 0`
- Kesin cari, banka, kasa, Moka veya muhasebe kaydı oluşmaz.

## Kapanış Kuralı

Issue #27 test sonucu yazılmadan kapatılmaz.

Issue #27 kapanmadan PR #26 ready/merge yapılmaz.

Onay Merkezi bağlantısı Issue #28 ile ayrı ilerler.
