const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-ALKAM-Webhook-Secret"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: Object.assign({ "Content-Type": "application/json; charset=utf-8" }, CORS_HEADERS)
  });
}

function safeString(value) {
  return String(value == null ? "" : value).slice(0, 4000);
}

function nowIso() {
  return new Date().toISOString();
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

async function readQueue(env) {
  if (!env.ALKAM_INBOUND_KV) return [];
  const raw = await env.ALKAM_INBOUND_KV.get("queue:pending");
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

async function writeQueue(env, rows) {
  if (!env.ALKAM_INBOUND_KV) return false;
  await env.ALKAM_INBOUND_KV.put("queue:pending", JSON.stringify(rows.slice(0, 500)));
  return true;
}

function classifyText(text, fileName) {
  const hay = `${text || ""} ${fileName || ""}`.toLocaleLowerCase("tr-TR");
  if (hay.includes("moka") || hay.includes("pos") || hay.includes("taksit")) return "moka_pos";
  if (hay.includes("banka") || hay.includes("iban") || hay.includes("dekont") || hay.includes("hesap")) return "bank_statement";
  if (hay.endsWith(".xlsx") || hay.endsWith(".xls") || hay.endsWith(".csv")) return "spreadsheet";
  if (hay.endsWith(".pdf")) return "pdf";
  return "unknown";
}

function fromTelegram(payload) {
  const msg = payload.message || payload.edited_message || payload.channel_post || {};
  const doc = msg.document || null;
  const photo = Array.isArray(msg.photo) ? msg.photo[msg.photo.length - 1] : null;
  const file = doc || photo || null;
  const caption = safeString(msg.caption || msg.text || "");
  const fileName = safeString(doc && doc.file_name ? doc.file_name : photo ? "telegram-photo.jpg" : "");

  return {
    id: makeId("TG"),
    channel: "telegram",
    sourceUser: safeString(msg.from && (msg.from.username || msg.from.id)),
    sourceChat: safeString(msg.chat && (msg.chat.username || msg.chat.id)),
    messageId: safeString(msg.message_id),
    receivedAt: nowIso(),
    status: "pending",
    docType: classifyText(caption, fileName),
    text: caption,
    fileName,
    fileId: safeString(file && file.file_id),
    mimeType: safeString(doc && doc.mime_type),
    rawProvider: "telegram"
  };
}

function fromWhatsApp(payload) {
  const entry = (payload.entry || [])[0] || {};
  const change = (entry.changes || [])[0] || {};
  const value = change.value || {};
  const msg = (value.messages || [])[0] || {};
  const doc = msg.document || msg.image || msg.video || null;
  const text = safeString((msg.text && msg.text.body) || (doc && doc.caption) || "");
  const fileName = safeString((doc && doc.filename) || (msg.image ? "whatsapp-image.jpg" : ""));

  return {
    id: makeId("WA"),
    channel: "whatsapp",
    sourceUser: safeString(msg.from),
    sourceChat: safeString(value.metadata && value.metadata.phone_number_id),
    messageId: safeString(msg.id),
    receivedAt: nowIso(),
    status: "pending",
    docType: classifyText(text, fileName),
    text,
    fileName,
    fileId: safeString(doc && doc.id),
    mimeType: safeString(doc && doc.mime_type),
    rawProvider: "whatsapp"
  };
}

function fromGeneric(payload) {
  const text = safeString(payload.text || payload.caption || payload.description || "");
  const fileName = safeString(payload.fileName || payload.filename || payload.name || "");
  return {
    id: makeId("INB"),
    channel: safeString(payload.channel || "generic"),
    sourceUser: safeString(payload.sourceUser || payload.from || ""),
    sourceChat: safeString(payload.sourceChat || payload.chat || ""),
    messageId: safeString(payload.messageId || payload.id || ""),
    receivedAt: nowIso(),
    status: "pending",
    docType: classifyText(text, fileName),
    text,
    fileName,
    fileId: safeString(payload.fileId || payload.mediaId || ""),
    mimeType: safeString(payload.mimeType || ""),
    rawProvider: "generic"
  };
}

async function verifySecret(request, env) {
  if (!env.ALKAM_WEBHOOK_SECRET) return true;
  return request.headers.get("X-ALKAM-Webhook-Secret") === env.ALKAM_WEBHOOK_SECRET;
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);

  // WhatsApp webhook verification.
  if (url.searchParams.has("hub.mode")) {
    const tokenOk = !env.WHATSAPP_VERIFY_TOKEN || url.searchParams.get("hub.verify_token") === env.WHATSAPP_VERIFY_TOKEN;
    if (url.searchParams.get("hub.mode") === "subscribe" && tokenOk) {
      return new Response(url.searchParams.get("hub.challenge") || "", { status: 200, headers: CORS_HEADERS });
    }
    return new Response("Forbidden", { status: 403, headers: CORS_HEADERS });
  }

  const queue = await readQueue(env);
  return json({ ok: true, configured: !!env.ALKAM_INBOUND_KV, count: queue.length, documents: queue });
}

export async function onRequestPost({ request, env }) {
  if (!(await verifySecret(request, env))) {
    return json({ ok: false, error: "invalid_webhook_secret" }, 401);
  }

  let payload;
  try {
    payload = await request.json();
  } catch (_) {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  const url = new URL(request.url);
  const provider = url.searchParams.get("provider") || payload.provider || "generic";
  let doc;
  if (provider === "telegram") doc = fromTelegram(payload);
  else if (provider === "whatsapp") doc = fromWhatsApp(payload);
  else doc = fromGeneric(payload);

  const queue = await readQueue(env);
  const duplicate = queue.some(item => item.channel === doc.channel && item.messageId && item.messageId === doc.messageId);
  if (!duplicate) queue.unshift(doc);
  const persisted = await writeQueue(env, queue);

  return json({ ok: true, persisted, duplicate, document: doc, note: persisted ? "queued_for_review" : "missing_ALKAM_INBOUND_KV_binding" });
}
