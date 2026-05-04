# ALKAM Mali - v12 Geçiş Planı

Bu plan v11 sonunda oluşan kurumsal dashboard, AI modülleri ve güvenlik katmanını bozmadan v12 geliştirme sırasını belirler.

## Ana Hedef

v12'nin ana hedefi, v11'de eklenen modülleri dağınık eklenti yapısından daha kalıcı ve standart bir uygulama mimarisine taşımaktır.

## v12 Öncelik Sırası

### 1. Ana Dashboard'u Kalıcı Hale Getirme

- Kurumsal Dashboard ana ekran standardı olacak.
- Varsayılan görünüm Kompakt kalacak.
- Normal / Kompakt / Ultra görünüm seçici korunacak.
- Gereksiz ayrı butonlar ana ekranda görünmeyecek.
- Ayrıntı modülleri Modül Menüsü ve AI Asistan Merkezi altında kalacak.

### 2. Canlı Test Sonuçlarına Göre Düzeltme

Önce canlıda şu testler çalıştırılacak:

```js
ALKAM_DASHBOARD_KURUMSAL_V11.test()
ALKAM_CACHE_DEPLOY_KONTROL_V11.test()
ALKAM_CANLI_TEST_PAKETI_V11.test()
ALKAM_DASHBOARD_GORSEL_KONTROL_V11.test()
ALKAM_DASHBOARD_GORUNUM_TERCIHI_V11.test()
```

Eksik çıkan modüller v12 başlamadan düzeltilecek.

### 3. AI Modüllerini Tek Merkez Standardına Alma

AI modülleri tek merkezden yönetilecek:

- AI Hata Tespit
- Belge Önizleme
- AI Rapor Özeti
- Vergi / Dilekçe Taslak
- Belge Onay Önerileri
- Mükellef AI Soru-Cevap

Ana ekranda tek giriş noktası:

```text
AI Merkezi
```

### 4. Belge Önerileri İkinci Faz

Belge önizleme kayıtları doğrudan kayıt yapmayacak.

İkinci fazda belge önerileri şu güvenli akışa bağlanacak:

1. Belge Önizleme
2. Belge Onay Önerisi
3. Kullanıcı Onayı
4. Banka / Tahakkuk Onay Merkezi
5. Son kontrol
6. Kayıt adayı

Ana kural:

```text
Belgeden doğrudan cari hareket, tahakkuk veya tahsilat oluşmayacak.
```

### 5. Supabase Read-only Gerçek Test

Supabase tarafında sadece read-only test yapılacak.

Gerekli şartlar:

- Public URL girilecek.
- Publishable / anon key girilecek.
- Service role kesinlikle frontend'e konmayacak.
- RLS çalışır durumda olacak.
- Config Guard temiz sonuç verecek.
- Write Gate kapalı kalacak.

Beklenen:

```text
writeAllowed: false
```

### 6. Güvenilirlik Paneli Standart Hale Getirme

v12'de şu kontroller daha görünür yapılacak:

- Cari hareket kaynak kontrolü
- Mükerrer hareket kontrolü
- Bakiye B / Bakiye A standardı
- Moka United özel kural kontrolü
- Banka onay bekleyen kontrolü
- AI kritik hata kontrolü

### 7. Mükellef Dijital Kartı v1'e Geçiş

v12 sonrası ana geliştirme hedefi:

```text
Mükellef Dijital Kartı v1
```

Kart içinde olacak ana sekmeler:

- Kimlik bilgileri
- Vergi / resmi bilgiler
- Yetkili ve iletişim
- Aylık mali veriler
- Cari ekstre
- Beyanname takibi
- SGK / çalışan takibi
- Evrak takibi
- Notlar / log
- Grafikler
- AI soru-cevap

## Değişmez Güvenlik Kuralları

- Cari ekstresi ana defterdir.
- Banka hareketleri doğrulama / onay katmanıdır.
- AI kayıt yapmaz.
- Onaysız işlem yapılmaz.
- Moka United banka aktarımı cari tahsilatı sayılmaz.
- Supabase yazma kapısı kapalıdır.
- Eski özellikler kullanıcı onayı olmadan silinmez.

## v12 Başlamadan Önce Yapılacaklar

1. Canlı site deploy kontrolü yapılacak.
2. Sürüm rozeti görünecek.
3. Cache Kontrol temiz olacak.
4. Canlı Test Paketi çalışacak.
5. Görünüm seçici çalışacak.
6. Supabase Write Gate kapalı kalacak.
7. v11 dosyaları kaybolmadan v12 refactor başlayacak.

## v12 İlk Commit Hedefi

İlk v12 commit'i sadece düzenleme ve standardizasyon olacak:

```text
v12: stabilize dashboard and module loading
```

Bu commit veri yazmayacak, tablo değiştirmeyecek, Supabase yazma açmayacak.
