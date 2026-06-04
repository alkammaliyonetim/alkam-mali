export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/mail/status") {
      return mailStatus(request, env);
    }
    if (url.pathname === "/api/mail/queue") {
      return mailQueue(request, env);
    }
    if (url.pathname === "/api/mail/queue/ack") {
      return mailQueueAck(request, env);
    }
    if (url.pathname === "/api/mail/file") {
      return mailFile(request, env);
    }
    if (url.pathname === "/api/mail/gmail-import") {
      return gmailImport(request, env);
    }
    if (url.pathname === "/api/telegram/status") {
      return telegramStatus(request, env);
    }
    if (url.pathname === "/api/telegram/updates") {
      return telegramUpdates(request, env);
    }
    if (url.pathname === "/api/telegram/send") {
      return telegramSend(request, env);
    }
    if (url.pathname === "/api/telegram/file") {
      return telegramFile(request, env);
    }
    if (url.pathname === "/api/telegram/webhook") {
      return telegramWebhook(request, env);
    }
    if (url.pathname === "/api/telegram/queue") {
      return telegramQueue(request, env);
    }
    if (url.pathname === "/api/telegram/queue/ack") {
      return telegramQueueAck(request, env);
    }
    if (url.pathname === "/api/telegram/webhook/setup") {
      return telegramWebhookSetup(request, env);
    }
    if (url.pathname === "/api/telegram/webhook/info") {
      return telegramWebhookInfo(request, env);
    }
    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    headers.set("cache-control", "no-store");
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  },
  async email(message, env, ctx) {
    ctx.waitUntil(queueInboundEmail(message, env));
  }
};

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function tokenMissing() {
  return json({
    ok: false,
    configured: false,
    error: "TELEGRAM_BOT_TOKEN Cloudflare ortam değişkeni bağlı değil."
  });
}

function telegramQueueStore(env) {
  return env.TELEGRAM_QUEUE || env.ALKAM_TELEGRAM_QUEUE || null;
}

function telegramQueueMissing() {
  return json({
    ok: false,
    configured: true,
    storageConfigured: false,
    error: "Telegram kuyrugu icin Cloudflare KV binding gerekli: TELEGRAM_QUEUE."
  }, 503);
}

function mailQueueStore(env) {
  return env.MAIL_QUEUE || env.ALKAM_MAIL_QUEUE || env.TELEGRAM_QUEUE || env.ALKAM_TELEGRAM_QUEUE || null;
}

function mailQueueMissing() {
  return json({
    ok: false,
    configured: false,
    storageConfigured: false,
    error: "Mail kuyrugu icin Cloudflare KV binding gerekli: MAIL_QUEUE veya TELEGRAM_QUEUE."
  }, 503);
}

function mailQueueKey(id) {
  return `mailq:${String(id || Date.now()).replace(/[^a-zA-Z0-9_.:-]/g, "-").slice(0, 120)}`;
}

function headerValue(headers, name) {
  try {
    return headers.get(name) || headers.get(name.toLowerCase()) || "";
  } catch {
    return "";
  }
}

function safeMailText(value, limit = 12000) {
  return String(value == null ? "" : value).replace(/\0/g, "").slice(0, limit);
}

async function readStreamText(stream, limit = 8000000) {
  if (!stream) return "";
  const reader = stream.getReader();
  const chunks = [];
  let size = 0;
  while (size < limit) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    size += value.byteLength || value.length || 0;
  }
  const bytes = new Uint8Array(Math.min(size, limit));
  let offset = 0;
  for (const chunk of chunks) {
    const part = chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk);
    const take = Math.min(part.length, bytes.length - offset);
    bytes.set(part.slice(0, take), offset);
    offset += take;
    if (offset >= bytes.length) break;
  }
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}

function mimeHeaderMap(part) {
  const split = part.search(/\r?\n\r?\n/);
  const headerText = split >= 0 ? part.slice(0, split) : "";
  const body = split >= 0 ? part.slice(split).replace(/^\r?\n\r?\n/, "") : "";
  const headers = {};
  headerText.replace(/\r?\n[ \t]+/g, " ").split(/\r?\n/).forEach(line => {
    const idx = line.indexOf(":");
    if (idx > 0) headers[line.slice(0, idx).toLowerCase()] = line.slice(idx + 1).trim();
  });
  return { headers, body };
}

