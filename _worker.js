export default {
  async fetch(request, env, ctx) {
    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    const contentType = headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return response;
    let html = await response.text();
    const readyList = 'alkam-bank-' + 'prepared-' + 'list-v1.js?v=safe-bank-ready-20260515a';
    const postLayer = 'alkam-bank-' + 'post-' + 'ledger-v1.js?v=safe-bank-post-20260515a';
    const opCenter = 'alkam-operation-' + 'suggest-v1.js?v=op-suggest-20260515a';
    const opDue = 'alkam-operation-' + 'due-v1.js?v=op-due-20260515a';
    const opAlarm = 'alkam-operation-' + 'alarm-v1.js?v=op-alarm-20260515a';
    const stickyCari = 'alkam-hotfix-' + 'sticky-' + 'cari-header.js?v=20260516b';
    const lucaSync = 'alkam-luca-' + 'sync-v1.js?v=20260516b';
    const tgMini = 'alkam-tg-v1.js?v=20260516a';
    const tgV2 = 'alkam-tg-v2.js?v=20260516a';
    const tgV3 = 'alkam-tg-v3-import.js?v=20260517a';
    const list = [
      'alkam-hotfix-newest-first.js?v=20260514b',
      'alkam-hotfix-period-filter.js?v=20260514a',
      'alkam-hotfix-cari-summary.js?v=20260514a',
      'alkam-hotfix-cari-list-risk.js?v=20260514a',
      'alkam-hotfix-mobile-cari-jump.js?v=20260516a',
      stickyCari,
      lucaSync,
      'alkam-bank-import-v1.js?v=safe-bank-import-20260515a',
      'alkam-bank-onay-center-v1.js?v=safe-bank-onay-20260515a',
      'alkam-bank-cari-suggest-v1.js?v=safe-bank-cari-suggest-20260515a',
      'alkam-bank-cari-prepare-v1.js?v=safe-bank-cari-prepare-20260515a',
      readyList,
      postLayer,
      opCenter,
      opDue,
      opAlarm,
      tgMini,
      tgV2,
      tgV3,
      'alkam-topbar-build-v1.js?v=6740480'
    ];
    for (const item of list) {
      const file = item.split('?')[0];
      if (!html.includes(file)) html = html.replace('</body>', '<script src="/' + item + '"></script></body>');
    }
    headers.set('content-type', 'text/html; charset=utf-8');
    headers.set('cache-control', 'no-store');
    headers.delete('content-length');
    return new Response(html, { status: response.status, statusText: response.statusText, headers });
  }
};
