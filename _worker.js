export default {
  async fetch(request, env, ctx) {
    const response = await env.ASSETS.fetch(request);
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return response;

    let html = await response.text();
    const auditSection = '<div class="section"><h2 class="section-title">İşlem İz Kısa Defteri</h2><div id="globalAuditWrap" class="empty">Yükleniyor...</div></div>';
    const movedAuditSection = '<div class="section"><h2 class="section-title">İşlem Geçmişi ve Denetim Kayıtları</h2><div id="globalAuditWrap" class="empty">Yükleniyor...</div></div>';

    if (html.includes(auditSection) && !html.includes('İşlem Geçmişi ve Denetim Kayıtları')) {
      html = html.replace(auditSection, '');
      html = html.replace('<section id="tab-yedekleme" class="tab-page">', '<section id="tab-yedekleme" class="tab-page">\n      ' + movedAuditSection);
    }

    const patch = `
<style id="alkam-floating-audit-move-style">
  #tab-yedekleme #alkamBusinessAuditPanel{
    position:static!important;right:auto!important;bottom:auto!important;width:auto!important;max-width:none!important;
    margin:0 0 16px!important;border-radius:14px!important;box-shadow:0 8px 24px rgba(15,23,42,.06)!important;
  }
  #tab-yedekleme #alkamBusinessAuditPanel .audit-body{max-height:420px!important}
  body:not(.alkam-audit-panel-moved) #alkamBusinessAuditPanel{display:none!important}
</style>
<script id="alkam-floating-audit-move-script">
(function(){
  function ensureHost(){
    var tab=document.getElementById('tab-yedekleme')||document.getElementById('tab-ayarlar')||document.querySelector('.main')||document.body;
    var host=document.getElementById('alkamFloatingAuditHost');
    if(host) return host;
    host=document.createElement('div');
    host.id='alkamFloatingAuditHost';
    host.className='section';
    host.innerHTML='<h2 class="section-title">İşlem İzi</h2><div id="alkamFloatingAuditSlot"></div>';
    tab.insertBefore(host, tab.firstChild || null);
    return host;
  }
  function moveFloatingAudit(){
    var panel=document.getElementById('alkamBusinessAuditPanel');
    if(!panel) return;
    var host=ensureHost();
    var slot=document.getElementById('alkamFloatingAuditSlot')||host;
    if(panel.parentElement!==slot) slot.appendChild(panel);
    panel.style.display='';
    panel.classList.remove('minimized');
    document.body.classList.add('alkam-audit-panel-moved');
  }
  document.addEventListener('DOMContentLoaded',function(){
    moveFloatingAudit();
    setTimeout(moveFloatingAudit,300);
    setTimeout(moveFloatingAudit,1200);
    setTimeout(moveFloatingAudit,2500);
    setTimeout(moveFloatingAudit,5000);
  });
})();
</script>`;

    html = html.replace("</body>", patch + "\n</body>");
    const headers = new Headers(response.headers);
    headers.set("content-type", "text/html; charset=utf-8");
    headers.set("cache-control", "no-store");
    return new Response(html, { status: response.status, headers });
  }
};
