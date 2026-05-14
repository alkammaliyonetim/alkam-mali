// ALKAM Mali - Cari Listesi Risk Etiketleri, Filtresi, Sayaci, Tiklanabilir Dagilim ve Hizli Butonlar
// Liste kartlarini gorunen metne gore isaretler; veri kaydina dokunmaz.
(function(){
  'use strict';
  if(window.__ALKAM_CARI_LIST_RISK_V8__) return;
  window.__ALKAM_CARI_LIST_RISK_V8__ = true;

  function ensureStyle(){
    if(document.getElementById('alkamCariListRiskStyle')) return;
    var st = document.createElement('style');
    st.id = 'alkamCariListRiskStyle';
    st.textContent = '.alkam-risk-badge{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:4px 7px;font-size:10px;font-weight:950;margin-left:6px;white-space:nowrap}' +
      '.alkam-risk-badge.risk{background:#fef2f2;color:#b91c1c;border:1px solid #fecaca}' +
      '.alkam-risk-badge.warn{background:#fff7ed;color:#c2410c;border:1px solid #fed7aa}' +
      '.alkam-risk-badge.good{background:#ecfdf5;color:#047857;border:1px solid #a7f3d0}' +
      '.alkam-risk-badge.check{background:#f1f5f9;color:#475569;border:1px solid #e2e8f0}' +
      '#cariList .list-title{display:flex;align-items:center;justify-content:space-between;gap:8px}' +
      '#cariList .list-item.alkam-risk-row{border-color:#fecaca;background:#fffafa}' +
      '#cariList .list-item.alkam-warn-row{border-color:#fed7aa;background:#fffdf7}' +
      '#alkamRiskFilter{width:100%;border:1px solid #d8e1ef;border-radius:9px;min-height:40px;padding:9px 11px;font-size:12px;font-weight:900;background:#fff;color:#0f172a}' +
      '#alkamRiskCount{border:1px solid #dbeafe;background:#eff6ff;color:#1d4ed8;border-radius:999px;padding:8px 10px;font-size:11px;font-weight:950;text-align:center;align-self:center;cursor:pointer}' +
      '#alkamRiskDistribution{grid-column:1/-1;display:flex;gap:7px;flex-wrap:wrap;margin-top:2px}' +
      '#alkamRiskDistribution .pill{display:inline-flex;align-items:center;gap:4px;border-radius:999px;padding:7px 9px;font-size:11px;font-weight:950;border:1px solid #e2e8f0;background:#fff;color:#334155;cursor:pointer;user-select:none}' +
      '#alkamRiskDistribution .pill:hover,#alkamRiskDistribution .pill.active{outline:2px solid rgba(23,105,232,.28);outline-offset:1px}' +
      '#alkamRiskDistribution .risk{border-color:#fecaca;background:#fef2f2;color:#b91c1c}' +
      '#alkamRiskDistribution .warn{border-color:#fed7aa;background:#fff7ed;color:#c2410c}' +
      '#alkamRiskDistribution .good{border-color:#a7f3d0;background:#ecfdf5;color:#047857}' +
      '#alkamRiskDistribution .check{border-color:#e2e8f0;background:#f1f5f9;color:#475569}' +
      '#alkamQuickAllBtn{border:1px solid #dbeafe!important;background:#eff6ff!important;color:#1d4ed8!important}' +
      '#alkamQuickRiskBtn{border:1px solid #fecaca!important;background:#fef2f2!important;color:#b91c1c!important}' +
      '#alkamQuickWarnBtn{border:1px solid #fed7aa!important;background:#fff7ed!important;color:#c2410c!important}' +
      '#alkamQuickAllBtn.active,#alkamQuickRiskBtn.active,#alkamQuickWarnBtn.active{box-shadow:0 0 0 3px rgba(23,105,232,.18)!important}' +
      '@media(max-width:760px){#tab-cariler .toolbar{grid-template-columns:1fr!important}#alkamRiskCount{width:100%;border-radius:10px}#alkamRiskDistribution{display:grid;grid-template-columns:1fr 1fr}.pill{justify-content:center}}';
    document.head.appendChild(st);
  }

  function textOf(el){ return (el && el.textContent || '').replace(/\s+/g,' ').trim(); }
  function parseDate(value){
    var s = String(value || '').replace(/\s+/g,' ').trim();
    var matches = [];
    var re1 = /(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})/g;
    var m;
    while((m = re1.exec(s)) !== null) matches.push(new Date(Number(m[1]), Number(m[2])-1, Number(m[3])));
    var re2 = /(\d{1,2})[-/.](\d{1,2})[-/.](20\d{2})/g;
    while((m = re2.exec(s)) !== null) matches.push(new Date(Number(m[3]), Number(m[2])-1, Number(m[1])));
    if(!matches.length) return null;
    return new Date(Math.max.apply(null, matches.map(function(d){ return d.getTime(); })));
  }
  function daysSince(d){
    if(!d) return null;
    var today = new Date();
    var a = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    var b = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return Math.max(0, Math.floor((a-b)/86400000));
  }
  function riskForDays(gap){
    if(gap === null) return {cls:'check', text:'Kontrol'};
    if(gap >= 90) return {cls:'risk', text:'Riskli'};
    if(gap >= 30) return {cls:'warn', text:'Takip'};
    return {cls:'good', text:'Güncel'};
  }
  function chooseRisk(risk){
    var sel = document.getElementById('alkamRiskFilter');
    if(sel) sel.value = risk;
    markList();
    var list = document.getElementById('cariList');
    if(list){ try{ list.scrollIntoView({behavior:'smooth', block:'start'}); }catch(e){ list.scrollIntoView(true); } }
  }
  function installQuickButtons(){
    var row = document.querySelector('#tab-cariler .topbar .btn-row');
    if(!row) return;
    if(!document.getElementById('alkamQuickAllBtn')){
      var allBtn = document.createElement('button');
      allBtn.id = 'alkamQuickAllBtn';
      allBtn.type = 'button';
      allBtn.className = 'btn btn-soft';
      allBtn.textContent = 'Tüm Cariler';
      allBtn.title = 'Tüm carileri göster';
      allBtn.addEventListener('click', function(){ chooseRisk('all'); });
      row.appendChild(allBtn);
    }
    if(!document.getElementById('alkamQuickRiskBtn')){
      var riskBtn = document.createElement('button');
      riskBtn.id = 'alkamQuickRiskBtn';
      riskBtn.type = 'button';
      riskBtn.className = 'btn btn-soft';
      riskBtn.textContent = 'Riskli Cariler';
      riskBtn.title = 'Sadece riskli carileri göster';
      riskBtn.addEventListener('click', function(){ chooseRisk('risk'); });
      row.appendChild(riskBtn);
    }
    if(!document.getElementById('alkamQuickWarnBtn')){
      var warnBtn = document.createElement('button');
      warnBtn.id = 'alkamQuickWarnBtn';
      warnBtn.type = 'button';
      warnBtn.className = 'btn btn-soft';
      warnBtn.textContent = 'Takipte Cariler';
      warnBtn.title = 'Sadece takipteki carileri göster';
      warnBtn.addEventListener('click', function(){ chooseRisk('warn'); });
      row.appendChild(warnBtn);
    }
  }
  function installRiskFilter(){
    var toolbar = document.querySelector('#tab-cariler .toolbar');
    if(!toolbar) return;
    if(!document.getElementById('alkamRiskFilter')){
      var sel = document.createElement('select');
      sel.id = 'alkamRiskFilter';
      sel.innerHTML = '<option value="all">Tüm riskler</option><option value="risk">Riskli</option><option value="warn">Takip</option><option value="good">Güncel</option><option value="check">Kontrol</option>';
      toolbar.appendChild(sel);
      sel.addEventListener('change', markList);
    }
    if(!document.getElementById('alkamRiskCount')){
      var count = document.createElement('div');
      count.id = 'alkamRiskCount';
      count.textContent = '0 cari';
      count.title = 'Tüm riskleri göster';
      count.addEventListener('click', function(){ var sel=document.getElementById('alkamRiskFilter'); if(sel) sel.value='all'; markList(); });
      toolbar.appendChild(count);
    }
    if(!document.getElementById('alkamRiskDistribution')){
      var dist = document.createElement('div');
      dist.id = 'alkamRiskDistribution';
      toolbar.appendChild(dist);
    }
    toolbar.style.gridTemplateColumns = '1.1fr .72fr .72fr .72fr .55fr';
  }
  function updateQuickButtons(){
    var allBtn = document.getElementById('alkamQuickAllBtn');
    var riskBtn = document.getElementById('alkamQuickRiskBtn');
    var warnBtn = document.getElementById('alkamQuickWarnBtn');
    var sel = document.getElementById('alkamRiskFilter');
    if(allBtn) allBtn.classList.toggle('active', !!(sel && sel.value === 'all'));
    if(riskBtn) riskBtn.classList.toggle('active', !!(sel && sel.value === 'risk'));
    if(warnBtn) warnBtn.classList.toggle('active', !!(sel && sel.value === 'warn'));
  }
  function updateDistribution(totals){
    var dist = document.getElementById('alkamRiskDistribution');
    if(!dist) return;
    var current = (document.getElementById('alkamRiskFilter') || {}).value || 'all';
    dist.innerHTML = ''+
      '<span data-risk="risk" class="pill risk '+(current==='risk'?'active':'')+'">Riskli: <b>'+totals.risk+'</b></span>'+
      '<span data-risk="warn" class="pill warn '+(current==='warn'?'active':'')+'">Takip: <b>'+totals.warn+'</b></span>'+
      '<span data-risk="good" class="pill good '+(current==='good'?'active':'')+'">Güncel: <b>'+totals.good+'</b></span>'+
      '<span data-risk="check" class="pill check '+(current==='check'?'active':'')+'">Kontrol: <b>'+totals.check+'</b></span>';
    Array.prototype.slice.call(dist.querySelectorAll('[data-risk]')).forEach(function(p){
      p.addEventListener('click', function(){ chooseRisk(p.getAttribute('data-risk')); });
    });
  }
  function applyRiskFilter(items, totals){
    var sel = document.getElementById('alkamRiskFilter');
    var mode = sel ? sel.value : 'all';
    var visible = 0;
    items.forEach(function(item){
      var risk = item.dataset.alkamRisk || 'check';
      var riskVisible = mode === 'all' || mode === risk;
      item.style.display = riskVisible ? '' : 'none';
      if(riskVisible) visible += 1;
    });
    var count = document.getElementById('alkamRiskCount');
    if(count) count.textContent = visible + ' / ' + items.length + ' cari';
    updateDistribution(totals);
    updateQuickButtons();
  }
  function markList(){
    ensureStyle();
    installQuickButtons();
    installRiskFilter();
    var list = document.getElementById('cariList');
    if(!list) return;
    var items = Array.prototype.slice.call(list.querySelectorAll('.list-item'));
    var totals = {risk:0,warn:0,good:0,check:0};
    items.forEach(function(item){
      var title = item.querySelector('.list-title') || item;
      var old = item.querySelector('.alkam-risk-badge');
      if(old) old.remove();
      item.classList.remove('alkam-risk-row','alkam-warn-row');
      var d = parseDate(textOf(item));
      var gap = daysSince(d);
      var info = riskForDays(gap);
      totals[info.cls] = (totals[info.cls] || 0) + 1;
      item.dataset.alkamRisk = info.cls;
      var badge = document.createElement('span');
      badge.className = 'alkam-risk-badge ' + info.cls;
      badge.textContent = info.text;
      badge.title = gap === null ? 'Tarih okunamadı' : ('Son görülen tarih: ' + gap + ' gün önce');
      title.appendChild(badge);
      if(info.cls === 'risk') item.classList.add('alkam-risk-row');
      if(info.cls === 'warn') item.classList.add('alkam-warn-row');
    });
    applyRiskFilter(items, totals);
  }

  var timer = null;
  function schedule(){ clearTimeout(timer); timer = setTimeout(markList, 120); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule); else schedule();
  var target = document.getElementById('cariList') || document.body;
  if(target && window.MutationObserver) new MutationObserver(schedule).observe(target, { childList:true, subtree:true });
  document.addEventListener('input', function(){ setTimeout(schedule,150); }, true);
  document.addEventListener('change', function(){ setTimeout(schedule,150); }, true);
  document.addEventListener('click', function(){ setTimeout(schedule,150); }, true);
  var tries = 0;
  var boot = setInterval(function(){ markList(); tries += 1; if(tries >= 40) clearInterval(boot); }, 500);
})();