function mimeParam(value, name) {
  const re = new RegExp(`${name}\\*?=(?:UTF-8''|")?([^";\\r\\n]+)`, "i");
  const match = String(value || "").match(re);
  if (!match) return "";
  try {
    return decodeURIComponent(match[1].replace(/^"|"$/g, "").trim());
  } catch {
    return match[1].replace(/^"|"$/g, "").trim();
  }
}

function extractMailAttachments(raw, queueKey) {
  const text = safeMailText(raw, 8000000);
  const boundary = (text.match(/boundary="?([^";\r\n]+)"?/i) || [])[1];
  const parts = boundary ? text.split(`--${boundary}`) : [text];
  const out = [];
  for (const part of parts) {
    const { headers, body } = mimeHeaderMap(part);
    const disposition = headers["content-disposition"] || "";
    const contentType = headers["content-type"] || "application/octet-stream";
    const fileName = sanitizeFileName(mimeParam(disposition, "filename") || mimeParam(contentType, "name"));
    if (!fileName || !/\.(xlsx|xls|csv|pdf|txt|jpg|jpeg|png|webp|ofx|sta|mt940)$/i.test(fileName)) continue;
    const encoding = String(headers["content-transfer-encoding"] || "").toLowerCase();
    const base64 = encoding.includes("base64")
      ? body.replace(/\s+/g, "")
      : btoa(unescape(encodeURIComponent(body.trim())));
    if (!base64 || base64.length > 7000000) {
      out.push({ fileName, mimeType: contentType.split(";")[0], source: "mail", tooLarge: true });
      continue;
    }
    out.push({
      fileName,
      mimeType: contentType.split(";")[0],
      source: "mail",
      storageKey: `${queueKey}:att:${out.length}`,
      size: Math.floor(base64.length * 0.75),
      base64
    });
  }
  return out.slice(0, 20);
}

function classifyMailDocument(subject, raw, attachmentNames) {
  const hay = `${subject || ""} ${attachmentNames.join(" ")} ${raw || ""}`.toLocaleLowerCase("tr-TR");
  if (/\bmoka\b|sanal\s+pos|\bpos\b|taksit/.test(hay)) return "moka";
  if (/halkbank|banka|hesap|ekstre|dekont|vadesiz/.test(hay)) return "bank";
  if (attachmentNames.some(x => /\.(xlsx|xls|csv)$/i.test(x))) return "statement";
  return "mail";
}

async function queueInboundEmail(message, env) {
  const queue = mailQueueStore(env);
  if (!queue) return;
  const raw = await readStreamText(message.raw);
  const from = safeMailText(message.from || headerValue(message.headers, "from"), 320);
  const to = safeMailText(message.to || headerValue(message.headers, "to"), 320);
  const subject = safeMailText(headerValue(message.headers, "subject"), 500);
  const date = safeMailText(headerValue(message.headers, "date"), 120) || new Date().toISOString();
  const messageId = safeMailText(headerValue(message.headers, "message-id"), 240) || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const key = mailQueueKey(messageId);
  const attachmentsWithData = extractMailAttachments(raw, key);
  for (const att of attachmentsWithData) {
    if (att.storageKey && att.base64) {
      await queue.put(att.storageKey, att.base64, {
        expirationTtl: 60 * 60 * 24 * 90,
        metadata: { channel: "mail-file", fileName: att.fileName || "" }
      });
      delete att.base64;
    }
  }
  const attachments = attachmentsWithData.map(att => ({ ...att }));
  const row = {
    id: messageId,
    channel: "mail",
    from,
    to,
    subject,
    date,
    receivedAt: new Date().toISOString(),
    docType: classifyMailDocument(subject, raw, attachments.map(x => x.fileName)),
    attachments,
    text: safeMailText(raw.replace(/Content-[^\n]+\n/gi, " ").replace(/[A-Za-z0-9+/=]{80,}/g, " ").replace(/\s+/g, " "), 4000)
  };
  const exists = await queue.get(key);
  if (!exists) {
    await queue.put(key, JSON.stringify(row), {
      expirationTtl: 60 * 60 * 24 * 90,
      metadata: { channel: "mail", date: row.receivedAt }
    });
  }
}

