# ALKAM Mali - v11 Sürüm Özeti ve Kontrol Listesi

Bu doküman ALKAM Mali v11 geliştirmelerinde eklenen modülleri, güvenlik kurallarını ve canlı test sırasını özetler.

## v11 Ana Hedef

Ana ekranı daha kurumsal, güvenilir ve tek ekran yönetim paneli haline getirmek.

## Eklenen Ana Modüller

### 1. Kurumsal Dashboard

Dosya:

```text
alkam-dashboard-kurumsal-v11.js
```

Görev:

- Net cari bakiye
- BAKİYE B / BAKİYE A / KAPALI
- Tahakkuk toplamı
- Tahsilat toplamı
- Banka onay bekleyen
- Cari hareket sayısı
- AI kritik / uyarı
- Dönem rozeti
- Hızlı erişim butonları

### 2. Dönem Filtresi

Dosya:

```text
alkam-dashboard-donem-filtre-v11.js
```

Görev:

- Tümü
- Yıl
- Ay
- Dashboard metriklerini seçilen döneme göre hesaplama

### 3. Tek Ekran Modu

Dosya:

```text
alkam-dashboard-tek-ekran-v11.js
```

Görev:

- Ana ekran kalabalığını azaltmak
- Gereksiz görsel tekrarları gizlemek
- Yönetim özetini öne almak

### 4. Görsel Kontrol Paneli

Dosya:

```text
alkam-dashboard-gorsel-kontrol-v11.js
```

Görev:

- Dashboard var mı?
- Dönem filtresi var mı?
- Tek ekran modu var mı?
- Modül menüsü var mı?
- AI merkez var mı?
- Supabase yazma kapısı var mı?

### 5. Canlı Test Paketi

Dosya:

```text
alkam-canli-test-paketi-v11.js
```

Görev:

- Ana modülleri tek seferde test etmek
- Eksik / riskli modülleri göstermek
- Veri yazmadan canlı kontrol yapmak

### 6. Sürüm Rozeti

Dosya:

```text
alkam-surum-rozeti-v11.js
```

Görev:

- Ekranda çalışan sürümü göstermek
- Cache / deploy karışıklığını azaltmak

### 7. Cache / Deploy Kontrolü

Dosya:

```text
alkam-cache-deploy-kontrol-v11.js
```

Görev:

- Yeni sürüm gerçekten canlıya gelmiş mi kontrol etmek
- Eksik loader varsa göstermek

## AI Modülleri

### AI Asistan Merkezi

```text
alkam-ai-asistan-merkezi-v11.js
```

Tüm AI modüllerini tek merkezde toplar.

### AI Hata Tespit

```text
alkam-ai-hata-tespit-v11.js
```

Şüpheli / hatalı muhasebe kayıtlarını listeler.

### Belge Önizleme

```text
alkam-belge-onizleme-v11.js
```

Belge metninden tür, tarih, tutar, VKN/TCKN önerir.

### AI Rapor Özeti

```text
alkam-ai-rapor-ozeti-v11.js
```

Yönetici özeti ve önerilen aksiyonlar üretir.

### Vergi Savunma / Dilekçe Taslak

```text
alkam-vergi-savunma-v11.js
```

Taslak üretir; resmi gönderim yapmaz.

### Belge Onay Önerileri

```text
alkam-belge-onay-oneri-v11.js
```

Belgeyi güvenli onay önerisine dönüştürür; kayıt yapmaz.

### Mükellef AI Soru-Cevap

```text
alkam-mukellef-ai-soru-cevap-v11.js
```

Cari, tahakkuk, tahsilat, banka ve Moka sorularına cevap verir.

## Supabase Güvenlik Katmanı

Hazır modüller:

```text
alkam-supabase-baglanti-test-v10.js
alkam-supabase-readonly-v10.js
alkam-supabase-compare-ui-v10.js
alkam-supabase-write-gate-v10.js
alkam-supabase-config-guard-v10.js
```

Ana kural:

```text
Supabase yazma kapalıdır.
```

## Korunan Değişmez Kurallar

- Cari ekstresi ana defterdir.
- Banka hareketleri doğrulama / onay katmanıdır.
- Onaysız işlem yapılmaz.
- AI kayıt yapmaz.
- Moka United banka aktarımı cari tahsilatı sayılmaz.
- Supabase yazma kapısı kapalıdır.
- Eski modüller kullanıcı onayı olmadan silinmez.

## Canlı Test Sırası

1. Sayfa açılır.
2. Sol altta sürüm rozeti kontrol edilir.
3. Cache Kontrol çalıştırılır.
4. Canlı Test çalıştırılır.
5. Görsel Kontrol çalıştırılır.
6. Dönem filtresi denenir.
7. Supabase Write Gate kontrol edilir.

## En Kritik Console Komutları

```js
ALKAM_DASHBOARD_KURUMSAL_V11.test()
ALKAM_CACHE_DEPLOY_KONTROL_V11.test()
ALKAM_CANLI_TEST_PAKETI_V11.test()
ALKAM_DASHBOARD_GORSEL_KONTROL_V11.test()
ALKAM_SUPABASE_WRITE_GATE_V10.test()
```

## Beklenen Güvenli Sonuçlar

```text
cacheControlLoader: true
liveTestLoader: true
versionBadgeLoader: true
writeAllowed: false
failed: 0
```

## Kalan Öncelikler

1. Canlı test ekran çıktısına göre eksikleri düzeltmek.
2. Dashboard kart sayısını gerekirse daha da azaltmak.
3. Belge önerilerini banka/tahakkuk onay merkezine ikinci fazda güvenli bağlamak.
4. Supabase read-only gerçek config ile test etmek.
5. Yazma kapısını ancak tüm kontroller temizse ve kullanıcı onayı varsa değerlendirmek.
