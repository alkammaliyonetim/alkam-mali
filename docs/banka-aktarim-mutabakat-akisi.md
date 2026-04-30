# Banka Aktarım ve Mutabakat Akışı

Bu akış, eski programdan veya banka ekstresinden gelen banka hareketlerinin ALKAM Mali Yönetim içinde kontrollü şekilde işlenmesi için tasarlandı.

## Amaç

- Excel, CSV veya kopyala/yapıştır ile banka hareketlerini okumak.
- Sarı işaretli / daha önce işlenmiş satırları mevcut kayıtlarla karşılaştırmak.
- İşlenmemiş satırlar için aday işlem yeri önermek.
- Hiçbir kaydı doğrudan muhasebeye işlememek; önce onaya sunmak.
- Onay sonrası hesap işlem kuyruğu ve denetim izi oluşturmak.

## Ekran

Canlı yol:

`/banka-aktarim-mutabakat.html`

## Desteklenen veri

Beklenen temel kolonlar:

- Tarih
- Açıklama
- Tutar

Örnek:

```text
01.01.2025	000000003166185/PAU1 POS Aidat VP726724/000001488709630	-14,29
01.01.2025	ERCAN ALAYLI 'DAN ELİT DEFTER , Türkiye Garanti Bankası A.Ş.	8000
```

## Sarı işaretli satırlar

Excel dosyasındaki sarı dolgu okunabiliyorsa sistem bu satırları `Sarı Kontrol` olarak işaretler. Tarayıcıdaki Excel okuyucu her dosyada renk bilgisini garanti etmeyebilir. Bu yüzden ayrıca şu kontroller de yapılır:

- Aynı tutar
- Aynı tarih
- Açıklama benzerliği
- Daha önce onaylanmış banka aktarımı
- Yerel hesap işlem kuyruğu
- Moka/POS banka aday kayıtları

## Öneri kuralları

İlk sürümde güvenli kural tabanlı öneri kullanılır:

- `POS Aidat`, `EFT MASRAFI`, `MASRAF`: banka gideri
- `BATCH VALOR`, `POS Satış`: POS tahsilatı
- `maaş`: personel ödemesi
- `kredi kart`: kredi kartı ödemesi
- `transfer`, `IBAN`: virman / hesaplar arası transfer
- `'DAN`, `gelen ödeme`: cari tahsilat
- Negatif belirsiz hareket: gider / ödeme adayı
- Pozitif belirsiz hareket: cari tahsilat adayı

## Onay standardı

Sistem öneri üretir ama kesin kayıt oluşturmaz. Kullanıcı onaylayınca:

- `alkam_bank_import_approvals_v1` içine onay kaydı yazılır.
- `alkam_local_account_ops_v1` içine hesap işlem kuyruğu yazılır.
- `alkam_bank_import_audit_v1` içine denetim izi yazılır.

## Sonraki geliştirme

- Gerçek cari kartlarla otomatik eşleştirme.
- Banka hesap planı ve kasa hesapları ile net bağlantı.
- Çek/senet modülü ile karşılıklı kontrol.
- OCR/AI servisinden gelen banka ekstresi görüntülerini aynı kuyruğa düşürme.
- Toplu aktarım raporu ve geri alma paketi.
