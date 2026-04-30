const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-ALKAM-Webhook-Secret"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: Object.assign({ "Content-Type": "application/json; charset=utf-8" }, CORS_HEADERS)
  });
}

async function verifySecret(request, env) {
  if (!env.ALKAM_WEBHOOK_SECRET) return true;
  return request.headers.get("X-ALKAM-Webhook-Secret") === env.ALKAM_WEBHOOK_SECRET;
}

async function telegramFileInfo(fileId, env) {
  if (!env.TELEGRAM_BOT_TOKEN) return { ok: false, error: "missing_TELEGRAM_BOT_TOKEN" };
  const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/getFile?file_id=${encodeURIComponent(fileId)}`);
  const data = await res.json();
  if (!data.ok || !data.result || !data.result.file_path) return { ok: false, error: "telegram_file_info_failed", data };
  return {
    ok: true,
    provider: "telegram",
    filePath: data.result.file_path,
    downloadUrl: `https://api.telegram.org/file/bot${env.TELEGRAM_BOT_TOKEN}/${data.result.file_path}`
  };
}

async function whatsappMediaInfo(mediaId, env) {
  if (!env.WHATSAPP_ACCESS_TOKEN) return { ok: false, error: "missing_WHATSAPP_ACCESS_TOKEN" };
  const meta = await fetch(`https://graph.facebook.com/v20.0/${encodeURIComponent(mediaId)}`, {
    headers: { Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}` }
  });
  const data = await meta.json();
  if (!data.url) return { ok: false, error: "whatsapp_media_info_failed", data };
  return { ok: true, provider: "whatsapp", downloadUrl: data.url, mimeType: data.mime_type, sha256: data.sha256 };
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestPost({ request, env }) {
  if (!(await verifySecret(request, env))) return json({ ok: false, error: "invalid_webhook_secret" }, 401);

  let payload;
  try {
    payload = await request.json();
  } catch (_) {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  const provider = payload.provider || payload.channel;
  const fileId = payload.fileId || payload.mediaId;
  if (!provider || !fileId) return json({ ok: false, error: "missing_provider_or_file_id" }, 400);

  if (provider === "telegram") return json(await telegramFileInfo(fileId, env));
  if (provider === "whatsapp") return json(await whatsappMediaInfo(fileId, env));
  return json({ ok: false, error: "unsupported_provider" }, 400);
}
