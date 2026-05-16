// ALKAM Mali - Telegram Evrak Giriş Paneli v1
(function(){
  'use strict';
  if(window.__ALKAM_TELEGRAM_EVRAK_V1__) return;
  window.__ALKAM_TELEGRAM_EVRAK_V1__=true;
  const K='alkam_operation_suggestions_v1';
  const EV='alkam_telegram_evrak_v1';
  const R=(k)=>{try{return JSON.parse(localStorage.getItem(k)||'[]')}catch(e){return[]}};
  const W=(k,v)=>localStorage.setItem(k,JSON.stringify(v||[]));
  const E=x=>String(x||'').replace(/[&<>]/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[s]));
  const N=v=>{let s=String(v||'').replace(/\s/g,'').replace(/TL|₺/gi,'');if(s.includes(',')&&s.includes('.'))s=s.replace(/\./g,'').replace(',','.');else if(s.includes(','))s=s.replace(',','.');return Number(s)||0};
  function guessType(t,doc){t=String(t||'').toLowerCase();doc=String(doc||'').toLowerCase();if(t.includes('ödeme sözü')||t.includes('odeyecek'))return'Ödeme sözü';if(doc.includes('dekont')||t.includes('dekont'))return'Dekont';if(doc.includes('excel')||doc.includes('csv'))return'Excel Evrak';if(doc.includes('görsel')||doc.includes('ekran'))return'Görsel Evrak';if(t.includes('moka')||t.includes('pos'))return'Moka';if(t.includes('masraf')||t.includes('gider')||t.includes('fiş'))return'Gider/Masraf';return'Evrak İnceleme';}
  function css(){if(document.getElementById('tgEvrakCss'))return;let s=document.createElement('style');s.id='tgEvrakCss';s.textContent='#tgEvrakBox{margin:14px 0;border:2px solid #bfdbfe;background:#eff6ff;border-radius:16px;padding:12px}#tgEvrakBox h3{margin:0 0 8px;font-size:17px;font-weight:950}.tgGrid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}.tgField label{display:block;font-size:11px;font-weight:950;color:#475569;margin-bottom:4px}.tgField input,.tgField select,.tgField textarea{width:100%;border:1px solid #cbd5e1;border-radius:10px;padding:8px;font-size:12px;background:#fff}.tgField textarea{min-height:70px}.tgBtn{border:0;border-radius:10px;padding:9px 11px;font-weight:950;background:#1769e8;color:white;margin-top:8px}.tgRow{background:white;border:1px solid #dbeafe;border-radius:12px;padding:9px;margin-top:8px;font-size:12px;line-height:1.45}@media(max-width:900px){.tgGrid{grid-template-columns:1fr}}';document.head.appendChild(s)}
  function add(){
    const cari=document.getElementById('tgCari')?.value.trim()||'';
    const amount=N(document.getElementById('tgAmount')?.value||'');
    const date=document.getElementById('tgDate')?.value||'';
    const doc=document.getElementById('tgDocType')?.value||'Telegram Evrak';
    const file=document.getElementById('tgFile')?.value.trim()||'';
    const raw=document.getElementById('tgRaw')?.value.trim()||'';
    if(!raw&&!file) return alert('Mesaj veya dosya adı gir.');
    const type=guessType(raw,doc);
    const ev=R(EV); const id='TGEV-'+Date.now().toString(36).toUpperCase();
    const row={id,createdAt:new Date().toLocaleString('tr-TR'),cari,amount,date,docType:doc,fileName:file,raw,type,status:'Onay Merkezine gönderildi',source:'Telegram Evrak'};
    ev.unshift(row); W(EV,ev);
    const ops=R(K); ops.unshift({id:'OP-'+Date.now().toString(36).toUpperCase(),raw:(raw||file),cari:cari||'Cari adayı bekliyor',type,amount,status:'Onay bekliyor',source:'Telegram Evrak',fileName:file,docType:doc,date,confidence:cari&&amount?85:55,reason:'Telegram evrak girişi üzerinden oluşturuldu'}); W(K,ops);
    ['tgCari','tgAmount','tgDate','tgFile','tgRaw'].forEach(x=>{let el=document.getElementById(x);if(el)el.value=''});
    render(); alert('Telegram evrak önerisi Onay Merkezi’ne gönderildi.');
  }
  function render(){const list=document.getElementById('tgEvrakList');if(!list)return;const ev=R(EV);list.innerHTML=ev.slice(0,20).map(r=>'<div class="tgRow"><b>'+E(r.id)+' · '+E(r.docType)+' · '+E(r.type)+'</b><br>Cari: '+E(r.cari||'-')+' · Tutar: '+(N(r.amount)||0).toLocaleString('tr-TR')+' TL · Tarih: '+E(r.date||'-')+'<br>Dosya: '+E(r.fileName||'-')+'<br>'+E(r.raw||'')+'<br><b>'+E(r.status)+'</b></div>').join('')||'<div class="tgRow">Henüz Telegram evrak kaydı yok.</div>'}
  function mount(){css();let host=document.getElementById('tab-onay');if(!host)return;if(!document.getElementById('tgEvrakBox')){let b=document.createElement('div');b.id='tgEvrakBox';b.innerHTML='<h3>Telegram Evrak / Ekran Görüntüsü / Excel Girişi</h3><div style="font-size:12px;font-weight:800;color:#475569;margin-bottom:8px">Dekont, ekran görüntüsü, Excel, PDF veya Telegram mesajını buradan test kaydı olarak gir. Kesin kayıt oluşmaz; Onay Merkezi’ne öneri düşer.</div><div class="tgGrid"><div class="tgField"><label>Cari adayı</label><input id="tgCari" placeholder="Örn: ÇAĞTES"></div><div class="tgField"><label>Tutar</label><input id="tgAmount" placeholder="100.000"></div><div class="tgField"><label>Tarih</label><input id="tgDate" type="date"></div><div class="tgField"><label>Belge türü</label><select id="tgDocType"><option>Telegram Mesajı</option><option>Dekont Görseli</option><option>Ekran Görüntüsü</option><option>PDF Evrak</option><option>Excel Dosyası</option><option>CSV Dosyası</option><option>Moka/POS Bildirimi</option><option>Masraf Fişi</option></select></div><div class="tgField"><label>Dosya adı / referans</label><input id="tgFile" placeholder="dekont-16-05.jpg"></div><div class="tgField"><label>Mesaj / açıklama</label><textarea id="tgRaw" placeholder="Çağtes 100.000 TL ödeme yaptı / dekont geldi"></textarea></div></div><button id="tgEvrakAdd" class="tgBtn" type="button">Onay Merkezi’ne Öneri Gönder</button><div id="tgEvrakList"></div>';host.insertBefore(b,host.firstChild);document.getElementById('tgEvrakAdd').onclick=add}render()}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',mount):mount();
  document.addEventListener('click',()=>setTimeout(mount,250));
  setInterval(mount,1200);
})();