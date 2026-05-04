# ALKAM MALİ İstasyON - Yapay Zeka Muhasebe Roadmap v10

Bu not, muhasebede yapay zeka kullanım hedeflerini ALKAM Mali projesinin yol haritasına eklemek için oluşturuldu.

## Hedef

ALKAM Mali İstasyON sadece cari / tahsilat / banka kontrol programı olarak kalmayacak. Zamanla muhasebe ofisinin iş yükünü azaltan, hata yakalayan ve rapor üreten yapay zeka destekli operasyon merkezine dönüşecek.

## Eklenecek AI Başlıkları

### 1. Otomatik Belge İşleme

Amaç:

- Manuel fiş girişi azaltılacak.
- Fatura, makbuz, dekont, banka ekstresi, Luca çıktısı gibi belgeler okunacak.
- Belge türü, tarih, tutar, firma, vergi no, açıklama ve dönem bilgisi ayrıştırılacak.

Güvenlik:

- AI doğrudan kayıt yapmayacak.
- Öneri üretecek.
- Emin olunmayan kayıtlar onaya düşecek.

### 2. Hızlı Raporlama

Amaç:

- Saatler süren raporlar dakikalar içinde hazırlanacak.
- Cari, tahsilat, tahakkuk, banka, Moka, beyanname ve firma bazlı raporlar otomatik özetlenecek.

Örnek raporlar:

- Bu ay tahsilat durumu
- Borçlu cari listesi
- Riskli mükellefler
- Tahakkuk eksikleri
- Banka onay bekleyenler
- Moka mutabakatı
- Aylık yönetim özeti

### 3. Hatalı Kayıt Tespiti

Amaç:

- AI ve kural motoru birlikte çalışarak hatalı veya şüpheli kayıtları bulacak.

Kontroller:

- Mükerrer kayıt
- Kaynak boş kayıt
- Açıklama eksik kayıt
- Tutar/tarih tutarsızlığı
- Yanlış cari eşleşmesi
- Moka aktarımının cari tahsilatı sayılması
- Banka hareketinin onaysız işlenmesi
- Tahakkuk eksik veya fazla kayıt

### 4. Vergi Savunması ve Açıklama Taslakları

Amaç:

- Vergi dairesi / SGK / resmi kurum yazıları için hızlı taslak üretmek.
- Savunma, açıklama, dilekçe ve bilgi notu taslaklarını hazırlamak.

Güvenlik:

- Nihai metni kullanıcı kontrol edecek.
- Hukuki/mali sorumluluk kullanıcı ve meslek mensubunda kalacak.
- AI sadece taslak ve kontrol listesi üretecek.

### 5. Firma İçi Özel AI Asistanı

Amaç:

- ALKAM Mali içinde özel ofis asistanı oluşturmak.
- Mükellef kartları, cari hareketler, banka onayları, tahakkuklar ve iş akışları üzerinden cevap verecek.

Örnek sorular:

- Bu ay hangi mükelleflerden tahsilat yapılmalı?
- Hangi cariler riskli?
- Kimde tahakkuk eksik?
- Banka onay bekleyenlerde kritik kayıt var mı?
- Moka mutabakatında fark var mı?
- Bu mükellefin son tahsilatı ne zaman?

## ALKAM Kurallarına Bağlantı

Bu AI özellikleri mevcut güvenilirlik kurallarını bozmayacak:

- Cari ekstresi ana defterdir.
- Banka hareketleri doğrulama ve onay katmanıdır.
- Onaysız işlem yapılmaz.
- Moka United banka aktarımı cari tahsilatı sayılmaz.
- Emin olunmayan her şey onaya düşer.
- AI öneri verir, kullanıcı onaylamadan kayıt yapmaz.

## Geliştirme Sırası

1. AI hata tespit paneli
2. Belge okuma / belge ön izleme merkezi
3. AI rapor özeti
4. Mükellef dijital kartı içinde AI soru-cevap
5. Vergi savunması / dilekçe taslak modülü
6. Luca raporları üzerinden otomatik analiz

## Not

Bu başlıklar ALKAM Mali projesinin orta vadeli yapay zeka roadmapine eklenmiştir. Öncelik yine güvenilirlik, ana defter doğruluğu ve onay mekanizmasıdır.
