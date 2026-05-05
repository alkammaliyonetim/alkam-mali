(function(){
  'use strict';
  var VERSION='ALKAM Tahsilat UI v7.2 STABLE';
  function q(s,r){return (r||document).querySelector(s)}
  function readJson(k){try{return JSON.parse(localStorage.getItem(k)||'[]')}catch(e){return []}}
  function unique(arr){var seen={};return arr.filter(function(x){var k=String(x.id||x.value||x.ad||x.name||x).toLowerCase();if(!k||seen[k])return false;seen[k]=1;return true})}
  function accountList(){
    var out=[];
    if(window.ALKAM_FINANS_FLOW_V6&&ALKAM_FINANS_FLOW_V6.accounts){out=out.concat(ALKAM_FINANS_FLOW_V6.accounts())}
    ['alkam_finans_hesaplari','alkam_hesaplar','alkam_bankalar','alkam_kasalar'].forEach(function(k){var a=readJson(k);if(Array.isArray(a))out=out.concat(a)});
    out=out.concat([{id:'banka',ad:'Banka',tip:'Banka'},{id:'kasa',ad:'Kasa',tip:'Kasa'},{id:'moka',ad:'Moka United',tip:'Ara Hesap'},{id:'cek',ad:'Çek',tip:'Çek'},{id:'senet',ad:'Senet',tip:'Senet'},{id:'pos',ad:'Kredi Kartı / POS',tip:'POS'},{id:'diger',ad:'Diğer',tip:'Diğer'}]);
    return unique(out).map(function(a){return {id:String(a.id||a.kod||a.ad||a.name),ad:String(a.ad||a.name||a.hesap_adi||a.title||a.id||a),tip:a.tip||a.type||''}});
  }
  function m(n){return new Intl.NumberFormat('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(Math.abs(Number(n||0)))+' TL'}
  function css(){
    if(q('#alkam-tahsilat-ui-style'))return;
    var st=document.createElement('style');st.id='alkam-tahsilat-ui-style';
    st.textContent='.alkam-tahsilat-modal{position:fixed;inset:0;z-index:1000000;background:rgba(15,23,42,.42);display:none;align-items:center;justify-content:center;padding:18px}.alkam-tahsilat-modal.open{display:flex}.alkam-tahsilat-box{width:min(520px,100%);background:#fff;border-radius:20px;border:1px solid #dbe4f0;box-shadow:0 30px 80px rgba(15,23,42,.32);font-family:Arial,Helvetica,sans-serif;overflow:hidden}.alkam-tahsilat-head{padding:16px 18px;background:linear-gradient(180deg,#f8fbff,#fff);border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;gap:10px}.alkam-tahsilat-head b{font-size:18px;color:#0f172a}.alkam-tahsilat-head small{display:block;margin-top:4px;color:#64748b;font-weight:800}.alkam-tahsilat-close{width:34px;height:34px;border:0;border-radius:10px;background:#e8eef9;font-weight:950;cursor:pointer}.alkam-tahsilat-body{padding:16px 18px}.alkam-tahsilat-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.alkam-tahsilat-field label{display:block;font-size:11px;font-weight:950;color:#64748b;margin-bottom:5px;text-transform:uppercase}.alkam-tahsilat-field input,.alkam-tahsilat-field select{width:100%;height:38px;border:1px solid #cbd5e1;border-radius:11px;padding:0 10px;font-weight:900;box-sizing:border-box}.alkam-tahsilat-field.full{grid-column:1/-1}.alkam-tahsilat-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:14px}.alkam-tahsilat-actions button{height:36px;border:0;border-radius:11px;padding:0 12px;font-weight:950;cursor:pointer;background:#1769e8;color:#fff}.alkam-tahsilat-actions button.secondary{background:#e8eef9;color:#0f172a}.alkam-tahsilat-result{margin-top:10px;font-size:12px;font-weight:900;color:#047857}.alkam-tahsilat-result.err{color:#b91c1c}.alkam-tahsilat-note{margin-top:8px;padding:8px 10px;border:1px solid #bfdbfe;background:#eff6ff;color:#1e3a8a;border-radius:10px;font-size:11px;font-weight:900}@media(max-width:700px){.alkam-tahsilat-grid{grid-template-columns:1fr}}';
    document.head.appendChild(st);
  }
  function fillAccounts(el){
    var sel=q('#alkamTahsilatHesap',el); if(!sel)return;
    var current=sel.value||'banka'; sel.innerHTML='';
    accountList().forEach(function(a){var opt=document.createElement('option');opt.value=a.id;opt.textContent=a.ad+(a.tip?' · '+a.tip:'');sel.appendChild(opt)});
    if([].slice.call(sel.options).some(function(o){return o.value===current}))sel.value=current;
  }
  function modal(){
    var el=q('#alkamTahsilatModal');
    if(el){fillAccounts(el);return el}
    el=document.createElement('div'); el.id='alkamTahsilatModal'; el.className='alkam-tahsilat-modal';
    el.innerHTML='<div class="alkam-tahsilat-box"><div class="alkam-tahsilat-head"><div><b>Tahsilat Gir</b><small>Cari defter ve finans hesabı aynı işlemde oluşur.</small></div><button class="alkam-tahsilat-close">×</button></div><div class="alkam-tahsilat-body"><div class="alkam-tahsilat-grid"><div class="alkam-tahsilat-field"><label>Tutar</label><input id="alkamTahsilatTutar" type="number" step="0.01" placeholder="0,00"></div><div class="alkam-tahsilat-field"><label>Hesap</label><select id="alkamTahsilatHesap"></select></div><div class="alkam-tahsilat-field"><label>Tarih</label><input id="alkamTahsilatTarih" type="date"></div><div class="alkam-tahsilat-field"><label>Kaynak</label><select id="alkamTahsilatKaynak"><option>Tahsilat - banka</option><option>Tahsilat - kasa</option><option>Tahsilat - moka</option><option>Manuel Tahsilat</option></select></div><div class="alkam-tahsilat-field full"><label>Açıklama</label><input id="alkamTahsilatAciklama" placeholder="Cari tahsilatı"></div></div><div class="alkam-tahsilat-note">İşlem standardı: tahsilat kaydı + cari defter alacak satırı + seçilen finans hesabı hareketi birlikte oluşur.</div><div class="alkam-tahsilat-actions"><button class="secondary" id="alkamTahsilatCancel">Vazgeç</button><button id="alkamTahsilatSave">Yedek Al ve İşle</button></div><div id="alkamTahsilatResult" class="alkam-tahsilat-result"></div></div></div>';
    document.body.appendChild(el);
    q('.alkam-tahsilat-close',el).onclick=function(){el.classList.remove('open')};
    q('#alkamTahsilatCancel',el).onclick=function(){el.classList.remove('open')};
    q('#alkamTahsilatTarih',el).value=new Date().toISOString().slice(0,10);
    fillAccounts(el);
    q('#alkamTahsilatHesap',el).onchange=function(){q('#alkamTahsilatKaynak',el).value='Tahsilat - '+this.value};
    q('#alkamTahsilatSave',el).onclick=save;
    return el;
  }
  function save(){
    var el=modal(); var res=q('#alkamTahsilatResult',el); res.className='alkam-tahsilat-result'; res.textContent='İşleniyor...';
    if(!window.ALKAM_TAHSILAT_V7||!ALKAM_TAHSILAT_V7.collect){res.className+=' err';res.textContent='Tahsilat çekirdeği hazır değil.';return}
    var out=ALKAM_TAHSILAT_V7.collect({tutar:q('#alkamTahsilatTutar',el).value,hesap:q('#alkamTahsilatHesap',el).value,tarih:q('#alkamTahsilatTarih',el).value,kaynak:q('#alkamTahsilatKaynak',el).value,aciklama:q('#alkamTahsilatAciklama',el).value||'Cari tahsilatı'});
    if(out.ok){
      try{if(window.renderCariler)window.renderCariler()}catch(e){}
      try{if(window.renderDashboard)window.renderDashboard()}catch(e){}
      try{if(window.ALKAM_FINANS_UI_V6&&ALKAM_FINANS_UI_V6.render)ALKAM_FINANS_UI_V6.render()}catch(e){}
      res.textContent='Tahsilat işlendi: '+m(out.item.tutar)+' · Cari defter ve finans hareketi oluşturuldu.';
      setTimeout(function(){el.classList.remove('open')},900)
    } else {res.className+=' err';res.textContent=out.reason||'İşlem başarısız'}
  }
  function open(){css();var el=modal();q('#alkamTahsilatResult',el).textContent='';fillAccounts(el);el.classList.add('open');setTimeout(function(){q('#alkamTahsilatTutar',el).focus()},100)}
  function addButton(){
    var bar=q('#alkamActionBar'); if(!bar||q('#alkamABTahsilat',bar))return;
    var btn=document.createElement('button');btn.id='alkamABTahsilat';btn.type='button';btn.className='primary';btn.textContent='Tahsilat Gir';btn.onclick=open;
    var first=bar.firstElementChild; if(first)bar.insertBefore(btn,first.nextSibling); else bar.appendChild(btn);
  }
  function run(){css();modal();addButton()}
  window.ALKAM_TAHSILAT_UI_V7={version:VERSION,open:open,run:run,accounts:accountList,test:function(){return {version:VERSION,modal:!!q('#alkamTahsilatModal'),button:!!q('#alkamABTahsilat'),core:!!window.ALKAM_TAHSILAT_V7,accounts:accountList().length,time:new Date().toISOString()}}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
  setInterval(addButton,2000);
})();
