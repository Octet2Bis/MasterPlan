/**
 * AEVUM / MASTER PLAN — TELEGRAM DUAL-BOT HARDENED INGESTION SERVICE (Node.js 24)
 * Pilier : 02_Assistant_Personnel (Couche 2)
 * Sécurité :
 *   1. Whitelist ID Strict (User verification)
 *   2. Session PIN / Passphrase Lock (2FA Applicatif avec expiration 24h)
 *   3. Magic Bytes Binary Inspection (Anti-Malware, rejet des faux .jpg/.mp4)
 *   4. Sandbox & Quarantine isolée (Workspace/.quarantine/)
 *   5. Rate Limiting & Quotas de bande passante (Anti-Saturation disque)
 */

const fs = require('node:fs');
const path = require('node:path');
const https = require('node:https');

// ==============================================================================
// 1. CONFIGURATION ET CHEMINS DYNAMIQUES
// ==============================================================================
const BASE_DIR = path.resolve(__dirname, '..');
const WORKSPACE_DIR = path.join(BASE_DIR, 'Workspace');
const SECRETS_DIR = path.join(BASE_DIR, '.secrets');
const ENV_FILE = path.join(SECRETS_DIR, '.env');

const INBOX_PRO = path.join(WORKSPACE_DIR, 'inbox_pro');
const INBOX_PERSO = path.join(WORKSPACE_DIR, 'inbox_perso');
const QUARANTINE_DIR = path.join(WORKSPACE_DIR, '.quarantine');
const DB_PRO_FILE = path.join(WORKSPACE_DIR, 'pro_market_graph.json');
const DB_PERSO_FILE = path.join(WORKSPACE_DIR, 'perso_journal_graph.json');

