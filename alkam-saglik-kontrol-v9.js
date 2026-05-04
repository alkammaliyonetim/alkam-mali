(function(){
  'use strict';
  var VERSION='ALKAM Sağlık Kontrol v9.3';
  var KEY='alkam_saglik_kontrol_log';
  function q(s,r){return (r||document).querySelector(s)}
  function readJson(k){try{return JSON.parse(localStorage.getItem(k)||'[]')}catch(e){return []}}
  function writeJson(k,v){localStorage.setItem(k,JSON.stringify(v))}
  function now(){return new Date().toISOString()}
  function check(){
    var checks=[];
    function add(name,ok,detail){checks.push({name:name,ok:!!ok,detail:detail||'',time:now()})}
    add('Reliability Guard',!!window.ALKAM_RELIABILITY_GUARD,'Yedek katmanı');
    add('Cari Core',!!window.ALKAM_CARI_CORE_V4,'Cari ekstre çekirdeği');
    add('Data Quality',!!window.ALKAM_DATA_QUALITY,'Veri kalite kontrolü');
    add('Tahakkuk',!!window.ALKAM_TAHAKKUK_V5,'Tahakkuk modülü');
    add('Tahsilat',!!window.ALKAM_TAHSILAT_V7,'Tahsilat modülü');
    add('Finans Flow',!!window.ALKAM_FINANS_FLOW_V6,'Finans hesapları');
    add('Banka Onay',!!window.ALKAM_BANKA_ONAY_V8,'Banka onay çekirdeği');
    add('Güvenilirlik Raporu',!!window.ALKAM_GUVENILIRLIK_RAPORU_V9,'Genel rapor');
    var fail=checks.filter(function(x){return !x.ok});
    var result={version:VERSION,status:fail.length?'warning':'ok',total:checks.length,ok:checks.length-fail.length,fail:fail.length,checks:checks,time:now()};
    window.__ALKAM_SAGLIK_LAST=result;
    var logs=readJson(KEY); logs.unshift(result); writeJson(KEY,logs.slice(0,100));
    renderBadge(result);
    return result;
  }
  function css(){
    if(q('#alkam-saglik-style'))return;
    var st=document.createElement('style'); st.id='alkam-saglik-style';
    st.textContent='#alkamHealthBadge{position:fixed;right:22px;bottom:124px;z-index:999998;border:0;border-radius:999px;height:36px;padding:0 12px;font-weight:950;font-family:Arial,Helvetica,sans-serif;box-shadow:0 12px 28px rgba(15,23,42,.18);cursor:pointer;background:#dcfce7;color:#047857}#alkamHealthBadge.warn{background:#ffedd5;color:#9a3412}.alkam-health-modal{position:fixed;inset:0;z-index:1000006;background:rgba(15,23,42,.42);display:none;align-items:center;justify-content:center;padding:18px}.alkam-health-modal.open{display:flex}.alkam-health-box{width:min(820px,100%);max-height:88vh;background:#fff;border-radius:20px;border:1px solid #dbe4f0;box-shadow:0 30px 80px rgba(15,23,42,.32);font-family:Arial,Helvetica,sans-serif;overflow:hidden}.alkam-health-head{padding:16px 18px;background:linear-gradient(180deg,#f8fbff,#fff);border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between}.alkam-health-head b{font-size:18px;color:#0f172a}.alkam-health-head small{display:block;margin-top:4px;color:#64748b;font-weight:800}.alkam-health-close{width:34px;height:34px;border:0;border-radius:10px;background:#e8eef9;font-weight:950;cursor:pointer}.alkam-health-body{padding:16px 18px;overflow:auto;max-height:calc(88vh - 72px)}.alkam-health-table{border:1px solid #e2e8f0;border-radius:14px;overflow:hidden}.alkam-health-table table{width:100%;border-collapse:collapse}.alkam-health-table th{background:#f8fafc;color:#64748b;font-size:11px;text-transform:uppercase;text-align:left;padding:9px}.alkam-health-table td{border-top:1px solid #eef2f7;padding:9px;font-size:12px;font-weight:800}.alkam-health-ok{color:#047857;font-weight:950}.alkam-health-no{color:#b91c1c;font-weight:950}.alkam-health-actions{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}.alkam-health-actions button{height:34px;border:0;border-radius:10px;background:#1769e8;color:#fff;font-weight:950;padding:0 10px;cursor:pointer}@media(max-width:900px){#alkamHealthBadge{left:12px;right:auto;bottom:170px}}';
    document.head.appendChild(st);
  }
  function renderBadge(r){
    css();
    var b=q('#alkamHealthBadge'); if(!b){b=document.createElement('button');b.id='alkamHealthBadge';b.type='button';document.body.appendChild(b)}
    b.className=r.status==='ok'?'':'warn';
    b.textContent='Sağlık: '+r.ok+'/'+r.total;
    b.title=r.fail?('Eksik modül: '+r.fail):'Tüm temel modüller aktif';
    b.onclick=open;
  }
  function modal(){
    var el=q('#alkamHealthModal'); if(el)return el;
    el=document.createElement('div'); el.id='alkamHealthModal'; el.className='alkam-health-modal';
    el.innerHTML='<div class="alkam-health-box"><div class="alkam-health-head"><div><b>Sistem Başlangıç Sağlık Kontrolü</b><small>Sayfa açıldığında kritik modüllerin yüklenme durumunu kontrol eder.</small></div><button class="alkam-health-close">×</button></div><div class="alkam-health-body"><div class="alkam-health-actions"><button id="alkamHealthRun">Tekrar Kontrol Et</button></div><div id="alkamHealthContent"></div></div></div>';
    document.body.appendChild(el);
    q('.alkam-health-close',el).onclick=function(){el.classList.remove('open')};
    q('#alkamHealthRun',el).onclick=function(){render(check())};
    return el;
  }
  function render(r){
    r=r||window.__ALKAM_SAGLIK_LAST||check();
    var el=modal(); var c=q('#alkamHealthContent',el);
    c.innerHTML='<div class="alkam-health-table"><table><thead><tr><th>Modül</th><th>Durum</th><th>Detay</th></tr></thead><tbody>'+r.checks.map(function(x){return '<tr><td>'+x.name+'</td><td class="'+(x.ok?'alkam-health-ok':'alkam-health-no')+'">'+(x.ok?'Aktif':'Eksik')+'</td><td>'+x.detail+'</td></tr>'}).join('')+'</tbody></table></div>';
  }
  function open(){css();modal().classList.add('open');render(window.__ALKAM_SAGLIK_LAST||check())}
  function injectDrawer(){
    var body=q('#alkamProfessionalDrawer .alkam-drawer-body'); if(!body||q('#alkamHealthCard',body))return;
    var r=window.__ALKAM_SAGLIK_LAST||check();
    body.insertAdjacentHTML('beforeend','<div class="alkam-control-card" id="alkamHealthCard"><b>Sistem Sağlık Kontrolü</b><div class="line">Aktif: '+r.ok+'/'+r.total+' · Eksik: '+r.fail+'</div><div class="alkam-drawer-actions"><button onclick="window.ALKAM_SAGLIK_KONTROL_V9&&ALKAM_SAGLIK_KONTROL_V9.open()">Sağlığı Aç</button></div></div>');
  }
  function run(){css();setTimeout(check,600);setTimeout(injectDrawer,1200)}
  window.ALKAM_SAGLIK_KONTROL_V9={version:VERSION,check:check,open:open,logs:function(){return readJson(KEY)},last:function(){return window.__ALKAM_SAGLIK_LAST||check()},test:function(){var r=check();return {version:VERSION,badge:!!q('#alkamHealthBadge'),status:r.status,ok:r.ok,total:r.total,time:now()}}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
  setInterval(function(){check();injectDrawer()},30000);
})();
