(function(){
'use strict';
var VERSION='ALKAM Supabase Sync v1.0';
var TABLES=[
 {local:'alkam_cariler',remote:'alkam_cariler'},
 {local:'alkam_cari_hareketleri',remote:'alkam_cari_hareketleri'},
 {local:'alkam_finans_hesaplari',remote:'alkam_finans_hesaplari'},
 {local:'alkam_finans_hareketleri',remote:'alkam_finans_hareketleri'},
 {local:'alkam_tahakkuklar',remote:'alkam_tahakkuklar'},
 {local:'alkam_tahsilatlar',remote:'alkam_tahsilatlar'},
 {local:'alkam_giderler',remote:'alkam_giderler'}
];
function q(s,r){return (r||document).querySelector(s)}
function read(k){try{var x=JSON.parse(localStorage.getItem(k)||'[]');return Array.isArray(x)?x:[]}catch(e){return[]}}
function write(k,v){localStorage.setItem(k,JSON.stringify(v||[]))}
function now(){return new Date().toISOString()}
function cfg(){var c=window.ALKAM_SUPABASE||window.SUPABASE_CONFIG||{};return {url:c.url||c.SUPABASE_URL||c.NEXT_PUBLIC_SUPABASE_URL,key:c.key||c.anonKey||c.SUPABASE_ANON_KEY||c.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY}}
function client(){var c=cfg();if(!window.supabase||!c.url||!c.key)return null;try{return window.supabase.createClient(c.url,c.key)}catch(e){return null}}
function normalizeRow(row,table){var x=Object.assign({},row||{});if(!x.id)x.id=(table.local+'-'+Date.now()+'-'+Math.random().toString(16).slice(2));delete x.backup;delete x.posting_result;delete x.raw_file;return x}
async function pushTable(t){var sb=client();if(!sb)return {ok:false,reason:'Supabase config yok',table:t.remote};var rows=read(t.local).map(function(r){return normalizeRow(r,t)});if(!rows.length)return {ok:true,table:t.remote,pushed:0};var res=await sb.from(t.remote).upsert(rows,{onConflict:'id'});if(res.error)return {ok:false,table:t.remote,reason:res.error.message};return {ok:true,table:t.remote,pushed:rows.length}}
async function pullTable(t){var sb=client();if(!sb)return {ok:false,reason:'Supabase config yok',table:t.remote};var res=await sb.from(t.remote).select('*').limit(50000);if(res.error)return {ok:false,table:t.remote,reason:res.error.message};write(t.local,res.data||[]);return {ok:true,table:t.remote,pulled:(res.data||[]).length}}
async function pushAll(){var out=[];for(var i=0;i<TABLES.length;i++)out.push(await pushTable(TABLES[i]));window.__ALKAM_SUPABASE_SYNC_LAST={mode:'pushAll',results:out,time:now()};paint();return window.__ALKAM_SUPABASE_SYNC_LAST}
async function pullAll(){var out=[];for(var i=0;i<TABLES.length;i++)out.push(await pullTable(TABLES[i]));window.__ALKAM_SUPABASE_SYNC_LAST={mode:'pullAll',results:out,time:now()};paint();try{window.renderDashboard&&window.renderDashboard()}catch(e){};return window.__ALKAM_SUPABASE_SYNC_LAST}
async function test(){var sb=client();if(!sb)return {ok:false,reason:'Supabase config yok',config:cfg(),time:now()};var res=await sb.from('alkam_finans_hesaplari').select('id').limit(1);var out={ok:!res.error,reason:res.error&&res.error.message,time:now()};window.__ALKAM_SUPABASE_SYNC_TEST=out;paint();return out}
function counts(){return TABLES.map(function(t){return {local:t.local,remote:t.remote,count:read(t.local).length}})}
function css(){if(q('#alkam-supabase-sync-style'))return;var st=document.createElement('style');st.id='alkam-supabase-sync-style';st.textContent='.alkam-sync-panel{background:#fff;border:1px solid #dbe4f0;border-radius:18px;padding:16px;margin:12px 0;box-shadow:0 10px 28px rgba(15,23,42,.06)}.alkam-sync-panel h2{margin:0 0 8px;font-size:22px}.alkam-sync-actions{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}.alkam-sync-actions button{height:40px;border:0;border-radius:11px;padding:0 12px;font-weight:950;cursor:pointer;background:#1769e8;color:#fff}.alkam-sync-actions button.green{background:#059669}.alkam-sync-actions button.orange{background:#d97706}.alkam-sync-table{width:100%;margin-top:12px}.alkam-sync-table th,.alkam-sync-table td{padding:8px;border-bottom:1px solid #e2e8f0;font-size:12.5px}.alkam-sync-table th{background:#f8fbff}';document.head.appendChild(st)}
function render(){var root=q('#tab-dashboard')||q('#tab-finans')||q('.main');if(!root||q('#alkamSupabaseSyncPanel'))return;css();var div=document.createElement('div');div.id='alkamSupabaseSyncPanel';div.className='alkam-sync-panel';div.innerHTML='<h2>Merkezi Veri Senkronizasyonu</h2><div style="font-size:12px;color:#64748b;font-weight:800">Telefon ve masaüstünün aynı veriyi görmesi için Supabase bağlantı testi, local veriyi buluta gönderme ve buluttan çekme merkezi.</div><div class="alkam-sync-actions"><button id="alkamSyncTest">Bağlantı Testi</button><button class="green" id="alkamSyncPush">Bu Cihazdaki Veriyi Buluta Gönder</button><button class="orange" id="alkamSyncPull">Buluttaki Veriyi Bu Cihaza Çek</button></div><div id="alkamSyncResult"></div>';root.insertBefore(div,root.firstChild);q('#alkamSyncTest',div).onclick=function(){test().then(paint)};q('#alkamSyncPush',div).onclick=function(){if(confirm('Bu cihazdaki local veriler Supabase tablolarına gönderilecek. Devam?'))pushAll().then(paint)};q('#alkamSyncPull',div).onclick=function(){if(confirm('Bu cihazdaki local veriler buluttaki verilerle değiştirilecek. Devam?'))pullAll().then(paint)};paint()}
function paint(data){var box=q('#alkamSyncResult');if(!box)return;var c=counts();var last=data||window.__ALKAM_SUPABASE_SYNC_LAST||window.__ALKAM_SUPABASE_SYNC_TEST;box.innerHTML=(last?'<div style="font-weight:950;margin:8px 0">Sonuç: '+(last.ok===false?'Hata':'Tamam')+' '+(last.reason||last.mode||'')+'</div>':'')+'<table class="alkam-sync-table"><thead><tr><th>Local</th><th>Supabase Tablo</th><th>Bu Cihaz Kayıt</th></tr></thead><tbody>'+c.map(function(x){return '<tr><td>'+x.local+'</td><td>'+x.remote+'</td><td><b>'+x.count+'</b></td></tr>'}).join('')+'</tbody></table>'}
function boot(){render();document.addEventListener('click',function(){setTimeout(render,200);setTimeout(paint,250)},true)}
window.ALKAM_SUPABASE_SYNC_V1={version:VERSION,test:test,pushAll:pushAll,pullAll:pullAll,counts:counts,render:render};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();