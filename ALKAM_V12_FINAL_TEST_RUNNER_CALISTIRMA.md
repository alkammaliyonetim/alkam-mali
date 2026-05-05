# ALKAM Mali - Final Test Runner Çalıştırma

Bu dosya, `alkam-v12-final-test-runner-v1.js` modülünü canlı sitede çalıştırmak için hazırlanmıştır.

## Güncel Durum

Final Test Runner artık `_worker.js` üzerinden canlı siteye otomatik yüklenir.

Ayrıca sağ altta şu buton da otomatik gelir:

```text
Final Test v12
```

Bu yüzden normal şartlarda ayrıca script yükleme komutu yapıştırmaya gerek yoktur.

## Canlı Site

```text
https://alkam-mali.pages.dev
```

## 1. Siteyi Aç

Canlı site açılır ve sert yenileme yapılır.

```text
Windows: Ctrl + F5
Mac: Cmd + Shift + R
Mobil: Sayfayı kapat/aç
```

## 2. En Kolay Kullanım

Sağ alttaki butona basılır:

```text
Final Test v12
```

Bu buton final test panelini açar.

## 3. Console ile Panel Açmak İçin

```js
ALKAM_V12_FINAL_TEST_RUNNER_V1.open()
```

## 4. Direkt Test Sonucu Almak İçin

```js
ALKAM_V12_FINAL_TEST_RUNNER_V1.test()
```

## 5. Buton Kontrolü

Buton yüklendi mi kontrol etmek için:

```js
ALKAM_V12_FINAL_TEST_BUTTON_V1.test()
```

Beklenen:

```text
visible: true
runner: true
```

## 6. Eğer Modül Henüz Gelmediyse

Deploy/cache gecikmesi varsa geçici manuel yükleme:

```js
const s=document.createElement('script');
s.src='/alkam-v12-final-test-runner-v1.js';
document.head.appendChild(s);
```

Sonra tekrar:

```js
ALKAM_V12_FINAL_TEST_RUNNER_V1.test()
```

## 7. Beklenen Temiz Sonuç

```text
cacheOk: true
preflightReady: true
writeOpen: false
exportBad: false
writeAllowed: false
liveFailed: 0
liveRisky: 0
decision: "v12 stabilizasyonuna geçilebilir"
```

## 8. Temizse Sonraki Commit

```text
v12: stabilize dashboard and module loading
```

## 9. Temiz Değilse Sonraki Commit

```text
fix: resolve v11 live test gaps before v12
```

## 10. Güvenlik Notu

Bu test runner veri yazmaz. Sadece mevcut test fonksiyonlarını çalıştırır.

```text
AI kayıt yapmaz, Supabase yazma kapalıdır, cari ekstresi ana defterdir, Moka United banka aktarımı cari tahsilatı sayılmaz.
```
