(function(){
  'use strict';
  var VERSION='ALKAM Günlük Kontrol v9.4';
  var KEY='alkam_gunluk_kontrol_ozetleri';
  function q(s,r){return (r||document).querySelector(s)}
  function readJson(k){try{return JSON.parse(localStorage.getItem(k)||'[]')}catch(e){return []}}
  function writeJson(k,v){localStorage.setItem(k,JSON.stringify(v))}
  function today(){return new Date().toISOString().slice(0,10)}
  function now(){return new Date().toISOString()}
  function build(){
    var health=(window.ALKAM_SAGLIK_KONTROL_V9&&ALKAM_SAGLIK_KONTROL_V9.last)?ALKAM_SAGLIK_KONTROL_V9.last():null;
    var guven=(window.ALKAM_GUVENILIRLIK_RAPORU_V9&&ALKAM_GUVENILIRLIK_RAPORU_V9.build)?ALKAM_GUVENILIRLIK_RAPORU_V9.build():{};
    var banka=(window.ALKAM_BANKA_ONAY_V8&&ALKAM_BANKA_ONAY_V8.summary)?ALKAM_BANKA_ONAY_V8.summary():{};
    var tah=(window.ALKAM_TAHAKKUK_CONTROL_V5C&&ALKAM_TAHAKKUK_CONTROL_V5C.test)?ALKAM_TAHAKKUK_CONTROL_V5C.test():{};
    var finans=(window.ALKAM_FINANS_FLOW_V6&&ALKAM_FINANS_FLOW_V6.summary)?ALKAM_FINANS_FLOW_V6.summary():{};
    var dq=(window.ALKAM_DATA_QUALITY&&ALKAM_DATA_QUALITY.last)?ALKAM_DATA_QUALITY.last():{};
    var errors=(dq.errors||[]).length||0, warnings=(dq.warnings||[]).length||0;
    var score=100;
    if(errors)score-=40;
    if(warnings)score-=15;
    if(Number(banka.onayBekleyen||0)>0)score-=10;
    if(health&&health.fail)score-=30;
    if(score<0)score=0;
    var status=score>=90?'Güvenli':(score>=70?'Kontrol Gerekir':'Kritik');
    return {version:VERSION,date:today(),time:now(),score:score,status:status,health:health?{ok:health.ok,total:health.total,fail:health.fail}:null,dataQuality:{errors:errors,warnings:warnings},banka:{onayBekleyen:banka.onayBekleyen||0,islenen:banka.islenen||0,reddedilen:banka.reddedilen||0},tahakkuk:{count:tah.count||0,total:tah.total||0,status:tah.status||'ok'},finans:{count:finans.count||0},guvenStatus:guven.status||'-'};
  }
  function saveDaily(){
    var list=readJson(KEY), d=today();
    var item=build();
    var idx=list.findIndex(function(x){return x.date===d});
    if(idx>=0)list[idx]=item; else list.unshift(item);
    writeJson(KEY,list.slice(0,120));
    window.__ALKAM_GUNLUK_KONTROL_LAST=item;
    renderBadge(item);
    return item;
  }
  function css(){
    if(q('#alkam-gunluk-kontrol-style'))return;
    var st=document.createElement('style');st.id='alkam-gunluk-kontrol-style';
    st.textContent='#alkamDailyControlBadge{position:fixed;right:22px;bottom:172px;z-index:999997;border:0;border-radius:999px;height:36px;padding:0 12px;font-weight:950;font-family:Arial,Helvetica,sans-serif;box-shadow:0 12px 28px rgba(15,23,42,.18);cursor:pointer;background:#dcfce7;color:#047857}#alkamDailyControlBadge.warn{background:#ffedd5;color:#9a3412}#alkamDailyControlBadge.bad{background:#fee2e2;color:#991b1b}.alkam-daily-modal{position:fixed;inset:0;z-index:1000007;background:rgba(15,23,42,.42);display:none;align-items:center;justify-content:center;padding:18px}.alkam-daily-modal.open{display:flex}.alkam-daily-box{width:min(920px,100%);max-height:88vh;background:#fff;border-radius:20px;border:1px solid #dbe4f0;box-shadow:0 30px 80px rgba(15,23,42,.32);font-family:Arial,Helvetica,sans-serif;overflow:hidden}.alkam-daily-head{padding:16px 18px;background:linear-gradient(180deg,#f8fbff,#fff);border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between}.alkam-daily-head b{font-size:18px;color:#0f172a}.alkam-daily-head small{display:block;margin-top:4px;color:#64748b;font-weight:800}.alkam-daily-close{width:34px;height:34px;border:0;border-radius:10px;background:#e8eef9;font-weight:950;cursor:pointer}.alkam-daily-body{padding:16px 18px;overflow:auto;max-height:calc(88vh - 72px)}.alkam-daily-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:14px}.alkam-daily-card{border:1px solid #e2e8f0;background:#fbfdff;border-radius:14px;padding:12px}.alkam-daily-card b{display:block;font-size:11px;color:#64748b;text-transform:uppercase}.alkam-daily-card span{display:block;margin-top:6px;font-size:20px;font-weight:950;color:#0f172a}.alkam-daily-table{border:1px solid #e2e8f0;border-radius:14px;overflow:hidden}.alkam-daily-table table{width:100%;border-collapse:collapse}.alkam-daily-table th{background:#f8fafc;color:#64748b;font-size:11px;text-transform:uppercase;text-align:left;padding:9px}.alkam-daily-table td{border-top:1px solid #eef2f7;padding:9px;font-size:12px;font-weight:800}.alkam-daily-actions{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}.alkam-daily-actions button{height:34px;border:0;border-radius:10px;background:#1769e8;color:#fff;font-weight:950;padding:0 10px;cursor:pointer}@media(max-width:900px){#alkamDailyControlBadge{left:12px;right:auto;bottom:216px}.alkam-daily-grid{grid-template-columns:1fr}}';
    document.head.appendChild(st);
  }
  function renderBadge(item){
    css(); item=item||window.__ALKAM_GUNLUK_KONTROL_LAST||build();
    var b=q('#alkamDailyControlBadge'); if(!b){b=document.createElement('button');b.id='alkamDailyControlBadge';b.type='button';document.body.appendChild(b)}
    b.className=item.score>=90?'':(item.score>=70?'warn':'bad');
    b.textContent='Günlük Kontrol: '+item.score;
    b.title=item.status+' · Banka onay: '+item.banka.onayBekleyen+' · Hata: '+item.dataQuality.errors;
    b.onclick=open;
  }
  function modal(){
    var el=q('#alkamDailyControlModal'); if(el)return el;
    el=document.createElement('div'); el.id='alkamDailyControlModal'; el.className='alkam-daily-modal';
    el.innerHTML='<div class="alkam-daily-box"><div class="alkam-daily-head"><div><b>Günlük Otomatik Kontrol Özeti</b><small>Her gün sistemin finansal güvenilirlik durumunu özetler.</small></div><button class="alkam-daily-close">×</button></div><div class="alkam-daily-body" id="alkamDailyBody"></div></div>';
    document.body.appendChild(el);
    q('.alkam-daily-close',el).onclick=function(){el.classList.remove('open')};
    return el;
  }
  function render(){
    var item=saveDaily(); var el=modal(); var body=q('#alkamDailyBody',el); var list=readJson(KEY);
    body.innerHTML='<div class="alkam-daily-actions"><button onclick="window.ALKAM_GUNLUK_KONTROL_V9&&ALKAM_GUNLUK_KONTROL_V9.refresh()">Yeniden Kontrol Et</button></div><div class="alkam-daily-grid"><div class="alkam-daily-card"><b>Skor</b><span>'+item.score+'</span></div><div class="alkam-daily-card"><b>Durum</b><span>'+item.status+'</span></div><div class="alkam-daily-card"><b>Banka Onay</b><span>'+item.banka.onayBekleyen+'</span></div><div class="alkam-daily-card"><b>Veri H/U</b><span>'+item.dataQuality.errors+'/'+item.dataQuality.warnings+'</span></div></div><div class="alkam-daily-table"><table><thead><tr><th>Tarih</th><th>Skor</th><th>Durum</th><th>Banka Onay</th><th>Veri H/U</th><th>Sağlık</th></tr></thead><tbody>'+list.slice(0,30).map(function(x){return '<tr><td>'+x.date+'</td><td>'+x.score+'</td><td>'+x.status+'</td><td>'+x.banka.onayBekleyen+'</td><td>'+x.dataQuality.errors+'/'+x.dataQuality.warnings+'</td><td>'+((x.health&&x.health.ok)||0)+'/'+((x.health&&x.health.total)||0)+'</td></tr>'}).join('')+'</tbody></table></div>';
    return item;
  }
  function open(){css();modal().classList.add('open');render()}
  function injectDrawer(){
    var body=q('#alkamProfessionalDrawer .alkam-drawer-body'); if(!body||q('#alkamDailyControlCard',body))return;
    var item=window.__ALKAM_GUNLUK_KONTROL_LAST||saveDaily();
    body.insertAdjacentHTML('beforeend','<div class="alkam-control-card" id="alkamDailyControlCard"><b>Günlük Kontrol Özeti</b><div class="line">Skor: '+item.score+' · Durum: '+item.status+' · Banka onay: '+item.banka.onayBekleyen+'</div><div class="alkam-drawer-actions"><button onclick="window.ALKAM_GUNLUK_KONTROL_V9&&ALKAM_GUNLUK_KONTROL_V9.open()">Günlük Özeti Aç</button></div></div>');
  }
  function run(){css();setTimeout(saveDaily,1200);setTimeout(injectDrawer,1800)}
  window.ALKAM_GUNLUK_KONTROL_V9={version:VERSION,build:build,saveDaily:saveDaily,refresh:render,open:open,history:function(){return readJson(KEY)},last:function(){return window.__ALKAM_GUNLUK_KONTROL_LAST||saveDaily()},test:function(){var x=saveDaily();return {version:VERSION,badge:!!q('#alkamDailyControlBadge'),score:x.score,status:x.status,history:readJson(KEY).length,time:now()}}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
  setInterval(function(){saveDaily();injectDrawer()},60000);
})();
