#!/usr/bin/env python3
"""
HARNESS GRAPH ROUTER (Zero-Dependency Advisory Agentic Router)
Ecosystème Antigravity — Master Plan

Rôle : Transforme une intention utilisateur en sous-graphe déterministe d'exécution :
- Compétences requises (.agents/skills/)
- Fichiers cibles indissociables (Code source + Simulateurs + Docs)
- Quality Gates et contraintes architecturales obligatoires
"""

import sys
import os
import json
import re
import argparse
from pathlib import Path

# MARK: - Registre Déterministe des Intentions du Graphe
GRAPH_INTENT_REGISTRY = {
    "AEVUM_PROTOCOL": {
        "title": "Ajout / Modification de Protocole Physiologique Aevum",
        "keywords": ["protocol", "protocole", "defi", "défi", "respiration", "mobilite", "mobilité", "soupir", "huberman", "text-neck", "healthspan", "bioage"],
        "primary_pillar": "03_Developpement_App",
        "skills": [
            ".agents/skills/longevity-protocol-engine/SKILL.md",
            ".agents/skills/ios-screentime-architect/SKILL.md"
        ],
        "target_files": [
            "03_Developpement_App/apps/aevum_ios/AevumApp/Core/Models/ProtocolModel.swift",
            "03_Developpement_App/apps/aevum_ios/AevumApp/Core/Services/ProtocolRecommendationEngine.swift",
            "03_Developpement_App/apps/aevum_ios/web_preview/app.js"
        ],
        "quality_gates": [
            "Validation de la source clinique peer-reviewed obligatoire (Stanford, Harvard, Hansraj, McGill, etc.)",
            "Synchronisation obligatoire entre Swift (ProtocolModel) et Web Simulator (app.js)",
            "Vérification de la contrainte mémoire RAM < 6 Mo sur les extensions iOS ScreenTime",
            "Conformité Apple HealthKit Guideline 1.4.1 (Non-allégation médicale invasive)"
        ]
    },
    "AEVUM_SHIELD": {
        "title": "Gestion du Bouclier de Friction & Screen Time API",
        "keywords": ["shield", "bouclier", "screentime", "screen time", "familycontrols", "managedsettings", "deviceactivity", "blocage", "deblocage", "grace"],
        "primary_pillar": "03_Developpement_App",
        "skills": [
            ".agents/skills/ios-screentime-architect/SKILL.md",
            ".agents/skills/apple-appstore-publisher/SKILL.md"
        ],
        "target_files": [
            "03_Developpement_App/apps/aevum_ios/AevumApp/Core/Services/ScreenTimeManager.swift",
            "03_Developpement_App/apps/aevum_ios/AevumApp/UI/Screens/DashboardView.swift",
            "03_Developpement_App/apps/aevum_ios/web_preview/app.js"
        ],
        "quality_gates": [
            "App Groups & Keychain sharing pour le passage de tokens entre App et Extension",
            "Gestion des permissions FamilyControls sans crash en cas de refus utilisateur",
            "Validation de la fenêtre de grâce (15 min) avec auto-verrouillage en fin de timer"
        ]
    },
    "AEVUM_ASO_PACKAGING": {
        "title": "Packaging App Store & Métadonnées ASO Aevum",
        "keywords": ["aso", "app store", "appstore", "metadata", "metadonnees", "testflight", "privacy", "xcprivacy", "soumission"],
        "primary_pillar": "03_Developpement_App",
        "skills": [
            ".agents/skills/apple-appstore-publisher/SKILL.md",
            ".agents/skills/gtm-aso-app-store/SKILL.md"
        ],
        "target_files": [
            "03_Developpement_App/apps/aevum_ios/APP_STORE_METADATA.md",
            "03_Developpement_App/apps/aevum_ios/README_XCODE_MAC.md"
        ],
        "quality_gates": [
            "Titre App Store strictement <= 30 caractères",
            "Sous-titre App Store strictement <= 30 caractères",
            "Mots-clés ASO strictement <= 100 caractères (séparés par virgules sans espace)",
            "Privacy Manifest (PrivacyInfo.xcprivacy) renseigné pour les API Apple requises"
        ]
    },
    "GTM_CAMPAIGN_AND_ADS": {
        "title": "Création de Campagne Paid Ads (Meta / Google) & Funnel",
        "keywords": ["meta ads", "google ads", "paid", "campagne", "creatives", "visuels", "copywriting", "landing page", "tracking", "gtm", "ga4", "boucher", "1001 gouts"],
        "primary_pillar": "01_GTM_Growth",
        "skills": [
            ".agents/skills/gtm-paid-ads-generator/SKILL.md",
            ".agents/skills/gtm-tracking-plan/SKILL.md",
            ".agents/skills/gtm-neuro-acquisition/SKILL.md",
            ".agents/skills/no-ai-slop/SKILL.md"
        ],
        "target_files": [
            "01_GTM_Growth/03_Experimentation/campaigns/1001gouts_bouchers/meta_and_google_ads_strategy.md",
            "01_GTM_Growth/03_Experimentation/landing_pages/bold-tesla/index.html",
            "01_GTM_Growth/03_Experimentation/landing_pages/bold-tesla/src/pages/Bouchers.jsx"
        ],
        "quality_gates": [
            "Passage obligatoire par le linter No-AI-Slop (zéro contraste binaire artificiel)",
            "Présence des 3 angles créatifs (Pain Point, Lead Magnet, Preuve Sociale)",
            "Événement DataLayer 'generate_lead' câblé sur le formulaire de capture",
            "Conformité Consent Mode v2 RGPD"
        ]
    },
    "CAREER_OPS": {
        "title": "Assistant Carrière & Scoring d'Opportunités ATS",
        "keywords": ["cv", "resume", "job", "offre", "candidature", "scoring", "matcher", "ats", "career"],
        "primary_pillar": "02_Assistant_Personnel",
        "skills": [
            ".agents/skills/career-job-hunter/SKILL.md",
            ".agents/skills/minimax-doc-generator/SKILL.md"
        ],
        "target_files": [
            "02_Assistant_Personnel/04_Productivite_Admin/career_ops/job_matcher.py"
        ],
        "quality_gates": [
            "Seuil d'éligibilité Gold Tier >= 85/100 requis pour déclencher la rédaction",
            "Architecture Drafter-Reviewer obligatoire avant envoi"
        ]
    }
}

