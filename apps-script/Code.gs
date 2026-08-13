const ALKAM_VERSION = 'ALKAM_SHEETS_API_V1';
const SHEETS = Object.freeze({
  config: 'ALKAM_API_AYAR',
  dashboard: 'ALKAM_DASHBOARD',
  customers: 'ALKAM_MUSTERILER',
  bank: 'ALKAM_BANKA',
  approvals: 'ALKAM_ONAY_MERKEZI',
  log: 'ALKAM_LOG'
});

function doGet(e) {
  try {
    assertToken_(e && e.parameter && e.parameter.token);
    const resource = String((e && e.parameter && e.parameter.resource) || 'health').toLowerCase();
    const limit = Math.min(Math.max(Number((e && e.parameter && e.parameter.limit) || 200), 1), 1000);
    let data;
    if (resource === 'health') data = health_();
    else if (resource === 'dashboard') data = dashboard_();
    else if (resource === 'customers') data = rows_(SHEETS.customers, 3, 16, limit);
    else if (resource === 'bank') data = rows_(SHEETS.bank, 3, 12, limit);
    else if (resource === 'approvals') data = rows_(SHEETS.approvals, 3, 12, limit);
    else throw new Error('Bilinmeyen kaynak: ' + resource);
    return output_({ ok: true, version: ALKAM_VERSION, resource: resource, data: data, at: new Date().toISOString() }, e);
  } catch (error) {
    return output_({ ok: false, version: ALKAM_VERSION, error: String(error && error.message || error), at: new Date().toISOString() }, e);
  }
}

