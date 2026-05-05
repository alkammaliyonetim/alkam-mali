# ALKAM Mali - v12 Son Adım Uygulama Talimatı

Bu dosya v11.32 kapanışından v12 stabilizasyonuna geçmeden önce yapılacak son pratik işlemi tarif eder.

## Şu Anki Net Durum

```text
Kod hazırlığı tamamlandı.
Dokümantasyon tamamlandı.
Tek parça canlı test komutu hazırlandı.
Sıradaki gerçek adım canlı sitede test komutunu çalıştırmaktır.
```

## Canlı Site

```text
https://alkam-mali.pages.dev
```

## Yapılacak Son İşlem

1. Canlı site açılır.
2. Sayfa sert yenilenir.
3. Tarayıcı console açılır.
4. `ALKAM_V12_CANLI_TEST_HIZLI_KOPYA.md` içindeki tek parça komut yapıştırılır.
5. Console çıktısındaki summary kontrol edilir.

## Temiz Sonuç Şartı

```text
cacheOk: true
preflightReady: true
writeOpen: false
exportBad: false
writeAllowed: false
liveFailed: 0
liveRisky: 0
decision: "v12 stabilizasyonuna geçilebilir"
```

## Temizse Yapılacak Commit

```text
v12: stabilize dashboard and module loading
```

## Temiz Değilse Yapılacak Commit

```text
fix: resolve v11 live test gaps before v12
```

## Eksik Çıkarsa Bakılacak Dosyalar

```text
ALKAM_V12_CANLI_TEST_SONRASI_AKSIYON_PLANI.md
ALKAM_V12_PREFLIGHT_KULLANIM_REHBERI.md
ALKAM_V12_PREFLIGHT_SONUC_SABLONU.md
ALKAM_CANLI_TEST_KOMUTLARI_V11.md
```

## Kesin Yasaklar

```text
Supabase yazma açılmayacak.
Cari hareketi oluşturulmayacak.
Tahakkuk/tahsilat yazılmayacak.
Banka hareketi işlenmeyecek.
Moka kaydı otomatik işlenmeyecek.
AI ile kayıt oluşturulmayacak.
Eski modül silinmeyecek.
2026 Geçiş sekmesi/kavramı oluşturulmayacak.
```

## Değişmez Güvenlik Cümlesi

```text
AI kayıt yapmaz, Supabase yazma kapalıdır, cari ekstresi ana defterdir, Moka United banka aktarımı cari tahsilatı sayılmaz.
```

## Son Not

Bu noktadan sonra yeni dosya veya yeni modül eklemek yerine canlı test sonucu alınmalı ve çıkan sonuca göre ilerlenmelidir.
