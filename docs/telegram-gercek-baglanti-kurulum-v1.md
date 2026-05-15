# ALKAM Mali Telegram Gerçek Bağlantı Kurulumu v1

## Amaç

Telegram uygulamasından yazılan mesajların ALKAM Mali içinde Telegram Gelen Kutusu'na düşmesi.

## Gerçek Akış

```text
Telegram Bot
↓
Cloudflare Pages Worker /api/telegram/webhook
↓
Cloudflare KV gelen kutusu
↓
ALKAM Mali /api/telegram/inbox
↓
Telegram Gelen Kutusu
↓
Onay Merkezi
```

## Neden KV gerekiyor?

Telegram mesajı sunucuya gelir. Kullanıcının telefonundaki tarayıcı localStorage alanına doğrudan yazılamaz.

Bu yüzden mesaj önce Cloudflare KV gibi sunucu tarafı bir alanda saklanır. ALKAM Mali ekranı daha sonra bu mesajları API üzerinden çeker.

## Gerekli Cloudflare Ayarları

### 1. KV Namespace

Cloudflare tarafında bir KV namespace oluşturulacak:

```text
ALKAM_TELEGRAM_INBOX
```

Worker binding adı:

```text
TELEGRAM_INBOX
```

### 2. Secret Değerleri

Telegram token koda yazılmayacak.

Cloudflare secret / environment variable olarak tutulacak:

```text
TELEGRAM_BOT_TOKEN
TELEGRAM_WEBHOOK_SECRET
```

### 3. Webhook URL

Preview test için örnek endpoint:

```text
https://safe-bank-import-v1.alkam-mali.pages.dev/api/telegram/webhook
```

Production'a geçince:

```text
https://alkam-mali.pages.dev/api/telegram/webhook
```

## Güvenlik

```text
Token koda yazılmaz.
Webhook secret kontrol edilir.
Onaysız cari ekstresi değişmez.
Onaysız bakiye değişmez.
Onaysız evrak kesin kayda dönüşmez.
Her mesaj Telegram update_id/message_id ile saklanır.
Mükerrer update tekrar işlenmez.
```

## İlk Test Mesajı

```text
Ungan Mobilya haziranın son günü 100.000 TL ödeme sözü verdi
```

Beklenen sonuç:

```text
Telegram Gelen Kutusu'na düşer.
Onay Merkezine Öneri Yap ile işlem önerisi oluşur.
Cari: Ungan Mobilya
Tutar: 100.000 TL
Tür: Ödeme sözü
Durum: Onay bekliyor
```

## Not

Bu kurulum önce preview branch üzerinde test edilecek. Production'a manuel göz kontrol olmadan alınmayacak.
