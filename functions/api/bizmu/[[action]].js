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

function extractTitle(html) {
  const m = String(html || '').match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].replace(/\s+/g, ' ').trim().slice(0, 120) : '';
}

function containsLoginHints(html) {
  const h = String(html || '').toLowerCase();
  return h.includes('password') || h.includes('şifre') || h.includes('sifre') || h.includes('login') || h.includes('giriş') || h.includes('giris');
}

async function safeFetchBizmuLogin(env) {
  if (!env.BIZMU_LOGIN_URL) {
    return {
      reachable: false,
      status: null,
      title: '',
      login_hints_found: false,
      message: 'BIZMU_LOGIN_URL tanımlı değil.'
    };
  }

  try {
    const response = await fetch(env.BIZMU_LOGIN_URL, {
      method: 'GET',
      headers: {
        'user-agent': 'ALKAM-Mali-Readonly-Bizmu-Test/1.0',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    const text = await response.text();
    const title = extractTitle(text);
    const hints = containsLoginHints(text);
    return {
      reachable: response.ok,
      status: response.status,
      status_text: response.statusText,
      title,
      login_hints_found: hints,
      content_type: response.headers.get('content-type') || '',
      message: response.ok
        ? `Bizmu login URL erişilebilir. HTTP ${response.status}. ${title ? 'Başlık: ' + title : 'Başlık okunamadı.'}`
        : `Bizmu login URL cevap verdi ama başarılı değil. HTTP ${response.status}.`
    };
  } catch (err) {
    return {
      reachable: false,
      status: null,
      title: '',
      login_hints_found: false,
      message: 'Bizmu login URL erişim hatası: ' + err.message
    };
  }
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
    const envStatus = {
      has_bizmu_url: Boolean(env.BIZMU_LOGIN_URL),
      has_bizmu_user: Boolean(env.BIZMU_EMAIL),
      has_bizmu_password: Boolean(env.BIZMU_PASSWORD)
    };
    const loginPage = await safeFetchBizmuLogin(env);
    return json({
      ...basePayload,
      message: `${loginPage.message} Şifre kullanılmadı; sadece giriş sayfası erişim testi yapıldı.`,
      worker_ready: true,
      ...envStatus,
      login_page: loginPage
    }, loginPage.reachable ? 200 : 502);
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
