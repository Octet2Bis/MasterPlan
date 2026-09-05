/** research_bot_engine.js — Moteur de Veille & Analyse (Pilier 02). < 250 lignes. */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { enrichLinkMetadata } = require('./link_enricher');
const { searchDeveloperIndex, formatDevSearchResults } = require('./firecrawl_dev_search');

class ResearchBotEngine {
  constructor(baseDir) {
    this.baseDir = baseDir;
    this.workspaceDir = path.join(baseDir, 'Workspace');
    this.reportsDir = path.join(this.workspaceDir, 'research_reports');
    this.graphFile = path.join(this.workspaceDir, 'research_graph.json');
    if (!fs.existsSync(this.reportsDir)) fs.mkdirSync(this.reportsDir, { recursive: true });
    this.initGraph();
  }

  initGraph() {
    if (!fs.existsSync(this.graphFile)) {
      const initial = { resources: [], generatedAt: new Date().toISOString() };
      fs.writeFileSync(this.graphFile, JSON.stringify(initial, null, 2), 'utf8');
    }
  }

  loadGraph() {
    try {
      return JSON.parse(fs.readFileSync(this.graphFile, 'utf8'));
    } catch {
      return { resources: [] };
    }
  }

  saveGraph(data) {
    const tmp = `${this.graphFile}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmp, this.graphFile);
  }

  detectCategory(text) {
    const t = (text || '').toLowerCase();
    if (t.includes('github') || t.includes('repo') || t.includes('code') || t.includes('npm')) return 'Code & Repositories';
    if (t.includes('animation') || t.includes('ui') || t.includes('frontend') || t.includes('css') || t.includes('framer') || t.includes('motion')) return 'UI & Animations';
    if (t.includes('agent') || t.includes('llm') || t.includes('ia') || t.includes('ai') || t.includes('prompt')) return 'IA & Systèmes Multi-Agents';
    if (t.includes('growth') || t.includes('cro') || t.includes('outbound') || t.includes('scraping') || t.includes('ads')) return 'Growth & Acquisition';
    return 'Inspiration & Outils';
  }

  async queryLocalLLM(prompt) {
    return new Promise((resolve) => {
      const postData = JSON.stringify({
        model: 'qwen2.5:3b',
        prompt: prompt,
        stream: false,
        keep_alive: '24h'
      });
      const req = http.request({
        hostname: '127.0.0.1',
        port: 11434,
        path: '/api/generate',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            resolve(parsed.response?.trim() || '');
          } catch {
            resolve('');
          }
        });
      });
      req.on('error', () => resolve(''));
      req.setTimeout(45000, () => { req.destroy(); resolve(''); });
      req.write(postData);
      req.end();
    });
  }

  async generateDebrief(item) {
    const prompt = `Tu es l'analyste stratégique du Master Plan d'Antoine Lecerf (projets : Aevum iOS/Web, Portfolio antoinelecerf.fit, GTM Growth, Agents IA).
Analyse cette ressource et génère un compte-rendu clair, percutant et structuré en 3 parties :

Ressource :
- Titre : ${item.title || 'Non spécifié'}
- Contenu/URL : ${item.content}
- Résumé/Contexte : ${item.summary || 'N/A'}
- Catégorie : ${item.category}

Format attendu :
1. 🔍 DE QUOI S'AGIT-IL : (2-3 phrases claires expliquant le concept/l'outil)
2. 🎯 APPLICABILITÉ MASTER PLAN : (Comment et où Antoine peut l'utiliser concrètement : Portfolio, Aevum, Growth, Ops)
3. 🛠️ PROCHAINE ACTION CONCRÈTE : (Ce qu'on fait : tester un repo, cloner, adapter un composant, etc.)

Reste direct, technique et orienté valeur d'exécution. Pas de blabla inutile.`;

    const llmResp = await this.queryLocalLLM(prompt);
    if (llmResp && llmResp.length > 50) {
      return llmResp;
    }

    // Débrief déterministe de secours si LLM hors-ligne
    return `🔍 *DE QUOI S'AGIT-IL :*\n` +
           `Ressource indexée dans la catégorie *${item.category}* : ${item.title || item.content}.\n\n` +
           `🎯 *APPLICABILITÉ MASTER PLAN :*\n` +
           `• *Portfolio & Web :* Analyse de l'impact visuel et intégration de composants interactifs.\n` +
           `• *Ops & IA :* Automatisation de flux et enrichissement du second cerveau.\n\n` +
           `🛠️ *PROCHAINE ACTION CONCRÈTE :*\n` +
           `Consulter la ressource pour extraction de code ou de pattern : ${item.content}`;
  }

  async processIncomingContent(type, content, user, caption = '') {
    let title = caption || '';
    let summary = '';
    const isUrl = content.startsWith('http://') || content.startsWith('https://');

    if (isUrl) {
      const meta = await enrichLinkMetadata(content);
      title = meta.title || title || content;
      summary = meta.summary || '';
    } else {
      title = content.substring(0, 60);
    }

    const category = this.detectCategory(`${title} ${summary} ${content}`);
    const item = {
      id: `RES-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type,
      content,
      title,
      summary,
      category,
      sender: user.first_name || 'Antoine'
    };

    // 1. Sauvegarde dans le graphe de recherche
    const graph = this.loadGraph();
    graph.resources = graph.resources || [];
    graph.resources.unshift(item);
    if (graph.resources.length > 500) graph.resources = graph.resources.slice(0, 500);
    this.saveGraph(graph);

    // 2. Génération du compte-rendu
    const debrief = await this.generateDebrief(item);

    // 2b. Enrichissement automatique via Firecrawl (catégories techniques uniquement)
    let firecrawlSection = '';
    if (['Code & Repositories', 'UI & Animations', 'IA & Systèmes Multi-Agents'].includes(item.category)) {
      const fcResults = await searchDeveloperIndex(item.title || item.content, 3);
      if (fcResults.length) {
        firecrawlSection = '\n\n---\n\n## 🔥 Enrichissement Firecrawl Developer Index\n\n' +
          fcResults.map((r, i) => `${i + 1}. **${r.title}** — [${r.url}](${r.url})\n` +
            (r.snippet ? `   > ${r.snippet.replace(/\n+/g, ' ').substring(0, 200)}\n\n` : '')).join('');
      }
    }

    // 3. Archivage en fichier Markdown
    const slug = (item.title || 'ressource').toLowerCase().replace(/[^a-z0-9]+/g, '_').substring(0, 30);
    const reportFileName = `REPORT_${Date.now()}_${slug}.md`;
    const reportPath = path.join(this.reportsDir, reportFileName);
    const reportMd = `# 💡 Compte-Rendu de Veille : ${item.title}\n\n` +
                     `- **Date :** ${new Date().toLocaleString('fr-FR')}\n` +
                     `- **Catégorie :** ${item.category}\n` +
                     `- **Source :** ${item.content}\n\n---\n\n` +
                     `${debrief}${firecrawlSection}\n`;
    fs.writeFileSync(reportPath, reportMd, 'utf8');

    // 4. Message de retour Telegram
    return `💡 *COMPTE-RENDU DE VEILLE & EXTRACTION*\n\n` +
           `📌 *Ressource :* ${item.title}\n` +
           `🏷️ *Catégorie :* \`${item.category}\`\n\n` +
           `${debrief}\n\n` +
           `📁 _Archivé dans : \`Workspace/research_reports/${reportFileName}\`_`;
  }

  getRecentReports(limit = 5) {
    const graph = this.loadGraph();
    const list = (graph.resources || []).slice(0, limit);
    if (!list.length) return 'ℹ️ Aucune ressource de recherche indexée pour le moment.';

    let msg = `📚 *DERNIÈRES RESSOURCES DE VEILLE ANALYSÉES (${list.length}) :*\n\n`;
    list.forEach((r, idx) => {
      msg += `[${idx + 1}] *${r.title || 'Sans titre'}*\n` +
             `    🏷️ \`${r.category}\` | 📅 ${r.timestamp.substring(0, 10)}\n` +
             `    🔗 ${r.content.substring(0, 60)}...\n\n`;
    });
    msg += `💡 _Envoie simplement n'importe quel lien, reel, article ou note pour déclencher une nouvelle analyse._`;
    return msg;
  }

  searchResources(query) {
    if (!query) return '🔍 Utilisation : `/search <mot-clé>` (ex: `/search animation`, `/search agent`)';
    const graph = this.loadGraph();
    const q = query.toLowerCase();
    const matches = (graph.resources || []).filter(r =>
      (r.title && r.title.toLowerCase().includes(q)) ||
      (r.summary && r.summary.toLowerCase().includes(q)) ||
      (r.category && r.category.toLowerCase().includes(q)) ||
      (r.content && r.content.toLowerCase().includes(q))
    ).slice(0, 5);

    if (!matches.length) return `🔍 Aucune ressource trouvée pour : \`${query}\`.`;

    let msg = `🔍 *RÉSULTATS POUR "${query}" (${matches.length}) :*\n\n`;
    matches.forEach((m, idx) => {
      msg += `[${idx + 1}] *${m.title}*\n    🏷️ \`${m.category}\`\n    🔗 ${m.content}\n\n`;
    });
    return msg;
  }

  async searchDev(query) {
    if (!query) return '🔥 *Utilisation :* `/dev <librairie ou question>` (ex: `/dev shader gradient`, `/dev liquid glass react`)';
    const results = await searchDeveloperIndex(query, 3);
    return formatDevSearchResults(results);
  }

  getHelpMessage() {
    const graph = this.loadGraph();
    const count = (graph.resources || []).length;
    return `🔬 *BOT DE RECHERCHE & VEILLE STRATÉGIQUE*\n\n` +
           `Ce bot est ton agent d'extraction dédié. Envoie-lui n'importe quel contenu :\n` +
           `• 🎬 *Reels Instagram / TikTok / Vidéos*\n` +
           `• 💻 *Dépôts GitHub, Librairies, Outils web*\n` +
           `• 📰 *Articles, Posts X / LinkedIn, Newsletters*\n` +
           `• 📝 *Notes, Idées de fonctionnalités, Réflexions*\n\n` +
           `🤖 *Ce que fait l'agent :*\n` +
           `1. Extrait les métadonnées & résume le contenu\n` +
           `2. Classe la ressource dans la base de recherche\n` +
           `3. Rédige un compte-rendu d'applicabilité pour le Master Plan\n\n` +
           `🔥 *Recherche Technique (Firecrawl Developer Index - 70M+ docs) :*\n` +
           `• \`/dev <librairie/sujet>\` — Chercher docs, repos & code sans pub\n\n` +
           `📊 *Base active :* \`${count} ressources indexées\`\n` +
           `• \`/reports\` — Consulter les 5 dernières analyses\n` +
           `• \`/search <mot>\` — Rechercher une ressource indexée\n` +
           `• \`/status\` — Statut de l'agent et de la mémoire`;
  }
}

module.exports = { ResearchBotEngine };
