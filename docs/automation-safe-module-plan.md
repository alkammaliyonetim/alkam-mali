# ALKAM Otomasyon Güvenli Modül Planı v1

Bu plan, Otomasyon Merkezi içindeki işlemleri programı bozmadan sınıflandırmak için hazırlanmıştır.

## Ana Kural

Otomasyonlar üç gruba ayrılır:

1. Güvenli modüller: Sadece izleme, kontrol, uyarı ve rapor üretir.
2. Onaylı modüller: Öneri üretir, kullanıcı onayı olmadan sonuç işlemi yapmaz.
3. Kapalı modüller: Yüksek risklidir, bu fazda aktif edilmeyecek.

## Güvenli ve Açık Kalabilecek Modüller

- İşlem izi ve log takibi
- Veri sağlık kontrolü
- Onay Merkezi kuyruk izleme
- Mükerrer kayıt uyarısı
- Kaynak kolonu eksik uyarısı
- Moka United izleme paneli
- Banka içe aktarma ön izleme
- Telegram gelen kayıt izleme

Bu modüller sadece bilgi gösterir. Cari, hesap veya ödeme hareketi oluşturmaz.

## Onaylı Kullanılacak Modüller

- Aylık ücret tahakkuk önerisi
- Geçmiş ay kontrol önerisi
- Banka eşleştirme önerisi
- Fatura veya defter tahakkuk önerisi
- Dosya içe aktarma ön okuma

Bu modüller sadece öneri üretmelidir. Son işlem kullanıcı onayından sonra yapılmalıdır.

## Kapalı Kalacak Modüller

- Banka hareketini doğrudan işleme
- Yüksek güven puanlı kaydı otomatik onaylama
- Moka tahsilatını doğrudan işleme
- Moka banka aktarımını doğrudan kapatma
- Toplu otomatik güncelleme

Bu modüller bu fazda açılmayacaktır.

## Hedef Entegrasyon

Otomasyon Merkezi içinde her modül için şu alanlar görünecek:

- Modül adı
- Grup: Güvenli, Onaylı, Kapalı
- Durum: Açık, Öneri Modu, Kapalı
- Risk seviyesi
- Açıklama
- Son kontrol sonucu

## Korunacak Kurallar

- Kullanıcı onayı esastır.
- Bilinmeyen cari otomatik açılmaz.
- Ana veri silinmez.
- Önce öneri, sonra kontrol, sonra onay yaklaşımı korunur.
- Otomasyon check testi geçmeye devam etmelidir.

## İlk Uygulama Kararı

İlk PR'da sadece güvenli izleme ve öneri modülleri görünür hale getirilecek. Yüksek riskli modüller kapalı kalacak.
