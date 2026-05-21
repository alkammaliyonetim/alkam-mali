export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/telegram/updates") {
      return telegramUpdates(request, env);
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

async function telegramUpdates(request, env) {
  const headers = {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  };
  const token = env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return new Response(JSON.stringify({
      ok: false,
      configured: false,
      error: "TELEGRAM_BOT_TOKEN Cloudflare ortam değişkeni bağlı değil."
    }), { status: 200, headers });
  }
  const url = new URL(request.url);
  const offset = Number(url.searchParams.get("offset") || "0") || 0;
  const tgUrl = new URL(`https://api.telegram.org/bot${token}/getUpdates`);
  if (offset > 0) tgUrl.searchParams.set("offset", String(offset));
  tgUrl.searchParams.set("limit", "50");
  tgUrl.searchParams.set("timeout", "0");
  tgUrl.searchParams.set("allowed_updates", JSON.stringify(["message"]));
  try {
    const res = await fetch(tgUrl.toString(), { headers: { "accept": "application/json" } });
    const data = await res.json();
    if (!data.ok) {
      return new Response(JSON.stringify({ ok: false, configured: true, error: data.description || "Telegram API hatası" }), { status: 200, headers });
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
    return new Response(JSON.stringify({ ok: true, configured: true, nextOffset, updates }), { status: 200, headers });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, configured: true, error: err && err.message ? err.message : "Telegram bağlantı hatası" }), { status: 200, headers });
  }
}
