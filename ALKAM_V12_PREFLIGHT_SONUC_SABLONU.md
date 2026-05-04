# ALKAM Mali - v12 Preflight Sonuç Şablonu

Bu şablon canlı sitede Preflight çalıştırıldıktan sonra sonucu kayıt altına almak için kullanılacaktır.

## 1. Çalıştırılan Ana Komut

```js
ALKAM_V12_PREFLIGHT_V1.test()
```

## 2. Beklenen Sonuç

```text
ready: true
decision: "v12 stabilizasyonuna geçilebilir"
writeOpen: false
failed: 0
liveBad: false
```

## 3. Sonuç Export Komutu

Canlı sonuçları tek JSON çıktısı olarak almak için:

```js
ALKAM_V12_PREFLIGHT_EXPORT_V1.test()
```

Detaylı JSON çıktısını almak için:

```js
ALKAM_V12_PREFLIGHT_EXPORT_V1.collect()
```

Panelden kullanım:

```text
Ana Dashboard > Sonuç Export
```

## 4. Gerçek Preflight Sonucu

```text
ready:
decision:
writeOpen:
failed:
liveBad:
missing:
time:
```

## 5. Export Kontrol Sonucu

```text
hasPreflight:
hasLiveTest:
hasWriteGate:
```

## 6. Sonuç Değerlendirmesi

```text
[ ] Temiz - v12 stabilizasyonuna geçilebilir
[ ] Eksik var - önce eksikler düzeltilecek
[ ] Riskli - güvenlik kontrolü yapılacak
[ ] ACİL - Supabase yazma açık
```

## 7. Eksik / Riskli Modül Varsa

Eksik veya riskli görünen modül:

```text

```

Aksiyon:

```text

```

## 8. Supabase Yazma Kontrolü

Ayrı kontrol komutu:

```js
ALKAM_SUPABASE_WRITE_GATE_V10.test()
```

Beklenen:

```text
writeAllowed: false
```

Gerçek sonuç:

```text
writeAllowed:
```

## 9. Canlı Test Kontrolü

Ayrı kontrol komutu:

```js
ALKAM_CANLI_TEST_PAKETI_V11.test()
```

Beklenen:

```text
failed: 0
risky: 0
```

Gerçek sonuç:

```text
failed:
risky:
```

## 10. Karar

```text
[ ] v12: stabilize dashboard and module loading
[ ] fix: resolve v11 live test gaps before v12
```

## 11. Kayıt Altına Alınacak Dosya

Sonuç Export panelinden JSON indirildiyse dosya adı:

```text
alkam-v12-preflight-sonuc-YYYY-MM-DD-HH-MM-SS.json
```

## 12. Değişmez Güvenlik Cümlesi

```text
AI kayıt yapmaz, Supabase yazma kapalıdır, cari ekstresi ana defterdir, Moka United banka aktarımı cari tahsilatı sayılmaz.
```

## 13. Notlar

```text

```
