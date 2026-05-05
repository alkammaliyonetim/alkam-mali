# ALKAM v12 Cari Operasyon Canlı Kontrol

Bu not cari operasyon düzeltmesinin canlıda doğrulanması için eklendi.

## İlgili dosyalar

- alkam-v12-cari-operasyon-fix-v1.js
- alkam-v12-tahsilat-hesap-fix-v1.js
- _worker.js

## Beklenen kontroller

```js
ALKAM_V12_CARI_OPERASYON_FIX_V1.test()
ALKAM_V12_TAHSILAT_HESAP_FIX_V1.test()
```

## Beklenen sonuç

```text
sticky: true
enriched: 1 veya daha fazla
active: true
accounts: 10 veya daha fazla
```

## Ekranda beklenenler

- Cari detayda sabit operasyon başlığı görünür.
- Dinamik cari listesinde Son Tahakkuk ve Son Tahsilat kutuları görünür.
- Boş sol panel metrikleri gizlenir.
- Tahsilat Gir ekranında hesap listesi genişler.

## Güvenlik

Veri yazmaz. Supabase yazma açılmaz. AI kayıt yapmaz.
