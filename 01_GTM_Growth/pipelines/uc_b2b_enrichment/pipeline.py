"""
pipeline.py — UC_B2B_Enrichment (Génération de Leads Outbound 100% Free / Freemium)

Ce pipeline utilise la méthode de la cascade (Waterfall) pour maximiser
le taux de découverte tout en consommant 0€ d'API payante.

Optimisations Gratuites Clés :
1. Pré-filtrage DNS/MX local : arrêt immédiat sur domaine invalide/sans MX (0 requête API consommée).
2. Permutateur local gratuit + cascade d'outils freemium / OSINT.
3. Écriture en streaming (flush temps réel) pour zéro perte de données.
4. Checkpointing / Reprise automatique (--resume).
"""

import os
import sys
import time
import random
import argparse
import pandas as pd
from pathlib import Path
from typing import Optional, Dict

# Ajouter le dossier parent au path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from toolbox.core.normalize import normalize_text, normalize_domain
from toolbox.core.scoring import compute_confidence_score
from toolbox.core.dns_check import has_mx_record
from pipelines.cascade_runner import (
    load_cascade_config,
    instantiate_tools,
    run_finder_cascade,
)

# Reconfigure stdout pour UTF-8
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')


# Cache mémoire pour éviter les résolutions DNS redondantes sur un même domaine
_MX_CACHE: Dict[str, bool] = {}


def check_domain_mx_cached(domain: str) -> bool:
    """Vérifie si un domaine possède des serveurs MX avec mise en cache mémoire."""
    if not domain:
        return False
    if domain not in _MX_CACHE:
        _MX_CACHE[domain] = has_mx_record(domain)
    return _MX_CACHE[domain]


