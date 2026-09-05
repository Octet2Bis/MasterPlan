/**
 * MASTER PLAN — COACH PERSONNEL 3x3 ENGINE (Node.js)
 * Pilier 02 : Assistant Personnel
 * Rôle : Gestionnaire de rituels (Rédaction Matin, Respiration Midi, Décharge Soir & Bilan Hebdo).
 * Plafond strict : < 210 lignes
 */

const fs = require('node:fs');
const path = require('node:path');

class CoachEngine {
  constructor(baseDir) {
    this.baseDir = baseDir || path.resolve(__dirname, '../..');
    this.catalogPath = path.join(this.baseDir, 'Ressources', 'Knowledge', 'coach_prompts_catalog.json');
    this.configPath = path.join(this.baseDir, 'Ressources', 'Knowledge', 'meryl_3x3_config.json');
    this.journalPath = path.join(this.baseDir, 'Workspace', 'coach_journal.json');
    
    this.catalog = this.loadJson(this.catalogPath, { morning_prompts: [], midday_protocols: [], evening_prompts: [] });
    this.config = this.loadJson(this.configPath, { quarterly_horizon: {} });
    this.journal = this.loadJson(this.journalPath, { entries: [], somatic_completions: [] });
  }

  loadJson(filePath, fallback) {
    try {
      if (fs.existsSync(filePath)) return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
      // Ignorer et retourner le fallback
    }
    return fallback;
  }

  saveJournal() {
    try {
      const dir = path.dirname(this.journalPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const temp = `${this.journalPath}.tmp_${Date.now()}`;
      fs.writeFileSync(temp, JSON.stringify(this.journal, null, 2), 'utf-8');
      fs.renameSync(temp, this.journalPath);
    } catch (err) {
      console.error(`[COACH_ENGINE] Erreur sauvegarde journal: ${err.message}`);
    }
  }

  getDayIndex() {
    const start = new Date(new Date().getFullYear(), 0, 0);
    const diff = new Date() - start;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  formatMorning(idx = this.getDayIndex()) {
    const list = this.catalog.morning_prompts || [];
    if (!list.length) return '☕ *Coach Matin* : Prêt pour la journée ?';
    const item = list[idx % list.length];
    return `☕ *COACH MATIN — Clarté & Focus (3 min)*\n` +
      `📌 *Thème :* ${item.theme}\n` +
      `💡 _« ${item.mindset} »_\n\n` +
      `✍️ *Exercice de rédaction :*\n` +
      item.questions.map((q, i) => `${i + 1}. *${q}*`).join('\n') +
      `\n\n_(Réponds directement ici en 2 ou 3 phrases pour ancrer ta journée)_.`;
  }

  formatMidday(idx = this.getDayIndex()) {
    const list = this.catalog.midday_protocols || [];
    if (!list.length) return '🫁 *Coach Midi* : Prends 3 respirations profondes.';
    const item = list[idx % list.length];
    return `🫁 *COACH SOMATIQUE — Pause & Nerf Vague (${item.durationSeconds}s)*\n` +
      `🎯 *Protocole :* ${item.name}\n` +
      `🔬 *Cible :* ${item.target}\n\n` +
      `📋 *Instructions :*\n` +
      item.instructions.join('\n') +
      `\n\n⏱️ _Effectue l'exercice maintenant, puis envoie \`/fait\` pour valider ton reset._`;
  }

  formatEvening(idx = this.getDayIndex()) {
    const list = this.catalog.evening_prompts || [];
    if (!list.length) return '🌙 *Coach Soir* : Ferme les écrans et repose-toi.';
    const item = list[idx % list.length];
    return `🌙 *COACH SOIR — Fermeture des Boucles (2 min)*\n` +
      `📌 *Focus :* ${item.theme}\n\n` +
      item.questions.map((q, i) => `${i + 1}. *${q}*`).join('\n') +
      `\n\n🛌 _Dépose ta pensée ici pour libérer ta mémoire vive cette nuit._`;
  }

  recordResponse(phase, text, sender = 'Antoine') {
    const entry = {
      id: (this.journal.entries.length || 0) + 1,
      timestamp: new Date().toISOString(),
      phase, // "matin", "soir", "libre"
      sender,
      content: text,
      keywords: this.extractKeywords(text)
    };
    this.journal.entries.push(entry);
    this.saveJournal();
    return entry;
  }

  recordSomatic(protocolName, sender = 'Antoine') {
    const completion = {
      id: (this.journal.somatic_completions.length || 0) + 1,
      timestamp: new Date().toISOString(),
      protocol: protocolName || 'Soupir Physiologique',
      sender
    };
    this.journal.somatic_completions.push(completion);
    this.saveJournal();
    return completion;
  }

  extractKeywords(text) {
    const stopWords = new Set(['dans', 'pour', 'avec', 'sans', 'cette', 'faire', 'jour', 'bien', 'tout', 'plus', 'mais']);
    const words = String(text || '').toLowerCase().replace(/[^a-zàâçéèêëîïôûùüÿñæœ0-9]/g, ' ').split(/\s+/);
    return words.filter(w => w.length > 3 && !stopWords.has(w)).slice(0, 5);
  }

  formatWeeklySummary() {
    const now = Date.now();
    const sevenDaysAgo = now - (7 * 24 * 3600 * 1000);
    const weekEntries = (this.journal.entries || []).filter(e => new Date(e.timestamp).getTime() > sevenDaysAgo);
    const weekSomatic = (this.journal.somatic_completions || []).filter(c => new Date(c.timestamp).getTime() > sevenDaysAgo);

    // Analyse des mots récurrents
    const wordFreq = {};
    weekEntries.forEach(e => {
      (e.keywords || []).forEach(k => { wordFreq[k] = (wordFreq[k] || 0) + 1; });
    });
    const topKeywords = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]).slice(0, 3).map(k => k[0]);

    return `🪞 *BILAN HEBDOMADAIRE DU COACH (Méthode 3x3)*\n\n` +
      `📊 *Statistiques 7 Jours :*\n` +
      `• Écrits déposés : *${weekEntries.length} réflexions*\n` +
      `• Resets somatiques : *${weekSomatic.length} complétés*\n` +
      `• Mots-clés dominants : *${topKeywords.join(', ') || 'focus, calme, clarté'}*\n\n` +
      `🧭 *Tes 3 Ajustements Comportementaux Dérivés :*\n` +
      `1. *Ajustement 1 :* Réduire les interruptions matinales pour verrouiller l'action clé avant 11h.\n` +
      `2. *Ajustement 2 :* Conserver la respiration de 14h pour désamorcer le coup de fatigue.\n` +
      `3. *Ajustement 3 :* Déposer au moins 1 phrase de décharge le soir pour protéger le sommeil.\n\n` +
      `🎯 *Cap Trimestriel :* _${this.config.quarterly_horizon?.theme || 'Souveraineté attentionnelle'}_.\n` +
      `_Prêt pour attaquer la nouvelle semaine ?_`;
  }

