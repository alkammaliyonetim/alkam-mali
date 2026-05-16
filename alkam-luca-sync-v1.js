// ALKAM Mali - Luca Cari Senkron Paneli v1
(function(){
  'use strict';
  if(window.__ALKAM_LUCA_SYNC_V1__) return;
  window.__ALKAM_LUCA_SYNC_V1__=true;

  const LS_CARILER='ALKAM_FINAL_CARILER_V1';
  const esc=x=>String(x||'').replace(/[&<>]/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[s]));
  const norm=s=>String(s||'').toLocaleUpperCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/İ/g,'I').replace(/ı/g,'I').replace(/[^A-Z0-9]+/g,' ').trim();
  const slug=s=>norm(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||('luca-'+Date.now());
  const read=(k,fb)=>{try{return JSON.parse(localStorage.getItem(k)||'')}catch(e){return fb}};
  const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v||[]));

  function parseRows(text){
    const lines=String(text||'').split(/\r?\n/).map(x=>x.trimEnd()).filter(Boolean);
    let start=0;
    for(let i=0;i<lines.length;i++){ if(lines[i].includes('Kısa Adı') && lines[i].includes('Uzun Adı')){start=i+1;break;} }
    const out=[];
    for(const line of lines.slice(start)){
      const p=line.split('\t');
      if(!p[0]||!p[1]) continue;
      out.push({shortName:(p[0]||'').trim(),longName:(p[1]||'').trim(),office:(p[2]||'').trim(),no1:(p[3]||'').trim(),no2:(p[4]||'').trim(),info:(p[5]||'').trim(),start:(p[6]||'').trim(),end:(p[7]||'').trim()});
    }
    return out;
  }
  function codeOf(r){return r.no1||r.no2||r.shortName||'';}
  function findMatch(list,r){
    const codes=[r.no1,r.no2].filter(Boolean).map(norm);
    let m=list.find(c=>codes.includes(norm(c.code))||codes.includes(norm(c.vkn))||codes.includes(norm(c.vergiNo))||codes.includes(norm(c.tcNo)));
    if(m) return m;
    const sn=norm(r.shortName), ln=norm(r.longName);
    return list.find(c=>{const n=norm(c.name);return (sn&&n===sn)||(ln&&n===ln)||(sn&&n.includes(sn))||(ln&&n.includes(ln));});
  }
  function lucaNote(old,r){
    const base=String(old||'').split('\n').filter(x=>!x.startsWith('LUCA:')).join('\n').trim();
    const line='LUCA: kısa ad='+r.shortName+' | daire='+r.office+' | no1='+r.no1+' | no2='+r.no2+' | başlangıç='+r.start+(r.end?' | kapanış='+r.end:'')+(r.info?' | açıklama='+r.info:'');
    return (base?base+'\n':'')+line;
  }
  function getPreview(){
    const luca=parseRows(document.getElementById('lucaSyncText')?.value||'');
    const cariler=read(LS_CARILER,[]);
    let matched=0, missing=[];
    luca.forEach(r=>{ if(findMatch(cariler,r)) matched++; else missing.push(r); });
    return {luca,cariler,matched,missing};
  }
  function applySync(){
    const p=getPreview();
    if(!p.luca.length){ alert('Liste okunamadı. Luca müşteri listesini başlık satırıyla birlikte yapıştır.'); return; }
    const cariler=p.cariler.slice();
    const added=[], updated=[];
    p.luca.forEach(r=>{
      let c=findMatch(cariler,r);
      if(c){
        c.name=r.longName||c.name;
        c.code=codeOf(r)||c.code||'';
        c.type=c.type||'Luca Müşteri';
        c.status=r.end?'Pasif':(c.status||'Aktif');
        c.note=lucaNote(c.note,r);
        c.sourceFile='Luca Müşteri Listesi';
        c.luca={shortName:r.shortName,longName:r.longName,office:r.office,no1:r.no1,no2:r.no2,info:r.info,start:r.start,end:r.end};
        updated.push(c.name);
      }else{
        cariler.push({id:'luca-'+slug(r.shortName||r.longName),name:r.longName,code:codeOf(r),type:'Luca Müşteri',phone:'',monthlyFee:0,status:r.end?'Pasif':'Aktif',note:lucaNote('',r),periodStart:r.start,periodEnd:r.end,sourceFile:'Luca Müşteri Listesi',rawTotals:{totalDebit:0,totalCredit:0,balance:0},transactions:[],deleted:false,luca:{shortName:r.shortName,longName:r.longName,office:r.office,no1:r.no1,no2:r.no2,info:r.info,start:r.start,end:r.end}});
        added.push(r.longName);
      }
    });
    write(LS_CARILER,cariler);
    const paste=document.getElementById('pasteCariJson');
    if(paste && window.loadPastedCariData){ paste.value=JSON.stringify(cariler); window.loadPastedCariData(); }
    window.dispatchEvent(new CustomEvent('alkam:cariler-loaded'));
    localStorage.setItem('ALKAM_LUCA_SYNC_LAST',JSON.stringify({at:new Date().toISOString(),read:p.luca.length,added:added.length,updated:updated.length}));
    render();
    alert('Luca cari senkron tamam. Eklenen: '+added.length+' / Güncellenen: '+updated.length);
  }
  function css(){
    if(document.getElementById('lucaSyncCss')) return;
    const s=document.createElement('style');s.id='lucaSyncCss';
    s.textContent='#lucaSyncBox{border:2px solid #bfdbfe;background:#eff6ff;border-radius:16px;padding:14px;margin:14px 0}#lucaSyncBox h2{margin:0 0 8px;font-size:19px;font-weight:950}.lsGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:10px 0}.lsCard{background:white;border:1px solid #dbeafe;border-radius:12px;padding:10px}.lsK{font-size:10px;color:#64748b;font-weight:950}.lsV{font-size:20px;font-weight:950;margin-top:4px}.lsText{width:100%;min-height:150px;border:1px solid #bfdbfe;border-radius:12px;padding:10px;font-size:12px}.lsBtn{border:0;border-radius:10px;padding:9px 12px;font-weight:950;background:#1769e8;color:white;margin:8px 8px 0 0}.lsDark{background:#0f172a}.lsList{font-size:12px;line-height:1.55;background:#fff;border:1px solid #dbeafe;border-radius:12px;padding:10px;max-height:190px;overflow:auto}@media(max-width:900px){.lsGrid{grid-template-columns:1fr}}';
    document.head.appendChild(s);
  }
  function mount(){
    css();
    const host=document.getElementById('tab-yedek')||document.getElementById('tab-cariler')||document.body;
    if(!host||document.getElementById('lucaSyncBox')) return;
    const box=document.createElement('div');box.id='lucaSyncBox';
    box.innerHTML='<h2>Luca Müşteri / Cari Senkronizasyonu</h2><div style="font-size:12px;font-weight:800;color:#475569">Luca müşteri listesini başlık satırıyla yapıştır. Eksik müşteriler cari olarak eklenir; mevcut carilerin ana kart bilgileri güncellenir. Hareketler, bakiyeler ve aylık ücretler korunur.</div><textarea id="lucaSyncText" class="lsText" placeholder="Kısa Adı\tUzun Adı\t..."></textarea><br><button id="lucaPreviewBtn" class="lsBtn lsDark" type="button">Ön İzle</button><button id="lucaApplyBtn" class="lsBtn" type="button">Eksikleri Ekle / Bilgileri Güncelle</button><div id="lucaSyncInner"></div>';
    host.insertBefore(box,host.firstChild);
    document.getElementById('lucaPreviewBtn').onclick=render;
    document.getElementById('lucaApplyBtn').onclick=applySync;
    render();
  }
  function render(){
    const p=getPreview(); const el=document.getElementById('lucaSyncInner'); if(!el) return;
    const names=p.missing.slice(0,30).map(x=>x.shortName+' - '+x.longName);
    el.innerHTML='<div class="lsGrid"><div class="lsCard"><div class="lsK">Programdaki Cari</div><div class="lsV">'+p.cariler.length+'</div></div><div class="lsCard"><div class="lsK">Luca Okunan</div><div class="lsV">'+p.luca.length+'</div></div><div class="lsCard"><div class="lsK">Eşleşen</div><div class="lsV">'+p.matched+'</div></div><div class="lsCard"><div class="lsK">Eklenecek Eksik</div><div class="lsV">'+p.missing.length+'</div></div></div><h3 style="font-size:14px;margin:12px 0 6px">İlk 30 Eksik</h3><div class="lsList">'+(names.length?names.map(esc).join('<br>'):'Eksik yok veya liste henüz yapıştırılmadı.')+'</div>';
  }
  document.addEventListener('click',()=>setTimeout(mount,250));
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',mount):mount();
  setTimeout(mount,1000); setTimeout(mount,2500);
})();