async function mailFile(request, env) {
  if (request.method !== "GET") return json({ ok: false, error: "GET gerekli." }, 405);
  const queue = mailQueueStore(env);
  if (!queue) return mailQueueMissing();
  const url = new URL(request.url);
  const key = String(url.searchParams.get("key") || "");
  const name = sanitizeFileName(url.searchParams.get("name") || "mail-ekstre-dosyasi");
  if (!key.startsWith("mailq:") || !key.includes(":att:")) return json({ ok: false, error: "Gecersiz mail dosya anahtari." }, 400);
  const base64 = await queue.get(key);
  if (!base64) return json({ ok: false, error: "Mail eki bulunamadi veya suresi doldu." }, 404);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const ext = name.split(".").pop().toLowerCase();
  const type = ext === "xlsx" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    : ext === "xls" ? "application/vnd.ms-excel"
    : ext === "csv" ? "text/csv; charset=utf-8"
    : ext === "pdf" ? "application/pdf"
    : ext === "jpg" || ext === "jpeg" ? "image/jpeg"
    : ext === "png" ? "image/png"
    : ext === "webp" ? "image/webp"
    : ext === "txt" || ext === "ofx" || ext === "sta" || ext === "mt940" ? "text/plain; charset=utf-8"
    : "application/octet-stream";
  return new Response(bytes, {
    headers: {
      "content-type": type,
      "cache-control": "no-store",
      "content-disposition": `attachment; filename="${name.replace(/"/g, "")}"`
    }
  });
}

async function gmailImport(request, env) {
  if (request.method !== "POST") return json({ ok: false, error: "POST gerekli." }, 405);
  const queue = mailQueueStore(env);
  if (!queue) return mailQueueMissing();
  const expected = String(env.ALKAM_GMAIL_INGEST_KEY || "").trim();
  if (!expected) return json({ ok: false, configured: false, error: "ALKAM_GMAIL_INGEST_KEY Cloudflare secret gerekli." }, 403);
  const supplied = request.headers.get("x-alkam-mail-key") || "";
  if (supplied !== expected) return json({ ok: false, configured: true, error: "Mail aktarim anahtari hatali." }, 403);
  let body = {};
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Gecersiz JSON." }, 400);
  }
  const messages = Array.isArray(body.messages) ? body.messages : [body];
  let queued = 0, duplicate = 0, files = 0;
  for (const msg of messages.slice(0, 50)) {
    const messageId = safeMailText(msg.id || msg.messageId || `${Date.now()}-${Math.random().toString(16).slice(2)}`, 240);
    const key = mailQueueKey(`gmail-${messageId}`);
    const exists = await queue.get(key);
    if (exists) {
      duplicate++;
      continue;
    }
    const attachments = [];
    for (const [idx, att] of (Array.isArray(msg.attachments) ? msg.attachments : []).entries()) {
      const fileName = sanitizeFileName(att.fileName || `gmail-ek-${idx + 1}`);
      if (!fileName || !/\.(xlsx|xls|csv|pdf|txt|jpg|jpeg|png|webp|ofx|sta|mt940)$/i.test(fileName)) continue;
      const base64 = String(att.base64 || "").replace(/\s+/g, "");
      const storageKey = `${key}:att:${attachments.length}`;
      if (base64 && base64.length <= 7000000) {
        await queue.put(storageKey, base64, {
          expirationTtl: 60 * 60 * 24 * 90,
          metadata: { channel: "gmail-file", fileName }
        });
        files++;
        attachments.push({
          fileName,
          mimeType: safeMailText(att.mimeType || "application/octet-stream", 160),
          source: "gmail",
          storageKey,
          size: Math.floor(base64.length * 0.75)
        });
      } else {
        attachments.push({ fileName, mimeType: safeMailText(att.mimeType || "", 160), source: "gmail", tooLarge: true });
      }
    }
    const subject = safeMailText(msg.subject || "", 500);
    const text = safeMailText(msg.text || msg.plainBody || "", 4000);
    const row = {
      id: messageId,
      channel: "gmail",
      from: safeMailText(msg.from || "", 320),
      to: safeMailText(msg.to || "", 320),
      subject,
      date: safeMailText(msg.date || "", 120),
      receivedAt: new Date().toISOString(),
      docType: classifyMailDocument(subject, text, attachments.map(x => x.fileName)),
      attachments,
      text
    };
    await queue.put(key, JSON.stringify(row), {
      expirationTtl: 60 * 60 * 24 * 90,
      metadata: { channel: "gmail", date: row.receivedAt }
    });
    queued++;
  }
  return json({ ok: true, configured: true, storageConfigured: true, queued, duplicate, files });
}

