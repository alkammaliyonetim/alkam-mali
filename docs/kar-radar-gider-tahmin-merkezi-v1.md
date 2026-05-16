# ALKAM Mali Kâr Radar ve Gider Tahmin Merkezi v1

## Net Kaynak Notu

ALKAM Mali bu modülde BizimHesap ile alakalı değildir.

ALKAM Mali tarafındaki ilgili sistem Bizmu’dur.

Kâr Radar / Gider Tahmin Merkezi; ALKAM Mali içindeki kasa, banka, Moka, tahsilat sözleri, gider kayıtları, Telegram gelenleri, Onay Merkezi ve gerektiğinde Bizmu kaynaklı bilgilerle çalışacaktır.

## Amaç

Programın en önemli alanı, anlık kâr pozisyonunu gösterecek merkezi gösterge olacaktır.

Sistem sabit ve değişken giderleri yapay zeka destekli öngörecek, gerçekleşen giderler geldikçe tahmini güncelleyecek ve her tahsilat / satış / gider hareketinden sonra kâra ne kadar yaklaşıldığını gösterecektir.

## Ana Gösterge

```text
Bugünkü durum: +10.000 TL öndeyiz
Bugünkü durum: -18.500 TL gerideyiz
Ay sonu tahmini kâr: 245.000 TL
Ay sonu hedef farkı: +35.000 TL
```

## Nakit / Moka / Kasa / Banka Karşılama Göstergesi

```text
Nakit kasa
+ Banka bakiyesi
+ Ay sonuna kadar Moka'dan bankaya geçecek tutar
+ Ay sonuna kadar beklenen tahsilatlar
- Ay sonuna kadar ödenecek giderler
= Nakit karşılama farkı
```

## Ana Dashboard Kartları

```text
1. Bugünkü Kâr Pozisyonu
2. Ay Sonu Tahmini Kâr
3. Öngörülen Giderler
4. Gerçekleşen Giderler
5. Kalan Gider Riski
6. Tahsilat Hedefine Kalan
7. Nakit + Banka + Moka Karşılama
8. Ay Sonuna Kadar Gider Karşılama Oranı
```

## Güvenlik

```text
Öngörü ayrı tutulur.
Gerçekleşen ayrı tutulur.
Tahmin kesin kayıt değildir.
Onaysız gider kesinleşmez.
Onaysız cari ekstresi değişmez.
Moka bekleyen tahsilat ayrı izlenir.
```
