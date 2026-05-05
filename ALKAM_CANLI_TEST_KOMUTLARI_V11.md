# ALKAM Mali - Canlı Test Komutları v11.32 / v12 Hazırlık

Bu liste deploy sonrası hızlı ve güvenli kontrol için hazırlanmıştır.

## 1. Cache / Deploy Kontrolü

```js
ALKAM_CACHE_DEPLOY_KONTROL_V11.test()
```

Beklenen:

```text
status: "Güncel"
missing: 0
expected: "v11.32 - 05.05.2026"
```

Eksik görünürse önce Ctrl+F5 / sert yenileme yapılır.

## 2. v12 Preflight Karar Kontrolü

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

Eğer `ready: false` çıkarsa v12 refactor genişletilmeyecek; önce eksik/riskli modül düzeltilecek.

## 3. Sonuç Export Kontrolü

```js
ALKAM_V12_PREFLIGHT_EXPORT_V1.test()
```

Beklenen:

```text
hasPreflight: true
hasLiveTest: true
hasWriteGate: true
```

Detaylı sonucu almak için:

```js
ALKAM_V12_PREFLIGHT_EXPORT_V1.collect()
```

## 4. Ana Dashboard Kontrolü

```js
ALKAM_DASHBOARD_KURUMSAL_V11.test()
```

Beklenen ana alanlar:

```text
card: true
periodFilterLoader: true
singleScreenLoader: true
visualControlLoader: true
liveTestLoader: true
versionBadgeLoader: true
cacheControlLoader: true
viewPrefLoader: true
v12StabilizerLoader: true
v12PreflightLoader: true
v12ExportLoader: true
```

## 5. Canlı Test Paketi

```js
ALKAM_CANLI_TEST_PAKETI_V11.test()
```

Beklenen:

```text
failed: 0
risky: 0
```

Riskli alan çıkarsa ilgili modül ayrı test edilir.

## 6. v12 Stabilizer Kontrolü

```js
ALKAM_V12_STABILIZER_V1.test()
```

Beklenen:

```text
status: "Stabil"
missing: 0
writeAllowed: false
```

Eğer şu sonuç çıkarsa sistem durdurulup güvenlik kontrolü yapılır:

```text
status: "ACİL: Yazma Açık"
writeAllowed: true
```

## 7. Görünüm Tercihi Kontrolü

```js
ALKAM_DASHBOARD_GORUNUM_TERCIHI_V11.test()
```

Beklenen:

```text
applied: true
mode: "compact"
selector: true
oldTogglesHidden: true
```

## 8. Görsel Kontrol

```js
ALKAM_DASHBOARD_GORSEL_KONTROL_V11.test()
```

Beklenen:

```text
status: "Temiz"
missing: 0
```

## 9. Dönem Filtre Kontrolü

```js
ALKAM_DASHBOARD_DONEM_FILTRE_V11.test()
```

Beklenen:

```text
injected: true
```

## 10. Tek Ekran Kontrolü

```js
ALKAM_DASHBOARD_TEK_EKRAN_V11.test()
```

Beklenen:

```text
dashboard: true
note: true
```

## 11. Sürüm Rozeti Kontrolü

```js
ALKAM_SURUM_ROZETI_V11.test()
```

Beklenen:

```text
visible: true
build: "v11.32 - 05.05.2026"
```

## 12. AI Merkez Kontrolü

```js
ALKAM_AI_ASISTAN_MERKEZI_V11.test()
```

Beklenen:

```text
active: 6
total: 6
missing: 0
```

## 13. Supabase Güvenlik Kontrolü

```js
ALKAM_SUPABASE_WRITE_GATE_V10.test()
```

Beklenen:

```text
writeAllowed: false
```

## 14. Kritik Güvenlik Notları

- Supabase yazma kapalı kalacak.
- AI modülleri kayıt yapmayacak.
- Cari ana defter korunacak.
- Moka United banka aktarımı cari tahsilatı sayılmayacak.
- Onaysız işlem yapılmayacak.
- Preflight temiz olmadan v12 refactor genişletilmeyecek.
