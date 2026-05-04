(function(){
  'use strict';
  var VERSION='ALKAM Supabase Write Gate v10.9';
  var KEY='alkam_supabase_write_gate_state';
  function q(s,r){return (r||document).querySelector(s)}
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}}
  function write(v){localStorage.setItem(KEY,JSON.stringify(v));return v}
  function status(){
    var s=read();
    var ro=window.ALKAM_SUPABASE_READONLY_V10&&ALKAM_SUPABASE_READONLY_V10.status?ALKAM_SUPABASE_READONLY_V10.status():{};
    var pre=window.ALKAM_MIGRATION_PRECHECK_V10&&ALKAM_MIGRATION_PRECHECK_V10.scan?ALKAM_MIGRATION_PRECHECK_V10.scan():{};
    var cmp=window.ALKAM_SUPABASE_COMPARE_UI_V10&&ALKAM_SUPABASE_COMPARE_UI_V10.last?ALKAM_SUPABASE_COMPARE_UI_V10.last():null;
    var allowed=!!(s.userApproved===true&&ro.readReady===true&&pre.errors===0&&cmp&&cmp.critical===0);
    return {version:VERSION,writeAllowed:allowed,userApproved:!!s.userApproved,readReady:!!ro.readReady,precheckErrors:pre.errors,compareCritical:cmp?cmp.critical:null,reason:allowed?'Yazma kapısı açık':'Yazma kapısı kapalı: onay/read-only/precheck/compare şartları tamamlanmalı',time:new Date().toISOString()};
  }
  function block(reason){return {ok:false,blocked:true,reason:reason||status().reason,status:status()}}
  function requestEnable(){
    return block('Supabase yazma manuel olarak açılmadı. Önce yedek, read-only test ve karşılaştırma temiz olmalı.');
  }
  function approveLocalOnly(note){
    var st=status();
    if(!st.readReady||st.precheckErrors!==0||st.compareCritical!==0){return block('Ön şartlar temiz değil. Yazma onayı verilemez.')}
    return write({userApproved:true,note:note||'Kullanıcı onayı',approved_at:new Date().toISOString()});
  }
  function disable(){return write({userApproved:false,disabled_at:new Date().toISOString()})}
  function css(){if(q('#alkam-write-gate-style'))return;var st=document.createElement('style');st.id='alkam-write-gate-style';st.textContent='.alkam-writegate-modal{position:fixed;inset:0;z-index:1000016;background:rgba(15,23,42,.42);display:none;align-items:center;justify-content:center;padding:18px}.alkam-writegate-modal.open{display:flex}.alkam-writegate-box{width:min(820px,100%);max-height:88vh;background:#fff;border-radius:20px;border:1px solid #dbe4f0;box-shadow:0 30px 80px rgba(15,23,42,.32);font-family:Arial,Helvetica,sans-serif;overflow:hidden}.alkam-writegate-head{padding:16px 18px;background:#f8fbff;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between}.alkam-writegate-head b{font-size:18px;color:#0f172a}.alkam-writegate-head small{display:block;margin-top:4px;color:#64748b;font-weight:800}.alkam-writegate-close{width:34px;height:34px;border:0;border-radius:10px;background:#e8eef9;font-weight:950;cursor:pointer}.alkam-writegate-body{padding:16px 18px;overflow:auto;max-height:calc(88vh - 72px)}.alkam-writegate-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:12px}.alkam-writegate-card{border:1px solid #e2e8f0;background:#fbfdff;border-radius:14px;padding:12px}.alkam-writegate-card b{display:block;font-size:11px;color:#64748b;text-transform:uppercase}.alkam-writegate-card span{display:block;margin-top:6px;font-size:16px;font-weight:950}.alkam-writegate-actions{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}.alkam-writegate-actions button{height:34px;border:0;border-radius:10px;background:#1769e8;color:#fff;font-weight:950;padding:0 10px;cursor:pointer}.alkam-writegate-actions button.danger{background:#fee2e2;color:#991b1b}.alkam-writegate-result{border:1px solid #e2e8f0;border-radius:14px;background:#fbfdff;padding:12px;font-size:12px;font-weight:800;white-space:pre-wrap}@media(max-width:900px){.alkam-writegate-grid{grid-template-columns:1fr}}';document.head.appendChild(st)}
  function modal(){var el=q('#alkamWriteGateModal');if(el)return el;el=document.createElement('div');el.id='alkamWriteGateModal';el.className='alkam-writegate-modal';el.innerHTML='<div class="alkam-writegate-box"><div class="alkam-writegate-head"><div><b>Supabase Yazma Kapısı</b><small>Canlı yazma koruması. Tüm şartlar tamamlanmadan yazma açılmaz.</small></div><button class="alkam-writegate-close">×</button></div><div class="alkam-writegate-body" id="alkamWriteGateBody"></div></div>';document.body.appendChild(el);q('.alkam-writegate-close',el).onclick=function(){el.classList.remove('open')};return el}
  function render(){css();var el=modal(),body=q('#alkamWriteGateBody',el),s=status();body.innerHTML='<div class="alkam-writegate-actions"><button onclick="window.ALKAM_SUPABASE_WRITE_GATE_V10&&ALKAM_SUPABASE_WRITE_GATE_V10.render()">Yenile</button><button class="danger" onclick="window.ALKAM_SUPABASE_WRITE_GATE_V10&&ALKAM_SUPABASE_WRITE_GATE_V10.disable();window.ALKAM_SUPABASE_WRITE_GATE_V10.render()">Yazmayı Kapat</button></div><div class="alkam-writegate-grid"><div class="alkam-writegate-card"><b>Yazma</b><span>'+(s.writeAllowed?'Açık':'Kapalı')+'</span></div><div class="alkam-writegate-card"><b>Read Ready</b><span>'+s.readReady+'</span></div><div class="alkam-writegate-card"><b>Precheck Hata</b><span>'+s.precheckErrors+'</span></div><div class="alkam-writegate-card"><b>Kritik Fark</b><span>'+s.compareCritical+'</span></div></div><div class="alkam-writegate-result">'+JSON.stringify(s,null,2)+'</div>';return s}
  function open(){css();modal().classList.add('open');render()}
  function addButtons(){var bar=q('#alkamActionBar');if(bar&&!q('#alkamABWriteGate',bar)){var b=document.createElement('button');b.id='alkamABWriteGate';b.type='button';b.textContent='Yazma Kapısı';b.onclick=open;bar.appendChild(b)}var body=q('#alkamProfessionalDrawer .alkam-drawer-body');if(body&&!q('#alkamWriteGateCard',body)){var s=status();body.insertAdjacentHTML('beforeend','<div class="alkam-control-card" id="alkamWriteGateCard"><b>Supabase Yazma Kapısı</b><div class="line">Yazma: '+(s.writeAllowed?'Açık':'Kapalı')+' · Read: '+s.readReady+' · Kritik: '+s.compareCritical+'</div><div class="alkam-drawer-actions"><button onclick="window.ALKAM_SUPABASE_WRITE_GATE_V10&&ALKAM_SUPABASE_WRITE_GATE_V10.open()">Kapıyı Aç</button></div></div>')}}
  function boot(){css();setTimeout(function(){modal();addButtons()},1800)}
  window.ALKAM_SUPABASE_WRITE_GATE_V10={version:VERSION,status:status,test:status,open:open,render:render,block:block,requestEnable:requestEnable,approveLocalOnly:approveLocalOnly,disable:disable,write:block,insert:block,update:block,delete:block,run:boot};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();setInterval(addButtons,3000);
})();
