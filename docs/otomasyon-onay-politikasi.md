# Otomasyon ve Onay Politikasi

Bu politika, ALKAM programinda hiz ile kontrolu birlikte korumak icin sabit kabul edilir.

## Ana Prensip

Program hizli calisir; kesin muhasebe etkisi kullanici kontrolunde kalir.

## Otomatik Olabilecekler

- Belge alma
- OCR/AI okuma
- Moka/POS aday kayit olusturma
- Banka ekstresi aday kayit olusturma
- Taksit plani olusturma
- Beklenen yatış listesi olusturma
- Eslesme onerisi olusturma
- Yuksek guvenli kayitlari `onaya hazir` durumuna alma

Bu islemler kesin cari veya banka hareketi olusturmaz.

## Onay Gerektirenler

- Cari hesaba isleme
- Banka hesabina kesin hareket yazma
- Toplu onay
- Kayit silme
- Yetki veya ayar degistirme
- WhatsApp, Telegram veya AI servis tokeni baglama

Bu islemler kullanici onayi olmadan yapilmaz.

## Yapilmayacaklar

- AI/OCR sonucunu otomatik kesin muhasebe kaydina cevirmek
- Ana program icinde agir OCR motoru calistirmak
- Ana `index.html` dosyasini buyuk entegrasyonlarla sisirmek
- Eski kayitlari topluca ve riskli sekilde donusturmek

## Teknik Uygulama

Makine tarafindan okunabilir politika dosyasi:

`alkam-automation-policy.json`

API endpoint:

`/api/automation-policy`

Yeni moduller bu politikayi referans alarak tasarlanmalidir. Belge okuma, aday kayit ve eslesme otomatik olabilir; kesin finansal mutasyon kullanici onayi ister.