  handleCommand(cmd, sender = 'Antoine') {
    const clean = cmd.trim().toLowerCase();
    if (clean === '/matin') return this.formatMorning();
    if (clean === '/midi' || clean === '/respi') return this.formatMidday();
    if (clean === '/soir') return this.formatEvening();
    if (clean === '/fait' || clean === '/done') {
      this.recordSomatic('Protocole Midday', sender);
      return '✅ *Reset somatique validé et enregistré !* Ton système nerveux te remercie.';
    }
    if (clean === '/bilan') return this.formatWeeklySummary();
    if (clean.startsWith('/coach')) {
      return `🏋️ *MENU COACH PERSONNEL 3x3*\n\n` +
        `• \`/matin\` : Exercice de rédaction & focus (3 min)\n` +
        `• \`/respi\` : Protocole somatique & nerf vague (90s)\n` +
        `• \`/soir\` : Sas de décompression & fermeture de boucles\n` +
        `• \`/fait\` : Valider la respiration effectuée\n` +
        `• \`/bilan\` : Bilan hebdomadaire dérivé (Dimanche)\n\n` +
        `🎯 *Cap actif :* _${this.config.quarterly_horizon?.theme || 'Métacognition & Habitudes'}_`;
    }
    return null;
  }

  checkScheduledTriggers(bot, targetChatId) {
    if (!bot || !targetChatId || !this.config.cadence) return;
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${hh}:${mm}`;
    const isSunday = now.getDay() === 0;

    if (!this.journal.scheduler_state) this.journal.scheduler_state = {};
    const state = this.journal.scheduler_state;

    if (currentTime === this.config.cadence.morning_time && state.lastMorning !== today) {
      bot.sendMessage(targetChatId, this.formatMorning());
      state.lastMorning = today;
      this.saveJournal();
      console.log(`[COACH_SCHEDULER] 🌅 Notification matinale proactive envoyée à ${targetChatId}`);
    } else if (currentTime === this.config.cadence.midday_time && state.lastMidday !== today) {
      bot.sendMessage(targetChatId, this.formatMidday());
      state.lastMidday = today;
      this.saveJournal();
      console.log(`[COACH_SCHEDULER] 🫁 Notification somatique proactive envoyée à ${targetChatId}`);
    } else if (currentTime === this.config.cadence.evening_time && state.lastEvening !== today) {
      bot.sendMessage(targetChatId, this.formatEvening());
      state.lastEvening = today;
      this.saveJournal();
      console.log(`[COACH_SCHEDULER] 🌙 Notification du soir proactive envoyée à ${targetChatId}`);
    } else if (isSunday && currentTime === this.config.cadence.weekly_review_time && state.lastWeekly !== today) {
      bot.sendMessage(targetChatId, this.formatWeeklySummary());
      state.lastWeekly = today;
      this.saveJournal();
      console.log(`[COACH_SCHEDULER] 📊 Bilan hebdomadaire proactif envoyé à ${targetChatId}`);
    }
  }
}

module.exports = { CoachEngine };
