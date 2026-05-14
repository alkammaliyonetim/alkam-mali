// ALKAM Mali - Onay Merkezi Banka Onay Bekleyenler v1
(function(){
  if(window.__ALKAM_BANK_ONAY_CENTER_V1__) return;
  window.__ALKAM_BANK_ONAY_CENTER_V1__ = true;
  var KEY='alkam_bank_rows_v1';
  var LAST='alkam_bank_last_done_v1';
  function rows(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return[]}}
  function save(x){localStorage.setItem(KEY,JSON.stringify(x||[]))}
  function setLast(x){localStorage.setItem(LAST,JSON.stringify(x||null))}
  function money(n){return (Number(n)||0).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})+' TL'}
  function style(){if(document.getElementById('alkamBankOnayStyle'))return;var s=document.createElement('style');s.id='alkamBankOnayStyle';s.textContent='#alkamBankOnayBox{margin:12px 0;border:1px solid #fed7aa;background:#fff7ed;border-radius:16px;padding:12px}#alkamBankOnayBox h3{margin:0 0 8px;font-size:17px;font-weight:950;color:#9a3412}.bankOnayRow{border:1px solid #fed7aa;background:white;border-radius:12px;padding:9px;margin:7px 0;font-size:12px}.bankOnayRow .top{display:flex;justify-content:space-between;font-weight:950}.bankOnayRow .desc{color:#64748b;font-weight:800;margin-top:4px}.bankOnayRow button{border:0;border-radius:10px;padding:8px 10px;font-size:11px;font-weight:950;margin-top:8px;background:#16a34a;color:white}.bankOnayEmpty{font-size:12px;font-weight:900;color:#64748b}@media(max-width:760px){.bankOnayRow .top{display:block}.bankOnayRow .top span{display:block;margin-bottom:3px}.bankOnayRow button{width:100%}}';document.head.appendChild(s)}
  function markDone(id){var x=rows();x.forEach(function(r){if(r.id===id){r.status='done';r.doneAt=new Date().toISOString();setLast(r)}});save(x);render()}
  function findOnayTab(){return document.getElementById('tab-onay')||document.getElementById('tab-onay-merkezi')||document.querySelector('[id*="onay" i]')}
  function render(){style();var tab=findOnayTab();if(!tab)return;var box=document.getElementById('alkamBankOnayBox');if(!box){box=document.createElement('div');box.id='alkamBankOnayBox';box.innerHTML='<h3>Banka Onay Bekleyenler</h3><div id="alkamBankOnayList"></div>';tab.appendChild(box)}var list=document.getElementById('alkamBankOnayList');if(!list)return;var wait=rows().filter(function(r){return r.status==='approval'||r.status==='new'});list.innerHTML=wait.slice().reverse().map(function(r){return '<div class="bankOnayRow"><div class="top"><span>'+r.id+'</span><span>'+money(r.amount)+'</span></div><div class="desc">'+(r.date||'-')+' • '+r.bank+' • '+r.desc+'</div><button type="button" data-bank-onay-done="'+r.id+'">Onayla ve İşlendi Yap</button></div>'}).join('')||'<div class="bankOnayEmpty">Banka için onay bekleyen kayıt yok.</div>';Array.prototype.slice.call(list.querySelectorAll('[data-bank-onay-done]')).forEach(function(b){b.onclick=function(){markDone(b.getAttribute('data-bank-onay-done'))}})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render);else render();document.addEventListener('click',function(){setTimeout(render,120)},true);var n=0,t=setInterval(function(){render();if(++n>40)clearInterval(t)},500);
})();
