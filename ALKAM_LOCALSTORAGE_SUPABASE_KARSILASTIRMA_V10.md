# ALKAM MALİ İstasyON - LocalStorage / Supabase Karşılaştırma Raporu Planı v10

Bu doküman Supabase test import sonrası LocalStorage ile Supabase verilerinin karşılaştırılması için hazırlanmıştır.

## Amaç

Supabase ana kayıt haline getirilmeden önce mevcut tarayıcı verisi ile Supabase test verisi arasında fark olup olmadığını görmek.

## Ana Kural

Fark raporu temiz olmadan Supabase canlı yazma açılmayacak.

## Karşılaştırılacak Alanlar

### 1. Cari Hareketleri

Kontroller:

- Kayıt adedi
- Toplam borç
- Toplam alacak
- Net bakiye
- Kaynak boş kayıt sayısı
- Mükerrer işlem sayısı
- İptal edilmiş kayıt sayısı

Beklenen:

```text
LocalStorage toplam borç = Supabase toplam borç
LocalStorage toplam alacak = Supabase toplam alacak
LocalStorage net bakiye = Supabase net bakiye
```

### 2. Tahakkuklar

Kontroller:

- Kayıt adedi
- Dönem bazlı kayıt adedi
- Dönem bazlı toplam tutar
- Cari bazlı eksik aylar
- Mükerrer tahakkuklar

### 3. Tahsilatlar

Kontroller:

- Kayıt adedi
- Toplam tahsilat
- Finans hesabı bağlantısı
- Cari hareket bağlantısı
- Banka onayından gelen tahsilatlar

### 4. Finans Hareketleri

Kontroller:

- Banka toplam giriş / çıkış
- Kasa toplam giriş / çıkış
- Moka United toplam giriş / çıkış
- Çek toplam
- Senet toplam

Özel Moka kontrolü:

```text
Moka → Banka aktarımı cari tahsilatı sayılmamalı.
```

### 5. Banka Onay Sistemi

Kontroller:

- Raw import kayıt sayısı
- Onay bekleyen sayısı
- İşlenen sayısı
- Reddedilen sayısı
- Mükerrer fingerprint sayısı
- Güven puanı boş kayıtlar
- Eşleşme sebebi boş kayıtlar

### 6. Günlük Kontrol Özetleri

Kontroller:

- Gün sayısı
- Son skor
- Kritik gün sayısı
- Kontrol gerekir gün sayısı
- Güvenli gün sayısı

## Fark Sınıfları

Farklar üç sınıfa ayrılacak:

### Kritik

- Bakiye farkı
- Borç/alacak toplam farkı
- Cari hareket eksikliği
- Onaysız banka hareketinin işlenmiş görünmesi
- Moka aktarımının cari tahsilatı sayılması

### Uyarı

- Kaynak boş kayıt
- Açıklama boş kayıt
- Güven puanı boş kayıt
- Dönem bilgisi boş kayıt

### Bilgi

- Supabase'de olmayan ama LocalStorage'da olan eski loglar
- Görsel modül kayıtları
- Teknik cache farkları

## Kabul Kriterleri

Supabase ana kayıt haline geçmeden önce:

- Kritik fark: 0
- Bakiye farkı: 0
- Onaysız işlenen banka satırı: 0
- Moka hatası: 0
- JSON hata: 0

Uyarılar kullanıcı onayına düşebilir.

## Rapor Formatı

Rapor şu başlıklarla üretilecek:

```text
Genel Durum
Cari Hareketleri Karşılaştırma
Tahakkuk Karşılaştırma
Tahsilat Karşılaştırma
Finans Karşılaştırma
Banka Onay Karşılaştırma
Moka Özel Kontrol
Günlük Kontrol Karşılaştırma
Kritik Farklar
Uyarılar
Sonuç ve Onay
```

## Sonraki Teknik Dosya

Bir sonraki adımda Supabase tarafında çalışacak sayım/fark SQL dosyası hazırlanacak:

```text
ALKAM_SUPABASE_KARSILASTIRMA_SQL_V10.sql
```

Bu SQL dosyası Supabase tablolarındaki kayıt sayısı ve toplamları çıkaracak. LocalStorage tarafındaki değerler ile manuel/otomatik karşılaştırılacak.
