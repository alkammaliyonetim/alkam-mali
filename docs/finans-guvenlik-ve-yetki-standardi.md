# ALKAM Finans Guvenlik ve Yetki Standardi

Bu standart, programin uluslararasi muhasebe/finans operasyon kalitesine yaklasmasi icin uygulanacak minimum kontrol katmanidir.

## Roller

- `admin`: Tum ayarlar, entegrasyonlar, yedekleme ve kullanici yonetimi.
- `muhasebe_operatoru`: Aday belge olusturma, duzeltme ve eslestirme hazirlama.
- `onayci`: Finansal kaydi kesinlestirme, banka/cari onayi verme.
- `sadece_goruntuleyen`: Rapor ve kayit goruntuleme; finansal mutasyon yapamaz.

## Ana Kurallar

- OCR/AI sonucu kesin kayit degildir; sadece adaydir.
- Cari ve banka hesabina etki eden her islem kullanici onayi ister.
- Tek tik onay sadece yuksek guvenli eslesmelerde calisir.
- Silme, iptal ve toplu islem ayrica sebep ve log ister.
- Ayni belge hash'i, ayni Moka ref no veya ayni banka ref no ikinci kez kesin kayda donusemez.
- Her kayit kaynak belge, kaynak kanal ve kullanici bilgisiyle izlenir.

## Finansal Mutasyon Matrisi

| Islem | Operator | Onayci | Admin |
| --- | --- | --- | --- |
| Aday belge olusturma | Evet | Evet | Evet |
| Aday belge duzeltme | Evet | Evet | Evet |
| Moka/banka eslestirme | Evet | Evet | Evet |
| Cari tahsilat kesinlestirme | Hayir | Evet | Evet |
| Banka hesabi hareketi kesinlestirme | Hayir | Evet | Evet |
| Toplu onay | Hayir | Evet | Evet |
| Entegrasyon ayari | Hayir | Hayir | Evet |
| Veri silme | Hayir | Hayir | Evet |

## Denetim Kaydi

Denetim kaydi kullanici ana ekraninda kalabalik olusturmaz; ancak arka planda saklanir. Gerektiginde yedek/rapor olarak disari alinabilir.

Kaydedilecek alanlar:

- islem id
- islem tipi
- tarih/saat
- kullanici/rol
- kaynak kanal
- kaynak belge
- eski deger
- yeni deger
- AI/OCR guven puani
- onay/red sebebi

## Entegrasyon Kontrolleri

- WhatsApp/Telegram webhooklari `X-ALKAM-Webhook-Secret` ile korunur.
- Cloudflare KV binding adi: `ALKAM_INBOUND_KV`.
- OCR endpoint harici servise baglanirsa `ALKAM_OCR_ENDPOINT` ve `ALKAM_OCR_TOKEN` kullanilir.
- WhatsApp medya indirme icin `WHATSAPP_ACCESS_TOKEN` gerekir.
- Telegram medya indirme icin `TELEGRAM_BOT_TOKEN` gerekir.

## Kabul Kriteri

Bir finansal belge uc asamadan gecmeden kesin kayit olamaz:

1. Kaynak belge alindi.
2. Aday kayit ve eslesme olustu.
3. Yetkili kullanici onay verdi.

Bu uc adim tamamlandiginda sistem cari ve hesap islemini yapabilir.
