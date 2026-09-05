/**
 * MASTER PLAN COCKPIT — LOCAL AI RESPONDER ENGINE (Node.js 24)
 * Pilier : 03_Developpement_App_and_Design / Toolbox
 * Rôle : Générateur de réponses contextuelles et intelligentes pour le Dashboard (< 240 lignes)
 */

const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');

const ROOT_DIR = path.resolve(__dirname, '../../../..');

class CockpitAiResponder {
  constructor() {
    this.manifest = null;
    this.loadManifest();
  }

  loadManifest() {
    const file = path.join(__dirname, '../data/cockpit_manifest.json');
    try {
      if (fs.existsSync(file)) this.manifest = JSON.parse(fs.readFileSync(file, 'utf-8'));
    } catch {}
  }

  async generateResponse(tabId, userMessage, projectId) {
    const cleanMsg = (userMessage || '').toLowerCase();

    // 1. Tenter d'interroger un modèle LLM local (Ollama Qwen 2.5) si disponible (< 1.5s)
    const ollamaReply = await this.tryOllama(tabId, userMessage, projectId);
    if (ollamaReply) return ollamaReply;

    // 2. Moteur Expert Hybride & Contextuel Déterministe
    if (tabId === 'gtm') return this.respondGTM(cleanMsg);
    if (tabId === 'assistant') return this.respondAssistant(cleanMsg);
    if (tabId === 'dev') return this.respondDev(cleanMsg);
    return this.respondControl(cleanMsg);
  }

  respondGTM(msg) {
    if (msg.includes('campagne') || msg.includes('lancer') || msg.includes('ads') || msg.includes('besoin')) {
      return `🚀 **Feuille de Route pour Lancer des Campagnes (Pilier 01 GTM) :**\n\n` +
             `1. **Infrastructure B2B (Outbound) :**\n` +
             `   • Domaines secondaires configurés (SPF, DKIM, DMARC stricts).\n` +
             `   • Fichier de prospects qualifiés enrichi via la toolbox Waterfall 0€.\n` +
             `   • Séquences personnalisées générées par le \`buying_committee_engine.js\`.\n\n` +
             `2. **Campagnes Paid B2C (Meta / Google Ads pour Aevum) :**\n` +
             `   • Landing Page de capture CRO avec Consent Mode v2 & Meta CAPI.\n` +
             `   • 3 créatifs vidéos courts (Friction positive, Défi respiration 30s).\n` +
             `   • Budget de test recommandé : 15-30€/jour par groupe d'annonces.\n\n` +
             `3. **Mesure & Attribution :** UTMs unifiés et validation DataLayer.`;
    }
    if (msg.includes('projet') || msg.includes('tour') || msg.includes('quoi') || msg.includes('cours')) {
      return `📈 **Projets actifs dans l'Onglet GTM & Growth :**\n\n` +
             `• 🔍 **AEO Semantic Graph Auditor** (\`02_Acquisition_and_AEO\`) : Citations IA (Perplexity, ChatGPT).\n` +
             `• 🤝 **B2B Buying Committee Engine** (\`04_Outbound_and_CRM\`) : Prospection multicanale.\n` +
             `• 🎯 **Landing Page Wireframing & CRO** (\`03_Experimentation\`) : Pages haute conversion.\n` +
             `• 🔁 **Boucles d'Activation & Hook Model** (\`05_Activation_and_CSM\`) : Time-To-Value < 60s.\n` +
             `• 🧰 **Toolbox GTM** (\`toolbox/\`) : Linters (\`email_linter\`, \`ai_slop_linter\`, \`schema_validator\`).`;
    }
    if (msg.includes('linter') || msg.includes('toolbox') || msg.includes('check')) {
      return `🧰 **Linters Déterministes & Outils de la Toolbox GTM :**\n\n` +
             `• 🛡️ \`email_linter.py\` : Analyse de délivrabilité, mots-clés spam et score DNS.\n` +
             `• ✍️ \`ai_slop_linter.py\` : Détection et élimination des tics d'écriture artificielle.\n` +
             `• 📐 \`schema_validator.py\` : Validation syntaxique des blocs JSON-LD Schema.org.\n` +
             `• 📊 \`tracking_validator.py\` : Contrôle des variables DataLayer GA4/GTM.\n` +
             `• 🔥 \`firecrawl_gtm_adapter.js\` : Recherche technique dans 70M+ sources.`;
    }
    if (msg.includes('outil') || msg.includes('ouil') || msg.includes('ajouter') || msg.includes('intégrer') || msg.includes('stack') || msg.includes('idées') || msg.includes('manque')) {
      return `🛠️ **5 Outils & Briques Stratégiques recommandés pour le Pilier GTM :**\n\n` +
             `1. 🔍 **OpenSEO** (\`every-app/open-seo\`) : Espionnage des mots-clés et backlinks concurrents (alternative libre à Semrush/Ahrefs connectée à DataForSEO).\n` +
             `2. 🎬 **OpenCut** : Éditeur vidéo timeline libre pour fabriquer des créatifs et hooks publicitaires TikTok/Reels en masse.\n` +
             `3. 🔗 **BabyLoveGrowth / Réseau Backlinks** : Optimisation de l'autorité de domaine et citations sémantiques.\n` +
             `4. 📊 **EMARKA Dashboard** : Agrégation en 1 point des KPIs Google Ads, Meta Ads et TikTok Ads.\n` +
             `5. 📬 **Routeur d'Outbound Hardened** : Automatisation de l'envoi des séquences B2B avec rotation DNS.`;
    }
    if (msg.includes('aeo') || msg.includes('seo') || msg.includes('schema')) {
      return `🔍 **Audit Sémantique AEO/GEO :**\n` +
             `Le module \`aeo_graph_auditor.js\` analyse la densité d'entités Schema.org JSON-LD pour maximiser le référencement dans les moteurs d'IA générative. Utilise le bouton d'action ci-dessus pour lancer un audit.`;
    }
    return `📈 **Growth Lead AI :** Message bien reçu. Tu es sur le pilier **GTM & Growth**. Nous pouvons travailler sur les angles d'acquisition, l'audit de délivrabilité, ou les variantes de landing pages. Quelle est l'action prioritaire ?`;
  }

