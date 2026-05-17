import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import TelegramBot from 'node-telegram-bot-api';

const secret = process.env.TELEGRAM_BOT_SECRET;
const queueDir = process.env.TG_QUEUE_DIR || './tg_queue';
const logDir = process.env.TG_LOG_DIR || './logs';

if (!secret) {
  console.error('TELEGRAM_BOT_SECRET eksik. Yerelde .env dosyasına ekle.');
  process.exit(1);
}

fs.mkdirSync(queueDir, { recursive: true });
fs.mkdirSync(logDir, { recursive: true });

const bot = new TelegramBot(secret, { polling: true });

function cleanName(name = '') {
  return String(name).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80) || 'telegram_item';
}

function saveQueue(payload) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const file = path.join(queueDir, `${stamp}_${payload.kind}_${payload.messageId || 'msg'}.json`);
  fs.writeFileSync(file, JSON.stringify(payload, null, 2), 'utf8');
  fs.appendFileSync(path.join(logDir, 'tg-bot-v3.log'), `[${new Date().toISOString()}] queued ${file}\n`, 'utf8');
  return file;
}

function buildBase(msg, kind) {
  return {
    id: `TG-${Date.now().toString(36).toUpperCase()}`,
    kind,
    source: 'Telegram',
    status: 'Kuyrukta',
    messageId: msg.message_id,
    chatId: msg.chat?.id,
    fromId: msg.from?.id,
    fromName: [msg.from?.first_name, msg.from?.last_name].filter(Boolean).join(' '),
    username: msg.from?.username || '',
    dateUnix: msg.date,
    receivedAt: new Date().toISOString(),
    text: msg.text || msg.caption || '',
    file: null,
    suggested: {
      cari: '',
      amount: 0,
      date: '',
      type: 'Telegram kuyruk',
      confidence: 0,
      reason: 'Bot sadece kuyruk kaydı oluşturdu; kesin kayıt yok.'
    }
  };
}

bot.on('message', async (msg) => {
  try {
    let payload = buildBase(msg, 'message');

    const fileObj = msg.document || msg.photo?.[msg.photo.length - 1] || null;
    if (fileObj) {
      payload.kind = msg.document ? 'document' : 'photo';
      payload.file = {
        fileId: fileObj.file_id,
        fileUniqueId: fileObj.file_unique_id || '',
        fileName: cleanName(msg.document?.file_name || 'photo.jpg'),
        mimeType: msg.document?.mime_type || 'image/jpeg',
        fileSize: fileObj.file_size || 0
      };
    }

    const saved = saveQueue(payload);
    await bot.sendMessage(msg.chat.id, `ALKAM Mali: Kayda alındı. Onay Merkezi kuyruğuna düştü.\n${path.basename(saved)}`);
  } catch (err) {
    fs.appendFileSync(path.join(logDir, 'tg-bot-v3-error.log'), `[${new Date().toISOString()}] ${err.stack || err.message}\n`, 'utf8');
    try { await bot.sendMessage(msg.chat.id, 'ALKAM Mali: Kayıt sırasında hata oluştu.'); } catch {}
  }
});

console.log('TG v3 bot çalışıyor. Mesajlar tg_queue içine yazılacak.');
