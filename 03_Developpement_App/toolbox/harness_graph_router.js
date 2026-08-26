#!/usr/bin/env node
/**
 * HARNESS GRAPH ROUTER (Zero-Dependency Node.js & Python Advisory Agentic Router)
 * Écosystème Antigravity — Master Plan
 *
 * Rôle : Transforme une intention utilisateur en sous-graphe déterministe d'exécution :
 * - Compétences requises (.agents/skills/)
 * - Fichiers cibles indissociables (Code source + Simulateurs + Docs)
 * - Quality Gates et contraintes architecturales obligatoires
 */

const fs = require('fs');
const path = require('path');

const GRAPH_INTENT_REGISTRY = {
  AEVUM_PROTOCOL: {
    title: "Ajout / Modification de Protocole Physiologique Aevum",
    keywords: ["protocol", "protocole", "defi", "défi", "respiration", "mobilite", "mobilité", "soupir", "huberman", "text-neck", "healthspan", "bioage", "sciatique", "psoas", "etirement", "étirement"],
    primary_pillar: "03_Developpement_App",
    skills: [
      ".agents/skills/longevity-protocol-engine/SKILL.md",
      ".agents/skills/ios-screentime-architect/SKILL.md"
    ],
    target_files: [
      "03_Developpement_App/apps/aevum_ios/AevumApp/Core/Models/ProtocolModel.swift",
      "03_Developpement_App/apps/aevum_ios/AevumApp/Core/Services/ProtocolRecommendationEngine.swift",
      "03_Developpement_App/apps/aevum_ios/web_preview/app.js"
    ],
    quality_gates: [
      "Validation de la source clinique peer-reviewed obligatoire (Stanford, Harvard, Hansraj, McGill, etc.)",
      "Synchronisation obligatoire entre Swift (ProtocolModel) et Web Simulator (app.js)",
      "Vérification de la contrainte mémoire RAM < 6 Mo sur les extensions iOS ScreenTime",
      "Conformité Apple HealthKit Guideline 1.4.1 (Non-allégation médicale invasive)"
    ]
  },
  AEVUM_SHIELD: {
    title: "Gestion du Bouclier de Friction & Screen Time API",
    keywords: ["shield", "bouclier", "screentime", "screen time", "familycontrols", "managedsettings", "deviceactivity", "blocage", "deblocage", "grace"],
    primary_pillar: "03_Developpement_App",
    skills: [
      ".agents/skills/ios-screentime-architect/SKILL.md",
      ".agents/skills/apple-appstore-publisher/SKILL.md"
    ],
    target_files: [
      "03_Developpement_App/apps/aevum_ios/AevumApp/Core/Services/ScreenTimeManager.swift",
      "03_Developpement_App/apps/aevum_ios/AevumApp/UI/Screens/DashboardView.swift",
      "03_Developpement_App/apps/aevum_ios/web_preview/app.js"
    ],
    quality_gates: [
      "App Groups & Keychain sharing pour le passage de tokens entre App et Extension",
      "Gestion des permissions FamilyControls sans crash en cas de refus utilisateur",
      "Validation de la fenêtre de grâce (15 min) avec auto-verrouillage en fin de timer"
    ]
  },
  AEVUM_ASO_PACKAGING: {
    title: "Packaging App Store & Métadonnées ASO Aevum",
    keywords: ["aso", "app store", "appstore", "metadata", "metadonnees", "testflight", "privacy", "xcprivacy", "soumission"],
    primary_pillar: "03_Developpement_App",
    skills: [
      ".agents/skills/apple-appstore-publisher/SKILL.md",
      ".agents/skills/gtm-aso-app-store/SKILL.md"
    ],
    target_files: [
      "03_Developpement_App/apps/aevum_ios/APP_STORE_METADATA.md",
      "03_Developpement_App/apps/aevum_ios/README_XCODE_MAC.md"
    ],
    quality_gates: [
      "Titre App Store strictement <= 30 caractères",
      "Sous-titre App Store strictement <= 30 caractères",
      "Mots-clés ASO strictement <= 100 caractères (séparés par virgules sans espace)",
      "Privacy Manifest (PrivacyInfo.xcprivacy) renseigné pour les API Apple requises"
    ]
  },
  GTM_CAMPAIGN_AND_ADS: {
    title: "Création de Campagne Paid Ads (Meta / Google) & Funnel",
    keywords: ["meta ads", "google ads", "paid", "campagne", "creatives", "visuels", "copywriting", "landing page", "tracking", "gtm", "ga4", "boucher", "1001 gouts"],
    primary_pillar: "01_GTM_Growth",
    skills: [
      ".agents/skills/gtm-paid-ads-generator/SKILL.md",
      ".agents/skills/gtm-tracking-plan/SKILL.md",
      ".agents/skills/gtm-neuro-acquisition/SKILL.md",
      ".agents/skills/no-ai-slop/SKILL.md"
    ],
    target_files: [
      "01_GTM_Growth/03_Experimentation/campaigns/1001gouts_bouchers/meta_and_google_ads_strategy.md",
      "01_GTM_Growth/03_Experimentation/landing_pages/bold-tesla/index.html",
      "01_GTM_Growth/03_Experimentation/landing_pages/bold-tesla/src/pages/Bouchers.jsx"
    ],
    quality_gates: [
      "Passage obligatoire par le linter No-AI-Slop (zéro contraste binaire artificiel)",
      "Présence des 3 angles créatifs (Pain Point, Lead Magnet, Preuve Sociale)",
      "Événement DataLayer 'generate_lead' câblé sur le formulaire de capture",
      "Conformité Consent Mode v2 RGPD"
    ]
  },
  CAREER_OPS: {
    title: "Assistant Carrière & Scoring d'Opportunités ATS",
    keywords: ["cv", "resume", "job", "offre", "candidature", "scoring", "matcher", "ats", "career"],
    primary_pillar: "02_Assistant_Personnel",
    skills: [
      ".agents/skills/career-job-hunter/SKILL.md",
      ".agents/skills/minimax-doc-generator/SKILL.md"
    ],
    target_files: [
      "02_Assistant_Personnel/04_Productivite_Admin/career_ops/job_matcher.py"
    ],
    quality_gates: [
      "Seuil d'éligibilité Gold Tier >= 85/100 requis pour déclencher la rédaction",
      "Architecture Drafter-Reviewer obligatoire avant envoi"
    ]
  }
};

