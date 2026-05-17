# TG v3 Ortam Kurulumu

Gercek bot sifresi kod icine yazilmayacak.

Yerel calisma icin bilgisayarda `.env` dosyasi olusturulacak.

Gerekli alanlar:

- TELEGRAM_BOT_SECRET
- TG_QUEUE_DIR
- TG_LOG_DIR

`.env` dosyasi git'e yuklenmeyecek.

`.gitignore` icinde `.env`, `logs/` ve `tg_queue/` kapatildi.
