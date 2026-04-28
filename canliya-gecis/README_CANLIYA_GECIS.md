# ALKAM canliya gecis

Bu paket ALKAM Mali Musavirlik panelini yeni cari extrelerle temiz kullanima baslatmak icin hazirlandi.

## Sira

1. Canli programi ac: https://alkam-mali.pages.dev/
2. GitHub'a `canliya-gecis/temiz-baslangic-v2.html` dosyasini ekle.
3. Cloudflare Pages yayini bittikten sonra ac:
   https://alkam-mali.pages.dev/canliya-gecis/temiz-baslangic-v2.html
4. Once `Yedegi Indir` butonuna bas.
5. Sonra `Cari Extre Kaynaklarini Temizle` butonuna bas.
6. Onay icin `CARI` yaz.
7. Programa don ve Ctrl+F5 ile yenile.
8. Yeni cari extrelerini yuklemeye basla.

## Ne temizlenir?

- Cari listeleri
- Cari hareketleri
- Tahakkuk/tahsilat kaynaklari
- Belge/import/onay adaylari
- Eski extre kaynaklari

## Ne korunur?

- Login/session bilgileri
- Tema ve genel ayarlar
- Daha once alinan yedekler
- Supabase auth anahtarlari

## Supabase notu

Bu sayfa tarayicidaki yerel veriyi temizler. Eski cariler Supabase tablosundan geliyorsa, Supabase tarafinda ayrica yedekli temizlik gerekir. Bunun icin `supabase-cari-reset-notlari.sql` dosyasini dogrudan calistirma; once tablo adlarini kontrol et.

## Canli kullanim kontrol listesi

- Dashboard cari sayisi dogru gorunuyor.
- Cari kartinda acilis bakiyesi dogru.
- Tahakkuk ve tahsilat ayri satirlar olarak gorunuyor.
- Tahsilat kasa/banka hesabina da isliyor.
- Mukkerrer tahakkuk olusmuyor.
- Yedek dosyasi indirilebiliyor.
- Program yenilendiginde veriler kaybolmuyor.