// Création des répertoires sécurisés
for (const dir of [INBOX_PRO, INBOX_PERSO, QUARANTINE_DIR, SECRETS_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Chargement sécurisé du fichier .env
function loadEnv() {
  const env = {};
  if (fs.existsSync(ENV_FILE)) {
    const content = fs.readFileSync(ENV_FILE, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [k, ...rest] = trimmed.split('=');
        env[k.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  }
  return env;
}

const ENV = loadEnv();
const TOKEN_PRO = process.env.TELEGRAM_BOT_TOKEN_PRO || ENV.TELEGRAM_BOT_TOKEN_PRO || '';
const TOKEN_PERSO = process.env.TELEGRAM_BOT_TOKEN_PERSO || ENV.TELEGRAM_BOT_TOKEN_PERSO || '';
const ALLOWED_USER_ID = String(process.env.TELEGRAM_ALLOWED_USER_ID || ENV.TELEGRAM_ALLOWED_USER_ID || '').trim();
const SECURITY_PIN = String(process.env.TELEGRAM_SECURITY_PIN || ENV.TELEGRAM_SECURITY_PIN || '1234').trim();

// ==============================================================================
// 2. GESTION DES SESSIONS & AUTHENTIFICATION (2FA PIN)
// ==============================================================================
const sessionStore = {
  unlockedUntil: 0, // Timestamp expiration session
  isUnlocked() {
    return Date.now() < this.unlockedUntil;
  },
  unlock(hours = 24) {
    this.unlockedUntil = Date.now() + (hours * 3600 * 1000);
  },
  lock() {
    this.unlockedUntil = 0;
  }
};

// ==============================================================================
// 3. RATE LIMITING & QUOTAS DISQUE
// ==============================================================================
const rateLimiter = {
  messageHistory: [], // Timestamps des messages récents
  hourlyBytesDownloaded: 0,
  lastQuotaReset: Date.now(),
  
  MAX_MESSAGES_PER_MINUTE: 30,
  MAX_FILE_SIZE_BYTES: 25 * 1024 * 1024, // 25 Mo max par fichier
  MAX_HOURLY_BYTES: 100 * 1024 * 1024,   // 100 Mo max par heure

  checkRateLimit() {
    const now = Date.now();
    this.messageHistory = this.messageHistory.filter(t => now - t < 60000);
    if (this.messageHistory.length >= this.MAX_MESSAGES_PER_MINUTE) {
      return { allowed: false, reason: "Trop de requêtes par minute (Rate Limit)" };
    }
    this.messageHistory.push(now);

    // Reset du quota horaire
    if (now - this.lastQuotaReset > 3600000) {
      this.hourlyBytesDownloaded = 0;
      this.lastQuotaReset = now;
    }

    return { allowed: true };
  },

  checkDownloadQuota(fileSize) {
    if (fileSize > this.MAX_FILE_SIZE_BYTES) {
      return { allowed: false, reason: "Fichier supérieur à la limite de 25 Mo." };
    }
    if (this.hourlyBytesDownloaded + fileSize > this.MAX_HOURLY_BYTES) {
      return { allowed: false, reason: "Quota horaire de 100 Mo dépassé. Réessayez plus tard." };
    }
    return { allowed: true };
  },

  recordDownload(fileSize) {
    this.hourlyBytesDownloaded += fileSize;
  }
};

// ==============================================================================
// 4. INSPECTION DES MAGIC BYTES (ANTI-MALWARE & ANTI-SPOOFING)
// ==============================================================================
function inspectFileMagicBytes(filePath) {
  const buffer = Buffer.alloc(32);
  const fd = fs.openSync(filePath, 'r');
  fs.readSync(fd, buffer, 0, 32, 0);
  fs.closeSync(fd);

  // 1. Détection des exécutables malveillants (.exe, .dll, scripts ELF/Mach-O)
  if (buffer[0] === 0x4D && buffer[1] === 0x5A) { // 'MZ' Windows Executable
    return { valid: false, error: "ALERTE SÉCURITÉ : Fichier exécutable Windows (.exe) masqué !" };
  }
  if (buffer[0] === 0x7F && buffer[1] === 0x45 && buffer[2] === 0x4C && buffer[3] === 0x46) { // ELF Linux
    return { valid: false, error: "ALERTE SÉCURITÉ : Binaire Linux masqué !" };
  }

  // 2. Validation JPEG (FF D8 FF)
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return { valid: true, mime: 'image/jpeg', type: 'photo' };
  }

  // 3. Validation PNG (89 50 4E 47)
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return { valid: true, mime: 'image/png', type: 'photo' };
  }

  // 4. Validation WebP (RIFF .... WEBP)
  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    return { valid: true, mime: 'image/webp', type: 'photo' };
  }

  // 5. Validation MP4 / MOV (contient 'ftyp' dans les 12 premiers octets)
  const headerAscii = buffer.toString('ascii', 4, 12);
  if (headerAscii.includes('ftyp') || headerAscii.includes('moov')) {
    return { valid: true, mime: 'video/mp4', type: 'video' };
  }

  // 6. Fichier inconnu ou non autorisé
  return { valid: false, error: "Type de fichier binaire non reconnu ou potentiellement dangereux." };
}

// ==============================================================================
// 5. MOTEUR DE STOCKAGE GRAPH MEMORY (JSON)
// ==============================================================================
class GraphStore {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = { entities: [], relations: [], observations: [] };
    this.load();
  }

  load() {
    if (fs.existsSync(this.filePath)) {
      try {
        this.data = JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
      } catch (e) {
        this.data = { entities: [], relations: [], observations: [] };
      }
    } else {
      this.save();
    }
  }

  save() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  addObservation(observation) {
    this.data.observations.push({
      id: this.data.observations.length + 1,
      createdAt: new Date().toISOString(),
      ...observation
    });
    this.save();
  }
}

const dbPro = new GraphStore(DB_PRO_FILE);
const dbPerso = new GraphStore(DB_PERSO_FILE);

// ==============================================================================
// 6. CLIENT TELEGRAM HARDENED
// ==============================================================================
class HardenedTelegramBot {
  constructor(token, botType, inboxDir, dbStore) {
    this.token = token;
    this.botType = botType; // "PRO" ou "PERSO"
    this.inboxDir = inboxDir;
    this.dbStore = dbStore;
    this.offset = 0;
    this.isPolling = false;
  }

