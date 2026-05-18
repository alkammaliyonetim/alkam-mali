$ErrorActionPreference = "Stop"

function Write-Section($title) {
  Write-Host ""
  Write-Host $title -ForegroundColor Cyan
}

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $Root

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " ALKAM Mali - 3/3 Sonuc Raporu" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

$ReportDir = Join-Path $Root ".alkam-setup"
New-Item -ItemType Directory -Force -Path $ReportDir | Out-Null
$FinalReport = Join-Path $ReportDir "sonuc-raporu.txt"

$lines = @()
$lines += "ALKAM Mali TG Cloud tek tik kurulum raporu"
$lines += "Tarih: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$lines += "Klasor: $Root"
$lines += ""
$lines += "YAPILANLAR"
$lines += "- Git / Node.js / npm / Wrangler kontrol adimi calisti."
$lines += "- npm install calisti."
$lines += "- npm run test:tg-cloud calisti."
$lines += "- npm run test:pc-setup calisti."
$lines += "- Ornek wrangler/env dosyalari varsa hazirlandi; mevcut dosyalarin uzerine yazilmadi."
$lines += ""
$lines += "KALANLAR"
$lines += "- Cloudflare panelinde KV namespace kontrolu/olusturma."
$lines += "- Cloudflare panelinde TELEGRAM_WEBHOOK_SECRET ve QUEUE_READ_SECRET degerlerini girme."
$lines += "- Preview ortaminda GET /, POST /telegram/webhook ve GET /queue testleri."
$lines += "- Test sonucunu Issue #27 altina yazma."
$lines += "- Onay Merkezi entegrasyonunu Issue #28 altinda ayri branch/PR ile ilerletme."
$lines += ""
$lines += "KONTROL ETTIKLERIM"
$lines += "- Production deploy yapilmadi."
$lines += "- Telegram webhook set edilmedi."
$lines += "- Secret/token/KV ID istenmedi."
$lines += "- Gercek token veya KV ID repoya yazilmadi."
$lines += "- ALKAM Mali kesin cari/banka/kasa/Moka/muhasebe kaydi olusturulmadi."

Set-Content -Path $FinalReport -Value $lines -Encoding UTF8

Write-Section "Yapilanlar:"
Write-Host "- Sistem kontrolu calisti"
Write-Host "- Local testler calisti"
Write-Host "- Ornek dosyalar hazirlandi veya korunarak atlandi"

Write-Section "Kalanlar:"
Write-Host "- Cloudflare panelinde KV ve secret ayarlari"
Write-Host "- Preview endpoint testleri"
Write-Host "- Issue #27'ye sonuc notu"
Write-Host "- Issue #28 Onay Merkezi fazi"

Write-Section "Kontrol ettiklerim:"
Write-Host "- Deploy yok"
Write-Host "- Webhook set yok"
Write-Host "- Secret isteme yok"
Write-Host "- Kesin muhasebe/cari kaydi yok"

Write-Host ""
Write-Host "Rapor dosyasi: $FinalReport" -ForegroundColor Green