def run(input_path: str, output_path: str, config_path: Optional[str] = None, resume: bool = False):
    """Point d'entrée principal du pipeline B2B."""
    
    # Charger les variables d'environnement
    from dotenv import load_dotenv
    load_dotenv("/app/data/.env")
    load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".secrets", ".env"))
    load_dotenv()

    print("=" * 65)
    print("🚀 PIPELINE B2B ENRICHMENT (CASCADE WATERFALL 100% FREEMIUM)")
    print("=" * 65)

    # ─── 1. Charger la configuration de cascade ───
    config = load_cascade_config(config_path)
    b2b_config = config.get("uc_b2b_enrichment", {})
    
    finder_entries = b2b_config.get("finders", [])
    verifier_entries = b2b_config.get("verifiers", [])
    
    print("[*] Instanciation des briques actives depuis cascade_config.yaml :")
    finders = instantiate_tools(finder_entries)
    verifiers = instantiate_tools(verifier_entries)
    
    if not finders:
        print("[!] Aucun Finder disponible. Vérifiez vos configurations.")
        sys.exit(1)

    # ─── 2. Charger et normaliser les données ───
    if not os.path.exists(input_path):
        print(f"[!] Fichier d'entrée introuvable : {input_path}")
        sys.exit(1)

    print(f"\n[*] Lecture du fichier source : {input_path}")
    df = pd.read_csv(input_path)

    # Identification dynamique des colonnes
    fn_col = next((c for c in ["firstName", "first_name", "prénom", "prenom"] if c in df.columns), None)
    ln_col = next((c for c in ["lastName", "last_name", "nom"] if c in df.columns), None)
    dom_col = next((c for c in ["companyDomain", "domain", "colonne domaine", "company_domain", "company"] if c in df.columns), None)

    if not fn_col or not ln_col or not dom_col:
        print("[!] Colonnes requises (prénom, nom, domaine) introuvables dans le CSV.")
    company_col = next((c for c in ["companyName", "company_name", "entreprise", "societe", "company"] if c in df.columns), None)
    li_col = next((c for c in ["linkedinUrl", "linkedin_url", "linkedin", "profile_url"] if c in df.columns), None)

    print("[*] Normalisation des données d'entrée...")

    df["Clean_FirstName"] = df[fn_col].apply(normalize_text)
    df["Clean_LastName"] = df[ln_col].apply(normalize_text)
    if company_col:
        df["Clean_Domain"] = df.apply(lambda r: normalize_domain(r[dom_col], r.get(company_col)), axis=1)
    else:
        df["Clean_Domain"] = df[dom_col].apply(normalize_domain)


    # Initialisation des colonnes de sortie
    if "Email_Found" not in df.columns:
        df["Email_Found"] = ""
    if "Email_Source" not in df.columns:
        df["Email_Source"] = "None"
    if "Email_Status" not in df.columns:
        df["Email_Status"] = "Pending"
    if "Confidence_Score" not in df.columns:
        df["Confidence_Score"] = 0

    # ─── 3. Gestion du Checkpointing / Reprise (--resume) ───
    start_index = 0
    if resume and os.path.exists(output_path):
        try:
            existing_df = pd.read_csv(output_path)
            already_done = len(existing_df[existing_df["Email_Status"] != "Pending"])
            if already_done > 0 and already_done < len(df):
                print(f"[+] Mode Reprise actif : {already_done} lignes déjà traitées. Reprise à l'index {already_done}...")
                df.update(existing_df)
                start_index = already_done
        except Exception as e:
            print(f"[~] Impossible de charger l'état existant pour reprise ({e}). Traitement complet.")

    total = len(df)
    print(f"\n[*] Lancement du traitement : {total - start_index} prospects à enrichir (Total : {total})...\n")

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)

    # ─── 4. Exécuter la cascade avec pré-filtrage DNS et streaming ───
    for i in range(start_index, total):
        row = df.iloc[i]
        first = row["Clean_FirstName"]
        last = row["Clean_LastName"]
        dom = row["Clean_Domain"]

        print(f"[{i+1}/{total}] Prospect : {row.get(fn_col, '')} {row.get(ln_col, '')} ({dom})")

        # ─── A. Pré-check DNS/MX local gratuit ───
        if not dom:
            print("  [-] Domaine vide. Ignoré.")
            df.at[i, "Email_Found"] = ""
            df.at[i, "Email_Source"] = "Validation_Locale"
            df.at[i, "Email_Status"] = "Empty_Domain"
            df.at[i, "Confidence_Score"] = 0
            df.to_csv(output_path, index=False, encoding="utf-8")
            continue

        has_mx = check_domain_mx_cached(dom)
        if not has_mx:
            print(f"  [~] Pré-check DNS : Aucun serveur MX pour '{dom}' (Domaine inactif/mort).")
            print("      ➔ 0 requête API consommée (Économie de quota gratuit).")
            df.at[i, "Email_Found"] = ""
            df.at[i, "Email_Source"] = "DNS_PreCheck"
            df.at[i, "Email_Status"] = "No_MX_Record"
            df.at[i, "Confidence_Score"] = 0
            df.to_csv(output_path, index=False, encoding="utf-8")
            continue

        # ─── B. Cascade Finders ➔ Verifiers ───
        linkedin_val = str(row.get(li_col, "")) if li_col else None
        email, source, status, ver_score = run_finder_cascade(
            finders, verifiers, first, last, dom, linkedin_url=linkedin_val
        )


        if email:
            # Bonus de consensus si plusieurs prospects partagent le même domaine corporate
            domain_count = (df["Clean_Domain"] == dom).sum()
            consensus_bonus = 12 if domain_count >= 3 else (6 if domain_count == 2 else 0)

            final_score = compute_confidence_score(
                source=source,
                verifier_status=status,
                verifier_score=ver_score,
                domain_consensus_bonus=consensus_bonus,
            )
            bonus_tag = f" (+{consensus_bonus} bonus consensus)" if consensus_bonus > 0 else ""
            print(f"  [+] Trouvé : {email} | Source : {source} | Statut : {status} | Score : {final_score}/100{bonus_tag}")
        else:
            final_score = 0
            print("  [-] Aucun email trouvé via la cascade freemium.")


        df.at[i, "Email_Found"] = email
        df.at[i, "Email_Source"] = source
        df.at[i, "Email_Status"] = status
        df.at[i, "Confidence_Score"] = final_score

        # Streaming : sauvegarde immédiate sur disque à chaque ligne
        df.to_csv(output_path, index=False, encoding="utf-8")

        # Pause de courtoisie pour préserver les rate-limits gratuits
        time.sleep(random.uniform(0.3, 0.8))

    # ─── 5. Rapport final ───
    found_count = (df["Email_Found"].str.len() > 0).sum()
    valid_count = (df["Email_Status"] == "Valid").sum()
    no_mx_count = (df["Email_Status"] == "No_MX_Record").sum()

    print("\n" + "=" * 65)
    print("📊 BILAN D'ENRICHISSEMENT B2B (100% FREEMIUM) :")
    print(f"  - Prospects traités          : {total}")
    print(f"  - Emails découverts          : {found_count} ({found_count/total*100:.1f}%)")
    print(f"  - Emails certifiés Valid     : {valid_count}")
    print(f"  - Domaines morts sans MX     : {no_mx_count} (Économie de {no_mx_count} requêtes API)")
    print(f"  - Fichier de sortie généré   : {output_path}")
    print("=" * 65)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Pipeline B2B Enrichment (Waterfall 100% Freemium)")
    parser.add_argument("--input", required=True, help="CSV d'entrée")
    parser.add_argument("--output", required=True, help="CSV de sortie")
    parser.add_argument("--config", default=None, help="Chemin custom du cascade_config.yaml")
    parser.add_argument("--resume", action="store_true", help="Reprend un enrichissement interrompu")
    args = parser.parse_args()
    run(args.input, args.output, args.config, resume=args.resume)
