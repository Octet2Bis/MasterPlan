#!/usr/bin/env python3
"""
HARNESS GRAPH ROUTER — THIN PYTHON WRAPPER
Délègue l'exécution au runtime canonique Node.js (harness_graph_router.js).
Garantit zéro dérive et source unique de vérité.
Plafond strict : < 50 lignes.
"""

import os
import sys
import subprocess
from pathlib import Path

ROUTER_DIR = Path(__file__).resolve().parent
JS_ROUTER = ROUTER_DIR / "harness_graph_router.js"

def main():
    if not JS_ROUTER.exists():
        print(f"🚨 Routeur canonique Node.js introuvable : {JS_ROUTER}", file=sys.stderr)
        sys.exit(1)

    # Transmission transparente des arguments au routeur Node.js
    args = ["node", str(JS_ROUTER)] + sys.argv[1:]
    
    try:
        res = subprocess.run(args)
        sys.exit(res.returncode)
    except FileNotFoundError:
        # Fallback si l'environnement n'a pas node sur le PATH
        print("⚠️ Node.js non détecté sur le PATH. Lecture directe du graphe :", file=sys.stderr)
        graph_file = ROUTER_DIR / "data" / "intent_graph.json"
        if graph_file.exists():
            import json
            with open(graph_file, "r", encoding="utf-8") as f:
                data = json.load(f)
            print(f"Nodes indexés : {list(data.get('intents', {}).keys())}")
        sys.exit(0)

if __name__ == "__main__":
    main()
