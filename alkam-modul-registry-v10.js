(function(){
  'use strict';
  var VERSION='ALKAM Modül Registry v10.0';
  var MODULES=[
    ['ALKAM_RELIABILITY_GUARD','Reliability Guard','Yedek / geri dönüş'],
    ['ALKAM_CARI_CORE_V4','Cari Core','Cari ekstre çekirdeği'],
    ['ALKAM_LAST_AMOUNTS_V4G','Son Tutarlar','Son tahakkuk / tahsilat'],
    ['ALKAM_DATA_QUALITY','Data Quality','Veri kalite kontrolü'],
    ['ALKAM_TAHAKKUK_V5','Tahakkuk','Muhasebe ücreti tahakkuk'],
    ['ALKAM_TAHAKKUK_CONTROL_V5C','Tahakkuk Kontrol','Tahakkuk doğrulama'],
    ['ALKAM_BALANCE_HIGHLIGHT_V1','Bakiye Vurgusu','Son bakiye görünümü'],
    ['ALKAM_PROFESSIONAL_UI_V1','Professional UI','Yönetici görünümü'],
    ['ALKAM_FINANS_FLOW_V6','Finans Flow','Banka/kasa/moka/çek/senet'],
    ['ALKAM_FINANS_UI_V6','Finans UI','Finans özeti'],
    ['ALKAM_TAHSILAT_V7','Tahsilat','Güvenli tahsilat çekirdeği'],
    ['ALKAM_TAHSILAT_UI_V7','Tahsilat UI','Tahsilat giriş ekranı'],
    ['ALKAM_MOKA_UI_V6','Moka UI','Moka → Banka aktarımı'],
    ['ALKAM_BANKA_ONAY_V8','Banka Onay','Banka onay çekirdeği'],
    ['ALKAM_BANKA_ONAY_UI_V8','Banka Onay UI','Onay merkezi ekranı'],
    ['ALKAM_BANKA_IMPORT_UI_V8','Banka Import UI','Kopyala/yapıştır içe aktarım'],
    ['ALKAM_BANKA_FILE_IMPORT_V8','Banka Dosya Import','CSV/TXT dosya okuma'],
    ['ALKAM_BANKA_IMPORT_GUARD_V8','Banka Import Guard','Satır validasyonu'],
    ['ALKAM_BANKA_IMPORT_ERRORS_V8','Banka Import Hataları','Hatalı satır tablosu'],
    ['ALKAM_BANKA_TEMPLATE_V8','Banka Şablon','CSV şablonu'],
    ['ALKAM_BANKA_HISTORY_V8','Banka Geçmiş','İşlenen/reddedilen geçmişi'],
    ['ALKAM_BANKA_HISTORY_EXPORT_V8','Banka Geçmiş Export','CSV dışa aktarım'],
    ['ALKAM_GUVENILIRLIK_RAPORU_V9','Güvenilirlik Raporu','Genel güvenilirlik ekranı'],
    ['ALKAM_GUVENILIRLIK_EXPORT_V9','Güvenilirlik Export','CSV/PDF dışa aktarım'],
    ['ALKAM_KRITIK_UYARI_V9','Kritik Uyarı','Teknik uyarı kaynağı'],
    ['ALKAM_SAGLIK_KONTROL_V9','Sağlık Kontrol','Başlangıç sağlık kontrolü'],
    ['ALKAM_GUNLUK_KONTROL_V9','Günlük Kontrol','Günlük skor geçmişi'],
    ['ALKAM_TEK_KONTROL_ROZETI_V9','Tek Kontrol Rozeti','Ana ekran tek rozet'],
    ['ALKAM_GUNLUK_KONTROL_EXPORT_V9','Günlük Kontrol Export','Günlük skor CSV']
  ];
  function q(s,r){return (r||document).querySelector(s)}
  function css(){
    if(q('#alkam-modul-registry-style'))return;
    var st=document.createElement('style');st.id='alkam-modul-registry-style';
    st.textContent='.alkam-module-modal{position:fixed;inset:0;z-index:1000008;background:rgba(15,23,42,.42);display:none;align-items:center;justify-content:center;padding:18px}.alkam-module-modal.open{display:flex}.alkam-module-box{width:min(1050px,100%);max-height:90vh;background:#fff;border-radius:20px;border:1px solid #dbe4f0;box-shadow:0 30px 80px rgba(15,23,42,.32);font-family:Arial,Helvetica,sans-serif;overflow:hidden}.alkam-module-head{padding:16px 18px;background:linear-gradient(180deg,#f8fbff,#fff);border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;gap:10px}.alkam-module-head b{font-size:18px;color:#0f172a}.alkam-module-head small{display:block;margin-top:4px;color:#64748b;font-weight:800}.alkam-module-close{width:34px;height:34px;border:0;border-radius:10px;background:#e8eef9;font-weight:950;cursor:pointer}.alkam-module-body{padding:16px 18px;overflow:auto;max-height:calc(90vh - 72px)}.alkam-module-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:14px}.alkam-module-card{border:1px solid #e2e8f0;background:#fbfdff;border-radius:14px;padding:12px}.alkam-module-card b{display:block;font-size:11px;color:#64748b;text-transform:uppercase}.alkam-module-card span{display:block;margin-top:6px;font-size:20px;font-weight:950;color:#0f172a}.alkam-module-table{border:1px solid #e2e8f0;border-radius:14px;overflow:hidden}.alkam-module-table table{width:100%;border-collapse:collapse}.alkam-module-table th{background:#f8fafc;color:#64748b;font-size:11px;text-transform:uppercase;text-align:left;padding:9px}.alkam-module-table td{border-top:1px solid #eef2f7;padding:9px;font-size:12px;font-weight:800}.alkam-module-ok{color:#047857;font-weight:950}.alkam-module-no{color:#b91c1c;font-weight:950}.alkam-module-actions{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}.alkam-module-actions button{height:34px;border:0;border-radius:10px;background:#1769e8;color:#fff;font-weight:950;padding:0 10px;cursor:pointer}.alkam-module-actions button.secondary{background:#e8eef9;color:#0f172a}@media(max-width:900px){.alkam-module-grid{grid-template-columns:1fr}.alkam-module-table{overflow:auto}.alkam-module-table table{min-width:780px}}';
    document.head.appendChild(st);
  }
  function scan(){
    var rows=MODULES.map(function(m){var obj=window[m[0]];return {key:m[0],name:m[1],desc:m[2],active:!!obj,version:obj&&(obj.version||obj.VERSION)||'-'}});
    var active=rows.filter(function(x){return x.active}).length;
    var missing=rows.length-active;
    return {version:VERSION,total:rows.length,active:active,missing:missing,rows:rows,time:new Date().toISOString()};
  }
  function modal(){
    var el=q('#alkamModuleRegistryModal'); if(el)return el;
    el=document.createElement('div'); el.id='alkamModuleRegistryModal'; el.className='alkam-module-modal';
    el.innerHTML='<div class="alkam-module-box"><div class="alkam-module-head"><div><b>Modül Registry / Sürüm Paneli</b><small>Sistemde yüklü modüller, sürümler ve eksik kontroller tek tabloda.</small></div><button class="alkam-module-close">×</button></div><div class="alkam-module-body" id="alkamModuleRegistryBody"></div></div>';
    document.body.appendChild(el);
    q('.alkam-module-close',el).onclick=function(){el.classList.remove('open')};
    return el;
  }
  function render(){
    css(); var el=modal(); var body=q('#alkamModuleRegistryBody',el); var s=scan();
    body.innerHTML='<div class="alkam-module-actions"><button onclick="window.ALKAM_MODUL_REGISTRY_V10&&ALKAM_MODUL_REGISTRY_V10.render()">Yenile</button><button class="secondary" onclick="window.ALKAM_MODUL_REGISTRY_V10&&ALKAM_MODUL_REGISTRY_V10.downloadCsv()">CSV İndir</button></div><div class="alkam-module-grid"><div class="alkam-module-card"><b>Toplam Modül</b><span>'+s.total+'</span></div><div class="alkam-module-card"><b>Aktif</b><span>'+s.active+'</span></div><div class="alkam-module-card"><b>Eksik</b><span>'+s.missing+'</span></div><div class="alkam-module-card"><b>Durum</b><span>'+(s.missing?'Uyarı':'Tam')+'</span></div></div><div class="alkam-module-table"><table><thead><tr><th>Durum</th><th>Modül</th><th>Sürüm</th><th>Açıklama</th><th>Global Key</th></tr></thead><tbody>'+s.rows.map(function(r){return '<tr><td class="'+(r.active?'alkam-module-ok':'alkam-module-no')+'">'+(r.active?'Aktif':'Eksik')+'</td><td>'+r.name+'</td><td>'+r.version+'</td><td>'+r.desc+'</td><td>'+r.key+'</td></tr>'}).join('')+'</tbody></table></div>';
    window.__ALKAM_MODUL_REGISTRY_LAST=s; return s;
  }
  function open(){css();modal().classList.add('open');render()}
  function csvEscape(v){return '"'+String(v==null?'':v).replace(/"/g,'""')+'"'}
  function downloadCsv(){
    var s=scan(); var rows=[['Durum','Modül','Sürüm','Açıklama','Global Key']].concat(s.rows.map(function(r){return [r.active?'Aktif':'Eksik',r.name,r.version,r.desc,r.key]}));
    var csv=rows.map(function(r){return r.map(csvEscape).join(';')}).join('\n');
    var blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}); var url=URL.createObjectURL(blob); var a=document.createElement('a');
    a.href=url; a.download='alkam_modul_registry.csv'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){URL.revokeObjectURL(url)},500);
    return {ok:true,file:'alkam_modul_registry.csv',rows:s.rows.length};
  }
  function addButtons(){
    var bar=q('#alkamActionBar'); if(bar&&!q('#alkamABModuleRegistry',bar)){var b=document.createElement('button');b.id='alkamABModuleRegistry';b.type='button';b.textContent='Modüller';b.onclick=open;bar.appendChild(b)}
    var body=q('#alkamProfessionalDrawer .alkam-drawer-body'); if(body&&!q('#alkamModuleRegistryCard',body)){var s=scan();body.insertAdjacentHTML('beforeend','<div class="alkam-control-card" id="alkamModuleRegistryCard"><b>Modül Registry</b><div class="line">Aktif: '+s.active+'/'+s.total+' · Eksik: '+s.missing+'</div><div class="alkam-drawer-actions"><button onclick="window.ALKAM_MODUL_REGISTRY_V10&&ALKAM_MODUL_REGISTRY_V10.open()">Modülleri Aç</button></div></div>')}
  }
  function run(){css();setTimeout(function(){render();addButtons()},1500)}
  window.ALKAM_MODUL_REGISTRY_V10={version:VERSION,scan:scan,open:open,render:render,downloadCsv:downloadCsv,run:run,last:function(){return window.__ALKAM_MODUL_REGISTRY_LAST||scan()},test:function(){var s=scan();return {version:VERSION,modal:!!q('#alkamModuleRegistryModal'),actionButton:!!q('#alkamABModuleRegistry'),drawerCard:!!q('#alkamModuleRegistryCard'),active:s.active,total:s.total,missing:s.missing,time:new Date().toISOString()}}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
  setInterval(addButtons,3000);
})();
