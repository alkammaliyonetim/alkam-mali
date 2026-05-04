# ALKAM Mali - v12 Stabilizasyon Kontrol Formu

Bu form v12 stabilizasyonuna geçmeden önce canlı sitede yapılacak son kontrol listesidir.

## 1. v12 Preflight Karar Kontrolü

Kontrol komutu:

```js
ALKAM_V12_PREFLIGHT_V1.test()
```

Beklenen:

```text
ready: true
decision: "v12 stabilizasyonuna geçilebilir"
writeOpen: false
```

Kontrol sonucu:

```text
[ ] v12'ye geçilebilir
[ ] Önce eksikler düzeltilecek
[ ] DUR: Supabase yazma açık
```

Not:

```text

```

## 2. Sürüm / Deploy Kontrolü

Kontrol komutu:

```js
ALKAM_CACHE_DEPLOY_KONTROL_V11.test()
```

Beklenen:

```text
status: "Güncel"
missing: 0
```

Kontrol sonucu:

```text
[ ] Temiz
[ ] Eksik var
```

Not:

```text

```

## 3. Ana Dashboard Kontrolü

Kontrol komutu:

```js
ALKAM_DASHBOARD_KURUMSAL_V11.test()
```

Beklenen:

```text
card: true
viewPrefLoader: true
v12StabilizerLoader: true
v12PreflightLoader: true
```

Kontrol sonucu:

```text
[ ] Temiz
[ ] Eksik var
```

Not:

```text

```

## 4. Canlı Test Paketi

Kontrol komutu:

```js
ALKAM_CANLI_TEST_PAKETI_V11.test()
```

Beklenen:

```text
failed: 0
risky: 0
```

Kontrol sonucu:

```text
[ ] Temiz
[ ] Eksik var
[ ] Riskli alan var
```

Not:

```text

```

## 5. v12 Stabilizer Kontrolü

Kontrol komutu:

```js
ALKAM_V12_STABILIZER_V1.test()
```

Beklenen:

```text
status: "Stabil"
missing: 0
writeAllowed: false
```

Kontrol sonucu:

```text
[ ] Stabil
[ ] Eksik modül var
[ ] ACİL: Yazma açık
```

Not:

```text

```

## 6. Supabase Yazma Güvenliği

Kontrol komutu:

```js
ALKAM_SUPABASE_WRITE_GATE_V10.test()
```

Beklenen:

```text
writeAllowed: false
```

Kontrol sonucu:

```text
[ ] Kapalı
[ ] Açık - Acil müdahale
```

Not:

```text

```

## 7. Görünüm Tercihi Kontrolü

Kontrol komutu:

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

Kontrol sonucu:

```text
[ ] Temiz
[ ] Görünüm seçici eksik
```

Not:

```text

```

## 8. Moka / Cari Ana Defter Güvenlik Hatırlatması

Canlı sistemde bu kurallar değiştirilmeyecek:

```text
Cari ekstresi ana defterdir.
Banka hareketleri onay/doğrulama katmanıdır.
Moka United banka aktarımı cari tahsilatı sayılmaz.
Onaysız işlem yapılmaz.
AI kayıt yapmaz.
```

Kontrol sonucu:

```text
[ ] Kurallar korunuyor
[ ] Risk var
```

Not:

```text

```

## 9. v12 Başlama Kararı

Aşağıdaki şartların tamamı sağlanmadan v12 refactor genişletilmeyecek:

```text
v12 Preflight ready: true.
Cache kontrol missing: 0.
Canlı test failed: 0.
Canlı test risky: 0.
v12 Stabilizer status: Stabil.
Supabase writeAllowed: false.
```

Karar:

```text
[ ] v12 stabilizasyonuna geçilebilir
[ ] Önce eksikler düzeltilecek
```

## 10. İlk v12 Teknik Aksiyon

Eğer tüm kontroller temizse ilk v12 teknik aksiyon:

```text
v12: stabilize dashboard and module loading
```

Bu aksiyon veri yazmayacak, Supabase yazma açmayacak, cari/tahakkuk/tahsilat kaydı oluşturmayacak.
