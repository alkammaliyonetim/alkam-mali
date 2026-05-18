# TG Cloud Handoff Özeti

Bu doküman, TG Cloud fazında mevcut durumu kısa ve net özetler.

## Mevcut Durum

- PR #26 draft durumdadır.
- GitHub checks yeşildir.
- TG Cloud Worker iskeleti hazırdır.
- Tek tık lokal kurulum ve test akışı eklenmiştir.
- Cloudflare preview testi henüz tamamlanmamıştır.
- Issue #27 Cloudflare preview blocker olarak açıktır.
- Issue #28 Onay Merkezi entegrasyonu için sonraki faz olarak açıktır.
- Kullanıcı PC tarafında uzun terminal/klasör/komut zinciri istemediği için panel öncelikli preview yolu ayrıca eklenmiştir.

## PR #26 Ne Yapar?

- Telegram webhook endpointi sağlar.
- Gelen Telegram update bilgisini normalize eder.
- Kaydı sadece `TG_QUEUE` kuyruğuna yazar.
- Queue kayıtlarını yönetici kontrolü ile okunabilir hale getirir.
- Tutar/tarih/dosya bilgisi için ön okuma yapar.
- `ALKAM-KUR.bat` ile lokal kontrol, test ve rapor akışı sağlar.
- Kesin muhasebe kaydı oluşturmaz.

## Tek Tık Kurulum Akışı

Ana giriş dosyası:

- `ALKAM-KUR.bat`

Bu dosya sırayla şu dosyaları çalıştırır:

1. `tools/alkam-check.ps1` — Git, Node.js, npm ve Wrangler kontrolü.
2. `tools/alkam-test.ps1` — npm kurulumu ve testler.
3. `tools/alkam-report.ps1` — yapılanlar / kalanlar / kontrol ettiklerim raporu.

Bu akış canlıya çıkarma yapmaz, webhook ayarlamaz ve kesin cari/banka/kasa/Moka/muhasebe kaydı oluşturmaz.

## Panel Öncelikli Preview Yolu

Ana karar: Kullanıcı terminal komutlarıyla uğraşmayacak.

Panel öncelikli yol için kısa not:

- `docs/tg-cloud-panel-oncelikli-preview.md`

Bu notta şu kararlar sabitlenmiştir:

- Cloudflare ayarları panelden ilerler.
- Lokal kurulum yalnızca opsiyonel destek olarak kalır.
- Gerçek gizli değerler GitHub, issue, PR yorumu veya ChatGPT mesajına yazılmaz.
- #27 tamamlanmadan #26 ready/merge yapılmaz.
- #28 Onay Merkezi bağlantısı ayrı ilerler.

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

- Webhook yetkisiz istekte 401 döner.
- Geçersiz JSON 400 döner.
- Doğru kontrol ile kayıt `Kuyrukta` oluşur.
- `/queue` yetkisiz istekte 401 döner.
- URL üzerinden gizli değer taşıma kabul edilmez.
- `/queue` yetkili header ile okunur.
- Test kaydında tutar `1250.75`, tarih `2026-05-17`, confidence `0` doğrulanır.

Kurulum güvenlik testinde doğrulananlar:

- `ALKAM-KUR.bat` üç parçalı akışı çağırır.
- Kurulum akışı canlıya çıkarma komutu içermez.
- Kurulum akışı webhook ayarlama komutu içermez.
- Kurulum akışı gerçek gizli değer içermez.

## Merge Öncesi Zorunlu Blokaj

PR #26 ready/merge yapılmadan önce Issue #27 tamamlanmalıdır.

Issue #27 kapsamında yapılacaklar:

- Doğru Cloudflare hesabı kontrol edilecek.
- TG Cloud için test Worker alanı hazırlanacak.
- `TG_QUEUE` binding tanımlanacak.
- Gerekli Cloudflare gizli değerleri panelden girilecek.
- Preview endpoint testleri yapılacak.
- Webhook ve queue güvenlik testleri geçecek.
- Test sonucu #27 şablonuna yazılacak.

## Sonraki Faz

Issue #28, TG Cloud kuyruğunu Onay Merkezi'ne bağlama işidir.

Bu iş PR #26'ya karıştırılmamalıdır. Ayrı branch/PR ile yapılmalıdır.

## Güvenlik Kuralları

- Gerçek gizli değerler repoya yazılmayacak.
- Gerçek KV ID repoya yazılmayacak.
- Gizli değerler URL içinde taşınmayacak.
- Onaysız kesin kayıt yok.
- Bilinmeyen cari otomatik açılmayacak.

## Acil Durum / Rollback

Sorun olursa uygulanacak güvenli sıra:

1. Telegram bağlantısını kapat.
2. Worker yayınını geri al veya erişimi durdur.
3. Gizli değerleri yenile.
4. Queue içeriğini manuel kontrol et.
5. Kesin kayıt üretme.
6. Yeni PR açmadan production'a dokunma.

Detaylı plan: `docs/tg-cloud-rollback-plani.md`

## Karar

Şu an karar: GitHub tarafı hazır; Cloudflare panel preview tamamlanmadan production'a geçilmeyecek.
