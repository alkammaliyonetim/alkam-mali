# TG Cloud Panel Preview Sonuç Şablonu

Bu şablon Issue #27 Cloudflare panel testi tamamlandıktan sonra doldurulacaktır.

## Test Bilgisi

- Tarih:
- Test eden:
- Cloudflare hesabı:
- Worker/test alanı:

## Panel Kontrolü

- [ ] Doğru Cloudflare hesabı kullanıldı.
- [ ] TG Cloud için ayrı test alanı kullanıldı.
- [ ] `TG_QUEUE` binding tanımlandı.
- [ ] Gizli değerler sadece Cloudflare panelinde tutuldu.
- [ ] Gerçek değerler GitHub, PR, issue veya ChatGPT mesajına yazılmadı.

## Endpoint Kontrolü

| Test | Beklenen | Sonuç | Not |
|---|---:|---:|---|
| `GET /` | 200 |  |  |
| Webhook yetkisiz istek | 401 |  |  |
| Webhook yetkili test isteği | 200 |  |  |
| Queue yetkisiz okuma | 401 |  |  |
| Queue URL query ile okuma | 401 |  |  |
| Queue yetkili header ile okuma | 200 |  |  |

## Kuyruk Kontrolü

- [ ] `source = Telegram Cloud`
- [ ] `status = Kuyrukta`
- [ ] `suggested.amount = 1250.75`
- [ ] `suggested.date = 2026-05-17`
- [ ] `suggested.confidence = 0`
- [ ] Kesin cari/banka/kasa/Moka/muhasebe kaydı oluşmadı.

## Karar

- [ ] Panel preview başarılı.
- [ ] Eksik var, PR #26 ready yapılmamalı.

## Kapanış Kuralı

Bu sonuç doldurulmadan Issue #27 kapatılmayacak.

Issue #27 kapatılmadan PR #26 ready/merge yapılmayacak.
