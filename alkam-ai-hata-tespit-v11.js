(function(){
  'use strict';
  var VERSION='ALKAM AI Hata Tespit v11.0';
  function q(s,r){return (r||document).querySelector(s)}
  function read(k){try{return JSON.parse(localStorage.getItem(k)||'[]')}catch(e){return []}}
  function norm(s){return String(s||'').toLowerCase().replace(/ı/g,'i').replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s').replace(/ö/g,'o').replace(/ç/g,'c').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim()}
  function money(v){return Number(v||0)||0}
  function fp(x){return [x.cari_id||x.cariId||x.cari||'',x.tarih||x.date||'',x.islem_turu||x.type||'',money(x.borc||0),money(x.alacak||0),norm(x.aciklama||x.description||'')].join('|')}
  function scan(){
    var issues=[];
    function add(level,area,title,detail,ref){issues.push({level:level,area:area,title:title,detail:detail||'',ref:ref||'',time:new Date().toISOString()})}
    var hareket=read('alkam_cari_hareketleri');
    var tah=read('alkam_tahakkuklar');
    var tahsil=read('alkam_tahsilatlar');
    var bankaRaw=read('alkam_banka_ice_aktarim_raw');
    var onay=read('alkam_onay_bekleyen_banka');
    var islenen=read('alkam_banka_islenen');
    var finans=read('alkam_finans_hareketleri');

    var seen={};
    hareket.forEach(function(x,i){
      if(!String(x.kaynak||'').trim())add('Kritik','Cari Hareket','Kaynak boş cari hareket','Ana defterde kaynak boş olmamalı','index '+i);
      if(!String(x.aciklama||x.description||'').trim())add('Uyarı','Cari Hareket','Açıklama boş cari hareket','İleride denetim izi zayıflar','index '+i);
      var key=fp(x); seen[key]=(seen[key]||0)+1;
      var txt=norm((x.aciklama||'')+' '+(x.kaynak||''));
      var type=norm(x.islem_turu||x.type||'');
      if(txt.indexOf('moka')>-1 && type.indexOf('tahsil')>-1)add('Kritik','Moka','Moka cari tahsilatı şüphesi','Moka banka aktarımı cari tahsilatı sayılmamalı','index '+i);
    });
    Object.keys(seen).forEach(function(k){if(seen[k]>1)add('Kritik','Cari Hareket','Mükerrer cari hareket adayı','Aynı cari/tarih/tutar/açıklama '+seen[k]+' kez görünüyor',k.slice(0,80))});

    var tSeen={};
    tah.forEach(function(x,i){var key=[x.cari_id||x.cariId||x.cari||'',x.donem||x.period||'',money(x.tutar||x.borc||0),norm(x.kaynak||'')].join('|');tSeen[key]=(tSeen[key]||0)+1;if(!x.donem&&!x.period)add('Uyarı','Tahakkuk','Dönem boş tahakkuk','Dönem bilgisi olmadan aylık kontrol zayıflar','index '+i)});
    Object.keys(tSeen).forEach(function(k){if(tSeen[k]>1)add('Kritik','Tahakkuk','Mükerrer tahakkuk adayı','Aynı cari/dönem/tutar/kaynak tekrar ediyor',k.slice(0,80))});

    tahsil.forEach(function(x,i){if(money(x.tutar||x.alacak||0)<=0)add('Kritik','Tahsilat','Sıfır/negatif tahsilat','Tahsilat tutarı pozitif olmalı','index '+i);if(!String(x.kaynak||'').trim())add('Uyarı','Tahsilat','Kaynak boş tahsilat','Tahsilat kaynağı izlenmeli','index '+i)});

    var rawSeen={};
    bankaRaw.forEach(function(x,i){var k=x.fp||x.fingerprint||[x.tarih||'',money(x.tutar||0),norm(x.aciklama||'')].join('|');rawSeen[k]=(rawSeen[k]||0)+1;if(!String(x.aciklama||'').trim())add('Uyarı','Banka','Banka açıklaması boş','Eşleşme güveni düşer','index '+i)});
    Object.keys(rawSeen).forEach(function(k){if(k&&rawSeen[k]>1)add('Kritik','Banka','Mükerrer banka fingerprint','Aynı banka hareketi tekrar import edilmiş olabilir',k.slice(0,80))});

    onay.forEach(function(x,i){if(x.guven==null&&x.guven_puani==null)add('Uyarı','Banka Onay','Güven puanı boş','Onay ekranında güven puanı görünmeli','index '+i);if(!String(x.eslesme_sebebi||'').trim())add('Uyarı','Banka Onay','Eşleşme sebebi boş','Onay sebebi olmadan işlem zor denetlenir','index '+i)});
    islenen.forEach(function(x,i){if(!x.raw_id&&!x.rawId&&!x.fp&&!x.fingerprint)add('Kritik','Banka İşlenen','Raw bağlantısı olmayan işlenen banka kaydı','Onaysız/izsiz işleme şüphesi','index '+i)});
    finans.forEach(function(x,i){var txt=norm((x.aciklama||'')+' '+(x.kaynak||''));if(txt.indexOf('moka')>-1 && x.cari_tahsilati_sayma===true)add('Kritik','Finans','Moka hareketi cari tahsilatı sayılmış olabilir','Moka aktarımı cari tahsilatı olmamalı','index '+i)});

    var critical=issues.filter(function(x){return x.level==='Kritik'}).length;
    var warning=issues.filter(function(x){return x.level==='Uyarı'}).length;
    var result={version:VERSION,status:critical?'Kritik':(warning?'Uyarı':'Temiz'),critical:critical,warning:warning,total:issues.length,issues:issues,counts:{cari_hareketleri:hareket.length,tahakkuklar:tah.length,tahsilatlar:tahsil.length,banka_raw:bankaRaw.length,banka_onay:onay.length,banka_islenen:islenen.length,finans_hareketleri:finans.length},time:new Date().toISOString()};
    window.__ALKAM_AI_HATA_TESPIT_LAST=result;
    return result;
  }
  function css(){if(q('#alkam-ai-hata-style'))return;var st=document.createElement('style');st.id='alkam-ai-hata-style';st.textContent='.alkam-aih-modal{position:fixed;inset:0;z-index:1000019;background:rgba(15,23,42,.42);display:none;align-items:center;justify-content:center;padding:18px}.alkam-aih-modal.open{display:flex}.alkam-aih-box{width:min(1050px,100%);max-height:90vh;background:#fff;border-radius:20px;border:1px solid #dbe4f0;box-shadow:0 30px 80px rgba(15,23,42,.32);font-family:Arial,Helvetica,sans-serif;overflow:hidden}.alkam-aih-head{padding:16px 18px;background:#f8fbff;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between}.alkam-aih-head b{font-size:18px;color:#0f172a}.alkam-aih-head small{display:block;margin-top:4px;color:#64748b;font-weight:800}.alkam-aih-close{width:34px;height:34px;border:0;border-radius:10px;background:#e8eef9;font-weight:950;cursor:pointer}.alkam-aih-body{padding:16px 18px;overflow:auto;max-height:calc(90vh - 72px)}.alkam-aih-actions{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}.alkam-aih-actions button{height:34px;border:0;border-radius:10px;background:#1769e8;color:#fff;font-weight:950;padding:0 10px;cursor:pointer}.alkam-aih-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:12px}.alkam-aih-card{border:1px solid #e2e8f0;background:#fbfdff;border-radius:14px;padding:12px}.alkam-aih-card b{display:block;font-size:11px;color:#64748b;text-transform:uppercase}.alkam-aih-card span{display:block;margin-top:6px;font-size:20px;font-weight:950}.alkam-aih-table{border:1px solid #e2e8f0;border-radius:14px;overflow:hidden}.alkam-aih-table table{width:100%;border-collapse:collapse}.alkam-aih-table th{background:#f8fafc;color:#64748b;font-size:11px;text-transform:uppercase;text-align:left;padding:9px}.alkam-aih-table td{border-top:1px solid #eef2f7;padding:9px;font-size:12px;font-weight:800}.aih-bad{color:#b91c1c;font-weight:950}.aih-warn{color:#c2410c;font-weight:950}.aih-ok{color:#047857;font-weight:950}@media(max-width:900px){.alkam-aih-grid{grid-template-columns:1fr}.alkam-aih-table{overflow:auto}.alkam-aih-table table{min-width:840px}}';document.head.appendChild(st)}
  function modal(){var el=q('#alkamAiHataModal');if(el)return el;el=document.createElement('div');el.id='alkamAiHataModal';el.className='alkam-aih-modal';el.innerHTML='<div class="alkam-aih-box"><div class="alkam-aih-head"><div><b>AI Hata Tespit Paneli</b><small>Kural motoru + AI mantığıyla şüpheli muhasebe kayıtlarını listeler. Kayıt yapmaz.</small></div><button class="alkam-aih-close">×</button></div><div class="alkam-aih-body" id="alkamAiHataBody"></div></div>';document.body.appendChild(el);q('.alkam-aih-close',el).onclick=function(){el.classList.remove('open')};return el}
  function render(){css();var el=modal(),body=q('#alkamAiHataBody',el),r=scan();body.innerHTML='<div class="alkam-aih-actions"><button onclick="window.ALKAM_AI_HATA_TESPIT_V11&&ALKAM_AI_HATA_TESPIT_V11.render()">Yenile</button></div><div class="alkam-aih-grid"><div class="alkam-aih-card"><b>Durum</b><span>'+r.status+'</span></div><div class="alkam-aih-card"><b>Kritik</b><span>'+r.critical+'</span></div><div class="alkam-aih-card"><b>Uyarı</b><span>'+r.warning+'</span></div><div class="alkam-aih-card"><b>Toplam</b><span>'+r.total+'</span></div></div><div class="alkam-aih-table"><table><thead><tr><th>Seviye</th><th>Alan</th><th>Başlık</th><th>Detay</th><th>Referans</th></tr></thead><tbody>'+(r.issues.length?r.issues.map(function(x){var cls=x.level==='Kritik'?'aih-bad':'aih-warn';return '<tr><td class="'+cls+'">'+x.level+'</td><td>'+x.area+'</td><td>'+x.title+'</td><td>'+x.detail+'</td><td>'+x.ref+'</td></tr>'}).join(''):'<tr><td class="aih-ok" colspan="5">Şu an kritik/uyarı bulunamadı.</td></tr>')+'</tbody></table></div>';return r}
  function open(){css();modal().classList.add('open');render()}
  function addButtons(){var bar=q('#alkamActionBar');if(bar&&!q('#alkamABAiHata',bar)){var b=document.createElement('button');b.id='alkamABAiHata';b.type='button';b.textContent='AI Hata';b.onclick=open;bar.appendChild(b)}var body=q('#alkamProfessionalDrawer .alkam-drawer-body');if(body&&!q('#alkamAiHataCard',body)){var r=scan();body.insertAdjacentHTML('beforeend','<div class="alkam-control-card" id="alkamAiHataCard"><b>AI Hata Tespit</b><div class="line">Kritik: '+r.critical+' · Uyarı: '+r.warning+' · Kayıt yapmaz, öneri verir.</div><div class="alkam-drawer-actions"><button onclick="window.ALKAM_AI_HATA_TESPIT_V11&&ALKAM_AI_HATA_TESPIT_V11.open()">AI Hata Aç</button></div></div>')}}
  function boot(){css();setTimeout(function(){modal();addButtons()},1800)}
  window.ALKAM_AI_HATA_TESPIT_V11={version:VERSION,scan:scan,test:scan,open:open,render:render,last:function(){return window.__ALKAM_AI_HATA_TESPIT_LAST||scan()},run:boot};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();setInterval(addButtons,3000);
})();
