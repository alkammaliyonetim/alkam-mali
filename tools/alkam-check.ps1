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

function Write-Fail($text) {
  Write-Host "HATA - $text" -ForegroundColor Red
}

function Test-Command($name, $displayName, $required) {
  Write-Step "$displayName kontrol ediliyor"
  $cmd = Get-Command $name -ErrorAction SilentlyContinue
  if ($null -eq $cmd) {
    if ($required) {
      Write-Fail "$displayName bulunamadi. Once bunu kurmak gerekiyor."
      return $false
    }
    Write-Warn "$displayName bulunamadi. Local testler icin zorunlu degil; Cloudflare preview icin gerekebilir."
    return $true
  }

  try {
    & $name --version | Select-Object -First 1 | Out-Host
  } catch {
    Write-Warn "$displayName bulundu ama version bilgisi okunamadi."
  }
  Write-Ok "$displayName bulundu"
  return $true
}

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $Root

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " ALKAM Mali - 1/3 Sistem Kontrolu" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Klasor: $Root"

$ReportDir = Join-Path $Root ".alkam-setup"
New-Item -ItemType Directory -Force -Path $ReportDir | Out-Null
$CheckReport = Join-Path $ReportDir "check.txt"
Set-Content -Path $CheckReport -Value "ALKAM Mali sistem kontrolu" -Encoding UTF8

$ok = $true
$ok = (Test-Command "git" "Git" $true) -and $ok
$ok = (Test-Command "node" "Node.js" $true) -and $ok
$ok = (Test-Command "npm" "npm" $true) -and $ok
$ok = (Test-Command "wrangler" "Wrangler" $false) -and $ok

Write-Step "Git durumu okunuyor"
try {
  git status --short | Out-Host
  Add-Content -Path $CheckReport -Value "Git durumu okundu." -Encoding UTF8
} catch {
  Write-Warn "Git durumu okunamadi. Bu klasor henuz repo olmayabilir."
  Add-Content -Path $CheckReport -Value "Git durumu okunamadi." -Encoding UTF8
}

Write-Step "Gizli bilgi guvenligi"
Write-Host "Bu kontrol gercek token, secret veya KV ID istemez."
Write-Host "Bu kontrol deploy yapmaz, webhook set etmez."
Write-Host "Gercek degerleri ChatGPT'ye gondermeyin."
Add-Content -Path $CheckReport -Value "Secret/token istenmedi; deploy/webhook yapilmadi." -Encoding UTF8

if (-not $ok) {
  Add-Content -Path $CheckReport -Value "Sonuc: HATA" -Encoding UTF8
  exit 1
}

Add-Content -Path $CheckReport -Value "Sonuc: OK" -Encoding UTF8
Write-Ok "Sistem kontrolu tamamlandi"
