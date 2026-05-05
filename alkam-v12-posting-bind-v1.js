(function(){
'use strict';
var VERSION='ALKAM v12 Posting Bind v1.0';
var busy=false;
function q(s,r){return (r||document).querySelector(s)}
function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function up(s){return String(s||'').toLocaleUpperCase('tr-TR').replace(/\s+/g,' ').trim()}
function val(el){return el?String(el.value||el.textContent||'').trim():''}
function selectedCari(){var h=q('#selectedCariDetail .hero-name')||q('#alkamStickyCariOps .name')||q('#selectedCariDetail h1')||q('#selectedCariDetail h2');return val(h)}
function findBox(el){return el.closest&&el.closest('.field')||el.parentElement||el}
function field(root,names){var want=names.map(up),ins=qa('input,select,textarea',root);for(var i=0;i<ins.length;i++){var box=findBox(ins[i]),txt=up(box.innerText||'');if(want.some(function(w){return txt.indexOf(w)>-1}))return val(ins[i])}return ''}
function amount(v){var s=String(v||'').replace(/\s/g,'').replace(/TL/gi,'').replace(/₺/g,'');if(s.indexOf(',')>-1)s=s.replace(/\./g,'').replace(',','.');var n=Number(s);return isFinite(n)?n:0}
function modalHas(root,words){var t=up(root&&root.innerText||'');return words.some(function(w){return t.indexOf(up(w))>-1})}
function activeModal(kind){return qa('.modal-card,.modal-overlay,.modal,body').find(function(el){if(kind==='tahsilat')return modalHas(el,['Cari Tahsilat','Tahsilat Gir','Tahsilatı Kaydet']);return modalHas(el,['Tahakkuk Gir','Tahakkuk Kaydet','Toplu Tahakkuk'])})||null}
function tahsilatObj(){var m=activeModal('tahsilat'),c=selectedCari();if(!m||!c)return null;var t=field(m,['Tutar']),dt=field(m,['Tahsilat Tarihi','Tarih']),hp=field(m,['Tahsilat Hesabı','Hesap']),ac=field(m,['Açıklama','Aciklama']);if(amount(t)<=0)return null;return {cari:c,tutar:t,tarih:dt,hesap:hp||'Banka',aciklama:ac||'Tahsilat'}}
function tahakkukObj(){var m=activeModal('tahakkuk'),c=selectedCari();if(!m||!c)return null;var t=field(m,['Tutar','Varsayılan Tutar']),dt=field(m,['Tahakkuk Tarihi','Varsayılan Tarih','Tarih']),ac=field(m,['Açıklama','Varsayılan Açıklama','Aciklama']);if(amount(t)<=0)return null;return {cari:c,tutar:t,tarih:dt,aciklama:ac||'Tahakkuk'}}
function refresh(){setTimeout(function(){try{window.ALKAM_V12_CARI_OPERASYON_FIX_V1&&ALKAM_V12_CARI_OPERASYON_FIX_V1.run()}catch(e){}try{window.renderCariler&&window.renderCariler()}catch(e){}try{window.renderDashboard&&window.renderDashboard()}catch(e){}},120)}
function commit(type){if(busy||!window.ALKAM_V12_DEFTER_POSTING_CORE_V1)return null;busy=true;try{var res=null;if(type==='tahsilat'){var o=tahsilatObj();if(o)res=ALKAM_V12_DEFTER_POSTING_CORE_V1.tahsilat(o)}else{var x=tahakkukObj();if(x)res=ALKAM_V12_DEFTER_POSTING_CORE_V1.tahakkuk(x)}window.__ALKAM_V12_POSTING_BIND_LAST={type:type,result:res,time:new Date().toISOString()};refresh();return res}finally{busy=false}}
function bind(){if(window.__ALKAM_V12_POSTING_BIND_BOUND)return;window.__ALKAM_V12_POSTING_BIND_BOUND=true;document.addEventListener('click',function(ev){var b=ev.target.closest&&ev.target.closest('button,.btn');if(!b)return;var t=up(b.innerText);if(t.indexOf('TAHSILATI KAYDET')>-1||t.indexOf('TAHSİLATI KAYDET')>-1){commit('tahsilat')}else if(t.indexOf('TAHAKKUK')>-1&&t.indexOf('KAYDET')>-1){commit('tahakkuk')}},true)}
function test(){return {version:VERSION,bound:!!window.__ALKAM_V12_POSTING_BIND_BOUND,core:!!window.ALKAM_V12_DEFTER_POSTING_CORE_V1,last:window.__ALKAM_V12_POSTING_BIND_LAST||null,time:new Date().toISOString()}}
window.ALKAM_V12_POSTING_BIND_V1={version:VERSION,bind:bind,commit:commit,test:test,tahsilatObj:tahsilatObj,tahakkukObj:tahakkukObj};
bind();
})();