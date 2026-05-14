// ALKAM Mali - Banka hareketini cari ekstresine hazirla v1
(function(){
  if(window.__ALKAM_BANK_CARI_PREPARE_V1__) return;
  window.__ALKAM_BANK_CARI_PREPARE_V1__ = true;
  var KEY='alkam_bank_rows_v1';
  function rows(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return[]}}
  function save(x){localStorage.setItem(KEY,JSON.stringify(x||[]))}
  function style(){if(document.getElementById('alkamBankCariPrepareStyle'))return;var s=document.createElement('style');s.id='alkamBankCariPrepareStyle';s.textContent='.bankPrepareBtn{background:#7c3aed!important;color:white!important;padding:7px 9px!important;font-size:11px!important}.bankPreparedPill{display:inline-flex;border:1px solid #ddd6fe;background:#f5f3ff;color:#6d28d9;border-radius:999px;padding:5px 8px;font-size:10px;font-weight:950}.bankRow.prepared,.bankOnayRow.prepared{background:#f5f3ff!important;border-color:#ddd6fe!important}';document.head.appendChild(s)}
  function prepare(id){var x=rows();x.forEach(function(r){if(r.id===id&&(r.matchStatus==='matched'||r.matchedCari)){r.extreStatus='prepared';r.preparedAt=new Date().toISOString();r.preparedType=(Number(r.amount)||0)>=0?'Tahsilat':'Ödeme';r.preparedCari=r.matchedCari||r.cariSuggestion||''}});save(x);run()}
  function decorateOne(row,rec){if(!row||!rec)return;var act=row.querySelector('.rowAct')||row;if(rec.extreStatus==='prepared'){row.classList.add('prepared');if(!row.querySelector('.bankPreparedPill')){var p=document.createElement('span');p.className='bankPreparedPill';p.textContent='Ekstreye Hazır: '+(rec.preparedCari||rec.matchedCari||'-');act.appendChild(p)}return}if((rec.matchStatus==='matched'||rec.matchedCari)&&!row.querySelector('.bankPrepareBtn')){var b=document.createElement('button');b.type='button';b.className='bankPrepareBtn';b.textContent='Cari Ekstresine Hazırla';b.onclick=function(){prepare(rec.id)};act.appendChild(b)}}
  function run(){style();var x=rows();var map={};x.forEach(function(r){map[r.id]=r});['alkamBankList','alkamBankOnayList'].forEach(function(listId){var list=document.getElementById(listId);if(!list)return;Array.prototype.slice.call(list.querySelectorAll('.bankRow,.bankOnayRow')).forEach(function(row){var first=row.querySelector('.top span');if(!first)return;var id=(first.textContent||'').trim();decorateOne(row,map[id])})})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();document.addEventListener('click',function(){setTimeout(run,200)},true);var n=0,t=setInterval(function(){run();if(++n>50)clearInterval(t)},500);
})();
