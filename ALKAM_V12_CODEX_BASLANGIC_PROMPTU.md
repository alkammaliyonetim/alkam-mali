# ALKAM Mali - v12 Codex Başlangıç Promptu

Bu prompt, yeni bir Codex/ajan oturumunda ALKAM Mali v12 stabilizasyonuna güvenli şekilde başlamak için kullanılacaktır.

## Prompt

ALKAM Mali projesine v12 stabilizasyonu için devam ediyoruz.

Repo:

```text
alkammaliyonetim/alkam-mali
```

Ana canlı site:

```text
alkam-mali.pages.dev
```

Öncelik:

```text
v12: stabilize dashboard and module loading
```

## Mevcut Durum

v11 sonunda şu yapı kuruldu:

- Kurumsal Dashboard
- Dönem Filtresi
- Tek Ekran Modu
- Normal / Kompakt / Ultra görünüm seçici
- Canlı Test Paketi
- Cache / Deploy Kontrol
- Sürüm Rozeti
- v12 Stabilizer
- v12 Preflight
- AI Asistan Merkezi
- Supabase güvenlik katmanı

## Önce Çalıştırılacak Ana Kontrol

Canlı sitede console üzerinden önce şu komut çalıştırılacak:

```js
ALKAM_V12_PREFLIGHT_V1.test()
```

Beklenen:

```text
ready: true
decision: "v12 stabilizasyonuna geçilebilir"
writeOpen: false
```

## Preflight Temizse

İlk teknik commit amacı:

```text
v12: stabilize dashboard and module loading
```

Yapılacaklar:

- Dashboard yükleme sırasını sadeleştir.
- Modül loader zincirini daha okunabilir hale getir.
- Görünüm tercih yöneticisini koru.
- Canlı test / cache kontrol / v12 preflight akışını koru.
- Ana dashboard butonlarını sade tut.

## Preflight Temiz Değilse

Commit mesajı:

```text
fix: resolve v11 live test gaps before v12
```

Önce eksik/riskli modül düzeltilecek.

## Kesin Yasaklar

Bu aşamada kesinlikle yapılmayacaklar:

```text
Supabase yazma açmak
Cari hareketi oluşturmak
Tahakkuk oluşturmak
Tahsilat oluşturmak
Banka hareketi işlemek
Moka kaydı otomatik işlemek
AI ile kayıt oluşturmak
Eski modül silmek
2026 Geçiş adlı sekme veya kavram oluşturmak
```

## Korunacak Değişmez Kurallar

```text
Cari ekstresi ana defterdir.
Banka hareketleri doğrulama / onay katmanıdır.
AI kayıt yapmaz.
Onaysız işlem yapılmaz.
Supabase yazma kapısı kapalıdır.
Moka United banka aktarımı cari tahsilatı sayılmaz.
Eski özellikler kullanıcı onayı olmadan silinmez.
```

## Korunacak Ana Dosyalar

```text
alkam-dashboard-kurumsal-v11.js
alkam-v12-preflight-v1.js
alkam-v12-stabilizer-v1.js
alkam-canli-test-paketi-v11.js
alkam-cache-deploy-kontrol-v11.js
alkam-dashboard-gorunum-tercihi-v11.js
alkam-ai-asistan-merkezi-v11.js
alkam-supabase-write-gate-v10.js
```

## Her Güncelleme Sonrası Rapor Formatı

Her commit/güncelleme sonunda mutlaka şu başlıklarla rapor ver:

```text
Yapılanlar
Kalanlar
Kontrol Ettiklerim
Risk / Not
```

## Kısa Güvenlik Cümlesi

```text
AI kayıt yapmaz, Supabase yazma kapalıdır, cari ekstresi ana defterdir, Moka United banka aktarımı cari tahsilatı sayılmaz.
```
