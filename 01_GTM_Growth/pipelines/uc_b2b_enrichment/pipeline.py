"""
pipeline.py — UC_B2B_Enrichment (Génération de Leads Outbound)

Ce pipeline utilise la méthode de la cascade (Waterfall) pour maximiser
le taux de découverte tout en minimisant les coûts d'API.

Workflow :
1. Charger le CSV d'entrée
2. Normaliser les données (via toolbox.core.normalize)
3. Pour chaque prospect : exécuter la cascade Finders → Verifiers
4. Exporter le CSV enrichi avec Email_Found, Email_Source, Email_Status, Confidence_Score
"""

import os
import sys
import time
import random
import argparse
import pandas as pd
from pathlib import Path
from typing import Optional

# Ajouter le dossier parent au path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from toolbox.core.normalize import normalize_text, normalize_domain
from toolbox.core.scoring import compute_confidence_score
from pipelines.cascade_runner import (
    load_cascade_config,
    instantiate_tools,
    run_finder_cascade,
)

# Reconfigure stdout pour UTF-8
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')


def run(input_path: str, output_path: str, config_path: Optional[str] = None):
    """Point d'entrée principal du pipeline B2B."""
    
    # Charger les variables d'environnement
    from dotenv import load_dotenv
    load_dotenv("/app/data/.env")
    load_dotenv()

    # ─── 1. Charger la configuration de cascade ───
    config = load_cascade_config(config_path)
    b2b_config = config.get("uc_b2b_enrichment", {})
    
    finder_entries = b2b_config.get("finders", [])
    verifier_entries = b2b_config.get("verifiers", [])
    
    print("[*] Instanciation des outils depuis cascade_config.yaml...")
    finders = instantiate_tools(finder_entries)
    verifiers = instantiate_tools(verifier_entries)
    
    print(f"    Finders actifs  : {[f.name for f in finders]}")
    print(f"    Verifiers actifs: {[v.name for v in verifiers]}")
    
    if not finders:
        print("[!] Aucun Finder disponible. Vérifiez vos clés API dans .env")
        sys.exit(1)

    # ─── 2. Charger et normaliser les données ───
    if not os.path.exists(input_path):
        print(f"[!] Fichier d'entrée introuvable : {input_path}")
        sys.exit(1)

    print(f"[*] Lecture de la source : {input_path}")
    df = pd.read_csv(input_path)

    # Identification dynamique des colonnes
    fn_col = next((c for c in ["firstName", "first_name", "prénom", "prenom"] if c in df.columns), None)
    ln_col = next((c for c in ["lastName", "last_name", "nom"] if c in df.columns), None)
    dom_col = next((c for c in ["companyDomain", "domain", "colonne domaine", "company_domain", "company"] if c in df.columns), None)

    if not fn_col or not ln_col or not dom_col:
        print("[!] Colonnes requises (prénom, nom, domaine) introuvables dans le CSV.")
        sys.exit(1)

    print("[*] Normalisation des données (Clean_FirstName, Clean_LastName, Clean_Domain)...")
    df["Clean_FirstName"] = df[fn_col].apply(normalize_text)
    df["Clean_LastName"] = df[ln_col].apply(normalize_text)
    df["Clean_Domain"] = df[dom_col].apply(normalize_domain)

    # ─── 3. Exécuter la cascade pour chaque prospect ───
    emails_found = []
    sources = []
    statuses = []
    scores = []

    total = len(df)
    print(f"[*] Exécution de la cascade Waterfall pour {total} prospects...\n")

    for i, row in df.iterrows():
        first = row["Clean_FirstName"]
        last = row["Clean_LastName"]
        dom = row["Clean_Domain"]

        print(f"[{i+1}/{total}] Prospect : {row.get(fn_col, '')} {row.get(ln_col, '')} ({dom})")
        
        email, source, status, ver_score = run_finder_cascade(
            finders, verifiers, first, last, dom
        )

        # Calculer le Confidence_Score final via le moteur Attio
        if email:
            final_score = compute_confidence_score(
                source=source,
                verifier_status=status,
                verifier_score=ver_score,
            )
            print(f"  [+] {email} | Source: {source} | Statut: {status} | Confiance: {final_score}/100")
        else:
            final_score = 0
            print("  [-] Aucun email trouvé dans la cascade.")

        emails_found.append(email)
        sources.append(source)
        statuses.append(status)
        scores.append(final_score)

        # Délai de courtoisie pour les API Rate Limits
        time.sleep(random.uniform(0.5, 1.2))

    # ─── 4. Exporter le CSV enrichi ───
    df["Email_Found"] = emails_found
    df["Email_Source"] = sources
    df["Email_Status"] = statuses
    df["Confidence_Score"] = scores

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    df.to_csv(output_path, index=False, encoding="utf-8")

    found_count = sum(1 for e in emails_found if e)
    print(f"\n[*] Pipeline B2B terminé ! {found_count}/{total} emails trouvés.")
    print(f"[*] Export : {output_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Pipeline B2B Enrichment (Waterfall)")
    parser.add_argument("--input", required=True, help="CSV d'entrée")
    parser.add_argument("--output", required=True, help="CSV de sortie")
    parser.add_argument("--config", default=None, help="Chemin custom du cascade_config.yaml")
    args = parser.parse_args()
    run(args.input, args.output, args.config)
