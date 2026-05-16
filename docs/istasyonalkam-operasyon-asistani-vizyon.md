# İstasyonALKAM Operasyon Asistanı Vizyonu

## Ana Amaç

İstasyonALKAM Bot yalnızca banka ekstresi işleyen bir bot değildir.

Amaç; muhasebe ofisinde yapılan günlük işleri otomasyona bağlamak, kullanıcının doğal dil mesajı, evrak, dekont, ekran görüntüsü, banka ekstresi, Moka bildirimi veya belge gönderdiğinde sistemin bunları okuyup işlem önerisine dönüştürmesidir.

Kullanıcıya sadece tek tık onay kalacaktır.

## Temel Kural

Hiçbir işlem kullanıcı onayı olmadan kesin kayıt olmayacaktır.

```text
Oku
Anla
Öner
Onaya sun
Kullanıcı onaylarsa işle
```

## Botun Okuyacağı Girdiler

```text
Doğal dil mesajı
Telegram mesajı
Ekran görüntüsü
Dekont
Banka ekstresi
Moka bildirimi
Fatura / makbuz
PDF
Excel
Fotoğraf
Cari notu
Vergi / SGK evrakı
```

## Botun Algılayacağı Bilgiler

```text
Cari adı
Tutar
Tarih
Vade tarihi
İşlem türü
Banka hesabı
Moka ilişkisi
Dekont / belge türü
Tahsilat mı ödeme mi
Ödeme sözü mü cari notu mu
Alarm gerekiyor mu
Güven puanı
Eşleşme sebebi
```

## İşlem Türleri

```text
Ödeme sözü
Tahsilat sözü
Cari tahsilat
Cari ödeme
Banka ekstresi işlemi
Dekont eşleştirme
Moka tahsilatı
Moka banka aktarımı
Cari notu
Evrak kaydı
Fatura bilgisi
SGK evrakı
Vergi evrakı
Görev / takip kaydı
```

## Örnek Kullanım

Kullanıcı mesajı:

```text
Ungan Mobilya haziranın son günü 100.000 TL ödeme sözü verdi.
```

Sistem önerisi:

```text
Cari: Ungan Mobilya
İşlem türü: Ödeme sözü
Tutar: 100.000 TL
Vade: Haziran ayının son günü
Alarm: Evet
Durum: Onay bekliyor
```

Kullanıcı onaylarsa:

```text
Cari kartına ödeme sözü kaydı eklenir.
Alarm / hatırlatma kaydı oluşturulur.
Vade geldiğinde uyarı üretilir.
Ödeme gerçekleşirse kapatılır.
```

## Onay Merkezi Mantığı

Tüm bot önerileri önce Onay Merkezi’ne düşer.

Onay Merkezi’nde gösterilecek alanlar:

```text
Önerilen cari
İşlem türü
Tutar
Tarih / vade tarihi
Alarm tarihi
Kaynak belge / mesaj
Güven puanı
Eşleşme sebebi
Önerilen işlem
Onayla
Reddet
Düzelt ve Onayla
```

## Öğrenme Mantığı

Sistem kullanıcı onaylarından öğrenir.

```text
Onaylanan cari eşleşmeleri öğrenilir.
Reddedilen eşleşmeler tekrar önerilmez.
Açıklama kalıpları tanınır.
Cari isim kısaltmaları öğrenilir.
Banka açıklama formatları öğrenilir.
Moka tahsilat kalıpları öğrenilir.
Tekrarlayan evrak türleri öğrenilir.
```

## Kesin Güvenlik Kuralları

```text
Onaysız cari ekstresi değişmez.
Onaysız banka hareketi kesinleşmez.
Onaysız Moka kaydı kapanmaz.
Onaysız dekont işlenmez.
Onaysız ödeme sözü cari karta eklenmez.
Onaysız alarm aktif görev haline gelmez.
Yanlış cariye otomatik kayıt yapılmaz.
Emin olunmayan işlem onaya düşer.
Her işlemde kaynak belge / mesaj bağlantısı saklanır.
Her işlem loglanır.
```

## Uygulama Fazları

### Faz 1 - İşlem Öneri Merkezi

```text
Doğal dil mesajından işlem önerisi çıkar.
Ödeme sözü / tahsilat sözü kayıt modeli oluştur.
Onay Merkezi’ne düşür.
```

### Faz 2 - Cari Kartı Entegrasyonu

```text
Cari kartında ödeme sözleri / notlar / evraklar alanı oluştur.
Onaylanan öneriyi ilgili cariye bağla.
```

### Faz 3 - Alarm ve Takip

```text
Vade tarihi olan işlemler için alarm üret.
Yaklaşan vadeleri göster.
Vadesi geçenleri kırmızı uyarı yap.
```

### Faz 4 - Evrak ve Görsel Okuma

```text
Dekont, ekran görüntüsü, PDF ve Excel dosyalarından işlem önerisi çıkar.
Kaynak belgeyi işleme bağla.
```

### Faz 5 - Telegram Bot

```text
Telegram’dan gelen mesaj ve belgeleri Gelen Kutusu’na al.
Bot önerisi üret.
Onay Merkezi’ne gönder.
```

### Faz 6 - Öğrenen Eşleştirme

```text
Onaylanan eşleşmelerden öğren.
Cari adları, banka açıklamaları, Moka kalıpları ve evrak türleri için kural hafızası oluştur.
```

## Nihai Hedef

Kullanıcı işi söyler veya evrakı gönderir.
Sistem okur, anlar, önerir.
Kullanıcı tek tıkla onaylar.
Onaydan sonra kayıt doğru modüle işlenir.
