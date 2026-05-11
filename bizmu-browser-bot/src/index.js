import puppeteer from '@cloudflare/puppeteer';

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

async function closeBrowser(browser) {
  if (!browser) return;
  try { await browser.close(); } catch (_) {}
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return json({ ok: true, message: 'CORS hazır.' });

    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/' || path === '/health') {
      return json({
        ok: true,
        service: 'bizmu-browser-bot',
        message: 'Bizmu Browser Bot Worker çalışıyor.',
        has_browser_binding: Boolean(env.MYBROWSER),
        has_bizmu_url: Boolean(env.BIZMU_LOGIN_URL),
        has_bizmu_email: Boolean(env.BIZMU_EMAIL),
        has_bizmu_password: Boolean(env.BIZMU_PASSWORD),
        at: nowTR()
      });
    }

    if (path === '/login-page-test') {
      let browser;
      try {
        const targetUrl = env.BIZMU_LOGIN_URL || 'https://uygulama.bizmu.com/642737';
        browser = await puppeteer.launch(env.MYBROWSER);
        const page = await browser.newPage();
        await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 });
        const title = await page.title();
        const currentUrl = page.url();
        const bodyText = await page.evaluate(() => document.body ? document.body.innerText.slice(0, 1500) : '');
        await closeBrowser(browser);
        return json({
          ok: true,
          readonly: true,
          service: 'bizmu-browser-bot',
          message: 'Browser Run ile Bizmu giriş sayfası açıldı. Şifre kullanılmadı.',
          target_url: targetUrl,
          current_url: currentUrl,
          title,
          body_preview: bodyText,
          at: nowTR()
        });
      } catch (err) {
        await closeBrowser(browser);
        return json({
          ok: false,
          service: 'bizmu-browser-bot',
          message: 'Browser Run test hatası: ' + err.message,
          at: nowTR()
        }, 500);
      }
    }

    if (path === '/credential-check') {
      return json({
        ok: true,
        readonly: true,
        service: 'bizmu-browser-bot',
        message: 'Gizli değişken kontrolü yapıldı; değerler gösterilmez.',
        has_bizmu_url: Boolean(env.BIZMU_LOGIN_URL),
        has_bizmu_email: Boolean(env.BIZMU_EMAIL),
        has_bizmu_password: Boolean(env.BIZMU_PASSWORD),
        at: nowTR()
      });
    }

    return json({
      ok: false,
      message: 'Bilinmeyen endpoint. Kullanılabilir endpointler: /health, /credential-check, /login-page-test',
      path
    }, 404);
  }
};
