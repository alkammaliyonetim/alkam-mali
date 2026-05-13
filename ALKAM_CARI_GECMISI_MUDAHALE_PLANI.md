# ALKAM Mali / Cari Geçmişi Müdahale Planı

## Güncel güvenli nokta

Branch:

```text
stable-admin-cari-selftest-120526
```

Commit:

```text
8bb94e22644e44b9453eef0de31cad7cdd74c519
```

## Canlı kontrol linki

```text
https://alkam-mali.pages.dev/admin.html?v=8bb94e
```

## Worker yükleme kuralı

Worker yalnızca şu kontrollü dosyaları yükler:

```text
alkam-cari-core-v4.js
alkam-v12-wide-layout-fix-v1.js
alkam-cari-self-test-v1.js
```

## Öz test sonucu nasıl okunur?

Ekranın sağ altında şu rozet çıkar:

```text
CARİ GEÇMİŞİ: ÇALIŞIYOR
```

veya

```text
CARİ GEÇMİŞİ: KONTROL GEREKİYOR
```

## Çalışıyor ise

Bu sürüm sağlam temel kabul edilir.

Sonra otomasyon geliştirmesi ayrı branch üzerinde başlar.

## Kontrol gerekiyorsa

Artık yeni modül eklenmez.

Doğrudan şu hedefe müdahale edilir:

```text
admin.html içindeki cari seçim / cari detay render bölümü
```

## Müdahale standardı

Aşağıdaki akış garanti edilecek:

```text
Sol cari listesi
→ cari seçimi
→ selectedCariDetail alanı
→ cari adı / bakiye kartları
→ cari geçmişi tablosu
→ Kaynak kolonu
→ Borç / Alacak / Bakiye
```

## Yasak

```text
Yeni dashboard yazmak
Yeni istasyon.html oluşturmak
Worker üzerinden çoklu modül basmak
Otomasyon eklemek
Iframe/kabuk kullanmak
```

## Devam sırası

1. Canlı rozet sonucu okunacak.
2. Kontrol gerekiyorsa admin.html render fonksiyonu düzeltilecek.
3. Cari geçmişi çalışmadan otomasyon yok.
4. Çekirdek çalışınca geri dönüş branch'i güncellenecek.
