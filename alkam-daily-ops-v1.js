/* ALKAM Mali - Günlük Operasyon Modülü v1
   Amaç: Mevcut ekrana yeni panel yığmadan banka ekstresi ve Telegram verisini
   Hesaplar + Onay Merkezi akışına bağlamak. Cari kesin kayıtları kullanıcı onayı olmadan yazılmaz. */
(function(){
  'use strict';

  const LS={
    cariler:'ALKAM_FINAL_CARILER_V1',
    approvals:'ALKAM_FINAL_APPROVALS_V1',
    accountTxns:'ALKAM_FINAL_ACCOUNT_TXNS_V1',
    accounts:'ALKAM_FINAL_ACCOUNTS_V1',
    audit:'ALKAM_FINAL_AUDIT_V1'
  };
  const PENDING_CARI_ID='eslesme-bekleyen-banka-kayitlari';
  const BANK_ACCOUNT_ID='banka';
  const ops={bankRows:[], telegramRows:[]};

  function byId(id){return document.getElementById(id);}
  function readJson(key,fallback){try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback;}catch(e){return fallback;}}
  function writeJson(key,value){localStorage.setItem(key,JSON.stringify(value));}
  function uid(prefix){return prefix+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);}
  function today(){return new Date().toISOString().slice(0,10);}
  function esc(v){return String(v??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));}
  function toast(msg){const el=byId('toast'); if(el){el.textContent=msg;el.style.display='block';clearTimeout(window.__alkamOpsToast);window.__alkamOpsToast=setTimeout(()=>el.style.display='none',3200);}else alert(msg);}
  function money(v){return Number(v||0).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})+' TL';}
  function norm(s){return String(s||'').toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i').replace(/[^a-z0-9ğüşöçıİĞÜŞÖÇ]+/gi,' ').replace(/\s+/g,' ').trim();}
  function amount(v){
    let s=String(v??'').trim(); if(!s) return 0;
    let neg=/^\(|^-/.test(s) || / borc|borç|cikis|çıkış/i.test(s);
    s=s.replace(/[()₺TLtl\s]/g,'').replace(/[^0-9,.-]/g,'');
    if(!s) return 0;
    if(s.includes(',')&&s.includes('.')) s=s.replace(/\./g,'').replace(',','.');
    else if(s.includes(',')) s=s.replace(',','.');
    const n=Math.abs(Number(s)||0);
    return neg ? -n : n;
  }
  function dateValue(v){
    if(v instanceof Date && !Number.isNaN(v.getTime())) return v.toISOString().slice(0,10);
    if(typeof v==='number' && v>25000 && v<70000 && window.XLSX?.SSF){
      const d=window.XLSX.SSF.parse_date_code(v); if(d) return `${d.y}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`;
    }
    const s=String(v??'').trim(); if(!s) return today();
    let m=s.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/); if(m) return `${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`;
    m=s.match(/(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/); if(m) return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
    return today();
  }
  function log(action,detail,level='Kaydedildi'){
    const list=readJson(LS.audit,[]); list.unshift({at:new Date().toISOString(),action,detail,level}); writeJson(LS.audit,list.slice(0,500));
  }
  function refresh(){try{window.refreshAll?.();}catch(e){} try{window.renderCariList?.();}catch(e){}}

  function ensureAccount(){
    const accounts=readJson(LS.accounts,[]);
    if(!accounts.some(a=>a.id===BANK_ACCOUNT_ID)) accounts.push({id:BANK_ACCOUNT_ID,name:'Banka',type:'banka'});
    writeJson(LS.accounts,accounts);
  }
  function ensurePendingCari(){
    const cariler=readJson(LS.cariler,[]);
    if(!cariler.some(c=>c.id===PENDING_CARI_ID)){
      cariler.push({id:PENDING_CARI_ID,name:'EŞLEŞME BEKLEYEN BANKA KAYITLARI',code:'ESLESME-BEKLIYOR',type:'Geçici kontrol carisi',monthlyFee:0,status:'Aktif',note:'Banka/Telegram verisi cariyle eşleşmezse burada bekletilir. Yanlış cariye yazmayı engeller.',transactions:[]});
      writeJson(LS.cariler,cariler);
    }
    return PENDING_CARI_ID;
  }
  function findCari(text){
    const cariler=readJson(LS.cariler,[]).filter(c=>!c.deleted);
    const n=norm(text);
    let best=null;
    for(const c of cariler){
      const name=norm(c.name), code=norm(c.code);
      let score=0;
      if(name && n.includes(name)) score=96;
      else if(code && n.includes(code)) score=92;
      else {
        const parts=name.split(' ').filter(x=>x.length>2);
        const hit=parts.filter(p=>n.includes(p)).length;
        if(parts.length && hit>=Math.min(2,parts.length)) score=Math.min(85,45+hit*15);
      }
      if(score && (!best || score>best.score)) best={cari:c,score};
    }
    if(best) return best;
    const id=ensurePendingCari();
    return {cari:readJson(LS.cariler,[]).find(c=>c.id===id),score:20};
  }

  function injectUi(){
    if(byId('alkamDailyOpsStyle')) return;
    const st=document.createElement('style'); st.id='alkamDailyOpsStyle';
    st.textContent='.alkam-ops-box{border:1px solid #dbe5f3;background:#fff;border-radius:14px;padding:14px;margin:0 0 16px;box-shadow:0 12px 28px rgba(15,23,42,.06)}.alkam-ops-box h2{margin:0 0 8px;font-size:18px;font-weight:950}.alkam-ops-help{font-size:12px;color:#64748b;font-weight:750;line-height:1.5;margin-bottom:10px}.alkam-ops-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.alkam-ops-area{width:100%;min-height:92px;border:1px solid #d8e1ef;border-radius:10px;padding:10px;font-weight:750}.alkam-ops-result{margin-top:10px;font-size:12px;line-height:1.55}.alkam-ops-warning{background:#fff7ed;border:1px solid #fed7aa;color:#9a3412;border-radius:10px;padding:9px;margin-top:8px;font-size:12px;font-weight:850}@media(max-width:900px){.alkam-ops-grid{grid-template-columns:1fr}}';
    document.head.appendChild(st);

    const hesaplar=byId('tab-hesaplar');
    if(hesaplar && !byId('alkamBankImportBox')){
      const box=document.createElement('div'); box.id='alkamBankImportBox'; box.className='alkam-ops-box';
      box.innerHTML=`<h2>🏦 Banka Ekstre Yükleme</h2><div class="alkam-ops-help">Excel / CSV / TXT ekstre yükle. Banka hareketleri Hesaplar modülüne alınır; cari eşleşmeleri kesin kayıt değil, Onay Merkezi'ne öneri olarak düşer.</div><div class="alkam-ops-grid"><div><input id="alkamBankFile" type="file" accept=".xlsx,.xls,.csv,.txt" class="search-input"><div class="btn-row" style="margin-top:8px"><button class="btn btn-blue" onclick="ALKAM_DAILY_OPS.previewBankFile()">Ön İzle</button><button class="btn btn-green" onclick="ALKAM_DAILY_OPS.importBankFile()">Hesaplara + Onaya Al</button></div></div><div><textarea id="alkamBankText" class="alkam-ops-area" placeholder="Alternatif: Banka ekstresini buraya yapıştır"></textarea><button class="btn btn-soft" style="margin-top:8px" onclick="ALKAM_DAILY_OPS.previewBankText()">Yapıştırılanı Ön İzle</button></div></div><div class="alkam-ops-warning">Kural: Banka yükleme cariye otomatik yazmaz. Onay Merkezi'nden kontrol edilmeden kesin cari hareketi oluşmaz.</div><div id="alkamBankImportResult" class="alkam-ops-result"></div>`;
      const cards=byId('accountCards'); hesaplar.insertBefore(box,cards||hesaplar.firstChild);
    }
    const onay=byId('tab-onay');
    if(onay && !byId('alkamTelegramBox')){
      const box=document.createElement('div'); box.id='alkamTelegramBox'; box.className='alkam-ops-box';
      box.innerHTML=`<h2>📩 Telegram / WhatsApp Veri Yükleme</h2><div class="alkam-ops-help">Mesajları satır satır yapıştır veya TXT dosyası yükle. Cari adı ve tutar yakalanır; kesin işlem Onay Merkezi'ne düşer.</div><div class="alkam-ops-grid"><div><textarea id="alkamTelegramText" class="alkam-ops-area" placeholder="Örn: Gamze Eczanesi 24 adet ... / tahsilat 12.500 TL"></textarea><div class="btn-row" style="margin-top:8px"><button class="btn btn-blue" onclick="ALKAM_DAILY_OPS.previewTelegram()">Ön İzle</button><button class="btn btn-green" onclick="ALKAM_DAILY_OPS.importTelegram()">Onaya Al</button></div></div><div><input id="alkamTelegramFile" type="file" accept=".txt,.csv" class="search-input"><button class="btn btn-soft" style="margin-top:8px" onclick="ALKAM_DAILY_OPS.loadTelegramFile()">Dosyayı Oku</button></div></div><div id="alkamTelegramResult" class="alkam-ops-result"></div>`;
      const list=byId('approvalList'); onay.insertBefore(box,list||onay.firstChild);
    }
  }

  async function readFile(inputId){
    const file=byId(inputId)?.files?.[0]; if(!file) throw new Error('Dosya seçilmedi.');
    const name=file.name.toLowerCase();
    if((name.endsWith('.xlsx')||name.endsWith('.xls')) && window.XLSX){
      const buf=await file.arrayBuffer(); const wb=window.XLSX.read(buf,{type:'array',cellDates:true});
      return window.XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1,defval:''});
    }
    return await file.text();
  }
  function parseDelimited(text){return String(text||'').split(/\r?\n/).filter(Boolean).map(line=>line.split(line.includes(';')?';':line.includes('\t')?'\t':','));}
  function cellText(row){return row.map(x=>String(x??'')).join(' ');}
  function parseRows(input){
    const rows=Array.isArray(input)?input:parseDelimited(input);
    return rows.map((row,idx)=>{
      const text=cellText(row); if(!text.trim()) return null;
      const dateCell=row.find(v=>/\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}/.test(String(v)) || v instanceof Date) || '';
      const nums=row.map(amount).filter(n=>Math.abs(n)>0.009);
      const signed=nums.length?nums[nums.length-1]:amount(text.match(/[-(]?\d[\d.]*,\d{2}\)?\s*(?:TL|₺)?/i)?.[0]||0);
      if(!signed) return null;
      const desc=text.replace(String(dateCell),'').trim();
      const match=findCari(desc);
      return {id:uid('IMP'),date:dateValue(dateCell),desc:desc||text,amount:signed,abs:Math.abs(signed),dir:signed>=0?'giris':'cikis',type:signed>=0?'Tahsilat':'Ödeme/Çıkış',cariId:match.cari?.id||ensurePendingCari(),cariName:match.cari?.name||'EŞLEŞME BEKLEYEN',score:match.score,rowNo:idx+1};
    }).filter(Boolean);
  }
  function renderBank(rows){
    const totalIn=rows.filter(r=>r.dir==='giris').reduce((s,r)=>s+r.abs,0), totalOut=rows.filter(r=>r.dir==='cikis').reduce((s,r)=>s+r.abs,0);
    byId('alkamBankImportResult').innerHTML=`<strong>Ön izleme:</strong> ${rows.length} hareket · Giriş ${money(totalIn)} · Çıkış ${money(totalOut)}<br><table><thead><tr><th>Tarih</th><th>Cari önerisi</th><th>Güven</th><th>Açıklama</th><th class="text-right">Tutar</th></tr></thead><tbody>${rows.slice(0,25).map(r=>`<tr><td>${esc(r.date)}</td><td>${esc(r.cariName)}</td><td>${r.score}%</td><td>${esc(r.desc)}</td><td class="text-right money">${money(r.abs)}</td></tr>`).join('')}</tbody></table>${rows.length>25?'<div class="alkam-ops-help">İlk 25 satır gösterildi.</div>':''}`;
  }
  function approvalFromRow(r,source){return {id:uid('APR'),cariId:r.cariId,amount:r.abs,score:r.score,type:r.dir==='giris'?'Tahsilat':'Düzeltme',source, date:r.date, reason:r.desc, status:'Bekliyor',createdAt:new Date().toLocaleString('tr-TR')};}

  window.ALKAM_DAILY_OPS={
    async previewBankFile(){try{ops.bankRows=parseRows(await readFile('alkamBankFile'));renderBank(ops.bankRows);toast('Banka ön izleme hazır.');}catch(e){toast(e.message);}},
    previewBankText(){ops.bankRows=parseRows(byId('alkamBankText')?.value||'');renderBank(ops.bankRows);toast('Yapıştırılan ekstre ön izlendi.');},
    async importBankFile(){if(!ops.bankRows.length) await this.previewBankFile(); saveBankRows();},
    async loadTelegramFile(){try{byId('alkamTelegramText').value=await readFile('alkamTelegramFile'); this.previewTelegram();}catch(e){toast(e.message);}},
    previewTelegram(){ops.telegramRows=parseRows(byId('alkamTelegramText')?.value||''); renderTelegram(ops.telegramRows); toast('Telegram ön izleme hazır.');},
    importTelegram(){if(!ops.telegramRows.length) this.previewTelegram(); saveTelegramRows();}
  };
  function saveBankRows(){
    if(!ops.bankRows.length) return toast('Aktarılacak banka hareketi yok.');
    ensureAccount(); ensurePendingCari();
    const tx=readJson(LS.accountTxns,[]), ap=readJson(LS.approvals,[]);
    ops.bankRows.forEach(r=>{tx.push({id:uid('ACC'),accountId:BANK_ACCOUNT_ID,date:r.date,dir:r.dir,amount:r.abs,source:'Banka Ekstre',desc:r.desc}); if(r.dir==='giris') ap.unshift(approvalFromRow(r,'Banka Ekstre'));});
    writeJson(LS.accountTxns,tx); writeJson(LS.approvals,ap); log('Banka ekstresi yüklendi',`${ops.bankRows.length} hesap hareketi · ${ops.bankRows.filter(r=>r.dir==='giris').length} onay önerisi`); refresh(); toast('Banka ekstresi Hesaplar ve Onay Merkezi’ne alındı.');
  }
  function renderTelegram(rows){byId('alkamTelegramResult').innerHTML=`<strong>Ön izleme:</strong> ${rows.length} satır<br><table><thead><tr><th>Cari önerisi</th><th>Güven</th><th>Açıklama</th><th class="text-right">Tutar</th></tr></thead><tbody>${rows.slice(0,25).map(r=>`<tr><td>${esc(r.cariName)}</td><td>${r.score}%</td><td>${esc(r.desc)}</td><td class="text-right money">${money(r.abs)}</td></tr>`).join('')}</tbody></table>`;}
  function saveTelegramRows(){
    if(!ops.telegramRows.length) return toast('Onaya alınacak Telegram satırı yok.');
    ensurePendingCari(); const ap=readJson(LS.approvals,[]);
    ops.telegramRows.forEach(r=>ap.unshift({...approvalFromRow(r,'Telegram'),type:r.abs>0?'Tahsilat':'Düzeltme'}));
    writeJson(LS.approvals,ap); log('Telegram verisi onaya alındı',`${ops.telegramRows.length} öneri`); refresh(); toast('Telegram verisi Onay Merkezi’ne alındı.');
  }

  function boot(){injectUi(); refresh();}
  document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,800));
  window.addEventListener('alkam:cariler-loaded',()=>setTimeout(boot,500));
  document.addEventListener('click',()=>setTimeout(injectUi,50),true);
})();
