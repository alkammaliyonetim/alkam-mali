(function(){
'use strict';
var VERSION='ALKAM Veri Teşhis v1.0 safe-branch';
var KEYS=[
  'alkam_cariler','alkam_cari_hareketleri','alkam_tahakkuklar','alkam_tahsilatlar',
  'alkam_cari_import_editor_v1','alkam_imported_cariler_v1','alkam_local_ledger_v1',
  'alkam_finans_hesaplari','alkam_finans_hareketleri','alkam_onay_bekleyen_banka'
];
function q(s,r){return (r||document).querySelector(s)}
function readRaw(k){try{return localStorage.getItem(k)}catch(e){return null}}
function read(k){try{var raw=readRaw(k);return raw?JSON.parse(raw):null}catch(e){return {__jsonError:true,error:String(e&&e.message||e)}}}
function typeOf(v){if(v&&v.__jsonError)return 'JSON Hatası';if(Array.isArray(v))return 'Liste';if(v&&typeof v==='object')return 'Obje';if(v==null)return 'Yok';return typeof v}
function countOf(v){if(Array.isArray(v))return v.length;if(v&&typeof v==='object'&&!v.__jsonError)return Object.keys(v).length;return 0}
function sampleOf(v){try{if(Array.isArray(v))return v.slice(0,2);if(v&&typeof v==='object'&&!v.__jsonError)return Object.keys(v).slice(0,6).reduce(function(a,k){a[k]=v[k];return a},{})}catch(e){}return null}
function detectCariSource(){
 var result=[];
 KEYS.forEach(function(k){var v=read(k);result.push({key:k,type:typeOf(v),count:countOf(v),hasRaw:!!readRaw(k),sample:sampleOf(v)});});
 var globals=['ALKAM_CARILER_DATA','ALKAM_CARILER_77_DATA','CARILER','cariData','windowCariler'];
 globals.forEach(function(g){var v=window[g];result.push({key:'window.'+g,type:typeOf(v),count:countOf(v),hasRaw:!!v,sample:sampleOf(v)});});
 return result;
}
function scanDom(){
 var selected=q('#selectedCariDetail');
 var tab=q('#tab-cariler');
 var listText='';
 try{listText=tab?String(tab.innerText||'').slice(0,1000):''}catch(e){}
 return {
   selectedCariDetail:!!selected,
   selectedCariVisible:!!(selected&&selected.getBoundingClientRect().width>0&&selected.getBoundingClientRect().height>0),
   tabCariler:!!tab,
   tabCarilerVisible:!!(tab&&tab.getBoundingClientRect().width>0&&tab.getBoundingClientRect().height>0),
   tabTextSample:listText,
   cariListScroll:!!q('.cari-list-scroll'),
   cariDetailScroll:!!q('.cari-detail-scroll'),
   activeNav:(q('.nav-btn.active')&&q('.nav-btn.active').innerText)||''
 };
}
function scan(){
 var rows=detectCariSource();
 var cariler=rows.find(function(x){return x.key==='alkam_cariler'})||{};
 var hareket=rows.find(function(x){return x.key==='alkam_cari_hareketleri'})||{};
 var editor=rows.find(function(x){return x.key==='alkam_cari_import_editor_v1'})||{};
 var imported=rows.find(function(x){return x.key==='alkam_imported_cariler_v1'})||{};
 var ledger=rows.find(function(x){return x.key==='alkam_local_ledger_v1'})||{};
 var status='Veri Yok';
 if((cariler.count||0)>0)status='Ana Cari Verisi Var';
 else if((editor.count||0)>0||(imported.count||0)>0||(ledger.count||0)>0)status='Ham Veri Var / Ana Veriye Aktarılmamış';
 var out={version:VERSION,status:status,summary:{cariler:cariler.count||0,hareketler:hareket.count||0,editor:editor.count||0,imported:imported.count||0,ledger:ledger.count||0},rows:rows,dom:scanDom(),time:new Date().toISOString()};
 window.__ALKAM_VERI_TESHIS_LAST=out;return out;
}
function css(){if(q('#alkam-veri-teshis-style'))return;var st=document.createElement('style');st.id='alkam-veri-teshis-style';st.textContent='.alkam-vt-modal{position:fixed;inset:0;z-index:1000025;background:rgba(15,23,42,.42);display:none;align-items:center;justify-content:center;padding:18px}.alkam-vt-modal.open{display:flex}.alkam-vt-box{width:min(1120px,100%);max-height:90vh;background:#fff;border:1px solid #dbe4f0;border-radius:20px;box-shadow:0 30px 80px rgba(15,23,42,.3);font-family:Arial,Helvetica,sans-serif;overflow:hidden}.alkam-vt-head{display:flex;justify-content:space-between;gap:12px;padding:16px 18px;background:#f8fbff;border-bottom:1px solid #e2e8f0}.alkam-vt-head b{font-size:18px;color:#0f172a}.alkam-vt-head small{display:block;margin-top:4px;color:#64748b;font-weight:800}.alkam-vt-close{width:34px;height:34px;border:0;border-radius:10px;background:#e8eef9;font-weight:950;cursor:pointer}.alkam-vt-body{padding:16px 18px;overflow:auto;max-height:calc(90vh - 72px)}.alkam-vt-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:12px}.alkam-vt-card{border:1px solid #e2e8f0;border-radius:14px;background:#fbfdff;padding:12px}.alkam-vt-card b{display:block;font-size:10px;color:#64748b;text-transform:uppercase}.alkam-vt-card span{display:block;margin-top:6px;font-size:18px;font-weight:950;color:#0f172a}.alkam-vt-actions{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}.alkam-vt-actions button{height:34px;border:0;border-radius:10px;background:#1769e8;color:#fff;font-weight:950;padding:0 10px;cursor:pointer}.alkam-vt-actions button.secondary{background:#e8eef9;color:#0f172a}.alkam-vt-table{border:1px solid #e2e8f0;border-radius:14px;overflow:auto}.alkam-vt-table table{width:100%;border-collapse:collapse;min-width:800px}.alkam-vt-table th{background:#f8fafc;color:#64748b;font-size:11px;text-transform:uppercase;text-align:left;padding:9px}.alkam-vt-table td{border-top:1px solid #eef2f7;padding:9px;font-size:12px;font-weight:800;vertical-align:top}.alkam-vt-note{border:1px solid #dbeafe;background:#eff6ff;color:#1e3a8a;border-radius:14px;padding:12px;font-size:12px;font-weight:900;line-height:1.5;margin-bottom:12px}.alkam-vt-bad{color:#b91c1c}.alkam-vt-ok{color:#047857}@media(max-width:900px){.alkam-vt-grid{grid-template-columns:1fr}}';document.head.appendChild(st)}
function modal(){var el=q('#alkamVeriTeshisModal');if(el)return el;el=document.createElement('div');el.id='alkamVeriTeshisModal';el.className='alkam-vt-modal';el.innerHTML='<div class="alkam-vt-box"><div class="alkam-vt-head"><div><b>Veri Teşhis Merkezi</b><small>Bu panel veri var mı, nerede var, neden ekrana gelmiyor sorusunu cevaplar. Sadece okur, kayıt değiştirmez.</small></div><button class="alkam-vt-close">×</button></div><div class="alkam-vt-body" id="alkamVeriTeshisBody"></div></div>';document.body.appendChild(el);q('.alkam-vt-close',el).onclick=function(){el.classList.remove('open')};return el}
function render(){css();var s=scan();var body=q('#alkamVeriTeshisBody',modal());var cls=s.summary.cariler>0?'alkam-vt-ok':'alkam-vt-bad';body.innerHTML='<div class="alkam-vt-actions"><button onclick="window.ALKAM_VERI_TESHIS_V1&&ALKAM_VERI_TESHIS_V1.render()">Yenile</button><button class="secondary" onclick="console.log(window.ALKAM_VERI_TESHIS_V1.last())">Konsola Yaz</button></div><div class="alkam-vt-note"><b class="'+cls+'">'+s.status+'</b><br>DOM: Cari sekmesi '+(s.dom.tabCarilerVisible?'görünüyor':'görünmüyor')+' · Detay alanı '+(s.dom.selectedCariVisible?'görünüyor':'görünmüyor')+' · Aktif menü: '+(s.dom.activeNav||'-')+'</div><div class="alkam-vt-grid"><div class="alkam-vt-card"><b>Cari</b><span>'+s.summary.cariler+'</span></div><div class="alkam-vt-card"><b>Hareket</b><span>'+s.summary.hareketler+'</span></div><div class="alkam-vt-card"><b>Editor</b><span>'+s.summary.editor+'</span></div><div class="alkam-vt-card"><b>Import</b><span>'+s.summary.imported+'</span></div><div class="alkam-vt-card"><b>Ledger</b><span>'+s.summary.ledger+'</span></div></div><div class="alkam-vt-table"><table><thead><tr><th>Kaynak</th><th>Tip</th><th>Kayıt</th><th>Ham Var</th><th>Örnek</th></tr></thead><tbody>'+s.rows.map(function(r){return '<tr><td>'+r.key+'</td><td>'+r.type+'</td><td>'+r.count+'</td><td>'+(r.hasRaw?'Evet':'Hayır')+'</td><td><pre style="white-space:pre-wrap;margin:0;font-size:11px">'+String(JSON.stringify(r.sample,null,2)||'').replace(/[<>&]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;'}[c]})+'</pre></td></tr>'}).join('')+'</tbody></table></div>';return s}
function open(){css();modal().classList.add('open');return render()}
function addButton(){var bar=q('#alkamActionBar');if(bar&&!q('#alkamABVeriTeshis',bar)){var b=document.createElement('button');b.id='alkamABVeriTeshis';b.type='button';b.textContent='Veri Teşhis';b.onclick=open;bar.appendChild(b)}}
function run(){css();setTimeout(function(){modal();addButton();scan()},1200)}
window.ALKAM_VERI_TESHIS_V1={version:VERSION,scan:scan,open:open,render:render,run:run,last:function(){return window.__ALKAM_VERI_TESHIS_LAST||scan()},test:scan};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
document.addEventListener('click',function(){setTimeout(addButton,250)},true);
})();