# ALKAM Mali - Final Test Runner Çalıştırma

Bu dosya, `alkam-v12-final-test-runner-v1.js` modülünü canlı sitede çalıştırmak için hazırlanmıştır.

## Güncel Durum

Final Test Runner artık `_worker.js` üzerinden canlı siteye otomatik yüklenir.

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

## 2. Paneli Aç

Console'da:

```js
ALKAM_V12_FINAL_TEST_RUNNER_V1.open()
```

## 3. Direkt Test Sonucu Almak İçin

Console'da:

```js
ALKAM_V12_FINAL_TEST_RUNNER_V1.test()
```

## 4. Eğer Modül Henüz Gelmediyse

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

## 5. Beklenen Temiz Sonuç

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

## 6. Temizse Sonraki Commit

```text
v12: stabilize dashboard and module loading
```

## 7. Temiz Değilse Sonraki Commit

```text
fix: resolve v11 live test gaps before v12
```

## 8. Güvenlik Notu

Bu test runner veri yazmaz. Sadece mevcut test fonksiyonlarını çalıştırır.

```text
AI kayıt yapmaz, Supabase yazma kapalıdır, cari ekstresi ana defterdir, Moka United banka aktarımı cari tahsilatı sayılmaz.
```
