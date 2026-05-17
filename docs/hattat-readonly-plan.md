# Hattat Readonly Entegrasyon Planı v1

Bu plan, ALKAM Mali ile Hattat arasındaki ilk entegrasyon fazını tanımlar.

## Ana Karar

İlk faz sadece okuma ve rapor alma fazıdır.

Bu fazda sistem:

- Hattat içinden veri okur.
- Rapor veya liste indirir.
- Ham çıktıları klasöre kaydeder.
- ALKAM tarafında sadece ön okuma ve öneri üretir.

Bu fazda sistem:

- Hattat içinde yeni kayıt oluşturmaz.
- Hattat içinde kayıt değiştirmez.
- Hattat içinde silme yapmaz.
- ALKAM içinde kesin finans kaydı oluşturmaz.
- Bilinmeyen cari açmaz.

## Hedef Ekranlar

İlk araştırma ve prototipte şu ekranlar hedeflenir:

- Mükellef / müşteri listesi
- Beyanname takip listeleri
- SGK takip listeleri
- E-tebligat takip listeleri
- Ödeme ve borç listeleri
- Dosya/rapor indirme ekranları

## Klasör Yapısı

Yerel çıktı klasörleri şu mantıkta tutulur:

```text
hattat_exports/
  raw/
    YYYY-MM-DD/
      musteri-listesi/
      beyanname/
      sgk/
      etebligat/
      odeme-listesi/
  parsed/
    YYYY-MM-DD/
  logs/
```

## Güvenlik Kuralları

- Şifre veya gizli bilgi repoya yazılmaz.
- `.env` dosyası kullanılacaksa `.gitignore` altında korunur.
- İlk prototip kullanıcı bilgisayarında manuel çalışır.
- Oturum mümkünse kullanıcının mevcut tarayıcı oturumundan alınır.
- İşlem adımları loglanır.
- Hata durumunda ekran görüntüsü alınır.
- Hiçbir kesin kayıt kullanıcı onayı olmadan oluşmaz.

## ALKAM'a Aktarım Mantığı

Hattat çıktıları önce ham veri olarak saklanır.

Sonra ALKAM içinde:

1. Ön okuma yapılır.
2. Cari/mükellef adayı bulunur.
3. Dönem ve işlem türü ayrıştırılır.
4. Onay Merkezi için öneri hazırlanır.
5. Kullanıcı onayı olmadan kesinleşmez.

## İlk Kabul Kriteri

- Plan dokümanı bulunmalı.
- Örnek env dosyası bulunmalı.
- Readonly prototip iskeleti bulunmalı.
- Log klasörü ve export klasörü git dışında kalmalı.
- Test scripti yazılmalı.
- Test, sistemin yazma aksiyonu içermediğini doğrulamalı.