async function mailStatus(request, env) {
  const queue = mailQueueStore(env);
  const gmailConfigured = !!String(env.ALKAM_GMAIL_INGEST_KEY || "").trim();
  return json({
    ok: true,
    configured: !!queue,
    storageConfigured: !!queue,
    gmailConfigured,
    addressNote: gmailConfigured
      ? "Gmail otomasyonu hazir: Apps Script ekstre eklerini /api/mail/gmail-import kuyruğuna gonderir."
      : "Gmail otomasyonu icin Cloudflare secret gerekli: ALKAM_GMAIL_INGEST_KEY."
  });
}

async function mailQueue(request, env) {
  if (request.method !== "GET") return json({ ok: false, error: "GET gerekli." }, 405);
  const queue = mailQueueStore(env);
  if (!queue) return mailQueueMissing();
  const url = new URL(request.url);
  const limit = Math.max(1, Math.min(100, Number(url.searchParams.get("limit") || "50") || 50));
  const listed = await queue.list({ prefix: "mailq:", limit });
  const mails = [];
  for (const item of listed.keys || []) {
    const value = await queue.get(item.name, "json");
    if (value) mails.push({ ...value, queueKey: item.name });
  }
  mails.sort((a, b) => String(b.receivedAt || "").localeCompare(String(a.receivedAt || "")));
  return json({ ok: true, configured: true, storageConfigured: true, count: mails.length, mails });
}

async function mailQueueAck(request, env) {
  if (request.method !== "POST") return json({ ok: false, error: "POST gerekli." }, 405);
  const queue = mailQueueStore(env);
  if (!queue) return mailQueueMissing();
  let body = {};
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, configured: true, error: "Gecersiz JSON." }, 400);
  }
  const keys = Array.isArray(body.keys) ? body.keys.filter(k => String(k).startsWith("mailq:")) : [];
  for (const key of keys) await queue.delete(key);
  return json({ ok: true, configured: true, deleted: keys.length });
}

function telegramUpdateToRow(u) {
  const m = (u && (u.message || u.edited_message || u.channel_post)) || {};
  const from = m.from || {};
  const chat = m.chat || {};
  const attachments = messageAttachments(m);
  const text = m.text || m.caption || attachmentSummary(attachments);
  return {
    updateId: u && u.update_id,
    messageId: m.message_id || null,
    chatId: chat.id || null,
    chatTitle: chat.title || chat.username || [chat.first_name, chat.last_name].filter(Boolean).join(" ") || "",
    fromName: [from.first_name, from.last_name].filter(Boolean).join(" ") || from.username || "",
    date: m.date ? new Date(m.date * 1000).toISOString() : new Date().toISOString(),
    text,
    attachments
  };
}

function queueKey(updateId) {
  const value = Number(updateId) || Date.now();
  return `tgq:${String(value).padStart(14, "0")}`;
}

function sanitizeFileName(name) {
  return String(name || "telegram-dosya")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120) || "telegram-dosya";
}

function messageAttachments(m) {
  const out = [];
  if (Array.isArray(m.photo) && m.photo.length) {
    const p = m.photo[m.photo.length - 1];
    out.push({
      kind: "photo",
      fileId: p.file_id,
      uniqueId: p.file_unique_id || "",
      fileName: `telegram-foto-${m.message_id || Date.now()}.jpg`,
      mimeType: "image/jpeg",
      fileSize: p.file_size || 0
    });
  }
  if (m.document && m.document.file_id) {
    out.push({
      kind: "document",
      fileId: m.document.file_id,
      uniqueId: m.document.file_unique_id || "",
      fileName: sanitizeFileName(m.document.file_name || `telegram-belge-${m.message_id || Date.now()}`),
      mimeType: m.document.mime_type || "application/octet-stream",
      fileSize: m.document.file_size || 0
    });
  }
  return out;
}

