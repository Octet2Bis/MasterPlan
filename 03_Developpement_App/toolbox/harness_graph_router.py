#!/usr/bin/env python3
"""
HARNESS GRAPH ROUTER — SECONDARY PARITY BRIDGE (Python)
Écosystème Antigravity — Master Plan

RÔLE ARCHITECTURAL :
- Runtime : PONT SECONDAIRE pour environnements d'exécution Python (SWE-agent, Daytona).
- Parité : Strictement aligné sur le runtime primaire harness_graph_router.js.
- Découplage de Données (Loi AGENTS.md #1 & #2) : La matrice des intentions,
  compétences cibles et quality gates est externalisée dans toolbox/data/intent_graph.json.
  Zéro troncature fonctionnelle : 100% des règles sont préservées et chargées dynamiquement.

Rôle métier : Transforme une intention utilisateur en sous-graphe déterministe d'exécution :
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

INTENT_GRAPH_PATH = Path(__file__).resolve().parent / "data" / "intent_graph.json"

def load_intent_registry():
    try:
        if INTENT_GRAPH_PATH.exists():
            with open(INTENT_GRAPH_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get("intents", {})
    except Exception as e:
        print(f"⚠️ Erreur de chargement du Knowledge Graph d'intentions : {e}", file=sys.stderr)
    return {}

GRAPH_INTENT_REGISTRY = load_intent_registry()

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
