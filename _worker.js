export default {
  async fetch(request, env, ctx) {
    const response = await env.ASSETS.fetch(request);
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return response;

    let html = await response.text();

    const patch = `
<style id="alkam-audit-history-relocation-style">
  body:not(.alkam-audit-relocated) #tab-dashboard .section:has(#globalAuditWrap),
  body:not(.alkam-audit-relocated) #tab-onay .section:has(#approvalAuditWrap){display:none!important}
  #auditDetailModal{z-index:1000000!important}
</style>
<script id="alkam-audit-history-relocation-script">
(function(){
  function titleOf(box){return box && box.querySelector && box.querySelector('.section-title');}
  function ensureAuditArea(){
    var target = document.getElementById('tab-yedekleme') || document.getElementById('tab-ayarlar') || document.querySelector('.main') || document.body;
    var area = document.getElementById('alkamAuditHistoryArea');
    if(area) return area;
    area = document.createElement('div');
    area.id = 'alkamAuditHistoryArea';
    area.className = 'section';
    area.innerHTML = '<h2 class="section-title">İşlem Geçmişi ve Denetim Kayıtları</h2><div id="alkamAuditHistorySlots" class="grid-2"></div>';
    target.appendChild(area);
    return area;
  }
  function moveSection(id, label){
    var wrap = document.getElementById(id);
    if(!wrap) return;
    var section = wrap.closest && wrap.closest('.section');
    if(!section) return;
    var area = ensureAuditArea();
    var slots = document.getElementById('alkamAuditHistorySlots') || area;
    if(section.parentElement !== slots) slots.appendChild(section);
    var title = titleOf(section);
    if(title) title.textContent = label;
    section.style.display = '';
    section.removeAttribute('hidden');
  }
  function relocateAuditHistory(){
    moveSection('globalAuditWrap','İşlem Geçmişi');
    moveSection('approvalAuditWrap','Onay İşlem Geçmişi');
    document.body.classList.add('alkam-audit-relocated');
  }
  document.addEventListener('DOMContentLoaded', function(){
    relocateAuditHistory();
    setTimeout(relocateAuditHistory,300);
    setTimeout(relocateAuditHistory,1200);
    setTimeout(relocateAuditHistory,2500);
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
