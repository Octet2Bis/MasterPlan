/**
 * MASTER PLAN — CONNECTEUR D'INGESTION MEETILY (Node.js)
 * Pilier 02 : Assistant Personnel
 * Rôle : Parsing local des réunions, extraction d'actions/décisions & synchronisation Second Cerveau.
 * Plafond strict : < 210 lignes
 */

const fs = require('node:fs');
const path = require('node:path');

class MeetingIngestor {
  constructor(baseDir) {
    this.baseDir = baseDir || path.resolve(__dirname, '../..');
    this.configPath = path.join(this.baseDir, 'Ressources', 'Knowledge', 'meetily_config.json');
    this.entityRulesPath = path.join(this.baseDir, 'Ressources', 'Knowledge', 'hermes_entity_rules.json');
    this.config = this.loadConfig();
    this.knownEntities = this.loadEntityRules();
    this.inboxDir = path.resolve(this.baseDir, '..', this.config.inbox_directory);
    this.archiveDir = path.resolve(this.baseDir, '..', this.config.archive_directory);
    this.ensureDirs();
  }

  loadEntityRules() {
    try {
      if (fs.existsSync(this.entityRulesPath)) {
        const data = JSON.parse(fs.readFileSync(this.entityRulesPath, 'utf-8'));
        return data.known_entities || [];
      }
    } catch {
      // Ignorer
    }
    return [];
  }

  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) return JSON.parse(fs.readFileSync(this.configPath, 'utf-8'));
    } catch {
      // Ignorer
    }
    return {
      inbox_directory: '02_Assistant_Personnel/Inbox/Meetings',
      archive_directory: '02_Assistant_Personnel/Workspace/Meetings',
      action_markers: ['todo', 'action', 'à faire', 'engagement', 'deadline'],
      decision_markers: ['décision', 'acté', 'convenu', 'validé']
    };
  }

  ensureDirs() {
    [this.inboxDir, this.archiveDir].forEach(d => {
      if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
    });
  }

  parseContent(rawText, fileName = '') {
    const lines = rawText.split(/\r?\n/);
    let title = path.basename(fileName, path.extname(fileName)).replace(/[_-]/g, ' ');
    const decisions = [];
    const actions = [];
    const participants = new Set();
    const entities = new Set();

    const titleMatch = rawText.match(/^#\s+(.+)$/m) || rawText.match(/Titre\s*:\s*(.+)$/im);
    if (titleMatch) title = titleMatch[1].trim();

    const partMatch = rawText.match(/Participants?\s*:\s*(.+)$/im);
    if (partMatch) {
      partMatch[1].split(/[,;]/).forEach(p => participants.add(p.trim()));
    }

    const actionRx = new RegExp(`(${this.config.action_markers.join('|')})`, 'i');
    const decisionRx = new RegExp(`(${this.config.decision_markers.join('|')})`, 'i');

    for (const line of lines) {
      const clean = line.trim().replace(/^[-*•\d.]\s*/, '');
      if (!clean) continue;

      if (actionRx.test(line) && clean.length > 10) {
        actions.push(clean);
      } else if (decisionRx.test(line) && clean.length > 10) {
        decisions.push(clean);
      }

      for (const ent of this.knownEntities) {
        if (ent.keywords && ent.keywords.some(k => new RegExp(`\\b${k}\\b`, 'i').test(line))) {
          entities.add(ent.id.replace('ent_', '').toUpperCase());
        }
      }
    }

    return {
      title,
      fileName,
      timestamp: new Date().toISOString(),
      participants: Array.from(participants),
      decisions: decisions.slice(0, 5),
      actions: actions.slice(0, 5),
      entities: Array.from(entities),
      rawLength: rawText.length
    };
  }

  async ingestFile(filePath, dbStore) {
    if (!fs.existsSync(filePath)) throw new Error(`Fichier introuvable: ${filePath}`);
    const rawText = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath);
    const parsed = this.parseContent(rawText, fileName);

    // 1. Sauvegarde / Archive
    const destPath = path.join(this.archiveDir, fileName);
    if (filePath !== destPath) {
      fs.copyFileSync(filePath, destPath);
    }

    // 2. Insertion dans le graphe Second Cerveau
    if (dbStore) {
      await dbStore.addObservation({
        type: 'meeting_minutes',
        title: parsed.title,
        source: 'meetily_local',
        fileName,
        decisionsCount: parsed.decisions.length,
        actionsCount: parsed.actions.length,
        entities: parsed.entities,
        participants: parsed.participants,
        summary: `Réunion "${parsed.title}" : ${parsed.decisions.length} décision(s), ${parsed.actions.length} action(s).`
      });
    }

    return parsed;
  }

  formatTelegramAlert(parsed) {
    const actList = parsed.actions.length
      ? parsed.actions.map(a => `• 📌 ${a}`).join('\n')
      : '• Aucune action bloquante détectée';

    const decList = parsed.decisions.length
      ? parsed.decisions.map(d => `• ⚖️ ${d}`).join('\n')
      : '• Discussions préliminaires';

    const entList = parsed.entities.length ? `• *Entités citées :* \`${parsed.entities.join(', ')}\`\n` : '';

    return `🎙️ *NOUVELLE RÉUNION INDEXÉE (MEETILY)*\n\n` +
      `📁 *Titre :* *${parsed.title}*\n` +
      `👥 *Participants :* ${parsed.participants.join(', ') || 'Non précisés'}\n` +
      entList +
      `\n⚡ *Décisions Clés :*\n${decList}\n\n` +
      `🎯 *Engagements & Actions à Faire :*\n${actList}\n\n` +
      `💾 _Transcription & CR complets archivés dans ton Second Cerveau._`;
  }

  async scanAndIngest(dbStore, botInstance, targetChatId) {
    if (!fs.existsSync(this.inboxDir)) return [];
    const files = fs.readdirSync(this.inboxDir).filter(f => /\.(md|json|txt)$/i.test(f));
    const processed = [];

    for (const file of files) {
      const fullPath = path.join(this.inboxDir, file);
      try {
        const parsed = await this.ingestFile(fullPath, dbStore);
        processed.push(parsed);
        if (botInstance && targetChatId) {
          await botInstance.sendMessage(targetChatId, this.formatTelegramAlert(parsed));
        }
        // Déplacer de inbox vers archive pour éviter le ré-ingest
        const archiveTarget = path.join(this.archiveDir, file);
        if (fullPath !== archiveTarget) fs.unlinkSync(fullPath);
      } catch (err) {
        console.error(`[MEETILY_INGESTOR] Erreur sur ${file}: ${err.message}`);
      }
    }
    return processed;
  }
}

module.exports = { MeetingIngestor };
