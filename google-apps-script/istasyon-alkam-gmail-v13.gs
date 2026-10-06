/*
  İstasyON / ALKAM — Gmail Halkbank + Moka bridge v14

  Amaç:
  - ALKAM'a ait Halkbank hesap ekstrelerini ve Moka bildirimlerini arka planda yakala.
  - Aynı maili ikinci kez taşımamak için Gmail etiketi kullan.
  - Finansal deftere kayıt YAPMA; yalnız İstasyON güvenli kuyruğuna gönder.
  - Secret kod içine yazılmaz; Apps Script Properties içinden okunur.

  Bir defalık Script Properties:
    ALKAM_GMAIL_INGEST_KEY = Cloudflare ALKAM_GMAIL_INGEST_KEY ile aynı değer

  Bir defalık kurulum:
    istasyonAlkamTetikleyiciKur()
*/

const ISTASYON_ALKAM_ENDPOINT = 'https://alkam-mali.pages.dev/api/mail/gmail-import';
const ISTASYON_DONE_LABEL = 'ALKAM_AKTARILDI';
const ISTASYON_ERROR_LABEL = 'ALKAM_AKTARIM_HATASI';
const ISTASYON_LOOKBACK = 'newer_than:7d';
const ISTASYON_MAX_THREADS = 50;
const ISTASYON_MAX_ATTACHMENTS = 60;
const ISTASYON_HALKBANK_ACCOUNT_SUFFIX = '9675';
const ISTASYON_HALKBANK_ACCOUNT_PREFIX = 'TR78000120092790';
const ISTASYON_MOKA_SENDER = 'operations@mokaunited.com';
const ISTASYON_HALKBANK_ALLOWED_DOMAINS = ['@bilgi.halkbank.com.tr','@halkbank.com.tr'];

function istasyonAlkamEkstreAktar() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return { ok: false, skipped: true, reason: 'already_running' };
  try {
  const key = PropertiesService.getScriptProperties().getProperty('ALKAM_GMAIL_INGEST_KEY');
  if (!key) throw new Error('Script Property ALKAM_GMAIL_INGEST_KEY eksik.');

  const doneLabel = getOrCreateLabelV13_(ISTASYON_DONE_LABEL);
  const errorLabel = getOrCreateLabelV13_(ISTASYON_ERROR_LABEL);
  const queries = [
    [
      'in:anywhere',
      ISTASYON_LOOKBACK,
      '-label:' + ISTASYON_DONE_LABEL,
      '(from:bilgi.halkbank.com.tr OR from:halkbank.com.tr OR subject:"T.HALK BANKASI A.Ş. Hesap Ekstresi")',
      'has:attachment'
    ].join(' '),
    [
      'in:anywhere',
      ISTASYON_LOOKBACK,
      '-label:' + ISTASYON_DONE_LABEL,
      '(from:operations@mokaunited.com OR subject:"POS Ödemesi" OR subject:"Pos Ödemesi" OR "Moka United")'
    ].join(' ')
  ];

  const seen = {};
  const threads = [];
  queries.forEach(function(query) {
    GmailApp.search(query, 0, ISTASYON_MAX_THREADS).forEach(function(thread) {
      if (seen[thread.getId()]) return;
      seen[thread.getId()] = true;
      threads.push(thread);
    });
  });

  let transferred = 0;
  let duplicate = 0;
  let errors = 0;
  let attachmentsTotal = 0;

  threads.forEach(function(thread) {
    const payloads = [];

    thread.getMessages().forEach(function(message) {
      const subject = message.getSubject() || '';
      const plainBody = (message.getPlainBody() || '').slice(0, 5000);
      const identity = detectAlkamSourceV13_(message.getFrom(), subject, plainBody);
      if (!identity.accept) return;

      const attachments = [];
      message.getAttachments({ includeInlineImages: false, includeAttachments: true }).forEach(function(att) {
        if (attachmentsTotal >= ISTASYON_MAX_ATTACHMENTS) return;
        const name = att.getName() || 'gmail-ek';
        attachments.push({
          fileName: name,
          mimeType: att.getContentType(),
          base64: Utilities.base64Encode(att.getBytes())
        });
        attachmentsTotal++;
      });

      if (!attachments.length && identity.docType !== 'moka') return;

      payloads.push({
        id: message.getId(),
        from: message.getFrom(),
        to: message.getTo(),
        subject: subject,
        date: message.getDate().toISOString(),
        plainBody: plainBody,
        scope: 'alkam',
        bank: identity.bank,
        accountRef: identity.accountRef,
        sourceKind: identity.docType,
        sourceReliability: identity.reliability || 0,
        mokaPayment: identity.docType === 'moka' ? parseMokaPaymentV14_(plainBody, subject) : null,
        evidenceHash: sha256HexV14_([message.getId(), message.getFrom(), subject, plainBody].join('\n')),
        attachments: attachments
      });
    });

    if (!payloads.length) return;

    try {
      const response = UrlFetchApp.fetch(ISTASYON_ALKAM_ENDPOINT, {
        method: 'post',
        contentType: 'application/json',
        muteHttpExceptions: true,
        headers: { 'x-alkam-mail-key': key },
        payload: JSON.stringify({ messages: payloads })
      });
      const code = response.getResponseCode();
      let body = {};
      try { body = JSON.parse(response.getContentText() || '{}'); } catch (_) {}

      if (code >= 200 && code < 300 && body.ok === true) {
        thread.addLabel(doneLabel);
        if (Number(body.queued || 0) > 0) transferred += Number(body.queued || 0);
        duplicate += Number(body.duplicate || 0);
      } else {
        thread.addLabel(errorLabel);
        errors++;
        console.log('İstasyON aktarım hatası HTTP ' + code + ' ' + response.getContentText().slice(0, 800));
      }
    } catch (err) {
      thread.addLabel(errorLabel);
      errors++;
      console.log('İstasyON aktarım exception: ' + err.message);
    }
  });

  const result = {
    ok: errors === 0,
    transferred: transferred,
    duplicate: duplicate,
    errors: errors,
    attachments: attachmentsTotal,
    checkedThreads: threads.length,
    time: new Date().toISOString()
  };
  console.log(JSON.stringify(result));
  return result;
  } finally {
    lock.releaseLock();
  }
}

