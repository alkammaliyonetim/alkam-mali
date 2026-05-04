(function(){
  'use strict';
  var VERSION='ALKAM Banka File Import v8.3';
  function q(s,r){return (r||document).querySelector(s)}
  function parseText(text){
    if(window.ALKAM_BANKA_IMPORT_UI_V8&&ALKAM_BANKA_IMPORT_UI_V8.parseLines)return ALKAM_BANKA_IMPORT_UI_V8.parseLines(text);
    return String(text||'').split(/\r?\n/).map(function(line){var p=line.split(';');return p.length>=3?{tarih:p[0],aciklama:p.slice(1,p.length-1).join(' '),tutar:p[p.length-1]}:null}).filter(Boolean);
  }
  function css(){
    if(q('#alkam-banka-file-style'))return;
    var st=document.createElement('style');st.id='alkam-banka-file-style';
    st.textContent='.alkam-bank-file-row{margin-top:10px;padding:10px;border:1px dashed #bfdbfe;border-radius:12px;background:#eff6ff}.alkam-bank-file-row input{width:100%;font-size:12px;font-weight:900}.alkam-bank-file-row small{display:block;margin-top:6px;color:#1e3a8a;font-weight:900}';
    document.head.appendChild(st);
  }
  function enhanceModal(){
    var modal=q('#alkamBankImportModal'); if(!modal||q('#alkamBankFileRow',modal))return;
    var body=q('.alkam-bank-import-body',modal); if(!body)return;
    var row=document.createElement('div');row.id='alkamBankFileRow';row.className='alkam-bank-file-row';
    row.innerHTML='<input id="alkamBankFileInput" type="file" accept=".csv,.txt"><small>CSV/TXT dosyası seçersen içeriği otomatik okur ve metin alanına basar. Excel için şimdilik Excel’den kopyala-yapıştır daha güvenli.</small>';
    var textarea=q('#alkamBankImportText',modal); if(textarea&&textarea.parentNode)textarea.parentNode.insertBefore(row,textarea); else body.appendChild(row);
    q('#alkamBankFileInput',row).onchange=function(){var f=this.files&&this.files[0]; if(!f)return; var reader=new FileReader(); reader.onload=function(){var txt=String(reader.result||''); var ta=q('#alkamBankImportText',modal); if(ta)ta.value=txt; var res=q('#alkamBankImportResult',modal); if(res){var rows=parseText(txt);res.className='alkam-bank-import-result';res.textContent='Dosya okundu: '+rows.length+' satır önizleme hazır.'}}; reader.readAsText(f,'utf-8')};
  }
  function run(){css();enhanceModal()}
  window.ALKAM_BANKA_FILE_IMPORT_V8={version:VERSION,run:run,test:function(){return {version:VERSION,modal:!!q('#alkamBankImportModal'),fileInput:!!q('#alkamBankFileInput'),time:new Date().toISOString()}}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
  setInterval(enhanceModal,2000);
})();
