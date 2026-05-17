# TG Cloud Handoff Özeti

Bu doküman, TG Cloud fazında mevcut durumu kısa ve net özetler.

## Mevcut Durum

- PR #26 draft durumdadır.
- GitHub checks yeşildir.
- TG Cloud Worker iskeleti hazırdır.
- Cloudflare preview/local testleri henüz tamamlanmamıştır.
- Issue #27 Cloudflare preview blocker olarak açıktır.
- Issue #28 Onay Merkezi entegrasyonu için sonraki faz olarak açıktır.

## PR #26 Ne Yapar?

- Telegram webhook endpointi sağlar.
- Gelen Telegram update bilgisini normalize eder.
- Kaydı sadece `TG_QUEUE` kuyruğuna yazar.
- Queue kayıtlarını admin secret ile okunabilir hale getirir.
- Tutar/tarih/dosya bilgisi için ön okuma yapar.
- Kesin muhasebe kaydı oluşturmaz.

## PR #26 Ne Yapmaz?

- Kesin cari kaydı oluşturmaz.
- Bilinmeyen cari açmaz.
- Banka hareketi oluşturmaz.
- Kasa hareketi oluşturmaz.
- Moka hareketi oluşturmaz.
- Onay Merkezi entegrasyonunu tamamlamaz.
- Gerçek Telegram webhook'u bağlamaz.
- Production deploy yapmaz.

## GitHub Test Durumu

Başarılı kontroller:

- TG Cloud Worker Tests: success
- IstasyonALKAM Bot Preview Test: success

TG Cloud testinde doğrulananlar:

- Webhook secretsız 401 döner.
- Geçersiz JSON 400 döner.
- Doğru secret ile kayıt `Kuyrukta` oluşur.
- `/queue` secretsız 401 döner.
- `/queue?secret=...` reddedilir.
- `/queue` Bearer/admin header ile okunur.
- Test kaydında tutar `1250.75`, tarih `2026-05-17`, confidence `0` doğrulanır.

## Merge Öncesi Zorunlu Blokaj

PR #26 ready/merge yapılmadan önce Issue #27 tamamlanmalıdır.

Issue #27 kapsamında yapılacaklar:

- Cloudflare KV namespace oluşturulacak.
- Preview/test KV namespace oluşturulacak.
- `TG_QUEUE` binding tanımlanacak.
- `TELEGRAM_WEBHOOK_SECRET` girilecek.
- `QUEUE_READ_SECRET` girilecek.
- `wrangler dev` veya preview testleri yapılacak.
- Webhook ve queue güvenlik testleri geçecek.
- Test sonucu #27 şablonuna yazılacak.

## Sonraki Faz

Issue #28, TG Cloud kuyruğunu Onay Merkezi'ne bağlama işidir.

Bu iş PR #26'ya karıştırılmamalıdır. Ayrı branch/PR ile yapılmalıdır.

## Güvenlik Kuralları

- Gerçek token repoya yazılmayacak.
- Gerçek KV ID repoya yazılmayacak.
- `wrangler.tg-cloud.toml` lokal kalacak ve ignore edilecek.
- Secret değerleri URL içinde taşınmayacak.
- Onaysız kesin kayıt yok.
- Bilinmeyen cari otomatik açılmayacak.

## Acil Durum / Rollback

Sorun olursa uygulanacak güvenli sıra:

1. Telegram webhook'u kapat.
2. Worker deploy'u geri al veya erişimi durdur.
3. Secret değerlerini yenile.
4. Queue içeriğini manuel kontrol et.
5. Kesin kayıt üretme.
6. Yeni PR açmadan production'a dokunma.

Detaylı plan: `docs/tg-cloud-rollback-plani.md`

## Karar

Şu an karar: GitHub tarafı hazır; Cloudflare preview tamamlanmadan production'a geçilmeyecek.
