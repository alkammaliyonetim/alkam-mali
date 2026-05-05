# ALKAM Mali - v12 Preflight Kullanım Rehberi

Bu rehber canlı sitede v12'ye geçiş kararı vermek için kullanılacak kısa kullanım kılavuzudur.

## Ana Amaç

v12 Preflight ekranı, v12 stabilizasyonuna geçmeden önce tüm kritik kontrolleri tek kararda toplar.

## Canlı Sitede İlk Kontrol

Önce Cache / Deploy kontrolü çalıştırılır:

```js
ALKAM_CACHE_DEPLOY_KONTROL_V11.test()
```

Beklenen:

```text
status: "Güncel"
missing: 0
expected: "v11.32 - 05.05.2026"
```

## Ana Karar Komutu

Cache temizse şu komut çalıştırılır:

```js
ALKAM_V12_PREFLIGHT_V1.test()
```

## Temiz Sonuç

Aşağıdaki sonuç gelirse v12 stabilizasyonuna geçilebilir:

```text
ready: true
decision: "v12 stabilizasyonuna geçilebilir"
writeOpen: false
failed: 0
liveBad: false
```

## Sonuç Export

Karar sonucu kayıt altına alınır:

```js
ALKAM_V12_PREFLIGHT_EXPORT_V1.collect()
```

veya panelden:

```text
Ana Dashboard > Sonuç Export > JSON İndir
```

## Temiz Değilse Ne Yapılır?

Eğer sonuç şöyleyse:

```text
ready: false
```

önce Preflight içindeki detaylara bakılır.

### 1. Supabase yazma açık görünürse

```text
writeOpen: true
```

Aksiyon:

```text
Hemen dur. Supabase Write Gate kontrol edilir. Yazma kapısı kapatılmadan hiçbir refactor genişletilmez.
```

Kontrol komutu:

```js
ALKAM_SUPABASE_WRITE_GATE_V10.test()
```

Beklenen:

```text
writeAllowed: false
```

### 2. Cache / Deploy eksikse

Kontrol komutu:

```js
ALKAM_CACHE_DEPLOY_KONTROL_V11.test()
```

Beklenen:

```text
status: "Güncel"
missing: 0
expected: "v11.32 - 05.05.2026"
```

Eksikse önce Ctrl+F5 / sert yenileme yapılır.

### 3. Canlı Test sorunluysa

Kontrol komutu:

```js
ALKAM_CANLI_TEST_PAKETI_V11.test()
```

Beklenen:

```text
failed: 0
risky: 0
```

Eksik veya riskli modül ayrı test edilir.

### 4. Dashboard loader eksikse

Kontrol komutu:

```js
ALKAM_DASHBOARD_KURUMSAL_V11.test()
```

Beklenen:

```text
v12PreflightLoader: true
v12ExportLoader: true
v12StabilizerLoader: true
viewPrefLoader: true
cacheControlLoader: true
liveTestLoader: true
```

## Panelden Kullanım

Canlı sitede ana dashboard üzerinde şu butonlar bulunur:

```text
v12 Preflight
Sonuç Export
```

Preflight karar panelini, Sonuç Export ise JSON çıktı panelini açar.

## Karar Mantığı

```text
Cache missing 0 ise: Preflight testine geç.
Ready true ise: v12 stabilizasyonuna geçilebilir.
Ready false ise: eksik/riskli modül düzeltilir.
writeOpen true ise: sistem durdurulur, yazma kapısı kapatılır.
```

## İlk v12 Commit Kararı

Preflight temizse:

```text
v12: stabilize dashboard and module loading
```

Preflight temiz değilse:

```text
fix: resolve v11 live test gaps before v12
```

## Değişmez Güvenlik Kuralı

```text
AI kayıt yapmaz, Supabase yazma kapalıdır, cari ekstresi ana defterdir, Moka United banka aktarımı cari tahsilatı sayılmaz.
```
