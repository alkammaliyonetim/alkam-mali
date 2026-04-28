/* ALKAM SAFE RESET MODULE - CARILER + HESAPLAR ONLY
   Bu modül otomatik veri silmez.
   Önce yedek alır, sonra sadece kullanıcı iki aşamalı onay verirse cariler/hesaplar çalışma verisini temizler.
*/
(function(){
  if(window.ALKAM_SAFE_RESET_MODULE_ACTIVE) return;
  window.ALKAM_SAFE_RESET_MODULE_ACTIVE = true;

  const VERSION = "SAFE-RESET-CH-280426";
  const BACKUP_PREFIX = "ALKAM_YEDEK_CARILER_HESAPLAR_";
  const CLEAN_STATUS_KEY = "ALKAM_CARILER_HESAPLAR_CLEAN_STATUS";

  const RESET_WORDS = [
    "cari","cariler","mukellef","mükellef","taxpayer","customer","customers","client","clients",
    "hesap","hesaplar","account","accounts","account_ops","manual_account","manual_account_op",
    "bank","banka","kasa","cash","moka","pos","cek","çek","senet",
    "ledger","statement","hareket","movement"
  ];

  const KEEP_WORDS = [
    "session","login","auth","password","token","theme","version","setting","settings",
    "supabase.auth","sb-","ALKAM_YEDEK","backup","archive","arsiv","arşiv"
  ];

  function low(v){
    return String(v || "").toLocaleLowerCase("tr-TR");
  }

  function isKeepKey(k){
    const x = low(k);
    return KEEP_WORDS.some(w => x.includes(low(w)));
  }

  function isResetCandidate(k){
    const x = low(k);
    if(isKeepKey(k)) return false;
    return RESET_WORDS.some(w => x.includes(low(w)));
  }

  function allCandidateKeys(){
    return Object.keys(localStorage).filter(isResetCandidate).sort();
  }

  function stamp(){
    const d = new Date();
    const p = n => String(n).padStart(2,"0");
    return `${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
  }

  function makeBackup(){
    const id = BACKUP_PREFIX + stamp();
    const keys = allCandidateKeys();
    const payload = {
      module: VERSION,
      created_at: new Date().toISOString(),
      reason: "Cariler ve hesaplar temiz başlangıç öncesi otomatik yedek",
      candidate_count: keys.length,
      keys: {}
    };

    keys.forEach(k => {
      payload.keys[k] = localStorage.getItem(k);
    });

    localStorage.setItem(id, JSON.stringify(payload));
    return { id, count: keys.length, payload };
  }

  function downloadBackup(){
    const backup = makeBackup();
    const blob = new Blob([JSON.stringify(backup.payload,null,2)], {type:"application/json;charset=utf-8"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = backup.id + ".json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
    return backup;
  }

  function cleanCandidates(){
    const backup = makeBackup();
    const keys = allCandidateKeys();

    keys.forEach(k => localStorage.removeItem(k));

    localStorage.setItem(CLEAN_STATUS_KEY, JSON.stringify({
      module: VERSION,
      cleaned_at: new Date().toISOString(),
      backup_key: backup.id,
      removed_count: keys.length,
      removed_keys: keys
    }));

    return {backup, removed: keys};
  }

  function css(){
    if(document.getElementById("alkamSafeResetStyle")) return;
    const s = document.createElement("style");
    s.id = "alkamSafeResetStyle";
    s.textContent = `
      #alkamSafeResetBtn{
        position:fixed; left:16px; bottom:16px; z-index:999999;
        border:0; border-radius:999px; padding:11px 15px;
        background:#dc2626; color:white; font-weight:950; font-size:12px;
        box-shadow:0 18px 44px rgba(220,38,38,.25); cursor:pointer;
      }
      #alkamSafeResetPanelOverlay{
        position:fixed; inset:0; z-index:1000000; background:rgba(15,23,42,.55);
        display:flex; align-items:center; justify-content:center; padding:22px;
      }
      #alkamSafeResetPanel{
        width:760px; max-width:calc(100vw - 28px); max-height:88vh; overflow:auto;
        background:#fff; border:1px solid #dbe3ef; border-radius:22px;
        box-shadow:0 40px 110px rgba(15,23,42,.34); font-family:Arial,Helvetica,sans-serif;
      }
      .asr-head{background:#071a3a;color:white;padding:18px 20px}
      .asr-title{font-size:20px;font-weight:950;margin:0}
      .asr-sub{font-size:12px;font-weight:800;opacity:.82;margin-top:6px;line-height:1.45}
      .asr-body{padding:18px 20px;color:#334155;font-size:13px;line-height:1.55}
      .asr-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:14px 0}
      .asr-card{border:1px solid #e2e8f0;border-radius:14px;padding:12px;background:#fbfdff}
      .asr-k{font-size:10px;font-weight:950;color:#64748b;text-transform:uppercase;letter-spacing:.06em}
      .asr-v{font-size:22px;font-weight:950;color:#071a3a;margin-top:5px}
      .asr-actions{display:flex;gap:10px;flex-wrap:wrap;padding:0 20px 20px}
      .asr-btn{border:0;border-radius:11px;padding:11px 13px;font-size:13px;font-weight:950;cursor:pointer}
      .asr-dark{background:#071a3a;color:white}
      .asr-blue{background:#1769e8;color:white}
      .asr-red{background:#dc2626;color:white}
      .asr-soft{background:#e8eef9;color:#0f172a}
      .asr-list{max-height:180px;overflow:auto;border:1px solid #e2e8f0;border-radius:14px;background:#fff;margin-top:10px}
      .asr-row{padding:8px 10px;border-bottom:1px solid #eef2f7;font-size:12px;font-weight:800;color:#475569}
      .asr-warning{border:1px solid #fecaca;background:#fff7f7;color:#991b1b;padding:12px;border-radius:14px;font-weight:850;margin-top:12px}
      @media(max-width:720px){.asr-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(s);
  }

  function openPanel(){
    css();

    const existing = document.getElementById("alkamSafeResetPanelOverlay");
    if(existing) existing.remove();

    const keys = allCandidateKeys();
    const last = (() => {
      try { return JSON.parse(localStorage.getItem(CLEAN_STATUS_KEY) || "null"); }
      catch(e){ return null; }
    })();

    const overlay = document.createElement("div");
    overlay.id = "alkamSafeResetPanelOverlay";
    overlay.innerHTML = `
      <div id="alkamSafeResetPanel">
        <div class="asr-head">
          <h2 class="asr-title">Cariler + Hesaplar Güvenli Sıfırlama</h2>
          <div class="asr-sub">
            Bu işlem program dosyalarını, login bilgisini, tasarımı ve ayarları silmez.
            Sadece cariler/hesaplar çalışma verisi için aday anahtarları temizler.
          </div>
        </div>
        <div class="asr-body">
          <div class="asr-grid">
            <div class="asr-card">
              <div class="asr-k">Sıfırlama Adayı</div>
              <div class="asr-v">${keys.length}</div>
            </div>
            <div class="asr-card">
              <div class="asr-k">Son Durum</div>
              <div class="asr-v" style="font-size:15px">${last ? "Sıfırlandı" : "Hazır"}</div>
            </div>
            <div class="asr-card">
              <div class="asr-k">Modül</div>
              <div class="asr-v" style="font-size:15px">${VERSION}</div>
            </div>
          </div>

          <div class="asr-warning">
            Sıfırlama butonuna basınca önce otomatik yedek alınır. Sonra ikinci onay istenir.
            Yanlışlıkla basılmaya karşı “SIFIRLA” yazmadan işlem başlamaz.
          </div>

          <b>Aday local veri anahtarları:</b>
          <div class="asr-list">
            ${keys.length ? keys.map(k => `<div class="asr-row">${k}</div>`).join("") : `<div class="asr-row">Aday anahtar bulunamadı.</div>`}
          </div>
        </div>

        <div class="asr-actions">
          <button class="asr-btn asr-dark" id="asrDownloadBackup">Yedeği İndir</button>
          <button class="asr-btn asr-red" id="asrClean">Cariler + Hesapları Sıfırla</button>
          <button class="asr-btn asr-soft" id="asrClose">Kapat</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById("asrClose").onclick = () => overlay.remove();

    document.getElementById("asrDownloadBackup").onclick = () => {
      const b = downloadBackup();
      alert("Yedek indirildi.\nYedek: " + b.id + "\nAday veri anahtarı: " + b.count);
    };

    document.getElementById("asrClean").onclick = () => {
      const keys = allCandidateKeys();
      if(!keys.length){
        alert("Sıfırlanacak aday cariler/hesaplar anahtarı bulunamadı.");
        return;
      }

      const first = confirm(
        "Sadece cariler + hesaplar çalışma verisi arşivlenip temizlenecek.\n\n" +
        "Program dosyaları, login ve tasarım silinmeyecek.\n\nDevam edilsin mi?"
      );
      if(!first) return;

      const typed = prompt("Son onay için SIFIRLA yaz:");
      if(String(typed || "").trim().toUpperCase() !== "SIFIRLA"){
        alert("İptal edildi. Hiçbir veri silinmedi.");
        return;
      }

      const result = cleanCandidates();
      alert(
        "Tamamlandı.\n\n" +
        "Yedek: " + result.backup.id + "\n" +
        "Temizlenen anahtar: " + result.removed.length + "\n\n" +
        "Sayfa yenileniyor."
      );
      location.reload();
    };
  }

  function addButton(){
    css();

    if(document.getElementById("alkamSafeResetBtn")) return;

    const btn = document.createElement("button");
    btn.id = "alkamSafeResetBtn";
    btn.textContent = "Cariler + Hesaplar Sıfırla";
    btn.onclick = openPanel;
    document.body.appendChild(btn);

    window.ALKAM_OPEN_CARI_HESAP_RESET = openPanel;
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", addButton);
  }else{
    addButton();
  }
})();