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

`_worker.js` kontrollü modda çalışmaktadır.

HTML içine rastgele çoklu JS modülü basmamaktadır.

Yalnızca aşağıdaki güvenli çekirdek modüller yüklenir:

```text
alkam-cari-core-v4.js
alkam-v12-wide-layout-fix-v1.js
```

## Bu iki modülün görevi

```text
alkam-cari-core-v4.js:
Cari geçmişi / ekstre tablosu, Kaynak kolonu, Borç / Alacak / Bakiye kontrolü, Müşteri Ekstresi.

alkam-v12-wide-layout-fix-v1.js:
Cari detay alanının görünürlük ve genişlik düzeni.
```

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

Commit bazlı run listesi bağlantı aracında görünmeyebilir. Bunun sebebi kullanılan GitHub aracının commit run sorgusunda yalnızca belirli tetik tiplerini döndürmesidir.

Görsel kontrol için workflow run/artifact yolu kullanılacaktır.

## Geri dönüş noktası

Aşağıdaki branch sağlam geri dönüş noktasıdır:

```text
stable-admin-cari-core-120526
```

## Devam kuralı

1. Önce canlı admin.html çekirdeği kontrol edilir.
2. Cari geçmişi görünmeden otomasyon yapılmaz.
3. Otomasyon modülleri canlı dosyaya doğrudan gömülmez.
4. Her modül önce ayrı branch üzerinde test edilir.
5. Kontrol geçmeden main'e alınmaz.
