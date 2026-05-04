# ALKAM Mali - Canlı Test Komutları v11 / v12 Hazırlık

Bu liste deploy sonrası hızlı ve güvenli kontrol için hazırlanmıştır.

## 1. Ana dashboard kontrolü

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
```

## 2. Cache / deploy kontrolü

```js
ALKAM_CACHE_DEPLOY_KONTROL_V11.test()
```

Beklenen:

```text
status: "Güncel"
missing: 0
```

Eksik görünürse önce Ctrl+F5 / sert yenileme yapılır.

## 3. Canlı test paketi

```js
ALKAM_CANLI_TEST_PAKETI_V11.test()
```

Beklenen:

```text
failed: 0
```

Ek güvenli beklenti:

```text
risky: 0
```

Riskli alan çıkarsa ilgili modül ayrı test edilir.

## 4. v12 Stabilizer kontrolü

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

## 5. Görünüm tercihi kontrolü

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

## 6. Görsel kontrol

```js
ALKAM_DASHBOARD_GORSEL_KONTROL_V11.test()
```

Beklenen:

```text
status: "Temiz"
missing: 0
```

## 7. Dönem filtre kontrolü

```js
ALKAM_DASHBOARD_DONEM_FILTRE_V11.test()
```

Beklenen:

```text
injected: true
```

## 8. Tek ekran kontrolü

```js
ALKAM_DASHBOARD_TEK_EKRAN_V11.test()
```

Beklenen:

```text
dashboard: true
note: true
```

## 9. Sürüm rozeti kontrolü

```js
ALKAM_SURUM_ROZETI_V11.test()
```

Beklenen:

```text
visible: true
build: "v11.17 - 05.05.2026"
```

## 10. AI merkez kontrolü

```js
ALKAM_AI_ASISTAN_MERKEZI_V11.test()
```

Beklenen:

```text
active: 6
total: 6
missing: 0
```

## 11. Supabase güvenlik kontrolü

```js
ALKAM_SUPABASE_WRITE_GATE_V10.test()
```

Beklenen:

```text
writeAllowed: false
```

## 12. Kritik güvenlik notları

- Supabase yazma kapalı kalacak.
- AI modülleri kayıt yapmayacak.
- Cari ana defter korunacak.
- Moka United banka aktarımı cari tahsilatı sayılmayacak.
- Onaysız işlem yapılmayacak.
- Canlı test temiz olmadan v12 refactor genişletilmeyecek.
