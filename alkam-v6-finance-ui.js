/* ALKAM V6 FINANS RAPOR UI - SAFE / NO DATA DELETE */
(function(){
  if(window.ALKAM_V6_FINANS_UI_ACTIVE) return;
  window.ALKAM_V6_FINANS_UI_ACTIVE=true;

  const css=`
  .alkam-v6-card{background:#fff;border:1px solid #e2e8f0;border-radius:18px;box-shadow:0 12px 30px rgba(15,23,42,.06);padding:16px}
  .alkam-v6-title{font-size:24px;font-weight:950;letter-spacing:-.035em;color:#071a3a;margin:0 0 6px}
  .alkam-v6-sub{font-size:12px;font-weight:800;color:#64748b;margin:0 0 14px}
  .alkam-v6-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:12px 0}
  .alkam-v6-grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px}
  .alkam-v6-metric{border:1px solid #e2e8f0;border-radius:16px;background:#fbfdff;padding:14px;min-height:92px}
  .alkam-v6-k{font-size:11px;font-weight:950;color:#64748b;text-transform:uppercase;letter-spacing:.05em}
  .alkam-v6-v{font-size:24px;font-weight:950;color:#071a3a;margin-top:8px;font-variant-numeric:tabular-nums}
  .alkam-v6-v.green{color:#059669}.alkam-v6-v.red{color:#dc2626}.alkam-v6-v.blue{color:#1769e8}.alkam-v6-v.dark{color:#071a3a}
  .alkam-v6-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0 14px}
  .alkam-v6-tab{border:0;background:#e8eef9;color:#0f172a;border-radius:999px;padding:9px 13px;font-size:12px;font-weight:950;cursor:pointer}
  .alkam-v6-tab.active,.alkam-v6-tab:hover{background:#1769e8;color:#fff}
  .alkam-v6-table{width:100%;border-collapse:separate;border-spacing:0}
  .alkam-v6-table th,.alkam-v6-table td{padding:10px;border-bottom:1px solid #e2e8f0;font-size:12px}
  .alkam-v6-table th{background:#f8fbff;color:#334155;font-weight:950}
  #alkamV6TrailBtn{position:fixed;right:18px;bottom:18px;z-index:999999;border:0;border-radius:999px;background:#071a3a;color:#fff;padding:12px 16px;font-weight:950;box-shadow:0 18px 45px rgba(7,26,58,.25);cursor:pointer}
  #alkamV6TrailBtn span{display:inline-flex;align-items:center;justify-content:center;background:#16a34a;color:white;border-radius:999px;min-width:22px;height:22px;margin-left:8px;font-size:11px}
  .alkam-v6-hidden-trail{display:none!important}
  @media(max-width:1200px){.alkam-v6-grid,.alkam-v6-grid2{grid-template-columns:1fr 1fr}}
  @media(max-width:700px){.alkam-v6-grid,.alkam-v6-grid2{grid-template-columns:1fr}}
  `;
  const st=document.createElement("style"); st.textContent=css; document.head.appendChild(st);

  function money(n){
    n=Number(n||0);
    return n.toLocaleString("tr-TR",{minimumFractionDigits:2,maximumFractionDigits:2})+" TL";
  }
  function parseMoney(s){
    const m=String(s||"").match(/-?\d{1,3}(?:\.\d{3})*(?:,\d{2})|-?\d+(?:,\d{2})?/);
    if(!m) return 0;
    return Number(m[0].replace(/\./g,"").replace(",",".")||0);
  }
  function findPage(word){
    return Array.from(document.querySelectorAll(".tab-page, section, main, .main"))
      .find(el => (el.innerText||"").slice(0,600).toLocaleLowerCase("tr-TR").includes(word.toLocaleLowerCase("tr-TR")));
  }
  function findTab(id, word){
    return document.querySelector(id) || findPage(word);
  }
  function metricFromText(text,label){
    const i=text.toLocaleLowerCase("tr-TR").indexOf(label.toLocaleLowerCase("tr-TR"));
    if(i<0) return 0;
    return parseMoney(text.slice(i,i+180));
  }

  function fixTrail(){
    const nodes=Array.from(document.querySelectorAll("div,section"));
    const panels=nodes.filter(el=>{
      const t=(el.innerText||"").trim();
      const r=el.getBoundingClientRect();
      return t.startsWith("İşlem İzi") && r.width>220 && r.height>120 && getComputedStyle(el).position==="fixed";
    });
    panels.forEach(p=>p.classList.add("alkam-v6-hidden-trail"));
    let btn=document.getElementById("alkamV6TrailBtn");
    if(!btn){
      btn=document.createElement("button");
      btn.id="alkamV6TrailBtn";
      btn.innerHTML="İşlem İzi <span>"+panels.length+"</span>";
      document.body.appendChild(btn);
    }
    btn.onclick=function(){
      panels.forEach(p=>{
        p.classList.toggle("alkam-v6-hidden-trail");
        p.style.zIndex=999998;
      });
    };
  }

  function installAccounts(){
    const tab=findTab("#tab-hesaplar","Hesaplar");
    if(!tab || document.getElementById("alkamV6FinanceCenter")) return;
    const text=tab.innerText||"";
    const total=(text.match(/TOPLAM HESAP\s+(\d+)/i)||[])[1]||"0";
    const banka=(text.match(/BANKA ONAY KUYRUĞU\s+(\d+)/i)||[])[1]||"0";
    const m=(text.match(/MOKA BEKLEYEN\s+([0-9\.,]+)/i)||[])[1]||"0";
    const queue=(text.match(/KUYRUK\s*\/\s*İŞLENEN\s+([0-9]+\s*\/\s*[0-9]+)/i)||[])[1]||"0 / 0";
    const html=document.createElement("div");
    html.id="alkamV6FinanceCenter";
    html.className="alkam-v6-card";
    html.innerHTML=`
      <h2 class="alkam-v6-title">Finans Merkezi</h2>
      <p class="alkam-v6-sub">Banka, Moka/POS, kasa, çek/senet ve onay kuyruğu tek ekranda. Veri silinmedi; sadece profesyonel çalışma katmanı eklendi.</p>
      <div class="alkam-v6-tabs">
        <button class="alkam-v6-tab active" data-v6-scroll="Banka Montaj">Banka Montaj</button>
        <button class="alkam-v6-tab" data-v6-scroll="Moka Transfer">Moka / POS</button>
        <button class="alkam-v6-tab" data-v6-scroll="Hesap Kartları">Hesap Kartları</button>
        <button class="alkam-v6-tab" data-v6-scroll="Onay">Onay Kuyruğu</button>
      </div>
      <div class="alkam-v6-grid">
        <div class="alkam-v6-metric"><div class="alkam-v6-k">Toplam Hesap</div><div class="alkam-v6-v dark">${total}</div></div>
        <div class="alkam-v6-metric"><div class="alkam-v6-k">Banka Kontrol</div><div class="alkam-v6-v blue">${banka}</div></div>
        <div class="alkam-v6-metric"><div class="alkam-v6-k">Moka / POS Bekleyen</div><div class="alkam-v6-v blue">${m}</div></div>
        <div class="alkam-v6-metric"><div class="alkam-v6-k">Kuyruk / İşlenen</div><div class="alkam-v6-v dark">${queue}</div></div>
      </div>
      <div class="alkam-v6-grid2">
        <div class="alkam-v6-card">
          <h3 class="alkam-v6-title" style="font-size:18px">Banka İş Akışı</h3>
          <table class="alkam-v6-table"><tr><th>Aşama</th><th>Kural</th></tr>
          <tr><td>1. Satır İncele</td><td>Banka satırı kaynağı ve hedefi doğrulanır.</td></tr>
          <tr><td>2. Eşleştir</td><td>Emin değilse Onay Merkezi’ne düşer.</td></tr>
          <tr><td>3. İşle</td><td>Cari / hesap hareketi birlikte oluşur.</td></tr></table>
        </div>
        <div class="alkam-v6-card">
          <h3 class="alkam-v6-title" style="font-size:18px">Moka / POS Mantığı</h3>
          <table class="alkam-v6-table"><tr><th>Aşama</th><th>Kural</th></tr>
          <tr><td>POS Tahsilat</td><td>Önce Moka United’da izlenir.</td></tr>
          <tr><td>Banka Aktarım</td><td>Vadesi gelince banka aktarımı mahsup edilir.</td></tr>
          <tr><td>Kontrol</td><td>Eksik veya şüpheli hareket onaya düşer.</td></tr></table>
        </div>
      </div>`;
    tab.prepend(html);
    html.querySelectorAll("[data-v6-scroll]").forEach(b=>{
      b.onclick=function(){
        const q=this.dataset.v6Scroll;
        const target=Array.from(tab.querySelectorAll("*")).find(el=>(el.innerText||"").trim().startsWith(q));
        if(target) target.scrollIntoView({behavior:"smooth",block:"start"});
      };
    });
  }

  function installReports(){
    const tab=findTab("#tab-raporlar","Raporlar");
    if(!tab || document.getElementById("alkamV6ReportCenter")) return;
    const text=tab.innerText||"";
    const buYilTT=metricFromText(text,"BU YIL T/T");
    const buYilGider=metricFromText(text,"BU YIL GİDER");
    const tahsilat=metricFromText(text,"TOPLAM SON TAHSİLAT");
    const bakiye=metricFromText(text,"POZİTİF BAKİYE TOPLAMI");
    const net=buYilTT-buYilGider;
    const html=document.createElement("div");
    html.id="alkamV6ReportCenter";
    html.className="alkam-v6-card";
    html.innerHTML=`
      <h2 class="alkam-v6-title">V6 Yönetim Rapor Merkezi</h2>
      <p class="alkam-v6-sub">Kâr analizi ve finans analizi ayrıldı. Gelir yeşil, gider kırmızı, net kâr ve nakit pozisyonu ayrı izlenir.</p>
      <div class="alkam-v6-tabs">
        <button class="alkam-v6-tab active">Bu Ay</button>
        <button class="alkam-v6-tab">Geçen Ay</button>
        <button class="alkam-v6-tab">Bu Yıl</button>
        <button class="alkam-v6-tab">Geçen Yıl</button>
      </div>
      <div class="alkam-v6-grid">
        <div class="alkam-v6-metric"><div class="alkam-v6-k">Tahakkuk Eden Gelir</div><div class="alkam-v6-v green">${money(buYilTT)}</div></div>
        <div class="alkam-v6-metric"><div class="alkam-v6-k">Tahsil Edilen</div><div class="alkam-v6-v green">${money(tahsilat)}</div></div>
        <div class="alkam-v6-metric"><div class="alkam-v6-k">Gider Tahakkuku</div><div class="alkam-v6-v red">${money(buYilGider)}</div></div>
        <div class="alkam-v6-metric"><div class="alkam-v6-k">Net Kâr Analizi</div><div class="alkam-v6-v ${net>=0?"green":"red"}">${money(net)}</div></div>
      </div>
      <div class="alkam-v6-grid2">
        <div class="alkam-v6-card">
          <h3 class="alkam-v6-title" style="font-size:18px">Gelir Tablosu</h3>
          <table class="alkam-v6-table">
            <tr><th>Kalem</th><th>Tutar</th></tr>
            <tr><td>Fatura Kesilmesi Gereken / Tahakkuk</td><td class="alkam-v6-v green" style="font-size:15px">${money(buYilTT)}</td></tr>
            <tr><td>Tahsil Edilen</td><td class="alkam-v6-v green" style="font-size:15px">${money(tahsilat)}</td></tr>
            <tr><td>Giderler</td><td class="alkam-v6-v red" style="font-size:15px">${money(buYilGider)}</td></tr>
            <tr><td><b>Net Kâr</b></td><td class="alkam-v6-v ${net>=0?"green":"red"}" style="font-size:15px">${money(net)}</td></tr>
          </table>
        </div>
        <div class="alkam-v6-card">
          <h3 class="alkam-v6-title" style="font-size:18px">Mini Bilanço / Finans Analizi</h3>
          <table class="alkam-v6-table">
            <tr><th>Kalem</th><th>Tutar</th></tr>
            <tr><td>Alacak / Pozitif Bakiye</td><td class="alkam-v6-v blue" style="font-size:15px">${money(bakiye)}</td></tr>
            <tr><td>Nakit/Tahsilat Göstergesi</td><td class="alkam-v6-v green" style="font-size:15px">${money(tahsilat)}</td></tr>
            <tr><td>Gider Baskısı</td><td class="alkam-v6-v red" style="font-size:15px">${money(buYilGider)}</td></tr>
            <tr><td><b>Finansal Net Pozisyon</b></td><td class="alkam-v6-v blue" style="font-size:15px">${money(tahsilat-buYilGider)}</td></tr>
          </table>
        </div>
      </div>`;
    tab.prepend(html);
  }

  function boot(){
    fixTrail();
    installAccounts();
    installReports();
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot); else boot();
  document.addEventListener("click",()=>setTimeout(boot,450),true);
  setInterval(boot,5000);
})();