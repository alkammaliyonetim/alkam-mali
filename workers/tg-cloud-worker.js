export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      if (request.method === 'OPTIONS') {
        return json({ ok: true });
      }

      if (request.method === 'GET' && url.pathname === '/') {
        return json({ ok: true, service: 'ALKAM TG Cloud', status: 'ready' });
      }

      if (request.method === 'POST' && url.pathname === '/telegram/webhook') {
        const webhookGuard = verifyTelegramSecret(request, env);
        if (!webhookGuard.ok) return json(webhookGuard.body, webhookGuard.status);

        const update = await request.json().catch(() => null);
        if (!update) return json({ ok: false, error: 'invalid_json' }, 400);

        const item = normalizeTelegramUpdate(update);
        await saveQueue(env, item);
        return json({ ok: true, queued: item.id, status: item.status });
      }

      if (request.method === 'GET' && url.pathname === '/queue') {
        const queueGuard = verifyQueueReadSecret(request, env);
        if (!queueGuard.ok) return json(queueGuard.body, queueGuard.status);

        const items = await readQueue(env);
        return json({ ok: true, items });
      }

      return json({ ok: false, error: 'not_found' }, 404);
    } catch (err) {
      return json({
        ok: false,
        error: 'worker_error',
        message: err?.message || 'Unknown worker error'
      }, 500);
    }
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,POST,OPTIONS',
      'access-control-allow-headers': 'content-type,x-telegram-bot-api-secret-token,x-alkam-admin-secret,authorization'
    }
  });
}

function verifyTelegramSecret(request, env) {
  if (!env.TELEGRAM_WEBHOOK_SECRET) {
    return {
      ok: false,
      status: 500,
      body: { ok: false, error: 'telegram_webhook_secret_not_configured' }
    };
  }

  const incomingSecret = request.headers.get('x-telegram-bot-api-secret-token') || '';
  if (incomingSecret !== env.TELEGRAM_WEBHOOK_SECRET) {
    return {
      ok: false,
      status: 401,
      body: { ok: false, error: 'unauthorized_telegram_webhook' }
    };
  }

  return { ok: true };
}

function verifyQueueReadSecret(request, env) {
  if (!env.QUEUE_READ_SECRET) {
    return {
      ok: false,
      status: 500,
      body: { ok: false, error: 'queue_read_secret_not_configured' }
    };
  }

  const bearer = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const headerSecret = request.headers.get('x-alkam-admin-secret') || '';
  const incomingSecret = bearer || headerSecret;

  if (incomingSecret !== env.QUEUE_READ_SECRET) {
    return {
      ok: false,
      status: 401,
      body: { ok: false, error: 'unauthorized_queue_read' }
    };
  }

  return { ok: true };
}

function normalizeTelegramUpdate(update) {
  const msg = update.message || update.edited_message || {};
  const file = extractFile(msg);
  const text = msg.text || msg.caption || '';
  return {
    id: makeQueueId(),
    source: 'Telegram Cloud',
    status: 'Kuyrukta',
    updateId: update.update_id || null,
    messageId: msg.message_id || null,
    chatId: msg.chat?.id || null,
    fromId: msg.from?.id || null,
    fromName: [msg.from?.first_name, msg.from?.last_name].filter(Boolean).join(' '),
    username: msg.from?.username || '',
    receivedAt: new Date().toISOString(),
    text,
    file,
    suggested: {
      cari: '',
      amount: guessAmount(text),
      date: guessDate(text),
      type: 'Telegram cloud kuyruk',
      confidence: 0,
      reason: 'Cloud webhook sadece kuyruk kaydı oluşturdu; kesin kayıt yok.'
    },
    raw: update
  };
}

function makeQueueId() {
  const suffix = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  return 'TGCL-' + Date.now().toString(36).toUpperCase() + '-' + suffix;
}

function extractFile(msg) {
  const photo = Array.isArray(msg.photo) ? msg.photo[msg.photo.length - 1] : null;
  const doc = msg.document || null;
  const f = doc || photo;
  if (!f) return null;
  return {
    fileId: f.file_id,
    fileUniqueId: f.file_unique_id || '',
    fileName: doc?.file_name || (photo ? 'photo.jpg' : 'telegram_file'),
    mimeType: doc?.mime_type || (photo ? 'image/jpeg' : ''),
    fileSize: f.file_size || 0
  };
}

function guessAmount(text) {
  const m = String(text || '').match(/([0-9\.]+(?:,[0-9]{1,2})?)/);
  if (!m) return 0;
  return Number(m[1].replace(/\./g, '').replace(',', '.')) || 0;
}

function guessDate(text) {
  const m = String(text || '').match(/\b(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{2,4})\b/);
  if (!m) return '';
  const day = m[1].padStart(2, '0');
  const month = m[2].padStart(2, '0');
  const year = m[3].length === 2 ? '20' + m[3] : m[3];
  return `${year}-${month}-${day}`;
}

async function saveQueue(env, item) {
  if (!env.TG_QUEUE) {
    throw new Error('TG_QUEUE binding is not configured');
  }
  await env.TG_QUEUE.put(item.id, JSON.stringify(item));
}

async function readQueue(env) {
  if (!env.TG_QUEUE) {
    throw new Error('TG_QUEUE binding is not configured');
  }

  const list = await env.TG_QUEUE.list({ limit: 50 });
  const items = [];
  for (const key of list.keys) {
    const val = await env.TG_QUEUE.get(key.name, 'json');
    if (val) items.push(val);
  }
  return items.sort((a, b) => String(b.receivedAt).localeCompare(String(a.receivedAt)));
}
