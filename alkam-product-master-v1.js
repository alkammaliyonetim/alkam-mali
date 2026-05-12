(function(){
  'use strict';
  const MODULE_ID = "ALKAM_PRODUCT_MASTER_V1";
  const BOT_BASE = "https://bizmu-browser-bot.alkammaliyonetim.workers.dev";

  const PRODUCT_MAP = [
    { masterId: "PROD_PATELLA_DIZLIK_2026", masterName: "2026 PATELLA DESTEKLİ DİZLİK", aliases: ["ORTOPEDİ TEKSTİL", "PATELLA DİZLİK", "ESKİ DİZLİK V1"], data: { lastPrice: 409.00, avgPrice: 378.00, lastYearPrice: 360.00, totalStock: 156 } }
  ];

  const ISTASYON_AUTOMATION_CORE = {
    programName: "İstasyON / ALKAM Mali",
    programUrl: "https://0e46431c.alkam-mali.pages.dev/admin.html",
    rule: "Ana program korunur. Dış veriler doğrudan cari ekstresine yazılmaz; önce staging ve Onay Merkezi'ne düşer.",
    sources: ["Bizmu", "Luca", "Banka", "Moka", "Excel", "Telegram", "WhatsApp"],
    modules: ["Dış Veri Aktarım Merkezi", "Bizmu Aktarım", "Luca Aktarım", "Banka Aktarım", "Moka Aktarım", "Excel Aktarım", "Telegram / WhatsApp Aktarım", "Zamanlı İşler"],
    flow: ["Dış kaynak", "Staging", "Mükerrer kontrol", "Cari eşleşme", "Güven puanı", "Onay Merkezi", "Ana kayıt", "Audit log"]
  };

  function resolveMasterProduct(inputName) {
    if(!inputName) return "Tanımsız Ürün";
    const cleanName = inputName.trim().toUpperCase();
    for(const p of PRODUCT_MAP) {
      if(p.masterName.toUpperCase() === cleanName) return p.masterName;
      if(p.aliases.some(a => a.toUpperCase() === cleanName)) return p.masterName;
    }
    return inputName;
  }

  function stabilizeStockData(movements) {
    return movements.map(m => ({ ...m, product_name: resolveMasterProduct(m.product_name || m.description) }));
  }

  function escapeHtml(v){ return String(v == null ? '' : v).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }

  function openExternalDataCenter() {
    var main = document.querySelector('.main') || document.body;
    var page = document.getElementById('externalDataCenterPage');
    if(!page) {
      page = document.createElement('div');
      page.id = 'externalDataCenterPage';
      page.className = 'tab-page';
      page.innerHTML = '<div class="topbar"><div class="page-head"><h1>Dış Veri Aktarım Merkezi</h1><p>Bizmu · Luca · Banka · Moka · Excel · Telegram · Zamanlı İşler</p></div><div class="topbar-right"><span class="version-badge">STAGING + ONAY</span></div></div>' +
      '<div class="section"><h2 class="section-title">Temel Kural</h2><div class="rule-box">Hiçbir dış kaynak ana cari ekstresine doğrudan yazmaz. Tüm veriler önce staging alanına ve Onay Merkezi’ne düşer.</div></div>' +
      '<div class="cards"><div class="card"><div class="card-label">Bizmu Aktarım</div><div id="bizmuBotStatus" class="card-value" style="font-size:20px">Bekliyor</div></div><div class="card"><div class="card-label">Luca Aktarım</div><div class="card-value" style="font-size:20px">Resmi veri</div></div><div class="card"><div class="card-label">Banka / Moka</div><div class="card-value" style="font-size:20px">Hareket kontrol</div></div><div class="card"><div class="card-label">Excel / Telegram</div><div class="card-value" style="font-size:20px">Toplu aktarım</div></div></div>' +
      '<div class="section"><h2 class="section-title">Bizmu Bot Kontrol</h2><div class="btn-row"><button class="btn btn-soft" onclick="window.runBizmuBotCheck(\'/health\')">Bot Sağlık</button><button class="btn btn-soft" onclick="window.runBizmuBotCheck(\'/login-check\')">Login Kontrol</button><button class="btn btn-blue" onclick="window.runBizmuBotCheck(\'/customers-all-scan?max_pages=6\')">Carileri Oku</button><button class="btn btn-blue" onclick="window.runBizmuBotCheck(\'/sales-scan\')">Satış İlk Sayfa</button></div></div>' +
      '<div class="section"><h2 class="section-title">Ön İzleme</h2><div id="externalDataPreview" class="rule-box">Henüz veri çekilmedi.</div></div>' +
      '<div class="section"><h2 class="section-title">Akış</h2><div class="rule-box">Dış kaynak → Staging → Mükerrer kontrol → Cari eşleşme → Güven puanı → Onay Merkezi → Ana kayıt → Audit log</div></div>';
      main.appendChild(page);
    }
    document.querySelectorAll('.tab-page').forEach(function(x){ x.classList.remove('active'); });
    document.querySelectorAll('.nav-btn').forEach(function(x){ x.classList.remove('active'); });
    page.classList.add('active');
    var btn = document.getElementById('externalDataCenterBtn');
    if(btn) btn.classList.add('active');
  }

  async function runBizmuBotCheck(endpoint) {
    var status = document.getElementById('bizmuBotStatus');
    var preview = document.getElementById('externalDataPreview');
    if(status) status.textContent = 'Çalışıyor';
    if(preview) preview.textContent = 'İşlem başladı: ' + endpoint;
    try {
      var response = await fetch(BOT_BASE + endpoint, { method: 'GET' });
      var data = await response.json();
      if(status) status.textContent = data.ok === false ? 'Kontrol' : 'Hazır';
      if(preview) preview.innerHTML = '<pre style="white-space:pre-wrap;word-break:break-word;margin:0">' + escapeHtml(JSON.stringify(data, null, 2)).slice(0, 6000) + '</pre>';
    } catch(err) {
      if(status) status.textContent = 'Hata';
      if(preview) preview.textContent = 'Hata: ' + err.message;
    }
  }

  function installExternalDataCenter() {
    var nav = document.querySelector('.nav');
    if(!nav || document.getElementById('externalDataCenterBtn')) return;
    var btn = document.createElement('button');
    btn.id = 'externalDataCenterBtn';
    btn.type = 'button';
    btn.className = 'nav-btn';
    btn.textContent = 'Dış Veri Aktarım';
    btn.onclick = openExternalDataCenter;
    nav.appendChild(btn);
  }

  window.ALKAM_PRODUCT_MASTER = { resolve: resolveMasterProduct, stabilize: stabilizeStockData, map: PRODUCT_MAP };
  window.ISTASYON_AUTOMATION_CORE = ISTASYON_AUTOMATION_CORE;
  window.openExternalDataCenter = openExternalDataCenter;
  window.runBizmuBotCheck = runBizmuBotCheck;

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(installExternalDataCenter, 600); });
  else setTimeout(installExternalDataCenter, 600);

  console.info(MODULE_ID + ' aktif. Bizmu bot kontrolü program içine eklendi.');
})();
