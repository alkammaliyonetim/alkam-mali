(function(){
'use strict';
var VERSION='ALKAM Merkezi Veri Uyarı v1.0';
function q(s,r){return (r||document).querySelector(s)}
function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function read(k){try{var x=JSON.parse(localStorage.getItem(k)||'[]');return Array.isArray(x)?x:[]}catch(e){return[]}}
function hasLocalData(){return ['alkam_cariler','alkam_cari_hareketleri','alkam_tahakkuklar','alkam_tahsilatlar','alkam_finans_hareketleri','alkam_giderler'].some(function(k){return read(k).length>0})}
function supabaseReady(){return !!(window.supabase&&window.ALKAM_SUPABASE&&window.ALKAM_SUPABASE.url&&window.ALKAM_SUPABASE.key)}
function css(){if(q('#alkam-merkezi-veri-style'))return;var st=document.createElement('style');st.id='alkam-merkezi-veri-style';st.textContent=[
'.alkam-center-warning{position:sticky;top:0;z-index:999997;margin:8px 0 12px;padding:12px 14px;border-radius:14px;font-weight:950;border:1px solid #fecaca;background:#fff1f2;color:#991b1b;box-shadow:0 8px 22px rgba(15,23,42,.08)}',
'.alkam-center-warning.ok{border-color:#bbf7d0;background:#f0fdf4;color:#166534}',
'.alkam-center-warning small{display:block;margin-top:4px;font-size:12px;line-height:1.35;color:inherit;opacity:.85}',
'@media(max-width:760px){#alkamModuleButton,#alkamModulMenuButton,.alkam-module-button,#alkamStatusBadge,#alkamTekKontrolRozeti,.alkam-status-badge,.alkam-control-badge,#alkamControlCenterButton,#alkamKontrolMerkeziButton{display:none!important}.alkam-mobile-command{position:fixed!important;left:14px!important;right:14px!important;bottom:14px!important;z-index:999999!important;background:#06142f!important;color:#fff!important;border-radius:18px!important;padding:13px 14px!important;font-size:15px!important;font-weight:950!important;text-align:center!important;box-shadow:0 16px 32px rgba(15,23,42,.30)!important}.main{padding-bottom:78px!important}.card,.metric-mini{font-size:16px!important}.card-value{font-size:32px!important}.section-title,.page-head h1{font-size:26px!important}.btn,button,.chip{min-height:44px!important;font-size:14px!important}}'
].join('\n');document.head.appendChild(st)}
function warning(){var root=q('.main')||document.body;if(!root)return;var box=q('#alkamCenterWarning');if(!box){box=document.createElement('div');box.id='alkamCenterWarning';box.className='alkam-center-warning';root.insertBefore(box,root.firstChild)}var ready=supabaseReady();box.className='alkam-center-warning '+(ready?'ok':'');box.innerHTML=ready?'Merkezi veri bağlantısı görünüyor.<small>Yine de canlı veri okuma/yazma testi yapılmadan muhasebe geçişi tamam sayılmayacak.</small>':'DİKKAT: Bu cihaz merkezi veri tabanına bağlı görünmüyor. <small>Telefon ve masaüstünde farklı rakam çıkmasının sebebi budur. Gerçek geçiş için Supabase canlı bağlantı + veri senkronizasyonu şart.</small>'}
function mobileButton(){if(!/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)&&window.innerWidth>760)return;var b=q('#alkamMobileCommand');if(!b){b=document.createElement('button');b.id='alkamMobileCommand';b.className='alkam-mobile-command';b.textContent='ALKAM Menü / Kontrol';b.onclick=function(){var m=q('#alkamModuleButton')||q('#alkamModulMenuButton')||q('.alkam-module-button');if(m)m.click();else alert('Modül menüsü bu ekranda hazır değil. Masaüstü panelinden devam edin.')} ;document.body.appendChild(b)}}
function run(){css();warning();mobileButton();window.__ALKAM_MERKEZI_VERI_UYARI_LAST={version:VERSION,supabaseReady:supabaseReady(),hasLocalData:hasLocalData(),time:new Date().toISOString()};return window.__ALKAM_MERKEZI_VERI_UYARI_LAST}
function boot(){run();setTimeout(run,800);setTimeout(run,2200);document.addEventListener('click',function(){setTimeout(run,250)},true)}
window.ALKAM_MERKEZI_VERI_UYARI_V1={version:VERSION,run:run,test:run};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();