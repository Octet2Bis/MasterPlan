/**
 * MASTER PLAN — HARDENED TELEGRAM CLIENT (Node.js)
 * Pilier 02 : Assistant Personnel
 * Rôle : Communication Telegram avec Retry, Quarantaine, Staging Queue et Fail-Closed.
 * Supporte les bots : PRO (Carrière), PERSO (Coach/Journal), RESEARCH (Veille/Extraction).
 * Plafond strict : < 240 lignes (AGENTS.md).
 */

const fs = require('node:fs');
const path = require('node:path');
const https = require('node:https');
const { validateUser, inspectFileMagicBytes, sanitizeFilename } = require('./security_guard');
const { enrichLinkMetadata } = require('./link_enricher');

class HardenedTelegramBot {
  constructor(cfg) {
    this.token = cfg.token;
    this.botType = cfg.botType; // "PRO", "PERSO", "RESEARCH"
    this.inboxDir = cfg.inboxDir;
    this.quarantineDir = cfg.quarantineDir;
    this.dbStore = cfg.dbStore;
    this.sessionStore = cfg.sessionStore;
    this.rateLimiter = cfg.rateLimiter;
    this.allowedUserId = cfg.allowedUserId;
    this.securityPin = cfg.securityPin || '1234';
    this.coachEngine = cfg.coachEngine || null;
    this.careerEngine = cfg.careerEngine || null;
    this.researchEngine = cfg.researchEngine || null;
    this.onNewObservation = cfg.onNewObservation || null;
    this.offset = 0;
    this.isPolling = false;
    this.stagingQueue = [];
  }

  isConfigured() {
    return Boolean(this.token && this.token.length > 15 && !this.token.startsWith('COLLEZ_'));
  }

