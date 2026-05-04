# ALKAM MALİ İstasyON - Read-only Config Hazırlık Kontrol Listesi v10

Bu doküman gerçek Supabase public config girilmeden önce uygulanacak hazırlık listesidir.

## Amaç

Supabase'e canlı yazma açmadan sadece okuma testi yapmak.

## Hazır Modüller

Şu modüller hazırdır:

- `alkam-supabase-baglanti-test-v10.js`
- `alkam-supabase-readonly-v10.js`
- `alkam-supabase-compare-ui-v10.js`
- `alkam-supabase-write-gate-v10.js`

## Config Dosyası

Örnek dosya hazır:

```text
supabase-config.example.js
```

Gerçek test için ayrı dosya hazırlanacak:

```text
supabase-config.js
```

Bu dosya sadece public değerler içerecek.

## Girilebilecek Bilgiler

- Supabase URL
- anon / publishable key
- `enabled: true`
- `mode: read_only_test`

## Girilmeyecek Bilgiler

- service role key
- secret key
- database password
- JWT secret
- kişisel erişim tokenı

## Read-only Açma Şartları

1. Supabase şeması test ortamında kurulmuş olacak.
2. RLS kurulmuş olacak.
3. İlk admin kullanıcı tanımlanmış olacak.
4. Public config gerçek değerlerle oluşturulacak.
5. `enabled: true` yapılacak.
6. `mode: read_only_test` kalacak.
7. Yazma kapısı kapalı kalacak.

## Console Beklenen Sonuçlar

```js
ALKAM_SUPABASE_BAGLANTI_TEST_V10.test()
```

Beklenen:

```text
client: true
enabled: true
ready: true
mode: read_only_test
```

```js
ALKAM_SUPABASE_READONLY_V10.status()
```

Beklenen:

```text
readReady: true
writeReady: false
```

```js
ALKAM_SUPABASE_WRITE_GATE_V10.test()
```

Beklenen:

```text
writeAllowed: false
```

## Kontrol Edilecek Okumalar

```js
ALKAM_SUPABASE_READONLY_V10.readFinanceAccounts()
ALKAM_SUPABASE_READONLY_V10.readCariBakiye()
ALKAM_SUPABASE_READONLY_V10.readBankaOzet()
```

## Başarılı Sayılması İçin

- Finans hesapları okunmalı.
- Cari bakiye viewı hata vermemeli.
- Banka onay özeti hata vermemeli.
- Yazma denemesi bloklanmalı.

## Sonraki Adım

Read-only başarılı olursa karşılaştırma paneli çalıştırılır:

```js
ALKAM_SUPABASE_COMPARE_UI_V10.compare()
```

Kritik fark sıfır olmadan yazma kapısı açılmayacak.
