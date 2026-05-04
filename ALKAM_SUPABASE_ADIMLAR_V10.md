# ALKAM MALİ İstasyON - Supabase Adımları v10

Bu doküman Supabase tarafında izlenecek sırayı yazar. Canlı sisteme yazma açmadan önce test ortamında uygulanacaktır.

## Sıra

1. `ALKAM_SUPABASE_SEMA_V10.sql`
2. `ALKAM_SUPABASE_RLS_V10.sql`
3. `ALKAM_SUPABASE_TEST_IMPORT_V10.sql`
4. `ALKAM_SUPABASE_KARSILASTIRMA_SQL_V10.sql`

## 1. Şema

Amaç:

- Ana tabloları oluşturmak
- Finans hesaplarını oluşturmak
- Cari bakiye viewını oluşturmak
- Banka onay özet viewını oluşturmak

Kontrol:

- Tablolar oluştu mu?
- Finans hesapları geldi mi?
- Viewlar çalışıyor mu?

## 2. RLS / Yetki

Amaç:

- Kullanıcı profili tablosu
- Admin / operator / viewer / auditor rolleri
- Okuma ve yazma politikaları

Kontrol:

- RLS açık mı?
- Policy listesi görünüyor mu?
- İlk admin kullanıcı eklendi mi?

## 3. Test Kontrol

Amaç:

- Şema doğru mu?
- Viewlar çalışıyor mu?
- Tablo sayımları geliyor mu?

Test insert örnekleri sadece test ortamında çalıştırılacaktır.

## 4. Karşılaştırma

Amaç:

- Kayıt sayısı
- Borç toplamı
- Alacak toplamı
- Bakiye
- Moka kontrolü
- Banka onay kontrolü

Kritik kabul:

- Kaynak boş kayıt olmamalı.
- Mükerrer cari hareket olmamalı.
- Moka banka aktarımı cari tahsilatı sayılmamalı.
- Raw bağlantısı olmayan işlenen banka kaydı olmamalı.

## İlk Admin Kullanıcı

Supabase Authentication içinde kullanıcı oluşturulduktan sonra user id alınır.

Sonra `user_profiles` tablosuna admin kaydı eklenir.

## Canlıya Geçiş Şartı

Canlı yazma ancak şu şartlarla açılır:

- Test şeması hatasız.
- RLS hatasız.
- Admin kullanıcı doğrulanmış.
- LocalStorage ön kontrolünde JSON hata yok.
- Yedek alınmış.
- Karşılaştırma raporunda kritik fark yok.

## Geri Dönüş

Hata olursa Supabase yazma kapatılır. LocalStorage ana kayıt olarak kalır. Hatalı kayıtlar incelenmeden canlı geçiş yapılmaz.

## Sonraki Dosya

Supabase bağlantı ve anahtar kuralları için ayrı dosya hazırlanacak:

`ALKAM_SUPABASE_ENV_KURALLARI_V10.md`
