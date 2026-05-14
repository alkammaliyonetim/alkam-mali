// ALKAM Mali - Banka hareketi onay bekleyen isaretleme
(function(){
  if(window.__ALKAM_BANK_APPROVAL_V1__) return;
  window.__ALKAM_BANK_APPROVAL_V1__ = true;
  var KEY='alkam_bank_rows_v1';
  function rows(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return[]}}
  function save(x){localStorage.setItem(KEY,JSON.stringify(x||[]))}
  function ensureStyle(){if(document.getElementById('alkamBankApprovalStyle'))return;var s=document.createElement('style');s.id='alkamBankApprovalStyle';s.textContent='.bankRow.waiting{background:#fff7ed!important;border-color:#fed7aa!important}.bankApproveBtn{background:#f97316!important;color:white!important;padding:7px 9px!important;font-size:11px!important}.bankRow .badge.waiting{border-color:#fed7aa!important;background:#fff7ed!important;color:#c2410c!important}';document.head.appendChild(s)}
  function setWaiting(id){var x=rows();x.forEach(function(r){if(r.id===id&&r.status==='new'){r.status='waiting';r.waitingAt=new Date().toISOString()}});save(x);setTimeout(run,60)}
  function run(){ensureStyle();var x=rows();var map={};x.forEach(function(r){map[r.id]=r});var list=document.getElementById('alkamBankList');if(!list)return;Array.prototype.slice.call(list.querySelectorAll('.bankRow')).forEach(function(row){var first=row.querySelector('.top span');if(!first)return;var id=(first.textContent||'').trim();var rec=map[id];if(!rec)return;if(rec.status==='waiting'){row.classList.add('waiting');var badge=row.querySelector('.badge');if(badge){badge.classList.add('waiting');badge.textContent='Onay Bekliyor'}}if(rec.status==='new'&&!row.querySelector('.bankApproveBtn')){var act=row.querySelector('.rowAct')||row;var b=document.createElement('button');b.type='button';b.className='bankApproveBtn';b.textContent='Onaya Gönder';b.onclick=function(){setWaiting(id)};act.appendChild(b)}})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();document.addEventListener('click',function(){setTimeout(run,120)},true);var n=0,t=setInterval(function(){run();if(++n>40)clearInterval(t)},500);
})();