function detectAlkamSourceV13_(from, subject, body) {
  const text = [from, subject, body].join(' ');
  const compact = text.toLocaleUpperCase('tr-TR').replace(/\s+/g, '');
  const lower = text.toLocaleLowerCase('tr-TR');
  const fromLower = String(from || '').toLocaleLowerCase('tr-TR');
  const senderEmail = ((fromLower.match(/<([^>]+)>/) || [])[1] || fromLower).trim();

  const mokaWords = lower.indexOf('moka united') >= 0 ||
    lower.indexOf('pos ödemesi') >= 0 ||
    lower.indexOf('pos odemesi') >= 0;
  if (mokaWords) {
    if (senderEmail !== ISTASYON_MOKA_SENDER) {
      return { accept: false, reason: 'moka_sender_not_allowlisted' };
    }
    const parsed = parseMokaPaymentV14_(body, subject);
    if (!parsed || !parsed.paymentId || !parsed.paymentAt || !(parsed.grossAmount > 0)) {
      return { accept: false, reason: 'moka_required_fields_missing' };
    }
    return {
      accept: true,
      docType: 'moka',
      bank: 'Moka United',
      accountRef: 'ALKAM-MOKA',
      reliability: 100
    };
  }

  const isHalk = lower.indexOf('halkbank') >= 0 ||
    lower.indexOf('halk bankasi') >= 0 ||
    lower.indexOf('halk bankası') >= 0 ||
    lower.indexOf('t.halk bankasi') >= 0 ||
    lower.indexOf('t.halk bankası') >= 0;

  if (isHalk) {
    const senderAllowed = ISTASYON_HALKBANK_ALLOWED_DOMAINS.some(function(domain) {
      return senderEmail.endsWith(domain);
    });
    if (!senderAllowed) return { accept: false, reason: 'halkbank_sender_not_allowlisted' };
    const hasPrefix = compact.indexOf(ISTASYON_HALKBANK_ACCOUNT_PREFIX) >= 0;
    const hasSuffix = compact.indexOf(ISTASYON_HALKBANK_ACCOUNT_SUFFIX) >= 0;
    if (hasPrefix && hasSuffix) {
      return {
        accept: true,
        docType: 'bank',
        bank: 'Halkbank',
        accountRef: ISTASYON_HALKBANK_ACCOUNT_PREFIX + '******' + ISTASYON_HALKBANK_ACCOUNT_SUFFIX,
        reliability: 100
      };
    }
    return { accept: false, reason: 'halkbank_account_not_proven' };
  }

  return { accept: false, reason: 'not_alkam_source' };
}

