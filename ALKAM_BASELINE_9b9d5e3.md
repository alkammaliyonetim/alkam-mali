# ALKAM Mali Baseline

Bu çalışma dalı çalışan Cloudflare production sürümünden başlatıldı.

- Base commit: `9b9d5e3d0f6a3ea53af7fe774dcd7ba23c6b56bb`
- Base deployment: `c1021856.alkam-mali.pages.dev`
- Branch: `from-production-9b9d5e3-proof`
- Kural: Mevcut çalışan gövde bozulmadan küçük ve kontrollü geliştirme yapılacak.

## Korunacaklar

- Cari ekstresi ana defter mantığı
- Kaynak kolonu
- Bakiye B / Bakiye A gösterimi
- Düzenle / Sil / Yazdır / Excel işlevleri
- Onay Merkezi mantığı
- Eski özelliklerin izinsiz silinmemesi

## İlk küçük geliştirme hedefi

Cari ekstre hareket tablosunda görüntüleme sırası en yeni kayıt en üstte olacak şekilde düzenlenecek.
Hesaplama sırası bozulmayacak; bakiye hesabı kronolojik mantıkla korunacak.
