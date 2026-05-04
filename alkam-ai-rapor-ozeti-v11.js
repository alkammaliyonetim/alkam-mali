(function(){
  'use strict';
  var VERSION='ALKAM AI Rapor Özeti v11.2';
  function q(s,r){return (r||document).querySelector(s)}
  function read(k){try{return JSON.parse(localStorage.getItem(k)||'[]')}catch(e){return []}}
  function money(v){return Number(v||0)||0}
  function fmt(n){return new Intl.NumberFormat('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(Math.abs(Number(n||0)))+' TL'}
  function build(){
    var cari=read('alkam_cari_hareketleri');
    var tah=read('alkam_tahakkuklar');
    var tahsil=read('alkam_tahsilatlar');
    var onay=read('alkam_onay_bekleyen_banka');
    var islenen=read('alkam_banka_islenen');
    var red=read('alkam_banka_reddedilen');
    var finans=read('alkam_finans_hareketleri');
    var ai=(window.ALKAM_AI_HATA_TESPIT_V11&&ALKAM_AI_HATA_TESPIT_V11.scan)?ALKAM_AI_HATA_TESPIT_V11.scan():null;
    var borc=0, alacak=0;
    cari.forEach(function(x){borc+=money(x.borc);alacak+=money(x.alacak)});
    var tahTop=tah.reduce(function(a,x){return a+money(x.tutar||x.borc)},0);
    var tahsilTop=tahsil.reduce(function(a,x){return a+money(x.tutar||x.alacak)},0);
    var finansTop=finans.reduce(function(a,x){var t=money(x.tutar);var tip=String(x.hareket_tipi||x.tip||'').toLowerCase();return a+(tip.indexOf('çık')>-1||tip.indexOf('cik')>-1?-t:t)},0);
    var bullets=[];
    bullets.push('Cari ana defterde toplam borç '+fmt(borc)+', toplam alacak '+fmt(alacak)+', net bakiye '+fmt(borc-alacak)+' seviyesinde.');
    bullets.push('Tahakkuk toplamı '+fmt(tahTop)+', tahsilat toplamı '+fmt(tahsilTop)+' görünüyor.');
    bullets.push('Banka onay bekleyen '+onay.length+', işlenen '+islenen.length+', reddedilen '+red.length+' kayıt var.');
    bullets.push('Finans hareketleri net etkisi '+fmt(finansTop)+' olarak hesaplandı.');
    if(ai){bullets.push('AI hata tespiti: '+ai.critical+' kritik, '+ai.warning+' uyarı buldu.');}
    var actions=[];
    if(onay.length)actions.push('Banka onay bekleyen kayıtları temizle.');
    if(ai&&ai.critical)actions.push('AI Hata Tespit panelindeki kritik kayıtları önce incele.');
    if(tahTop===0)actions.push('Dönem tahakkuklarını kontrol et; tahakkuk toplamı sıfır görünüyor.');
    if(tahsilTop===0)actions.push('Tahsilat girişlerini kontrol et; tahsilat toplamı sıfır görünüyor.');
    if(!actions.length)actions.push('Kritik aksiyon yok; günlük kontrol ve banka onay rutinine devam et.');
    return {version:VERSION,status:(ai&&ai.critical)?'Kritik':(onay.length||(ai&&ai.warning)?'Kontrol Gerekir':'Normal'),counts:{cari:cari.length,tahakkuk:tah.length,tahsilat:tahsil.length,banka_onay:onay.length,banka_islenen:islenen.length,banka_reddedilen:red.length,finans:finans.length},totals:{borc:borc,alacak:alacak,bakiye:borc-alacak,tahakkuk:tahTop,tahsilat:tahsilTop,finans:finansTop},bullets:bullets,actions:actions,ai:ai,time:new Date().toISOString()}
  }
  function css(){if(q('#alkam-ai-rapor-style'))return;var st=document.createElement('style');st.id='alkam-ai-rapor-style';st.textContent='.alkam-air-modal{position:fixed;inset:0;z-index:1000021;background:rgba(15,23,42,.42);display:none;align-items:center;justify-content:center;padding:18px}.alkam-air-modal.open{display:flex}.alkam-air-box{width:min(1000px,100%);max-height:90vh;background:#fff;border-radius:20px;border:1px solid #dbe4f0;box-shadow:0 30px 80px rgba(15,23,42,.32);font-family:Arial,Helvetica,sans-serif;overflow:hidden}.alkam-air-head{padding:16px 18px;background:#f8fbff;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between}.alkam-air-head b{font-size:18px;color:#0f172a}.alkam-air-head small{display:block;margin-top:4px;color:#64748b;font-weight:800}.alkam-air-close{width:34px;height:34px;border:0;border-radius:10px;background:#e8eef9;font-weight:950;cursor:pointer}.alkam-air-body{padding:16px 18px;overflow:auto;max-height:calc(90vh - 72px)}.alkam-air-actions{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}.alkam-air-actions button{height:34px;border:0;border-radius:10px;background:#1769e8;color:#fff;font-weight:950;padding:0 10px;cursor:pointer}.alkam-air-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:12px}.alkam-air-card{border:1px solid #e2e8f0;background:#fbfdff;border-radius:14px;padding:12px}.alkam-air-card b{display:block;font-size:11px;color:#64748b;text-transform:uppercase}.alkam-air-card span{display:block;margin-top:6px;font-size:20px;font-weight:950;color:#0f172a}.alkam-air-section{border:1px solid #e2e8f0;background:#fbfdff;border-radius:14px;padding:12px;margin-bottom:12px}.alkam-air-section h4{margin:0 0 8px;color:#0f172a}.alkam-air-section li{font-size:13px;font-weight:850;margin:7px 0;color:#334155;line-height:1.4}@media(max-width:900px){.alkam-air-grid{grid-template-columns:1fr}}';document.head.appendChild(st)}
  function modal(){var el=q('#alkamAiRaporModal');if(el)return el;el=document.createElement('div');el.id='alkamAiRaporModal';el.className='alkam-air-modal';el.innerHTML='<div class="alkam-air-box"><div class="alkam-air-head"><div><b>AI Rapor Özeti</b><small>Cari, tahakkuk, tahsilat, banka ve hata tespitini yönetici özeti haline getirir. Kayıt yapmaz.</small></div><button class="alkam-air-close">×</button></div><div class="alkam-air-body" id="alkamAiRaporBody"></div></div>';document.body.appendChild(el);q('.alkam-air-close',el).onclick=function(){el.classList.remove('open')};return el}
  function render(){css();var el=modal(),body=q('#alkamAiRaporBody',el),r=build();body.innerHTML='<div class="alkam-air-actions"><button onclick="window.ALKAM_AI_RAPOR_OZETI_V11&&ALKAM_AI_RAPOR_OZETI_V11.render()">Yenile</button><button onclick="window.print()">Yazdır/PDF</button></div><div class="alkam-air-grid"><div class="alkam-air-card"><b>Durum</b><span>'+r.status+'</span></div><div class="alkam-air-card"><b>Cari Hareket</b><span>'+r.counts.cari+'</span></div><div class="alkam-air-card"><b>Banka Onay</b><span>'+r.counts.banka_onay+'</span></div><div class="alkam-air-card"><b>Net Bakiye</b><span>'+fmt(r.totals.bakiye)+'</span></div></div><div class="alkam-air-section"><h4>Yönetici Özeti</h4><ul>'+r.bullets.map(function(x){return '<li>'+x+'</li>'}).join('')+'</ul></div><div class="alkam-air-section"><h4>Önerilen Aksiyonlar</h4><ul>'+r.actions.map(function(x){return '<li>'+x+'</li>'}).join('')+'</ul></div>';window.__ALKAM_AI_RAPOR_LAST=r;return r}
  function open(){css();modal().classList.add('open');render()}
  function addButtons(){var bar=q('#alkamActionBar');if(bar&&!q('#alkamABAiRapor',bar)){var b=document.createElement('button');b.id='alkamABAiRapor';b.type='button';b.textContent='AI Rapor';b.onclick=open;bar.appendChild(b)}var body=q('#alkamProfessionalDrawer .alkam-drawer-body');if(body&&!q('#alkamAiRaporCard',body)){var r=build();body.insertAdjacentHTML('beforeend','<div class="alkam-control-card" id="alkamAiRaporCard"><b>AI Rapor Özeti</b><div class="line">Durum: '+r.status+' · Banka onay: '+r.counts.banka_onay+' · Net: '+fmt(r.totals.bakiye)+'</div><div class="alkam-drawer-actions"><button onclick="window.ALKAM_AI_RAPOR_OZETI_V11&&ALKAM_AI_RAPOR_OZETI_V11.open()">AI Rapor Aç</button></div></div>')}}
  function boot(){css();setTimeout(function(){modal();addButtons()},1800)}
  window.ALKAM_AI_RAPOR_OZETI_V11={version:VERSION,build:build,test:build,open:open,render:render,last:function(){return window.__ALKAM_AI_RAPOR_LAST||build()},run:boot};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();setInterval(addButtons,3000);
})();
