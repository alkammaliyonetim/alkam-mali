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

function parseAmountTR(raw) {
  const s = String(raw || '').replace(/\./g, '').replace(',', '.').replace(/[^0-9.-]/g, '');
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
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
  const { page } = opened;
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
  return opened;
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

async function scanCustomers(page, baseUrl) {
  const customersUrl = `${baseUrl.replace(/\/$/, '')}/musteriler`;
  await page.goto(customersUrl, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(resolve => setTimeout(resolve, 2500));
  return extractCustomersFromPage(page);
}

async function extractCustomersFromPage(page) {
  return page.evaluate(() => {
    const clean = (v) => String(v || '').replace(/\s+/g, ' ').trim();
    const hrefAbs = (href) => { try { return href ? new URL(href, location.href).href : ''; } catch (_) { return href || ''; } };
    const parseAmountTR = (raw) => {
      const s = String(raw || '').replace(/\./g, '').replace(',', '.').replace(/[^0-9.-]/g, '');
      const n = Number(s);
      return Number.isFinite(n) ? n : null;
    };
    const parseCustomerText = (text) => {
      const cleaned = clean(text);
      const statusMatch = cleaned.match(/(Tahsil Edilecek|Ödenecek)\s*$/i);
      const status = statusMatch ? statusMatch[1] : '';
      const withoutStatus = status ? cleaned.replace(new RegExp(status + '\\s*$', 'i'), '').trim() : cleaned;
      const amountMatch = withoutStatus.match(/([0-9]{1,3}(?:\.[0-9]{3})*,[0-9]{2}|[0-9]+,[0-9]{2})\s*$/);
      const amount_text = amountMatch ? amountMatch[1] : '';
      const name = amount_text ? withoutStatus.slice(0, withoutStatus.lastIndexOf(amount_text)).trim() : withoutStatus;
      return { name, amount_text, amount: parseAmountTR(amount_text), status };
    };
    const bodyText = clean(document.body ? document.body.innerText : '');
    const links = Array.from(document.querySelectorAll('a[href]')).map((a, i) => ({ index: i, text: clean(a.innerText || a.textContent || a.getAttribute('aria-label')).slice(0, 240), href: hrefAbs(a.getAttribute('href')), visible: Boolean(a.offsetWidth || a.offsetHeight || a.getClientRects().length) })).filter(x => x.text || x.href);
    const customerLinks = links.filter(x => /\/musteriler\/\d+/.test(x.href) && x.text).map(x => {
      const id = (x.href.match(/\/musteriler\/(\d+)/) || [])[1] || '';
      return { id, ...parseCustomerText(x.text), href: x.href, raw_text: x.text, visible: x.visible };
    });
    const totalMatch = bodyText.match(/(\d+)\s*Kayıt/i);
    return { url: location.href, title: document.title, body_preview: bodyText.slice(0, 2500), total_hint: totalMatch ? Number(totalMatch[1]) : null, counts: { links: links.length, customer_links: customerLinks.length }, customer_links: customerLinks, links: links.slice(0, 120) };
  });
}

async function scanAllCustomerPages(page, baseUrl, maxPages = 10) {
  const root = baseUrl.replace(/\/$/, '');
  const all = [];
  const pages = [];
  const seen = new Set();
  for (let pageNo = 1; pageNo <= maxPages; pageNo++) {
    const pageUrl = pageNo === 1 ? `${root}/musteriler` : `${root}/musteriler?sayfa=${pageNo}`;
    await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 2200));
    const data = await extractCustomersFromPage(page);
    pages.push({ page: pageNo, url: data.url, found: data.customer_links.length, total_hint: data.total_hint });
    for (const c of data.customer_links) {
      const key = c.id || `${c.name}|${c.amount_text}|${c.status}`;
      if (!seen.has(key)) {
        seen.add(key);
        all.push({ page: pageNo, ...c });
      }
    }
    if (data.total_hint && all.length >= data.total_hint) break;
    if (data.customer_links.length === 0 && pageNo > 1) break;
  }
  const totals = all.reduce((acc, c) => {
    const amount = Number(c.amount || 0);
    if ((c.status || '').toLowerCase().includes('tahsil')) acc.receivable += amount;
    if ((c.status || '').toLowerCase().includes('ödenecek')) acc.payable += amount;
    return acc;
  }, { receivable: 0, payable: 0 });
  return { url: page.url(), title: await page.title(), pages_scanned: pages.length, total_customers: all.length, totals, page_summaries: pages, customers: all };
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return json({ ok: true, message: 'CORS hazır.' });
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/' || path === '/health') return json({ ok: true, service: 'bizmu-browser-bot', message: 'Bizmu Browser Bot Worker çalışıyor.', has_browser_binding: Boolean(env.MYBROWSER), has_bizmu_url: Boolean(env.BIZMU_LOGIN_URL), has_bizmu_email: Boolean(env.BIZMU_EMAIL), has_bizmu_password: Boolean(env.BIZMU_PASSWORD), at: nowTR() });
    if (path === '/credential-check') return json({ ok: true, readonly: true, service: 'bizmu-browser-bot', message: 'Gizli değişken kontrolü yapıldı; değerler gösterilmez.', has_bizmu_url: Boolean(env.BIZMU_LOGIN_URL), has_bizmu_email: Boolean(env.BIZMU_EMAIL), has_bizmu_password: Boolean(env.BIZMU_PASSWORD), at: nowTR() });

    if (path === '/login-check') {
      let browser;
      try { const opened = await loginToBizmu(env); browser = opened.browser; const state = await loginState(opened.page); await closeBrowser(browser); return json({ ok: true, readonly: true, service: 'bizmu-browser-bot', message: state.successLikely ? 'Bizmu giriş denemesi başarılı görünüyor. Veri okunmadı, kayıt değiştirilmedi.' : 'Bizmu giriş denemesi tamamlandı ama başarı kesin değil; sayfa hâlâ giriş ekranı olabilir.', login_success_likely: state.successLikely, still_login_page: state.stillLogin, invalid_credential_hint: state.invalidHint, used_email_masked: maskEmail(env.BIZMU_EMAIL), current_url: state.currentUrl, title: state.title, body_preview: state.bodyText, at: nowTR() }); }
      catch (err) { await closeBrowser(browser); return json({ ok: false, service: 'bizmu-browser-bot', message: 'Login kontrol hatası: ' + err.message, at: nowTR() }, 500); }
    }

    if (path === '/customers-scan') {
      let browser;
      try { const opened = await loginToBizmu(env); browser = opened.browser; const state = await loginState(opened.page); if (!state.successLikely) { await closeBrowser(browser); return json({ ok: false, readonly: true, service: 'bizmu-browser-bot', message: 'Giriş başarılı görünmediği için müşteri taraması yapılmadı.', current_url: state.currentUrl, title: state.title, body_preview: state.bodyText, at: nowTR() }, 409); } const scan = await scanCustomers(opened.page, opened.targetUrl); await closeBrowser(browser); return json({ ok: true, readonly: true, service: 'bizmu-browser-bot', message: 'Bizmu müşteri/cari liste taraması tamamlandı. Veri yazılmadı, kayıt değiştirilmedi.', used_email_masked: maskEmail(env.BIZMU_EMAIL), login_success_likely: true, scan, at: nowTR() }); }
      catch (err) { await closeBrowser(browser); return json({ ok: false, service: 'bizmu-browser-bot', message: 'Müşteri tarama hatası: ' + err.message, at: nowTR() }, 500); }
    }

    if (path === '/customers-all-scan') {
      let browser;
      try { const opened = await loginToBizmu(env); browser = opened.browser; const state = await loginState(opened.page); if (!state.successLikely) { await closeBrowser(browser); return json({ ok: false, readonly: true, service: 'bizmu-browser-bot', message: 'Giriş başarılı görünmediği için tüm müşteri taraması yapılmadı.', current_url: state.currentUrl, title: state.title, body_preview: state.bodyText, at: nowTR() }, 409); } const maxPages = Math.min(Number(url.searchParams.get('max_pages') || 10), 20); const scan = await scanAllCustomerPages(opened.page, opened.targetUrl, maxPages); await closeBrowser(browser); return json({ ok: true, readonly: true, service: 'bizmu-browser-bot', message: 'Bizmu tüm müşteri/cari sayfaları tarandı. Veri yazılmadı, kayıt değiştirilmedi.', used_email_masked: maskEmail(env.BIZMU_EMAIL), login_success_likely: true, scan, at: nowTR() }); }
      catch (err) { await closeBrowser(browser); return json({ ok: false, service: 'bizmu-browser-bot', message: 'Tüm müşteri tarama hatası: ' + err.message, at: nowTR() }, 500); }
    }

    return json({ ok: false, message: 'Bilinmeyen endpoint. Kullanılabilir endpointler: /health, /credential-check, /login-check, /customers-scan, /customers-all-scan', path }, 404);
  }
};
