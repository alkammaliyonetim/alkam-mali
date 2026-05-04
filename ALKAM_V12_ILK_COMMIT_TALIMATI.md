# ALKAM Mali - v12 İlk Commit Talimatı

Bu dosya v12 başlangıcında yapılacak ilk teknik commit için net talimattır.

## Commit Mesajı

```text
v12: stabilize dashboard and module loading
```

## Ana Amaç

v11 sonunda oluşan kurumsal dashboard, görünüm seçici, canlı test, cache kontrol, AI merkezi ve Supabase güvenlik katmanını bozmadan modül yükleme düzenini stabilize etmek.

## Bu Commit'te Yapılacaklar

### 1. Dashboard Yükleme Akışı Sabitlenecek

Korunacak ana dosya:

```text
alkam-dashboard-kurumsal-v11.js
```

Bu dosya v12 stabilizasyonunda ana yükleyici gibi davranmaya devam edecek.

Otomatik yüklenen modüller korunacak:

```text
alkam-dashboard-donem-filtre-v11.js
alkam-dashboard-tek-ekran-v11.js
alkam-dashboard-gorsel-kontrol-v11.js
alkam-canli-test-paketi-v11.js
alkam-surum-rozeti-v11.js
alkam-cache-deploy-kontrol-v11.js
alkam-dashboard-kompakt-v11.js
alkam-dashboard-ultra-kompakt-v11.js
alkam-dashboard-gorunum-tercihi-v11.js
```

### 2. Varsayılan Görünüm Korunacak

Varsayılan görünüm:

```text
Kompakt
```

Normal / Kompakt / Ultra seçici korunacak.

Eski ayrı toggle butonları görünmeyecek:

```text
Kompakt Açık / Kapalı
Ultra Açık / Kapalı
```

### 3. Ana Dashboard Butonları Korunacak

Ana dashboard üzerinde sadece net aksiyonlar kalacak:

```text
AI Merkezi
Güvenilirlik
Canlı Test
Cache Kontrol
```

Ek buton kalabalığı oluşturulmayacak.

### 4. Canlı Test Paketine Göre Kontrol

İlk v12 commit sonrasında çalıştırılacak:

```js
ALKAM_DASHBOARD_KURUMSAL_V11.test()
ALKAM_CACHE_DEPLOY_KONTROL_V11.test()
ALKAM_CANLI_TEST_PAKETI_V11.test()
ALKAM_DASHBOARD_GORUNUM_TERCIHI_V11.test()
ALKAM_SUPABASE_WRITE_GATE_V10.test()
```

Beklenen güvenli sonuçlar:

```text
cacheControlLoader: true
liveTestLoader: true
viewPrefLoader: true
writeAllowed: false
```

### 5. Supabase Yazma Kapısı Açılmayacak

Bu committe kesinlikle yapılmayacak:

```text
Supabase insert/update/delete
Cari hareketlerine yazma
Tahakkuk yazma
Tahsilat yazma
Banka işleme
Moka kaydı işleme
```

### 6. AI Modülleri Sadece Okuyacak

AI tarafında izinli işlemler:

```text
Oku
Özetle
Hata yakala
Öneri üret
Taslak üret
```

Yasak işlemler:

```text
Muhasebe kaydı oluşturma
Banka kaydı işleme
Cari hareket değiştirme
Tahakkuk/tahsilat oluşturma
Resmi başvuru gönderme
```

### 7. Eski Özellikler Silinmeyecek

Bu commit refactor başlatabilir ama özellik silmeyecek.

Silinmeyecek ana alanlar:

```text
Cari ana defter
Tahakkuk kontrolü
Tahsilat modülü
Banka onay merkezi
Banka import güvenliği
Moka özel kuralı
Güvenilirlik raporu
AI modülleri
Supabase read-only katman
```

## v12 İlk Commit Sonrası Rapor Formatı

Her güncelleme sonunda şu format verilecek:

```text
Yapılanlar
Kalanlar
Kontrol Ettiklerim
Risk / Not
```

## Başarı Kriteri

v12 ilk commit başarılı sayılması için:

```text
Ana dashboard açılacak.
Sürüm rozeti görünecek.
Görünüm seçici çalışacak.
Canlı Test açılacak.
Cache Kontrol açılacak.
Supabase Write Gate kapalı kalacak.
AI modülleri kayıt yapmayacak.
```
