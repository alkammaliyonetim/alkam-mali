(function () {
  "use strict";
  const DRIVE_2026 = "https://drive.google.com/drive/folders/1Ta8pMTI_2e0oj2HVF1aUNLpgnV9PHIL3";
  const SHEET = "https://docs.google.com/spreadsheets/d/1Nk7lpTxObstInLJt3zJXY5hHHA6Np92UOuiKAY-qGeo/edit";

  function addStyle() {
    if (document.getElementById("alkamDriveArchiveStyle")) return;
    const style = document.createElement("style");
    style.id = "alkamDriveArchiveStyle";
    style.textContent = `
      .alkam-drive-hero{background:linear-gradient(135deg,#061d3f,#0b57d0);color:#fff;border-radius:18px;padding:22px;display:flex;justify-content:space-between;gap:18px;align-items:center;margin-bottom:16px;box-shadow:0 16px 34px rgba(6,29,63,.18)}
      .alkam-drive-hero h1{margin:0 0 7px;font-size:25px}.alkam-drive-hero p{margin:0;color:#dbeafe;font-size:13px;font-weight:750;line-height:1.5}
      .alkam-drive-actions{display:flex;gap:8px;flex-wrap:wrap}.alkam-drive-actions a{display:inline-flex;align-items:center;justify-content:center;min-height:38px;padding:8px 13px;border-radius:10px;background:#fff;color:#0b3f99;text-decoration:none;font-size:12px;font-weight:950}.alkam-drive-actions a.secondary{background:rgba(255,255,255,.13);color:#fff;border:1px solid rgba(255,255,255,.24)}
      .alkam-drive-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.alkam-drive-card{background:#fff;border:1px solid #e2e8f0;border-radius:15px;padding:17px;box-shadow:0 8px 22px rgba(15,23,42,.05)}.alkam-drive-icon{font-size:25px}.alkam-drive-card h3{margin:10px 0 6px;font-size:15px}.alkam-drive-card p{margin:0;color:#64748b;font-size:12px;font-weight:750;line-height:1.45}.alkam-drive-card a{display:inline-flex;margin-top:12px;color:#1769e8;font-size:12px;font-weight:950;text-decoration:none}
      .alkam-drive-note{margin-top:14px;background:#ecfdf5;border:1px solid #a7f3d0;color:#065f46;border-radius:13px;padding:12px;font-size:12px;font-weight:850;line-height:1.5}
      @media(max-width:900px){.alkam-drive-hero{display:block}.alkam-drive-actions{margin-top:14px}.alkam-drive-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function mount() {
    addStyle();
    const nav = document.querySelector(".nav");
    const main = document.querySelector(".main");
    if (!nav || !main) return;
    if (!document.querySelector('[data-tab="drivearsiv"]')) {
      const button = document.createElement("button");
      button.className = "nav-btn";
      button.dataset.tab = "drivearsiv";
      button.innerHTML = '<span class="nav-ico">🗄️</span> Belge Arşivi';
      button.addEventListener("click", () => window.switchTab && window.switchTab("drivearsiv"));
      const backup = nav.querySelector('[data-tab="yedek"]');
      nav.insertBefore(button, backup || null);
    }
    if (!document.getElementById("tab-drivearsiv")) {
      const section = document.createElement("section");
      section.id = "tab-drivearsiv";
      section.className = "tab-page";
      section.innerHTML = `
        <div class="alkam-drive-hero"><div><h1>Google Drive Belge Arşivi</h1><p>7 TB alan; belgeler, banka dosyaları ve yedekler için merkezi kasa olarak kullanılacak.</p></div><div class="alkam-drive-actions"><a href="${DRIVE_2026}" target="_blank" rel="noopener">2026 Arşivini Aç</a><a class="secondary" href="${SHEET}" target="_blank" rel="noopener">E-Tabloyu Aç</a></div></div>
        <div class="alkam-drive-grid">
          <article class="alkam-drive-card"><div class="alkam-drive-icon">👥</div><h3>Müşteri Dosyaları</h3><p>Her cari için sözleşme, beyanname, yazışma ve özel belgeler.</p><a href="${DRIVE_2026}" target="_blank" rel="noopener">Klasöre git →</a></article>
          <article class="alkam-drive-card"><div class="alkam-drive-icon">🏦</div><h3>Banka ve POS</h3><p>Ekstreler, dekontlar, POS raporları ve içe aktarma dosyaları.</p><a href="${DRIVE_2026}" target="_blank" rel="noopener">Klasöre git →</a></article>
          <article class="alkam-drive-card"><div class="alkam-drive-icon">🧾</div><h3>Fatura ve Fişler</h3><p>Gelen/giden faturalar, gider belgeleri ve OCR için bekleyen dosyalar.</p><a href="${DRIVE_2026}" target="_blank" rel="noopener">Klasöre git →</a></article>
          <article class="alkam-drive-card"><div class="alkam-drive-icon">📑</div><h3>Sözleşmeler</h3><p>Hizmet sözleşmeleri, taahhütler ve imzalı resmi evraklar.</p><a href="${DRIVE_2026}" target="_blank" rel="noopener">Klasöre git →</a></article>
          <article class="alkam-drive-card"><div class="alkam-drive-icon">📤</div><h3>Rapor Çıktıları</h3><p>Cari ekstre, finans raporu, mutabakat ve dönem kapanış çıktıları.</p><a href="${DRIVE_2026}" target="_blank" rel="noopener">Klasöre git →</a></article>
          <article class="alkam-drive-card"><div class="alkam-drive-icon">🛟</div><h3>Sistem Yedekleri</h3><p>Günlük JSON, aylık Excel/PDF ve sürüm bazlı geri dönüş paketleri.</p><a href="${DRIVE_2026}" target="_blank" rel="noopener">Klasöre git →</a></article>
        </div>
        <div class="alkam-drive-note">Güvenlik kuralı: belge arşivi Drive'da, muhasebe hareketi kayıt sisteminde tutulur. Bir belge silinse bile işlem kaydı ve denetim izi korunur.</div>`;
      main.appendChild(section);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
})();
