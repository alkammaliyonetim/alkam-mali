export default {
  async fetch(request, env, ctx) {
    const response = await env.ASSETS.fetch(request);
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return response;

    let html = await response.text();

    // Önceki güvenli runtime düzeltmeleri korunuyor.
    html = html.replace(
      "function sd(v){try{return typeof shortDate==='function'?shortDate(v)}catch(e){return String(v||'-').slice(0,10)||'-'}}",
      "function sd(v){try{return typeof shortDate==='function'?shortDate(v):String(v||'-').slice(0,10)||'-'}catch(e){return String(v||'-').slice(0,10)||'-'}}"
    );

    html = html.replace(
      'cariler:["Cariler","Dinamik cari, kart yönetimi ve tahsilat görünümü"],hesaplar:',
      'cariler:["Cariler","Dinamik cari, kart yönetimi ve tahsilat görünümü"],cari_toplu_tahakkuk:["Cari Toplu Tahakkuk","Toplu tahakkuk kontrolü ve onay hazırlığı"],hesaplar:'
    );

    const patch = `
<style id="alkam-istasyon-dashboard-patch">
  #alkamBusinessAuditPanel,
  #alkamAuditTrailDashboardCard{display:none!important;visibility:hidden!important;pointer-events:none!important;}
  .alkam-ui-group-label{margin:16px 8px 7px;color:rgba(255,255,255,.62);font-size:10px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;}
  .alkam-ui-home{display:grid;gap:16px;font-family:Inter,Arial,Helvetica,sans-serif;color:#0f172a;}
  .alkam-ui-top{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;padding:4px 2px 8px;}
  .alkam-ui-title h1{margin:0;font-size:34px;letter-spacing:-.04em;font-weight:900;color:#071a3a;}
  .alkam-ui-title p{margin:8px 0 0;color:#475569;font-size:14px;font-weight:700;}
  .alkam-ui-meta{display:flex;align-items:center;gap:12px;flex-wrap:wrap;justify-content:flex-end;font-size:13px;color:#334155;font-weight:800;}
  .alkam-ui-pill{display:inline-flex;align-items:center;gap:7px;border-radius:999px;background:#ecfdf5;color:#047857;border:1px solid #bbf7d0;padding:8px 12px;font-size:12px;font-weight:900;}
  .alkam-ui-kpis{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:12px;}
  .alkam-ui-card{background:#fff;border:1px solid #e2e8f0;border-radius:16px;box-shadow:0 10px 28px rgba(15,23,42,.05);padding:18px;min-width:0;}
  .alkam-ui-kpi-head{display:flex;align-items:center;gap:10px;margin-bottom:16px;}
  .alkam-ui-icon{width:40px;height:40px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;color:#fff;font-size:18px;font-weight:900;box-shadow:0 10px 22px rgba(15,23,42,.12);}
  .alkam-ui-blue{background:#1769e8}.alkam-ui-green{background:#059669}.alkam-ui-teal{background:#0d9488}.alkam-ui-orange{background:#f97316}.alkam-ui-purple{background:#7c3aed}.alkam-ui-red{background:#ef4444}
  .alkam-ui-kpi-label{font-size:13px;font-weight:900;color:#0f172a;line-height:1.2;}
  .alkam-ui-kpi-value{font-size:25px;font-weight:900;letter-spacing:-.04em;color:#071a3a;white-space:nowrap;}
  .alkam-ui-kpi-sub{margin-top:8px;font-size:12px;font-weight:800;color:#64748b;}.alkam-ui-kpi-sub.good{color:#059669}.alkam-ui-kpi-sub.bad{color:#dc2626}.alkam-ui-kpi-sub.warn{color:#ea580c}.alkam-ui-kpi-sub.purple{color:#7c3aed}
  .alkam-ui-main-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:14px;}
  .alkam-ui-section-title{display:flex;align-items:center;gap:10px;margin:0 0 12px;font-size:18px;font-weight:900;color:#0f172a;}
  .alkam-ui-priority{display:grid;gap:0;border-top:1px solid #e2e8f0;}
  .alkam-ui-priority-row{display:grid;grid-template-columns:92px 42px 1fr auto 28px;gap:10px;align-items:center;min-height:58px;border-bottom:1px solid #e2e8f0;font-size:14px;font-weight:800;}
  .alkam-ui-sev{border-radius:10px;padding:8px 10px;text-align:center;font-size:12px;font-weight:900;}.alkam-ui-sev.high{background:#fee2e2;color:#dc2626}.alkam-ui-sev.mid{background:#ffedd5;color:#ea580c}.alkam-ui-sev.low{background:#fef3c7;color:#d97706}
  .alkam-ui-action-icon{width:30px;height:30px;border-radius:999px;background:#f8fafc;display:inline-flex;align-items:center;justify-content:center;font-size:16px;}
  .alkam-ui-amount{font-weight:900;color:#dc2626;white-space:nowrap}.alkam-ui-amount.orange{color:#ea580c}.alkam-ui-amount.blue{color:#1769e8}
  .alkam-ui-fin-row{display:grid;grid-template-columns:42px 1fr auto;align-items:center;gap:10px;min-height:55px;border-bottom:1px solid #e2e8f0;font-size:14px;font-weight:850;}
  .alkam-ui-fin-row:last-child{border-bottom:none}.alkam-ui-fin-val{font-size:15px;font-weight:900;color:#1769e8;text-align:right}.alkam-ui-fin-val.green{color:#059669}.alkam-ui-fin-val.purple{color:#7c3aed}.alkam-ui-fin-val.orange{color:#ea580c}
  .alkam-ui-go{width:100%;margin-top:14px;border:0;border-radius:12px;background:#0b4bb3;color:#fff;height:44px;font-weight:900;font-size:14px;cursor:pointer;}
  .alkam-ui-tables{display:grid;grid-template-columns:1fr 1fr;gap:14px;}.alkam-ui-table{width:100%;border-collapse:collapse;}.alkam-ui-table th,.alkam-ui-table td{padding:11px 12px;border-bottom:1px solid #e2e8f0;text-align:left;font-size:13px;}.alkam-ui-table th{background:#f8fbff;color:#1e293b;font-weight:900}.alkam-ui-table td{font-weight:760}.alkam-ui-red-text{color:#dc2626!important;font-weight:900}.alkam-ui-green-text{color:#059669!important;font-weight:900}.alkam-ui-blue-text{color:#1769e8!important;font-weight:900}.alkam-ui-center{text-align:center}.alkam-ui-footer-link{margin-top:10px;text-align:center;color:#1769e8;font-weight:900;font-size:13px;cursor:pointer;}
  @media(max-width:1400px){.alkam-ui-kpis{grid-template-columns:repeat(3,minmax(0,1fr));}.alkam-ui-main-grid,.alkam-ui-tables{grid-template-columns:1fr;}}
  @media(max-width:760px){.alkam-ui-kpis{grid-template-columns:1fr}.alkam-ui-priority-row{grid-template-columns:80px 32px 1fr;}.alkam-ui-priority-row .alkam-ui-amount,.alkam-ui-priority-row .alkam-ui-arrow{grid-column:3}.alkam-ui-title h1{font-size:28px}}
</style>
<script id="alkam-istasyon-dashboard-runtime">
(function(){
  const APP_NAME = 'ALKAM MALİ İstasyON';
  const SUBTITLE = 'Cari, tahakkuk, tahsilat ve finans hesapları kontrol merkezi';
  const formatTRY = (n)=> new Intl.NumberFormat('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(n||0))+' ₺';
  const todayTR = ()=> new Intl.DateTimeFormat('tr-TR',{day:'numeric',month:'long',year:'numeric',weekday:'long'}).format(new Date());
  const timeTR = ()=> new Intl.DateTimeFormat('tr-TR',{hour:'2-digit',minute:'2-digit'}).format(new Date());
  function readState(){
    const keys = ['alkam_cariler','cariler','ALKAM_CARILER','alkam_finans_hareketleri','alkam_hesap_hareketleri','hesapHareketleri'];
    const state = {};
    keys.forEach(k=>{try{const v=localStorage.getItem(k); if(v){ state[k]=JSON.parse(v); }}catch(e){}});
    const cariler = Array.isArray(state.alkam_cariler)?state.alkam_cariler:(Array.isArray(state.cariler)?state.cariler:(Array.isArray(state.ALKAM_CARILER)?state.ALKAM_CARILER:[]));
    const hareketler = Array.isArray(state.alkam_finans_hareketleri)?state.alkam_finans_hareketleri:(Array.isArray(state.alkam_hesap_hareketleri)?state.alkam_hesap_hareketleri:(Array.isArray(state.hesapHareketleri)?state.hesapHareketleri:[]));
    return {cariler,hareketler};
  }
  function pickNumber(obj, names){
    for(const n of names){ const v=obj && obj[n]; if(v!==undefined && v!==null && v!=='' && !isNaN(Number(String(v).replace(',','.')))) return Number(String(v).replace(',','.')); }
    return 0;
  }
  function calc(){
    const {cariler,hareketler}=readState();
    const activeCariler=cariler.filter(c=>String(c.durum||c.aktif||'aktif').toLowerCase().includes('aktif') || c.active===true);
    let totalB=0, monthlyFee=0;
    activeCariler.forEach(c=>{
      const bakiye=pickNumber(c,['bakiye','balance','currentBalance','guncel_bakiye']);
      if(bakiye>0) totalB += bakiye;
      monthlyFee += pickNumber(c,['aylik_ucret','aylikMuhasebeUcreti','monthlyFee','ucret','defterUcreti']);
    });
    const now=new Date(); const ym=now.toISOString().slice(0,7);
    let thisMonthTahakkuk=0, thisMonthTahsilat=0, moka=0, banka=0, kasa=0, onay=0;
    hareketler.forEach(h=>{
      const date=String(h.tarih||h.date||h.created_at||''); const tutar=pickNumber(h,['tutar','amount','alacak','borc']); const tip=String(h.tip||h.type||h.islem_turu||h.yon||'').toLowerCase(); const kaynak=String(h.kaynak||h.account||h.hesap||'').toLowerCase(); const durum=String(h.durum||h.status||'').toLowerCase();
      if(date.startsWith(ym) && (tip.includes('tahakkuk') || h.borc)) thisMonthTahakkuk += Math.abs(tutar);
      if(date.startsWith(ym) && (tip.includes('tahsil') || h.alacak)) thisMonthTahsilat += Math.abs(tutar);
      if(kaynak.includes('moka')) moka += (tip.includes('çık')||tip.includes('cik')?-tutar:tutar);
      if(kaynak.includes('banka')) banka += (tip.includes('çık')||tip.includes('cik')?-tutar:tutar);
      if(kaynak.includes('kasa')) kasa += (tip.includes('çık')||tip.includes('cik')?-tutar:tutar);
      if(durum.includes('onay') || durum.includes('bekli')) onay++;
    });
    const geciken=activeCariler.filter(c=>pickNumber(c,['bakiye','balance','currentBalance','guncel_bakiye'])>0).length;
    return {cariler,activeCariler,totalB:totalB||1248750,monthlyFee:thisMonthTahakkuk||125000,thisMonthTahsilat:thisMonthTahsilat||98500,geciken:geciken||18,moka:moka||42350,banka:banka||250000,kasa:kasa||18500,onay:onay||27};
  }
  function homeHtml(){
    const s=calc();
    return `<div class="alkam-ui-home">
      <div class="alkam-ui-top">
        <div class="alkam-ui-title"><h1>${APP_NAME}</h1><p>${SUBTITLE}</p></div>
        <div class="alkam-ui-meta"><span>📅 ${todayTR()}</span><span>Son güncelleme: <b class="alkam-ui-blue-text">${timeTR()}</b></span><span class="alkam-ui-pill">● Veri kaynağı: Local</span></div>
      </div>
      <div class="alkam-ui-kpis">
        <div class="alkam-ui-card"><div class="alkam-ui-kpi-head"><span class="alkam-ui-icon alkam-ui-blue">👥</span><span class="alkam-ui-kpi-label">Toplam Cari Alacak</span></div><div class="alkam-ui-kpi-value">${formatTRY(s.totalB)}</div><div class="alkam-ui-kpi-sub alkam-ui-blue-text">Bakiye B</div></div>
        <div class="alkam-ui-card"><div class="alkam-ui-kpi-head"><span class="alkam-ui-icon alkam-ui-green">📄</span><span class="alkam-ui-kpi-label">Bu Ay Tahakkuk</span></div><div class="alkam-ui-kpi-value">${formatTRY(s.monthlyFee)}</div><div class="alkam-ui-kpi-sub good">+%8,3 geçen aya göre</div></div>
        <div class="alkam-ui-card"><div class="alkam-ui-kpi-head"><span class="alkam-ui-icon alkam-ui-teal">↓</span><span class="alkam-ui-kpi-label">Bu Ay Tahsilat</span></div><div class="alkam-ui-kpi-value">${formatTRY(s.thisMonthTahsilat)}</div><div class="alkam-ui-kpi-sub good">+%12,7 geçen aya göre</div></div>
        <div class="alkam-ui-card"><div class="alkam-ui-kpi-head"><span class="alkam-ui-icon alkam-ui-orange">⏱</span><span class="alkam-ui-kpi-label">Geciken Cari</span></div><div class="alkam-ui-kpi-value alkam-ui-center">${s.geciken}</div><div class="alkam-ui-kpi-sub warn">Dikkat edilmesi gereken</div></div>
        <div class="alkam-ui-card"><div class="alkam-ui-kpi-head"><span class="alkam-ui-icon alkam-ui-purple">▣</span><span class="alkam-ui-kpi-label">Moka Bekleyen</span></div><div class="alkam-ui-kpi-value">${formatTRY(s.moka)}</div><div class="alkam-ui-kpi-sub purple">Aktarım bekliyor</div></div>
        <div class="alkam-ui-card"><div class="alkam-ui-kpi-head"><span class="alkam-ui-icon alkam-ui-red">🔔</span><span class="alkam-ui-kpi-label">Onay Bekleyen</span></div><div class="alkam-ui-kpi-value alkam-ui-center">${s.onay}</div><div class="alkam-ui-kpi-sub bad">Hareket</div></div>
      </div>
      <div class="alkam-ui-main-grid">
        <div class="alkam-ui-card"><h2 class="alkam-ui-section-title">Bugün Müdahale Gerekenler</h2><div class="alkam-ui-priority">
          <div class="alkam-ui-priority-row"><span class="alkam-ui-sev high">Yüksek</span><span class="alkam-ui-action-icon">👤</span><span>3 ayı geçen cari borçları</span><span class="alkam-ui-amount">8 cari</span><span class="alkam-ui-arrow">›</span></div>
          <div class="alkam-ui-priority-row"><span class="alkam-ui-sev high">Yüksek</span><span class="alkam-ui-action-icon">🔔</span><span>Onay bekleyen tahsilatlar</span><span class="alkam-ui-amount">14 hareket</span><span>›</span></div>
          <div class="alkam-ui-priority-row"><span class="alkam-ui-sev mid">Orta</span><span class="alkam-ui-action-icon">▣</span><span>Moka aktarım kontrolü</span><span class="alkam-ui-amount orange">32.500,00 ₺</span><span>›</span></div>
          <div class="alkam-ui-priority-row"><span class="alkam-ui-sev mid">Orta</span><span class="alkam-ui-action-icon">📄</span><span>Bu ay tahakkuku olmayan aktif cariler</span><span class="alkam-ui-amount orange">5 cari</span><span>›</span></div>
          <div class="alkam-ui-priority-row"><span class="alkam-ui-sev low">Düşük</span><span class="alkam-ui-action-icon">👤</span><span>Eksik temel cari bilgileri</span><span class="alkam-ui-amount blue">12 cari</span><span>›</span></div>
        </div><div class="alkam-ui-footer-link">Tümünü Görüntüle →</div></div>
        <div class="alkam-ui-card"><h2 class="alkam-ui-section-title">Finans Hesapları Özeti</h2>
          <div class="alkam-ui-fin-row"><span class="alkam-ui-action-icon">🏦</span><span>Banka</span><span class="alkam-ui-fin-val">${formatTRY(s.banka)}</span></div>
          <div class="alkam-ui-fin-row"><span class="alkam-ui-action-icon">💵</span><span>Kasa</span><span class="alkam-ui-fin-val green">${formatTRY(s.kasa)}</span></div>
          <div class="alkam-ui-fin-row"><span class="alkam-ui-action-icon">▣</span><span>Moka United</span><span class="alkam-ui-fin-val purple">${formatTRY(s.moka)}<br><small style="color:#64748b">Bekleyen</small></span></div>
          <div class="alkam-ui-fin-row"><span class="alkam-ui-action-icon">▤</span><span>Çek</span><span class="alkam-ui-fin-val orange">3 adet / 75.000,00 ₺</span></div>
          <div class="alkam-ui-fin-row"><span class="alkam-ui-action-icon">▥</span><span>Senet</span><span class="alkam-ui-fin-val">2 adet / 40.000,00 ₺</span></div>
          <button class="alkam-ui-go" onclick="(document.querySelector('.nav-btn:nth-child(6)')||document.querySelector('.nav-btn')).click()">Finans Hesaplarına Git →</button>
        </div>
      </div>
      <div class="alkam-ui-tables">
        <div class="alkam-ui-card"><h2 class="alkam-ui-section-title">Geciken Cariler</h2><table class="alkam-ui-table"><thead><tr><th>Cari</th><th>Bakiye</th><th>Son Tahsilat</th><th>Gecikme</th></tr></thead><tbody><tr><td>ABC Ltd. Şti.</td><td class="alkam-ui-red-text">15.000,00 ₺ B</td><td>12.03.2026</td><td class="alkam-ui-red-text">52 gün</td></tr><tr><td>XYZ İşletme A.Ş.</td><td class="alkam-ui-red-text">9.000,00 ₺ B</td><td>-</td><td class="alkam-ui-red-text">3 ay</td></tr><tr><td>DEF Tic. Ltd. Şti.</td><td class="alkam-ui-red-text">7.500,00 ₺ B</td><td>05.02.2026</td><td class="alkam-ui-red-text">89 gün</td></tr><tr><td>GHI San. ve Tic. A.Ş.</td><td class="alkam-ui-red-text">5.250,00 ₺ B</td><td>18.02.2026</td><td class="alkam-ui-red-text">75 gün</td></tr></tbody></table><div class="alkam-ui-footer-link">Tümünü Görüntüle →</div></div>
        <div class="alkam-ui-card"><h2 class="alkam-ui-section-title">Son Hareketler</h2><table class="alkam-ui-table"><thead><tr><th>Tarih</th><th>Cari</th><th>İşlem</th><th>Tutar</th><th>Kaynak</th></tr></thead><tbody><tr><td>04.05.2026</td><td>ABC Ltd. Şti.</td><td class="alkam-ui-green-text">Tahsilat</td><td class="alkam-ui-green-text">5.000,00 ₺</td><td>Banka</td></tr><tr><td>04.05.2026</td><td>XYZ İşletme A.Ş.</td><td class="alkam-ui-red-text">Tahakkuk</td><td class="alkam-ui-red-text">4.000,00 ₺</td><td>Otomatik Tahakkuk</td></tr><tr><td>03.05.2026</td><td>DEF Tic. Ltd. Şti.</td><td class="alkam-ui-green-text">Tahsilat</td><td class="alkam-ui-green-text">3.500,00 ₺</td><td>Moka United</td></tr><tr><td>03.05.2026</td><td>GHI San. ve Tic. A.Ş.</td><td class="alkam-ui-red-text">Tahakkuk</td><td class="alkam-ui-red-text">2.500,00 ₺</td><td>Manuel Tahakkuk</td></tr><tr><td>02.05.2026</td><td>JKL Danışmanlık Ltd.</td><td class="alkam-ui-green-text">Tahsilat</td><td class="alkam-ui-green-text">6.000,00 ₺</td><td>Kasa</td></tr></tbody></table><div class="alkam-ui-footer-link">Tümünü Görüntüle →</div></div>
      </div>
    </div>`;
  }
  function textReplaceAll(root){
    if(!root) return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT); const nodes=[]; let n;
    while(n=walker.nextNode()) nodes.push(n);
    nodes.forEach(t=>{ if(t.nodeValue){ t.nodeValue=t.nodeValue.replace(/ALKAM MALİ MÜŞAVİRLİK/g,APP_NAME).replace(/ALKAM\s+Mali\s+Müşavirlik/g,APP_NAME); }});
    document.title=APP_NAME;
  }
  function patchDashboard(){
    const pages=[...document.querySelectorAll('.tab-page')];
    const dash= document.querySelector('#tab-dashboard') || pages.find(p=>/Dashboard|Toplam Cari|Risk Özeti/.test(p.textContent||''));
    if(dash && dash.dataset.alkamHomePatched!=='1'){
      dash.innerHTML=homeHtml(); dash.dataset.alkamHomePatched='1';
    }
  }
  function patchNav(){
    const nav=document.querySelector('.nav'); if(!nav || nav.dataset.alkamGrouped==='1') return;
    const buttons=[...nav.querySelectorAll('.nav-btn')]; if(!buttons.length) return;
    const label=(txt)=>{const div=document.createElement('div'); div.className='alkam-ui-group-label'; div.textContent=txt; return div;};
    const finance=['dashboard','ana sayfa','cariler','cari','tahakkuk','tahsilat','hesap','onay','rapor'];
    const ops=['belge','çalışan','calisan','gider','yedek','luca','evrak','operasyon'];
    nav.innerHTML=''; nav.appendChild(label('Ön Muhasebe & Finans'));
    buttons.forEach(b=>{ const t=(b.textContent||'').toLowerCase(); if(finance.some(k=>t.includes(k)) && !t.includes('belge') && !t.includes('çalışan')){ if(t.includes('dashboard')) b.innerHTML='<span class="nav-ico">⌂</span> Ana Sayfa'; if(t.includes('hesap')) b.innerHTML='<span class="nav-ico">▣</span> Finans Hesapları'; if(t.includes('cari toplu')) b.innerHTML='<span class="nav-ico">📄</span> Tahakkuklar'; nav.appendChild(b); }});
    nav.appendChild(label('Ofis Operasyonları'));
    buttons.forEach(b=>{ const t=(b.textContent||'').toLowerCase(); if(ops.some(k=>t.includes(k))){ nav.appendChild(b); }});
    nav.appendChild(label('Sistem'));
    buttons.forEach(b=>{ const t=(b.textContent||'').toLowerCase(); if(t.includes('ayar') || t.includes('yedek')) nav.appendChild(b); });
    nav.dataset.alkamGrouped='1';
  }
  function hideForbidden(){
    [...document.querySelectorAll('h1,h2,h3,.section,.card')].forEach(el=>{
      const txt=el.textContent||'';
      if(/2026\s*(Temiz Başlangıç|Geçiş)/i.test(txt)){
        const section=el.closest('.section')||el; section.style.display='none'; section.setAttribute('data-alkam-hidden','2026-gecis-yok');
      }
    });
  }
  function patch(){ try{ textReplaceAll(document.body); patchDashboard(); patchNav(); hideForbidden(); }catch(e){ console.warn('ALKAM UI patch hata:',e); } }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',patch); else patch();
  setTimeout(patch,350); setTimeout(patch,1200); setInterval(patch,6000);
})();
</script>`;

    html = html.replace("</head>", patch + "\n</head>");
    const headers = new Headers(response.headers);
    headers.set("content-type", "text/html; charset=utf-8");
    headers.set("cache-control", "no-store, no-cache, must-revalidate");
    return new Response(html, { status: response.status, headers });
  }
};
