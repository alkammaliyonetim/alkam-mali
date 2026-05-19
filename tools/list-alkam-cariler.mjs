import fs from 'fs';

const file = 'alkam-cariler-77-28-04-2026.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

const rows = data.map((c, index) => {
  const name = c.name || c.cari || c.cari_adi || c.unvan || c.title || c.ad || 'İSİMSİZ CARİ';
  const code = c.code || c.kod || c.cari_kod || c.cariKodu || '';
  const monthlyFee = c.monthlyFee || c.monthly_fee || c.aylik_ucret || c.aylikUcret || c.muhasebe_ucreti || c.ucret || 0;
  const status = c.status || c.durum || 'Aktif';
  return { index: index + 1, name: String(name).trim(), code: String(code).trim(), monthlyFee, status: String(status).trim() };
}).sort((a, b) => a.name.localeCompare(b.name, 'tr'));

console.log('ALKAM_CARI_LIST_START');
console.log(JSON.stringify({ count: rows.length, rows }, null, 2));
console.log('ALKAM_CARI_LIST_END');
