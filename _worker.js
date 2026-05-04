export default {
  async fetch(request, env, ctx) {
    const response = await env.ASSETS.fetch(request);
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return response;

    let html = await response.text();
    const hide = '<style id="alkam-hide-islem-izi-panel">#alkamBusinessAuditPanel,#alkamAuditTrailDashboardCard,.alkam-business-audit-panel,.business-audit-panel,.audit-trail-dashboard-card{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;}</style>';
    const files = ['alkam-reliability-guard-v1.js','alkam-cari-core-v4.js','alkam-last-amounts-v4g.js','alkam-data-quality-v1.js','alkam-tahakkuk-v5.js','alkam-tahakkuk-control-v5c.js','alkam-balance-highlight-v1.js','alkam-professional-ui-v1.js','alkam-finans-flow-v6.js','alkam-finans-ui-v6.js','alkam-tahsilat-v7.js','alkam-tahsilat-ui-v7.js','alkam-moka-ui-v6.js','alkam-banka-onay-v8.js','alkam-banka-onay-ui-v8.js','alkam-banka-import-ui-v8.js','alkam-banka-file-import-v8.js','alkam-banka-import-guard-v8.js','alkam-banka-import-errors-v8.js','alkam-banka-template-v8.js','alkam-banka-history-v8.js','alkam-banka-history-export-v8.js','alkam-guvenilirlik-raporu-v9.js','alkam-guvenilirlik-export-v9.js','alkam-kritik-uyari-v9.js','alkam-saglik-kontrol-v9.js','alkam-gunluk-kontrol-v9.js','alkam-tek-kontrol-rozeti-v9.js','alkam-gunluk-kontrol-export-v9.js','alkam-modul-registry-v10.js','alkam-system-manifest-v10.js'];
    let scripts = files.map((src)=>'<script src="/'+src+'"></script>').join('');
    scripts += '<script src="/alkam-loader-kontrol-v10.js"></script>';
    scripts += '<script src="/alkam-migration-precheck-v10.js"></script>';
    scripts += '<script src="/supabase-config.example.js"></script>';
    scripts += '<script src="/alkam-supabase-baglanti-test-v10.js"></script>';
    html = html.replace('</head>', hide + scripts + '</head>');

    const headers = new Headers(response.headers);
    headers.set('content-type', 'text/html; charset=utf-8');
    headers.set('cache-control', 'no-store');
    return new Response(html, { status: response.status, headers });
  }
};
