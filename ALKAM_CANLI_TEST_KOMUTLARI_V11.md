# ALKAM Mali - Canlı Test Komutları v11 / v12 Hazırlık

Bu liste deploy sonrası hızlı ve güvenli kontrol için hazırlanmıştır.

## 1. v12 Preflight karar kontrolü

```js
ALKAM_V12_PREFLIGHT_V1.test()
```

Beklenen:

```text
ready: true
decision: "v12 stabilizasyonuna geçilebilir"
writeOpen: false
```

Eğer `ready: false` çıkarsa v12 refactor genişletilmeyecek; önce eksik/riskli modül düzeltilecek.

## 2. Ana dashboard kontrolü

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
```

## 3. Cache / deploy kontrolü

```js
ALKAM_CACHE_DEPLOY_KONTROL_V11.test()
```

Beklenen:

```text
status: "Güncel"
missing: 0
```

Eksik görünürse önce Ctrl+F5 / sert yenileme yapılır.

## 4. Canlı test paketi

```js
ALKAM_CANLI_TEST_PAKETI_V11.test()
```

Beklenen:

```text
failed: 0
risky: 0
```

Riskli alan çıkarsa ilgili modül ayrı test edilir.

## 5. v12 Stabilizer kontrolü

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

## 6. Görünüm tercihi kontrolü

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

## 7. Görsel kontrol

```js
ALKAM_DASHBOARD_GORSEL_KONTROL_V11.test()
```

Beklenen:

```text
status: "Temiz"
missing: 0
```

## 8. Dönem filtre kontrolü

```js
ALKAM_DASHBOARD_DONEM_FILTRE_V11.test()
```

Beklenen:

```text
injected: true
```

## 9. Tek ekran kontrolü

```js
ALKAM_DASHBOARD_TEK_EKRAN_V11.test()
```

Beklenen:

```text
dashboard: true
note: true
```

## 10. Sürüm rozeti kontrolü

```js
ALKAM_SURUM_ROZETI_V11.test()
```

Beklenen:

```text
visible: true
build: "v11.17 - 05.05.2026"
```

## 11. AI merkez kontrolü

```js
ALKAM_AI_ASISTAN_MERKEZI_V11.test()
```

Beklenen:

```text
active: 6
total: 6
missing: 0
```

## 12. Supabase güvenlik kontrolü

```js
ALKAM_SUPABASE_WRITE_GATE_V10.test()
```

Beklenen:

```text
writeAllowed: false
```

## 13. Kritik güvenlik notları

- Supabase yazma kapalı kalacak.
- AI modülleri kayıt yapmayacak.
- Cari ana defter korunacak.
- Moka United banka aktarımı cari tahsilatı sayılmayacak.
- Onaysız işlem yapılmayacak.
- Preflight temiz olmadan v12 refactor genişletilmeyecek.
