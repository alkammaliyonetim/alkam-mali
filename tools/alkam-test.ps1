$ErrorActionPreference = "Stop"

function Write-Step($text) {
  Write-Host ""
  Write-Host ">>> $text" -ForegroundColor Yellow
}

function Write-Ok($text) {
  Write-Host "OK - $text" -ForegroundColor Green
}

function Write-Warn($text) {
  Write-Host "UYARI - $text" -ForegroundColor DarkYellow
}

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $Root

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " ALKAM Mali - 2/3 Local Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$ReportDir = Join-Path $Root ".alkam-setup"
New-Item -ItemType Directory -Force -Path $ReportDir | Out-Null
$TestReport = Join-Path $ReportDir "test.txt"
Set-Content -Path $TestReport -Value "ALKAM Mali local test" -Encoding UTF8

Write-Step "Bagimliliklar kuruluyor"
npm install
Write-Ok "npm install tamamlandi"
Add-Content -Path $TestReport -Value "npm install tamamlandi." -Encoding UTF8

Write-Step "TG Cloud simulasyon testi calistiriliyor"
npm run test:tg-cloud
Write-Ok "TG Cloud simulasyon testi tamamlandi"
Add-Content -Path $TestReport -Value "npm run test:tg-cloud tamamlandi." -Encoding UTF8

Write-Step "PC kurulum guvenlik testi calistiriliyor"
npm run test:pc-setup
Write-Ok "PC kurulum guvenlik testi tamamlandi"
Add-Content -Path $TestReport -Value "npm run test:pc-setup tamamlandi." -Encoding UTF8

Write-Step "Ornek local dosyalar hazirlaniyor"
if ((Test-Path "wrangler.tg-cloud.example.toml") -and !(Test-Path "wrangler.tg-cloud.toml")) {
  Copy-Item "wrangler.tg-cloud.example.toml" "wrangler.tg-cloud.toml"
  Write-Ok "wrangler.tg-cloud.toml ornekten olusturuldu"
  Add-Content -Path $TestReport -Value "wrangler.tg-cloud.toml olusturuldu." -Encoding UTF8
} else {
  Write-Warn "wrangler.tg-cloud.toml zaten var veya example dosyasi yok; uzerine yazilmadi"
  Add-Content -Path $TestReport -Value "wrangler.tg-cloud.toml uzerine yazilmadi." -Encoding UTF8
}

if ((Test-Path "tg-cloud.env.example") -and !(Test-Path ".env.local")) {
  Copy-Item "tg-cloud.env.example" ".env.local"
  Write-Ok ".env.local ornekten olusturuldu"
  Add-Content -Path $TestReport -Value ".env.local olusturuldu." -Encoding UTF8
} else {
  Write-Warn ".env.local zaten var veya example dosyasi yok; uzerine yazilmadi"
  Add-Content -Path $TestReport -Value ".env.local uzerine yazilmadi." -Encoding UTF8
}

Write-Step "Guvenli sinir kontrolu"
Write-Host "Bu test deploy yapmaz."
Write-Host "Bu test webhook set etmez."
Write-Host "Bu test secret istemez."
Write-Host "Bu test gercek token veya KV ID uretmez."
Add-Content -Path $TestReport -Value "Deploy/webhook/secret islemi yapilmadi." -Encoding UTF8

Write-Ok "Local test adimi tamamlandi"
