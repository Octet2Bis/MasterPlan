/**
 * TESTS — OUTILS PARTAGÉS : dossier de données temporaire, faux serveur SMTP, mini-runner
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / Tests
 * À requérir AVANT tout module engine/ : fixe SNIPER_DATA_DIR sur un dossier jetable.
 */
const fs = require('node:fs');
const os = require('node:os');
const net = require('node:net');
const path = require('node:path');

if (!process.env.SNIPER_DATA_DIR) process.env.SNIPER_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'sniper-test-'));

/** Faux MX : `rcptCode(address)` renvoie le code SMTP à répondre pour chaque RCPT TO. */
function startFakeSmtp(rcptCode) {
  const server = net.createServer((sock) => {
    sock.write('220 fake.mx ESMTP\r\n');
    let buf = '';
    sock.on('data', (chunk) => {
      buf += chunk;
      const lines = buf.split('\r\n');
      buf = lines.pop();
      for (const line of lines) {
        if (/^EHLO/i.test(line)) sock.write('250-fake.mx\r\n250 OK\r\n');
        else if (/^MAIL FROM/i.test(line)) sock.write('250 OK\r\n');
        else if (/^RCPT TO/i.test(line)) { const code = rcptCode(line.match(/<([^>]+)>/)[1]); sock.write(`${code} ${code === 250 ? 'OK' : 'No such user'}\r\n`); }
        else if (/^QUIT/i.test(line)) sock.end('221 Bye\r\n');
      }
    });
    sock.on('error', () => {});
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port })));
}

async function run(name, tests) {
  let failed = 0;
  console.log(`🧪 ${name}`);
  for (const [label, fn] of tests) {
    try { await fn(); console.log(`  ✅ ${label}`); } catch (e) { failed++; console.error(`  ❌ ${label}\n     ${e.stack.split('\n').slice(0, 3).join('\n     ')}`); }
  }
  return failed;
}

module.exports = { startFakeSmtp, run, DATA_DIR: process.env.SNIPER_DATA_DIR };
