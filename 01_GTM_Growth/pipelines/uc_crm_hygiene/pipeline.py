"""
pipeline.py — UC_CRM_Hygiene (Data & Scoring Hors-Ligne)

Ce pipeline tourne strictement HORS-LIGNE. Il ne fait aucune requête
externe facturée. Il se contente de :
- Nettoyer et normaliser les données (PRE-OSINT)
- Vérifier les enregistrements MX des domaines (dnspython/nslookup)
- Calculer le Confidence_Score final (POST-OSINT)
- Prendre la décision d'inclusion/exclusion du lead

Modes :
  --mode pre   : Nettoyage PRE-OSINT (avant d'envoyer aux pipelines B2B/B2C)
  --mode post  : Scoring POST-OSINT (après enrichissement par B2B/B2C)
"""

import os
import sys
import argparse
import pandas as pd
from pathlib import Path
from typing import Optional

# Ajouter le dossier parent au path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from toolbox.core.normalize import normalize_text, normalize_domain
from toolbox.core.dns_check import get_mx_hosts, has_mx_record
from toolbox.core.scoring import compute_confidence_score, should_include_lead

# Reconfigure stdout pour UTF-8
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')


def run_pre_osint(df: pd.DataFrame) -> pd.DataFrame:
    """
    Phase PRE-OSINT : nettoyage et normalisation.
    
    Génère les colonnes Clean_FirstName, Clean_LastName, Clean_Domain.
    Vérifie les enregistrements MX de chaque domaine.
    """
    # Identification dynamique des colonnes
    fn_col = next((c for c in ["firstName", "first_name", "prénom", "prenom"] if c in df.columns), None)
    ln_col = next((c for c in ["lastName", "last_name", "nom"] if c in df.columns), None)
    dom_col = next((c for c in ["companyDomain", "domain", "colonne domaine", "company_domain", "company"] if c in df.columns), None)

    if not fn_col or not ln_col or not dom_col:
        print("[!] Colonnes requises (prénom, nom, domaine) introuvables.")
        sys.exit(1)

    print("[*] Phase PRE-OSINT : Normalisation des données...")
    df["Clean_FirstName"] = df[fn_col].apply(normalize_text)
    df["Clean_LastName"] = df[ln_col].apply(normalize_text)
    df["Clean_Domain"] = df[dom_col].apply(normalize_domain)

    # Vérification MX (hors-ligne, pas de coût API)
    print("[*] Vérification des enregistrements MX des domaines...")
    unique_domains = df["Clean_Domain"].unique()
    mx_cache = {}
    for domain in unique_domains:
        if domain and domain not in mx_cache:
            mx_cache[domain] = has_mx_record(domain)
    
    df["Has_MX"] = df["Clean_Domain"].apply(lambda d: mx_cache.get(d, False))
    
    mx_valid = df["Has_MX"].sum()
    print(f"    {mx_valid}/{len(df)} domaines ont un enregistrement MX valide.")
    
    return df


def run_post_osint(df: pd.DataFrame, threshold: int = 50) -> pd.DataFrame:
    """
    Phase POST-OSINT : scoring et décision.
    
    Lit les colonnes Email_Source et Email_Status générées par le pipeline B2B,
    calcule le Confidence_Score final et prend la décision d'inclusion.
    """
    print("[*] Phase POST-OSINT : Calcul du Confidence_Score...")
    
    required_cols = ["Email_Source", "Email_Status"]
    for col in required_cols:
        if col not in df.columns:
            print(f"[!] Colonne '{col}' manquante. Lancez d'abord le pipeline B2B.")
            sys.exit(1)

    # Recalculer le score via le moteur Attio centralisé
    scores = []
    decisions = []
    
    for _, row in df.iterrows():
        source = str(row.get("Email_Source", "None"))
        status = str(row.get("Email_Status", "Not Found"))
        existing_score = row.get("Confidence_Score", None)
        
        if status == "Not Found" or source == "None":
            scores.append(0)
            decisions.append(False)
            continue
        
        score = compute_confidence_score(
            source=source,
            verifier_status=status,
            verifier_score=int(existing_score) if pd.notna(existing_score) else None,
        )
        include = should_include_lead(score, status, threshold=threshold)
        
        scores.append(score)
        decisions.append(include)

    df["Confidence_Score"] = scores
    df["Include_In_CRM"] = decisions

    included = sum(decisions)
    print(f"    {included}/{len(df)} leads qualifiés pour injection CRM (seuil: {threshold}).")
    
    return df


def run(input_path: str, output_path: str, config_path: Optional[str] = None,
        mode: str = "pre", threshold: int = 50):
    """Point d'entrée principal du pipeline CRM Hygiene."""

    if not os.path.exists(input_path):
        print(f"[!] Fichier d'entrée introuvable : {input_path}")
        sys.exit(1)

    print(f"[*] Lecture de la source : {input_path}")
    df = pd.read_csv(input_path)

    if mode == "pre":
        df = run_pre_osint(df)
    elif mode == "post":
        df = run_post_osint(df, threshold=threshold)
    elif mode == "full":
        # Mode complet : PRE + POST (si les colonnes OSINT sont présentes)
        df = run_pre_osint(df)
        if "Email_Source" in df.columns:
            df = run_post_osint(df, threshold=threshold)
    else:
        print(f"[!] Mode inconnu : {mode}. Utilisez 'pre', 'post' ou 'full'.")
        sys.exit(1)

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    df.to_csv(output_path, index=False, encoding="utf-8")
    print(f"[*] Pipeline Hygiene ({mode}) terminé ! Export : {output_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Pipeline CRM Hygiene (hors-ligne)")
    parser.add_argument("--input", required=True, help="CSV d'entrée")
    parser.add_argument("--output", required=True, help="CSV de sortie")
    parser.add_argument("--mode", default="pre", choices=["pre", "post", "full"],
                        help="Mode : 'pre' (nettoyage), 'post' (scoring), 'full' (les deux)")
    parser.add_argument("--threshold", type=int, default=50,
                        help="Seuil de Confidence_Score pour inclusion CRM (défaut: 50)")
    parser.add_argument("--config", default=None, help="Chemin custom du cascade_config.yaml")
    args = parser.parse_args()
    run(args.input, args.output, mode=args.mode, threshold=args.threshold)
