# İstasyON v13 — Durable Core Durum ve Canlıya Geçiş

## Amaç

İstasyON'u Bizmu'dan bağımsız, yıllarca sürdürülebilir bir ALKAM mali müşavirlik operasyon sistemi haline getirmek.

Çekirdek ilke:

- **Cari kart** master veridir.
- **Cari ekstresi / ledger** finansal alt defterdir.
- **Açık kalem** tahakkuk ve tahsilatın neyi kapattığını izler.
- **Banka / Moka / belge** önce staging + eşleştirme + onay katmanına girer.
- **Kesin finansal posting** kullanıcı onayı ve son kaynak doğrulaması olmadan yapılmaz.
- **Orijinal belge** finansal hareketten kopuk kalmaz.
- **Geçmiş Bizmu verisi** silinmez; kaynak/provenance olarak korunur.

## 26.09.2026 kanonik veri durumu

- Aktif cari: **73**
- PDF + liste mutabakatlı açılış hedefi: **3.741.583,88 TL**
- Borç bakiye toplamı: **3.782.783,88 TL**
- Kredi/alacak bakiye toplamı: **41.200,00 TL**
- Eski JSON son bakiye toplamı: **4.127.300,88 TL**
- JSON ile kanonik açılış arasındaki net fark: **385.717,00 TL**
- Kimlik/dönem manuel kontrol: **Şamil Çelik, Halil Esen, Şule Aras**
- İleri dönem kontrol: **Çolkan, Özdinler**
- Canlı finansal yazma: **KAPALI / ONAY GEREKLİ**

Kanonik açılış kaynakları:

- `data/istasyon-opening-seed-20260926.json`
- `data/istasyon-v13-source-controls.json`
- Orijinal denetim dosyası: `Istasyon_Acilis_Cari_Defteri_Preflight_20260926.xlsx`

## Eklenen v13 çekirdek

### 1. Durable ERP staging şeması

`sql/istasyon-v13-durable-core.sql`

Ek yapılar:

- `istasyon_cutover_runs`
- `istasyon_opening_balances`
- `istasyon_open_items`
- `istasyon_allocations`
- `istasyon_bank_raw`
- `istasyon_bank_matches`
- `istasyon_documents`
- `istasyon_document_links`
- `istasyon_audit_events`

Read modeller:

- `v_istasyon_opening_reconciliation`
- `v_istasyon_open_items`
- `v_istasyon_bank_review`
- `v_istasyon_cari_control`
- `v_istasyon_bank_ready_for_posting`

Bu migration **mevcut cari/ekstre verisini silmez** ve **cari_ekstre_lines'a otomatik finansal hareket yazmaz**.

### 2. 73 cari kanonik opening seed

`data/istasyon-opening-seed-20260926.json`

Bu dosyada 73 carinin PDF/list mutabakatlı açılış adayı vardır. Eski JSON son bakiyesi açılış olarak kullanılmaz.

### 3. Güvenli cutover staging generator

`tools/istasyon-v13-build-opening-sql.mjs`

Kullanım:

```bash
ISTASYON_CUTOVER_DATE=YYYY-MM-DD npm run build:istasyon-opening
```

Araç yalnız:

- cutover run taslağı,
- opening balance staging satırları,

üretir. Kesin cari ekstresine posting yapmaz.

### 4. Kaynak preflight

`tools/istasyon-v13-preflight.mjs`

Kontroller:

- 73 cari,
- legacy JSON toplamı,
- kanonik fark,
- kimlik riskleri,
- ileri dönem hareketleri,
- mükerrer cari ID,
- sayısal bakiye,
- negatif aylık ücret kontrolü.

### 5. Kontrol Kulesi

`istasyon-v13-control-tower.js`

Ana ekranda:

- 73 aktif cari,
- geçmiş hareket sayısı,
- kanonik açılış,
- legacy JSON farkı,
- Halkbank/mail kuyruk durumu,
- kimlik/dönem riskleri,
- yazma kilidi,

tek ekranda gösterilir.

### 6. Güvenli durum endpointi

`GET /api/istasyon/status`

Kişisel mail içeriği döndürmez; yalnız aggregate sağlık/sayaç bilgisi verir.

## Halkbank

Halkbank günlük ekstreleri Gmail'de geliyor. İstasyON mimarisinde:

```text
Gmail → Ekstre eki → Parser → Bank Raw → Cari eşleşme önerisi
      → Onay Merkezi → Açık kalem mahsup → Cari/finans ledger → readback
```

**Banka hareketi geldi diye cari otomatik kapanmaz.** Moka aktarımı da cari tahsilatı değildir.

## Belgeler

Hedef akış:

```text
Fotoğraf/PDF → orijinal arşiv → SHA-256 → belge indeksi
→ cari/işlem eşleştirme → onay → posting → readback
```

Belge yoksa finansal hareket yine kaydedilebilir; durum **belge bekliyor** olur.

## Canlıya geçiş kapıları

Aşağıdakiler sağlanmadan kesin cutover yapılmaz:

1. 73 cari master eşleşmesi = 73/73
2. Açılış toplamı = 3.741.583,88 TL
3. PDF/list farkı = 0
4. Şamil/Halil/Şule kimlik ayrımı çözülmüş
5. Çolkan/Özdinler ileri dönem satırları cutover dışında doğru sınıflanmış
6. Banka duplicate/idempotency testleri geçmiş
7. Moka banka aktarımı cari tahsilatı sayılmıyor
8. Belge linkleri kaynak ref ile korunuyor
9. Supabase/Durable DB yedeği alınmış
10. Kullanıcı cutover tarihini açıkça onaylamış

## Kullanıcı deneyimi

İstasyON'un hedef günlük kullanımı:

- "Ahmet Samanlı cari"
- "Bu ay kimler ödemedi?"
- "Halkbank bugün ne geldi?"
- "SİDAR PERÇİN son tahsilat"
- "Eylül tahakkuklarını göster"
- "001889 makbuzunu getir"
- "30 Haziran söz verenleri göster"

Sonuç tek ekranda finansal özet + hareket + kaynak belge ile döner.

## Güvenlik

- Secret/service-role frontend'e konmaz.
- Finansal posting exact payload + approval ile yapılır.
- Mükerrer fingerprint/idempotency zorunludur.
- Kullanıcı düzeltmesi eski gerçeği silmez; supersede eder.
- Read-only analiz ve staging otomatik olabilir.
- Kesin finansal mutation açık onay gerektirir.
