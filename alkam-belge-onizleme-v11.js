(function(){
  'use strict';
  var VERSION='ALKAM Belge Önizleme v11.1';
  var KEY='alkam_belge_onizleme_kayitlari';
  function q(s,r){return (r||document).querySelector(s)}
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return []}}
  function save(list){localStorage.setItem(KEY,JSON.stringify(list));return list}
  function norm(s){return String(s||'').replace(/\s+/g,' ').trim()}
  function detect(text){
    var t=String(text||''); var l=t.toLowerCase();
    var type='Belge';
    if(l.indexOf('fatura')>-1)type='Fatura';
    else if(l.indexOf('dekont')>-1||l.indexOf('havale')>-1||l.indexOf('eft')>-1||l.indexOf('fast')>-1)type='Banka/Dekont';
    else if(l.indexOf('sgk')>-1)type='SGK';
    else if(l.indexOf('vergi')>-1||l.indexOf('tahakkuk')>-1)type='Vergi/Tahakkuk';
    var date=(t.match(/\b(\d{1,2}[\.\/-]\d{1,2}[\.\/-]\d{2,4})\b/)||[])[1]||'';
    var amounts=t.match(/\b\d{1,3}(?:[\. ]\d{3})*(?:,\d{2})?\s*(?:TL|₺)?\b/g)||[];
    var amount=amounts.length?amounts[amounts.length-1]:'';
    var vkn=(t.match(/\b\d{10,11}\b/)||[])[0]||'';
    return {type:type,date:date,amount:amount,vkn:vkn,confidence: text?70:0,summary:norm(t).slice(0,220)};
  }
  function addText(text,source){
    var item={id:'BLG-'+Date.now(),source:source||'Manuel',text:String(text||''),detected:detect(text),status:'Önizleme',created_at:new Date().toISOString()};
    var list=read();list.unshift(item);save(list.slice(0,200));return item;
  }
  function clearAll(){save([]);return {ok:true,cleared:true}}
  function css(){if(q('#alkam-belge-onizleme-style'))return;var st=document.createElement('style');st.id='alkam-belge-onizleme-style';st.textContent='.alkam-doc-modal{position:fixed;inset:0;z-index:1000020;background:rgba(15,23,42,.42);display:none;align-items:center;justify-content:center;padding:18px}.alkam-doc-modal.open{display:flex}.alkam-doc-box{width:min(1050px,100%);max-height:90vh;background:#fff;border-radius:20px;border:1px solid #dbe4f0;box-shadow:0 30px 80px rgba(15,23,42,.32);font-family:Arial,Helvetica,sans-serif;overflow:hidden}.alkam-doc-head{padding:16px 18px;background:#f8fbff;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between}.alkam-doc-head b{font-size:18px;color:#0f172a}.alkam-doc-head small{display:block;margin-top:4px;color:#64748b;font-weight:800}.alkam-doc-close{width:34px;height:34px;border:0;border-radius:10px;background:#e8eef9;font-weight:950;cursor:pointer}.alkam-doc-body{padding:16px 18px;overflow:auto;max-height:calc(90vh - 72px)}.alkam-doc-actions{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}.alkam-doc-actions button{height:34px;border:0;border-radius:10px;background:#1769e8;color:#fff;font-weight:950;padding:0 10px;cursor:pointer}.alkam-doc-actions button.secondary{background:#e8eef9;color:#0f172a}.alkam-doc-text{width:100%;min-height:120px;border:1px solid #cbd5e1;border-radius:14px;padding:10px;font-weight:800;box-sizing:border-box;margin-bottom:12px}.alkam-doc-table{border:1px solid #e2e8f0;border-radius:14px;overflow:hidden}.alkam-doc-table table{width:100%;border-collapse:collapse}.alkam-doc-table th{background:#f8fafc;color:#64748b;font-size:11px;text-transform:uppercase;text-align:left;padding:9px}.alkam-doc-table td{border-top:1px solid #eef2f7;padding:9px;font-size:12px;font-weight:800;vertical-align:top}.alkam-doc-note{background:#fff7ed;border:1px solid #fed7aa;color:#9a3412;border-radius:12px;padding:10px;margin-bottom:12px;font-weight:900}@media(max-width:900px){.alkam-doc-table{overflow:auto}.alkam-doc-table table{min-width:900px}}';document.head.appendChild(st)}
  function modal(){var el=q('#alkamBelgeOnizlemeModal');if(el)return el;el=document.createElement('div');el.id='alkamBelgeOnizlemeModal';el.className='alkam-doc-modal';el.innerHTML='<div class="alkam-doc-box"><div class="alkam-doc-head"><div><b>Belge Önizleme Merkezi</b><small>Belge metnini okur, tür/tarih/tutar/VKN önerir. Kayıt yapmaz.</small></div><button class="alkam-doc-close">×</button></div><div class="alkam-doc-body" id="alkamDocBody"></div></div>';document.body.appendChild(el);q('.alkam-doc-close',el).onclick=function(){el.classList.remove('open')};return el}
  function render(){css();var el=modal(),body=q('#alkamDocBody',el),list=read();body.innerHTML='<div class="alkam-doc-note">AI belge önizleme sadece öneri üretir. Tahakkuk/tahsilat/banka/cari kaydı oluşturmaz; kayıt için onay mekanizması şarttır.</div><textarea id="alkamDocText" class="alkam-doc-text" placeholder="Fatura, dekont, SGK, vergi yazısı veya banka açıklaması metnini buraya yapıştır..."></textarea><div class="alkam-doc-actions"><button id="alkamDocAnalyze">Önizle / Analiz Et</button><button class="secondary" id="alkamDocClear">Listeyi Temizle</button></div><div class="alkam-doc-table"><table><thead><tr><th>Zaman</th><th>Kaynak</th><th>Tür</th><th>Tarih</th><th>Tutar</th><th>VKN/TCKN</th><th>Güven</th><th>Özet</th></tr></thead><tbody>'+(list.length?list.map(function(x){var d=x.detected||{};return '<tr><td>'+x.created_at+'</td><td>'+x.source+'</td><td>'+d.type+'</td><td>'+d.date+'</td><td>'+d.amount+'</td><td>'+d.vkn+'</td><td>%'+(d.confidence||0)+'</td><td>'+d.summary+'</td></tr>'}).join(''):'<tr><td colspan="8">Henüz belge önizleme yok.</td></tr>')+'</tbody></table></div>';q('#alkamDocAnalyze',body).onclick=function(){var txt=q('#alkamDocText',body).value;if(!txt.trim())return;addText(txt,'Manuel Yapıştırma');render()};q('#alkamDocClear',body).onclick=function(){if(confirm('Belge önizleme listesi temizlensin mi?')){clearAll();render()}};return list}
  function open(){css();modal().classList.add('open');render()}
  function addButtons(){var bar=q('#alkamActionBar');if(bar&&!q('#alkamABBelgeOnizleme',bar)){var b=document.createElement('button');b.id='alkamABBelgeOnizleme';b.type='button';b.textContent='Belge Önizle';b.onclick=open;bar.appendChild(b)}var body=q('#alkamProfessionalDrawer .alkam-drawer-body');if(body&&!q('#alkamBelgeOnizlemeCard',body)){body.insertAdjacentHTML('beforeend','<div class="alkam-control-card" id="alkamBelgeOnizlemeCard"><b>Belge Önizleme Merkezi</b><div class="line">Metinden tür, tarih, tutar ve VKN önerir. Kayıt yapmaz.</div><div class="alkam-drawer-actions"><button onclick="window.ALKAM_BELGE_ONIZLEME_V11&&ALKAM_BELGE_ONIZLEME_V11.open()">Belge Önizle</button></div></div>')}}
  function boot(){css();setTimeout(function(){modal();addButtons()},1800)}
  window.ALKAM_BELGE_ONIZLEME_V11={version:VERSION,detect:detect,addText:addText,read:read,clearAll:clearAll,open:open,render:render,test:function(){return {version:VERSION,modal:!!q('#alkamBelgeOnizlemeModal'),actionButton:!!q('#alkamABBelgeOnizleme'),drawerCard:!!q('#alkamBelgeOnizlemeCard'),count:read().length,time:new Date().toISOString()}},run:boot};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();setInterval(addButtons,3000);
})();
