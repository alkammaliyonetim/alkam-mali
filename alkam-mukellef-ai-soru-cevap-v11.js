(function(){
  'use strict';
  var VERSION='ALKAM Mükellef AI Soru Cevap v11.5';
  var KEY='alkam_mukellef_ai_soru_cevap_log';
  function q(s,r){return (r||document).querySelector(s)}
  function readKey(k){try{return JSON.parse(localStorage.getItem(k)||'[]')}catch(e){return []}}
  function saveLog(list){localStorage.setItem(KEY,JSON.stringify(list));return list}
  function logs(){return readKey(KEY)}
  function norm(s){return String(s||'').toLowerCase().replace(/ı/g,'i').replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s').replace(/ö/g,'o').replace(/ç/g,'c').replace(/\s+/g,' ').trim()}
  function money(v){return Number(v||0)||0}
  function fmt(n){return new Intl.NumberFormat('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(Math.abs(Number(n||0)))+' TL'}
  function getCariName(x){return x.cari_unvan||x.unvan||x.cari||x.cari_adi||x.cariAd||x.cari_name||x.cari_id||x.cariId||'CARİ'}
  function context(){
    var hareket=readKey('alkam_cari_hareketleri');
    var tah=readKey('alkam_tahakkuklar');
    var tahsil=readKey('alkam_tahsilatlar');
    var onay=readKey('alkam_onay_bekleyen_banka');
    var ai=(window.ALKAM_AI_HATA_TESPIT_V11&&ALKAM_AI_HATA_TESPIT_V11.scan)?ALKAM_AI_HATA_TESPIT_V11.scan():null;
    var byCari={};
    hareket.forEach(function(x){var name=getCariName(x); if(!byCari[name])byCari[name]={cari:name,borc:0,alacak:0,count:0,lastDate:''}; byCari[name].borc+=money(x.borc); byCari[name].alacak+=money(x.alacak); byCari[name].count++; var d=x.tarih||x.date||''; if(String(d)>String(byCari[name].lastDate))byCari[name].lastDate=d;});
    var cariList=Object.keys(byCari).map(function(k){var o=byCari[k];o.bakiye=o.borc-o.alacak;return o}).sort(function(a,b){return Math.abs(b.bakiye)-Math.abs(a.bakiye)});
    return {hareket:hareket,tah:tah,tahsil:tahsil,onay:onay,ai:ai,cariList:cariList,time:new Date().toISOString()};
  }
  function answer(question){
    var c=context(); var nq=norm(question); var lines=[]; var title='Genel Cevap';
    if(!question||!question.trim()){lines.push('Soru yazılmadı. Örnek: Hangi cariler riskli? / Banka onay bekleyen var mı? / En yüksek bakiye kimde?');}
    else if(nq.indexOf('risk')>-1||nq.indexOf('borc')>-1||nq.indexOf('bakiye')>-1){
      title='Riskli / Bakiyeli Cariler';
      var top=c.cariList.filter(function(x){return Math.abs(x.bakiye)>0}).slice(0,10);
      if(!top.length)lines.push('Bakiyeli cari görünmüyor.');
      top.forEach(function(x,i){lines.push((i+1)+'. '+x.cari+' → '+(x.bakiye>0?'BAKİYE B ':'BAKİYE A ')+fmt(x.bakiye)+' | Hareket: '+x.count+' | Son tarih: '+(x.lastDate||'-'));});
    } else if(nq.indexOf('tahakkuk')>-1){
      title='Tahakkuk Özeti';
      var total=c.tah.reduce(function(a,x){return a+money(x.tutar||x.borc)},0);
      lines.push('Tahakkuk kayıt sayısı: '+c.tah.length);
      lines.push('Tahakkuk toplamı: '+fmt(total));
      lines.push('Not: Eksik ay kontrolü için Tahakkuk Kontrol modülünü de çalıştır.');
    } else if(nq.indexOf('tahsil')>-1){
      title='Tahsilat Özeti';
      var t=c.tahsil.reduce(function(a,x){return a+money(x.tutar||x.alacak)},0);
      lines.push('Tahsilat kayıt sayısı: '+c.tahsil.length);
      lines.push('Tahsilat toplamı: '+fmt(t));
      lines.push('Not: Moka banka aktarımı cari tahsilatı sayılmaz kuralı korunmalı.');
    } else if(nq.indexOf('banka')>-1||nq.indexOf('onay')>-1){
      title='Banka Onay Özeti';
      lines.push('Banka onay bekleyen kayıt sayısı: '+c.onay.length);
      if(c.onay.length)lines.push('Öncelik: Onay bekleyen banka kayıtlarını güven puanı ve eşleşme sebebine göre incele.');
      else lines.push('Şu an banka onay bekleyen görünmüyor.');
    } else if(nq.indexOf('moka')>-1){
      title='Moka Kontrolü';
      lines.push('Moka için ana kural: Moka → Banka aktarımı cari tahsilatı sayılmaz.');
      lines.push('Şüpheli kayıtlar için AI Hata Tespit panelindeki Moka uyarılarını kontrol et.');
      if(c.ai)lines.push('AI Hata Tespit: '+c.ai.critical+' kritik, '+c.ai.warning+' uyarı.');
    } else if(nq.indexOf('hata')>-1||nq.indexOf('kritik')>-1){
      title='Hata / Kritik Kontrol';
      if(c.ai){lines.push('AI Hata Tespit sonucu: '+c.ai.critical+' kritik, '+c.ai.warning+' uyarı.'); if(c.ai.critical)lines.push('Önce kritik kayıtlar incelenmeli; onaysız işlem yapılmamalı.');}
      else lines.push('AI Hata Tespit modülü sonucu okunamadı.');
    } else {
      title='Genel Mükellef Asistanı';
      lines.push('Toplam cari hareket: '+c.hareket.length);
      lines.push('Toplam tahakkuk: '+c.tah.length);
      lines.push('Toplam tahsilat: '+c.tahsil.length);
      lines.push('Banka onay bekleyen: '+c.onay.length);
      if(c.cariList[0])lines.push('En yüksek bakiyeli cari: '+c.cariList[0].cari+' → '+fmt(c.cariList[0].bakiye));
    }
    var result={version:VERSION,question:question,title:title,answer:lines.join('\n'),lines:lines,created_at:new Date().toISOString()};
    var lg=logs(); lg.unshift(result); saveLog(lg.slice(0,100)); window.__ALKAM_MUKELLEF_AI_LAST=result; return result;
  }
  function css(){if(q('#alkam-muk-ai-style'))return;var st=document.createElement('style');st.id='alkam-muk-ai-style';st.textContent='.alkam-muk-ai-modal{position:fixed;inset:0;z-index:1000024;background:rgba(15,23,42,.42);display:none;align-items:center;justify-content:center;padding:18px}.alkam-muk-ai-modal.open{display:flex}.alkam-muk-ai-box{width:min(980px,100%);max-height:90vh;background:#fff;border-radius:20px;border:1px solid #dbe4f0;box-shadow:0 30px 80px rgba(15,23,42,.32);font-family:Arial,Helvetica,sans-serif;overflow:hidden}.alkam-muk-ai-head{padding:16px 18px;background:#f8fbff;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between}.alkam-muk-ai-head b{font-size:18px;color:#0f172a}.alkam-muk-ai-head small{display:block;margin-top:4px;color:#64748b;font-weight:800}.alkam-muk-ai-close{width:34px;height:34px;border:0;border-radius:10px;background:#e8eef9;font-weight:950;cursor:pointer}.alkam-muk-ai-body{padding:16px 18px;overflow:auto;max-height:calc(90vh - 72px)}.alkam-muk-ai-note{background:#fff7ed;border:1px solid #fed7aa;color:#9a3412;border-radius:12px;padding:10px;margin-bottom:12px;font-weight:900}.alkam-muk-ai-input{width:100%;border:1px solid #cbd5e1;border-radius:14px;padding:12px;font-size:14px;font-weight:850;box-sizing:border-box}.alkam-muk-ai-actions{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}.alkam-muk-ai-actions button{height:34px;border:0;border-radius:10px;background:#1769e8;color:#fff;font-weight:950;padding:0 10px;cursor:pointer}.alkam-muk-ai-actions button.secondary{background:#e8eef9;color:#0f172a}.alkam-muk-ai-answer{border:1px solid #e2e8f0;border-radius:14px;background:#fbfdff;padding:14px;white-space:pre-wrap;font-size:13px;font-weight:850;line-height:1.5}.alkam-muk-ai-table{border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;margin-top:12px}.alkam-muk-ai-table table{width:100%;border-collapse:collapse}.alkam-muk-ai-table th{background:#f8fafc;color:#64748b;font-size:11px;text-transform:uppercase;text-align:left;padding:9px}.alkam-muk-ai-table td{border-top:1px solid #eef2f7;padding:9px;font-size:12px;font-weight:800;vertical-align:top}@media(max-width:900px){.alkam-muk-ai-table{overflow:auto}.alkam-muk-ai-table table{min-width:760px}}';document.head.appendChild(st)}
  function modal(){var el=q('#alkamMukellefAiModal');if(el)return el;el=document.createElement('div');el.id='alkamMukellefAiModal';el.className='alkam-muk-ai-modal';el.innerHTML='<div class="alkam-muk-ai-box"><div class="alkam-muk-ai-head"><div><b>Mükellef AI Soru-Cevap</b><small>Cari, tahakkuk, tahsilat, banka ve hata kontrollerine göre cevap verir. Kayıt yapmaz.</small></div><button class="alkam-muk-ai-close">×</button></div><div class="alkam-muk-ai-body" id="alkamMukAiBody"></div></div>';document.body.appendChild(el);q('.alkam-muk-ai-close',el).onclick=function(){el.classList.remove('open')};return el}
  function render(){css();var el=modal(),body=q('#alkamMukAiBody',el),lg=logs();body.innerHTML='<div class="alkam-muk-ai-note">Bu asistan sadece mevcut kayıtları özetler ve yorumlar. Muhasebe kaydı, banka işleme veya tahakkuk/tahsilat yapmaz.</div><input id="mukAiQuestion" class="alkam-muk-ai-input" placeholder="Sor: Hangi cariler riskli? Banka onay bekleyen var mı? Moka kontrolü ne durumda?"><div class="alkam-muk-ai-actions"><button id="mukAiAsk">Cevapla</button><button class="secondary" data-q="Hangi cariler riskli?">Riskli Cariler</button><button class="secondary" data-q="Banka onay bekleyen var mı?">Banka Onay</button><button class="secondary" data-q="Moka kontrolü ne durumda?">Moka</button><button class="secondary" data-q="Kritik hata var mı?">Kritik Hata</button></div><div id="mukAiAnswer" class="alkam-muk-ai-answer">Cevap burada görünecek.</div><div class="alkam-muk-ai-table"><table><thead><tr><th>Zaman</th><th>Soru</th><th>Başlık</th><th>Cevap</th></tr></thead><tbody>'+(lg.length?lg.slice(0,10).map(function(x){return '<tr><td>'+x.created_at+'</td><td>'+x.question+'</td><td>'+x.title+'</td><td>'+String(x.answer).slice(0,240)+'</td></tr>'}).join(''):'<tr><td colspan="4">Henüz soru yok.</td></tr>')+'</tbody></table></div>';q('#mukAiAsk',body).onclick=function(){var res=answer(q('#mukAiQuestion',body).value);q('#mukAiAnswer',body).textContent=res.title+'\n\n'+res.answer};Array.prototype.slice.call(body.querySelectorAll('button[data-q]')).forEach(function(b){b.onclick=function(){q('#mukAiQuestion',body).value=b.getAttribute('data-q');var res=answer(b.getAttribute('data-q'));q('#mukAiAnswer',body).textContent=res.title+'\n\n'+res.answer}});return lg}
  function open(){css();modal().classList.add('open');render()}
  function addButtons(){var bar=q('#alkamActionBar');if(bar&&!q('#alkamABMukellefAi',bar)){var b=document.createElement('button');b.id='alkamABMukellefAi';b.type='button';b.textContent='AI Soru';b.onclick=open;bar.appendChild(b)}var body=q('#alkamProfessionalDrawer .alkam-drawer-body');if(body&&!q('#alkamMukellefAiCard',body)){body.insertAdjacentHTML('beforeend','<div class="alkam-control-card" id="alkamMukellefAiCard"><b>Mükellef AI Soru-Cevap</b><div class="line">Cari, tahsilat, tahakkuk, banka ve Moka sorularını yanıtlar. Kayıt yapmaz.</div><div class="alkam-drawer-actions"><button onclick="window.ALKAM_MUKELLEF_AI_SORU_CEVAP_V11&&ALKAM_MUKELLEF_AI_SORU_CEVAP_V11.open()">AI Soru Aç</button></div></div>')}}
  function boot(){css();setTimeout(function(){modal();addButtons()},1800)}
  window.ALKAM_MUKELLEF_AI_SORU_CEVAP_V11={version:VERSION,context:context,answer:answer,logs:logs,open:open,render:render,test:function(){return {version:VERSION,modal:!!q('#alkamMukellefAiModal'),actionButton:!!q('#alkamABMukellefAi'),drawerCard:!!q('#alkamMukellefAiCard'),logCount:logs().length,time:new Date().toISOString()}},run:boot};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();setInterval(addButtons,3000);
})();
