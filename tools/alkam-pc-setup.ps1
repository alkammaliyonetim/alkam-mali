$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " ALKAM Mali PC Kurulum Yardimcisi" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

function Step($text) {
  Write-Host ""
  Write-Host ">>> $text" -ForegroundColor Yellow
}

function Ok($text) {
  Write-Host "OK - $text" -ForegroundColor Green
}

function Warn($text) {
  Write-Host "UYARI - $text" -ForegroundColor DarkYellow
}

function Fail($text) {
  Write-Host "HATA - $text" -ForegroundColor Red
}

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $Root

Step "Klasor kontrol ediliyor"
Write-Host "Klasor: $Root"

Step "Git kontrol ediliyor"
try {
  git --version | Out-Host
  Ok "Git bulundu"
} catch {
  Fail "Git bulunamadi. Git for Windows kurulumu gerekli."
  Write-Host "Indirme: https://git-scm.com/download/win"
  exit 1
}

Step "Node.js kontrol ediliyor"
try {
  node --version | Out-Host
  npm --version | Out-Host
  Ok "Node.js ve npm bulundu"
} catch {
  Fail "Node.js bulunamadi. Node.js LTS kurulumu gerekli."
  Write-Host "Indirme: https://nodejs.org/"
  exit 1
}

Step "Git durumu kontrol ediliyor"
git status --short | Out-Host

Step "TG Cloud branch hazirlaniyor"
git fetch origin
try {
  git checkout tg-cloud
} catch {
  Warn "tg-cloud branch checkout edilemedi. Mevcut branch korunuyor."
}
try {
  git pull origin tg-cloud
} catch {
  Warn "Pull tamamlanamadi. Yerel degisiklik veya baglanti sorunu olabilir."
}

Step "Bagimliliklar kuruluyor"
npm install
Ok "npm install tamamlandi"

Step "TG Cloud simulasyon testi calistiriliyor"
npm run test:tg-cloud
Ok "TG Cloud simulasyon testi tamamlandi"

Step "Ornek dosyalar hazirlaniyor"
if (!(Test-Path "wrangler.tg-cloud.toml")) {
  Copy-Item "wrangler.tg-cloud.example.toml" "wrangler.tg-cloud.toml"
  Ok "wrangler.tg-cloud.toml olusturuldu"
} else {
  Warn "wrangler.tg-cloud.toml zaten var; uzerine yazilmadi"
}

if (!(Test-Path ".env.local")) {
  Copy-Item "tg-cloud.env.example" ".env.local"
  Ok ".env.local olusturuldu"
} else {
  Warn ".env.local zaten var; uzerine yazilmadi"
}

Step "Gizli bilgi kontrolu"
Write-Host "Bu yardimci gercek token, secret veya KV ID istemez."
Write-Host "Gercek degerleri sadece Cloudflare panelinde veya lokal dosyada kendiniz girin."
Write-Host "Bu degerleri ChatGPT'ye gondermeyin."

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " KURULUM YARDIMCISI TAMAMLANDI" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Yapilanlar:" -ForegroundColor Cyan
Write-Host "- Klasor kontrol edildi"
Write-Host "- Git kontrol edildi"
Write-Host "- Node/npm kontrol edildi"
Write-Host "- tg-cloud branch hazirlandi"
Write-Host "- npm install calisti"
Write-Host "- npm run test:tg-cloud calisti"
Write-Host "- Ornek wrangler ve env dosyalari hazirlandi"
Write-Host ""
Write-Host "Kalanlar:" -ForegroundColor Cyan
Write-Host "- Cloudflare panelinde KV namespace olustur"
Write-Host "- Cloudflare panelinde secret degerlerini gir"
Write-Host "- Preview URL uzerinden GET /, webhook ve queue testlerini yap"
Write-Host "- Test sonucunu Issue #27'ye yaz"
Write-Host ""
Write-Host "Kontrol ettiklerim:" -ForegroundColor Cyan
Write-Host "- Gercek token repoya yazilmadi"
Write-Host "- Gercek KV ID repoya yazilmadi"
Write-Host "- Production merge/deploy yapilmadi"
Write-Host ""
