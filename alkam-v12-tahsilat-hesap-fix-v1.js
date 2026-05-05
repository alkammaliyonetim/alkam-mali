(function(){
  'use strict';
  var VERSION='ALKAM v12 Tahsilat Hesap Fix v1.0';
  function q(s,r){return (r||document).querySelector(s)}
  function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function read(k){try{return JSON.parse(localStorage.getItem(k)||'[]')}catch(e){return []}}
  function norm(s){return String(s||'').toLocaleUpperCase('tr-TR').replace(/\s+/g,' ').trim()}
  function unique(a){var m={};return a.filter(function(x){var k=norm(x);if(!k||m[k])return false;m[k]=1;return true})}
  function accountNames(){
    var base=['Banka','Kasa','Moka United','Halkbank','Ziraat Bankası','Garanti Bankası','İş Bankası','Yapı Kredi','Akbank','Vakıfbank','QNB Finansbank','Kredi Kartı / POS','Çek / Senet','Diğer'];
    ['alkam_hesaplar','alkam_accounts','alkam_kasalar','alkam_bankalar','alkam_finans_hesaplari'].forEach(function(k){
      read(k).forEach(function(x){var name=x.ad||x.hesap_adi||x.name||x.title||x.banka||x.kasa||x.unvan;if(name)base.push(String(name))})
    });
    qa('select option').forEach(function(o){var t=(o.textContent||o.value||'').trim();if(t&&norm(t).indexOf('SEÇ')<0)base.push(t)});
    return unique(base);
  }
  function findTahsilatModal(){
    var candidates=qa('.modal-card,.modal-overlay,.modal,div');
    return candidates.find(function(el){var t=norm(el.innerText);return t.indexOf('TAHSILAT GIR')>-1||t.indexOf('TAHSİLAT GİR')>-1||t.indexOf('CARİ TAHSİLAT')>-1})||null;
  }
  function fillSelect(sel){
    if(!sel||sel.dataset.alkamAccountFixed==='1')return false;
    var current=sel.value||''; var names=accountNames();
    sel.innerHTML='';
    names.forEach(function(name){var opt=document.createElement('option');opt.value=name;opt.textContent=name;sel.appendChild(opt)});
    if(current&&names.some(function(x){return norm(x)===norm(current)}))sel.value=current;else if(names.indexOf('Banka')>-1)sel.value='Banka';
    sel.dataset.alkamAccountFixed='1';
    sel.dispatchEvent(new Event('change',{bubbles:true}));
    return true;
  }
  function fixTahsilatAccounts(){
    var modal=findTahsilatModal(); if(!modal)return {active:false,reason:'tahsilat modal yok'};
    var selects=qa('select',modal);
    var fixed=0;
    selects.forEach(function(sel){
      var box=sel.closest('.field')||sel.parentElement; var txt=norm((box&&box.innerText)||'');
      if(txt.indexOf('HESAP')>-1||txt.indexOf('TAHSILAT HESABI')>-1||txt.indexOf('TAHSİLAT HESABI')>-1){if(fillSelect(sel))fixed++}
    });
    return {active:true,fixed:fixed,accounts:accountNames().length,time:new Date().toISOString()};
  }
  function css(){
    if(q('#alkam-v12-tahsilat-hesap-fix-style'))return;
    var st=document.createElement('style');st.id='alkam-v12-tahsilat-hesap-fix-style';
    st.textContent='.alkam-account-note{margin:8px 0 0;padding:8px 10px;border:1px solid #bfdbfe;background:#eff6ff;color:#1e3a8a;border-radius:10px;font-size:12px;font-weight:900}.modal-card select[data-alkam-account-fixed="1"]{border-color:#1769e8!important;box-shadow:0 0 0 3px rgba(23,105,232,.12)!important}';
    document.head.appendChild(st);
  }
  function addNote(){var modal=findTahsilatModal();if(!modal||q('.alkam-account-note',modal))return;var sel=qa('select[data-alkam-account-fixed="1"]',modal)[0];if(!sel)return;var note=document.createElement('div');note.className='alkam-account-note';note.textContent='Hesap entegrasyonu aktif: Kasa, Banka, Moka United ve tanımlı finans hesapları bu listeden seçilebilir.';(sel.closest('.field')||sel.parentElement).appendChild(note)}
  function run(){css();var r=fixTahsilatAccounts();addNote();window.__ALKAM_V12_TAHSILAT_HESAP_FIX_LAST=r;return r}
  function boot(){run();setInterval(run,1500);try{new MutationObserver(function(){run()}).observe(document.body,{childList:true,subtree:true})}catch(e){}}
  window.ALKAM_V12_TAHSILAT_HESAP_FIX_V1={version:VERSION,run:run,test:function(){return run()},accounts:accountNames};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
