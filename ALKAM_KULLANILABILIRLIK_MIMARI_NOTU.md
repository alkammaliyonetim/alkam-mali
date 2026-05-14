# ALKAM Kullanilabilirlik ve Mimari Notu

Tarih: 2026-05-14

## Mevcut karar

Cari ekraninda tek sahiplik ilkesi uygulanacak. Cari detayini ana uygulamadaki `renderSelectedCariDetail` uretir; recovery veya loader dosyalari cari detay HTML'ini yeniden yazmaz.

## Devre disi birakilan eski mudahale dosyalari

- `alkam-cari-detail-render-lock-v1.js`
- `alkam-cari-detail-render-lock-v2.js`
- `alkam-cari-history-fallback-v1.js`
- `alkam-v12-wide-layout-fix-v1.js`

Bu dosyalar artik no-op durumundadir. Eski cache veya eski loader bu dosyalari cagirse bile DOM'u degistirmez.

## Aktif sorumluluklar

- `alkam-cari-safe-loader-v1.js`: Sadece cari cekirdek kontrol dosyasini yukler.
- `alkam-cari-core-v4.js`: Kaynak kolonu, Bakiye B/A ve ekstre kontrol ozetini denetler.
- `alkam-emergency-recovery-v2.js`: Sadece layout ve scroll stabilizasyonu yapar; veri render etmez.
- `_worker.js`: Eski render-lock/layout dosya yollarina no-store no-op yanit verir.

## Finans standardi

- Bakiye dili: sadece `BAKIYE B`, `BAKIYE A`, `BAKIYE 0`.
- Cari ozet ve detay ayni veri motorundan beslenmelidir.
- Local/demo veri canli veri gibi sunulmamalidir.
- Kaynak kolonu her cari hareketinde korunmalidir.

## Gelistirme kurali

Yeni cari detay veya liste duzeltmesi eklenecekse once mevcut `renderSelectedCariDetail` ve hesaplama fonksiyonlari iyilestirilmelidir. Yeni fallback renderer, interval ile DOM yazan patch veya ikinci detay sahibi eklenmemelidir.
