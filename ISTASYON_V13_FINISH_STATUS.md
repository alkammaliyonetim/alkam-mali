# İstasyON v13 — Bitirme / Production Readiness Paketi

## 27.09.2026 durumu

İstasyON'un kalıcı muhasebe-operasyon çekirdeği artık şu katmanları kapsar:

1. **73 aktif cari kanonik açılış paketi** — PDF/liste mutabakatlı.
2. **Cutover staging + freeze guard** — kullanıcı onayı ve tam mutabakat olmadan dondurulamaz.
3. **Open-item modeli** — tahakkuk/tahsilat mahsup mantığı ve approval-gated allocation.
4. **Halkbank/Moka belge girişi** — Gmail → güvenli kuyruk, kesin cari kaydı yok.
5. **Banka raw + eşleştirme** — idempotent raw ingest, cari önerisi, ayrı onay.
6. **Belge arşiv bağlantısı** — Drive file/path/SHA-256 → işlem/cari kanıt ilişkisi.
7. **Audit trail** — önemli değişiklikler kaynak/önce/sonra/onay ile izlenir.
8. **RLS / yetki sınırı** — anon erişim yok; authenticated read; hassas write guarded RPC/service role.
9. **Yönetim read modelleri** — cari kontrol, açık kalem, aging, banka review, belge search, control center.

## Yeni dosyalar

- `sql/istasyon-v13-operational-services.sql`
- `sql/istasyon-v13-security.sql`
- `ISTASYON_V13_FINISH_STATUS.md`

## Muhasebe davranışı

```text
Kaynak belge / banka hareketi
→ raw/staging
→ cari eşleşme önerisi
→ insan onayı
→ açık kalem mahsup / posting adayı
→ hedef sistem write
→ readback kanıtı
→ audit event + belge linki
```

**Banka geldi diye cari otomatik kapanmaz.**
**Moka banka yatışı tek başına müşteri tahsilatı değildir.**
**Belge varsa finansal hareketle ilişkilendirilir; belge yoksa hareket 'belge bekliyor' olarak yaşayabilir.**

## Canlı kullanım için kalan zorunlu dış adımlar

Bunlar kodla tahmin edilemez ve açıkça doğrulanmalıdır:

- Supabase'te v13 migration paketinin uygulanması.
- Canlı DB yedeği.
- Kullanıcının gerçek **cutover tarihi** kararı.
- Şamil Çelik / Halil Esen / Şule Aras kimlik-dönem ayrımının kesinleştirilmesi.
- Çolkan / Özdinler ileri tarih satırlarının seçilen cutover'a göre tekrar hesaplanması.
- Google Apps Script `istasyonAlkamTetikleyiciKur()` bir defa yetkilendirilip canlı trigger'ın doğrulanması.

Bu kapılar geçmeden kesin açılış/final posting yapılmaz.

## Kabul kriteri

- 73/73 master eşleşme
- açılış net = **3.741.583,88 TL**
- PDF/list fark = **0**
- open-item reconstruction diff = **0**
- banka source_hash duplicate engeli
- approval_ref olmadan allocation/posting = **reddedilir**
- bank posted durumu için approval_ref + final_posting_ref zorunlu
- finansal write testlerde **0**
