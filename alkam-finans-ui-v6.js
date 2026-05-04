(function(){
  'use strict';
  var VERSION='ALKAM Finans UI v6.1';
  function q(s,r){return (r||document).querySelector(s)}
  function m(n){return new Intl.NumberFormat('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(Math.abs(Number(n||0)))+' TL'}
  function finance(){try{return window.ALKAM_FINANS_FLOW_V6&&window.ALKAM_FINANS_FLOW_V6.summary?window.ALKAM_FINANS_FLOW_V6.summary():null}catch(e){return null}}
  function css(){
    if(q('#alkam-finans-ui-style'))return;
    var st=document.createElement('style');st.id='alkam-finans-ui-style';
    st.textContent='.alkam-finance-card{border:1px solid #dbeafe!important;background:linear-gradient(180deg,#fff,#f8fbff)!important;border-radius:14px!important;padding:12px!important;margin-bottom:10px!important}.alkam-finance-card b{display:block!important;font-size:13px!important;color:#0f172a!important;margin-bottom:8px!important}.alkam-finance-grid{display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:7px!important}.alkam-finance-grid div{border:1px solid #e2e8f0!important;background:#fff!important;border-radius:10px!important;padding:8px!important}.alkam-finance-grid small{display:block!important;font-size:10px!important;font-weight:900!important;color:#64748b!important;text-transform:uppercase!important}.alkam-finance-grid span{display:block!important;font-size:12px!important;font-weight:950!important;color:#0f172a!important;margin-top:4px!important}.alkam-finance-actions{display:flex!important;gap:8px!important;flex-wrap:wrap!important;margin-top:10px!important}.alkam-finance-actions button{height:32px!important;border:0!important;border-radius:10px!important;background:#1769e8!important;color:#fff!important;font-weight:950!important;padding:0 10px!important;cursor:pointer!important}.alkam-finance-actions button.secondary{background:#e8eef9!important;color:#0f172a!important}@media(max-width:900px){.alkam-finance-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}';
    document.head.appendChild(st);
  }
  function html(){
    var s=finance();
    if(!s)return '<div class="alkam-finance-card" id="alkamFinanceControlCard"><b>Finans Hesapları</b><div class="line">Finans çekirdeği bekleniyor.</div></div>';
    var a=s.accounts||{};
    function box(id,label){var x=a[id]||{};return '<div><small>'+label+'</small><span>'+m(x.bakiye||0)+'</span></div>'}
    return '<div class="alkam-finance-card" id="alkamFinanceControlCard"><b>Finans Hesapları Özeti</b><div class="alkam-finance-grid">'+box('banka','Banka')+box('kasa','Kasa')+box('moka','Moka United')+box('cek','Çek')+box('senet','Senet')+'</div><div class="alkam-finance-actions"><button onclick="window.ALKAM_FINANS_FLOW_V6&&ALKAM_FINANS_FLOW_V6.test&&console.table(ALKAM_FINANS_FLOW_V6.test().accounts)">Özeti Göster</button><button class="secondary" onclick="window.ALKAM_FINANS_FLOW_V6&&ALKAM_FINANS_FLOW_V6.mokaSettlement&&console.log(ALKAM_FINANS_FLOW_V6.mokaSettlement(0,\'test\'))">Moka Aktarım Test</button></div></div>';
  }
  function injectDrawer(){
    var body=q('#alkamProfessionalDrawer .alkam-drawer-body');
    if(!body)return;
    var old=q('#alkamFinanceControlCard',body);
    if(old)old.outerHTML=html();
    else body.insertAdjacentHTML('afterbegin',html());
  }
  function addActionButton(){
    var bar=q('#alkamActionBar'); if(!bar||q('#alkamABFinans',bar))return;
    var btn=document.createElement('button');btn.id='alkamABFinans';btn.type='button';btn.textContent='Finans Özeti';
    btn.onclick=function(){if(window.ALKAM_PROFESSIONAL_UI_V1&&window.ALKAM_PROFESSIONAL_UI_V1.open)window.ALKAM_PROFESSIONAL_UI_V1.open();setTimeout(injectDrawer,150)};
    bar.appendChild(btn);
  }
  function run(){css();injectDrawer();addActionButton()}
  window.ALKAM_FINANS_UI_V6={version:VERSION,run:run,test:function(){return {version:VERSION,financeReady:!!finance(),card:!!q('#alkamFinanceControlCard'),actionButton:!!q('#alkamABFinans'),time:new Date().toISOString()}}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
  setInterval(run,2500);
})();
