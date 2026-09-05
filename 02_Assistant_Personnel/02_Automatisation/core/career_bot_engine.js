/**
 * career_bot_engine.js — Moteur Carrière, Hermes & Validation Human-in-the-Loop.
 * Pilier : 02_Assistant_Personnel
 * Rôle : Gestion des offres qualifiées, validation avant génération de CV,
 *        remarques/ajustements en direct depuis Telegram et candidature 1-clic.
 * Plafond strict : < 240 lignes (AGENTS.md).
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { execSync } = require('child_process');

class CareerBotEngine {
  constructor(baseDir) {
    this.baseDir = baseDir;
    this.careerDir = path.join(baseDir, 'Workspace', 'career');
    this.appsDir = path.join(this.careerDir, 'applications');
    this.pendingFile = path.join(this.careerDir, 'pending_gold_jobs.json');
    if (!fs.existsSync(this.appsDir)) fs.mkdirSync(this.appsDir, { recursive: true });
  }

  resolveSlug(input) {
    const raw = String(input || '').trim().toLowerCase();
    if (fs.existsSync(this.pendingFile)) {
      try {
        const pending = JSON.parse(fs.readFileSync(this.pendingFile, 'utf8'));
        const match = pending.find(j => String(j.index) === raw || j.slug === raw || j.company.toLowerCase().includes(raw));
        if (match) return match.slug;
      } catch {}
    }
    return raw || 'gitbook';
  }

  getScoredJobsSummary() {
    let pending = [];
    if (fs.existsSync(this.pendingFile)) {
      try { pending = JSON.parse(fs.readFileSync(this.pendingFile, 'utf8')); } catch {}
    }

    let msg = `🎯 *RADAR OPPORTUNITÉS GROWTH (< 48H / LIVE)*\n\n`;
    if (!pending.length) {
      msg += `ℹ️ *Aucune nouvelle offre en attente de validation.*\n` +
             `Le radar 24/7 tourne en tâche de fond pour détecter les opportunités fraîches.\n\n`;
    } else {
      pending.slice(0, 6).forEach((j, idx) => {
        const status = j.status === 'TAILORED' ? '✅ CV PRÊT' : '⏳ À VALIDER';
        const startupTag = j.is_startup ? ' 🚀 Startup' : '';
        const hq = j.company_hq ? `📍 _${j.company_hq}_ | ` : '';
        msg += `[${j.index || idx + 1}] *${j.company}* — ${j.title}${startupTag}\n` +
               `    📊 Match : *${j.match_score || 90}%* | Statut : \`${status}\` | 📅 _${j.date_published || 'Aujourd’hui'}_\n` +
               `    ${hq}🌍 *100% Full Remote* | 💶 ${j.salary_range || 'Marché'}\n` +
               `    🔗 ${j.link}\n`;
        if (j.status === 'TAILORED') {
          msg += `    👉 Actions : \`/cv ${j.slug}\` · \`/remarque ${j.slug} <texte>\` · \`/postuler ${j.slug}\`\n\n`;
        } else {
          msg += `    👉 *Pour valider & générer le CV :* \`/valider ${j.slug || j.index}\`\n\n`;
        }
      });
    }

    msg += `🏢 *Entreprises 100% remote vérifié :* Tapez \`/spontane\`\n` +
           `🔄 *Forcer un scan live :* Tapez \`/refresh\` ou \`/scan\`\n` +
           `💬 *Conseil IA :* \`/hermes analyse le marché\``;
    return msg;
  }

  async scanAndGetFreshSummary() {
    try {
      const { autoScanAndNotify } = require(path.join(this.baseDir, '04_Productivite_Admin', 'career_ops', 'live_job_scraper'));
      const envPath = path.join(this.baseDir, '.secrets', '.env');
      await autoScanAndNotify(this.careerDir, envPath);
    } catch {}
    return this.getScoredJobsSummary();
  }

  validateAndTailorJob(input) {
    const slug = this.resolveSlug(input);
    try {
      const scriptPath = path.join(this.baseDir, '04_Productivite_Admin', 'career_ops', 'cv_tailor_engine.py');
      const cmd = `uv run --no-project python "${scriptPath}" "${slug}"`;
      const out = execSync(cmd, { encoding: 'utf8', timeout: 25000 });
      const jsonMatch = out.match(/\{[\s\S]*\}/);
      const res = jsonMatch ? JSON.parse(jsonMatch[0]) : { company: slug, company_slug: slug };

      return `✅ *OFFRE VALIDÉE — CV & PITCH GÉNÉRÉS*\n\n` +
             `🏢 *Entreprise :* ${res.company || slug}\n` +
             `👤 *Décideur cible :* \`${res.target_role || 'Head of Growth'}\`\n\n` +
             `✉️ *Message d'accroche généré :*\n\`\`\`\n${(res.pitch_text || '').substring(0, 500)}...\n\`\`\`\n\n` +
             `🌐 *Prévisualisation Live Locale :*\n` +
             `http://localhost:8765/applications/${res.company_slug || slug}/CV_Antoine_Lecerf_${res.company_slug || slug}.md\n\n` +
             `✍️ *Pour ajuster ou faire une remarque :*\n\`/remarque ${res.company_slug || slug} Insiste plus sur le tracking GTM...\`\n\n` +
             `🚀 *Pour valider et postuler :*\n\`/postuler ${res.company_slug || slug}\``;
    } catch (err) {
      return `❌ *Erreur lors de la génération du CV :* ${err.message}`;
    }
  }

  recordRemarkAndAdjust(input, remark) {
    const slug = this.resolveSlug(input);
    const appDir = path.join(this.appsDir, slug);
    if (!fs.existsSync(appDir)) return `❌ *Dossier introuvable pour :* \`${input}\`. Validez d'abord l'offre avec \`/valider ${slug}\`.`;

    const remarkFile = path.join(appDir, 'remarques_utilisateur.txt');
    const entry = `[${new Date().toISOString()}] ${remark}\n`;
    fs.appendFileSync(remarkFile, entry, 'utf8');

    return `📝 *REMARQUE ENREGISTRÉE POUR ${slug.toUpperCase()}*\n\n` +
           `Feedback pris en compte : _« ${remark} »_\n\n` +
           `Le dossier de candidature est tagué avec cette consigne pour le ciblage final.\n` +
           `👉 Consulter le CV : \`/cv ${slug}\`\n` +
           `🚀 Confirmer et postuler : \`/postuler ${slug}\``;
  }

  getVerifiedRemoteCompanies(pageArg) {
    const filePath = path.join(this.careerDir, 'verified_remote_companies.json');
    if (!fs.existsSync(filePath)) return '❌ Base d\'entreprises introuvable.';
    const companies = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const total = companies.length;
    const cleanArg = (pageArg || '').toLowerCase().replace('page', '').replace('p', '').trim();
    let page = parseInt(cleanArg, 10) || 1;
    const pageSize = 8;
    const maxPage = Math.ceil(total / pageSize);
    page = Math.max(1, Math.min(page, maxPage));
    const start = (page - 1) * pageSize;
    const slice = companies.slice(start, start + pageSize);

    let msg = `🏢 *ENTREPRISES 100% REMOTE VÉRIFIÉ (${total} scale-ups)*\n` +
              `_Page ${page}/${maxPage} — Suivante : \`/spontane p${page < maxPage ? page + 1 : 1}\`_\n\n`;

    slice.forEach((c, idx) => {
      msg += `[${start + idx + 1}] *${c.name}*\n` +
             `    💼 _${c.domain.substring(0, 42)}_\n` +
             `    👤 Décideur : \`${(c.decision_maker_role || '').split('/')[0].trim()}\`\n` +
             `    👉 Angle : \`/spontane ${start + idx + 1}\`\n\n`;
    });
    return msg;
  }

  getSpontaneousApplicationAngle(input) {
    const filePath = path.join(this.careerDir, 'verified_remote_companies.json');
    if (!fs.existsSync(filePath)) return '❌ Base introuvable.';
    const companies = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const idx = parseInt(input, 10);
    const c = (!isNaN(idx) && idx >= 1 && idx <= companies.length)
      ? companies[idx - 1]
      : companies.find(item => item.id.includes(input.toLowerCase()) || item.name.toLowerCase().includes(input.toLowerCase()));

    if (!c) return `❌ Entreprise non trouvée pour : \`${input}\`.`;
    return `🚀 *CANDIDATURE SPONTANÉE : ${c.name.toUpperCase()}*\n\n` +
           `💼 *Domaine :* ${c.domain}\n🛡️ *Remote :* ${c.remote_status}\n` +
           `👤 *Décideur :* \`${c.decision_maker_role}\`\n\n` +
           `⚔️ *ANGLE D'ATTAQUE (Ton Profil) :*\n${c.attack_angle}\n\n` +
           `🔗 ${c.careers_url}\n` +
           `💬 Pitch : \`/hermes prépare un message pour ${c.name}\``;
  }

  getTailoredCvAndPitch(input) {
    const slug = this.resolveSlug(input);
    const appDir = path.join(this.appsDir, slug);
    if (!fs.existsSync(appDir)) {
      return `❌ *Dossier non encore généré pour :* \`${input}\`.\nTapez \`/valider ${slug}\` pour générer le CV sur mesure.`;
    }
    const files = fs.readdirSync(appDir);
    const cvFile = files.find(f => f.startsWith('CV_'));
    const pitchFile = files.find(f => f.startsWith('Message_Accroche_'));
    const cvText = cvFile ? fs.readFileSync(path.join(appDir, cvFile), 'utf8') : 'CV non généré.';
    const pitchText = pitchFile ? fs.readFileSync(path.join(appDir, pitchFile), 'utf8') : 'Pitch non généré.';

    return `📑 *DOSSIER CANDIDATURE : ${slug.toUpperCase()}*\n\n` +
           `🌐 *Aperçu Live :* http://localhost:8765/applications/${slug}/${cvFile || ''}\n\n` +
           `✉️ *MESSAGE DÉCIDEUR :*\n\`\`\`\n${pitchText.substring(0, 800)}\n\`\`\`\n\n` +
           `📄 *EXTRAIT DU CV :*\n\`\`\`markdown\n${cvText.substring(0, 1000)}\n\`\`\`\n\n` +
           `✍️ Modifier : \`/remarque ${slug} <texte>\` | 🚀 Postuler : \`/postuler ${slug}\``;
  }

  applyToOneClick(input, live = false) {
    const slug = this.resolveSlug(input);
    try {
      const scriptPath = path.join(this.baseDir, '04_Productivite_Admin', 'career_ops', 'ats_application_submitter.py');
      const cmd = `uv run --no-project python "${scriptPath}" "${slug}" ${live ? '--live' : ''}`;
      const out = execSync(cmd, { encoding: 'utf8', timeout: 15000 });
      const jsonStart = out.indexOf('{');
      const res = jsonStart !== -1 ? JSON.parse(out.slice(jsonStart)) : { company: slug, mode: 'done' };
      return `🚀 *Candidature 1-Clic Traitée !*\n\n🏢 *Entreprise :* ${res.company}\n📑 *Mode :* ${res.mode}\n🧾 *Reçu :* \`${res.receipt_id || 'OK'}\`\n\n${res.mode === 'dry_run' ? '_(Simulation réussie. Pour envoyer en réel : `/postuler_live ' + slug + '`)_' : '✅ _Candidature envoyée avec succès !_ '}`;
    } catch (err) {
      return `❌ *Erreur lors de la candidature :* ${err.message}`;
    }
  }

  async chatWithHermes(userMessage) {
    const prompt = `Tu es Hermes, l'agent IA personnel d'Antoine Lecerf (Qwen 2.5 local).
Spécialisé en stratégie de carrière Growth, GTM, Product Ops (1-5 ans, Full Remote) et Master Plan.
Réponds de manière concise (2-3 paragraphes), percutante, pragmatique et naturelle.
Antoine te demande : "${userMessage}"`;

    return new Promise((resolve) => {
      const postData = JSON.stringify({ model: 'qwen2.5:3b', prompt, stream: false, keep_alive: '24h' });
      const req = http.request({
        hostname: '127.0.0.1', port: 11434, path: '/api/generate', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            resolve(`⚡ *Hermes (IA Locale) :*\n\n${parsed.response?.trim() || 'Pas de réponse formulée.'}`);
          } catch (e) { resolve(`❌ *Erreur Hermes :* ${e.message}`); }
        });
      });
      req.on('error', (e) => resolve(`❌ *Hermes indisponible (Ollama hors-ligne)*`));
      req.setTimeout(30000, () => { req.destroy(); resolve('⏳ *Hermes :* Timeout du modèle local.'); });
      req.write(postData);
      req.end();
    });
  }

  getLastScanReport() {
    const rFile = path.join(this.careerDir, 'last_scan_report.json');
    if (fs.existsSync(rFile)) {
      try { return JSON.parse(fs.readFileSync(rFile, 'utf8')).markdown; } catch {}
    }
    return '🛰️ *Aucun rapport de scan disponible.* Tapez `/scan` pour forcer un cycle.';
  }

  getPinnedCheatSheet() {
    return `📌 *TOUR DE CONTRÔLE — RECHERCHE DE TAFF (JOB HUNTER)*\n\n` +
           `💼 *Commandes Carrière :*\n` +
           `• \`/jobs\` — Liste des offres Growth (avec statut validation)\n` +
           `• \`/radar\` — Rapport synthétique du dernier scan 15 min\n` +
           `• \`/valider <id>\` — Valider une offre & générer le CV + pitch\n` +
           `• \`/remarque <id> <texte>\` — Faire une remarque sur le CV/pitch\n` +
           `• \`/cv <id>\` — Voir le CV & pitch de l'offre validée\n` +
           `• \`/postuler <id>\` — Lancer la candidature 1-clic\n` +
           `• \`/spontane\` — Liste des 40+ scale-ups 100% remote\n\n` +
           `🧠 *Agent Hermes :*\n` +
           `• \`/hermes <question>\` — Conseil de négociation, analyse d'offre\n\n` +
           `🌐 *Dashboard Entreprises :* http://localhost:8765/companies_dashboard.html\n` +
           `🔒 *Sécurité :* \`/status\` · \`/unlock <PIN>\` · \`/pin\``;
  }
}

module.exports = { CareerBotEngine };
