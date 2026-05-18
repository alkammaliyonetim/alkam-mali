const workerUrl = process.env.TG_CLOUD_WORKER_URL || 'http://localhost:8787';
const telegramSecret = process.env.TELEGRAM_WEBHOOK_SECRET || '<TELEGRAM_WEBHOOK_SECRET>';
const queueSecret = process.env.QUEUE_READ_SECRET || '<QUEUE_READ_SECRET>';
const fixturePath = process.env.TG_CLOUD_FIXTURE || 'fixtures/tg-cloud-sample-update.json';

const normalizedWorkerUrl = workerUrl.replace(/\/+$/, '');

const commands = [
  {
    title: '1) Servis hazır kontrolü',
    command: `curl "${normalizedWorkerUrl}/"`
  },
  {
    title: '2) Webhook secretsız istek 401 dönmeli',
    command: `curl -X POST "${normalizedWorkerUrl}/telegram/webhook" \\
  -H "content-type: application/json" \\
  -d @${fixturePath}`
  },
  {
    title: '3) Webhook doğru secret ile Kuyrukta kayıt oluşturmalı',
    command: `curl -X POST "${normalizedWorkerUrl}/telegram/webhook" \\
  -H "content-type: application/json" \\
  -H "x-telegram-bot-api-secret-token: ${telegramSecret}" \\
  -d @${fixturePath}`
  },
  {
    title: '4) Queue secretsız istek 401 dönmeli',
    command: `curl "${normalizedWorkerUrl}/queue"`
  },
  {
    title: '5) Queue URL query secret ile yine 401 dönmeli',
    command: `curl "${normalizedWorkerUrl}/queue?secret=${queueSecret}"`
  },
  {
    title: '6) Queue Bearer ile okunmalı',
    command: `curl "${normalizedWorkerUrl}/queue" \\
  -H "Authorization: Bearer ${queueSecret}"`
  },
  {
    title: '7) Queue admin header ile okunmalı',
    command: `curl "${normalizedWorkerUrl}/queue" \\
  -H "x-alkam-admin-secret: ${queueSecret}"`
  }
];

console.log('# TG Cloud Preview Test Komutları');
console.log('');
console.log(`Worker URL: ${normalizedWorkerUrl}`);
console.log(`Fixture: ${fixturePath}`);
console.log('');
console.log('Not: Gerçek secret değerlerini repoya yazma. Bu çıktı sadece lokal terminalde kullanılmalıdır.');
console.log('');

for (const item of commands) {
  console.log(`## ${item.title}`);
  console.log('```bash');
  console.log(item.command);
  console.log('```');
  console.log('');
}
