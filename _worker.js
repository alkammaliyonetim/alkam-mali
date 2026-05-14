export default {
  async fetch(request, env, ctx) {
    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    const contentType = headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return response;

    let html = await response.text();
    const newestFirst = '<script src="/alkam-hotfix-newest-first.js?v=20260514b"></script>';
    const periodFilter = '<script src="/alkam-hotfix-period-filter.js?v=20260514a"></script>';
    const cariSummary = '<script src="/alkam-hotfix-cari-summary.js?v=20260514a"></script>';
    const cariListRisk = '<script src="/alkam-hotfix-cari-list-risk.js?v=20260514a"></script>';
    const mobileCariJump = '<script src="/alkam-hotfix-mobile-cari-jump.js?v=20260514a"></script>';
    const selectedCariSticky = '<script src="/alkam-hotfix-selected-cari-sticky.js?v=20260514a"></script>';
    const mobileStatementCards = '<script src="/alkam-hotfix-mobile-statement-cards.js?v=20260514a"></script>';
    const bankImport = '<script src="/alkam-bank-import-v1.js?v=20260514a"></script>';
    if (!html.includes('alkam-hotfix-newest-first.js')) {
      html = html.replace('</body>', newestFirst + '</body>');
    }
    if (!html.includes('alkam-hotfix-period-filter.js')) {
      html = html.replace('</body>', periodFilter + '</body>');
    }
    if (!html.includes('alkam-hotfix-cari-summary.js')) {
      html = html.replace('</body>', cariSummary + '</body>');
    }
    if (!html.includes('alkam-hotfix-cari-list-risk.js')) {
      html = html.replace('</body>', cariListRisk + '</body>');
    }
    if (!html.includes('alkam-hotfix-mobile-cari-jump.js')) {
      html = html.replace('</body>', mobileCariJump + '</body>');
    }
    if (!html.includes('alkam-hotfix-selected-cari-sticky.js')) {
      html = html.replace('</body>', selectedCariSticky + '</body>');
    }
    if (!html.includes('alkam-hotfix-mobile-statement-cards.js')) {
      html = html.replace('</body>', mobileStatementCards + '</body>');
    }
    if (!html.includes('alkam-bank-import-v1.js')) {
      html = html.replace('</body>', bankImport + '</body>');
    }

    headers.set('content-type', 'text/html; charset=utf-8');
    headers.set('cache-control', 'no-store');
    headers.delete('content-length');
    return new Response(html, { status: response.status, statusText: response.statusText, headers });
  }
};
