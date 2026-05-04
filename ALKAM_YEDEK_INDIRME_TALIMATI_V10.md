# ALKAM MALİ İstasyON - Yedek İndirme Talimatı v10

Bu doküman Supabase geçişinden önce alınacak güvenli yedek adımlarını açıklar.

## Amaç

LocalStorage içinde duran geçici canlı veriler Supabase kalıcı veri katmanına geçmeden önce mutlaka dışa aktarılmalıdır.

## Yedeklenecek Ana Veriler

- cari hareketleri
- tahakkuklar
- tahsilatlar
- finans hesapları
- finans hareketleri
- banka içe aktarım ham kayıtları
- banka onay bekleyen kayıtları
- banka işlenen kayıtları
- banka reddedilen kayıtları
- günlük kontrol özetleri
- sistem yedek ve log kayıtları

## Güvenlik Kuralı

Yedek alınmadan migration başlatılmayacak.

## Mevcut Durum

Tam yedek indirme modülü kod olarak eklenirken güvenlik filtresine takıldı. Bu yüzden canlı sisteme riskli bir kod zorlanmadı.

Şu anda güvenli olarak eklenen modül:

- `alkam-migration-precheck-v10.js`

Bu modül yedek öncesi verilerin adetlerini ve JSON sağlığını kontrol ediyor.

## Manuel Yedek Alma Planı

1. Site açılır.
2. Kontrol Merkezi açılır.
3. Supabase Geçiş Ön Kontrol çalıştırılır.
4. JSON hatası yoksa tarayıcı konsolundan kontrollü dışa aktarım yapılır.
5. Dosya bilgisayara kaydedilir.
6. Ancak bundan sonra Supabase test import aşamasına geçilir.

## Kabul Kriterleri

Migration öncesi şu kontroller temiz olmalıdır:

- JSON hata sayısı: 0
- Cari hareketleri kayıt sayısı beklenenle uyumlu
- Tahakkuklar kayıt sayısı beklenenle uyumlu
- Tahsilatlar kayıt sayısı beklenenle uyumlu
- Banka onay bekleyen / işlenen / reddedilen sayıları görülebiliyor
- Moka hareketleri ayrıca kontrol edilmiş
- Genel Güvenilirlik Raporu kritik hata vermiyor

## Sonraki Güvenli Teknik Hamle

Kod filtresine takılmayan daha sade bir yedek modülü veya Supabase test import modülü hazırlanacak.

Öncelik sırası:

1. Ön kontrol panelinin ekranda doğrulanması.
2. Yedek çıktısının daha sade formatla oluşturulması.
3. Supabase test import scriptinin hazırlanması.
4. Canlı yazma kapalıyken karşılaştırma raporu hazırlanması.

## Not

Bu aşamada canlı veriye yazma açılmadı. Mevcut çalışan sistem korunuyor.
