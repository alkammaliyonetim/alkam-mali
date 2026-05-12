# ALKAM Mali / İstasyON Stabil Sürüm Kararı

## Ana karar

Bundan sonra geliştirme bu stabil yedek program üzerinden devam edecektir.

Ana kaynak dosya:

```text
backups/index_before_25apr_stable_restore_20260428_125756.html
```

## Ana giriş yolları

Aşağıdaki yollar aynı stabil programa bağlanmıştır:

```text
/
/admin.html
/admin
/admin/
/program
/program.html
```

Bağlandığı dosya:

```text
/backups/index_before_25apr_stable_restore_20260428_125756.html
```

## Kullanılmayacak / yanlış kabul edilen yollar

Aşağıdaki yaklaşımlar geliştirme kaynağı olmayacaktır:

```text
istasyon.html
son dağınık admin.html
sıfırdan yazılmış çekirdek ekran
iframe/kabuk yaklaşımı
ayrı automation.html yaklaşımı
```

## Korunacak temel özellikler

- ALKAM Mali Yönetim Paneli
- Cari ekranı
- Cari detay / cari geçmişi
- Cari ekstresi ana defter mantığı
- Bakiye B / Bakiye A standardı
- Kaynak kolonu
- Moka United
- Onay Merkezi
- Hesaplar
- Raporlar
- Yedekleme
- Yazdır / Excel mantığı

## Geliştirme kuralı

Yeni geliştirme yapılırken önce mevcut stabil gövde korunur.

Hiçbir önceki özellik kullanıcı onayı olmadan silinmez.

Her güncelleme sonunda mutlaka şu liste verilir:

```text
Yapılanlar
Kalanlar
Kontrol ettiklerim
```

## Sıradaki geliştirme

İlk geliştirme stabil programın Otomasyon sekmesi içine yapılacaktır:

```text
Dış Veri Aktarım Merkezi
- Bizmu Aktarım
- Luca Aktarım
- Banka Aktarım
- Moka Aktarım
- Excel Aktarım
- Telegram / WhatsApp Aktarım
- Zamanlı İşler
```

## Veri güvenliği kuralı

Hiçbir dış veri ana cari ekstresine doğrudan yazılmayacaktır.

Akış:

```text
Dış kaynak
→ Staging
→ Mükerrer kontrol
→ Cari eşleşme
→ Güven puanı
→ Onay Merkezi
→ Kullanıcı onayı
→ Ana kayıt
→ Audit log
```

## Geri dönüş noktası

Bu karar sonrası stabil geri dönüş branch'i oluşturulmuştur:

```text
stabil-program-restore-120526
```

Bu branch, program tekrar dağılırsa geri dönülecek güvenli noktadır.
