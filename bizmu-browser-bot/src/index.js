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

async function loginToBizmu(env) {
  if (!env.BIZMU_EMAIL || !env.BIZMU_PASSWORD) throw new Error('BIZMU_EMAIL veya BIZMU_PASSWORD secret eksik.');
  const opened = await openBizmuLogin(env);
  const { browser, page } = opened;
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
  return { ...opened, browser, page };
}

async function loginState(page) {
  const title = await page.title();
  const currentUrl = page.url();
  const bodyText = await getBodyPreview(page, 1800);
  const lower = `${title}\n${currentUrl}\n${bodyText}`.toLowerCase();
  const stillLogin = lower.includes('oturum aç') || lower.includes('giriş yap') || lower.includes('parolanız') || lower.includes('e-posta adresiniz');
  const invalidHint = lower.includes('geçersiz') || lower.includes('invalid') || lower.includes('hatalı') || lower.includes('yanlış');
  const successLikely = !stillLogin && !invalidHint && currentUrl.includes('uygulama.bizmu.com');
  return { title, currentUrl, bodyText, stillLogin, invalidHint, successLikely };
}

async function detectForm(page) {
  return page.evaluate(() => {
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
      has_email_like_input: inputs.some(x => `${x.type} ${x.name} ${x.id} ${x.placeholder} ${x.autocomplete} ${x.aria_label}`.toLowerCase().match(/email|e-posta|eposta|user|kullanıcı|kullanici/)),
      inputs,
      buttons
    };
  });
}

async function scanPostLogin(page) {
  return page.evaluate(() => {
    const clean = (v) => String(v || '').replace(/\s+/g, ' ').trim().slice(0, 160);
    const hrefAbs = (href) => {
      try { return href ? new URL(href, location.href).href : ''; } catch (_) { return href || ''; }
    };
    const linksRaw = Array.from(document.querySelectorAll('a[href]')).map((a, i) => ({
      index: i,
      text: clean(a.innerText || a.textContent || a.getAttribute('aria-label')),
      href: hrefAbs(a.getAttribute('href')),
      visible: Boolean(a.offsetWidth || a.offsetHeight || a.getClientRects().length)
    })).filter(x => x.text || x.href);
    const buttonsRaw = Array.from(document.querySelectorAll('button, [role="button"]')).map((b, i) => ({
      index: i,
      text: clean(b.innerText || b.textContent || b.getAttribute('aria-label')),
      id: clean(b.getAttribute('id')),
      className: clean(b.getAttribute('class')),
      visible: Boolean(b.offsetWidth || b.offsetHeight || b.getClientRects().length)
    })).filter(x => x.text || x.id || x.className);
    const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4')).map((h, i) => ({
      index: i,
      tag: h.tagName.toLowerCase(),
      text: clean(h.innerText || h.textContent),
      visible: Boolean(h.offsetWidth || h.offsetHeight || h.getClientRects().length)
    })).filter(x => x.text);
    const importantKeywords = ['güncel durumum','gelirler','giderler','nakit','ürünler','raporlar','fatura','e-belgeler','müşteri','tedarikçi','cari','banka','kasa','stok','tahsilat','ödeme'];
    const importantLinks = linksRaw.filter(x => importantKeywords.some(k => `${x.text} ${x.href}`.toLowerCase().includes(k))).slice(0, 80);
    const uniqueLinks = [];
    const seen = new Set();
    for (const link of linksRaw) {
      const key = `${link.text}|${link.href}`;
      if (!seen.has(key)) { seen.add(key); uniqueLinks.push(link); }
      if (uniqueLinks.length >= 120) break;
    }
    return { url: location.href, title: document.title, body_preview: clean(document.body ? document.body.innerText.slice(0, 2500) : ''), counts: { links: linksRaw.length, buttons: buttonsRaw.length, headings: headings.length }, headings: headings.slice(0, 60), important_links: importantLinks, links: uniqueLinks, buttons: buttonsRaw.slice(0, 80) };
  });
}

