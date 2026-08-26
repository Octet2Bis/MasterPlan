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
const RULES_FILE = path.join(BASE_DIR, 'Ressources', 'Knowledge', 'hermes_entity_rules.json');

const DB_PRO = path.join(WORKSPACE_DIR, 'pro_market_graph.json');
const DB_PERSO = path.join(WORKSPACE_DIR, 'perso_journal_graph.json');

function ensureDirectories() {
  for (const d of [WORKSPACE_DIR, SECRETS_DIR]) {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  }
}

function loadEntityRules() {
  try {
    if (fs.existsSync(RULES_FILE)) {
      return JSON.parse(fs.readFileSync(RULES_FILE, 'utf-8')).known_entities || [];
    }
  } catch (err) {
    console.warn(`[HERMES] Avertissement chargement règles entités: ${err.message}`);
  }
  return [];
}

function extractEntitiesAndRelations(obs, knownEntities) {
  const text = `${obs.rawContent || obs.content || ''} ${(obs.tags || []).join(' ')}`.toLowerCase();
  const detectedEntities = [];
  const generatedRelations = [];

  for (const ent of knownEntities) {
    const isMatched = ent.keywords.some(kw => text.includes(kw.toLowerCase()));
    if (isMatched) {
      detectedEntities.push({ id: ent.id, label: ent.label, type: ent.type, pillar: ent.pillar });
      generatedRelations.push({ from: obs.id, to: ent.id, relation: 'mentions', timestamp: obs.createdAt });
    }
  }

  if (obs.sender && obs.sender.toLowerCase().includes('antoine')) {
    generatedRelations.push({ from: obs.id, to: 'ent_antoine', relation: 'authored_by', timestamp: obs.createdAt });
  }

  return { detectedEntities, generatedRelations };
}

function appendToGraph(filePath, entry) {
  ensureDirectories();
  const knownEntities = loadEntityRules();
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

  // Extraction d'entités et relations
  const { detectedEntities, generatedRelations } = extractEntitiesAndRelations(newObs, knownEntities);
  detectedEntities.forEach(ent => {
    if (!data.entities.some(e => e.id === ent.id)) data.entities.push(ent);
  });
  data.relations.push(...generatedRelations);

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  return newObs;
}

class HermesIngestionAdapter {
  constructor() {
    ensureDirectories();
  }

  async processTextMessage(text, channel = 'pro', sender = 'Antoine') {
    const isPro = channel === 'pro';
    const targetDb = isPro ? DB_PRO : DB_PERSO;

    const entry = {
      type: 'TEXT_NOTE',
      channel,
      sender,
      rawContent: text,
      tags: this.extractTags(text),
      status: 'INDEXED'
    };

    const created = appendToGraph(targetDb, entry);
    return { success: true, entryId: created.id, targetDb };
  }

  reindexGraph(channel = 'pro') {
    const targetDb = channel === 'pro' ? DB_PRO : DB_PERSO;
    if (!fs.existsSync(targetDb)) return { success: false, reason: 'DB missing' };
    const knownEntities = loadEntityRules();
    const data = JSON.parse(fs.readFileSync(targetDb, 'utf-8'));

    data.entities = [];
    data.relations = [];

    data.observations.forEach(obs => {
      const { detectedEntities, generatedRelations } = extractEntitiesAndRelations(obs, knownEntities);
      detectedEntities.forEach(ent => {
        if (!data.entities.some(e => e.id === ent.id)) data.entities.push(ent);
      });
      data.relations.push(...generatedRelations);
    });

    fs.writeFileSync(targetDb, JSON.stringify(data, null, 2));
    return { success: true, entityCount: data.entities.length, relationCount: data.relations.length };
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

// CLI test & reindex mode
if (require.main === module) {
  const adapter = new HermesIngestionAdapter();
  console.log('[HERMES] Rétro-indexation du graphe pro...');
  const reindexRes = adapter.reindexGraph('pro');
  console.log('✅ Rétro-indexation complétée :', reindexRes);
  adapter.processTextMessage("Intégration Aevum et Screen Time API pour la régulation vagale", 'pro', 'Antoine')
    .then(res => console.log('✅ Nouveau message indexé avec succès :', res));
}
