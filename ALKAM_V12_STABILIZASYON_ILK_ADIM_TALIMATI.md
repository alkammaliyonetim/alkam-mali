# ALKAM Mali - v12 Stabilizasyon İlk Adım Talimatı

Bu talimat v12 stabilizasyonuna başlarken yapılacak ilk pratik adımı netleştirir.

## İlk Adımın Amacı

v11 sonunda oluşan modül yükleme zincirini bozmadan, canlı test ve güvenlik kontrollerini tek standart akışa almak.

## Önce Çalıştırılacak Canlı Komutlar

Canlı sitede sırasıyla:

```js
ALKAM_CACHE_DEPLOY_KONTROL_V11.test()
ALKAM_DASHBOARD_KURUMSAL_V11.test()
ALKAM_CANLI_TEST_PAKETI_V11.test()
ALKAM_V12_STABILIZER_V1.test()
ALKAM_SUPABASE_WRITE_GATE_V10.test()
```

## Beklenen Temiz Sonuç

```text
Cache Kontrol: missing 0
Dashboard: v12StabilizerLoader true
Canlı Test: failed 0
Canlı Test: risky 0
v12 Stabilizer: status Stabil
Supabase Write Gate: writeAllowed false
```

## Eğer Eksik Çıkarsa

Eksik çıkan modül önce ayrı test edilir.

Örnek:

```js
ALKAM_DASHBOARD_GORUNUM_TERCIHI_V11.test()
ALKAM_CACHE_DEPLOY_KONTROL_V11.test()
ALKAM_V12_STABILIZER_V1.test()
```

## İlk Teknik Refactor Sınırı

Bu ilk adımda yapılmayacaklar:

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

## İlk Teknik Refactor'da Yapılabilecekler

```text
Modül yükleme sırasını sadeleştirmek
Test komutlarını toparlamak
Dashboard butonlarını sade tutmak
Görünüm seçiciyi korumak
Cache kontrolünü güncel tutmak
v12 Stabilizer raporunu güçlendirmek
```

## Karar

Canlı test temizse v12 ilk teknik commit mesajı:

```text
v12: stabilize dashboard and module loading
```

Canlı test temiz değilse commit mesajı:

```text
fix: resolve v11 live test gaps before v12
```

## Her Güncelleme Sonrası Verilecek Rapor

```text
Yapılanlar
Kalanlar
Kontrol Ettiklerim
Risk / Not
```

## Değişmez Güvenlik Cümlesi

```text
AI kayıt yapmaz, Supabase yazma kapalıdır, cari ekstresi ana defterdir, Moka United banka aktarımı cari tahsilatı sayılmaz.
```
