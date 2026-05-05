# ALKAM Mali - v12 Canlı Test Sonrası Aksiyon Planı

Bu dosya canlı site testleri tamamlandıktan sonra hangi sonuca göre ne yapılacağını belirler.

## 1. İlk Kontrol Kaynağı

Önce Cache / Deploy kontrol edilir:

```js
ALKAM_CACHE_DEPLOY_KONTROL_V11.test()
```

Beklenen:

```text
status: "Güncel"
missing: 0
expected: "v11.32 - 05.05.2026"
```

## 2. Ana Karar Kaynağı

Öncelikli karar komutu:

```js
ALKAM_V12_PREFLIGHT_V1.test()
```

## 3. Senaryo A - Her Şey Temiz

Beklenen sonuç:

```text
ready: true
decision: "v12 stabilizasyonuna geçilebilir"
writeOpen: false
exportBad: false
```

Aksiyon:

```text
Sonuç Export alınır ve v12 stabilizasyonuna geçilir.
```

Commit mesajı:

```text
v12: stabilize dashboard and module loading
```

Bu committe yapılacaklar:

```text
Dashboard loader zincirini sadeleştir.
Preflight / Export / Canlı Test akışını koru.
Görünüm tercihini koru.
Ana dashboard butonlarını sade tut.
Eski modülleri silme.
Veri yazma ekleme.
```

## 4. Senaryo B - Preflight Hazır Değil

Beklenen riskli sonuç:

```text
ready: false
```

Aksiyon:

```text
v12 refactor genişletilmez.
Eksik/riskli modül bulunur ve önce o düzeltilir.
```

Commit mesajı:

```text
fix: resolve v11 live test gaps before v12
```

Kontrol edilecekler:

```js
ALKAM_CACHE_DEPLOY_KONTROL_V11.test()
ALKAM_CANLI_TEST_PAKETI_V11.test()
ALKAM_DASHBOARD_KURUMSAL_V11.test()
ALKAM_V12_STABILIZER_V1.test()
ALKAM_V12_PREFLIGHT_EXPORT_V1.test()
```

## 5. Senaryo C - Supabase Yazma Açık

Riskli sonuç:

```text
writeOpen: true
```

veya:

```text
writeAllowed: true
```

Aksiyon:

```text
Tüm geliştirme durdurulur.
Önce Supabase Write Gate kapatılır.
Yazma kapısı false olmadan yeni modül eklenmez.
```

Kontrol komutu:

```js
ALKAM_SUPABASE_WRITE_GATE_V10.test()
```

Beklenen:

```text
writeAllowed: false
```

## 6. Senaryo D - Cache / Deploy Eksik

Riskli sonuç:

```text
missing > 0
```

Aksiyon:

```text
Önce sert yenileme yapılır.
Sonra Cache Deploy tekrar çalıştırılır.
Eksik loader varsa dashboard loader dosyası kontrol edilir.
```

Kontrol komutu:

```js
ALKAM_CACHE_DEPLOY_KONTROL_V11.test()
```

## 7. Senaryo E - Canlı Test Riskli

Riskli sonuç:

```text
failed > 0
```

veya:

```text
risky > 0
```

Aksiyon:

```text
Canlı Test içindeki tabloya bakılır.
Eksik modül ayrı test edilir.
Modül yüklenmiyorsa loader zinciri kontrol edilir.
```

## 8. Senaryo F - Sonuç Export Eksik

Riskli sonuç:

```text
exportBad: true
```

veya:

```text
Sonuç Export eksik
```

Aksiyon:

```text
Preflight sonucu temiz kabul edilmez.
Önce Sonuç Export modülü ve dashboard loader kontrol edilir.
```

Kontrol komutu:

```js
ALKAM_V12_PREFLIGHT_EXPORT_V1.test()
```

Beklenen:

```text
hasPreflight: true
hasLiveTest: true
hasWriteGate: true
```

## 9. Sonuç Export Alınacak

Her senaryoda sonuç export alınacak:

```js
ALKAM_V12_PREFLIGHT_EXPORT_V1.collect()
```

veya:

```text
Ana Dashboard > Sonuç Export > JSON İndir
```

## 10. Güvenli Geliştirme Sınırı

v12 stabilizasyonu sırasında yapılmayacaklar:

```text
Supabase yazma açmak
Cari hareketi oluşturmak
Tahakkuk oluşturmak
Tahsilat oluşturmak
Banka hareketi işlemek
Moka kaydı otomatik işlemek
AI ile kayıt oluşturmak
Eski modül silmek
2026 Geçiş kavramı oluşturmak
```

## 11. Değişmez Güvenlik Cümlesi

```text
AI kayıt yapmaz, Supabase yazma kapalıdır, cari ekstresi ana defterdir, Moka United banka aktarımı cari tahsilatı sayılmaz.
```