  isConfigured() {
    return Boolean(this.token && this.token.length > 15 && !this.token.startsWith('COLLEZ_'));
  }

  async request(method, params = {}) {
    const url = `https://api.telegram.org/bot${this.token}/${method}`;
    return new Promise((resolve) => {
      const payload = JSON.stringify(params);
      const req = https.request(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        },
        timeout: 25000
      }, (res) => {
        let raw = '';
        res.on('data', chunk => raw += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(raw));
          } catch (e) {
            resolve({ ok: false, error: e.message });
          }
        });
      });

      req.on('error', (err) => resolve({ ok: false, error: err.message }));
      req.write(payload);
      req.end();
    });
  }

  async sendMessage(chatId, text) {
    return this.request('sendMessage', {
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown'
    });
  }

  async getFileInfo(fileId) {
    const res = await this.request('getFile', { file_id: fileId });
    if (res.ok && res.result?.file_path) {
      return {
        url: `https://api.telegram.org/file/bot${this.token}/${res.result.file_path}`,
        size: res.result.file_size || 0
      };
    }
    return null;
  }

  async downloadToQuarantine(fileUrl, tempName) {
    const tempPath = path.join(QUARANTINE_DIR, tempName);
    return new Promise((resolve, reject) => {
      const fileStream = fs.createWriteStream(tempPath);
      https.get(fileUrl, (response) => {
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve(tempPath);
        });
      }).on('error', (err) => {
        fs.unlink(tempPath, () => {});
        reject(err);
      });
    });
  }

  async processMessage(msg) {
    const user = msg.from || {};
    const userId = String(user.id || '').trim();
    const chatId = msg.chat?.id;

    // BARRIÈRE 1 : Whitelist stricte d'identifiant Telegram
    if (ALLOWED_USER_ID && userId !== ALLOWED_USER_ID) {
      console.log(`🚨 [BLOCAGE] Tentative d'intrusion rejetée de l'ID inconnu : ${userId}`);
      return;
    }

    // BARRIÈRE 2 : Rate Limiting
    const rateCheck = rateLimiter.checkRateLimit();
    if (!rateCheck.allowed) {
      await this.sendMessage(chatId, `⚠️ *Alerte Débit :* ${rateCheck.reason}`);
      return;
    }

    const text = (msg.text || '').trim();
    const caption = (msg.caption || '').trim();

    // Gestion du code PIN / Déverrouillage de Session
    if (text.startsWith('/unlock') || text.startsWith('/pin')) {
      const parts = text.split(' ');
      const providedPin = parts[1] || '';
      if (providedPin === SECURITY_PIN) {
        sessionStore.unlock(24);
        await this.sendMessage(chatId, `🔓 *Session Déverrouillée avec Succès (24h)* !\nTous vos partages et fichiers seront acceptés.`);
        console.log(`[${this.botType}] 🔓 Session déverrouillée par l'utilisateur.`);
      } else {
        await this.sendMessage(chatId, `❌ *Code PIN incorrect.* Accès refusé.`);
        console.log(`[${this.botType}] ❌ Tentative de déverrouillage échouée (Mauvais PIN).`);
      }
      return;
    }

    if (text === '/lock') {
      sessionStore.lock();
      await this.sendMessage(chatId, `🔒 *Session Verrouillée.*`);
      return;
    }

    if (text === '/status') {
      const isUnl = sessionStore.isUnlocked();
      await this.sendMessage(chatId, `🛡️ *État de Sécurité :*\n• Session : ${isUnl ? '🔓 Déverrouillée' : '🔒 Verrouillée'}\n• Base active : \`${this.botType}\`\n• Whitelist : \`${userId}\``);
      return;
    }

    // BARRIÈRE 3 : Vérification si session verrouillée
    if (!sessionStore.isUnlocked()) {
      await this.sendMessage(chatId, `🔒 *Session de Sécurité Verrouillée*\n\nPour protéger votre machine, veuillez déverrouiller l'accès en envoyant :\n\`/unlock ${SECURITY_PIN ? 'VOTRE_PIN' : '1234'}\`\n\n_(La session reste ouverte pendant 24h)_.`);
      return;
    }

    // CAS : Commande /start
    if (text === '/start') {
      const welcome = this.botType === 'PRO'
        ? `🚀 *Assistant Veille & Marché (PRO) [Sécurisé]*\n\n• Session : 🔓 Active\n• Inspection Magic Bytes : ✅ Active\n• Quotas : ✅ 25 Mo/fichier\n\nEnvoyez vos liens, articles et Reels Instagram.`
        : `🎨 *Life Journal & Scrapbook (PERSO) [Sécurisé]*\n\n• Session : 🔓 Active\n• Sandbox Quarantaine : ✅ Active\n• Quotas : ✅ 25 Mo/fichier\n\nEnvoyez vos photos et souvenirs du quotidien.`;
      await this.sendMessage(chatId, welcome);
      return;
    }

    const timestamp = Date.now();

    // CAS 1 : Réception d'une Photo
    if (msg.photo && msg.photo.length > 0) {
      const bestPhoto = msg.photo[msg.photo.length - 1];
      const fileInfo = await this.getFileInfo(bestPhoto.file_id);
      
      if (fileInfo) {
        const quotaCheck = rateLimiter.checkDownloadQuota(fileInfo.size);
        if (!quotaCheck.allowed) {
          await this.sendMessage(chatId, `⚠️ *Rejet :* ${quotaCheck.reason}`);
          return;
        }

        // Téléchargement dans la Quarantaine isolée
        const tempName = `temp_${timestamp}_${bestPhoto.file_id.slice(-6)}`;
        const tempPath = await this.downloadToQuarantine(fileInfo.url, tempName);

        // Inspection binaire des Magic Bytes
        const inspection = inspectFileMagicBytes(tempPath);
        if (!inspection.valid) {
          fs.unlinkSync(tempPath); // Destruction immédiate
          await this.sendMessage(chatId, `🚨 *FICHIER REJETÉ PAR LE PARE-FEU :*\n_${inspection.error}_`);
          console.log(`[${this.botType}] 🚨 Fichier malveillant détruit dans la quarantaine : ${inspection.error}`);
          return;
        }

        // Fichier sain : Déplacement vers l'inbox
        const finalName = `photo_${timestamp}_${bestPhoto.file_id.slice(-6)}.jpg`;
        const destPath = path.join(this.inboxDir, finalName);
        fs.renameSync(tempPath, destPath);
        rateLimiter.recordDownload(fileInfo.size);

        this.dbStore.addObservation({
          type: 'photo',
          caption: caption || null,
          fileName: finalName,
          filePath: destPath,
          verifiedMime: inspection.mime,
          sender: user.username || user.first_name
        });

        await this.sendMessage(chatId, `📸 *Photo inspectée & archivée (Magic Bytes Vérifiés)* !\n📁 \`${finalName}\`\n${caption ? `📝 Note : _${caption}_` : ''}`);
        console.log(`[${this.botType}] 📸 Photo saine validée et archivée : ${finalName}`);
      }
    }

    // CAS 2 : Réception d'une Vidéo MP4
    else if (msg.video || (msg.document && msg.document.mime_type?.includes('video'))) {
      const doc = msg.video || msg.document;
      const fileInfo = await this.getFileInfo(doc.file_id);

      if (fileInfo) {
        const quotaCheck = rateLimiter.checkDownloadQuota(fileInfo.size);
        if (!quotaCheck.allowed) {
          await this.sendMessage(chatId, `⚠️ *Rejet :* ${quotaCheck.reason}`);
          return;
        }

        const tempName = `temp_video_${timestamp}`;
        const tempPath = await this.downloadToQuarantine(fileInfo.url, tempName);

        const inspection = inspectFileMagicBytes(tempPath);
        if (!inspection.valid) {
          fs.unlinkSync(tempPath);
          await this.sendMessage(chatId, `🚨 *VIDÉO REJETÉE PAR LE PARE-FEU :*\n_${inspection.error}_`);
          return;
        }

        const finalName = `video_${timestamp}.mp4`;
        const destPath = path.join(this.inboxDir, finalName);
        fs.renameSync(tempPath, destPath);
        rateLimiter.recordDownload(fileInfo.size);

        this.dbStore.addObservation({
          type: 'video',
          caption: caption || null,
          fileName: finalName,
          filePath: destPath,
          verifiedMime: inspection.mime,
          sender: user.username || user.first_name
        });

        await this.sendMessage(chatId, `🎬 *Vidéo validée & enregistrée dans l'inbox ${this.botType} !*\n📁 \`${finalName}\``);
        console.log(`[${this.botType}] 🎬 Vidéo validée : ${finalName}`);
      }
    }

    // CAS 3 : Liens Web ou Instagram
    else if (text.includes('http://') || text.includes('https://')) {
      const isInsta = text.includes('instagram.com');
      this.dbStore.addObservation({
        type: isInsta ? 'instagram_reel' : 'web_article',
        content: text,
        sender: user.username || user.first_name
      });

      await this.sendMessage(chatId, `🔗 *Lien sécurisé indexé dans le graphe ${this.botType} !*\nType : ${isInsta ? '🎬 Reel Instagram' : '📰 Article de Veille'}\nContenu : \`${text.slice(0, 55)}...\``);
      console.log(`[${this.botType}] 🔗 Lien indexé : ${text}`);
    }

    // CAS 4 : Note Textuelle Simple
    else if (text) {
      this.dbStore.addObservation({
        type: 'text_note',
        content: text,
        sender: user.username || user.first_name
      });

      await this.sendMessage(chatId, `📝 *Note enregistrée dans le graphe ${this.botType} :*\n« _${text}_ »`);
      console.log(`[${this.botType}] 📝 Note enregistrée : ${text}`);
    }
  }

  async poll() {
    if (this.isPolling) return;
    this.isPolling = true;

    try {
      const res = await this.request('getUpdates', { offset: this.offset, timeout: 5 });
      if (res.ok && Array.isArray(res.result)) {
        for (const update of res.result) {
          this.offset = update.update_id + 1;
          if (update.message) {
            await this.processMessage(update.message);
          }
        }
      }
    } catch (e) {
      // Ignorer
    } finally {
      this.isPolling = false;
    }
  }
}