function attachmentSummary(attachments) {
  if (!attachments.length) return "";
  return attachments.map(a => `${a.kind === "photo" ? "Fotoğraf" : "Belge"}: ${a.fileName}`).join(" · ");
}

function telegramWebhookReceiptText(row) {
  const hasAttachment = row.attachments && row.attachments.length;
  const lines = [
    "ALKAM Mali: Mesajınız alındı ve güvenli kuyruğa eklendi.",
    hasAttachment ? "Ek/dosya programda okunup Onay Merkezi'ne öneri olarak düşecek." : "Programda Onay Merkezi'ne öneri olarak düşecek.",
    "Kural: Onaylanmadan cari ekstresine kesin kayıt yazılmaz."
  ];
  return lines.join("\n");
}

async function telegramSendRaw(token, chatId, text) {
  if (!chatId || !text) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({
        chat_id: chatId,
        text: String(text).slice(0, 3900),
        disable_web_page_preview: true
      })
    });
    const data = await res.json().catch(() => ({}));
    return !!data.ok;
  } catch {
    return false;
  }
}

async function telegramStatus(request, env) {
  const token = env.TELEGRAM_BOT_TOKEN;
  if (!token) return tokenMissing();
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getMe`, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(8000)
    });
    const data = await res.json();
    if (!data.ok) {
      return json({ ok: false, configured: true, error: data.description || "Telegram API hatası" });
    }
    return json({
      ok: true,
      configured: true,
      bot: {
        id: data.result.id,
        username: data.result.username || "",
        firstName: data.result.first_name || "",
        canJoinGroups: !!data.result.can_join_groups,
        canReadAllGroupMessages: !!data.result.can_read_all_group_messages
      }
    });
  } catch (err) {
    return json({ ok: false, configured: true, error: err && err.message ? err.message : "Telegram bağlantı hatası" });
  }
}

async function telegramUpdates(request, env) {
  const token = env.TELEGRAM_BOT_TOKEN;
  if (!token) return tokenMissing();
  const url = new URL(request.url);
  const offset = Number(url.searchParams.get("offset") || "0") || 0;
  const tgUrl = new URL(`https://api.telegram.org/bot${token}/getUpdates`);
  if (offset > 0) tgUrl.searchParams.set("offset", String(offset));
  tgUrl.searchParams.set("limit", "50");
  tgUrl.searchParams.set("timeout", "0");
  tgUrl.searchParams.set("allowed_updates", JSON.stringify(["message"]));
  try {
    const res = await fetch(tgUrl.toString(), {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(10000)
    });
    const data = await res.json();
    if (!data.ok) {
      return json({ ok: false, configured: true, error: data.description || "Telegram API hatası" });
    }
    const updates = (data.result || []).map(telegramUpdateToRow).filter(x => x.text || (x.attachments && x.attachments.length));
    const nextOffset = updates.length ? Math.max(...updates.map(x => Number(x.updateId) || 0)) + 1 : offset;
    return json({ ok: true, configured: true, nextOffset, updates });
  } catch (err) {
    return json({ ok: false, configured: true, error: err && err.message ? err.message : "Telegram bağlantı hatası" });
  }
}

async function telegramWebhook(request, env) {
  if (request.method !== "POST") {
    return json({ ok: false, error: "POST gerekli." }, 405);
  }
  const token = env.TELEGRAM_BOT_TOKEN;
  if (!token) return tokenMissing();
  const queue = telegramQueueStore(env);
  if (!queue) return telegramQueueMissing();

  const expectedSecret = String(env.TELEGRAM_WEBHOOK_SECRET || "").trim();
  if (expectedSecret && request.headers.get("x-telegram-bot-api-secret-token") !== expectedSecret) {
    return json({ ok: false, configured: true, error: "Webhook secret hatali." }, 403);
  }

  let update = {};
  try {
    update = await request.json();
  } catch {
    return json({ ok: false, configured: true, error: "Gecersiz Telegram JSON." }, 400);
  }

  const row = telegramUpdateToRow(update);
  if (!row.updateId || (!row.text && !(row.attachments && row.attachments.length))) {
    return json({ ok: true, configured: true, queued: false, ignored: true });
  }

  const key = queueKey(row.updateId);
  const exists = await queue.get(key);
  let webhookAckSent = false;
  if (!exists) {
    webhookAckSent = await telegramSendRaw(token, row.chatId, telegramWebhookReceiptText(row));
    row.webhookAckSent = webhookAckSent;
    await queue.put(key, JSON.stringify(row), {
      expirationTtl: 60 * 60 * 24 * 45,
      metadata: { updateId: String(row.updateId), date: row.date || "" }
    });
  }
  return json({ ok: true, configured: true, storageConfigured: true, queued: !exists, updateId: row.updateId, webhookAckSent });
}

