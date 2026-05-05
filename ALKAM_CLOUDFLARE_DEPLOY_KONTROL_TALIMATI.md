# ALKAM Mali - Cloudflare Deploy Kontrol Talimatı

Bu dosya GitHub tarafındaki son değişikliklerin canlı siteye neden yansımadığını kontrol etmek için hazırlanmıştır.

## Mevcut Teşhis

```text
GitHub tarafı hazır.
_worker.js içinde Final Test Runner ve Final Test Button scriptleri var.
Canlı sayfada Final Test v12 henüz görünmüyorsa problem kod değil, deploy/canlıya yansıma problemidir.
```

## Canlı Site

```text
https://alkam-mali.pages.dev
```

## Beklenen Canlı Görünüm

```text
Sağ altta: Final Test v12
Console: ALKAM_V12_FINAL_TEST_RUNNER_V1.test()
```

## Son Kritik Commitler

```text
35e84129... Deploy trigger dosyası
436788ca... _worker.js final test button script ekleme
78fee43e... manifesto final test button güncelleme
```

## Cloudflare'da Kontrol Edilecek Yer

```text
Cloudflare Dashboard
Pages
alkam-mali
Deployments
```

## 1. Son Deploy Commit Kontrolü

Deployments ekranında son başarılı deploy'un commit'i yukarıdaki son commitlerden sonra olmalı.

Eğer son deploy eski commit ise:

```text
Retry deployment
```

veya yeni deploy tetikle.

## 2. Branch Kontrolü

Pages ayarlarında production branch şu olmalı:

```text
main
```

Eğer farklı branch seçiliyse canlı site GitHub main'deki son değişiklikleri almaz.

## 3. Build / Output Kontrolü

Bu repo statik çalışan bir yapı olduğu için build komutu yoksa problem değildir. Ama Cloudflare Pages yanlış klasörden yayın yapıyorsa yeni dosyalar canlıda görünmeyebilir.

Kontrol edilecekler:

```text
Build command: boş olabilir
Output directory: kök dizin veya mevcut doğru yayın dizini
Root directory: repo kökü
```

## 4. Dosya Canlıda Var mı Kontrolü

Tarayıcıdan şu adresler açılır:

```text
https://alkam-mali.pages.dev/alkam-v12-final-test-runner-v1.js
https://alkam-mali.pages.dev/alkam-v12-final-test-button-v1.js
```

Beklenen:

```text
JavaScript dosyası açılmalı.
404 dönmemeli.
```

## 5. Sayfa Kaynağı Kontrolü

Canlı sayfada şu scriptler görünmeli:

```html
<script src="/alkam-v12-final-test-runner-v1.js"></script>
<script src="/alkam-v12-final-test-button-v1.js"></script>
```

Görünmüyorsa _worker.js canlıya düşmemiş demektir.

## 6. Canlı Test Komutu

Deploy güncelse console'da:

```js
ALKAM_V12_FINAL_TEST_RUNNER_V1.test()
```

Beklenen:

```text
cacheOk: true
preflightReady: true
writeOpen: false
exportBad: false
writeAllowed: false
liveFailed: 0
liveRisky: 0
decision: "v12 stabilizasyonuna geçilebilir"
```

## 7. Problem Devam Ederse

Aşağıdaki durumlar kontrol edilir:

```text
Cloudflare Pages GitHub bağlantısı kopuk mu?
Repo olarak alkammaliyonetim/alkam-mali mi seçili?
Production branch main mi?
Deploy başarısız mı?
Pages farklı proje/siteyi mi yayınlıyor?
_worker.js Pages Functions tarafından dikkate alınıyor mu?
```

## Güvenlik Notu

```text
AI kayıt yapmaz, Supabase yazma kapalıdır, cari ekstresi ana defterdir, Moka United banka aktarımı cari tahsilatı sayılmaz.
```
