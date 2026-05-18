# Otomasyon Denetim Envanteri

Bu dosya mevcut Otomasyon Kontrol Merkezi içindeki özellikleri denetlemek için hazırlanmıştır.

Yeni otomasyon kutusu eklenmeyecek. Mevcut düğmeler korunacak.

## Mevcut Otomasyonlar

| No | Anahtar | Başlık | Risk | Durum |
|---:|---|---|---|---|
| 1 | monthlyAccrual | Aylık Muhasebe Ücreti Tahakkuku | Yüksek | İlk bağlanacak |
| 2 | retroAccrual | Geçmiş Ay Tahakkuk Tamamlama | Yüksek | Beklemede |
| 3 | bankAutoMatch | Banka Hareketi Otomatik Eşleştirme | Orta | Beklemede |
| 4 | bankAutoPost | Banka Hareketini Otomatik Cari İşleme | Kritik | Beklemede |
| 5 | approvalAutoConfirm | %100 Emin Eşleşmeyi Otomatik Onaylama | Kritik | Kapalı kalacak |
| 6 | mokaAutoCollection | Moka United Tahsilatını Otomatik Cari İşleme | Kritik | Beklemede |
| 7 | mokaAutoSettlement | Moka United Banka Aktarımını Otomatik İşleme | Kritik | Beklemede |
| 8 | invoiceAutoCreate | Fatura / Defter / Dijital Defter Otomatik Tahakkuk | Yüksek | Beklemede |
| 9 | importAutoProcess | İçe Aktarılan Dosyayı Otomatik İşleme | Yüksek | Beklemede |
| 10 | bulkAutoUpdate | Toplu Otomatik Güncelleme | Kritik | Kapalı kalacak |

## Güncel Teknik Tespit

- `index.html` içinde gömülü Otomasyon Kontrol Merkezi zaten vardır.
- Bu gömülü panel 10 otomasyon düğmesini gösterir.
- Düğmeler varsayılan kapalıdır.
- Düğmeler `ALKAM_AUTOMATION_FLAGS` bayraklarını yayınlar.
- `ALKAM_REQUIRE_APPROVAL_FOR_FINANCIAL_MUTATION = true` kuralı aktiftir.
- `alkam-otomasyon-kontrol.js` ayrıca harici koruma katmanı olarak vardır.
- Harici koruma katmanı bilinen fonksiyon adlarını sarıp kapalıysa onay bekleyenlere alacak şekilde tasarlanmıştır.
- Ana program içinde ayrıca gömülü otomasyon paneli olduğu için ikinci panel eklenmeyecek.
- Öncelik: mevcut gömülü panelin 10 düğmesini gerçek işlem fonksiyonlarına güvenli şekilde bağlamak.

## Denetim Kuralı

Her otomasyon için önce şu sorular cevaplanacak:

- Sadece açık/kapalı bayrağı mı değiştiriyor?
- Arkasında gerçek işlem fonksiyonu var mı?
- Kayıt yazıyorsa nereye yazıyor?
- Mükerrer kontrolü var mı?
- Onay Merkezi'nden geçiyor mu?
- Dashboard toplamlarını bozuyor mu?
- Kasa/Banka/Moka bakiyesini etkiliyor mu?
- Sayfa yenilenince veri korunuyor mu?

## Stres Testi

Her otomasyon ayrı ayrı şu testlerden geçmeden otomatik açık yapılmayacak:

- Boş veri testi
- Tek cari testi
- Çok cari testi
- Mevcut kayıt varken tekrar çalıştırma testi
- Mükerrer kayıt testi
- Pasif/silinmiş cari testi
- Eksik tutar testi
- Sayfa yenileme testi
- Yedek al / geri yükle testi
- Dashboard toplam kontrolü

## İlk Öncelik

1. `monthlyAccrual` mevcut düğmesine Mayıs 2026 tahakkuk akışı bağlanacak.
2. Bu akış önce manuel/onaylı çalışacak.
3. Stres testi geçmeden otomatik açık hale getirilmeyecek.

## İkinci Öncelik

Kasa / Banka / Çek / Senet / Moka mevcut Hesaplar modülü üzerinden denetlenecek.

Yeni hesap ekranı açılmayacak; mevcut hesap işleyişi sağlamlaştırılacak.
