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

function maskEmail(value) {
  const s = String(value || '');
  const [name, domain] = s.split('@');
  if (!name || !domain) return Boolean(s) ? '***' : '';
  return `${name.slice(0, 2)}***@${domain}`;
}

async function closeBrowser(browser) {
  if (!browser) return;
  try { await browser.close(); } catch (_) {}
}

async function openBizmuLogin(env) {
  const targetUrl = env.BIZMU_LOGIN_URL || 'https://uygulama.bizmu.com/642737';
  const browser = await puppeteer.launch(env.MYBROWSER);
  const page = await browser.newPage();
  await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 });
  return { browser, page, targetUrl };
}

async function getBodyPreview(page, limit = 1200) {
  return page.evaluate((max) => document.body ? document.body.innerText.slice(0, max) : '', limit);
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
        const opened = await openBizmuLogin(env);
        browser = opened.browser;
        const page = opened.page;
        const title = await page.title();
        const currentUrl = page.url();
        const bodyText = await getBodyPreview(page, 1500);
        await closeBrowser(browser);
        return json({
          ok: true,
          readonly: true,
          service: 'bizmu-browser-bot',
          message: 'Browser Run ile Bizmu giriş sayfası açıldı. Şifre kullanılmadı.',
          target_url: opened.targetUrl,
          current_url: currentUrl,
          title,
          body_preview: bodyText,
          at: nowTR()
        });
      } catch (err) {
        await closeBrowser(browser);
        return json({ ok: false, service: 'bizmu-browser-bot', message: 'Browser Run test hatası: ' + err.message, at: nowTR() }, 500);
      }
    }

    if (path === '/login-form-detect') {
      let browser;
      try {
        const opened = await openBizmuLogin(env);
        browser = opened.browser;
        const page = opened.page;
        const title = await page.title();
        const currentUrl = page.url();
        const detected = await page.evaluate(() => {
          const clean = (v) => String(v || '').replace(/\s+/g, ' ').trim().slice(0, 120);
          const inputs = Array.from(document.querySelectorAll('input')).map((el, i) => ({
            index: i,
            type: clean(el.getAttribute('type')) || 'text',
            name: clean(el.getAttribute('name')),
            id: clean(el.getAttribute('id')),
            placeholder: clean(el.getAttribute('placeholder')),
            autocomplete: clean(el.getAttribute('autocomplete')),
            aria_label: clean(el.getAttribute('aria-label')),
            visible: Boolean(el.offsetWidth || el.offsetHeight || el.getClientRects().length)
          }));
          const buttons = Array.from(document.querySelectorAll('button, input[type="submit"], [role="button"]')).map((el, i) => ({
            index: i,
            tag: el.tagName.toLowerCase(),
            type: clean(el.getAttribute('type')),
            text: clean(el.innerText || el.value),
            id: clean(el.getAttribute('id')),
            name: clean(el.getAttribute('name')),
            visible: Boolean(el.offsetWidth || el.offsetHeight || el.getClientRects().length)
          }));
          return {
            input_count: inputs.length,
            button_count: buttons.length,
            has_password_input: inputs.some(x => String(x.type).toLowerCase() === 'password'),
            has_email_like_input: inputs.some(x => {
              const bag = `${x.type} ${x.name} ${x.id} ${x.placeholder} ${x.autocomplete} ${x.aria_label}`.toLowerCase();
              return bag.includes('email') || bag.includes('e-posta') || bag.includes('eposta') || bag.includes('user') || bag.includes('kullanıcı') || bag.includes('kullanici');
            }),
            inputs,
            buttons
          };
        });
        await closeBrowser(browser);
        return json({ ok: true, readonly: true, service: 'bizmu-browser-bot', message: 'Bizmu login form alanları tespit edildi. Şifre kullanılmadı.', target_url: opened.targetUrl, current_url: currentUrl, title, detected, at: nowTR() });
      } catch (err) {
        await closeBrowser(browser);
        return json({ ok: false, service: 'bizmu-browser-bot', message: 'Login form tespit hatası: ' + err.message, at: nowTR() }, 500);
      }
    }

    if (path === '/login-check') {
      let browser;
      try {
        if (!env.BIZMU_EMAIL || !env.BIZMU_PASSWORD) {
          return json({ ok: false, service: 'bizmu-browser-bot', message: 'BIZMU_EMAIL veya BIZMU_PASSWORD secret eksik.', at: nowTR() }, 400);
        }

        const opened = await openBizmuLogin(env);
        browser = opened.browser;
        const page = opened.page;

        await page.waitForSelector('#username', { timeout: 15000 });
        await page.waitForSelector('#password', { timeout: 15000 });

        await page.click('#username', { clickCount: 3 });
        await page.type('#username', env.BIZMU_EMAIL, { delay: 20 });
        await page.click('#password', { clickCount: 3 });
        await page.type('#password', env.BIZMU_PASSWORD, { delay: 20 });

        await Promise.allSettled([
          page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 25000 }),
          page.click('#kc-login')
        ]);

        await new Promise(resolve => setTimeout(resolve, 3000));

        const title = await page.title();
        const currentUrl = page.url();
        const bodyText = await getBodyPreview(page, 1800);
        const lower = `${title}\n${currentUrl}\n${bodyText}`.toLowerCase();
        const stillLogin = lower.includes('oturum aç') || lower.includes('giriş yap') || lower.includes('parolanız') || lower.includes('e-posta adresiniz');
        const invalidHint = lower.includes('geçersiz') || lower.includes('invalid') || lower.includes('hatalı') || lower.includes('yanlış');
        const successLikely = !stillLogin && !invalidHint && currentUrl.includes('uygulama.bizmu.com');

        await closeBrowser(browser);

        return json({
          ok: true,
          readonly: true,
          service: 'bizmu-browser-bot',
          message: successLikely ? 'Bizmu giriş denemesi başarılı görünüyor. Veri okunmadı, kayıt değiştirilmedi.' : 'Bizmu giriş denemesi tamamlandı ama başarı kesin değil; sayfa hâlâ giriş ekranı olabilir.',
          login_success_likely: successLikely,
          still_login_page: stillLogin,
          invalid_credential_hint: invalidHint,
          used_email_masked: maskEmail(env.BIZMU_EMAIL),
          target_url: opened.targetUrl,
          current_url: currentUrl,
          title,
          body_preview: bodyText,
          at: nowTR()
        });
      } catch (err) {
        await closeBrowser(browser);
        return json({ ok: false, service: 'bizmu-browser-bot', message: 'Login kontrol hatası: ' + err.message, at: nowTR() }, 500);
      }
    }

    if (path === '/credential-check') {
      return json({ ok: true, readonly: true, service: 'bizmu-browser-bot', message: 'Gizli değişken kontrolü yapıldı; değerler gösterilmez.', has_bizmu_url: Boolean(env.BIZMU_LOGIN_URL), has_bizmu_email: Boolean(env.BIZMU_EMAIL), has_bizmu_password: Boolean(env.BIZMU_PASSWORD), at: nowTR() });
    }

    return json({ ok: false, message: 'Bilinmeyen endpoint. Kullanılabilir endpointler: /health, /credential-check, /login-page-test, /login-form-detect, /login-check', path }, 404);
  }
};
