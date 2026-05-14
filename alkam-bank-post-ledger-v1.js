// ALKAM Mali - Ekstreye hazir banka kaydini aktarildi isaretle v1
(function(){
  if(window.__ALKAM_BANK_POST_LEDGER_V1__) return;
  window.__ALKAM_BANK_POST_LEDGER_V1__ = true;
  var KEY='alkam_bank_rows_v1';
  function rows(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return[]}}
  function save(x){localStorage.setItem(KEY,JSON.stringify(x||[]))}
  function money(n){return (Number(n)||0).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})+' TL'}
  function style(){if(document.getElementById('alkamBankPostLedgerStyle'))return;var s=document.createElement('style');s.id='alkamBankPostLedgerStyle';s.textContent='.bankPostBtn{background:#0f172a!important;color:white!important;border:0!important;border-radius:10px!important;padding:8px 10px!important;font-size:11px!important;font-weight:950!important;margin-top:8px}.bankPostedPill{display:inline-flex;margin-top:7px;border:1px solid #bbf7d0;background:#f0fdf4;color:#047857;border-radius:999px;padding:5px 8px;font-size:10px;font-weight:950}.bankPreparedRow.posted,.bankRow.posted,.bankOnayRow.posted{background:#f0fdf4!important;border-color:#bbf7d0!important}';document.head.appendChild(s)}
  function post(id){var x=rows();x.forEach(function(r){if(r.id===id&&r.extreStatus==='prepared'&&r.extrePostStatus!=='posted'){r.extrePostStatus='posted';r.postedAt=new Date().toISOString();r.status='done';r.doneAt=r.doneAt||new Date().toISOString()}});save(x);run()}
  function decorateRow(row,rec){if(!row||!rec)return;var act=row.querySelector('.rowAct')||row;if(rec.extrePostStatus==='posted'){row.classList.add('posted');if(!row.querySelector('.bankPostedPill')){var p=document.createElement('span');p.className='bankPostedPill';p.textContent='Cari ekstresine aktarıldı';act.appendChild(p)}return}if(rec.extreStatus==='prepared'&&!row.querySelector('.bankPostBtn')){var b=document.createElement('button');b.type='button';b.className='bankPostBtn';b.textContent='Cari Ekstresine Aktar';b.title='Bu kayıt aktarıldı olarak işaretlenecek';b.onclick=function(){post(rec.id)};act.appendChild(b)}}
  function decorate(){style();var x=rows();var map={};x.forEach(function(r){map[r.id]=r});['alkamBankPreparedList','alkamBankList','alkamBankOnayList'].forEach(function(listId){var list=document.getElementById(listId);if(!list)return;Array.prototype.slice.call(list.querySelectorAll('.bankPreparedRow,.bankRow,.bankOnayRow')).forEach(function(row){var first=row.querySelector('.top span');if(!first)return;var id=(first.textContent||'').trim();decorateRow(row,map[id])})})}
  function run(){decorate()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();document.addEventListener('click',function(){setTimeout(run,220)},true);var n=0,t=setInterval(function(){run();if(++n>60)clearInterval(t)},500);
})();
