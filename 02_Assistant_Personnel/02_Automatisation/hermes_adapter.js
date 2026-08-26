/**
 * AEVUM / MASTER PLAN — HERMES AGENT ADAPTER (Node.js)
 * Pilier 02 : Assistant Personnel (Second Cerveau & Multicanal)
 * Plafond strict : < 180 lignes
 */

const fs = require('node:fs');
const path = require('node:path');

const BASE_DIR = path.resolve(__dirname, '..');
const WORKSPACE_DIR = path.join(BASE_DIR, 'Workspace');
const SECRETS_DIR = path.join(BASE_DIR, '.secrets');
const ENV_FILE = path.join(SECRETS_DIR, '.env');

const DB_PRO = path.join(WORKSPACE_DIR, 'pro_market_graph.json');
const DB_PERSO = path.join(WORKSPACE_DIR, 'perso_journal_graph.json');

function ensureDirectories() {
  for (const d of [WORKSPACE_DIR, SECRETS_DIR]) {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  }
}

function appendToGraph(filePath, entry) {
  ensureDirectories();
  let data = { entities: [], relations: [], observations: [] };
  if (fs.existsSync(filePath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      if (Array.isArray(parsed)) data.observations = parsed;
      else if (parsed && typeof parsed === 'object') data = { entities: [], relations: [], observations: [], ...parsed };
    } catch {
      data = { entities: [], relations: [], observations: [] };
    }
  }
  const newObs = {
    id: (data.observations.length || 0) + 1,
    createdAt: new Date().toISOString(),
    ...entry
  };
  data.observations.push(newObs);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

class HermesIngestionAdapter {
  constructor() {
    ensureDirectories();
  }

  async processTextMessage(text, channel = 'pro') {
    console.log(`[HERMES] Traitement message texte (${channel.toUpperCase()}) : "${text.slice(0, 40)}..."`);
    const isPro = channel === 'pro';
    const targetDb = isPro ? DB_PRO : DB_PERSO;

    const entry = {
      type: 'TEXT_NOTE',
      channel,
      rawContent: text,
      tags: this.extractTags(text),
      status: 'INDEXED'
    };

    appendToGraph(targetDb, entry);
    return { success: true, entryId: entry.id, targetDb };
  }

  async processMediaAttachment(filename, channel = 'pro') {
    console.log(`[HERMES] Ingestion média (${channel.toUpperCase()}) : ${filename}`);
    const isAudio = /\.(ogg|mp3|wav|m4a)$/i.test(filename);
    const isImage = /\.(jpg|jpeg|png|webp)$/i.test(filename);

    const entry = {
      type: isAudio ? 'VOICE_TRANSCRIPTION' : isImage ? 'VISUAL_DOCUMENT' : 'BINARY_ATTACHMENT',
      channel,
      filename,
      extractedSummary: isAudio ? "Synthèse audio automatique" : "Analyse visuelle de schéma/document",
      status: 'INDEXED'
    };

    appendToGraph(channel === 'pro' ? DB_PRO : DB_PERSO, entry);
    return { success: true, entryId: entry.id };
  }

  extractTags(text) {
    const tags = [];
    if (/urgent|asap|important/i.test(text)) tags.push('priority_high');
    if (/lead|client|prospect|vente/i.test(text)) tags.push('gtm_sales');
    if (/aevum|ios|swift|bug|code/i.test(text)) tags.push('app_dev');
    if (/santé|sommeil|sport|posture/i.test(text)) tags.push('longevity');
    return tags.length ? tags : ['inbox_general'];
  }
}

module.exports = { HermesIngestionAdapter };

// CLI test mode
if (require.main === module) {
  const adapter = new HermesIngestionAdapter();
  adapter.processTextMessage("Schéma d'architecture Aevum reçu pour audit K3", 'pro')
    .then(res => console.log('✅ Test Hermes complété avec succès :', res));
}