function doPost(e) {
  const lock = LockService.getDocumentLock();
  try {
    lock.waitLock(15000);
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    assertToken_(body.token);
    const action = String(body.action || '');
    let result;
    if (action === 'approveBank') result = approveBank_(body);
    else if (action === 'addCustomer') result = addCustomer_(body);
    else throw new Error('Bilinmeyen işlem: ' + action);
    log_(action, 'BAŞARILI', body.requestId || '', JSON.stringify(result));
    return output_({ ok: true, version: ALKAM_VERSION, action: action, data: result, at: new Date().toISOString() });
  } catch (error) {
    log_('API_HATA', 'HATA', '', String(error && error.message || error));
    return output_({ ok: false, version: ALKAM_VERSION, error: String(error && error.message || error), at: new Date().toISOString() });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function health_() {
  return {
    spreadsheetId: SpreadsheetApp.getActive().getId(),
    status: 'BAĞLI',
    bankRows: dataRowCount_(SHEETS.bank, 3),
    customerRows: dataRowCount_(SHEETS.customers, 3),
    pendingRows: countValue_(SHEETS.bank, 8, 'BEKLİYOR', 3)
  };
}

function dashboard_() {
  const sh = sheet_(SHEETS.dashboard);
  const values = sh.getRange('A3:F4').getDisplayValues();
  return {
    labels: values[0],
    values: values[1],
    totalIncoming: number_(values[1][0]),
    totalOutgoing: number_(values[1][1]),
    netFlow: number_(values[1][2]),
    pending: Number(values[1][3] || 0),
    activeCustomers: Number(values[1][4] || 0),
    duplicateRisk: Number(values[1][5] || 0)
  };
}

function rows_(sheetName, headerRowIndex, columnCount, limit) {
  const sh = sheet_(sheetName);
  const headers = sh.getRange(headerRowIndex, 1, 1, columnCount).getDisplayValues()[0];
  const last = Math.min(sh.getLastRow(), headerRowIndex + limit);
  if (last <= headerRowIndex) return { headers: headers, rows: [], count: 0 };
  const raw = sh.getRange(headerRowIndex + 1, 1, last - headerRowIndex, columnCount).getDisplayValues();
  const rows = raw.filter(row => row.some(value => String(value).trim() !== '')).map(row => {
    const out = {};
    headers.forEach((header, index) => { if (header) out[header] = row[index]; });
    return out;
  });
  return { headers: headers, rows: rows, count: rows.length };
}

function approveBank_(body) {
  if (String(body.confirm || '') !== 'EVET') throw new Error('Açık onay gerekli. confirm=EVET');
  const row = Number(body.row);
  if (!Number.isInteger(row) || row < 4) throw new Error('Geçersiz banka satırı.');
  const sh = sheet_(SHEETS.bank);
  const key = String(sh.getRange(row, 9).getDisplayValue() || '');
  if (!key) throw new Error('Mükerrer anahtar yok; işlem onaylanamaz.');
  if (duplicateCount_(sh, key) > 1) throw new Error('Mükerrer şüphesi var; manuel inceleme gerekli.');
  const current = String(sh.getRange(row, 8).getDisplayValue() || '');
  if (current === 'ONAYLANDI') return { row: row, status: current, idempotent: true };
  sh.getRange(row, 6).setValue(String(body.customerId || ''));
  sh.getRange(row, 8).setValue('ONAYLANDI');
  sh.getRange(row, 10).setValue(Session.getActiveUser().getEmail() || 'ALKAM');
  sh.getRange(row, 11).setValue(new Date());
  sh.getRange(row, 12).setValue(String(body.note || 'Program üzerinden onaylandı'));
  SpreadsheetApp.flush();
  return { row: row, status: 'ONAYLANDI', key: key };
}

function addCustomer_(body) {
  if (String(body.confirm || '') !== 'EVET') throw new Error('Açık onay gerekli. confirm=EVET');
  const item = body.customer || {};
  const id = String(item.id || '').trim();
  const name = String(item.name || '').trim();
  if (!id || !name) throw new Error('Müşteri ID ve ünvan zorunlu.');
  const sh = sheet_(SHEETS.customers);
  const ids = sh.getRange(4, 1, Math.max(sh.getLastRow() - 3, 1), 1).getDisplayValues().flat();
  if (ids.includes(id)) return { id: id, idempotent: true };
  const row = Math.max(sh.getLastRow() + 1, 4);
  const values = [[id, 'AKTİF', name, item.taxId || '', item.contact || '', item.phone || '', item.email || '', item.package || '', Number(item.monthlyFee || 0), item.start || '', item.end || '', '', '', '', item.bizmuId || '', item.note || '']];
  sh.getRange(row, 1, 1, 16).setValues(values);
  SpreadsheetApp.flush();
  return { id: id, row: row, status: 'AKTİF' };
}

function assertToken_(token) {
  const expected = config_('API_TOKEN');
  if (!expected || String(token || '') !== expected) throw new Error('Yetkisiz erişim.');
}

function config_(key) {
  const values = sheet_(SHEETS.config).getRange('A1:B20').getDisplayValues();
  const row = values.find(item => String(item[0]) === key);
  return row ? String(row[1]) : '';
}

function output_(payload, e) {
  const json = JSON.stringify(payload);
  const callback = e && e.parameter && String(e.parameter.callback || '').replace(/[^a-zA-Z0-9_.$]/g, '');
  if (callback) return ContentService.createTextOutput(callback + '(' + json + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function sheet_(name) {
  const sh = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sh) throw new Error('Sayfa bulunamadı: ' + name);
  return sh;
}

function dataRowCount_(name, headerRowIndex) { return Math.max(sheet_(name).getLastRow() - headerRowIndex, 0); }
function countValue_(name, column, value, headerRowIndex) {
  const sh = sheet_(name), count = Math.max(sh.getLastRow() - headerRowIndex, 0);
  if (!count) return 0;
  return sh.getRange(headerRowIndex + 1, column, count, 1).getDisplayValues().filter(row => row[0] === value).length;
}
function duplicateCount_(sh, key) {
  const count = Math.max(sh.getLastRow() - 3, 0);
  if (!count) return 0;
  return sh.getRange(4, 9, count, 1).getDisplayValues().filter(row => row[0] === key).length;
}
function number_(value) {
  const normalized = String(value || '0').replace(/\s|₺/g, '').replace(/\./g, '').replace(',', '.');
  return Number(normalized) || 0;
}
function log_(action, status, requestId, detail) {
  try {
    const sh = sheet_(SHEETS.log);
    sh.appendRow([new Date(), action, status, requestId, Session.getActiveUser().getEmail() || 'ALKAM_API', detail]);
  } catch (_) {}
}
