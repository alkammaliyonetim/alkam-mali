# ALKAM Mali - Canlı Site Test Adımları

Bu dosya, v11 kapanışı ve v12 başlangıcı öncesi canlı sitede yapılacak pratik test sırasıdır.

## Site

```text
https://alkam-mali.pages.dev
```

## 1. Sayfayı Sert Yenile

Önce tarayıcıda sert yenileme yapılır.

```text
Windows: Ctrl + F5
Mac: Cmd + Shift + R
Mobil: Sayfayı kapat/aç veya tarayıcı önbelleğini temizle
```

## 2. Sürüm Rozetini Kontrol Et

Sol altta sürüm rozeti görünmeli.

Beklenen:

```text
ALKAM Mali v11.17 - 05.05.2026
```

## 3. Ana Dashboard Kontrolü

Console komutu:

```js
ALKAM_DASHBOARD_KURUMSAL_V11.test()
```

Beklenen kritik alanlar:

```text
card: true
viewPrefLoader: true
v12StabilizerLoader: true
v12PreflightLoader: true
v12ExportLoader: true
```

## 4. Preflight Karar Kontrolü

Console komutu:

```js
ALKAM_V12_PREFLIGHT_V1.test()
```

Beklenen:

```text
ready: true
decision: "v12 stabilizasyonuna geçilebilir"
writeOpen: false
```

## 5. Sonuç Export Kontrolü

Console komutu:

```js
ALKAM_V12_PREFLIGHT_EXPORT_V1.test()
```

Beklenen:

```text
hasPreflight: true
hasLiveTest: true
hasWriteGate: true
```

Panelden kullanım:

```text
Ana Dashboard > Sonuç Export
```

## 6. JSON Sonuç Al

Console komutu:

```js
ALKAM_V12_PREFLIGHT_EXPORT_V1.collect()
```

veya panelden:

```text
Sonuç Export > JSON İndir
```

## 7. Supabase Yazma Kapısı Kontrolü

Console komutu:

```js
ALKAM_SUPABASE_WRITE_GATE_V10.test()
```

Beklenen:

```text
writeAllowed: false
```

## 8. Canlı Test Paketi

Console komutu:

```js
ALKAM_CANLI_TEST_PAKETI_V11.test()
```

Beklenen:

```text
failed: 0
risky: 0
```

## 9. Karar

Eğer tüm sonuçlar temizse:

```text
v12: stabilize dashboard and module loading
```

Eğer eksik/risk varsa:

```text
fix: resolve v11 live test gaps before v12
```

## 10. Değişmez Güvenlik Kuralı

```text
AI kayıt yapmaz, Supabase yazma kapalıdır, cari ekstresi ana defterdir, Moka United banka aktarımı cari tahsilatı sayılmaz.
```
