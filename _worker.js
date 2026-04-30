export default {
  async fetch(request, env, ctx) {
    const response = await env.ASSETS.fetch(request);
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return response;

    let html = await response.text();
    html = html
      .replace(/\s*<div class="section"><h2 class="section-title">İşlem İz Kısa Defteri<\/h2><div id="globalAuditWrap" class="empty">Yükleniyor\.\.\.<\/div><\/div>/g, "")
      .replace(/\s*<div class="section"><h2 class="section-title">Operasyon İzleri<\/h2><div id="approvalAuditWrap" class="empty">Yükleniyor\.\.\.<\/div><\/div>/g, "")
      .replace(/\s*<div id="auditDetailModal" class="modal-overlay" style="display:none;">[\s\S]*?<div id="auditDetailContent"><\/div>\s*<\/div>\s*<\/div>/g, "");

    const patch = `
<style id="alkam-remove-visible-audit-trace">
  .section:has(#globalAuditWrap),
  .section:has(#approvalAuditWrap),
  #auditDetailModal,
  [data-tab="audit"],
  #tab-audit{display:none!important}
</style>
<script id="alkam-remove-visible-audit-trace-script">
(function(){
  function clean(el){return (el&&el.textContent||'').replace(/\s+/g,' ').trim().toLocaleLowerCase('tr-TR');}
  function removeVisibleAudit(){
    ['globalAuditWrap','approvalAuditWrap','auditDetailModal','tab-audit'].forEach(function(id){
      var el=document.getElementById(id);
      if(!el) return;
      var box=el.closest && el.closest('.section,.panel,.modal-overlay');
      (box||el).remove();
    });
    Array.prototype.slice.call(document.querySelectorAll('h1,h2,h3,.section-title,button,a,.nav-btn,.erp-module-btn,.tab')).forEach(function(el){
      var t=clean(el);
      if(t.indexOf('işlem iz')===0 || t.indexOf('islem iz')===0 || t.indexOf('denetim iz')===0 || t.indexOf('operasyon iz')===0){
        var box=el.closest && el.closest('.section,.panel,.modal-overlay');
        (box||el).remove();
      }
    });
  }
  document.addEventListener('DOMContentLoaded', function(){removeVisibleAudit(); setTimeout(removeVisibleAudit,300); setTimeout(removeVisibleAudit,1200); setTimeout(removeVisibleAudit,2500);});
})();
</script>`;

    html = html.replace("</body>", patch + "\n</body>");
    const headers = new Headers(response.headers);
    headers.set("content-type", "text/html; charset=utf-8");
    headers.set("cache-control", "no-store");
    return new Response(html, { status: response.status, headers });
  }
};
