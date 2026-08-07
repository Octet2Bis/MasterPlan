"""
pipeline.py — UC_B2C_Investigation (Deep OSINT & Profiling)

Ce pipeline est dédié à l'investigation pure, s'appuyant fortement
sur l'open source pour trouver l'empreinte numérique d'un individu.

Workflow :
1. Charger le CSV d'entrée (liste d'emails à investiguer)
2. Pour chaque email : exécuter TOUS les Investigators (pas de cascade d'arrêt)
3. Agréger les findings (comptes sociaux, breaches, réputation)
4. Exporter le rapport JSON structuré
"""

import os
import sys
import time
import random
import json
import argparse
import pandas as pd
from pathlib import Path
from typing import Optional

# Ajouter le dossier parent au path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from pipelines.cascade_runner import (
    load_cascade_config,
    instantiate_tools,
    run_investigator_cascade,
)

# Reconfigure stdout pour UTF-8
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')


def run(input_path: str, output_path: str, config_path: Optional[str] = None):
    """Point d'entrée principal du pipeline B2C."""
    
    from dotenv import load_dotenv
    load_dotenv("/app/data/.env")
    load_dotenv()

    # ─── 1. Charger la configuration ───
    config = load_cascade_config(config_path)
    b2c_config = config.get("uc_b2c_investigation", {})
    
    investigator_entries = b2c_config.get("investigators", [])
    
    print("[*] Instanciation des Investigators depuis cascade_config.yaml...")
    investigators = instantiate_tools(investigator_entries)
    
    print(f"    Investigators actifs: {[i.name for i in investigators]}")
    
    if not investigators:
        print("[!] Aucun Investigator disponible. Vérifiez vos clés API dans .env")
        sys.exit(1)

    # ─── 2. Charger les données ───
    if not os.path.exists(input_path):
        print(f"[!] Fichier d'entrée introuvable : {input_path}")
        sys.exit(1)

    print(f"[*] Lecture de la source : {input_path}")
    df = pd.read_csv(input_path)

    # Identification de la colonne email
    email_col = next(
        (c for c in ["email", "Email", "email_address", "Email_Found"] if c in df.columns),
        None
    )
    if not email_col:
        print("[!] Colonne email introuvable dans le CSV.")
        sys.exit(1)

    # ─── 3. Investigation de chaque email ───
    all_reports = []
    total = len(df)
    print(f"[*] Investigation de {total} emails...\n")

    for i, row in df.iterrows():
        email = str(row.get(email_col, "")).strip()
        if not email:
            continue

        print(f"[{i+1}/{total}] Investigation : {email}")
        
        results = run_investigator_cascade(investigators, email)
        
        report = {
            "email": email,
            "investigators_used": len(results),
            "findings": {}
        }
        
        for result in results:
            report["findings"][result.source] = {
                "data": result.findings,
                "confidence": result.confidence,
            }
        
        all_reports.append(report)
        
        # Délai de courtoisie
        time.sleep(random.uniform(1.0, 2.5))

    # ─── 4. Exporter le rapport ───
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    
    # Export JSON (plus adapté que CSV pour les données imbriquées)
    json_output = output_path.replace(".csv", ".json") if output_path.endswith(".csv") else output_path
    with open(json_output, "w", encoding="utf-8") as f:
        json.dump(all_reports, f, indent=2, ensure_ascii=False)
    
    # Export CSV résumé
    csv_output = output_path if output_path.endswith(".csv") else output_path.replace(".json", ".csv")
    summary_rows = []
    for report in all_reports:
        row_data = {
            "Email": report["email"],
            "Investigators_Used": report["investigators_used"],
            "Sources": ", ".join(report["findings"].keys()),
            "Max_Confidence": max(
                (f["confidence"] for f in report["findings"].values()),
                default=0
            ),
        }
        summary_rows.append(row_data)
    
    pd.DataFrame(summary_rows).to_csv(csv_output, index=False, encoding="utf-8")

    investigated = sum(1 for r in all_reports if r["investigators_used"] > 0)
    print(f"\n[*] Pipeline B2C terminé ! {investigated}/{total} emails investigués.")
    print(f"[*] Rapport JSON : {json_output}")
    print(f"[*] Résumé CSV   : {csv_output}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Pipeline B2C Investigation (Deep OSINT)")
    parser.add_argument("--input", required=True, help="CSV d'entrée (colonne email)")
    parser.add_argument("--output", required=True, help="Chemin de sortie (JSON + CSV)")
    parser.add_argument("--config", default=None, help="Chemin custom du cascade_config.yaml")
    args = parser.parse_args()
    run(args.input, args.output, args.config)