async function telegramQueue(request, env) {
  if (request.method !== "GET") {
    return json({ ok: false, error: "GET gerekli." }, 405);
  }
  const token = env.TELEGRAM_BOT_TOKEN;
  if (!token) return tokenMissing();
  const queue = telegramQueueStore(env);
  if (!queue) return telegramQueueMissing();
  const webhookEnsure = await ensureTelegramWebhook(request, env);
  const url = new URL(request.url);
  const limit = Math.max(1, Math.min(100, Number(url.searchParams.get("limit") || "50") || 50));
  const listed = await queue.list({ prefix: "tgq:", limit });
  const updates = [];
  for (const item of listed.keys || []) {
    const value = await queue.get(item.name, "json");
    if (value) updates.push({ ...value, queueKey: item.name });
  }
  updates.sort((a, b) => (Number(a.updateId) || 0) - (Number(b.updateId) || 0));
  return json({ ok: true, configured: true, storageConfigured: true, webhookEnsure, count: updates.length, updates });
}

async function telegramQueueAck(request, env) {
  if (request.method !== "POST") {
    return json({ ok: false, error: "POST gerekli." }, 405);
  }
  const token = env.TELEGRAM_BOT_TOKEN;
  if (!token) return tokenMissing();
  const queue = telegramQueueStore(env);
  if (!queue) return telegramQueueMissing();
  let body = {};
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, configured: true, error: "Gecersiz JSON." }, 400);
  }
  const updateIds = Array.isArray(body.updateIds) ? body.updateIds : [];
  const keys = Array.isArray(body.keys) ? body.keys : [];
  const targets = new Set([
    ...updateIds.map(queueKey),
    ...keys.filter(k => String(k).startsWith("tgq:"))
  ]);
  for (const key of targets) {
    await queue.delete(key);
  }
  return json({ ok: true, configured: true, storageConfigured: true, deleted: targets.size });
}

async function telegramWebhookInfo(request, env) {
  const token = env.TELEGRAM_BOT_TOKEN;
  if (!token) return tokenMissing();
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(10000)
    });
    const data = await res.json();
    if (!data.ok) {
      return json({ ok: false, configured: true, error: data.description || "Telegram webhook bilgisi alinamadi." });
    }
    return json({
      ok: true,
      configured: true,
      storageConfigured: !!telegramQueueStore(env),
      webhook: {
        url: data.result && data.result.url || "",
        pendingUpdateCount: data.result && data.result.pending_update_count || 0,
        lastErrorDate: data.result && data.result.last_error_date || null,
        lastErrorMessage: data.result && data.result.last_error_message || ""
      }
    });
  } catch (err) {
    return json({ ok: false, configured: true, error: err && err.message ? err.message : "Telegram webhook baglanti hatasi" });
  }
}

async function telegramWebhookSetup(request, env) {
  if (request.method !== "POST") {
    return json({ ok: false, error: "POST gerekli." }, 405);
  }
  const token = env.TELEGRAM_BOT_TOKEN;
  if (!token) return tokenMissing();
  if (!telegramQueueStore(env)) return telegramQueueMissing();
  const ensured = await ensureTelegramWebhook(request, env, true);
  if (ensured.ok) {
    return json({ ok: true, configured: true, storageConfigured: true, webhookUrl: ensured.webhookUrl, result: true });
  }
  return json({ ok: false, configured: true, storageConfigured: true, error: ensured.error || "Webhook kurulamadi." });
}

