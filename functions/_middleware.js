export async function onRequest(context) {
  const response = await context.next();
  const url = new URL(context.request.url);
  const contentType = response.headers.get("content-type") || "";
  const isHome = url.pathname === "/" || url.pathname === "/index.html";
  const isMoka = url.pathname === "/moka-pos-mutabakat.html" || url.pathname === "/moka-pos-mutabakat";

  if (!contentType.includes("text/html")) return response;

  if (isMoka) {
    let html = await response.text();
    html = html
      .replace(/\s*<button class="tab" data-tab="audit">Denetim İzi<\/button>/g, "")
      .replace(/\s*<button class="tab" data-tab="audit">İşlem İzi<\/button>/g, "")
      .replace(/\s*<section class="panel tab-page hidden" id="tab-audit">[\s\S]*?<\/section>/g, "")
      .replace(/\s*<section class="panel tab-page" id="tab-audit">[\s\S]*?<\/section>/g, "")
      .replace("renderBank();renderExpected();renderMatches();renderAudit()", "renderBank();renderExpected();renderMatches()")
      .replace(/\s*function renderAudit\(\)\{[\s\S]*?\}\n\s*function switchLocalTab/, "\n  function switchLocalTab");
    html += `\n<style id="alkam-hide-visible-audit">[data-tab="audit"],#tab-audit{display:none!important}</style>`;
    const headers = new Headers(response.headers);
    headers.set("content-type", "text/html; charset=utf-8");
    return new Response(html, { status: response.status, headers });
  }

  if (!isHome) return response;

  const patch = `
<style id="alkam-summary-card-fix-style">
  .alkam-summary-fixed{padding:12px!important;min-height:92px!important;display:flex!important;flex-direction:column!important;gap:8px!important;border-radius:12px!important}
  .alkam-summary-fixed-title{font-size:11px!important;line-height:1.2!important;font-weight:950!important;color:#64748b!important;text-transform:uppercase!important;letter-spacing:.04em!important;margin:0!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
  .alkam-summary-fixed-grid{display:grid!important;grid-template-columns:1fr 1fr!important;gap:7px!important;width:100%!important}
  .alkam-summary-fixed-cell{min-width:0!important;border:1px solid #e9eef6!important;background:#fbfdff!important;border-radius:9px!important;padding:8px 9px!important}
  .alkam-summary-fixed-label{display:block!important;font-size:10px!important;font-weight:950!important;color:#64748b!important;line-height:1.15!important;margin-bottom:4px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
  .alkam-summary-fixed-value{display:block!important;font-size:16px!important;font-weight:950!important;color:#0f172a!important;line-height:1.1!important;font-variant-numeric:tabular-nums!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
  .alkam-report-guard{border:1px solid #fecaca!important;background:#fff7f7!important;color:#991b1b!important;border-radius:12px!important;padding:10px 12px!important;margin:0 0 12px!important;font-size:12px!important;font-weight:850!important;line-height:1.45!important}
  .alkam-report-guard b{font-weight:950!important}.alkam-report-guard ul{margin:7px 0 0 18px!important;padding:0!important}.alkam-report-guard li{margin:3px 0!important}
  .alkam-report-guard-ok{border-color:#bbf7d0!important;background:#f0fdf4!important;color:#166534!important}
  .alkam-report-uncertain .alkam-fin-card,.alkam-report-uncertain .alkam-fin-table-wrap{outline:2px solid rgba(220,38,38,.18)!important;outline-offset:0!important}
  [data-tab="audit"],#tab-audit,.alkam-visible-audit-trace{display:none!important}
  @media(max-width:640px){.alkam-summary-fixed-grid{grid-template-columns:1fr!important}.alkam-summary-fixed-value{font-size:15px!important}}
</style>
<script id="alkam-summary-card-fix-script">
(function(){
  function cleanText(el){return (el && el.textContent || '').replace(/\s+/g,' ').trim();}
  function isTraceText(text){return text === 'işlem izi' || text === 'denetim izi' || text === 'islem izi' || text.indexOf('işlem iz ') === 0 || text.indexOf('denetim iz ') === 0 || text.indexOf('islem iz ') === 0;}
  function specFor(label){
    if(/^İşletme\s*\/\s*Bilanço$|^Isletme\s*\/\s*Bilanco$/i.test(label)) return {title:'Cari Defter Türü', labels:['İşletme','Bilanço']};
    if(/^Ltd\s*\/\s*A\.Ş\.$|^Ltd\s*\/\s*A\.S\.$/i.test(label)) return {title:'Şirket Türü', labels:['Ltd','A.Ş.']};
    if(/^Bu Ay\s*T\/T$/i.test(label)) return {title:'Bu Ay', labels:['Tahakkuk','Tahsilat']};
    if(/^Bu Yıl\s*T\/T$|^Bu Yil\s*T\/T$/i.test(label)) return {title:'Bu Yıl', labels:['Tahakkuk','Tahsilat']};
    if(/^Bu Ay\s*Gider$/i.test(label)) return {title:'Bu Ay Gider', labels:['Tahakkuk','Ödenen']};
    if(/^Bu Yıl\s*Gider$|^Bu Yil\s*Gider$/i.test(label)) return {title:'Bu Yıl Gider', labels:['Tahakkuk','Ödenen']};
    return null;
  }
  function splitValue(value){
    var parts = String(value || '').split('/').map(function(x){return x.trim();}).filter(Boolean);
    if(parts.length < 2) parts = [value || '0', '-'];
    return [parts[0], parts.slice(1).join(' / ')];
  }
  function fixCards(){
    Array.prototype.slice.call(document.querySelectorAll('.card')).forEach(function(card){
      if(card.dataset.alkamSummaryFixed === '1') return;
      var labelEl = card.querySelector('.card-label');
      var valueEl = card.querySelector('.card-value');
      var label = cleanText(labelEl);
      var value = cleanText(valueEl);
      var spec = specFor(label);
      if(!spec || !value) return;
      var values = splitValue(value);
      card.dataset.alkamSummaryFixed = '1';
      card.classList.add('alkam-summary-fixed');
      card.innerHTML = '<div class="alkam-summary-fixed-title">'+spec.title+'</div>'+
        '<div class="alkam-summary-fixed-grid">'+
          '<div class="alkam-summary-fixed-cell"><span class="alkam-summary-fixed-label">'+spec.labels[0]+'</span><span class="alkam-summary-fixed-value">'+values[0]+'</span></div>'+
          '<div class="alkam-summary-fixed-cell"><span class="alkam-summary-fixed-label">'+spec.labels[1]+'</span><span class="alkam-summary-fixed-value">'+values[1]+'</span></div>'+
        '</div>';
    });
  }
  function hideVisibleTrace(){
    var targets = document.querySelectorAll('button,a,.nav-btn,.erp-module-btn,.tab');
    Array.prototype.slice.call(targets).forEach(function(el){
      var text = cleanText(el).toLocaleLowerCase('tr-TR');
      if(isTraceText(text)) el.classList.add('alkam-visible-audit-trace');
    });
    Array.prototype.slice.call(document.querySelectorAll('h1,h2,h3,.section-title')).forEach(function(el){
      var text = cleanText(el).toLocaleLowerCase('tr-TR');
      if(isTraceText(text)) {
        var box = el.closest('.section,.panel,.card') || el;
        box.classList.add('alkam-visible-audit-trace');
      }
    });
  }
  function arr(x){return Array.isArray(x)?x:[];}
  function readJson(key,fallback){try{var raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback;}catch(e){return fallback;}}
  function countLive(name){try{return arr(window.__liveCaches&&window.__liveCaches[name]).length;}catch(e){return 0;}}
  function countState(name){try{return arr((window.state||{})[name]).length;}catch(e){return 0;}}
  function bankLocalCount(){var bank=readJson('alkam_local_bank_ops_v1',{});return arr(bank.processed).length+arr(bank.pending).length+arr(bank.history).length;}
  function reportInputs(){
    return {
      cari: countState('cariler') + countState('customers'),
      sales: countState('sales') + countState('satislar') + countState('invoices') + countLive('sales') + countLive('invoices') + readJson('alkam_local_sales_v1',[]).length,
      ledger: countState('operationalLedger') + countState('hareketler') + readJson('alkam_local_ledger_v1',[]).length,
      accountOps: countState('accountOps') + countLive('account_ops') + readJson('alkam_local_account_ops_v1',[]).length,
      bank: countState('bankPanel') + bankLocalCount(),
      expense: countState('expenseAccruals') + countState('expensePayments') + countLive('expense_accruals') + countLive('expense_payments') + readJson('alkam_local_expense_accruals_v1',[]).length + readJson('alkam_local_expense_payments_v1',[]).length
    };
  }
  function installReportGuard(){
    var panel=document.getElementById('alkamFinanceReportPanel');
    if(!panel) return;
    var input=reportInputs();
    var missing=[];
    if(input.sales===0) missing.push('Satışlar / gelir tahakkuk kaynağı bağlı değil');
    if(input.ledger===0) missing.push('Cari hareket / tahakkuk hareketleri tamamlanmamış');
    if(input.accountOps===0 && input.bank===0) missing.push('Banka, kasa ve hesap hareketleri tamamlanmamış');
    if(input.cari===0) missing.push('Cari kart verisi rapora bağlanmamış');
    var old=document.getElementById('alkamReportGuard');
    if(old) old.remove();
    var box=document.createElement('div');
    box.id='alkamReportGuard';
    if(missing.length){
      panel.classList.add('alkam-report-uncertain');
      box.className='alkam-report-guard';
      box.innerHTML='<b>Kesin rapor değildir.</b> Bu rakamlar muhasebe raporu olarak kullanılamaz; veri omurgası eksik. Eksikler:<ul>'+missing.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul>';
    }else{
      panel.classList.remove('alkam-report-uncertain');
      box.className='alkam-report-guard alkam-report-guard-ok';
      box.innerHTML='<b>Rapor veri kaynakları bağlı görünüyor.</b> Yine de kapanış/açılış bakiyesi ve dönem mutabakatı tamamlanmadan nihai beyan raporu sayılmaz.';
    }
    panel.insertBefore(box,panel.firstChild);
  }
  function patchReportRenderer(){
    if(window.__alkamReportGuardPatched) return;
    window.__alkamReportGuardPatched=true;
    var original=window.ALKAM_RENDER_FINANCE_REPORT;
    if(typeof original==='function'){
      window.ALKAM_RENDER_FINANCE_REPORT=function(){var r=original.apply(this,arguments); setTimeout(installReportGuard,60); return r;};
    }
  }
  function run(){fixCards(); hideVisibleTrace(); patchReportRenderer(); installReportGuard();}
  document.addEventListener('DOMContentLoaded', function(){run(); setTimeout(run,300); setTimeout(run,1000); setTimeout(run,2200); setTimeout(run,3800);});
})();
</script>`;

  return new HTMLRewriter()
    .on("body", { element(element) { element.append(patch, { html: true }); } })
    .transform(response);
}
