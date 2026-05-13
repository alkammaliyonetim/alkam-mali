# ALKAM Mali / İstasyON Son Durum Kontrol Raporu

## Tarih

12.05.2026

## Ana karar

Program artık stabil yedekten doğrudan ana dosyalara alınmıştır.

## Ana dosyalar

```text
admin.html
index.html
```

Bu iki dosya stabil program gövdesini taşır.

## Kaynak stabil dosya

```text
backups/index_before_25apr_stable_restore_20260428_125756.html
```

## Yönlendirme durumu

```text
/admin.html -> /admin.html
/admin -> /admin.html
/admin/ -> /admin.html
/program -> /admin.html
/program.html -> /admin.html
```

## Worker durumu

`_worker.js` sade moddadır.

HTML içine otomatik çoklu JS modülü basmamaktadır.

## Çekirdek önceliği

Aşağıdaki alanlar çalışmadan yeni otomasyon eklenmeyecektir:

```text
Cari listesi
Cari seçimi
Sağ cari detay paneli
Cari geçmişi / cari ekstresi
Bakiye B / Bakiye A
Kaynak kolonu
Yazdır / Excel
Onay Merkezi
```

## Bot kontrol durumu

`live-cari-check.yml` dosyası eklendi ve güncellendi.

Ancak GitHub Actions run listesi bağlantı aracı üzerinden görünmedi.

Bu nedenle canlı görsel kontrol için workflow dispatch veya GitHub Actions ekranı kontrolü gerekir.

## Devam kuralı

1. Önce canlı admin.html çekirdeği kontrol edilir.
2. Cari geçmişi görünmeden otomasyon yapılmaz.
3. Otomasyon modülleri canlı dosyaya doğrudan gömülmez.
4. Her modül önce ayrı branch üzerinde test edilir.
5. Kontrol geçmeden main'e alınmaz.
