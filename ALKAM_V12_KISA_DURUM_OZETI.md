# ALKAM Mali - v12 Kısa Durum Özeti

Bu dosya, projeye hızlı bakıldığında şu an nerede olduğumuzu tek sayfada gösterir.

## Şu Anki Aşama

```text
v11 kapanış tamamlandı.
v12 stabilizasyon hazırlığı tamamlandı.
Sıradaki gerçek adım canlı sitede Preflight testidir.
```

## Ana Canlı Site

```text
https://alkam-mali.pages.dev
```

## İlk Çalıştırılacak Komut

```js
ALKAM_V12_PREFLIGHT_V1.test()
```

## Beklenen Temiz Sonuç

```text
ready: true
decision: "v12 stabilizasyonuna geçilebilir"
writeOpen: false
```

## Sonuç Kayıt Komutu

```js
ALKAM_V12_PREFLIGHT_EXPORT_V1.collect()
```

veya:

```text
Ana Dashboard > Sonuç Export > JSON İndir
```

## Temizse Sonraki Commit

```text
v12: stabilize dashboard and module loading
```

## Temiz Değilse Sonraki Commit

```text
fix: resolve v11 live test gaps before v12
```

## Ana Modüller

```text
alkam-dashboard-kurumsal-v11.js
alkam-v12-preflight-v1.js
alkam-v12-preflight-export-v1.js
alkam-v12-stabilizer-v1.js
alkam-canli-test-paketi-v11.js
alkam-cache-deploy-kontrol-v11.js
alkam-dashboard-gorunum-tercihi-v11.js
alkam-ai-asistan-merkezi-v11.js
alkam-supabase-write-gate-v10.js
```

## Canlı Dashboard Butonları

```text
AI Merkezi
Güvenilirlik
v12 Preflight
Sonuç Export
```

## Kesin Güvenlik Kuralları

```text
AI kayıt yapmaz.
Supabase yazma kapalıdır.
Cari ekstresi ana defterdir.
Banka hareketleri onay/doğrulama katmanıdır.
Moka United banka aktarımı cari tahsilatı sayılmaz.
Onaysız işlem yapılmaz.
Eski modüller kullanıcı onayı olmadan silinmez.
2026 Geçiş sekmesi/kavramı oluşturulmaz.
```

## Kısa Karar Ağacı

```text
Preflight ready true  -> v12 stabilizasyonuna geç.
Preflight ready false -> eksikleri düzelt.
writeOpen true        -> dur, Supabase Write Gate kapat.
failed/risky > 0      -> ilgili modülü ayrı test et.
```

## Şu An Yapılmayacaklar

```text
Supabase yazma açmak
Cari hareketi oluşturmak
Tahakkuk oluşturmak
Tahsilat oluşturmak
Banka hareketi işlemek
Moka kaydı otomatik işlemek
AI ile kayıt oluşturmak
Eski modül silmek
```
