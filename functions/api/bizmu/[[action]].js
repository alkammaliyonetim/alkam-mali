function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,POST,OPTIONS',
      'access-control-allow-headers': 'content-type,authorization'
    }
  });
}

function nowTR() {
  return new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });
}

function getActionFromUrl(request) {
  const url = new URL(request.url);
  const parts = url.pathname.split('/').filter(Boolean);
  return parts[2] || '';
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return json({ ok: true, message: 'CORS hazır.' });
  }

  const action = getActionFromUrl(request);
  const method = request.method;

  if (!['GET', 'POST'].includes(method)) {
    return json({ ok: false, message: 'Bu endpoint sadece GET/POST kabul eder.' }, 405);
  }

  const basePayload = {
    ok: true,
    readonly: true,
    source: 'ALKAM Mali Bizmu Worker',
    action,
    at: nowTR()
  };

  if (action === 'login-test') {
    return json({
      ...basePayload,
      message: 'Bizmu login-test endpoint çalışıyor. Bu aşama sadece Worker bağlantı testidir; Bizmu şifresi kullanılmadı.',
      worker_ready: true,
      has_bizmu_url: Boolean(env.BIZMU_LOGIN_URL),
      has_bizmu_user: Boolean(env.BIZMU_EMAIL),
      has_bizmu_password: Boolean(env.BIZMU_PASSWORD)
    });
  }

  if (action === 'menu-scan') {
    return json({
      ...basePayload,
      message: 'Menü tarama endpointi hazır. Gerçek Bizmu taraması bir sonraki aşamada Browser Run / Puppeteer ile bağlanacak.',
      menus: []
    });
  }

  if (action === 'clients-sync') {
    return json({
      ...basePayload,
      message: 'Cari liste çekme endpointi hazır. Şu an readonly test modunda; ana kayda veri yazmaz.',
      staging_count: 0,
      pending_count: 0
    });
  }

  if (action === 'transactions-sync') {
    return json({
      ...basePayload,
      message: 'Cari ekstre çekme endpointi hazır. Şu an readonly test modunda; ana kayda veri yazmaz.',
      staging_count: 0,
      pending_count: 0
    });
  }

  if (action === 'staging-summary') {
    return json({
      ...basePayload,
      message: 'Staging kontrol endpointi çalışıyor. Henüz staging kaydı yok.',
      staging_count: 0,
      pending_count: 0,
      summary: [
        { type: 'Cari Listesi', total: 0, clean: 0, duplicate: 0, pending: 0 },
        { type: 'Cari Ekstre', total: 0, clean: 0, duplicate: 0, pending: 0 }
      ]
    });
  }

  if (action === 'send-to-approval') {
    return json({
      ...basePayload,
      message: 'Onaya sunma endpointi hazır. Bu aşamada ana kayda aktarım yapılmadı.',
      staging_count: 0,
      pending_count: 0
    });
  }

  if (action === 'logs') {
    return json({
      ...basePayload,
      message: 'Log endpointi hazır.',
      logs: [
        { at: nowTR(), level: 'info', message: 'Bizmu Worker readonly test modunda hazır.' }
      ]
    });
  }

  return json({
    ...basePayload,
    ok: false,
    message: `Bilinmeyen Bizmu endpointi: ${action}`
  }, 404);
}
