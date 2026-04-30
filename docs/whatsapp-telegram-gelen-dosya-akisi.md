# WhatsApp / Telegram Gelen Dosya Akisi

Bu not, Moka/POS ve banka ekstresi belgelerinin kullanici tarafindan programa dosya secilerek degil, WhatsApp veya Telegram'a gonderilerek sisteme islenmesi icin hedef mimariyi tarif eder.

## Hedef

Kullanici Moka POS ekran goruntusunu, banka ekstresi goruntusunu, PDF veya Excel dosyasini belirlenen WhatsApp isletme hattina ya da Telegram botuna gonderir. Program bu gelen mesaji otomatik alir, belgeyi OCR/AI isleme kuyruğuna koyar, aday kayit uretir ve kullaniciya onay merkezinde sunar.

## Temel Akis

1. Kullanici belgeyi WhatsApp isletme hattina veya Telegram botuna gonderir.
2. WhatsApp Business API veya Telegram Bot API webhook'u mesaji ALKAM sistemine iletir.
3. Cloudflare Worker veya backend servis mesaj metnini ve dosya bilgisini alir.
4. Dosya guvenli belge deposuna kaydedilir.
5. Dosya turu belirlenir: Moka/POS, banka ekstresi, Excel, PDF, ekran goruntusu veya bilinmeyen belge.
6. OCR/AI servisi belge metnini ve finans alanlarini cikarir.
7. Sistem dogrudan muhasebe kaydi olusturmaz; aday kaydi `moka-pos-mutabakat.html` onay ekranina dusurur.
8. Kullanici aday kaydi inceler, gerekirse duzeltir ve onaylar.
9. Onaydan sonra cari hareketi, banka hesabı hareketi, POS beklenen alacagi ve denetim izi kayitlari olusur.

## Gereken Teknik Parcalar

- WhatsApp Business Cloud API veya resmi WhatsApp Business entegrasyonu
- Telegram Bot API webhook'u
- Cloudflare Worker veya benzeri backend endpoint
- Dosya saklama alani: Cloudflare R2, Supabase Storage veya benzeri
- OCR/AI isleme servisi
- Aday belge kuyruğu
- Onay merkezi
- Audit log ve mukerrer belge kontrolu

## Guvenlik Kurallari

- WhatsApp/Telegram'dan gelen hicbir belge otomatik kesin kayda donusmez.
- Her belge icin kaynak kanal, gonderen numara/kullanici, mesaj zamani, dosya hash'i ve isleme sonucu saklanir.
- Ayni dosya hash'i tekrar gelirse mukerrer aday olarak isaretlenir.
- AI/OCR sonucu, nihai muhasebe kaydi degil sadece oneridir.
- Cari ve hesap hareketi ancak kullanici onayi ile olusur.
- Yuksek guvenli eslesmeler tek tikla onaylanabilir; yine de onay aksiyonu kullanici tarafindan verilir.

## Statik Pages Siniri

Cloudflare Pages uzerindeki yalnizca HTML/JS ekran, WhatsApp veya Telegram mesajlarini dogrudan alamaz. Bu nedenle gelen mesajlari yakalamak icin bir webhook servisi gerekir. Pages ekrani onay, duzeltme, mutabakat ve raporlama arayuzu olarak calisir; mesaj alma isi Worker/backend tarafinda yapilir.

## Moka/POS Is Kurali

- Moka/POS tahsilati once beklenen POS alacagi olarak kaydedilir.
- Tutar taksit sayisina bolunur.
- Ilk taksit islem tarihinden 40 gun sonra beklenen banka yatışı olarak planlanir.
- Diger taksitler aylik vadelenir.
- Banka ekstresi WhatsApp/Telegram veya baska kanal uzerinden geldiginde beklenen yatışlarla eslestirilir.
- Eslesen kayit onaya sunulur.
- Onaydan sonra cari tahsilat ve banka hesabi hareketi tamamlanir.