async function ensureTelegramWebhook(request, env, force = false) {
  const token = env.TELEGRAM_BOT_TOKEN;
  if (!token) return { ok: false, configured: false, error: "TELEGRAM_BOT_TOKEN yok." };
  if (!telegramQueueStore(env)) return { ok: false, configured: true, storageConfigured: false, error: "TELEGRAM_QUEUE yok." };
  const origin = new URL(request.url).origin;
  const secret = String(env.TELEGRAM_WEBHOOK_SECRET || "").trim();
  const webhookUrl = `${origin}/api/telegram/webhook`;
  try {
    if (!force) {
      const infoRes = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`, {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(8000)
      });
      const info = await infoRes.json();
      if (info.ok && info.result && info.result.url === webhookUrl) {
        return { ok: true, configured: true, storageConfigured: true, alreadyActive: true, webhookUrl };
      }
    }
  } catch {
    // Kurulum denemesi asagida devam eder.
  }
  const payload = {
    url: webhookUrl,
    allowed_updates: ["message", "edited_message", "channel_post"],
    drop_pending_updates: false
  };
  if (secret) payload.secret_token = secret;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: AbortSignal.timeout(12000),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.ok) return { ok: false, configured: true, storageConfigured: true, error: data.description || "Webhook kurulamadi." };
    return { ok: true, configured: true, storageConfigured: true, alreadyActive: false, webhookUrl, result: data.result };
  } catch (err) {
    return { ok: false, configured: true, storageConfigured: true, error: err && err.message ? err.message : "Webhook kurulum baglanti hatasi" };
  }
}

async function telegramFile(request, env) {
  const token = env.TELEGRAM_BOT_TOKEN;
  if (!token) return tokenMissing();
  const url = new URL(request.url);
  const fileId = String(url.searchParams.get("id") || "").trim();
  const downloadName = sanitizeFileName(url.searchParams.get("name") || "telegram-dosya");
  if (!fileId) return json({ ok: false, configured: true, error: "file id gerekli." }, 400);

  try {
    const infoRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${encodeURIComponent(fileId)}`, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(10000)
    });
    const info = await infoRes.json();
    if (!info.ok || !info.result || !info.result.file_path) {
      return json({ ok: false, configured: true, error: info.description || "Telegram dosya yolu alınamadı." }, 502);
    }
    const fileRes = await fetch(`https://api.telegram.org/file/bot${token}/${info.result.file_path}`, {
      signal: AbortSignal.timeout(20000)
    });
    if (!fileRes.ok) {
      return json({ ok: false, configured: true, error: "Telegram dosyası indirilemedi." }, 502);
    }
    const headers = new Headers(fileRes.headers);
    headers.set("cache-control", "no-store");
    headers.set("content-disposition", `attachment; filename="${downloadName.replace(/"/g, "")}"`);
    return new Response(fileRes.body, {
      status: fileRes.status,
      statusText: fileRes.statusText,
      headers
    });
  } catch (err) {
    return json({ ok: false, configured: true, error: err && err.message ? err.message : "Telegram dosya bağlantı hatası" }, 502);
  }
}

async function telegramSend(request, env) {
  if (request.method !== "POST") {
    return json({ ok: false, error: "POST gerekli." }, 405);
  }
  const token = env.TELEGRAM_BOT_TOKEN;
  if (!token) return tokenMissing();

  let body = {};
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, configured: true, error: "Geçersiz JSON." });
  }

  const chatId = String(body.chatId || "").trim();
  const text = String(body.text || "").trim().slice(0, 3900);
  if (!chatId || !text) {
    return json({ ok: false, configured: true, error: "chatId ve text gerekli." });
  }

  const allowed = String(env.TELEGRAM_ALLOWED_CHAT_ID || "").split(",").map(x => x.trim()).filter(Boolean);
  if (allowed.length && !allowed.includes(chatId)) {
    return json({ ok: false, configured: true, error: "Bu chatId için gönderim izni yok." });
  }

  const sendKey = String(env.TELEGRAM_SEND_KEY || "").trim();
  if (sendKey && request.headers.get("x-alkam-telegram-key") !== sendKey) {
    return json({ ok: false, configured: true, error: "Telegram gönderim anahtarı hatalı." });
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: AbortSignal.timeout(10000),
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true
      })
    });
    const data = await res.json();
    if (!data.ok) {
      return json({ ok: false, configured: true, error: data.description || "Telegram gönderim hatası" });
    }
    return json({ ok: true, configured: true, messageId: data.result && data.result.message_id });
  } catch (err) {
    return json({ ok: false, configured: true, error: err && err.message ? err.message : "Telegram gönderim bağlantı hatası" });
  }
}
