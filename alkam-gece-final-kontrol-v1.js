(function(){
'use strict';
var VERSION='ALKAM Gece Final Kontrol v1.0';
function q(s,r){return (r||document).querySelector(s)}
function exists(name){return !!window[name]}
function localCount(k){try{var x=JSON.parse(localStorage.getItem(k)||'[]');return Array.isArray(x)?x.length:0}catch(e){return 0}}
function checks(){return [
 {k:'Merkezi veri uyarısı',ok:exists('ALKAM_MERKEZI_VERI_UYARI_V1'),detail:'Mobil/masaüstü veri farkı uyarısı'},
 {k:'Supabase sync paneli',ok:exists('ALKAM_SUPABASE_SYNC_V1'),detail:'Buluta gönder / buluttan çek'},
 {k:'Geçiş yedeği',ok:exists('ALKAM_YEDEKLEME_GECIS_V1'),detail:'JSON yedek alma/yükleme'},
 {k:'HALKBANK geçiş',ok:exists('ALKAM_HALKBANK_GECIS_V1'),detail:'Eski hareket mutabakat'},
 {k:'Kasa aktarım',ok:exists('ALKAM_KASA_AKTARIM_KONTROL_V1'),detail:'Eski kasa import/onay'},
 {k:'Gider onay',ok:exists('ALKAM_GIDER_ONAY_V1'),detail:'Gider/özel işlem sınıflandırma'},
 {k:'Gider köprü',ok:exists('ALKAM_GIDER_ONAY_KOPRU_V1'),detail:'Banka/kasa hareketinden gidere yönlendirme'},
 {k:'Finans hesapları',ok:exists('ALKAM_FINANS_FLOW_V6'),detail:'Banka/Kasa/Moka/Kredi Kartı/KMH'},
 {k:'Tahsilat çekirdeği',ok:exists('ALKAM_TAHSILAT_V7'),detail:'Cari + finans tahsilat'},
 {k:'Tahakkuk çekirdeği',ok:exists('ALKAM_TAHAKKUK_V5'),detail:'Toplu tahakkuk'},
 {k:'Cari local veri',ok:localCount('alkam_cariler')>=0,detail:localCount('alkam_cariler')+' cari'},
 {k:'Finans local veri',ok:localCount('alkam_finans_hareketleri')>=0,detail:localCount('alkam_finans_hareketleri')+' finans hareketi'}
]}
function css(){if(q('#alkam-gece-final-style'))return;var st=document.createElement('style');st.id='alkam-gece-final-style';st.textContent='.alkam-night-panel{background:#fff;border:1px solid #dbe4f0;border-radius:18px;padding:16px;margin:12px 0;box-shadow:0 10px 28px rgba(15,23,42,.06)}.alkam-night-panel h2{margin:0 0 8px;font-size:22px}.alkam-night-table{width:100%;margin-top:12px}.alkam-night-table th,.alkam-night-table td{padding:8px;border-bottom:1px solid #e2e8f0;font-size:12.5px}.alkam-night-table th{background:#f8fbff}.alkam-night-ok{color:#059669;font-weight:950}.alkam-night-no{color:#dc2626;font-weight:950}';document.head.appendChild(st)}
function render(){var root=q('#tab-dashboard')||q('.main');if(!root||q('#alkamNightFinalPanel'))return;css();var div=document.createElement('div');div.id='alkamNightFinalPanel';div.className='alkam-night-panel';div.innerHTML='<h2>Gece Final Hazırlık Kontrolü</h2><div style="font-size:12px;color:#64748b;font-weight:800">Yarın başlamadan önce ana modüllerin yüklenme durumunu gösterir.</div><div id="alkamNightFinalResult"></div>';root.insertBefore(div,root.firstChild);paint()}
function paint(){var box=q('#alkamNightFinalResult');if(!box)return;var c=checks();box.innerHTML='<table class="alkam-night-table"><thead><tr><th>Kontrol</th><th>Durum</th><th>Detay</th></tr></thead><tbody>'+c.map(function(x){return '<tr><td>'+x.k+'</td><td class="'+(x.ok?'alkam-night-ok':'alkam-night-no')+'">'+(x.ok?'Tamam':'Eksik')+'</td><td>'+x.detail+'</td></tr>'}).join('')+'</tbody></table>'}
function boot(){render();setTimeout(paint,1500);document.addEventListener('click',function(){setTimeout(render,200);setTimeout(paint,300)},true)}
window.ALKAM_GECE_FINAL_KONTROL_V1={version:VERSION,checks:checks,render:render,test:function(){return {version:VERSION,checks:checks(),time:new Date().toISOString()}}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();