# ALKAM Mali / İstasyON Çekirdek Güvenlik Kuralı

## Amaç

Programın ana çekirdeği önce sağlam çalışacaktır.

Öncelik sırası:

1. Cari listesi açılacak.
2. Cari seçilince sağ tarafta cari detay açılacak.
3. Cari geçmişi / cari ekstresi görünür olacak.
4. Bakiye B / Bakiye A standardı korunacak.
5. Kaynak kolonu korunacak.
6. Yazdır / Excel mantığı korunacak.

## Worker kuralı

`_worker.js` dosyası program HTML'ine otomatik JS modülü enjekte etmeyecektir.

Sebep:

Ek modüller cari detay ve cari geçmişi gibi çekirdek alanlara müdahale edebilir.

Bu nedenle canlı programda önce stabil HTML kendi içinde çalışacaktır.

## Yasaklı yaklaşım

Aşağıdaki yaklaşım kullanıcı onayı olmadan kullanılmayacaktır:

```text
_worker.js üzerinden çoklu JS dosyası otomatik yüklemek
cari ekranına dışarıdan patch basmak
cari geçmişi alanını başka modülle override etmek
stabil programa iframe/kabuk eklemek
istasyon.html üzerinden devam etmek
```

## Yeni modül ekleme standardı

Yeni modül önce ayrı branch üzerinde hazırlanır.

Sonra şu kontroller yapılır:

```text
Cari seçimi çalışıyor mu?
Cari geçmişi görünüyor mu?
Bakiye değişiyor mu?
Kaynak kolonu duruyor mu?
Yazdır / Excel bozuldu mu?
Onay Merkezi duruyor mu?
```

Bu kontroller geçmeden canlıya alınmaz.

## Güncel güvenli durum

Canlı program stabil yedeğe bağlıdır:

```text
backups/index_before_25apr_stable_restore_20260428_125756.html
```

`_worker.js` sade modda çalışmaktadır ve HTML'e ek modül basmamaktadır.
