# ALKAM Mali - v12 Geçiş Hazırlık Manifesti

Bu manifesto v11.32 kapanışı sonrası v12 stabilizasyonuna geçiş için hazır olan tüm ana dosyaları ve karar akışını tek yerde toplar.

## Mevcut Aşama

```text
v11.32 hazırlık tamamlandı.
Final canlı test paketi hazırlandı.
Final Test Runner canlı siteye otomatik yüklenir hale getirildi.
Sağ alt Final Test v12 butonu eklendi.
Preflight karar mekanizması hazırlandı.
Sonuç Export mekanizması hazırlandı.
Sıradaki gerçek adım canlı sitede Final Test v12 butonu ile sonucu almaktır.
```

## Canlı Site

```text
https://alkam-mali.pages.dev
```

## Beklenen Canlı Sürüm

```text
ALKAM Mali v11.32 - 05.05.2026
```

## Final Test Runner

Final Test Runner `_worker.js` üzerinden otomatik yüklenir.

En kolay kullanım:

```text
Sağ alt > Final Test v12
```

Console'da doğrudan çalıştırılacak komut:

```js
ALKAM_V12_FINAL_TEST_RUNNER_V1.test()
```

Panel açmak için:

```js
ALKAM_V12_FINAL_TEST_RUNNER_V1.open()
```

Buton kontrolü:

```js
ALKAM_V12_FINAL_TEST_BUTTON_V1.test()
```

Beklenen:

```text
visible: true
runner: true
```

## Ana Karar Komutları

```js
ALKAM_V12_FINAL_TEST_BUTTON_V1.test()
ALKAM_V12_FINAL_TEST_RUNNER_V1.test()
ALKAM_CACHE_DEPLOY_KONTROL_V11.test()
ALKAM_DASHBOARD_KURUMSAL_V11.test()
ALKAM_V12_PREFLIGHT_V1.test()
ALKAM_V12_PREFLIGHT_EXPORT_V1.test()
ALKAM_V12_PREFLIGHT_EXPORT_V1.collect()
ALKAM_SUPABASE_WRITE_GATE_V10.test()
```

## Temiz Geçiş Şartı

```text
button visible: true
button runner: true
cacheOk: true
preflightReady: true
writeOpen: false
exportBad: false
writeAllowed: false
liveFailed: 0
liveRisky: 0
decision: v12 stabilizasyonuna geçilebilir
```

## Temizse İlk v12 Commit

```text
v12: stabilize dashboard and module loading
```

## Temiz Değilse İlk Düzeltme Commit'i

```text
fix: resolve v11 live test gaps before v12
```

## Hazır Teknik Modüller

```text
alkam-dashboard-kurumsal-v11.js
alkam-cache-deploy-kontrol-v11.js
alkam-v12-preflight-v1.js
alkam-v12-preflight-export-v1.js
alkam-v12-stabilizer-v1.js
alkam-v12-final-test-runner-v1.js
alkam-v12-final-test-button-v1.js
alkam-canli-test-paketi-v11.js
alkam-dashboard-gorunum-tercihi-v11.js
alkam-surum-rozeti-v11.js
alkam-ai-asistan-merkezi-v11.js
alkam-supabase-write-gate-v10.js
_worker.js
```

## Hazır Dokümantasyon Dosyaları

```text
ALKAM_V12_FINAL_TEST_RUNNER_CALISTIRMA.md
ALKAM_V12_TEK_PARCA_CANLI_TEST_KOMUTU.md
ALKAM_V12_FINAL_CANLI_TEST_PAKETI.md
ALKAM_CANLI_SITE_TEST_ADIMLARI.md
ALKAM_CANLI_TEST_KOMUTLARI_V11.md
ALKAM_V12_PREFLIGHT_KULLANIM_REHBERI.md
ALKAM_V12_PREFLIGHT_SONUC_SABLONU.md
ALKAM_V12_CANLI_TEST_SONRASI_AKSIYON_PLANI.md
ALKAM_V12_CODEX_BASLANGIC_PROMPTU.md
ALKAM_V12_KISA_DURUM_OZETI.md
ALKAM_V12_STABILIZASYON_KONTROL_FORMU.md
ALKAM_V12_STABILIZASYON_ILK_ADIM_TALIMATI.md
```

## Canlı Dashboard Buton Standardı

```text
AI Merkezi
Güvenilirlik
Final Test v12
Sonuç Export
```

## Kesin Yasaklar

```text
Supabase yazma açmak
Cari hareketi oluşturmak
Tahakkuk oluşturmak
Tahsilat oluşturmak
Banka hareketi işlemek
Moka kaydı otomatik işlemek
AI ile kayıt oluşturmak
Eski modül silmek
2026 Geçiş sekmesi/kavramı oluşturmak
```

## Değişmez Güvenlik Cümlesi

```text
AI kayıt yapmaz, Supabase yazma kapalıdır, cari ekstresi ana defterdir, Moka United banka aktarımı cari tahsilatı sayılmaz.
```

## Son Not

Bu noktadan sonra yeni özellik eklemek yerine canlı test sonucu alınmalı, JSON export kaydedilmeli ve sonuca göre v12 stabilizasyonu başlatılmalıdır.
