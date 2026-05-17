export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/') {
      return json({ ok: true, service: 'ALKAM TG Cloud', status: 'ready' });
    }

    if (request.method === 'POST' && url.pathname === '/telegram/webhook') {
      const update = await request.json().catch(() => null);
      if (!update) return json({ ok: false, error: 'invalid_json' }, 400);

      const item = normalizeTelegramUpdate(update);
      await saveQueue(env, item);
      return json({ ok: true, queued: item.id });
    }

    if (request.method === 'GET' && url.pathname === '/queue') {
      const items = await readQueue(env);
      return json({ ok: true, items });
    }

    return json({ ok: false, error: 'not_found' }, 404);
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*'
    }
  });
}

function normalizeTelegramUpdate(update) {
  const msg = update.message || update.edited_message || {};
  const file = extractFile(msg);
  const text = msg.text || msg.caption || '';
  return {
    id: 'TGCL-' + Date.now().toString(36).toUpperCase(),
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
      date: '',
      type: 'Telegram cloud kuyruk',
      confidence: 0,
      reason: 'Cloud webhook sadece kuyruk kaydı oluşturdu; kesin kayıt yok.'
    },
    raw: update
  };
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

async function saveQueue(env, item) {
  if (env.TG_QUEUE) {
    await env.TG_QUEUE.put(item.id, JSON.stringify(item));
    return;
  }
  // Fallback for local preview without KV binding.
  return;
}

async function readQueue(env) {
  if (!env.TG_QUEUE) return [];
  const list = await env.TG_QUEUE.list({ limit: 50 });
  const items = [];
  for (const key of list.keys) {
    const val = await env.TG_QUEUE.get(key.name, 'json');
    if (val) items.push(val);
  }
  return items.sort((a, b) => String(b.receivedAt).localeCompare(String(a.receivedAt)));
}
