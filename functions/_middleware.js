export async function onRequest(context) {
  const response = await context.next();
  const url = new URL(context.request.url);
  const contentType = response.headers.get("content-type") || "";
  const isHome = url.pathname === "/" || url.pathname === "/index.html";

  if (!isHome || !contentType.includes("text/html")) return response;

  let html = await response.text();
  const patch = `
<style id="alkam-international-ui-polish-style">
  :root{--alkam-report-line:#e2e8f0;--alkam-report-soft:#fbfdff;--alkam-report-text:#0f172a;--alkam-report-muted:#64748b;--alkam-report-blue:#1769e8;--alkam-report-green:#059669;--alkam-report-red:#b91c1c;}
  .alkam-summary-polished{padding:14px!important;display:flex!important;flex-direction:column!important;gap:10px!important;min-height:104px!important;background:#fff!important;border:1px solid var(--alkam-report-line)!important;border-radius:14px!important;box-shadow:0 8px 24px rgba(15,23,42,.05)!important}
  .alkam-summary-title{font-size:11px!important;font-weight:950!important;color:var(--alkam-report-muted)!important;text-transform:uppercase!important;letter-spacing:.04em!important;line-height:1.2!important;margin:0!important}
  .alkam-summary-pairs{display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important;align-items:stretch!important}
  .alkam-summary-pair{border:1px solid #edf2f7!important;background:var(--alkam-report-soft)!important;border-radius:10px!important;padding:9px 10px!important;min-width:0!important}
  .alkam-summary-pair-label{display:block!important;font-size:10px!important;font-weight:950!important;color:var(--alkam-report-muted)!important;line-height:1.2!important;margin-bottom:5px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
  .alkam-summary-pair-value{display:block!important;font-size:16px!important;font-weight:950!important;color:var(--alkam-report-text)!important;line-height:1.15!important;font-variant-numeric:tabular-nums!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
  .alkam-report-standard .section-title,.alkam-report-standard h2,.alkam-report-standard h3{letter-spacing:0!important;line-height:1.2!important}
  .alkam-report-standard table{border-collapse:separate!important;border-spacing:0!important;background:#fff!important}
  .alkam-report-standard th{font-size:11px!important;text-transform:uppercase!important;letter-spacing:.03em!important;color:#334155!important;background:#f8fbff!important;white-space:nowrap!important}
  .alkam-report-standard td{font-size:12px!important;line-height:1.38!important;color:#1e293b!important}
  .alkam-report-standard td,.alkam-report-standard th{border-bottom:1px solid var(--alkam-report-line)!important}
  .alkam-report-standard .text-right,.alkam-report-standard .num,.alkam-report-standard td[class*="num"],.alkam-report-standard td:nth-child(n+4){font-variant-numeric:tabular-nums!important}
  .alkam-report-standard .empty{background:#fbfdff!important;border:1px dashed #cbd5e1!important;color:#64748b!important;font-size:12px!important;font-weight:850!important}
  .alkam-fin-card{padding:13px!important;border-radius:12px!important;border:1px solid var(--alkam-report-line)!important;background:#fff!important;box-shadow:0 6px 18px rgba(15,23,42,.04)!important;min-height:86px!important;display:flex!important;flex-direction:column!important;gap:7px!important}
  .alkam-fin-card .k{font-size:10px!important;font-weight:950!important;color:var(--alkam-report-muted)!important;text-transform:uppercase!important;letter-spacing:.04em!important;line-height:1.2!important}
  .alkam-fin-card .v{font-size:18px!important;font-weight:950!important;color:var(--alkam-report-text)!important;font-variant-numeric:tabular-nums!important;line-height:1.15!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
  .alkam-fin-head{align-items:flex-start!important;border:1px solid var(--alkam-report-line)!important;background:#fff!important;border-radius:14px!important;padding:14px!important;margin-bottom:12px!important;box-shadow:0 8px 24px rgba(15,23,42,.04)!important}
  .alkam-fin-title{font-size:20px!important;margin:0 0 5px!important;line-height:1.2!important}
  .alkam-fin-sub{font-size:12px!important;color:var(--alkam-report-muted)!important;font-weight:750!important;line-height:1.45!important}
  .alkam-fin-table-wrap{border:1px solid var(--alkam-report-line)!important;border-radius:12px!important;overflow:auto!important;background:#fff!important}
  .alkam-fin-table th,.alkam-fin-table td{padding:9px 8px!important;vertical-align:top!important}
  .alkam-fin-table td:not(:first-child){text-align:right!important;font-variant-numeric:tabular-nums!important;white-space:nowrap!important}
  .alkam-fin-note{font-size:11px!important;color:#475569!important;background:#fbfdff!important;border-radius:12px!important;line-height:1.5!important}
  .alkam-fin-actions{gap:8px!important;align-items:center!important}.alkam-fin-actions input,.alkam-fin-actions button{height:36px!important;border-radius:9px!important;font-size:12px!important}
  .alkam-kpi-clean-label{white-space:normal!important;overflow-wrap:anywhere!important}.alkam-kpi-clean-value{font-variant-numeric:tabular-nums!important}
  @media(max-width:900px){.alkam-summary-pairs{grid-template-columns:1fr!important}.alkam-summary-pair-value{font-size:15px!important}.alkam-fin-card .v{font-size:16px!important}.alkam-fin-head{display:block!important}.alkam-fin-actions{margin-top:10px!important;display:grid!important;grid-template-columns:1fr!important}.alkam-fin-actions button,.alkam-fin-actions input{width:100%!important}}
</style>
<script id="alkam-international-ui-polish-script">
(function(){
  function text(el){return (el && el.textContent || '').replace(/\s+/g,' ').trim();}
  function labelsFor(title){
    if(/İşletme\s*\/\s*Bilanço|Isletme\s*\/\s*Bilanco/i.test(title)) return {title:'Cari Defter Türü', labels:['İşletme','Bilanço']};
    if(/Ltd\s*\/\s*A\.Ş\.|Ltd\s*\/\s*A\.S\./i.test(title)) return {title:'Şirket Türü', labels:['Ltd','A.Ş.']};
    if(/Bu Ay\s*T\/T/i.test(title)) return {title:'Bu Ay', labels:['Tahakkuk','Tahsilat']};
    if(/Bu Yıl\s*T\/T|Bu Yil\s*T\/T/i.test(title)) return {title:'Bu Yıl', labels:['Tahakkuk','Tahsilat']};
    if(/Bu Ay\s*Gider/i.test(title)) return {title:'Bu Ay Gider', labels:['Tahakkuk','Ödenen']};
    if(/Bu Yıl\s*Gider|Bu Yil\s*Gider/i.test(title)) return {title:'Bu Yıl Gider', labels:['Tahakkuk','Ödenen']};
    return null;
  }
  function splitValue(value){
    var parts = value.split('/').map(function(v){return v.trim();}).filter(Boolean);
    if(parts.length < 2) parts = [value || '0', '-'];
    return [parts[0], parts.slice(1).join(' / ')];
  }
  function normalizeTerms(root){
    Array.prototype.slice.call(root.querySelectorAll('.card-label,.card-value,.metric-mini .k,.alkam-fin-card .k,th,td')).forEach(function(el){
      if(el.dataset.alkamTermFixed==='1') return;
      var s = el.textContent || '';
      var fixed = s.replace(/\bT\/T\b/g,'Tahakkuk / Tahsilat').replace(/\bYTD\b/g,'Yılbaşından Bugüne');
      if(fixed !== s){el.textContent = fixed; el.dataset.alkamTermFixed='1';}
    });
  }
  function polishSummaryCards(){
    var cards = Array.prototype.slice.call(document.querySelectorAll('.card'));
    cards.forEach(function(card){
      if(card.dataset.alkamSummaryPolished === '1') return;
      var labelEl = card.querySelector('.card-label');
      var valueEl = card.querySelector('.card-value');
      var label = text(labelEl);
      var value = text(valueEl);
      var spec = labelsFor(label);
      if(!spec || !value) return;
      var values = splitValue(value);
      card.dataset.alkamSummaryPolished = '1';
      card.classList.add('alkam-summary-polished');
      card.innerHTML = '<div class="alkam-summary-title">'+spec.title+'</div>'+
        '<div class="alkam-summary-pairs">'+
          '<div class="alkam-summary-pair"><span class="alkam-summary-pair-label">'+spec.labels[0]+'</span><span class="alkam-summary-pair-value">'+values[0]+'</span></div>'+
          '<div class="alkam-summary-pair"><span class="alkam-summary-pair-label">'+spec.labels[1]+'</span><span class="alkam-summary-pair-value">'+values[1]+'</span></div>'+
        '</div>';
    });
  }
  function markReportAreas(){
    document.body.classList.add('alkam-report-standard');
    Array.prototype.slice.call(document.querySelectorAll('.card-label,.metric-mini .k')).forEach(function(el){el.classList.add('alkam-kpi-clean-label');});
    Array.prototype.slice.call(document.querySelectorAll('.card-value,.metric-mini .v')).forEach(function(el){el.classList.add('alkam-kpi-clean-value');});
  }
  function polishFinanceCards(){
    Array.prototype.slice.call(document.querySelectorAll('.alkam-fin-card .k')).forEach(function(k){
      var s = text(k);
      k.textContent = s.replace(' / Bu Ay','');
    });
  }
  function polish(){markReportAreas(); normalizeTerms(document); polishSummaryCards(); polishFinanceCards();}
  document.addEventListener('DOMContentLoaded', function(){polish(); setTimeout(polish,400); setTimeout(polish,1200); setTimeout(polish,2500);});
})();
</script>`;

  html = html.replace("</body>", `${patch}\n</body>`);
  const headers = new Headers(response.headers);
  headers.set("content-type", "text/html; charset=utf-8");
  return new Response(html, { status: response.status, headers });
}
