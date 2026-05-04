export default {
  async fetch(request, env, ctx) {
    const response = await env.ASSETS.fetch(request);
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return response;

    let html = await response.text();

    html = html.replace(
      "function sd(v){try{return typeof shortDate==='function'?shortDate(v)}catch(e){return String(v||'-').slice(0,10)||'-'}}",
      "function sd(v){try{return typeof shortDate==='function'?shortDate(v):String(v||'-').slice(0,10)||'-'}catch(e){return String(v||'-').slice(0,10)||'-'}}"
    );

    html = html.replace(
      'cariler:["Cariler","Dinamik cari, kart yönetimi ve tahsilat görünümü"],hesaplar:',
      'cariler:["Cariler","Dinamik cari, kart yönetimi ve tahsilat görünümü"],cari_toplu_tahakkuk:["Cari Toplu Tahakkuk","Toplu tahakkuk kontrolü ve onay hazırlığı"],hesaplar:'
    );

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
    headers.set("cache-control", "no-store");
    return new Response(html, { status: response.status, headers });
  }
};
