(function(){
  'use strict';
  var VERSION='ALKAM Banka Import UI v8.2';
  function q(s,r){return (r||document).querySelector(s)}
  function css(){
    if(q('#alkam-banka-import-ui-style'))return;
    var st=document.createElement('style');st.id='alkam-banka-import-ui-style';
    st.textContent='.alkam-bank-import-modal{position:fixed;inset:0;z-index:1000003;background:rgba(15,23,42,.42);display:none;align-items:center;justify-content:center;padding:18px}.alkam-bank-import-modal.open{display:flex}.alkam-bank-import-box{width:min(820px,100%);max-height:88vh;background:#fff;border-radius:20px;border:1px solid #dbe4f0;box-shadow:0 30px 80px rgba(15,23,42,.32);font-family:Arial,Helvetica,sans-serif;overflow:hidden}.alkam-bank-import-head{padding:16px 18px;background:linear-gradient(180deg,#f8fbff,#fff);border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;gap:10px}.alkam-bank-import-head b{font-size:18px;color:#0f172a}.alkam-bank-import-head small{display:block;margin-top:4px;color:#64748b;font-weight:800}.alkam-bank-import-close{width:34px;height:34px;border:0;border-radius:10px;background:#e8eef9;font-weight:950;cursor:pointer}.alkam-bank-import-body{padding:16px 18px;overflow:auto;max-height:calc(88vh - 72px)}.alkam-bank-import-note{background:#eff6ff;border:1px solid #bfdbfe;color:#1e3a8a;border-radius:12px;padding:10px;font-size:12px;font-weight:900;line-height:1.5;margin-bottom:12px}.alkam-bank-import-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px}.alkam-bank-import-field label{display:block;font-size:11px;font-weight:950;color:#64748b;margin-bottom:5px;text-transform:uppercase}.alkam-bank-import-field input,.alkam-bank-import-field select{width:100%;height:38px;border:1px solid #cbd5e1;border-radius:11px;padding:0 10px;font-weight:900;box-sizing:border-box}.alkam-bank-import-body textarea{width:100%;min-height:220px;border:1px solid #cbd5e1;border-radius:14px;padding:12px;font-family:ui-monospace,Consolas,monospace;font-size:12px;box-sizing:border-box}.alkam-bank-import-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:12px}.alkam-bank-import-actions button{height:36px;border:0;border-radius:11px;padding:0 12px;font-weight:950;cursor:pointer;background:#1769e8;color:#fff}.alkam-bank-import-actions button.secondary{background:#e8eef9;color:#0f172a}.alkam-bank-import-result{margin-top:10px;font-size:12px;font-weight:900;color:#047857}.alkam-bank-import-result.err{color:#b91c1c}@media(max-width:700px){.alkam-bank-import-grid{grid-template-columns:1fr}}';
    document.head.appendChild(st);
  }
  function parseLines(text){
    var lines=String(text||'').split(/\r?\n/).map(function(x){return x.trim()}).filter(Boolean);
    var out=[];
    lines.forEach(function(line,idx){
      var sep=line.indexOf(';')>-1?';':(line.indexOf('\t')>-1?'\t':',');
      var p=line.split(sep).map(function(x){return x.trim()});
      if(idx===0 && /tarih|date|açıklama|aciklama|tutar/i.test(line))return;
      if(p.length<3)return;
      out.push({tarih:p[0],aciklama:p.slice(1,p.length-1).join(' '),tutar:p[p.length-1]});
    });
    return out;
  }
  function modal(){
    var el=q('#alkamBankImportModal'); if(el)return el;
    el=document.createElement('div'); el.id='alkamBankImportModal'; el.className='alkam-bank-import-modal';
    el.innerHTML='<div class="alkam-bank-import-box"><div class="alkam-bank-import-head"><div><b>Banka Hareketi İçe Aktar</b><small>Satırlar önce onaya düşer, otomatik işlenmez.</small></div><button class="alkam-bank-import-close">×</button></div><div class="alkam-bank-import-body"><div class="alkam-bank-import-note">Format: Tarih ; Açıklama ; Tutar. Excel’den kopyalayıp buraya yapıştırabilirsin. Mükerrer satırlar engellenir.</div><div class="alkam-bank-import-grid"><div class="alkam-bank-import-field"><label>Kaynak</label><input id="alkamBankImportSource" value="Halkbank Excel"></div><div class="alkam-bank-import-field"><label>Ayırıcı</label><select id="alkamBankImportSep"><option>Otomatik</option><option>;</option><option>Tab</option><option>,</option></select></div></div><textarea id="alkamBankImportText" placeholder="2026-05-04; Müşteri tahsilatı açıklaması; 15000"></textarea><div class="alkam-bank-import-actions"><button class="secondary" id="alkamBankImportCancel">Vazgeç</button><button id="alkamBankImportPreview">Önizle</button><button id="alkamBankImportSave">Onaya Gönder</button></div><div id="alkamBankImportResult" class="alkam-bank-import-result"></div></div></div>';
    document.body.appendChild(el);
    q('.alkam-bank-import-close',el).onclick=function(){el.classList.remove('open')};
    q('#alkamBankImportCancel',el).onclick=function(){el.classList.remove('open')};
    q('#alkamBankImportPreview',el).onclick=function(){var rows=parseLines(q('#alkamBankImportText',el).value);q('#alkamBankImportResult',el).className='alkam-bank-import-result';q('#alkamBankImportResult',el).textContent='Önizleme: '+rows.length+' satır okunacak.'};
    q('#alkamBankImportSave',el).onclick=save;
    return el;
  }
  function save(){
    var el=modal(); var res=q('#alkamBankImportResult',el); res.className='alkam-bank-import-result';
    if(!window.ALKAM_BANKA_ONAY_V8||!ALKAM_BANKA_ONAY_V8.importRows){res.className+=' err';res.textContent='Banka onay çekirdeği hazır değil.';return}
    var rows=parseLines(q('#alkamBankImportText',el).value);
    if(!rows.length){res.className+=' err';res.textContent='Okunacak satır yok.';return}
    var out=ALKAM_BANKA_ONAY_V8.importRows(rows,q('#alkamBankImportSource',el).value||'Banka İçe Aktarım');
    if(out.ok){res.textContent='Onaya gönderildi: '+out.added+' satır · Mükerrer: '+out.duplicate+' · Onay bekleyen toplam: '+out.totalApproval; if(window.ALKAM_BANKA_ONAY_UI_V8&&ALKAM_BANKA_ONAY_UI_V8.render)setTimeout(function(){ALKAM_BANKA_ONAY_UI_V8.render()},200)}
    else{res.className+=' err';res.textContent=out.reason||'İşlem başarısız'}
  }
  function open(){css();modal().classList.add('open')}
  function addButton(){
    var bar=q('#alkamActionBar'); if(!bar||q('#alkamABBankaImport',bar))return;
    var btn=document.createElement('button');btn.id='alkamABBankaImport';btn.type='button';btn.textContent='Banka İçe Aktar';btn.onclick=open;
    bar.appendChild(btn);
  }
  function injectDrawer(){
    var body=q('#alkamProfessionalDrawer .alkam-drawer-body'); if(!body||q('#alkamBankImportCard',body))return;
    body.insertAdjacentHTML('beforeend','<div class="alkam-control-card" id="alkamBankImportCard"><b>Banka İçe Aktarım</b><div class="line">Excel/CSV satırları onaya gönderilir. Direkt işlenmez.</div><div class="alkam-drawer-actions"><button onclick="window.ALKAM_BANKA_IMPORT_UI_V8&&ALKAM_BANKA_IMPORT_UI_V8.open()">İçe Aktar</button></div></div>');
  }
  function run(){css();modal();addButton();injectDrawer()}
  window.ALKAM_BANKA_IMPORT_UI_V8={version:VERSION,open:open,parseLines:parseLines,run:run,test:function(){return {version:VERSION,modal:!!q('#alkamBankImportModal'),button:!!q('#alkamABBankaImport'),core:!!window.ALKAM_BANKA_ONAY_V8,time:new Date().toISOString()}}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
  setInterval(function(){addButton();injectDrawer()},2500);
})();
