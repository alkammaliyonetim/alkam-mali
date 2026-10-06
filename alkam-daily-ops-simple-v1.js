/* ALKAM Mali - Basit Gunluk Kullanim Modu v1 */
(function(){
  'use strict';
  const LS={
    approvals:'ALKAM_FINAL_APPROVALS_V1',
    accountTxns:'ALKAM_FINAL_ACCOUNT_TXNS_V1',
    accounts:'ALKAM_FINAL_ACCOUNTS_V1',
    cariler:'ALKAM_FINAL_CARILER_V1',
    audit:'ALKAM_FINAL_AUDIT_V1'
  };
  const BANK_ID='banka';
  const WAITING_ID='eslesme-bekleyen-kayitlar';
  let bankPreview=[];
  let tgPreview=[];
  function el(id){return document.getElementById(id);}
  function read(k,f){try{const r=localStorage.getItem(k);return r?JSON.parse(r):f;}catch(e){return f;}}
  function write(k,v){localStorage.setItem(k,JSON.stringify(v));}
  function uid(p){return p+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);}
  function esc(v){return String(v??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));}
  function trMoney(v){return Number(v||0).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2});}
  function toast(m){const t=el('toast'); if(t){t.textContent=m;t.style.display='block';clearTimeout(window.__simpleOpsToast);window.__simpleOpsToast=setTimeout(()=>t.style.display='none',3000);}else alert(m);}
  function audit(a,d){const l=read(LS.audit,[]);l.unshift({at:new Date().toISOString(),action:a,detail:d,level:'Kaydedildi'});write(LS.audit,l.slice(0,500));}
  function refresh(){try{window.refreshAll?.();}catch(e){}}
  function today(){return new Date().toISOString().slice(0,10);}
  function parseAmount(s){
    const m=String(s||'').match(/[-(]?\d[\d.]*,\d{2}\)?|[-(]?\d[\d.]*\)?/g);
    if(!m||!m.length)return 0;
    let x=m[m.length-1];
    const neg=x.startsWith('-')||x.startsWith('(')||/çıkış|cikis|borç|borc|ödeme|odeme/i.test(String(s));
    x=x.replace(/[().\s]/g,'').replace(',','.').replace(/[^0-9.]/g,'');
    const n=Math.abs(Number(x)||0);
    return neg?-n:n;
  }
  function parseDate(s){
    const x=String(s||'');
    let m=x.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/); if(m)return `${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`;
    m=x.match(/(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/); if(m)return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
    return today();
  }
  function norm(s){return String(s||'').toLocaleLowerCase('tr-TR').replace(/ı/g,'i').replace(/[^a-z0-9ğüşöçİĞÜŞÖÇ]+/gi,' ').replace(/\s+/g,' ').trim();}
  function ensureWaitingCari(){
    const c=read(LS.cariler,[]);
    if(!c.some(x=>x.id===WAITING_ID)){
      c.push({id:WAITING_ID,name:'EŞLEŞME BEKLEYEN KAYITLAR',code:'BEKLEYEN',type:'Kontrol',monthlyFee:0,status:'Aktif',transactions:[]});
      write(LS.cariler,c);
    }
    return WAITING_ID;
  }
  function matchCari(text){
    const c=read(LS.cariler,[]).filter(x=>!x.deleted);
    const n=norm(text);
    let best=null;
    c.forEach(x=>{
      const name=norm(x.name), code=norm(x.code);
      let score=0;
      if(name&&n.includes(name))score=96;
      else if(code&&n.includes(code))score=90;
      else{
        const parts=name.split(' ').filter(p=>p.length>2);
        const hit=parts.filter(p=>n.includes(p)).length;
        if(hit>=2)score=70;
      }
      if(score&&(!best||score>best.score))best={cari:x,score};
    });
    if(best)return best;
    return {cari:{id:ensureWaitingCari(),name:'EŞLEŞME BEKLEYEN KAYITLAR'},score:20};
  }
  function parseLines(text){
    return String(text||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean).map(line=>{
      const amt=parseAmount(line);
      const m=matchCari(line);
      return {date:parseDate(line),desc:line,amount:Math.abs(amt),dir:amt<0?'cikis':'giris',cariId:m.cari.id,cariName:m.cari.name,score:m.score};
    }).filter(r=>r.amount>0);
  }
  function renderTable(target,rows){
    const total=rows.reduce((s,r)=>s+r.amount,0);
    el(target).innerHTML=`<strong>Ön izleme:</strong> ${rows.length} kayıt / ${trMoney(total)}<br><table><thead><tr><th>Tarih</th><th>Cari önerisi</th><th>Güven</th><th>Açıklama</th><th class="text-right">Tutar</th></tr></thead><tbody>${rows.slice(0,30).map(r=>`<tr><td>${esc(r.date)}</td><td>${esc(r.cariName)}</td><td>${r.score}%</td><td>${esc(r.desc)}</td><td class="text-right money">${trMoney(r.amount)}</td></tr>`).join('')}</tbody></table>`;
  }
  function approval(r,source){return {id:uid('APR'),cariId:r.cariId,amount:r.amount,score:r.score,type:r.dir==='giris'?'Tahsilat':'Düzeltme',source,date:r.date,reason:r.desc,status:'Bekliyor',createdAt:new Date().toLocaleString('tr-TR')};}
  function ensureBank(){const a=read(LS.accounts,[]); if(!a.some(x=>x.id===BANK_ID))a.push({id:BANK_ID,name:'Banka',type:'banka'}); write(LS.accounts,a);}
  function addUi(){
    if(!el('alkamSimpleOpsStyle')){const s=document.createElement('style');s.id='alkamSimpleOpsStyle';s.textContent='.ops-simple{border:1px solid #dbe5f3;background:#fff;border-radius:14px;padding:14px;margin:0 0 16px;box-shadow:0 12px 28px rgba(15,23,42,.06)}.ops-simple h2{font-size:18px;margin:0 0 8px}.ops-simple textarea{width:100%;min-height:100px;border:1px solid #d8e1ef;border-radius:10px;padding:10px;font-weight:750}.ops-simple .note{font-size:12px;color:#64748b;font-weight:750;line-height:1.5;margin-bottom:8px}.ops-simple-result{font-size:12px;margin-top:10px;overflow:auto}';document.head.appendChild(s);}
    const hesap=el('tab-hesaplar');
    if(hesap&&!el('simpleBankBox')){const b=document.createElement('div');b.id='simpleBankBox';b.className='ops-simple';b.innerHTML=`<h2>🏦 Basit Banka Ekstre Yükleme</h2><div class="note">Ekstre satırlarını yapıştır. Önce Hesaplar'a alınır, cari için Onay Merkezi'ne öneri düşer. Otomatik cari kaydı yok.</div><textarea id="simpleBankText" placeholder="18.05.2026 ALKAM CARİ tahsilat 12.500,00"></textarea><div class="btn-row" style="margin-top:8px"><button class="btn btn-blue" onclick="ALKAM_SIMPLE_OPS.previewBank()">Ön İzle</button><button class="btn btn-green" onclick="ALKAM_SIMPLE_OPS.saveBank()">Hesaplara + Onaya Al</button></div><div id="simpleBankResult" class="ops-simple-result"></div>`;hesap.insertBefore(b,el('accountCards')||hesap.firstChild);}
    const onay=el('tab-onay');
    if(onay&&!el('simpleTelegramBox')){const b=document.createElement('div');b.id='simpleTelegramBox';b.className='ops-simple';b.innerHTML=`<h2>📩 Basit Telegram / WhatsApp Veri Yükleme</h2><div class="note">Mesajları yapıştır. Cari önerisi ve tutar Onay Merkezi'ne bekleyen kayıt olarak düşer.</div><textarea id="simpleTelegramText" placeholder="ALKAM CARİ tahsilat 12.500,00"></textarea><div class="btn-row" style="margin-top:8px"><button class="btn btn-blue" onclick="ALKAM_SIMPLE_OPS.previewTelegram()">Ön İzle</button><button class="btn btn-green" onclick="ALKAM_SIMPLE_OPS.saveTelegram()">Onaya Al</button></div><div id="simpleTelegramResult" class="ops-simple-result"></div>`;onay.insertBefore(b,el('approvalList')||onay.firstChild);}
  }
  window.ALKAM_SIMPLE_OPS={
    previewBank(){bankPreview=parseLines(el('simpleBankText')?.value||'');renderTable('simpleBankResult',bankPreview);},
    saveBank(){if(!bankPreview.length)this.previewBank(); if(!bankPreview.length)return toast('Aktarılacak banka kaydı yok.'); ensureBank(); const tx=read(LS.accountTxns,[]), ap=read(LS.approvals,[]); bankPreview.forEach(r=>{tx.push({id:uid('ACC'),accountId:BANK_ID,date:r.date,dir:r.dir,amount:r.amount,source:'Banka Ekstre',desc:r.desc}); if(r.dir==='giris')ap.unshift(approval(r,'Banka Ekstre'));}); write(LS.accountTxns,tx);write(LS.approvals,ap);audit('Banka ekstresi alındı',bankPreview.length+' kayıt');refresh();toast('Banka ekstresi alındı. Onay Merkezi’ni kontrol et.');},
    previewTelegram(){tgPreview=parseLines(el('simpleTelegramText')?.value||'');renderTable('simpleTelegramResult',tgPreview);},
    saveTelegram(){if(!tgPreview.length)this.previewTelegram(); if(!tgPreview.length)return toast('Onaya alınacak mesaj yok.'); const ap=read(LS.approvals,[]); tgPreview.forEach(r=>ap.unshift(approval(r,'Telegram'))); write(LS.approvals,ap);audit('Telegram verisi onaya alındı',tgPreview.length+' kayıt');refresh();toast('Telegram verisi Onay Merkezi’ne alındı.');}
  };
  function boot(){addUi();refresh();}
  document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,500));
  window.addEventListener('alkam:cariler-loaded',()=>setTimeout(boot,500));
  document.addEventListener('click',()=>setTimeout(addUi,50),true);
})();