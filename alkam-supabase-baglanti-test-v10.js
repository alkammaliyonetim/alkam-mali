(function(){
  'use strict';
  var VERSION='ALKAM Supabase Bağlantı Test v10.6';
  function q(s,r){return (r||document).querySelector(s)}
  function cfg(){return window.ALKAM_SUPABASE_CONFIG||null}
  function status(){
    var c=cfg();
    var hasClient=!!window.supabase;
    var enabled=!!(c&&c.enabled);
    var hasUrl=!!(c&&c.url&&c.url.indexOf('YOUR_PROJECT_ID')===-1);
    var hasKey=!!(c&&c.publishableKey&&c.publishableKey.indexOf('YOUR_PUBLIC')===-1);
    var ready=hasClient&&enabled&&hasUrl&&hasKey;
    return {version:VERSION,client:hasClient,enabled:enabled,hasUrl:hasUrl,hasKey:hasKey,ready:ready,mode:c&&c.mode||'not_configured',time:new Date().toISOString()};
  }
  async function testRead(){
    var s=status(), c=cfg();
    if(!s.ready)return {ok:false,reason:'Supabase config hazır değil veya enabled=false',status:s};
    try{
      var client=window.supabase.createClient(c.url,c.publishableKey);
      var table=(c.tables&&c.tables.finansHesaplari)||'finans_hesaplari';
      var res=await client.from(table).select('*').limit(5);
      return {ok:!res.error,error:res.error||null,data:res.data||[],table:table,status:s,time:new Date().toISOString()};
    }catch(e){return {ok:false,reason:e.message,status:s}}
  }
  function css(){if(q('#alkam-supa-test-style'))return;var st=document.createElement('style');st.id='alkam-supa-test-style';st.textContent='.alkam-supa-modal{position:fixed;inset:0;z-index:1000013;background:rgba(15,23,42,.42);display:none;align-items:center;justify-content:center;padding:18px}.alkam-supa-modal.open{display:flex}.alkam-supa-box{width:min(760px,100%);max-height:88vh;background:#fff;border-radius:20px;border:1px solid #dbe4f0;box-shadow:0 30px 80px rgba(15,23,42,.32);font-family:Arial,Helvetica,sans-serif;overflow:hidden}.alkam-supa-head{padding:16px 18px;background:#f8fbff;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between}.alkam-supa-head b{font-size:18px;color:#0f172a}.alkam-supa-head small{display:block;margin-top:4px;color:#64748b;font-weight:800}.alkam-supa-close{width:34px;height:34px;border:0;border-radius:10px;background:#e8eef9;font-weight:950;cursor:pointer}.alkam-supa-body{padding:16px 18px;overflow:auto;max-height:calc(88vh - 72px)}.alkam-supa-actions{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}.alkam-supa-actions button{height:34px;border:0;border-radius:10px;background:#1769e8;color:#fff;font-weight:950;padding:0 10px;cursor:pointer}.alkam-supa-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:12px}.alkam-supa-card{border:1px solid #e2e8f0;background:#fbfdff;border-radius:14px;padding:12px}.alkam-supa-card b{display:block;font-size:11px;color:#64748b;text-transform:uppercase}.alkam-supa-card span{display:block;margin-top:6px;font-size:16px;font-weight:950;color:#0f172a}.alkam-supa-result{border:1px solid #e2e8f0;border-radius:14px;background:#fbfdff;padding:12px;font-size:12px;font-weight:800;white-space:pre-wrap}@media(max-width:900px){.alkam-supa-grid{grid-template-columns:1fr}}';document.head.appendChild(st)}
  function modal(){var el=q('#alkamSupabaseTestModal');if(el)return el;el=document.createElement('div');el.id='alkamSupabaseTestModal';el.className='alkam-supa-modal';el.innerHTML='<div class="alkam-supa-box"><div class="alkam-supa-head"><div><b>Supabase Bağlantı Testi</b><small>Önce read-only test; canlı yazma kapalı kalır.</small></div><button class="alkam-supa-close">×</button></div><div class="alkam-supa-body" id="alkamSupaBody"></div></div>';document.body.appendChild(el);q('.alkam-supa-close',el).onclick=function(){el.classList.remove('open')};return el}
  function render(){css();var el=modal(),body=q('#alkamSupaBody',el),s=status();body.innerHTML='<div class="alkam-supa-actions"><button onclick="window.ALKAM_SUPABASE_BAGLANTI_TEST_V10&&ALKAM_SUPABASE_BAGLANTI_TEST_V10.runReadTest()">Read Test Çalıştır</button></div><div class="alkam-supa-grid"><div class="alkam-supa-card"><b>Client</b><span>'+(s.client?'Var':'Yok')+'</span></div><div class="alkam-supa-card"><b>Enabled</b><span>'+(s.enabled?'Açık':'Kapalı')+'</span></div><div class="alkam-supa-card"><b>URL</b><span>'+(s.hasUrl?'Hazır':'Örnek')+'</span></div><div class="alkam-supa-card"><b>Key</b><span>'+(s.hasKey?'Hazır':'Örnek')+'</span></div></div><div id="alkamSupaResult" class="alkam-supa-result">Mod: '+s.mode+'\nReady: '+s.ready+'\nNot: enabled=false iken Supabase yazma/okuma yapılmaz.</div>';return s}
  async function runReadTest(){var el=modal();var res=q('#alkamSupaResult',el);if(res)res.textContent='Read test çalışıyor...';var out=await testRead();if(res)res.textContent=JSON.stringify(out,null,2);window.__ALKAM_SUPABASE_TEST_LAST=out;return out}
  function open(){css();modal().classList.add('open');render()}
  function addButtons(){var bar=q('#alkamActionBar');if(bar&&!q('#alkamABSupabaseTest',bar)){var b=document.createElement('button');b.id='alkamABSupabaseTest';b.type='button';b.textContent='Supabase Test';b.onclick=open;bar.appendChild(b)}var body=q('#alkamProfessionalDrawer .alkam-drawer-body');if(body&&!q('#alkamSupabaseTestCard',body)){var s=status();body.insertAdjacentHTML('beforeend','<div class="alkam-control-card" id="alkamSupabaseTestCard"><b>Supabase Bağlantı Testi</b><div class="line">Ready: '+s.ready+' · Mode: '+s.mode+' · Yazma kapalı.</div><div class="alkam-drawer-actions"><button onclick="window.ALKAM_SUPABASE_BAGLANTI_TEST_V10&&ALKAM_SUPABASE_BAGLANTI_TEST_V10.open()">Testi Aç</button></div></div>')}}
  function boot(){css();setTimeout(function(){render();addButtons()},1800)}
  window.ALKAM_SUPABASE_BAGLANTI_TEST_V10={version:VERSION,status:status,test:status,open:open,render:render,testRead:testRead,runReadTest:runReadTest,last:function(){return window.__ALKAM_SUPABASE_TEST_LAST||status()},run:boot};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();setInterval(addButtons,3000);
})();
