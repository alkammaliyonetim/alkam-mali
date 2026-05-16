# Telegram Evrak İşleme Merkezi v1

## Amaç

Telegram üzerinden gelen yazı, ekran görüntüsü, dekont, PDF, Excel ve diğer evrakların ALKAM Mali içinde kontrollü şekilde işlenmesi.

## Temel Akış

```text
Telegram mesajı / dosya / ekran görüntüsü gelir
↓
Program geleni okur veya kullanıcının yüklediği içeriği işler
↓
Cari adayı, tutar, tarih, işlem tipi ve açıklama tahmin edilir
↓
Onay Merkezi'ne öneri olarak düşer
↓
Kullanıcı tek tıkla onaylar veya reddeder
↓
Onaydan sonra ilgili cari / kasa / banka / Moka / takip kaydı oluşur
```

## Kabul Edilecek Girdi Türleri

```text
Yazılı Telegram mesajı
Ekran görüntüsü
Dekont görseli
PDF evrak
Excel dosyası
CSV dosyası
Banka ekstresi görseli
Ödeme sözü mesajı
Tahsilat bildirimi
Masraf / gider fişi
Moka / POS bildirimi
```

## Çıkarılacak Alanlar

```text
Cari adayı
Tutar
Tarih
İşlem tipi
Kaynak
Açıklama
Belge türü
Güven puanı
Eşleşme sebebi
Dosya adı / belge referansı
```

## İşlem Tipleri

```text
Tahsilat
Tahakkuk
Ödeme sözü
Gider / masraf
Banka hareketi
Moka tahsilatı
Moka banka aktarımı
Cari bilgi güncelleme
Evrak arşiv kaydı
```

## Güvenlik Kuralları

```text
Onaysız hiçbir finansal hareket cariye işlenmez.
Onaysız kasa / banka / Moka hareketi oluşmaz.
Yanlış cariye kayıt atılmasını önlemek için güven puanı gösterilir.
Emin olunmayan kayıt Onay Merkezi'nde bekler.
Kullanıcının onayı olmadan eski kayıt silinmez.
Dosya işleme sonucu önce ön izleme olarak gösterilir.
```

## Onay Merkezi Kartında Görünecekler

```text
Önerilen cari
Alternatif cari adayları
Tutar
Tarih
İşlem tipi
Kaynak: Telegram / Evrak / Excel / Görsel
Güven puanı
Eşleşme sebebi
Orijinal mesaj / dosya referansı
Onayla
Reddet
Düzelt ve Onayla
```

## İlk Aşama

```text
1. Telegram Gelen Kutusu içine dosya/evrak kayıt alanı ekle.
2. Kullanıcının manuel olarak mesaj, dosya adı ve açıklama girebileceği bir test paneli oluştur.
3. Bu panel öneriyi Onay Merkezi'ne düşürsün.
4. Finansal kayıt yine sadece onaydan sonra oluşsun.
```

## İkinci Aşama

```text
PDF / Excel / görsel okuma katmanı eklenecek.
Evrak içinden tutar, tarih, cari ve işlem tipi çıkarılacak.
OCR/görsel okuma sonucu güven puanı ile sunulacak.
```

## Üçüncü Aşama

```text
Gerçek Telegram bot bağlantısı.
Telegram dosyası otomatik alınacak.
Gelen dosya ALKAM Mali Onay Merkezi'ne düşecek.
```

## Kritik Not

Bu modül ALKAM Mali'nin en önemli otomasyon merkezlerinden biridir. Hız değil, doğru cari ve doğru onay önceliklidir.
