# ALKAM Mali Kâr Radar ve Gider Tahmin Merkezi v1

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

## Temel Mantık

```text
Tahmini gelirler
- Tahmini sabit giderler
- Tahmini değişken giderler
- Mal maliyeti
= Öngörülen kâr

Gerçekleşen tahsilatlar
- Gerçekleşen giderler
- Gerçekleşen mal maliyeti
= Gerçekleşen kâr

Gerçekleşen kâr - Bugüne düşen hedef kâr = Önde / Geride durumu
```

## Nakit / Moka / Kasa / Banka Karşılama Göstergesi

Finans tarafında ayrıca şu gösterge zorunlu olacaktır:

```text
Nakit kasa
+ Banka bakiyesi
+ Ay sonuna kadar Moka'dan bankaya geçecek tutar
+ Ay sonuna kadar beklenen tahsilatlar
- Ay sonuna kadar ödenecek giderler
= Nakit karşılama farkı
```

Bu gösterge, mevcut nakit ve beklenen para girişlerinin ay sonuna kadar giderlerin ne kadarını karşıladığını gösterecektir.

Örnek:

```text
Nakit kasa: 45.000 TL
Banka: 120.000 TL
Moka'dan gelecek: 180.000 TL
Beklenen tahsilat: 250.000 TL
Ay sonuna kadar gider: 510.000 TL
Karşılama oranı: %117
Durum: +85.000 TL rahatız
```

Negatif durumda:

```text
Durum: -75.000 TL açık var
```

## Gider Sınıfları

### Sabit Giderler

```text
Kira
Maaş
SGK / vergi periyodik ödemeleri
Kredi taksitleri
Aidat / abonelik
Sözleşmeli hizmetler
Düzenli yazılım / sistem giderleri
```

### Değişken Giderler

```text
Mal alımı
Kargo / navlun
Komisyon
POS / Moka kesintileri
Tek seferlik masraflar
Fatura bazlı giderler
Beklenmeyen giderler
Cari / tedarikçi ödemeleri
```

## Yapay Zeka Öngörü Mantığı

Yapay zeka şunlara göre gider öngörüsü yapacak:

```text
Geçmiş ay ortalaması
Son 3 ay trendi
Aynı ay geçen yıl verisi
Sabit ödeme sözleşmeleri
Bekleyen ödeme sözleri
Yaklaşan kredi / kart / vergi / SGK ödemeleri
Satış hacmine bağlı değişken gider oranı
Moka / POS tahsilat gecikmesi
Kargo / navlun geçmiş oranı
```

## Gün İçi Dinamik Güncelleme

Her yeni hareketten sonra ana gösterge yeniden hesaplanacak:

```text
Yeni tahsilat geldi
→ Gerçekleşen gelir artar
→ Kâra kalan fark azalır
→ Gösterge güncellenir

Yeni gider geldi
→ Gerçekleşen gider artar
→ Kâr pozisyonu düşer
→ Gösterge güncellenir

Yeni satış geldi
→ Mal maliyeti hesaplanır
→ Brüt kâr güncellenir
→ Değişken gider payı yeniden hesaplanır

Moka'dan bankaya geçecek tutar güncellendi
→ Ay sonu nakit karşılama farkı güncellenir

Yeni beklenen tahsilat girildi
→ Gider karşılama oranı güncellenir
```

## Ana Dashboard Kartları

Programın en önemli yerinde şu kartlar olacak:

```text
1. Bugünkü Kâr Pozisyonu
2. Ay Sonu Tahmini Kâr
3. Öngörülen Giderler
4. Gerçekleşen Giderler
5. Kalan Gider Riski
6. Tahsilat Hedefine Kalan
7. Mal Maliyeti Etkisi
8. Değişken Gider Etkisi
9. Nakit + Banka + Moka Karşılama
10. Ay Sonuna Kadar Gider Karşılama Oranı
```

## Renk Mantığı

```text
Yeşil: Öndeyiz / pozitif fark / giderleri karşılıyor
Kırmızı: Gerideyiz / negatif fark / açık var
Sarı: Riskli ama toparlanabilir
Mavi: Tahmin / öngörü bilgisi
```

## Örnek

```text
Ay sonu kâr hedefi: 300.000 TL
Bugüne düşen hedef: 120.000 TL
Gerçekleşen net kâr: 130.000 TL
Durum: +10.000 TL öndeyiz
```

## Güvenlik ve Kayıt Mantığı

```text
Öngörü ayrı tutulur.
Gerçekleşen ayrı tutulur.
Tahmin kesin kayıt değildir.
Onaysız gider kesinleşmez.
Onaysız satış / tahsilat cari ekstresine işlenmez.
Her hesaplamada kaynak gösterilir.
Moka bekleyen tahsilat ayrı izlenir.
Moka'dan bankaya geçen tutar gerçekleşen banka girişi olarak ayrıca doğrulanır.
```

## Production Notu

Bu modül önce preview üzerinde kurulacak. Ana çalışan sürüm korunacak. Production'a manuel göz kontrol olmadan alınmayacak.
