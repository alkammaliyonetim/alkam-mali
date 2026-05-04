export default {
  async fetch(request, env, ctx) {
    const response = await env.ASSETS.fetch(request);
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return response;

    let html = await response.text();
    const patch = `
<style id="alkam-hide-floating-audit-panel">
  #alkamBusinessAuditPanel,
  #alkamAuditTrailDashboardCard{
    display:none!important;
    visibility:hidden!important;
    pointer-events:none!important;
  }
</style>`;

    html = html.replace("</head>", patch + "\n</head>");
    const headers = new Headers(response.headers);
    headers.set("content-type", "text/html; charset=utf-8");
    return new Response(html, { status: response.status, headers });
  }
};