function findWorkspaceRoot() {
  let current = __dirname;
  for (let i = 0; i < 5; i++) {
    if (fs.existsSync(path.join(current, 'master_router.md'))) {
      return current;
    }
    current = path.dirname(current);
  }
  return process.cwd();
}

function matchIntent(queryText) {
  const queryLower = (queryText || '').toLowerCase();
  let bestMatch = null;
  let maxScore = 0;

  for (const [intentKey, data] of Object.entries(GRAPH_INTENT_REGISTRY)) {
    let score = 0;
    for (const kw of data.keywords) {
      if (queryLower.includes(kw.toLowerCase())) {
        score += 1;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = { intentKey, data, score };
    }
  }

  if (bestMatch && maxScore > 0) {
    return {
      matched: true,
      intent_key: bestMatch.intentKey,
      score: maxScore,
      data: bestMatch.data
    };
  }

  return {
    matched: false,
    intent_key: "GENERIC_EXPLORATION_FALLBACK",
    data: {
      title: "Requête Non Indexée (Mode Exploration Libre)",
      primary_pillar: "master_router.md",
      skills: [".agents/skills/agent-harness-ops/SKILL.md"],
      target_files: ["master_router.md"],
      quality_gates: ["Respect absolu des 3 Couches", "Droit de veto architectural CTO"]
    }
  };
}

function formatReport(result, root) {
  const data = result.data;
  const statusIcon = result.matched ? "⚡ [GRAPH ROUTING ACTIF]" : "🧭 [MODE EXPLORATION LIBRE]";
  const lines = [];

  lines.push(`\n${statusIcon} — ${data.title}`);
  lines.push("=".repeat(70));
  lines.push(`📁 Pilier Cible : ${data.primary_pillar}`);

  lines.push("\n🧠 Compétences Spécialisées Requises :");
  for (const s of data.skills) {
    const exists = fs.existsSync(path.join(root, s)) ? "✅" : "⚠️ (non trouvé)";
    lines.push(`   • ${s} ${exists}`);
  }

  lines.push("\n🎯 Chaîne de Fichiers Indissociables à Modifier :");
  for (const f of data.target_files) {
    const exists = fs.existsSync(path.join(root, f)) ? "✅" : "⚠️ (non créé)";
    lines.push(`   • ${f} ${exists}`);
  }

  lines.push("\n🛡️ Quality Gates & Contraintes de Sécurité :");
  for (const q of data.quality_gates) {
    lines.push(`   • ${q}`);
  }

  lines.push("=".repeat(70) + "\n");
  return lines.join("\n");
}

function main() {
  const args = process.argv.slice(2);
  const root = findWorkspaceRoot();

  if (args.includes('--list-nodes')) {
    if (args.includes('--json')) {
      console.log(JSON.stringify(GRAPH_INTENT_REGISTRY, null, 2));
    } else {
      console.log("\n📦 NŒUDS INDEXÉS DANS LE KNOWLEDGE GRAPH HARNESS :");
      console.log("=".repeat(60));
      for (const [k, v] of Object.entries(GRAPH_INTENT_REGISTRY)) {
        console.log(`• [${k}] : ${v.title}`);
      }
      console.log("=".repeat(60) + "\n");
    }
    return;
  }

  const isJson = args.includes('--json');
  const cleanArgs = args.filter(a => a !== '--json');
  const query = cleanArgs.join(' ') || "aide globale";

  const result = matchIntent(query);

  if (isJson) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(formatReport(result, root));
  }
}

main();
