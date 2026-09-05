const https = require('node:https');
const fs = require('node:fs');
const path = require('node:path');

const envPath = path.join(__dirname, '../.secrets/.env');
if (!fs.existsSync(envPath)) {
  console.error("Fichier .env introuvable :", envPath);
  process.exit(1);
}

const env = fs.readFileSync(envPath, 'utf8');
let token = '';
let chatId = '';
env.split('\n').forEach(l => {
  if (l.startsWith('TELEGRAM_BOT_TOKEN_PRO=')) token = l.split('=')[1].trim().replace(/['"]/g, '');
  if (l.startsWith('TELEGRAM_ALLOWED_USER_ID=')) chatId = l.split('=')[1].trim().replace(/['"]/g, '');
});

console.log("Token PRO:", token ? token.slice(0, 10) + '...' : 'MANQUANT');
console.log("Chat ID:", chatId || 'MANQUANT');

if (!token || !chatId) {
  console.error("Identifiants Telegram incomplets.");
  process.exit(1);
}

const payload = JSON.stringify({
  chat_id: chatId,
  text: "🎯 [CONTRÔLE DE ROUTINE EL PROFESSIONAL]\n\nLes bots sont bien actifs 24/7 sur la VM Oracle Always Free.\n• Bot PRO (El Professional) : En ligne\n• Bot PERSO (Coach Somatique) : En ligne\n• Bot RESEARCH (Veille DeepMind/AI) : En ligne\n\nCe test direct valide la liaison réseau Telegram."
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

req.on('error', err => console.error("Erreur réseau:", err.message));
req.write(payload);
req.end();
