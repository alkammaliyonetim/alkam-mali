# İstasyonALKAM Telegram Otomasyon Akışı v1

## Amaç

Telegram, İstasyonALKAM Ofis Otomasyon Asistanı'nın ana giriş kanallarından biridir.

Kullanıcı Telegram üzerinden doğal dil mesajı, ödeme sözü, dekont, ekran görüntüsü, fatura, makbuz, banka bildirimi, Moka bildirimi veya evrak gönderdiğinde sistem bunu otomatik okuyup işlem önerisine çevirecektir.

Kullanıcıya sadece tek tık onay kalacaktır.

## Ana Kural

Hiçbir Telegram verisi kullanıcı onayı olmadan kesin kayıt olmayacaktır.

```text
Telegram'dan al
Gelen Kutusu'na düşür
Oku / anla
İşlem önerisi üret
Onay Merkezi'ne gönder
Kullanıcı onaylarsa işle
```

## Telegram'dan Gelebilecek Girdiler

```text
Doğal dil mesajı
Ödeme sözü
Tahsilat sözü
Dekont fotoğrafı
Banka ekran görüntüsü
Moka bildirimi
Fatura
Makbuz
PDF evrak
Excel dosyası
Vergi / SGK evrakı
Cari notu
Görev / takip mesajı
```

## Botun Algılayacağı Alanlar

```text
Cari adı
Tutar
İşlem türü
Tarih
Vade tarihi
Belge türü
Kaynak mesaj
Gönderen kişi
Telegram mesaj ID
Dosya / fotoğraf bağlantısı
Güven puanı
Eşleşme sebebi
Önerilen aksiyon
```

## İşlem Türleri

```text
Ödeme sözü
Tahsilat sözü
Cari tahsilat
Cari ödeme
Cari notu
Dekont eşleştirme
Moka tahsilatı
Moka banka aktarımı
Evrak kaydı
Fatura bilgisi
Vergi / SGK evrakı
Görev / takip kaydı
```

## Örnek

Telegram mesajı:

```text
Ungan Mobilya haziranın son günü 100.000 TL ödeme sözü verdi
```

Sistem önerisi:

```text
Cari: Ungan Mobilya
İşlem türü: Ödeme sözü
Tutar: 100.000 TL
Vade: 30.06.2026
Durum: Onay bekliyor
Alarm önerisi: Var
Cari bağlantısı: Hazır
```

Onay sonrası:

```text
Takip / Alarm listesine düşer.
Cari kartında Ödeme Sözleri / Takipler alanında görünür.
Kesin cari ekstresi değişmez.
```

## Güvenlik Kuralları

```text
Onaysız cari ekstresi değişmez.
Onaysız bakiye değişmez.
Onaysız evrak kesin kayda dönüşmez.
Onaysız Moka kapanmaz.
Onaysız banka hareketi kesinleşmez.
Onaysız alarm aktif göreve dönüşmez.
Emin olunmayan cari eşleşmesi onaya düşer.
Her Telegram mesajı kaynak ID ile saklanır.
Her işlem loglanır.
```

## Teknik Fazlar

### Faz 1 - Telegram Gelen Kutusu

Telegram mesajları uygulamada Gelen Kutusu olarak listelenecek.

### Faz 2 - Mesajdan Öneri Üretme

Gelen mesajdan cari, tutar, işlem türü ve vade önerisi çıkarılacak.

### Faz 3 - Onay Merkezi Bağlantısı

Telegram önerileri Onay Merkezi'ne düşecek.

### Faz 4 - Evrak / Görsel Okuma

Fotoğraf, dekont ve ekran görüntüsü OCR/AI okuma katmanına alınacak.

### Faz 5 - Gerçek Telegram Webhook

Telegram bot token Cloudflare/Supabase secret olarak tutulacak. Kod içine token yazılmayacak.

### Faz 6 - Öğrenen Eşleştirme

Kullanıcı onaylarından cari eşleşme ve açıklama kalıpları öğrenilecek.

## Production Notu

Bu akış production'a alınmadan önce preview üzerinde test edilecek. Login / şifre ekranına dokunulmayacak. Main branch'e doğrudan commit yapılmayacak.