def find_workspace_root() -> Path:
    """Remonte les répertoires parents pour trouver la racine contenant master_router.md."""
    current = Path(__file__).resolve().parent
    for _ in range(5):
        if (current / "master_router.md").exists():
            return current
        current = current.parent
    return Path.cwd()

def match_intent(query_text: str) -> dict:
    """Analyse sémantique par mots-clés pour extraire le sous-graphe exact."""
    query_lower = query_text.lower()
    best_match = None
    max_score = 0

    for intent_key, data in GRAPH_INTENT_REGISTRY.items():
        score = 0
        for kw in data["keywords"]:
            if kw.lower() in query_lower:
                score += 1
        
        if score > max_score:
            max_score = score
            best_match = (intent_key, data)

    if best_match and max_score > 0:
        intent_key, data = best_match
        return {
            "matched": True,
            "intent_key": intent_key,
            "score": max_score,
            "data": data
        }
    
    return {
        "matched": False,
        "intent_key": "GENERIC_EXPLORATION_FALLBACK",
        "data": {
            "title": "Requête Non Indexée (Mode Exploration Libre)",
            "primary_pillar": "master_router.md",
            "skills": [".agents/skills/agent-harness-ops/SKILL.md"],
            "target_files": ["master_router.md"],
            "quality_gates": ["Respect absolu des 3 Couches", "Droit de veto architectural CTO"]
        }
    }

def format_human_report(result: dict, root: Path) -> str:
    """Génère un rapport visuel clair pour l'humain et l'agent."""
    data = result["data"]
    status_icon = "⚡ [GRAPH ROUTING ACTIF]" if result.get("matched") else "🧭 [MODE EXPLORATION LIBRE]"
    
    lines = []
    lines.append(f"\n{status_icon} — {data['title']}")
    lines.append("=" * 70)
    lines.append(f"📁 Pilier Cible : {data['primary_pillar']}")
    
    lines.append("\n🧠 Compétences Spécialisées Requises :")
    for s in data["skills"]:
        exists = "✅" if (root / s).exists() else "⚠️ (non trouvé)"
        lines.append(f"   • {s} {exists}")

    lines.append("\n🎯 Chaîne de Fichiers Indissociables à Modifier :")
    for f in data["target_files"]:
        exists = "✅" if (root / f).exists() else "⚠️ (non créé)"
        lines.append(f"   • {f} {exists}")

    lines.append("\n🛡️ Quality Gates & Contraintes de Sécurité :")
    for q in data["quality_gates"]:
        lines.append(f"   • {q}")
    
    lines.append("=" * 70 + "\n")
    return "\n".join(lines)

def main():
    parser = argparse.ArgumentParser(description="Harness Graph Router pour Antigravity Master Plan")
    parser.add_argument("--query", "-q", type=str, help="Requête ou intention de travail")
    parser.add_argument("--json", action="store_true", help="Retourne la sortie en JSON pur")
    parser.add_argument("--list-nodes", action="store_true", help="Liste tous les nœuds indexés dans le graphe")
    args = parser.parse_args()

    root = find_workspace_root()

    if args.list_nodes:
        if args.json:
            print(json.dumps(GRAPH_INTENT_REGISTRY, indent=2, ensure_ascii=False))
        else:
            print("\n📦 NŒUDS INDEXÉS DANS LE KNOWLEDGE GRAPH HARNESS :")
            print("=" * 60)
            for k, v in GRAPH_INTENT_REGISTRY.items():
                print(f"• [{k}] : {v['title']}")
            print("=" * 60 + "\n")
        return

    query = args.query or " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "aide globale"
    result = match_intent(query)

    if args.json:
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print(format_human_report(result, root))

if __name__ == "__main__":
    main()
