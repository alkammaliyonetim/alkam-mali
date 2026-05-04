(function(){
  'use strict';
  var VERSION='ALKAM System Manifest v10.1';
  var MANIFEST={
    app:'ALKAM MALİ İstasyON',
    build:'v10.1',
    date:new Date().toISOString(),
    principles:[
      'Cari ekstresi ana kayıt/ana defterdir.',
      'Banka hareketleri doğrulama ve onay katmanıdır.',
      'Onaysız banka hareketi cari/finans kayıtlarına işlenmez.',
      'Moka United bankaya aktarımı cari tahsilatı sayılmaz.',
      'Tahakkuk ve tahsilat öncesi yedek alınır.',
      'Mükerrer kayıt engellenir.',
      'Emin olunmayan işlemler onaya düşer.',
      'Önceki özellikler kullanıcı onayı olmadan silinmez.',
      '2026 Geçiş kavramı/sekmesi kullanılmaz.'
    ],
    areas:{
      core:['Cari Core','Son Tutarlar','Bakiye B/A','Müşteri Ekstresi'],
      finance:['Banka','Kasa','Moka United','Çek','Senet'],
      bank:['Banka İçe Aktarım','Onay Merkezi','Geçmiş','Dışa Aktarım'],
      reliability:['Reliability Guard','Data Quality','Güvenilirlik Raporu','Sağlık Kontrol','Günlük Kontrol','Modül Registry'],
      ui:['Professional UI','Tek Kontrol Rozeti','Action Bar','Kontrol Merkezi']
    },
    next:['Patch dosyalarını core/ui/finance/bank/reliability klasör mantığına taşımak','Supabase kalıcı veri katmanı','Yetkili kullanıcı sistemi','Luca veri aktarım merkezi','Mükellef dijital kartı v1']
  };
  function q(s,r){return (r||document).querySelector(s)}
  function css(){
    if(q('#alkam-system-manifest-style'))return;
    var st=document.createElement('style');st.id='alkam-system-manifest-style';
    st.textContent='.alkam-manifest-modal{position:fixed;inset:0;z-index:1000009;background:rgba(15,23,42,.42);display:none;align-items:center;justify-content:center;padding:18px}.alkam-manifest-modal.open{display:flex}.alkam-manifest-box{width:min(980px,100%);max-height:90vh;background:#fff;border-radius:20px;border:1px solid #dbe4f0;box-shadow:0 30px 80px rgba(15,23,42,.32);font-family:Arial,Helvetica,sans-serif;overflow:hidden}.alkam-manifest-head{padding:16px 18px;background:linear-gradient(180deg,#f8fbff,#fff);border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between}.alkam-manifest-head b{font-size:18px;color:#0f172a}.alkam-manifest-head small{display:block;margin-top:4px;color:#64748b;font-weight:800}.alkam-manifest-close{width:34px;height:34px;border:0;border-radius:10px;background:#e8eef9;font-weight:950;cursor:pointer}.alkam-manifest-body{padding:16px 18px;overflow:auto;max-height:calc(90vh - 72px)}.alkam-manifest-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.alkam-manifest-card{border:1px solid #e2e8f0;border-radius:14px;background:#fbfdff;padding:12px}.alkam-manifest-card h4{margin:0 0 8px;color:#0f172a}.alkam-manifest-card ul{margin:0;padding-left:18px}.alkam-manifest-card li{font-size:12px;font-weight:800;color:#334155;margin:5px 0;line-height:1.4}.alkam-manifest-actions{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}.alkam-manifest-actions button{height:34px;border:0;border-radius:10px;background:#1769e8;color:#fff;font-weight:950;padding:0 10px;cursor:pointer}.alkam-manifest-actions button.secondary{background:#e8eef9;color:#0f172a}@media(max-width:900px){.alkam-manifest-grid{grid-template-columns:1fr}}';
    document.head.appendChild(st);
  }
  function csvEscape(v){return '"'+String(v==null?'':v).replace(/"/g,'""')+'"'}
  function downloadCsv(){
    var rows=[['Alan','Değer']];
    rows.push(['App',MANIFEST.app]); rows.push(['Build',MANIFEST.build]);
    MANIFEST.principles.forEach(function(x,i){rows.push(['Kural '+(i+1),x])});
    Object.keys(MANIFEST.areas).forEach(function(k){rows.push(['Alan: '+k,MANIFEST.areas[k].join(', ')])});
    MANIFEST.next.forEach(function(x,i){rows.push(['Sıradaki '+(i+1),x])});
    var csv=rows.map(function(r){return r.map(csvEscape).join(';')}).join('\n');
    var blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}); var url=URL.createObjectURL(blob); var a=document.createElement('a');
    a.href=url; a.download='alkam_system_manifest.csv'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){URL.revokeObjectURL(url)},500);
    return {ok:true,file:'alkam_system_manifest.csv',rows:rows.length};
  }
  function modal(){
    var el=q('#alkamSystemManifestModal'); if(el)return el;
    el=document.createElement('div'); el.id='alkamSystemManifestModal'; el.className='alkam-manifest-modal';
    el.innerHTML='<div class="alkam-manifest-box"><div class="alkam-manifest-head"><div><b>Sistem Manifestosu</b><small>Ana kurallar, modül alanları ve sıradaki mimari yol haritası.</small></div><button class="alkam-manifest-close">×</button></div><div class="alkam-manifest-body" id="alkamManifestBody"></div></div>';
    document.body.appendChild(el); q('.alkam-manifest-close',el).onclick=function(){el.classList.remove('open')}; return el;
  }
  function render(){
    css(); var el=modal(); var body=q('#alkamManifestBody',el);
    function ul(arr){return '<ul>'+arr.map(function(x){return '<li>'+x+'</li>'}).join('')+'</ul>'}
    var areas=Object.keys(MANIFEST.areas).map(function(k){return '<div class="alkam-manifest-card"><h4>'+k.toUpperCase()+'</h4>'+ul(MANIFEST.areas[k])+'</div>'}).join('');
    body.innerHTML='<div class="alkam-manifest-actions"><button onclick="window.ALKAM_SYSTEM_MANIFEST_V10&&ALKAM_SYSTEM_MANIFEST_V10.downloadCsv()">CSV İndir</button><button class="secondary" onclick="window.ALKAM_MODUL_REGISTRY_V10&&ALKAM_MODUL_REGISTRY_V10.open()">Modülleri Aç</button></div><div class="alkam-manifest-grid"><div class="alkam-manifest-card"><h4>Değişmez Kurallar</h4>'+ul(MANIFEST.principles)+'</div><div class="alkam-manifest-card"><h4>Sıradaki Mimari İşler</h4>'+ul(MANIFEST.next)+'</div>'+areas+'</div>';
    return MANIFEST;
  }
  function open(){css();modal().classList.add('open');render()}
  function addButtons(){
    var bar=q('#alkamActionBar'); if(bar&&!q('#alkamABManifest',bar)){var b=document.createElement('button');b.id='alkamABManifest';b.type='button';b.textContent='Manifest';b.onclick=open;bar.appendChild(b)}
    var body=q('#alkamProfessionalDrawer .alkam-drawer-body'); if(body&&!q('#alkamManifestCard',body)){body.insertAdjacentHTML('beforeend','<div class="alkam-control-card" id="alkamManifestCard"><b>Sistem Manifestosu</b><div class="line">Değişmez kurallar ve modül yol haritası.</div><div class="alkam-drawer-actions"><button onclick="window.ALKAM_SYSTEM_MANIFEST_V10&&ALKAM_SYSTEM_MANIFEST_V10.open()">Manifesti Aç</button></div></div>')}
  }
  function run(){css();setTimeout(function(){addButtons();render()},1800)}
  window.ALKAM_SYSTEM_MANIFEST_V10={version:VERSION,manifest:MANIFEST,open:open,render:render,downloadCsv:downloadCsv,run:run,test:function(){return {version:VERSION,modal:!!q('#alkamSystemManifestModal'),actionButton:!!q('#alkamABManifest'),drawerCard:!!q('#alkamManifestCard'),rules:MANIFEST.principles.length,time:new Date().toISOString()}}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
  setInterval(addButtons,3000);
})();