async function scanCustomers(page, baseUrl) {
  const customersUrl = `${baseUrl.replace(/\/$/, '')}/musteriler`;
  await page.goto(customersUrl, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(resolve => setTimeout(resolve, 3000));
  return page.evaluate(() => {
    const clean = (v) => String(v || '').replace(/\s+/g, ' ').trim();
    const hrefAbs = (href) => {
      try { return href ? new URL(href, location.href).href : ''; } catch (_) { return href || ''; }
    };
    const bodyText = clean(document.body ? document.body.innerText : '');
    const links = Array.from(document.querySelectorAll('a[href]')).map((a, i) => ({
      index: i,
      text: clean(a.innerText || a.textContent || a.getAttribute('aria-label')).slice(0, 240),
      href: hrefAbs(a.getAttribute('href')),
      visible: Boolean(a.offsetWidth || a.offsetHeight || a.getClientRects().length)
    })).filter(x => x.text || x.href);
    const customerLinks = links.filter(x => /\/musteriler\//.test(x.href) && !/\/musteriler\/yeni/.test(x.href)).slice(0, 150);
    const rows = Array.from(document.querySelectorAll('tr, [role="row"], .ember-view')).map((el, i) => {
      const text = clean(el.innerText || el.textContent).slice(0, 500);
      const href = el.querySelector && el.querySelector('a[href]') ? hrefAbs(el.querySelector('a[href]').getAttribute('href')) : '';
      return { index: i, text, href, visible: Boolean(el.offsetWidth || el.offsetHeight || el.getClientRects().length) };
    }).filter(x => x.text && x.text.length > 2);
    const likelyRows = rows.filter(x => {
      const t = x.text.toLowerCase();
      return x.href.includes('/musteriler/') || t.includes('müşteri') || t.includes('musteri') || t.includes('bakiye') || t.includes('tl') || t.includes('vergi');
    }).slice(0, 120);
    const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4')).map((h, i) => ({ index: i, tag: h.tagName.toLowerCase(), text: clean(h.innerText || h.textContent), visible: Boolean(h.offsetWidth || h.offsetHeight || h.getClientRects().length) })).filter(x => x.text);
    return {
      url: location.href,
      title: document.title,
      body_preview: bodyText.slice(0, 2500),
      counts: { links: links.length, customer_links: customerLinks.length, rows: rows.length, likely_rows: likelyRows.length, headings: headings.length },
      headings: headings.slice(0, 50),
      customer_links: customerLinks,
      likely_rows: likelyRows,
      links: links.slice(0, 120)
    };
  });
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return json({ ok: true, message: 'CORS hazır.' });
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/' || path === '/health') {
      return json({ ok: true, service: 'bizmu-browser-bot', message: 'Bizmu Browser Bot Worker çalışıyor.', has_browser_binding: Boolean(env.MYBROWSER), has_bizmu_url: Boolean(env.BIZMU_LOGIN_URL), has_bizmu_email: Boolean(env.BIZMU_EMAIL), has_bizmu_password: Boolean(env.BIZMU_PASSWORD), at: nowTR() });
    }

    if (path === '/credential-check') {
      return json({ ok: true, readonly: true, service: 'bizmu-browser-bot', message: 'Gizli değişken kontrolü yapıldı; değerler gösterilmez.', has_bizmu_url: Boolean(env.BIZMU_LOGIN_URL), has_bizmu_email: Boolean(env.BIZMU_EMAIL), has_bizmu_password: Boolean(env.BIZMU_PASSWORD), at: nowTR() });
    }

    if (path === '/login-page-test') {
      let browser;
      try { const opened = await openBizmuLogin(env); browser = opened.browser; const page = opened.page; const title = await page.title(); const currentUrl = page.url(); const bodyText = await getBodyPreview(page, 1500); await closeBrowser(browser); return json({ ok: true, readonly: true, service: 'bizmu-browser-bot', message: 'Browser Run ile Bizmu giriş sayfası açıldı. Şifre kullanılmadı.', target_url: opened.targetUrl, current_url: currentUrl, title, body_preview: bodyText, at: nowTR() }); }
      catch (err) { await closeBrowser(browser); return json({ ok: false, service: 'bizmu-browser-bot', message: 'Browser Run test hatası: ' + err.message, at: nowTR() }, 500); }
    }

    if (path === '/login-form-detect') {
      let browser;
      try { const opened = await openBizmuLogin(env); browser = opened.browser; const page = opened.page; const title = await page.title(); const currentUrl = page.url(); const detected = await detectForm(page); await closeBrowser(browser); return json({ ok: true, readonly: true, service: 'bizmu-browser-bot', message: 'Bizmu login form alanları tespit edildi. Şifre kullanılmadı.', target_url: opened.targetUrl, current_url: currentUrl, title, detected, at: nowTR() }); }
      catch (err) { await closeBrowser(browser); return json({ ok: false, service: 'bizmu-browser-bot', message: 'Login form tespit hatası: ' + err.message, at: nowTR() }, 500); }
    }

    if (path === '/login-check') {
      let browser;
      try { const opened = await loginToBizmu(env); browser = opened.browser; const state = await loginState(opened.page); await closeBrowser(browser); return json({ ok: true, readonly: true, service: 'bizmu-browser-bot', message: state.successLikely ? 'Bizmu giriş denemesi başarılı görünüyor. Veri okunmadı, kayıt değiştirilmedi.' : 'Bizmu giriş denemesi tamamlandı ama başarı kesin değil; sayfa hâlâ giriş ekranı olabilir.', login_success_likely: state.successLikely, still_login_page: state.stillLogin, invalid_credential_hint: state.invalidHint, used_email_masked: maskEmail(env.BIZMU_EMAIL), target_url: opened.targetUrl, current_url: state.currentUrl, title: state.title, body_preview: state.bodyText, at: nowTR() }); }
      catch (err) { await closeBrowser(browser); return json({ ok: false, service: 'bizmu-browser-bot', message: 'Login kontrol hatası: ' + err.message, at: nowTR() }, 500); }
    }

    if (path === '/post-login-scan') {
      let browser;
      try { const opened = await loginToBizmu(env); browser = opened.browser; const state = await loginState(opened.page); if (!state.successLikely) { await closeBrowser(browser); return json({ ok: false, readonly: true, service: 'bizmu-browser-bot', message: 'Giriş başarılı görünmediği için menü taraması yapılmadı.', still_login_page: state.stillLogin, invalid_credential_hint: state.invalidHint, current_url: state.currentUrl, title: state.title, body_preview: state.bodyText, at: nowTR() }, 409); } const scan = await scanPostLogin(opened.page); await closeBrowser(browser); return json({ ok: true, readonly: true, service: 'bizmu-browser-bot', message: 'Bizmu giriş sonrası menü/link taraması tamamlandı. Veri yazılmadı, kayıt değiştirilmedi.', used_email_masked: maskEmail(env.BIZMU_EMAIL), login_success_likely: true, scan, at: nowTR() }); }
      catch (err) { await closeBrowser(browser); return json({ ok: false, service: 'bizmu-browser-bot', message: 'Post login tarama hatası: ' + err.message, at: nowTR() }, 500); }
    }

    if (path === '/customers-scan') {
      let browser;
      try { const opened = await loginToBizmu(env); browser = opened.browser; const state = await loginState(opened.page); if (!state.successLikely) { await closeBrowser(browser); return json({ ok: false, readonly: true, service: 'bizmu-browser-bot', message: 'Giriş başarılı görünmediği için müşteri taraması yapılmadı.', current_url: state.currentUrl, title: state.title, body_preview: state.bodyText, at: nowTR() }, 409); } const scan = await scanCustomers(opened.page, opened.targetUrl); await closeBrowser(browser); return json({ ok: true, readonly: true, service: 'bizmu-browser-bot', message: 'Bizmu müşteri/cari liste taraması tamamlandı. Veri yazılmadı, kayıt değiştirilmedi.', used_email_masked: maskEmail(env.BIZMU_EMAIL), login_success_likely: true, scan, at: nowTR() }); }
      catch (err) { await closeBrowser(browser); return json({ ok: false, service: 'bizmu-browser-bot', message: 'Müşteri tarama hatası: ' + err.message, at: nowTR() }, 500); }
    }

    return json({ ok: false, message: 'Bilinmeyen endpoint. Kullanılabilir endpointler: /health, /credential-check, /login-page-test, /login-form-detect, /login-check, /post-login-scan, /customers-scan', path }, 404);
  }
};
