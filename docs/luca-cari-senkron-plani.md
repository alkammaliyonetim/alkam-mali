# Luca Cari Senkron Planı

## Amaç

Luca muhasebe programındaki müşteri listesini ALKAM Mali cari kartlarıyla karşılaştırmak.

## Yapılacak İş

- Mevcut cari listesi korunacak.
- Mevcut cari hareketleri silinmeyecek.
- Aylık ücretler korunacak.
- Eksik müşteriler yeni cari olarak eklenecek.
- Eşleşen carilerin kimlik, vergi dairesi, kısa ad, uzun ad, kuruluş ve kapanış bilgileri güncellenecek.
- İşlem finansal kayıt oluşturmayacak.
- Sadece müşteri/cari ana kart bilgisi güncellenecek.

## Kaynak

Kullanıcının paylaştığı Luca müşteri listesi.

## Güvenlik

- Onaysız finansal hareket oluşturulmaz.
- Cari hareketleri ve bakiyeler korunur.
- Senkron işleminden önce ön izleme yapılır.
- Eklenecek ve güncellenecek müşteri sayısı gösterilir.
