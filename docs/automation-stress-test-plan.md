# ALKAM Otomasyon Stres Test Planı v1

Bu plan, Otomasyon Merkezi modülleri production'a yaklaşmadan önce uygulanacak zorunlu stres testlerini tanımlar.

## Ana Kural

Stres testleri geçmeden otomasyon modülleri production'a alınmayacak.

## Test Grupları

### 1. Veri Hacmi Testi

Amaç: Programın çok sayıda cari ve hareketle bozulmadığını görmek.

Senaryolar:

- 77 mevcut cari ile çalışır.
- 250 cari simülasyonu.
- 500 cari simülasyonu.
- 1.000 cari simülasyonu.
- Her caride 12 ay hareket.
- Her caride 100 hareket.

Beklenen:

- Sayfa açılmalı.
- Otomasyon paneli açılmalı.
- Raporlar hesaplanmalı.
- Tarayıcı kilitlenmemeli.
- Ana veri silinmemeli.

### 2. Yanlış / Eksik Veri Testi

Amaç: Eksik veya bozuk verinin programı kırmaması.

Senaryolar:

- Cari adı boş.
- Cari kodu boş.
- Tutar boş.
- Tutar yazı olarak girilmiş.
- Tarih hatalı.
- Kaynak kolonu boş.
- Açıklama çok uzun.
- Aynı işlem numarası tekrar edilmiş.

Beklenen:

- Program hata vermemeli.
- Uyarı üretmeli.
- Onay Merkezi'ne öneri gerekiyorsa öneri olarak düşmeli.
- Kesin sonuç işlemi oluşmamalı.

### 3. Mükerrer Kayıt Testi

Amaç: Aynı kayıtların iki kere işlenmesini engellemek.

Senaryolar:

- Aynı banka hareketi iki kez yüklenir.
- Aynı Telegram mesajı iki kez gelir.
- Aynı tarih/tutar/açıklama ile kayıt tekrar gelir.
- Aynı belge adı tekrar yüklenir.

Beklenen:

- Mükerrer uyarısı oluşmalı.
- İkinci kayıt otomatik işlenmemeli.
- Kullanıcı onayı olmadan sonuç oluşmamalı.

### 4. Onay Güvenliği Testi

Amaç: Kullanıcı onayı olmadan sonuç işlemi oluşmadığını doğrulamak.

Senaryolar:

- Öneri modülü açıkken kayıt gelir.
- Güven puanı yüksek kayıt gelir.
- Cari adayı net görünen kayıt gelir.
- Moka benzeri kayıt gelir.
- Banka benzeri kayıt gelir.

Beklenen:

- Sadece öneri oluşmalı.
- Durum beklemede kalmalı.
- Onay verilmeden kesin sonuç oluşmamalı.

### 5. Otomasyon Aç/Kapat Testi

Amaç: Paneldeki ana güvenlik anahtarlarının doğru çalışması.

Senaryolar:

- Tüm güvenli modüller açık.
- Öneri modülleri öneri modunda.
- Riskli modüller kapalı.
- Tümünü kapat butonu çalışır.
- Sayfa yenilenince durum korunur.

Beklenen:

- Tümünü kapat sonrası açık riskli modül kalmamalı.
- Güvenlik bayrakları doğru yayınlanmalı.
- Test scripti geçmeli.

### 6. Mobil Kullanım Testi

Amaç: Kullanıcının telefondan yönetim hedefini doğrulamak.

Senaryolar:

- Otomasyon paneli iPhone genişliğinde açılır.
- Onay Merkezi mobilde okunur.
- Cari arama mobilde çalışır.
- Modül kartları taşma yapmaz.
- Butonlar yanlışlıkla basılmayacak şekilde görünür.

Beklenen:

- Mobil görünüm bozulmamalı.
- Kritik butonlar açık uyarı taşımalı.
- Onay ekranı okunabilir olmalı.

### 7. Geri Alma / Yedek Testi

Amaç: Test sonrası veri geri alınabilir mi doğrulamak.

Senaryolar:

- Testten önce yedek alınır.
- Test verisi yüklenir.
- Test verisi temizlenir.
- Yedek geri yüklenir.

Beklenen:

- Ana veri geri dönebilmeli.
- Test verisi kalıcı hasar bırakmamalı.
- İşlem izi oluşmalı.

## Kabul Kriterleri

- Program açılıyor.
- Otomasyon paneli açılıyor.
- Onay Merkezi çalışıyor.
- Ana cari veri silinmiyor.
- Onaysız sonuç işlemi oluşmuyor.
- Mükerrer kayıt uyarısı üretiliyor.
- Mobil görünüm kullanılabilir.
- Stres test çıktıları PR altında raporlanıyor.

## Merge Kararı

Bu test planı uygulanmadan otomasyon modülü PR'ı ready/merge yapılmayacak.