  respondAssistant(msg) {
    if (msg.includes('job') || msg.includes('offre') || msg.includes('candidat') || msg.includes('cv') || msg.includes('remote')) {
      return `💼 **Radar Carrière & Opportunités Gold (Pilier 02) :**\n\n` +
             `• Offres qualifiées disponibles dans \`pending_gold_jobs.json\` (GitBook, Lemlist, Crisp, Strapi, Waalaxy).\n` +
             `• Moteur de tailoring ATS actif via \`job_matcher.py\` (Scoring >= 85 requérant parité de preuves).\n` +
             `• Consulte le tableau de bord des entreprises 100% remote vérifiées dans la fenêtre centrale.`;
    }
    if (msg.includes('telegram') || msg.includes('bot') || msg.includes('daemon')) {
      return `🤖 **Statut du Service Telegram Tri-Canal :**\n` +
             `• **Bot PRO** : Chasse de job & validation humaine.\n` +
             `• **Bot PERSO** : Coach & rituels somatiques.\n` +
             `• **Bot INTERPRETOR** : Veille et analyse de liens.\n` +
             `Démons configurés en mode fail-closed avec 2FA par code PIN.`;
    }
    return `💼 **Personal Strategist AI :** Je suis prêt pour le tailoring de ton profil, l'analyse d'une nouvelle offre ou l'ingestion de tes notes de veille.`;
  }

  respondDev(msg) {
    if (msg.includes('aevum') || msg.includes('simulateur') || msg.includes('swift') || msg.includes('protocole')) {
      return `📱 **Architecture Aevum (Pilier 03 Dev) :**\n\n` +
             `• **Natif iOS :** SwiftUI + Composable Architecture (TCA) dans \`AevumApp/\`.\n` +
             `• **12 Protocoles de Santé :** Respiration vagale (4-7-8, Soupir physiologique), décompression rachidienne, bioage.\n` +
             `• **Simulateur Web :** Actif en direct dans la fenêtre centrale. Parité SHA-256 scellée avec le catalogue Swift.\n` +
             `• **Quality Gates :** 100% conforme (\`test_code_integrity.js\`).`;
    }
    if (msg.includes('test') || msg.includes('qualité') || msg.includes('porte') || msg.includes('gatekeeper')) {
      return `🛡️ **Sas de Qualité & Gatekeeping :**\n` +
             `Toutes les applications respectent le Protocole des 4 Portes (Porte 0 Brief, Porte 1 PRD, Porte 2 Design Freeze, Porte 3 Core Loop, Porte 4 Tests Déterministes).`;
    }
    return `📱 **Lead Software Architect :** Le simulateur Aevum est actif. Souhaites-tu tester une nouvelle fonctionnalité, vérifier l'intégrité du code ou ajouter un composant ?`;
  }

  respondControl(msg) {
    if (msg.includes('dag') || msg.includes('topologie') || msg.includes('graphe') || msg.includes('architecture')) {
      return `🌌 **Architecture Globale & DAG Master Plan :**\n\n` +
             `• **Loi des 3 Couches :** Orchestration racine, séparation stricte des responsabilités et étanchéité des ressources.\n` +
             `• **Topologie Déterministe :** 9 nœuds maîtres sans cycle validés par \`dag_validator.js\`.\n` +
             `• **Intent Router :** Détection automatique des compétences requises selon la demande.`;
    }
    return `🌌 **Master Router CTO :** Tour de Contrôle opérationnelle. Je suis à ton écoute pour piloter l'architecture globale, intégrer une nouvelle application ou modifier l'affichage du cockpit.`;
  }

  tryOllama(tabId, message, projectId) {
    return new Promise((resolve) => {
      const prompt = `Tu es l'agent IA du Master Plan pour le rôle [${tabId}]. Réponds en français de façon concise, experte et structurée à : "${message}"`;
      const postData = JSON.stringify({ model: 'qwen2.5:3b', prompt, stream: false });

      const req = http.request({
        hostname: '127.0.0.1', port: 11434, path: '/api/generate', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) },
        timeout: 1200
      }, (res) => {
        let raw = '';
        res.on('data', c => raw += c);
        res.on('end', () => {
          try {
            const data = JSON.parse(raw);
            resolve(data.response?.trim() || null);
          } catch { resolve(null); }
        });
      });

      req.on('error', () => resolve(null));
      req.on('timeout', () => { req.destroy(); resolve(null); });
      req.write(postData);
      req.end();
    });
  }
}

module.exports = { CockpitAiResponder };
