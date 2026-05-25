export default {
  async fetch(request, env) {
    const url = new URL(request.url);
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
  });
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
  if (!exists) {
    await queue.put(key, JSON.stringify(row), {
      expirationTtl: 60 * 60 * 24 * 45,
      metadata: { updateId: String(row.updateId), date: row.date || "" }
    });
  }
  return json({ ok: true, configured: true, storageConfigured: true, queued: !exists, updateId: row.updateId });
}

async function telegramQueue(request, env) {
  if (request.method !== "GET") {
    return json({ ok: false, error: "GET gerekli." }, 405);
  }
  const token = env.TELEGRAM_BOT_TOKEN;
  if (!token) return tokenMissing();
  const queue = telegramQueueStore(env);
  if (!queue) return telegramQueueMissing();
  const url = new URL(request.url);
  const limit = Math.max(1, Math.min(100, Number(url.searchParams.get("limit") || "50") || 50));
  const listed = await queue.list({ prefix: "tgq:", limit });
  const updates = [];
  for (const item of listed.keys || []) {
    const value = await queue.get(item.name, "json");
    if (value) updates.push({ ...value, queueKey: item.name });
  }
  updates.sort((a, b) => (Number(a.updateId) || 0) - (Number(b.updateId) || 0));
  return json({ ok: true, configured: true, storageConfigured: true, count: updates.length, updates });
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
  const origin = new URL(request.url).origin;
  const secret = String(env.TELEGRAM_WEBHOOK_SECRET || "").trim();
  const payload = {
    url: `${origin}/api/telegram/webhook`,
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
    if (!data.ok) {
      return json({ ok: false, configured: true, storageConfigured: true, error: data.description || "Webhook kurulamadi." });
    }
    return json({ ok: true, configured: true, storageConfigured: true, webhookUrl: payload.url, result: data.result });
  } catch (err) {
    return json({ ok: false, configured: true, storageConfigured: true, error: err && err.message ? err.message : "Webhook kurulum baglanti hatasi" });
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
