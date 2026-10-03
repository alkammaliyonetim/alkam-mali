(function(){
'use strict';
if(window.__ISTASYON_V13_READINESS__) return;
window.__ISTASYON_V13_READINESS__=true;

var VERSION='İstasyON v13 Readiness 1.2 · 03.10.2026';
var EXPECTED_ACTIVE=77;
var EXPECTED_PASSIVE=66;
var EXPECTED_SPECIAL=1;
var EXPECTED_OPENING=3741583.88;
var CARILER_URL='/alkam-cariler-144-istasyon-canli-03102026.json';
var STATUS_URL='/api/istasyon/status';

function q(s,r){return (r||document).querySelector(s)}
function tl(v){return (Number(v)||0).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})+' TL'}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]})}
async function getJson(url){
  try{
    var res=await fetch(url,{cache:'no-store',headers:{accept:'application/json'}});
    if(!res.ok) return {ok:false,error:'HTTP '+res.status};
    return await res.json();
  }catch(e){return {ok:false,error:e&&e.message?e.message:String(e)}}
}
function localCount(key){try{var x=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(x)?x.length:0}catch(e){return 0}}
function localState(){
  return {
    cariMovements:localCount('alkam_cari_hareketleri'),
    tahakkuk:localCount('alkam_tahakkuklar'),
    tahsilat:localCount('alkam_tahsilatlar'),
    finance:localCount('alkam_finans_hareketleri'),
    bank:localCount('alkam_bank_rows_v1'),
    bizmu:!!localStorage.getItem('ALKAM_BIZMU_MIGRATION_V1')
  };
}
function style(){
  if(q('#istasyonV13Style'))return;
  var s=document.createElement('style');s.id='istasyonV13Style';
  s.textContent='.is13{border:1px solid #bfdbfe;background:linear-gradient(180deg,#f8fbff,#fff);border-radius:18px;padding:14px;margin:0 0 16px;box-shadow:0 12px 28px rgba(15,23,42,.07)}.is13h{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap}.is13h h2{margin:0;font-size:20px;font-weight:950;color:#0f172a}.is13h p{margin:4px 0 0;color:#64748b;font-size:11.5px;font-weight:800}.is13badge{border-radius:999px;padding:6px 9px;font-size:10px;font-weight:950;border:1px solid #a7f3d0;background:#ecfdf5;color:#047857}.is13grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:8px;margin-top:12px}.is13card{border:1px solid #dbeafe;background:#fff;border-radius:12px;padding:10px;min-width:0}.is13card b{display:block;font-size:9px;color:#64748b;text-transform:uppercase;letter-spacing:.05em}.is13card strong{display:block;margin-top:5px;font-size:18px;font-weight:950;color:#0f172a;overflow-wrap:anywhere}.is13card.warn{border-color:#fed7aa;background:#fff7ed}.is13card.bad{border-color:#fecaca;background:#fff1f2}.is13card.good{border-color:#a7f3d0;background:#f0fdf4}.is13row{display:grid;grid-template-columns:1.1fr 1fr;gap:10px;margin-top:10px}.is13box{border:1px solid #e2e8f0;border-radius:12px;padding:10px;background:#fff;font-size:11px;font-weight:800;color:#475569;line-height:1.5}.is13box strong{color:#0f172a}.is13actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}.is13actions button{border:0;border-radius:9px;padding:7px 10px;font-weight:950;background:#1769e8;color:#fff;cursor:pointer}.is13actions button.secondary{background:#e8eef9;color:#0f172a}@media(max-width:1100px){.is13grid{grid-template-columns:repeat(3,1fr)}}@media(max-width:700px){.is13grid,.is13row{grid-template-columns:1fr 1fr}}';
  document.head.appendChild(s);
}
function host(){
  return q('#tab-dashboard')||q('.main')||document.body;
}
function mount(){
  style();
  var h=host(); if(!h||q('#istasyonV13Panel'))return;
  var div=document.createElement('div');div.id='istasyonV13Panel';div.className='is13';
  div.innerHTML='<div class="is13h"><div><h2>İstasyON — Canlı Hazırlık Merkezi</h2><p>Bizmu geçmişi + cari + Halkbank/Gmail + belge/onay akışının tek görünümü. Kesin finansal yazma kapalıdır.</p></div><span class="is13badge">READ / PREPARE / APPROVE</span></div><div id="istasyonV13Body"><div class="is13box">Canlı durum okunuyor…</div></div>';
  h.insertBefore(div,h.firstChild);
  refresh();
}
async function refresh(){
  var body=q('#istasyonV13Body'); if(!body)return;
  var results=await Promise.all([getJson(CARILER_URL),getJson(STATUS_URL)]);
  var cariler=Array.isArray(results[0])?results[0]:[];
  var status=results[1]&&typeof results[1]==='object'?results[1]:{};
  var local=localState();
  var active=cariler.filter(function(c){return String(c.status||'Aktif').toLocaleUpperCase('tr-TR').indexOf('PAS')<0});
  var activeCount=active.length;
  var passiveCount=cariler.filter(function(c){return String(c.status||'').toLocaleUpperCase('tr-TR').indexOf('PAS')>=0}).length;
  var specialCount=cariler.filter(function(c){return String(c.status||'').toLocaleUpperCase('tr-TR').indexOf('ÖZEL')>=0}).length;
  var currentJsonBalance=active.reduce(function(s,c){return s+Number(c.signedBalance!=null?c.signedBalance:c.balance||0)},0);
  var countOk=activeCount===EXPECTED_ACTIVE && passiveCount===EXPECTED_PASSIVE && specialCount===EXPECTED_SPECIAL;
  var bank=status.bankDocuments||0, moka=status.mokaDocuments||0, pending=status.pendingMail||0;
  var latest=status.latestBankReceivedAt||'-';
  var config=status.gmailConfigured===true?'Hazır':(status.gmailConfigured===false?'Eksik':'Kontrol');
  body.innerHTML=
    '<div class="is13grid">'+
      '<div class="is13card '+(activeCount===EXPECTED_ACTIVE?'good':'bad')+'"><b>Aktif Cari</b><strong>'+activeCount+'</strong></div>'+ 
      '<div class="is13card '+(passiveCount===EXPECTED_PASSIVE?'good':'bad')+'"><b>Pasif Cari</b><strong>'+passiveCount+'</strong></div>'+
      '<div class="is13card good"><b>Kanonik Açılış</b><strong>'+tl(EXPECTED_OPENING)+'</strong></div>'+
      '<div class="is13card"><b>Gmail Kuyruk</b><strong>'+pending+'</strong></div>'+
      '<div class="is13card '+(bank?'warn':'')+'"><b>Banka Belgesi</b><strong>'+bank+'</strong></div>'+
      '<div class="is13card '+(moka?'warn':'')+'"><b>Moka Belgesi</b><strong>'+moka+'</strong></div>'+
      '<div class="is13card good"><b>Kesin Yazma</b><strong>KAPALI</strong></div>'+
    '</div>'+
    '<div class="is13row">'+
      '<div class="is13box"><strong>Kaynak kontrolü</strong><br>'+activeCount+' aktif + '+passiveCount+' pasif + '+specialCount+' özel = '+cariler.length+' cari'+(countOk?' · doğrulandı':' · fark var')+
      '<br>Kanonik açılış kaynağı: liste bakiyesi + PDF mutabakatı = '+tl(EXPECTED_OPENING)+
      '<br>02.10 canlı cari senkronu bakiye: '+tl(currentJsonBalance)+' — İstasyON CARI_HAREKETLERI kaynağından okunur.</div>'+
      '<div class="is13box"><strong>Otomasyon sağlığı</strong><br>Gmail aktarım: '+esc(config)+
      '<br>Son Halkbank belge zamanı: '+esc(latest)+
      '<br>Yerel cari hareket: '+local.cariMovements+' · Tahakkuk: '+local.tahakkuk+' · Tahsilat: '+local.tahsilat+
      '<br>Banka yerel kayıt: '+local.bank+' · Bizmu geçiş paketi: '+(local.bizmu?'var':'yok')+'</div>'+
    '</div>'+
    '<div class="is13actions"><button type="button" id="istasyonV13Refresh">Canlı Durumu Yenile</button><button type="button" class="secondary" id="istasyonV13Cari">Cariler Sekmesine Git</button><button type="button" class="secondary" id="istasyonV13Approval">Onay Merkezi</button></div>';
  var b=q('#istasyonV13Refresh');if(b)b.onclick=refresh;
  var c=q('#istasyonV13Cari');if(c)c.onclick=function(){try{window.switchTab&&window.switchTab('cariler')}catch(e){}};
  var a=q('#istasyonV13Approval');if(a)a.onclick=function(){try{window.switchTab&&window.switchTab('onay')}catch(e){}};
  window.__ISTASYON_V13_LAST={version:VERSION,activeCount:activeCount,passiveCount:passiveCount,specialCount:specialCount,expectedActive:EXPECTED_ACTIVE,expectedPassive:EXPECTED_PASSIVE,expectedOpening:EXPECTED_OPENING,currentJsonBalance:currentJsonBalance,status:status,local:local,time:new Date().toISOString()};
  return window.__ISTASYON_V13_LAST;
}
window.ISTASYON_V13={version:VERSION,refresh:refresh,state:function(){return window.__ISTASYON_V13_LAST||null}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
setTimeout(mount,900);
})();
