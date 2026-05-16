# İstasyonALKAM Bot İş Akışı

## Amaç

İstasyonALKAM Bot; kullanıcıdan gelen doğal dil mesajlarını, ekran görüntülerini, banka ekstrelerini, dekontları ve evrakları okuyarak ALKAM Mali içinde onaya sunulacak işlem önerilerine dönüştürür.

Hiçbir kayıt kullanıcı onayı olmadan kesin cari ekstresine, banka hesabına veya Moka hesabına işlenmez.

## Örnek Doğal Dil İşlemi

Kullanıcı mesajı:

```text
Ungan Mobilya haziranın son günü 100.000 TL ödeme sözü verdi.
```

Botun çıkarması gereken bilgiler:

```text
Cari: Ungan Mobilya
İşlem türü: Ödeme sözü
Tutar: 100.000 TL
Vade / alarm tarihi: Haziran ayının son günü
Durum: Onay bekliyor
Hedef: Cari kartı + ödeme sözü/alarm kaydı
```

## İşlem Onay Akışı

1. Kullanıcı mesaj, ekran görüntüsü, dekont, banka ekstresi veya evrak gönderir.
2. Bot veriyi okur.
3. Bot işlem önerisi oluşturur.
4. Öneri Onay Merkezi’ne düşer.
5. Kullanıcı onaylarsa ilgili modüle işlenir.
6. Kullanıcı reddederse kayıt reddedildi olarak kalır.
7. Emin olunmayan kayıtlar kesinlikle otomatik işlenmez.

## Desteklenecek Girdi Türleri

```text
Doğal dil mesajı
Ekran görüntüsü
Dekont
Banka ekstresi
PDF
Excel
Fotoğraf
Telegram mesajı
```

## İşlem Türleri

```text
Ödeme sözü
Tahsilat sözü
Banka tahsilatı
Banka ödemesi
Dekont eşleştirme
Moka tahsilatı
Moka banka aktarımı
Cari notu
Evrak kaydı
Fatura / makbuz bilgisi
SGK / vergi evrakı
```

## Ödeme Sözü Kaydı Alanları

```text
ID
Cari adı
Cari eşleşme güven puanı
Tutar
Vade tarihi
Hatırlatma tarihi
Açıklama
Kaynak mesaj / dosya
Durum: Onay bekliyor / Onaylandı / İşlendi / Reddedildi / Vadesi geçti
Oluşturulma tarihi
Onay tarihi
İşlenme tarihi
```

## Alarm Kuralı

Ödeme sözü için alarm kurulacak.

Varsayılan hatırlatmalar:

```text
Vade tarihinden 3 gün önce
Vade tarihinde sabah
Vade geçtiyse ertesi gün
```

Örnek:

```text
Ungan Mobilya 30 Haziran 2026 tarihinde 100.000 TL ödeme sözü verdi.
```

Sistem önerisi:

```text
30 Haziran 2026 ödeme sözü kaydı oluştur.
27 Haziran 2026 hatırlatma kur.
30 Haziran 2026 ödeme günü alarmı kur.
1 Temmuz 2026 ödeme gelmediyse vadesi geçti uyarısı üret.
```

## Onay Merkezi Görünümü

Onay ekranında şunlar gösterilecek:

```text
Önerilen cari
İşlem türü
Tutar
Vade tarihi
Alarm tarihi
Kaynak
Güven puanı
Eşleşme sebebi
Orijinal mesaj / dosya bağlantısı
```

## Güvenlik Kuralları

```text
Yanlış cariye otomatik kayıt yok.
Dekont otomatik kesin kayıt olmaz.
Ekran görüntüsü otomatik kesin kayıt olmaz.
Banka ekstresi onaysız kesin kayıt olmaz.
Ödeme sözü onaysız cari karta işlenmez.
Alarm kurulacaksa önce öneri onaya düşer.
Kullanıcı onayı olmadan cari ekstresi değişmez.
```

## Telegram Bot Fazı

Telegram’dan gelen mesajlar da aynı akışa girecek.

Örnek Telegram mesajları:

```text
#odemesozu Ungan Mobilya haziranın son günü 100000 TL ödeyecek
#dekont Ungan Mobilya tahsilat dekontu
#banka Yapı Kredi ekstre
#moka United tahsilat bildirimi
```

## Modül Sırası

1. Ödeme Sözü / Tahsilat Sözü veri modeli
2. Onay Merkezi ödeme sözü kutusu
3. Cari kartında ödeme sözleri sekmesi
4. Alarm / hatırlatma listesi
5. Telegram gelen mesaj parse katmanı
6. Dekont / ekran görüntüsü OCR veya manuel okuma önerisi
7. Banka / Moka / Cari eşleştirme entegrasyonu
