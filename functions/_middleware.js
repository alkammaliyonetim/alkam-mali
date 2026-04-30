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
  @media(max-width:640px){.alkam-summary-fixed-grid{grid-template-columns:1fr!important}.alkam-summary-fixed-value{font-size:15px!important}}
</style>
<script id="alkam-summary-card-fix-script">
(function(){
  function cleanText(el){return (el && el.textContent || '').replace(/\s+/g,' ').trim();}
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
  document.addEventListener('DOMContentLoaded', function(){fixCards(); setTimeout(fixCards, 300); setTimeout(fixCards, 1000); setTimeout(fixCards, 2200);});
})();
</script>`;

  return new HTMLRewriter()
    .on("body", { element(element) { element.append(patch, { html: true }); } })
    .transform(response);
}
