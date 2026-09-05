const https = require('node:https');
const fs = require('node:fs');
const path = require('node:path');

const { formatScanSummaryMarkdown } = require('../04_Productivite_Admin/career_ops/live_job_scraper');

const envPath = path.join(__dirname, '../.secrets/.env');
const env = fs.readFileSync(envPath, 'utf8');
let token = '';
let chatId = '';
env.split('\n').forEach(l => {
  if (l.startsWith('TELEGRAM_BOT_TOKEN_PRO=')) token = l.split('=')[1].trim().replace(/['"]/g, '');
  if (l.startsWith('TELEGRAM_ALLOWED_USER_ID=')) chatId = l.split('=')[1].trim().replace(/['"]/g, '');
});

const stats = {
  sourcesCount: 8,
  rawCount: 42,
  qualifiedCount: 1,
  newPushed: 0,
  cursorBatch: 3,
  totalBatches: 13,
  totalCompanies: 45,
  newCompaniesCount: 1,
  newCompanies: [{ name: 'TestCo', domain: 'test_co_app', id: 'test_co' }]
};

const text = formatScanSummaryMarkdown(stats);
console.log("TEXT TO SEND:\n", text);

const payload = JSON.stringify({
  chat_id: chatId,
  text,
  parse_mode: 'Markdown',
  disable_web_page_preview: true
});

const req = https.request({
  hostname: 'api.telegram.org',
  path: `/bot${token}/sendMessage`,
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
}, res => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    console.log("HTTP Status:", res.statusCode);
    console.log("Response:", body);
  });
});

req.on('error', err => console.error("Error:", err));
req.write(payload);
req.end();
