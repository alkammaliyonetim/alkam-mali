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

    const headers = new Headers(response.headers);
    headers.set("content-type", "text/html; charset=utf-8");
    headers.set("cache-control", "no-store");
    return new Response(html, { status: response.status, headers });
  }
};
