/*
  ALKAM Mali Gmail Ekstre Otomasyonu

  Kurulum:
  1. Gmail hesabinda Apps Script ac.
  2. Bu dosyayi Code.gs icine yapistir.
  3. ALKAM_INGEST_KEY alanina Cloudflare secret ile ayni degeri yaz.
  4. alkamTetikleyiciKur() fonksiyonunu bir kez calistir ve izinleri ver.

  Not:
  - Bu betik maildeki Halkbank/Moka Excel, CSV, PDF ve TXT eklerini ALKAM kuyruğuna yollar.
  - Cari deftere kesin hareket yazmaz; ALKAM tarafinda on izleme ve Onay Merkezi akisi calisir.
  - Basariyla aktarilan thread ALKAM_AKTARILDI etiketiyle isaretlenir, tekrar aktarilmaz.
*/

const ALKAM_ENDPOINT = 'https://alkam-mali.pages.dev/api/mail/gmail-import';
const ALKAM_QUEUE_ENDPOINT = 'https://alkam-mali.pages.dev/api/mail/queue?limit=10';
const ALKAM_INGEST_KEY = 'BURAYA_CLOUDFLARE_ALKAM_GMAIL_INGEST_KEY';
const ALKAM_DONE_LABEL = 'ALKAM_AKTARILDI';
const ALKAM_ERROR_LABEL = 'ALKAM_AKTARIM_HATASI';
const ALKAM_MAX_THREADS = 50;
const ALKAM_MAX_ATTACHMENTS_PER_RUN = 75;
const ALKAM_ALLOWED_EXT = /\.(xlsx|xls|csv|pdf|txt|jpg|jpeg|png|webp|zip|ofx|sta|mt940)$/i;
const ALKAM_GMAIL_LOOKBACK = 'newer_than:365d';

function alkamEkstreAktar() {
  if (!ALKAM_INGEST_KEY || ALKAM_INGEST_KEY.indexOf('BURAYA_') === 0) {
    throw new Error('ALKAM_INGEST_KEY alanini Cloudflare secret ile ayni deger yapin.');
  }

  const doneLabel = getOrCreateLabel_(ALKAM_DONE_LABEL);
  const errorLabel = getOrCreateLabel_(ALKAM_ERROR_LABEL);
  const query = [
    'in:anywhere has:attachment',
    // Labels are not excluded here: ALKAM/Worker duplicate keys prevent re-import.
    // '-label:' + ALKAM_DONE_LABEL,
    // '-label:' + ALKAM_ERROR_LABEL,
    ALKAM_GMAIL_LOOKBACK
  ].join(' ');

  const threads = GmailApp.search(query, 0, ALKAM_MAX_THREADS);
  let sent = 0;
  let fileCount = 0;

  for (const thread of threads) {
    const messages = thread.getMessages();
    const payloads = [];

    for (const message of messages) {
      const attachments = [];
      for (const attachment of message.getAttachments({ includeInlineImages: false, includeAttachments: true })) {
        const name = attachment.getName() || 'gmail-ek';
        // ALKAM decides the document type; Gmail only transports attachments.
        // if (!ALKAM_ALLOWED_EXT.test(name)) continue;
        if (fileCount >= ALKAM_MAX_ATTACHMENTS_PER_RUN) break;
        attachments.push({
          fileName: name,
          mimeType: attachment.getContentType(),
          base64: Utilities.base64Encode(attachment.getBytes())
        });
        fileCount++;
      }
      if (!attachments.length) continue;
      payloads.push({
        id: message.getId(),
        from: message.getFrom(),
        to: message.getTo(),
        subject: message.getSubject(),
        date: message.getDate().toISOString(),
        plainBody: message.getPlainBody().slice(0, 4000),
        attachments: attachments
      });
    }

    if (!payloads.length) continue;

    const response = UrlFetchApp.fetch(ALKAM_ENDPOINT, {
      method: 'post',
      contentType: 'application/json',
      muteHttpExceptions: true,
      headers: { 'x-alkam-mail-key': ALKAM_INGEST_KEY },
      payload: JSON.stringify({ messages: payloads })
    });

    const code = response.getResponseCode();
    const text = response.getContentText();
    console.log('ALKAM yanit: HTTP ' + code + ' ' + text.slice(0, 500));
    let result = {};
    try {
      result = JSON.parse(text || '{}');
    } catch (err) {
      result = { ok: false, error: 'JSON okunamadi' };
    }
    if (code >= 200 && code < 300 && result.ok === true && result.storageConfigured !== false && (Number(result.queued || 0) > 0 || Number(result.duplicate || 0) > 0)) {
      thread.addLabel(doneLabel);
      sent += payloads.length;
    } else {
      thread.addLabel(errorLabel);
      console.log('ALKAM aktarim hatasi: HTTP ' + code + ' ' + text);
    }
  }

  alkamKuyrukDurumuLogla_();
  console.log('ALKAM Gmail aktarim tamam. Mail: ' + sent + ', ek: ' + fileCount);
}

function alkamTetikleyiciKur() {
  const exists = ScriptApp.getProjectTriggers().some(function(trigger) {
    return trigger.getHandlerFunction() === 'alkamEkstreAktar';
  });
  if (!exists) {
    ScriptApp.newTrigger('alkamEkstreAktar').timeBased().everyMinutes(5).create();
  }
  alkamEkstreAktar();
}

function alkamTetikleyicileriSil() {
  for (const trigger of ScriptApp.getProjectTriggers()) {
    if (trigger.getHandlerFunction() === 'alkamEkstreAktar') {
      ScriptApp.deleteTrigger(trigger);
    }
  }
}

function alkamKuyrukDurumuLogla_() {
  const response = UrlFetchApp.fetch(ALKAM_QUEUE_ENDPOINT, {
    method: 'get',
    muteHttpExceptions: true
  });
  console.log('ALKAM kuyruk kontrol: HTTP ' + response.getResponseCode() + ' ' + response.getContentText().slice(0, 500));
}

function getOrCreateLabel_(name) {
  return GmailApp.getUserLabelByName(name) || GmailApp.createLabel(name);
}
