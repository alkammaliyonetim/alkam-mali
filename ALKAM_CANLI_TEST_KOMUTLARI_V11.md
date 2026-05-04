# ALKAM Mali - Canlı Test Komutları v11

Bu liste deploy sonrası hızlı kontrol için hazırlanmıştır.

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

Riskli alan çıkarsa ilgili modül ayrı test edilir.

## 4. Görsel kontrol

```js
ALKAM_DASHBOARD_GORSEL_KONTROL_V11.test()
```

Beklenen:

```text
status: "Temiz"
missing: 0
```

## 5. Dönem filtre kontrolü

```js
ALKAM_DASHBOARD_DONEM_FILTRE_V11.test()
```

Beklenen:

```text
injected: true
```

## 6. Tek ekran kontrolü

```js
ALKAM_DASHBOARD_TEK_EKRAN_V11.test()
```

Beklenen:

```text
dashboard: true
note: true
```

## 7. Sürüm rozeti kontrolü

```js
ALKAM_SURUM_ROZETI_V11.test()
```

Beklenen:

```text
visible: true
build: "v11.17 - 05.05.2026"
```

## 8. AI merkez kontrolü

```js
ALKAM_AI_ASISTAN_MERKEZI_V11.test()
```

Beklenen:

```text
active: 6
total: 6
missing: 0
```

## 9. Supabase güvenlik kontrolü

```js
ALKAM_SUPABASE_WRITE_GATE_V10.test()
```

Beklenen:

```text
writeAllowed: false
```

## 10. Kritik güvenlik notları

- Supabase yazma kapalı kalacak.
- AI modülleri kayıt yapmayacak.
- Cari ana defter korunacak.
- Moka United banka aktarımı cari tahsilatı sayılmayacak.
- Onaysız işlem yapılmayacak.
