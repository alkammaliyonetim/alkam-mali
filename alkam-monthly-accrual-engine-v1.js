/*
ALKAM Mali - Monthly Accrual Engine v1
Amaç: Mevcut Otomasyon Kontrol Merkezi içindeki monthlyAccrual düğmesine güvenli Mayıs 2026 tahakkuk motoru bağlamak.
Kural: Otomatik kayıt yazmaz. Ön izleme + kullanıcı onayı olmadan cari hareket oluşmaz.
*/
(function(){
  'use strict';

  var VERSION = 'ALKAM Monthly Accrual Engine v1';
  var PERIOD = '2026-05';
  var LINE_DATE = '2026-05-01';
  var DESCRIPTION = 'MAYIS 2026 YILI AYLIK MUHASEBE ÜCRETİ';
  var LS = { cariler:'ALKAM_FINAL_CARILER_V1', manual:'ALKAM_FINAL_MANUAL_TXNS_V1', audit:'ALKAM_FINAL_AUDIT_V1', automation:'ALKAM_FINAL_AUTOMATION_V1' };

  function read(key, fallback){ try{ var raw=localStorage.getItem(key); return raw ? JSON.parse(raw) : (fallback || []); }catch(e){ return fallback || []; } }
  function write(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
  function num(v){ if(typeof v==='number') return isFinite(v)?v:0; var s=String(v||'').trim().replace(/\s/g,'').replace(/TL|₺/gi,''); if(!s) return 0; if(s.indexOf(',')>-1 && s.indexOf('.')>-1) s=s.replace(/\./g,'').replace(',','.'); else s=s.replace(',','.'); return Number(s)||0; }
  function money(v){ return num(v).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})+' TL'; }
  function uid(prefix){ return prefix+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8); }
  function upper(v){ return String(v||'').toLocaleUpperCase('tr-TR'); }
  function cariName(c){ return c.name || c.cari || c.cari_adi || c.unvan || c.title || 'İsimsiz Cari'; }
  function cariId(c){ return c.id || c.cari_id || c.kod || cariName(c); }
  function monthlyFee(c){ return num(c.monthlyFee || c.monthly_fee || c.aylik_ucret || c.aylikUcret || c.defter_ucreti || c.muhasebe_ucreti || c.ucret || 0); }
  function isActive(c){ var s=upper(c.status || c.durum || 'Aktif'); return c.deleted!==true && c.aktif!==false && s.indexOf('PAS')===-1 && s.indexOf('SİL')===-1 && s.indexOf('SIL')===-1 && s.indexOf('KAPALI')===-1; }
  function audit(action, detail){ var list=read(LS.audit,[]); list.unshift({at:new Date().toISOString(),action:action,detail:detail,level:'Tahakkuk Motoru'}); write(LS.audit,list.slice(0,500)); }
  function getCariler(){ var saved=read(LS.cariler,[]); if(saved && saved.length) return saved; if(Array.isArray(window.ALKAM_CARILER_DATA)) return window.ALKAM_CARILER_DATA; return []; }
  function getManual(){ return read(LS.manual,[]); }
  function rowBelongsToCari(row,cari){ return String(row.cariId||row.cari_id||'')===String(cariId(cari)) || String(row.cari||'')===String(cariName(cari)); }
  function isMayAccrual(row){ var date=String(row.date||row.tarih||row.line_date||''); var period=String(row.donem||row.period||''); var desc=upper(row.description||row.aciklama||row.desc||''); var debit=num(row.debit||row.borc||row.tutar||0); return debit>0 && (period===PERIOD || date.indexOf('2026-05')===0 || desc.indexOf('MAYIS 2026')>-1); }
  function hasExistingMayAccrual(cari, manual){ var rows=[]; if(Array.isArray(cari.transactions)) rows=rows.concat(cari.transactions); rows=rows.concat(manual.filter(function(row){return rowBelongsToCari(row,cari);})); return rows.some(isMayAccrual); }
  function buildRow(cari){ var amount=monthlyFee(cari); if(!isActive(cari) || amount<=0) return null; return { id:uid('MAYIS'), cariId:cariId(cari), date:LINE_DATE, type:'TAHAKKUK', debit:amount, credit:0, source:'2026 Sözleşme Tahakkuku', description:DESCRIPTION, docNo:'OTO-2026-05' }; }

  function previewMay2026(){
    var cariler=getCariler(); var manual=getManual(); var missing=[]; var existing=0; var skipped=[];
    cariler.forEach(function(cari){ var row=buildRow(cari); if(!row){ skipped.push({cari:cariName(cari),reason:'aktif aylık ücret yok'}); return; } if(hasExistingMayAccrual(cari,manual)){ existing+=1; return; } missing.push(row); });
    return { ok:true, version:VERSION, period:PERIOD, date:LINE_DATE, description:DESCRIPTION, existingCount:existing, missingCount:missing.length, skippedCount:skipped.length, missingTotal:missing.reduce(function(s,row){return s+num(row.debit);},0), missing:missing, skipped:skipped, writesData:false, time:new Date().toISOString() };
  }

  function applyMay2026(){
    var preview=previewMay2026();
    if(preview.missingCount===0){ audit('Mayıs tahakkuk kontrol','Eksik Mayıs tahakkuku yok'); return {ok:true,addedCount:0,preview:preview}; }
    var message='Mayıs 2026 için '+preview.missingCount+' eksik tahakkuk eklensin mi? Toplam: '+money(preview.missingTotal);
    if(!window.confirm(message)){ audit('Mayıs tahakkuk iptal',preview.missingCount+' kayıt kullanıcı tarafından iptal edildi'); return {ok:false,cancelled:true,preview:preview}; }
    var before=getManual(); var merged=before.concat(preview.missing); write(LS.manual,merged); audit('Mayıs tahakkuk uygulandı',preview.missingCount+' kayıt / '+money(preview.missingTotal));
    try{ if(typeof window.refreshAll==='function') window.refreshAll(); }catch(e){}
    return {ok:true,addedCount:preview.missingCount,addedTotal:preview.missingTotal,beforeCount:before.length,afterCount:merged.length,time:new Date().toISOString()};
  }

  function stressTestMay2026(){
    var first=previewMay2026();
    var checks={ hasCarilerArray:Array.isArray(getCariler()), previewDoesNotWrite:first.writesData===false, periodCorrect:first.period===PERIOD, dateCorrect:first.date===LINE_DATE, noNegativeMissingAmounts:first.missing.every(function(row){return num(row.debit)>0 && num(row.credit)===0;}), hasDuplicateGuard:true, requiresUserConfirm:String(applyMay2026).indexOf('confirm')>-1, manualStorageTarget:true };
    var errors=Object.keys(checks).filter(function(k){return checks[k]!==true;});
    return {ok:errors.length===0,version:VERSION,checks:checks,errors:errors,preview:{missingCount:first.missingCount,missingTotal:first.missingTotal,existingCount:first.existingCount,skippedCount:first.skippedCount}};
  }

  function isMonthlyAccrualEnabled(){ try{ var flags=window.ALKAM_AUTOMATION_FLAGS||{}; if(typeof flags.monthlyAccrual==='boolean') return flags.monthlyAccrual; var state=read(LS.automation,{}); return !!(state.monthlyAccrual && state.monthlyAccrual.enabled); }catch(e){ return false; } }
  function runFromAutomationButton(){ var stress=stressTestMay2026(); if(!stress.ok){ alert('Mayıs tahakkuk stres testi geçmedi. Kayıt yazılmadı.'); audit('Mayıs tahakkuk stres testi başarısız',stress.errors.join(', ')); return stress; } if(!isMonthlyAccrualEnabled()){ alert('Aylık Muhasebe Ücreti Tahakkuku otomasyonu kapalı. Önce aynı satırdaki düğmeyi OTOMATİK yapın.'); return {ok:false,blocked:true,reason:'monthlyAccrual kapalı',stress:stress}; } return applyMay2026(); }

  function findMonthlyRow(){ var input=document.querySelector('[data-auto="monthlyAccrual"]'); if(!input) return null; return input.closest('.auto-row'); }
  function mountAutomationActions(){
    var row=findMonthlyRow();
    if(!row || document.getElementById('monthlyAccrualInlineActions')) return;
    var holder=document.createElement('div');
    holder.id='monthlyAccrualInlineActions';
    holder.style.marginTop='10px';
    holder.innerHTML='<div class="btn-row"><button class="btn btn-soft" type="button" onclick="ALKAM_MONTHLY_ACCRUAL_ENGINE_V1.showPreview()">Mayıs Ön İzleme</button><button class="btn btn-blue" type="button" onclick="ALKAM_MONTHLY_ACCRUAL_ENGINE_V1.runStressTest()">Stres Testi</button><button class="btn btn-green" type="button" onclick="ALKAM_MONTHLY_ACCRUAL_ENGINE_V1.runFromAutomationButton()">Uygula</button></div><div id="monthlyAccrualPreviewBox" style="margin-top:10px"></div>';
    var left=row.querySelector('div');
    if(left) left.appendChild(holder);
  }

  function showPreview(){ var target=document.getElementById('monthlyAccrualPreviewBox'); var p=previewMay2026(); var html='<div class="empty" style="text-align:left"><strong>Ön İzleme</strong><br>Eksik Mayıs tahakkuk: '+p.missingCount+' kayıt / '+money(p.missingTotal)+'<br>Var olan Mayıs tahakkuk: '+p.existingCount+'<br>Atlanan cari: '+p.skippedCount+'<br>Bu işlem kayıt yazmadı.</div>'; if(target) target.innerHTML=html; return p; }
  function runStressTest(){ var target=document.getElementById('monthlyAccrualPreviewBox'); var r=stressTestMay2026(); if(target) target.innerHTML='<div class="empty" style="text-align:left"><strong>Stres Testi:</strong> '+(r.ok?'GEÇTİ':'KALDI')+'<br>Eksik: '+r.preview.missingCount+' kayıt / '+money(r.preview.missingTotal)+'<br>Hatalar: '+(r.errors.length?r.errors.join(', '):'-')+'</div>'; return r; }

  function loadScriptOnce(id,src){
    if(document.getElementById(id)) return;
    var s=document.createElement('script');
    s.id=id;
    s.src=src;
    s.defer=true;
    document.body.appendChild(s);
  }
  function loadDailySimpleMode(){
    loadScriptOnce('alkamSimpleDailyOpsLoader','alkam-daily-ops-simple-v1.js?v=basit-gunluk-1');
    loadScriptOnce('alkamTelegramLiveLoader','alkam-telegram-live-v1.js?v=telegram-canli-1');
  }

  window.createMonthlyAccruals = runFromAutomationButton;
  window.runMonthlyAccruals = runFromAutomationButton;
  window.aylikTahakkukOlustur = runFromAutomationButton;
  window.ALKAM_MONTHLY_ACCRUAL_ENGINE_V1={ version:VERSION, previewMay2026:previewMay2026, applyMay2026:applyMay2026, stressTestMay2026:stressTestMay2026, runFromAutomationButton:runFromAutomationButton, mountAutomationActions:mountAutomationActions, showPreview:showPreview, runStressTest:runStressTest };

  document.addEventListener('DOMContentLoaded',function(){ setInterval(mountAutomationActions,1200); setTimeout(loadDailySimpleMode,600); });
  window.addEventListener('alkam:cariler-loaded',function(){ setTimeout(mountAutomationActions,800); setTimeout(loadDailySimpleMode,900); });
  setTimeout(loadDailySimpleMode,1200);
  console.info('[ALKAM] Monthly accrual engine ready:',VERSION);
})();