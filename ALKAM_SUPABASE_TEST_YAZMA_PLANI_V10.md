# ALKAM MALİ İstasyON - Supabase Test Yazma Planı v10

Bu doküman Supabase yazma kapısı açılmadan önce uygulanacak kontrollü test yazma planıdır.

## Ana Kural

Canlı cari hareketleri ilk aşamada Supabase'e yazılmayacak. Cari ana defter en son taşınacak.

## Ön Şartlar

Test yazma başlamadan önce şu kontroller temiz olmalıdır:

- Supabase şeması kurulmuş olmalı.
- RLS kurulmuş olmalı.
- İlk admin kullanıcı tanımlanmış olmalı.
- Supabase read-only test başarılı olmalı.
- LocalStorage ön kontrolünde JSON hata olmamalı.
- Supabase karşılaştırma kritik fark vermemeli.
- Tam yedek alınmış olmalı.

## Test Yazma Sırası

### 1. Günlük Kontrol Özeti

İlk yazılacak en düşük riskli veri:

```text
gunluk_kontrol_ozetleri
```

Sebep:

- Ana defter değil.
- Finansal borç/alacak üretmez.
- Geri dönüşü kolaydır.

### 2. Modül Sürümleri

İkinci test alanı:

```text
modul_surumleri
```

Sebep:

- Teknik kayıt.
- Finansal veri değil.
- Modül sağlık kontrolü için faydalı.

### 3. Sistem Logları

Üçüncü test alanı:

```text
sistem_loglari
```

Sebep:

- Audit amaçlıdır.
- Ana finans kayıtlarını etkilemez.

### 4. Finans Hareketleri Test Kaydı

Sadece test ortamında denenir.

Canlıda kullanıcı onayı olmadan açılmaz.

### 5. Cari Hareketleri

En son aşamadır.

Cari hareketleri ana defter olduğu için sadece tüm kontroller temizse yazılır.

## Yazma Kapısı

Frontend tarafında yazma kapısı modülü:

```text
alkam-supabase-write-gate-v10.js
```

Bu modül şu anda yazmayı bloklar.

Yazma ancak şu şartlarda açılır:

- Kullanıcı onayı
- Read-only hazır
- Precheck hata sıfır
- Compare kritik fark sıfır

## Test Yazma Kabul Kriterleri

Test yazma başarılı sayılması için:

- Kayıt Supabase'e gider.
- RLS hata vermez.
- Kayıt tekrar okunabilir.
- Mükerrer kayıt oluşmaz.
- LocalStorage ana kayıt bozulmaz.
- Yazma logu tutulur.

## Geri Dönüş

Test yazmada hata olursa:

1. Supabase yazma kapısı kapatılır.
2. LocalStorage ana kayıt olarak kalır.
3. Hatalı Supabase test kayıtları silinir.
4. Hata raporu hazırlanır.
5. Kullanıcı onayı olmadan tekrar yazma açılmaz.

## Sonraki Teknik Dosya

Bir sonraki adımda sadece düşük riskli tabloya yazmayı deneyen ve varsayılan olarak kapalı gelen modül hazırlanacak:

```text
alkam-supabase-test-write-v10.js
```

Bu modül varsayılan olarak yazmayacak; sadece write gate açık ise test kaydı gönderecek.