function parseMokaPaymentV14_(body, subject) {
  const text = String(body || '');
  const paymentId = ((text.match(/gerçekleştirilen\s+(\d+)\s+numaralı ödemeye/i) || [])[1] || '').trim();
  const requestId = ((text.match(/(\d+)\s+numaralı ödeme isteği ile/i) || [])[1] || '').trim() || null;
  const paymentAtText = ((text.match(/Ödeme Tarihi\s*\n(\d{2}-\d{2}-\d{4}\s+\d{2}:\d{2})/i) || [])[1] ||
    (text.match(/(\d{2}-\d{2}-\d{4}\s+\d{2}:\d{2})\s+tarihinde gerçekleştirilen/i) || [])[1] || '').trim();
  const receiptUrl = ((text.match(/https:\/\/cdn\.mokaunited\.com\/Content\/PaymentReceipt\/[^\s)\]]+/i) || [])[0] || '').trim() || null;
  const customerMode = /müşteri pos ödemesi/i.test(String(subject || ''));
  const personnel = fieldV14_(text, customerMode ? 'Ödeme İsteğini Gönderen Personel' : 'Ödemeyi Yapan Personel');
  const cardholder = fieldV14_(text, customerMode ? 'Müşteri Adı' : 'Kart Sahibinin Adı');
  const beneficiary = fieldV14_(text, 'Hizmet Alan Kişi Adı');
  const grossAmount = parseTrMoneyV14_(fieldV14_(text, 'Tutar'));
  const commissionAmount = parseTrMoneyV14_(fieldV14_(text, 'Bayi Komisyon Tutarı')) || 0;
  const installments = Number(fieldV14_(text, 'Taksit Sayısı') || 0) || null;
  const threeD = /^evet$/i.test(fieldV14_(text, '3D Güvenlik') || '');
  const paymentAt = parseMokaDateV14_(paymentAtText);
  return {
    paymentId: paymentId || null,
    paymentRequestId: requestId,
    paymentAt: paymentAt,
    personnelName: personnel || null,
    cardholderName: cardholder || null,
    beneficiaryName: beneficiary || null,
    grossAmount: grossAmount,
    commissionAmount: commissionAmount,
    installmentCount: installments,
    threeDSecure: threeD,
    receiptUrl: receiptUrl,
    dedupeKey: paymentId ? 'MOKA:' + paymentId : null
  };
}

function fieldV14_(text, label) {
  const lines = String(text || '').split(/\r?\n/).map(function(x){ return x.trim(); });
  const labels = [
    'Ödemeyi Yapan Personel','Ödeme İsteğini Gönderen Personel','Takip Numarası',
    'Kart Sahibinin Adı','Müşteri Adı','Hizmet Alan Kişi Adı','Tutar',
    'Bayi Komisyon Tutarı','Taksit Sayısı','3D Güvenlik','Ödeme Tarihi','Açıklama'
  ].map(function(x){ return x.toLocaleLowerCase('tr-TR'); });
  const idx = lines.findIndex(function(x){ return x.toLocaleLowerCase('tr-TR') === String(label).toLocaleLowerCase('tr-TR'); });
  if (idx < 0) return '';
  for (let i = idx + 1; i < lines.length; i++) {
    if (!lines[i]) continue;
    if (labels.indexOf(lines[i].toLocaleLowerCase('tr-TR')) >= 0) return '';
    return lines[i];
  }
  return '';
}

function parseTrMoneyV14_(value) {
  const raw = String(value || '').replace(/TL/gi, '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.').replace(/[^0-9.-]/g, '');
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function parseMokaDateV14_(value) {
  const m = String(value || '').match(/^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})$/);
  return m ? m[3] + '-' + m[2] + '-' + m[1] + 'T' + m[4] + ':' + m[5] + ':00+03:00' : null;
}

function sha256HexV14_(value) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(value), Utilities.Charset.UTF_8)
    .map(function(b){ const v = b < 0 ? b + 256 : b; return ('0' + v.toString(16)).slice(-2); })
    .join('');
}

function istasyonAlkamTetikleyiciKur() {
  istasyonAlkamTetikleyicileriSil();
  ScriptApp.newTrigger('istasyonAlkamEkstreAktar')
    .timeBased()
    .everyHours(1)
    .create();
  return istasyonAlkamEkstreAktar();
}

function istasyonAlkamTetikleyicileriSil() {
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'istasyonAlkamEkstreAktar') ScriptApp.deleteTrigger(trigger);
  });
}

function getOrCreateLabelV13_(name) {
  return GmailApp.getUserLabelByName(name) || GmailApp.createLabel(name);
}
