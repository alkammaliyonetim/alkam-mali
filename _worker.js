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

async function telegramStatus(request, env) {
  const token = env.TELEGRAM_BOT_TOKEN;
  if (!token) return tokenMissing();
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getMe`, {
      headers: { accept: "application/json" }
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
    const res = await fetch(tgUrl.toString(), { headers: { accept: "application/json" } });
    const data = await res.json();
    if (!data.ok) {
      return json({ ok: false, configured: true, error: data.description || "Telegram API hatası" });
    }
    const updates = (data.result || []).map(u => {
      const m = u.message || {};
      const from = m.from || {};
      const chat = m.chat || {};
      return {
        updateId: u.update_id,
        messageId: m.message_id || null,
        chatId: chat.id || null,
        chatTitle: chat.title || chat.username || [chat.first_name, chat.last_name].filter(Boolean).join(" ") || "",
        fromName: [from.first_name, from.last_name].filter(Boolean).join(" ") || from.username || "",
        date: m.date ? new Date(m.date * 1000).toISOString() : new Date().toISOString(),
        text: m.text || m.caption || ""
      };
    }).filter(x => x.text);
    const nextOffset = updates.length ? Math.max(...updates.map(x => Number(x.updateId) || 0)) + 1 : offset;
    return json({ ok: true, configured: true, nextOffset, updates });
  } catch (err) {
    return json({ ok: false, configured: true, error: err && err.message ? err.message : "Telegram bağlantı hatası" });
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
