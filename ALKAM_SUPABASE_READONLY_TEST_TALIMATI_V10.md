# ALKAM MALİ İstasyON - Supabase Read-only Test Talimatı v10

Bu doküman Supabase bağlantısının canlı yazma açılmadan nasıl test edileceğini açıklar.

## Amaç

Supabase tarafı hazır olduğunda önce sadece okuma testi yapılacak. LocalStorage ana kayıt olarak kalmaya devam edecek.

## Ön Koşullar

Aşağıdaki dosyalar Supabase test ortamında uygulanmış olmalı:

1. `ALKAM_SUPABASE_SEMA_V10.sql`
2. `ALKAM_SUPABASE_RLS_V10.sql`
3. `ALKAM_SUPABASE_TEST_IMPORT_V10.sql`
4. `ALKAM_SUPABASE_KARSILASTIRMA_SQL_V10.sql`

## Frontend Config Mantığı

Örnek dosya:

```text
supabase-config.example.js
```

Bu dosya gerçek secret içermez.

Canlı test için ayrı bir public config oluşturulacak. Bu config içinde sadece şunlar olabilir:

- Supabase URL
- anon / publishable key
- enabled true
- mode read_only_test

## Kesin Yasak

Frontend içine şunlar yazılmayacak:

- service role key
- secret key
- database password
- JWT secret
- kişisel token

## Read-only Test Sırası

1. Supabase JS client yüklenir.
2. Public config yüklenir.
3. `ALKAM_SUPABASE_BAGLANTI_TEST_V10.test()` çalıştırılır.
4. `client: true`, `enabled: true`, `ready: true` görülür.
5. `ALKAM_SUPABASE_READONLY_V10.status()` çalıştırılır.
6. `readReady: true`, `writeReady: false` görülür.
7. Finans hesapları okunur.
8. Cari bakiye viewı okunur.
9. Banka onay özeti okunur.

## Console Kontrolleri

```js
ALKAM_SUPABASE_BAGLANTI_TEST_V10.test()
ALKAM_SUPABASE_READONLY_V10.status()
ALKAM_SUPABASE_READONLY_V10.readFinanceAccounts()
ALKAM_SUPABASE_READONLY_V10.readCariBakiye()
ALKAM_SUPABASE_READONLY_V10.readBankaOzet()
ALKAM_SUPABASE_READONLY_V10.write()
```

Beklenen yazma sonucu:

```text
blocked: true
```

## Kabul Kriterleri

Read-only test başarılı sayılması için:

- Supabase client var.
- Config gerçek public değerlerle çalışıyor.
- `readReady` true.
- `writeReady` false.
- Finans hesapları okunuyor.
- `v_cari_bakiye` hata vermiyor.
- `v_banka_onay_ozet` hata vermiyor.
- Yazma denemesi bloklanıyor.

## Sonraki Adım

Read-only test başarılı olursa sıradaki dosya hazırlanacak:

```text
alkam-supabase-compare-ui-v10.js
```

Bu modül LocalStorage ön kontrol verileri ile Supabase okuma özetini ekranda karşılaştıracak.
