# ALKAM Mali / İstasyON Program Sabitleme Kararı

## Ana karar

Link değişebilir. Cloudflare preview adresi değişebilir. Gerekirse repo ve yayın yapısı da değişebilir.

Asıl amaç:

```text
Program eksiksiz çalışacak.
Program beğenilen ana gövdeden devam edecek.
ChatGPT/GitHub üzerinden güncellenebilir olacak.
```

## Ana program dosyası

```text
index.html
```

Bu dosya programın çalışan ana gövdesidir.

## Sabit giriş dosyaları

Aşağıdaki girişler aynı ana programa bağlanacaktır:

```text
/program.html
/admin.html
/admin
/
```

## Korunacak modüller

- Dashboard
- Cariler
- Hesaplar
- Onay Merkezi
- Otomasyon
- Raporlar
- Yedekleme
- Cari Ekstre
- Moka United
- Ödeme Sözü
- Muhasebe Ücreti Yönetimi
- Extre Yazdır / Excel

## Kaldırılan yanlış yönler

- Ayrı automation.html yaklaşımı kullanılmayacak.
- iframe/kabuk yaklaşımı kullanılmayacak.
- Sadece geçici Cloudflare hash linklerine bağımlı kalınmayacak.
- Yeni geliştirme ayrı sayfaya kaçmayacak.

## Geliştirme standardı

Her yeni özellik mevcut programın içine modül olarak eklenecek.

Önce:

```text
Otomasyon > Dış Veri Aktarım Merkezi
```

Sonra:

```text
Staging
Onay Merkezi bağlantısı
Bizmu aktarım
Luca aktarım
Banka aktarım
Moka aktarım
Excel aktarım
Telegram / WhatsApp aktarım
Zamanlı işler
```

## Veri güvenliği kuralı

Hiçbir dış veri ana cari ekstresine doğrudan işlenmeyecek.

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

## Bundan sonraki ana çalışma linki

Üretim linki Cloudflare tarafından belirlenecek. Eski beğenilen sürüm referans olarak tutulur:

```text
https://0e46431c.alkam-mali.pages.dev/admin.html
```

Ancak yeni geliştirmeler GitHub main üzerinden yayınlanan güncel programa işlenecektir.
