(function(){
  'use strict';
  var VERSION='ALKAM Balance Highlight v1';
  function q(s,r){return (r||document).querySelector(s)}
  function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function clean(v){return String(v||'').replace(/\s+/g,' ').trim()}
  function parseMoney(v){
    var raw=clean(v);
    var neg=/(^|\s)-/.test(raw)||/(^|\s)A(\s|$)/.test(raw)||/TL\s*A(\s|$)/i.test(raw);
    var m=raw.match(/-?\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?|-?\d+(?:,\d{1,2})?/);
    if(!m)return 0;
    var n=parseFloat(m[0].replace(/\./g,'').replace(',','.'));
    if(isNaN(n)) n=0;
    return neg?-Math.abs(n):Math.abs(n);
  }
  function money(n){return new Intl.NumberFormat('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(Math.abs(Number(n||0)))+' TL'}
  function root(){return q('#selectedCariDetail')||q('#tab-cariler')||document.body}
  function findBalanceCard(){
    var r=root();
    var cards=qa('.card,.metric-mini,[class*="card"]',r);
    return cards.find(function(c){
      var t=clean(c.textContent).toLowerCase();
      return t.indexOf('güncel bakiye')>-1 || t.indexOf('guncel bakiye')>-1 || t.indexOf('son bakiye')>-1;
    });
  }
  function inferBalance(card){
    if(window.__ALKAM_CARI_CORE_LAST_SUMMARY && window.__ALKAM_CARI_CORE_LAST_SUMMARY.period){
      var p=window.__ALKAM_CARI_CORE_LAST_SUMMARY.period;
      if(typeof p.filterClosing==='number' && p.filterClosing!==0) return p.filterClosing;
      if(typeof p.current==='number') return p.current;
    }
    return parseMoney(card?card.textContent:'');
  }
  function patch(){
    var card=findBalanceCard();
    if(!card)return false;
    if(card.getAttribute('data-alkam-balance-highlight-done')==='1'){
      return true;
    }
    var val=inferBalance(card);
    var tip=val>0?'B':(val<0?'A':'0');
    var tipText=val>0?'BAKİYE B':(val<0?'BAKİYE A':'BAKİYE 0');
    card.setAttribute('data-alkam-balance-highlight-done','1');
    card.classList.add('alkam-son-bakiye-card');
    card.innerHTML='<div class="alkam-son-bakiye-title">SON BAKİYE</div><div class="alkam-son-bakiye-value">'+money(val)+'</div><div class="alkam-son-bakiye-type alkam-son-bakiye-type-'+tip.toLowerCase()+'">'+tipText+'</div>';
    return true;
  }
  function css(){
    if(q('#alkam-balance-highlight-style'))return;
    var st=document.createElement('style');
    st.id='alkam-balance-highlight-style';
    st.textContent='.alkam-son-bakiye-card{background:linear-gradient(180deg,#f8fbff,#eef4ff)!important;border:2px solid #2563eb!important;border-radius:16px!important;padding:16px 14px!important;box-shadow:0 16px 36px rgba(37,99,235,.16)!important;min-height:150px!important;display:flex!important;flex-direction:column!important;align-items:flex-start!important;justify-content:center!important}.alkam-son-bakiye-title{font-size:12px!important;font-weight:950!important;letter-spacing:.08em!important;color:#64748b!important;text-transform:uppercase!important;margin-bottom:8px!important}.alkam-son-bakiye-value{font-family:"Trebuchet MS","Arial Black","Segoe UI",Arial,sans-serif!important;font-size:54px!important;line-height:.95!important;font-weight:950!important;color:#0f172a!important;letter-spacing:-.03em!important;margin-bottom:10px!important}.alkam-son-bakiye-type{display:inline-flex!important;align-items:center!important;justify-content:center!important;padding:7px 12px!important;border-radius:999px!important;font-size:13px!important;font-weight:950!important;letter-spacing:.03em!important}.alkam-son-bakiye-type-b{background:#dbeafe!important;color:#1d4ed8!important}.alkam-son-bakiye-type-a{background:#fee2e2!important;color:#b91c1c!important}.alkam-son-bakiye-type-0{background:#e5e7eb!important;color:#374151!important}@media(max-width:900px){.alkam-son-bakiye-value{font-size:38px!important}}';
    document.head.appendChild(st);
  }
  function run(){try{css();patch()}catch(e){console.warn('ALKAM balance highlight hata:',e)}}
  window.ALKAM_BALANCE_HIGHLIGHT_V1={version:VERSION,run:function(){run();return patch()},test:function(){return {version:VERSION,found:!!findBalanceCard(),patched:!!q('.alkam-son-bakiye-card'),time:new Date().toISOString()}}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
  setInterval(function(){var card=findBalanceCard();if(card&&!q('.alkam-son-bakiye-card'))run()},1500);
})();
