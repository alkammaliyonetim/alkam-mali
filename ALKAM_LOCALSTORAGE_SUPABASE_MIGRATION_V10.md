# ALKAM MALİ İstasyON - LocalStorage → Supabase Migration Plan v10

Bu doküman mevcut çalışan localStorage yapısını bozmadan Supabase kalıcı veri katmanına geçiş planıdır.

## Ana İlke

Canlı sistemde çalışan hiçbir localStorage verisi silinmeyecek. Supabase geçişi önce **okuma / yedek / test** mantığında yapılacak. Yazma işlemleri kullanıcı onayı olmadan açılmayacak.

## Mevcut LocalStorage Anahtarları

```text
alkam_cari_hareketleri
alkam_tahakkuklar
alkam_tahsilatlar
alkam_finans_hesaplari
alkam_finans_hareketleri
alkam_banka_ice_aktarim_raw
alkam_onay_bekleyen_banka
alkam_banka_islenen
alkam_banka_reddedilen
alkam_saglik_kontrol_log
alkam_gunluk_kontrol_ozetleri
ALKAM_RELIABILITY_BACKUPS_V1
ALKAM_RELIABILITY_LOG_V1
```

## Hedef Supabase Tabloları

```text
cariler
cari_hareketleri
tahakkuklar
tahsilatlar
finans_hesaplari
finans_hareketleri
banka_import_raw
banka_onay_bekleyen
banka_islenen
banka_reddedilen
sistem_yedekleri
sistem_loglari
gunluk_kontrol_ozetleri
modul_surumleri
```

## Migration Aşamaları

### Aşama 1 — Tam LocalStorage Yedeği

Önce tüm localStorage anahtarları tek JSON dosyası olarak dışa aktarılacak.

Amaç:
- Geri dönüş imkanı
- Test import için kaynak
- Hata durumunda manuel kurtarma

### Aşama 2 — Supabase Test Ortamı

`ALKAM_SUPABASE_SEMA_V10.sql` ve `ALKAM_SUPABASE_RLS_V10.sql` test ortamında çalıştırılacak.

Kontrol:
- Tablolar oluştu mu?
- Viewlar çalışıyor mu?
- RLS politikaları hata veriyor mu?
- İlk admin kullanıcı eklendi mi?

### Aşama 3 — Read-only Supabase Bağlantısı

Frontend önce Supabase’den sadece okuyacak.

Yazma kapalı kalacak.

Amaç:
- Supabase bağlantısı sağlıklı mı?
- Tablolar doğru okunuyor mu?
- Canlı localStorage sistemi bozulmadan veri karşılaştırması yapılabiliyor mu?

### Aşama 4 — Çift Kayıt Testi

Kullanıcı onayıyla bazı işlemler hem localStorage’a hem Supabase’e yazılacak.

Öncelik sırası:
1. `gunluk_kontrol_ozetleri`
2. `modul_surumleri`
3. `sistem_loglari`
4. `finans_hareketleri`
5. `cari_hareketleri`

Cari ana defter en son taşınacak.

### Aşama 5 — Karşılaştırma Raporu

LocalStorage ve Supabase verileri karşılaştırılacak.

Kontroller:
- Kayıt adedi
- Toplam borç
- Toplam alacak
- Bakiye farkı
- Banka onay bekleyen sayısı
- İşlenen / reddedilen sayısı
- Moka hareketleri

### Aşama 6 — Supabase Ana Kayıt

Sadece tüm kontroller temizse Supabase ana kayıt yapılacak.

LocalStorage en az bir süre daha yedek/cache olarak tutulacak.

## Veri Haritalama

### cari_hareketleri

| LocalStorage | Supabase |
|---|---|
| cari_id / cariId | cari_id |
| tarih / date | tarih |
| donem / period | donem |
| islem_turu / type | islem_turu |
| aciklama / description | aciklama |
| borc | borc |
| alacak | alacak |
| kaynak | kaynak |
| id / islem_id | kaynak_ref |

### tahakkuklar

| LocalStorage | Supabase |
|---|---|
| cari_id | cari_id |
| donem / period | donem |
| tutar / borc | tutar |
| aciklama | aciklama |
| kaynak | kaynak |

### tahsilatlar

| LocalStorage | Supabase |
|---|---|
| cari_id | cari_id |
| tarih | tarih |
| tutar / alacak | tutar |
| finans_hesap | finans_hesap_id eşleşmesi |
| aciklama | aciklama |
| kaynak | kaynak |

### banka_onay

| LocalStorage | Supabase |
|---|---|
| alkam_banka_ice_aktarim_raw | banka_import_raw |
| alkam_onay_bekleyen_banka | banka_onay_bekleyen |
| alkam_banka_islenen | banka_islenen |
| alkam_banka_reddedilen | banka_reddedilen |

## Güvenlik Kuralları

- Migration öncesi otomatik yedek alınacak.
- Mükerrer `fingerprint` kontrolü yapılacak.
- Banka hareketleri Supabase’e aktarılsa bile onaysız işlenmeyecek.
- Moka → Banka aktarımı cari tahsilatı olarak yazılmayacak.
- `cari_hareketleri` ana defter kabul edilecek.
- Hatalı kayıtlar `migration_errors` mantığında raporlanacak; otomatik düzeltilmeyecek.

## Sonraki Teknik Dosya

Bir sonraki adımda tarayıcı içinde çalışan bir dışa aktarım modülü hazırlanacak:

```text
alkam-localstorage-export-v10.js
```

Bu modül tüm localStorage verilerini JSON olarak indirecek.
