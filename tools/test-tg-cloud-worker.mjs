import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const TELEGRAM_WEBHOOK_SECRET = 'test-telegram-secret';
const QUEUE_READ_SECRET = 'test-queue-secret';

const worker = await loadWorkerModule();
const sampleUpdate = JSON.parse(
  await readFile(resolve('fixtures/tg-cloud-sample-update.json'), 'utf8')
);

async function loadWorkerModule() {
  const workerSource = await readFile(resolve('workers/tg-cloud-worker.js'), 'utf8');
  const dataUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent(workerSource)}`;
  const mod = await import(dataUrl);
  return mod.default;
}

class MemoryKV {
  constructor() {
    this.map = new Map();
  }

  async put(key, value) {
    this.map.set(key, value);
  }

  async get(key, type) {
    const value = this.map.get(key);
    if (!value) return null;
    return type === 'json' ? JSON.parse(value) : value;
  }

  async list() {
    return {
      keys: [...this.map.keys()].map((name) => ({ name }))
    };
  }
}

const env = {
  TG_QUEUE: new MemoryKV(),
  TELEGRAM_WEBHOOK_SECRET,
  QUEUE_READ_SECRET
};

async function callWorker(path, options = {}) {
  const request = new Request(`https://worker.test${path}`, options);
  const response = await worker.fetch(request, env);
  const body = await response.json();
  return { status: response.status, body };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function run() {
  const ready = await callWorker('/');
  assert(ready.status === 200, 'GET / status 200 olmali');
  assert(ready.body.ok === true, 'GET / ok true olmali');

  const webhookNoSecret = await callWorker('/telegram/webhook', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(sampleUpdate)
  });
  assert(webhookNoSecret.status === 401, 'Webhook secretsiz 401 donmeli');
  assert(webhookNoSecret.body.error === 'unauthorized_telegram_webhook', 'Webhook secretsiz hata kodu yanlis');

  const webhookInvalidJson = await callWorker('/telegram/webhook', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-telegram-bot-api-secret-token': TELEGRAM_WEBHOOK_SECRET
    },
    body: '{invalid-json'
  });
  assert(webhookInvalidJson.status === 400, 'Gecersiz JSON 400 donmeli');
  assert(webhookInvalidJson.body.error === 'invalid_json', 'Gecersiz JSON hata kodu yanlis');

  const webhookOk = await callWorker('/telegram/webhook', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-telegram-bot-api-secret-token': TELEGRAM_WEBHOOK_SECRET
    },
    body: JSON.stringify(sampleUpdate)
  });
  assert(webhookOk.status === 200, 'Webhook dogru secret ile 200 donmeli');
  assert(webhookOk.body.ok === true, 'Webhook dogru secret ile ok true olmali');
  assert(webhookOk.body.status === 'Kuyrukta', 'Webhook kaydi Kuyrukta olmali');

  const queueNoSecret = await callWorker('/queue');
  assert(queueNoSecret.status === 401, 'Queue secretsiz 401 donmeli');
  assert(queueNoSecret.body.error === 'unauthorized_queue_read', 'Queue secretsiz hata kodu yanlis');

  const queueQuerySecret = await callWorker(`/queue?secret=${QUEUE_READ_SECRET}`);
  assert(queueQuerySecret.status === 401, 'Queue query secret ile 401 donmeli');

  const queueBearer = await callWorker('/queue', {
    headers: { authorization: `Bearer ${QUEUE_READ_SECRET}` }
  });
  assert(queueBearer.status === 200, 'Queue Bearer ile 200 donmeli');
  assert(queueBearer.body.ok === true, 'Queue Bearer ok true olmali');
  assert(Array.isArray(queueBearer.body.items), 'Queue items array olmali');
  assert(queueBearer.body.items.length === 1, 'Queue icinde 1 test kaydi olmali');

  const item = queueBearer.body.items[0];
  assert(item.source === 'Telegram Cloud', 'source Telegram Cloud olmali');
  assert(item.status === 'Kuyrukta', 'status Kuyrukta olmali');
  assert(item.suggested.amount === 1250.75, 'suggested.amount 1250.75 olmali');
  assert(item.suggested.date === '2026-05-17', 'suggested.date 2026-05-17 olmali');
  assert(item.suggested.confidence === 0, 'suggested.confidence 0 olmali');
  assert(item.file.fileName === 'test-dekont.pdf', 'fileName test-dekont.pdf olmali');

  const queueHeader = await callWorker('/queue', {
    headers: { 'x-alkam-admin-secret': QUEUE_READ_SECRET }
  });
  assert(queueHeader.status === 200, 'Queue admin header ile 200 donmeli');

  const missingKvEnv = {
    TELEGRAM_WEBHOOK_SECRET,
    QUEUE_READ_SECRET
  };
  const missingKvRequest = new Request('https://worker.test/telegram/webhook', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-telegram-bot-api-secret-token': TELEGRAM_WEBHOOK_SECRET
    },
    body: JSON.stringify(sampleUpdate)
  });
  const missingKvResponse = await worker.fetch(missingKvRequest, missingKvEnv);
  const missingKvBody = await missingKvResponse.json();
  assert(missingKvResponse.status === 500, 'KV yoksa 500 donmeli');
  assert(missingKvBody.error === 'worker_error', 'KV yoksa worker_error donmeli');

  console.log('TG Cloud Worker simulation tests passed');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
