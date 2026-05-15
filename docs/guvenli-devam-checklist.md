# ALKAM Mali - Güvenli Devam Checklist

## Sabit Başlangıç Noktası

Korunacak güvenli commit:

```text
1f381ffc51d04ad53c7533e62d6bbe8857ad1006
```

Bu commit, çalışan rollback mantığına hizalanmış güvenli ana sürüm kabul edilir.

## Ana Kural

- Ana çalışan sürüm korunacak.
- Yeni geliştirmeler doğrudan main üzerinde yapılmayacak.
- Önce ayrı branch veya preview deploy üzerinde denenecek.
- Giriş ekranına dokunulmayacak.
- Şifre, login, mobil giriş ve sayı paneli kodları eklenmeyecek.
- Her modül tek tek bağlanacak.
- Her adımdan sonra canlı/preview kontrol yapılacak.
- Sorun çıkarsa sadece son eklenen modül geri alınacak.

## Şu An Bilerek Bağlanmayanlar

### 1. Banka Modülleri

Şimdilik main worker'a bağlı değil.

Geri bağlanacak dosyalar:

```text
alkam-bank-import-v1.js
alkam-bank-onay-center-v1.js
alkam-bank-cari-suggest-v1.js
alkam-bank-cari-prepare-v1.js
alkam-bank-prepared-list-v1.js
alkam-bank-post-ledger-v1.js
```

### 2. Telegram Modülleri

Şimdilik başlanmayacak.

Planlanan ama bekletilen yapı:

```text
Telegram Evrak Gelen Kutusu
Telegram bot webhook
Evrak / banka / Moka / cari dekont akışı
Onay Merkezi entegrasyonu
```

### 3. Login / Şifre / Mobil Giriş Yamaları

Tekrar bağlanmayacak.

Yasaklı alan:

```text
Mobil login yaması
Şifre kaldırma denemeleri
Auto-login
Mobile gate
Input focus fix karmaşası
```

### 4. Sayı Paneli

Tekrar yapılmayacak.

```text
Mobil sayı paneli
Tek tuş giriş
Şifreyi otomatik doldurma
```

### 5. Bot Test Scriptleri

Şimdilik canlıya bağlanmayacak.

Güvenli biçimde ayrı workflow/branch üzerinde değerlendirilecek.

```text
tools/alkam-smoke-test.mjs
.github/workflows/alkam-smoke-test.yml
```

## Geri Bağlama Sırası

### Aşama 1 - Banka Ekstresi İşleme Merkezi

Dosya:

```text
alkam-bank-import-v1.js
```

Özellikler:

```text
Banka ekstresi içeri alma
ID bazlı kayıt
Mükerrer kontrol
Onay Bekliyor durumu
İşlendi Yap
En son işlenen banka kaydı
```

Kontrol:

```text
Giriş ekranı bozulmadı mı?
Hesaplar bölümünde Banka Ekstresi İşleme Merkezi görünüyor mu?
Eklenen kayıt Onay Bekliyor olarak geliyor mu?
```

### Aşama 2 - Onay Merkezi Banka Bekleyenler

Dosya:

```text
alkam-bank-onay-center-v1.js
```

Kontrol:

```text
Onay Merkezi içinde Banka Onay Bekleyenler alanı görünüyor mu?
Banka panelinden eklenen kayıt burada listeleniyor mu?
```

### Aşama 3 - Cari Eşleştirme Önerisi

Dosya:

```text
alkam-bank-cari-suggest-v1.js
```

Kontrol:

```text
Banka açıklamasından cari önerisi geliyor mu?
Cariyi Onayla butonu çalışıyor mu?
Yanlış kesin kayıt atmıyor mu?
```

### Aşama 4 - Cari Ekstresine Hazırla

Dosya:

```text
alkam-bank-cari-prepare-v1.js
```

Kontrol:

```text
Cari Ekstresine Hazırla butonu görünüyor mu?
Tahsilat / Ödeme ayrımı doğru mu?
Kayıt sadece hazırlık durumuna mı geçiyor?
```

### Aşama 5 - Ekstreye Hazır Liste

Dosya:

```text
alkam-bank-prepared-list-v1.js
```

Kontrol:

```text
Ekstreye Hazır Banka Kayıtları kutusu görünüyor mu?
Hazırlanan cari, tutar, açıklama ve banka ID görünüyor mu?
```

### Aşama 6 - Cari Ekstresine Aktar İşareti

Dosya:

```text
alkam-bank-post-ledger-v1.js
```

Kontrol:

```text
Cari Ekstresine Aktar butonu görünüyor mu?
Aynı banka ID ikinci kez aktarılmıyor mu?
Kayıt sadece aktarıldı işaretine mi geçiyor?
Gerçek cari deftere otomatik kesin kayıt atmıyor mu?
```

## Telegram Sonraki Faz

Banka modülleri güvenli çalıştıktan sonra başlanacak.

Sıra:

```text
1. Telegram Evrak Gelen Kutusu UI
2. Manuel test kaydı
3. Cloudflare secret yapısı
4. Telegram webhook endpoint
5. Dosya alma ve kayıt ID mantığı
6. Onay Merkezi entegrasyonu
7. Banka / Moka / Cari hazırlık akışı
```

## Yapılmayacaklar

```text
Giriş ekranı değiştirme
Şifre kaldırma
Şifre otomatik doldurma
Mobil login yaması
Sayı paneli
Doğrudan main üzerinde büyük değişiklik
Onaysız kesin cari kayıt
```

## Her Güncelleme Sonunda Verilecek Rapor

```text
Yapılanlar
Kalanlar
Kontrol Edilecekler
Geri Alma Noktası
```
