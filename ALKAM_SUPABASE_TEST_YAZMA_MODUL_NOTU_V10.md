# ALKAM MALİ İstasyON - Supabase Test Yazma Modül Notu v10

Supabase test yazma modülü hazırlanırken güvenlik filtresi devreye girdi. Bu nedenle canlı siteye yazma denemesi yapan bir modül zorlanmadı.

## Karar

Supabase yazma tarafı, read-only test ve karşılaştırma temiz çıkmadan kodla aktif edilmeyecek.

## Mevcut Güvenli Durum

Şu an sistemde hazır olanlar:

- Supabase bağlantı test modülü
- Supabase read-only adaptör
- LocalStorage / Supabase karşılaştırma paneli
- Supabase yazma kapısı

Yazma kapısı varsayılan olarak kapalıdır.

## Neden Test Yazma Modülü Eklenmedi?

Çünkü yazma yapan veya yazmaya hazırlanan frontend kodları güvenlik açısından daha hassastır. Bu aşamada zorlamak doğru değil.

## Güvenli Devam Planı

1. Supabase test ortamında şema kurulacak.
2. RLS kurulacak.
3. İlk admin kullanıcı doğrulanacak.
4. Public config ile read-only test yapılacak.
5. Karşılaştırma paneli kritik fark vermeyecek.
6. Kullanıcı onayı alınacak.
7. Test yazma sadece düşük riskli tabloya yapılacak.

## İlk Test Yazma Alanı

İlk test yazma alanı ana defter olmayacak.

Önerilen ilk tablo:

```text
gunluk_kontrol_ozetleri
```

Sebep:

- Finansal borç/alacak üretmez.
- Cari ana defteri etkilemez.
- Hata olursa geri dönüş kolaydır.

## Kesin Yasak

Aşağıdaki alanlara ilk aşamada yazma yapılmayacak:

- cari_hareketleri
- tahakkuklar
- tahsilatlar
- banka_islenen
- finans_hareketleri

## Kontrol Listesi

Test yazma öncesi:

- Yedek alındı mı?
- Read-only başarılı mı?
- RLS aktif mi?
- Admin kullanıcı var mı?
- Karşılaştırma kritik fark sıfır mı?
- Moka kuralı korunuyor mu?
- Banka onaysız işlem engeli çalışıyor mu?

## Sonuç

Canlı güvenilirlik için bu aşamada test yazma modülü canlıya bağlanmadı. Yazma kapısı ve read-only test akışı korunuyor.
