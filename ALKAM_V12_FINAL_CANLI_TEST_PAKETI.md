# ALKAM Mali - v12 Final Canlı Test Paketi

Bu dosya v11.32 kapanışından v12 stabilizasyonuna geçmeden önce uygulanacak final canlı test paketidir.

## Amaç

Canlı sitede şu üç şeyi kesinleştirmek:

```text
1. Doğru sürüm canlıda mı?
2. Preflight v12 için temiz karar veriyor mu?
3. Sonuç Export alınabiliyor mu?
```

## Site

```text
https://alkam-mali.pages.dev
```

## 1. Sert Yenileme

Önce sayfa sert yenilenir.

```text
Windows: Ctrl + F5
Mac: Cmd + Shift + R
Mobil: Sayfayı kapat/aç veya önbelleği temizle
```

## 2. Sürüm Rozeti

Beklenen:

```text
ALKAM Mali v11.32 - 05.05.2026
```

## 3. Cache / Deploy Kontrolü

```js
ALKAM_CACHE_DEPLOY_KONTROL_V11.test()
```

Beklenen:

```text
status: "Güncel"
missing: 0
expected: "v11.32 - 05.05.2026"
```

Temiz değilse:

```text
Önce cache / deploy / loader eksikleri düzeltilir.
v12 refactor başlatılmaz.
```

## 4. Ana Dashboard Kontrolü

```js
ALKAM_DASHBOARD_KURUMSAL_V11.test()
```

Beklenen kritik alanlar:

```text
card: true
cacheControlLoader: true
viewPrefLoader: true
v12StabilizerLoader: true
v12PreflightLoader: true
v12ExportLoader: true
```

## 5. v12 Preflight Kontrolü

```js
ALKAM_V12_PREFLIGHT_V1.test()
```

Beklenen:

```text
ready: true
decision: "v12 stabilizasyonuna geçilebilir"
writeOpen: false
exportBad: false
```

Temiz değilse:

```text
Preflight içindeki sorunlu başlık incelenir.
Eksik modül düzeltilmeden v12'ye geçilmez.
```

## 6. Sonuç Export Kontrolü

```js
ALKAM_V12_PREFLIGHT_EXPORT_V1.test()
```

Beklenen:

```text
hasPreflight: true
hasLiveTest: true
hasWriteGate: true
```

## 7. JSON Sonuç Alma

```js
ALKAM_V12_PREFLIGHT_EXPORT_V1.collect()
```

veya panelden:

```text
Ana Dashboard > Sonuç Export > JSON İndir
```

## 8. Supabase Yazma Güvenliği

```js
ALKAM_SUPABASE_WRITE_GATE_V10.test()
```

Beklenen:

```text
writeAllowed: false
```

Eğer true ise:

```text
DUR. Tüm geliştirme durdurulur. Yazma kapısı kapatılır.
```

## 9. Final Karar

Tüm sonuçlar temizse:

```text
v12: stabilize dashboard and module loading
```

Eksik / risk varsa:

```text
fix: resolve v11 live test gaps before v12
```

## 10. Final Güvenlik Cümlesi

```text
AI kayıt yapmaz, Supabase yazma kapalıdır, cari ekstresi ana defterdir, Moka United banka aktarımı cari tahsilatı sayılmaz.
```
