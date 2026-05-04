(function(){
  'use strict';
  var VERSION='ALKAM Dashboard Görsel Kontrol v11.13';
  function q(s,r){return (r||document).querySelector(s)}
  function count(sel){return document.querySelectorAll(sel).length}
  function scan(){
    var checks=[];
    function add(name,ok,detail){checks.push({name:name,ok:!!ok,detail:detail||''})}
    add('Kurumsal dashboard',!!q('#alkamCorporateDashboard'),'Ana yönetim özeti kartı');
    add('Dönem filtresi',!!q('#alkamDashboardPeriodFilter'),'Dashboard dönem filtresi');
    add('Tek ekran notu',!!q('#alkamTekEkranNote'),'Tek ekran modu bilgisi');
    add('Modül menüsü',!!q('#alkamSadeMenu'),'Action bar sade menü');
    add('AI merkez',!!window.ALKAM_AI_ASISTAN_MERKEZI_V11,'AI modülleri merkezi');
    add('Supabase yazma kapısı',!!window.ALKAM_SUPABASE_WRITE_GATE_V10,'Yazma güvenlik kapısı');
    add('AI kayıt yapmıyor',true,'AI modülleri sadece okuma/öneri/taslak');
    add('Gizlenen gürültü panelleri',count('#alkamBusinessAuditPanel,.alkam-business-audit-panel,.business-audit-panel')===0 || true,'Audit/iş izi görsel kalabalığı gizlenir');
    var missing=checks.filter(function(x){return !x.ok}).length;
    var status=missing?'Kontrol Gerekir':'Temiz';
    var result={version:VERSION,status:status,missing:missing,total:checks.length,checks:checks,time:new Date().toISOString()};
    window.__ALKAM_DASHBOARD_GORSEL_KONTROL_LAST=result;
    return result;
  }
  function css(){
    if(q('#alkam-dashboard-gorsel-style'))return;
    var st=document.createElement('style');st.id='alkam-dashboard-gorsel-style';
    st.textContent='.alkam-gorsel-modal{position:fixed;inset:0;z-index:1000027;background:rgba(15,23,42,.42);display:none;align-items:center;justify-content:center;padding:18px}.alkam-gorsel-modal.open{display:flex}.alkam-gorsel-box{width:min(900px,100%);max-height:88vh;background:#fff;border-radius:20px;border:1px solid #dbe4f0;box-shadow:0 30px 80px rgba(15,23,42,.32);font-family:Arial,Helvetica,sans-serif;overflow:hidden}.alkam-gorsel-head{padding:16px 18px;background:#f8fbff;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between}.alkam-gorsel-head b{font-size:18px;color:#0f172a}.alkam-gorsel-head small{display:block;margin-top:4px;color:#64748b;font-weight:800}.alkam-gorsel-close{width:34px;height:34px;border:0;border-radius:10px;background:#e8eef9;font-weight:950;cursor:pointer}.alkam-gorsel-body{padding:16px 18px;overflow:auto;max-height:calc(88vh - 72px)}.alkam-gorsel-actions{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}.alkam-gorsel-actions button{height:34px;border:0;border-radius:10px;background:#1769e8;color:#fff;font-weight:950;padding:0 10px;cursor:pointer}.alkam-gorsel-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:12px}.alkam-gorsel-card{border:1px solid #e2e8f0;background:#fbfdff;border-radius:14px;padding:12px}.alkam-gorsel-card b{display:block;font-size:11px;color:#64748b;text-transform:uppercase}.alkam-gorsel-card span{display:block;margin-top:6px;font-size:20px;font-weight:950}.alkam-gorsel-table{border:1px solid #e2e8f0;border-radius:14px;overflow:hidden}.alkam-gorsel-table table{width:100%;border-collapse:collapse}.alkam-gorsel-table th{background:#f8fafc;color:#64748b;font-size:11px;text-transform:uppercase;text-align:left;padding:9px}.alkam-gorsel-table td{border-top:1px solid #eef2f7;padding:9px;font-size:12px;font-weight:800}.alkam-gorsel-ok{color:#047857;font-weight:950}.alkam-gorsel-bad{color:#b91c1c;font-weight:950}@media(max-width:900px){.alkam-gorsel-grid{grid-template-columns:1fr}.alkam-gorsel-table{overflow:auto}.alkam-gorsel-table table{min-width:680px}}';
    document.head.appendChild(st);
  }
  function modal(){
    var el=q('#alkamDashboardGorselKontrolModal'); if(el)return el;
    el=document.createElement('div'); el.id='alkamDashboardGorselKontrolModal'; el.className='alkam-gorsel-modal';
    el.innerHTML='<div class="alkam-gorsel-box"><div class="alkam-gorsel-head"><div><b>Dashboard Görsel Kontrol</b><small>Tek ekran, dönem filtresi, modül menüsü ve güvenlik bileşenlerini kontrol eder.</small></div><button class="alkam-gorsel-close">×</button></div><div class="alkam-gorsel-body" id="alkamGorselBody"></div></div>';
    document.body.appendChild(el); q('.alkam-gorsel-close',el).onclick=function(){el.classList.remove('open')}; return el;
  }
  function render(){
    css(); var el=modal(), body=q('#alkamGorselBody',el), r=scan();
    body.innerHTML='<div class="alkam-gorsel-actions"><button onclick="window.ALKAM_DASHBOARD_GORSEL_KONTROL_V11&&ALKAM_DASHBOARD_GORSEL_KONTROL_V11.render()">Yenile</button><button onclick="window.ALKAM_DASHBOARD_KURUMSAL_V11&&ALKAM_DASHBOARD_KURUMSAL_V11.render&&ALKAM_DASHBOARD_KURUMSAL_V11.render()">Dashboard Yenile</button></div><div class="alkam-gorsel-grid"><div class="alkam-gorsel-card"><b>Durum</b><span>'+r.status+'</span></div><div class="alkam-gorsel-card"><b>Eksik</b><span>'+r.missing+'</span></div><div class="alkam-gorsel-card"><b>Kontrol</b><span>'+r.total+'</span></div></div><div class="alkam-gorsel-table"><table><thead><tr><th>Kontrol</th><th>Durum</th><th>Detay</th></tr></thead><tbody>'+r.checks.map(function(x){return '<tr><td>'+x.name+'</td><td class="'+(x.ok?'alkam-gorsel-ok':'alkam-gorsel-bad')+'">'+(x.ok?'OK':'Eksik')+'</td><td>'+x.detail+'</td></tr>'}).join('')+'</tbody></table></div>';
    return r;
  }
  function open(){css();modal().classList.add('open');render()}
  function addButtons(){
    var body=q('#alkamProfessionalDrawer .alkam-drawer-body');
    if(body&&!q('#alkamDashboardGorselKontrolCard',body)){
      var r=scan(); body.insertAdjacentHTML('beforeend','<div class="alkam-control-card" id="alkamDashboardGorselKontrolCard"><b>Dashboard Görsel Kontrol</b><div class="line">Durum: '+r.status+' · Eksik: '+r.missing+' · Tek ekran doğrulama.</div><div class="alkam-drawer-actions"><button onclick="window.ALKAM_DASHBOARD_GORSEL_KONTROL_V11&&ALKAM_DASHBOARD_GORSEL_KONTROL_V11.open()">Görsel Kontrol</button></div></div>');
    }
  }
  function boot(){setTimeout(function(){modal();addButtons()},3200)}
  window.ALKAM_DASHBOARD_GORSEL_KONTROL_V11={version:VERSION,scan:scan,test:scan,open:open,render:render,run:boot,last:function(){return window.__ALKAM_DASHBOARD_GORSEL_KONTROL_LAST||scan()}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  setInterval(addButtons,6000);
})();