  async request(method, params = {}) {
    const payload = JSON.stringify(params);
    return new Promise((resolve) => {
      const req = https.request(`https://api.telegram.org/bot${this.token}/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
        timeout: 20000
      }, (res) => {
        let raw = '';
        res.on('data', c => raw += c);
        res.on('end', () => { try { resolve(JSON.parse(raw)); } catch (e) { resolve({ ok: false, error: e.message }); } });
      });
      req.on('timeout', () => { req.destroy(); resolve({ ok: false, error: 'Timeout' }); });
      req.on('error', err => resolve({ ok: false, error: err.message }));
      req.write(payload);
      req.end();
    });
  }

  sendMessage(chatId, text) { return this.request('sendMessage', { chat_id: chatId, text, parse_mode: 'Markdown' }); }
  pinMessage(chatId, messageId) { return this.request('pinChatMessage', { chat_id: chatId, message_id: messageId, disable_notification: true }); }
  setCommands(commands) { return this.request('setMyCommands', { commands }); }
  async getFileInfo(fileId) {
    const res = await this.request('getFile', { file_id: fileId });
    return (res.ok && res.result?.file_path) ? {
      url: `https://api.telegram.org/file/bot${this.token}/${res.result.file_path}`,
      size: res.result.file_size || 0
    } : null;
  }

  async downloadToQuarantine(fileUrl, tempName) {
    const tempPath = path.join(this.quarantineDir, sanitizeFilename(tempName, '.tmp'));
    return new Promise((resolve, reject) => {
      const stream = fs.createWriteStream(tempPath);
      https.get(fileUrl, (res) => {
        res.pipe(stream);
        stream.on('finish', () => { stream.close(); resolve(tempPath); });
      }).on('error', (err) => { fs.unlink(tempPath, () => {}); reject(err); });
    });
  }

  async handleMedia(docOrPhoto, isVideo, user, caption, chatId) {
    const info = await this.getFileInfo(docOrPhoto.file_id);
    if (!info || !this.rateLimiter.checkFileQuota(info.size).allowed) return;
    const ts = Date.now();
    const tempPath = await this.downloadToQuarantine(info.url, `temp_${ts}_${isVideo ? 'v' : 'p'}`);
    const inspect = inspectFileMagicBytes(tempPath);
    if (!inspect.valid) {
      fs.unlinkSync(tempPath);
      return this.sendMessage(chatId, `🚨 *REJET :* _${inspect.error}_`);
    }
    const ext = isVideo ? '.mp4' : '.jpg';
    const finalName = sanitizeFilename(`${isVideo ? 'video' : 'photo'}_${ts}${ext}`);
    fs.renameSync(tempPath, path.join(this.inboxDir, finalName));
    this.rateLimiter.recordDownload(info.size);

    if (this.researchEngine) {
      const debrief = await this.researchEngine.processIncomingContent(isVideo ? 'video' : 'photo', finalName, user, caption);
      return this.sendMessage(chatId, debrief);
    }

    await this.dbStore.addObservation({
      type: isVideo ? 'video' : 'photo', caption: caption || null,
      fileName: finalName, verifiedMime: inspect.mime, source: 'untrusted_external', sender: user.first_name || 'Antoine'
    });
    await this.sendMessage(chatId, `✅ *${isVideo ? 'Vidéo' : 'Photo'} archivée* : \`${finalName}\``);
    if (this.onNewObservation) this.onNewObservation(this.botType);
  }

  async handleCommands(text, chatId, user) {
    if (text.startsWith('/unlock')) {
      if ((text.split(' ')[1] || '') === this.securityPin) {
        this.sessionStore.unlock(24);
        await this.sendMessage(chatId, `🔓 *Session Déverrouillée (24h)*\n${this.sessionStore.getRemainingTime()}`);
        await this.flushStagingQueue();
      } else { await this.sendMessage(chatId, '❌ *PIN incorrect.*'); }
      return true;
    }
    if (text === '/lock') { this.sessionStore.lock(); await this.sendMessage(chatId, '🔒 *Session Verrouillée.*'); return true; }
    if (text === '/status') {
      const isUnl = this.sessionStore.isUnlocked();
      await this.sendMessage(chatId, `🛡️ *État [${this.botType}] :*\n• 2FA: ${isUnl ? '🔓' : '🔒'} ${this.sessionStore.getRemainingTime()}\n• Base: \`${this.dbStore ? this.dbStore.getObservationCount() : 'Actif'}\``);
      return true;
    }
    if (text === '/pin' || text === '/help') {
      const pinText = this.researchEngine ? this.researchEngine.getHelpMessage() : (this.careerEngine ? this.careerEngine.getPinnedCheatSheet() : 'Aide non disponible.');
      const sent = await this.sendMessage(chatId, pinText);
      if (sent?.ok && sent?.result?.message_id) await this.pinMessage(chatId, sent.result.message_id);
      return true;
    }
    if (this.researchEngine) {
      if (text === '/reports') { await this.sendMessage(chatId, this.researchEngine.getRecentReports()); return true; }
      if (text.startsWith('/search')) { await this.sendMessage(chatId, this.researchEngine.searchResources(text.replace('/search', '').trim())); return true; }
      if (text.startsWith('/dev')) {
        await this.sendMessage(chatId, '🔥 *Recherche dans Firecrawl Developer Index (70M+ docs)...*');
        await this.sendMessage(chatId, await this.researchEngine.searchDev(text.replace('/dev', '').trim()));
        return true;
      }
    }
    if (this.careerEngine) {
      if (text === '/jobs' || text === '/career') { await this.sendMessage(chatId, this.careerEngine.getScoredJobsSummary()); return true; }
      if (text === '/radar') { await this.sendMessage(chatId, this.careerEngine.getLastScanReport()); return true; }
      if (text === '/refresh' || text === '/scan') {
        await this.sendMessage(chatId, '🛰️ *Scan live en cours des plateformes (1-3 ans FR/EN)...*');
        await this.sendMessage(chatId, await this.careerEngine.scanAndGetFreshSummary());
        return true;
      }
      if (text === '/scanremote') {
        await this.sendMessage(chatId, '🏢 *Scan direct des pages carrières 100% remote en cours...*');
        const res = await require('../../04_Productivite_Admin/career_ops/daily_remote_company_scanner').runDailyRemoteScanner({ sendReport: false });
        await this.sendMessage(chatId, res.reportMd);
        return true;
      }
      if (text.startsWith('/valider')) { await this.sendMessage(chatId, this.careerEngine.validateAndTailorJob(text.replace('/valider', '').trim())); return true; }
      if (text.startsWith('/remarque') || text.startsWith('/ajuster')) {
        const p = text.replace(/^\/(remarque|ajuster)/, '').trim().split(' ');
        await this.sendMessage(chatId, this.careerEngine.recordRemarkAndAdjust(p[0] || '', p.slice(1).join(' ') || 'Ajustement'));
        return true;
      }
      if (text.startsWith('/cv') || text.startsWith('/pitch')) { await this.sendMessage(chatId, this.careerEngine.getTailoredCvAndPitch(text.replace(/^\/(cv|pitch)/, '').trim())); return true; }
      if (text.startsWith('/postuler')) {
        await this.sendMessage(chatId, this.careerEngine.applyToOneClick(text.replace('/postuler_live', '').replace('/postuler', '').trim(), text.includes('_live')));
        return true;
      }
      if (text.startsWith('/spontane')) {
        const arg = text.replace('/spontane', '').trim();
        await this.sendMessage(chatId, (arg.startsWith('p') || !arg) ? this.careerEngine.getVerifiedRemoteCompanies(arg) : this.careerEngine.getSpontaneousApplicationAngle(arg));
        return true;
      }
      if (text.startsWith('/hermes')) {
        await this.sendMessage(chatId, '⚡ *Hermes réfléchit (IA Locale Qwen 2.5)...*');
        await this.sendMessage(chatId, await this.careerEngine.chatWithHermes(text.replace('/hermes', '').trim()));
        return true;
      }
    }
    if (this.coachEngine) {
      const coachReply = this.coachEngine.handleCommand(text, user.first_name || 'Antoine');
      if (coachReply) { await this.sendMessage(chatId, coachReply); return true; }
    }
    return false;
  }

  async processMessage(msg) {
    const user = msg.from || {};
    const userId = String(user.id || '').trim();
    const chatId = msg.chat?.id;
    if (!validateUser(userId, this.allowedUserId).allowed) return console.log(`🚨 [FAIL-CLOSED] Refus ID ${userId}`);
    if (!this.rateLimiter.checkMessageRate().allowed) return this.sendMessage(chatId, '⚠️ *Débit dépassé.*');

    const text = (msg.text || '').trim();
    const caption = (msg.caption || '').trim();

    if (text.startsWith('/')) {
      const handled = await this.handleCommands(text, chatId, user);
      if (handled) return;
    }

    if (!this.sessionStore.isUnlocked()) {
      this.stagingQueue.push(msg);
      return this.sendMessage(chatId, `🔒 *Session Verrouillée* (${this.stagingQueue.length} en attente). Envoyez \`/unlock PIN\`.`);
    }

    if (msg.photo?.length > 0) return this.handleMedia(msg.photo[msg.photo.length - 1], false, user, caption, chatId);
    if (msg.video || (msg.document?.mime_type?.includes('video'))) return this.handleMedia(msg.video || msg.document, true, user, caption, chatId);

    // Bot RESEARCH : Extraction systématique et compte-rendu d'applicabilité
    if (this.researchEngine && text) {
      await this.sendMessage(chatId, '🔬 *Extraction des informations & analyse en cours...*');
      const debrief = await this.researchEngine.processIncomingContent(text.includes('http') ? 'link' : 'note', text, user, caption);
      return this.sendMessage(chatId, debrief);
    }

    // Bots PRO & PERSO : Ingestion classique dans le graphe
    if (text.includes('http')) {
      const meta = await enrichLinkMetadata(text);
      await this.dbStore.addObservation({
        type: text.includes('instagram.com') ? 'instagram_reel' : 'web_article',
        content: text, title: meta.title || null, summary: meta.summary || null, source: 'untrusted_external', sender: user.first_name || 'Antoine'
      });
      await this.sendMessage(chatId, `🔗 *Lien indexé [${this.botType}]* !\n${meta.title ? `📌 *${meta.title}*\n` : ''}`);
    } else if (text) {
      await this.dbStore.addObservation({ type: 'text_note', content: text, source: 'user_note', sender: user.first_name || 'Antoine' });
      await this.sendMessage(chatId, `📝 *Note indexée [${this.botType}]*`);
    }
    if (this.onNewObservation) this.onNewObservation(this.botType);
  }

  async flushStagingQueue() {
    if (!this.stagingQueue.length) return;
    const queued = [...this.stagingQueue];
    this.stagingQueue = [];
    for (const m of queued) await this.processMessage(m);
  }

  async poll() {
    if (this.isPolling) return;
    this.isPolling = true;
    try {
      const res = await this.request('getUpdates', { offset: this.offset, timeout: 5 });
      if (res.ok && Array.isArray(res.result)) {
        for (const u of res.result) {
          this.offset = u.update_id + 1;
          if (u.message) await this.processMessage(u.message);
        }
      }
    } catch {} finally { this.isPolling = false; }
  }
}

module.exports = { HardenedTelegramBot };