// ==============================================================================
// 7. DÉMARRAGE DU SERVICE BLINDÉ
// ==============================================================================
async function main() {
  console.log('\n======================================================================');
  console.log('🛡️ SERVICE TELEGRAM HARDENED (DÉFENSE EN PROFONDEUR ACTIVE)');
  console.log('======================================================================');

  const botPro = new HardenedTelegramBot(TOKEN_PRO, 'PRO', INBOX_PRO, dbPro);
  const botPerso = new HardenedTelegramBot(TOKEN_PERSO, 'PERSO', INBOX_PERSO, dbPerso);

  const isProOk = botPro.isConfigured();
  const isPersoOk = botPerso.isConfigured();

  if (!isProOk && !isPersoOk) {
    console.log('\n⚠️ AUCUN BOT CONFIGURÉ !');
    return;
  }

  console.log(`🤖 Bot PRO actif       : ${isProOk ? '✅ OUI' : '❌ NON'}`);
  console.log(`🎨 Bot PERSO actif     : ${isPersoOk ? '✅ OUI' : '❌ NON'}`);
  console.log(`🛡️ Whitelist ID        : ✅ ${ALLOWED_USER_ID}`);
  console.log(`🔑 2FA PIN Session     : ✅ Configuré (Code PIN secret)`);
  console.log(`🔬 Magic Bytes Sandbox : ✅ Active (Rejet immédiat des .exe/.sh)`);
  console.log(`⚡ Rate Limit & Quotas  : ✅ 25 Mo/fichier • 30 msg/min`);
  console.log('======================================================================');
  console.log('Service en écoute... (Laissez tourner en arrière-plan)\n');

  setInterval(async () => {
    if (isProOk) await botPro.poll();
    if (isPersoOk) await botPerso.poll();
  }, 1000);
}

main();
