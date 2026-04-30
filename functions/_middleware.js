export async function onRequest(context) {
  const response = await context.next();
  const url = new URL(context.request.url);
  const contentType = response.headers.get("content-type") || "";
  const isHome = url.pathname === "/" || url.pathname === "/index.html";

  if (!isHome || !contentType.includes("text/html")) return response;

  let html = await response.text();
  const patch = `
<style id="alkam-home-summary-polish-style">
  .alkam-summary-polished{padding:14px!important;display:flex!important;flex-direction:column!important;gap:10px!important;min-height:104px!important;background:#fff!important;border:1px solid #e2e8f0!important;border-radius:14px!important;box-shadow:0 8px 24px rgba(15,23,42,.05)!important}
  .alkam-summary-title{font-size:11px!important;font-weight:950!important;color:#64748b!important;text-transform:uppercase!important;letter-spacing:.04em!important;line-height:1.2!important;margin:0!important}
  .alkam-summary-pairs{display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important;align-items:stretch!important}
  .alkam-summary-pair{border:1px solid #edf2f7!important;background:#fbfdff!important;border-radius:10px!important;padding:9px 10px!important;min-width:0!important}
  .alkam-summary-pair-label{display:block!important;font-size:10px!important;font-weight:950!important;color:#64748b!important;line-height:1.2!important;margin-bottom:5px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
  .alkam-summary-pair-value{display:block!important;font-size:16px!important;font-weight:950!important;color:#0f172a!important;line-height:1.15!important;font-variant-numeric:tabular-nums!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
  @media(max-width:640px){.alkam-summary-pairs{grid-template-columns:1fr!important}.alkam-summary-pair-value{font-size:15px!important}}
</style>
<script id="alkam-home-summary-polish-script">
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
  function polish(){
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
  document.addEventListener('DOMContentLoaded', function(){polish(); setTimeout(polish, 400); setTimeout(polish, 1200);});
})();
</script>`;

  html = html.replace("</body>", `${patch}\n</body>`);
  const headers = new Headers(response.headers);
  headers.set("content-type", "text/html; charset=utf-8");
  return new Response(html, { status: response.status, headers });
}
