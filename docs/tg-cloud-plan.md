# TG Cloud Plan

## Hedef

Telegram mesajlari bilgisayar acik olmadan cloud endpoint uzerinden ALKAM Mali kuyruğuna dussun.

## Mimari

Telegram Bot
-> Cloudflare Worker webhook
-> Canli kuyruk
-> ALKAM Mali Onay Merkezi

## Kurallar

- Gizli bilgiler kod icine yazilmaz.
- Onaysiz kesin kayit yok.
- Bilinmeyen cari otomatik acilmaz.
- Her gelen mesaj once kuyrukta bekler.
- Onay Merkezi onayi olmadan banka, kasa, cari veya Moka hareketi olusmaz.

## Ilk Asama

- Worker webhook iskeleti
- Telegram update parse
- Kuyruk JSON formatı
- Onay Merkezi icin okunabilir endpoint
