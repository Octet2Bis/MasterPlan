"""
cascade_runner.py — Moteur générique qui lit le cascade_config.yaml
et instancie dynamiquement les outils dans l'ordre défini.

Architecture 100% Gratuite / Freemium :
- Priorisation des tiers gratuits (Local, OSINT, Freemium).
- Bascule automatique dès qu'un quota mensuel gratuit est atteint (HTTP 402/403/429).
- Support du streaming et reprise sur incident (--resume) pour éviter de ré-exécuter
  des requêtes API gratuites déjà consommées.

Usage CLI :
  python -m pipelines.cascade_runner --pipeline b2b --input data.csv --output out.csv [--resume]
  python -m pipelines.cascade_runner --pipeline b2c --input emails.csv --output report.csv
"""

import os
import sys
import importlib
import yaml
from pathlib import Path
from typing import Optional

# Ajouter le dossier parent au path pour les imports toolbox/pipelines
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from toolbox.base_tool import (
    BaseFinder, BaseVerifier, BaseInvestigator,
    FinderResult, VerifierResult, InvestigatorResult,
    QuotaExceededError, ToolUnavailableError
)


def load_cascade_config(config_path: Optional[str] = None) -> dict:
    """Charge le fichier cascade_config.yaml."""
    if config_path is None:
        config_path = os.path.join(os.path.dirname(__file__), "cascade_config.yaml")
    
    with open(config_path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def instantiate_tools(tool_entries: list) -> list:
    """
    Instancie dynamiquement les outils depuis leurs définitions YAML.
    
    Chaque entrée doit avoir :
      - module: chemin d'import Python
      - class: nom de la classe
      - enabled: bool
      - tier: free | freemium | premium
    """
    tools = []
    for entry in tool_entries:
        if not entry.get("enabled", True):
            continue
        
        module_path = entry["module"]
        class_name = entry["class"]
        tier = entry.get("tier", "freemium")
        quota_info = entry.get("free_quota", "")
        
        try:
            mod = importlib.import_module(module_path)
            cls = getattr(mod, class_name)
            instance = cls()
            
            # Vérifier que l'outil est disponible (clé API configurée ou outil local sans clé)
            if instance.is_available():
                tools.append(instance)
                tier_badge = f"[{tier.upper()}]"
                quota_str = f" ({quota_info})" if quota_info else ""
                print(f"  [+] Outil activé : {class_name:22} {tier_badge:10} {quota_str}")
            else:
                print(f"  [~] {class_name:22} : Clé API manquante dans .env (Ignoré)")
        except (ImportError, AttributeError) as e:
            print(f"  [!] Impossible de charger {module_path}.{class_name}: {e}")
    
    return tools


def run_finder_cascade(
    finders: list[BaseFinder],
    verifiers: list[BaseVerifier],
    first_name: str,
    last_name: str,
    domain: str,
    linkedin_url: Optional[str] = None
) -> tuple[str, str, str, int]:
    """
    Exécute la cascade Finder → Verifier pour un prospect.
    
    Logique :
    1. Teste chaque Finder dans l'ordre du YAML (Free -> Freemium).
    2. En cas de QuotaExceeded (402, 403, 429), bascule immédiatement vers le suivant.
    3. Si un email est trouvé, le passe aux Verifiers.
    4. Dès qu'un email 'Valid*' est confirmé, arrête la cascade pour économiser les quotas.
    5. Si aucun 'Valid*', retourne le meilleur candidat (Catch-All > Risky).
    
    Retourne : (email, source, status, score)
    """
    import inspect

    candidate_email = ""
    candidate_source = "None"
    candidate_status = "Not Found"
    candidate_score = 0

    for finder in finders:
        try:
            sig = inspect.signature(finder.find)
            if "linkedin_url" in sig.parameters:
                result: FinderResult = finder.find(first_name, last_name, domain, linkedin_url=linkedin_url)
            else:
                result: FinderResult = finder.find(first_name, last_name, domain)
            
            if result.email:
                # Email trouvé → le passer aux Verifiers
                ver_status, ver_score = _verify_with_cascade(verifiers, result.email)
                
                if ver_status.startswith("Valid"):
                    # Email Valid certifié → On arrête immédiatement la cascade (0 requête supplémentaire)
                    return result.email, result.source, ver_status, ver_score

                elif ver_status in ("Catch-All", "Risky", "Not Verified"):
                    # Garder en candidat, continuer la cascade pour chercher un Valid
                    if not candidate_email:
                        candidate_email = result.email
                        candidate_source = result.source
                        candidate_status = ver_status
                        candidate_score = ver_score

        except QuotaExceededError as qe:
            print(f"  [~] {finder.name}: Quota gratuit mensuel atteint ou limitation ({qe}). Bascule...")
            continue
        except Exception as e:
            print(f"  [-] {finder.name}: Erreur ({e}). Bascule...")
            continue


    if candidate_email:
        return candidate_email, candidate_source, candidate_status, candidate_score
    return "", "None", "Not Found", 0


def _verify_with_cascade(
    verifiers: list[BaseVerifier],
    email: str
) -> tuple[str, int]:
    """
    Passe un email à la cascade de Verifiers freemium.
    Retourne (status, score) du premier Verifier qui donne un résultat concluant.
    """
    for verifier in verifiers:
        try:
            result: VerifierResult = verifier.verify(email)
            if result.status != "Not Verified":
                return result.status, result.score
        except QuotaExceededError:
            print(f"  [~] {verifier.name}: Quota gratuit atteint. Verifier suivant...")
            continue
        except Exception as e:
            print(f"  [~] {verifier.name}: Erreur ({e}). Verifier suivant...")
            continue
    
    # Aucun Verifier n'a pu conclure
    return "Not Verified", 50


def run_investigator_cascade(
    investigators: list[BaseInvestigator],
    email: str
) -> list[InvestigatorResult]:
    """
    Exécute les Investigators gratuits sur un email.
    Retourne la liste des résultats de chaque Investigator.
    """
    results = []
    for investigator in investigators:
        try:
            result = investigator.investigate(email)
            if result.findings:
                results.append(result)
                print(f"  [+] {investigator.name}: {len(result.findings)} findings (confiance: {result.confidence}%)")
            else:
                print(f"  [~] {investigator.name}: Aucun résultat.")
        except QuotaExceededError as qe:
            print(f"  [~] {investigator.name}: Quota gratuit atteint ({qe}). Investigator suivant...")
        except Exception as e:
            print(f"  [-] {investigator.name}: Erreur ({e}). Investigator suivant...")
    
    return results


# ============================================================
# Point d'entrée CLI
# ============================================================

def main():
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Moteur de cascade Antigravity — Architecture 100% Gratuite / Freemium."
    )
    parser.add_argument("--pipeline", required=True, choices=["b2b", "b2c", "hygiene"],
                        help="Pipeline à exécuter")
    parser.add_argument("--input", required=True, help="Chemin du fichier CSV d'entrée")
    parser.add_argument("--output", required=True, help="Chemin du fichier CSV de sortie")
    parser.add_argument("--config", default=None, help="Chemin custom du cascade_config.yaml")
    parser.add_argument("--resume", action="store_true", help="Reprend un fichier partiellement enrichi")
    args = parser.parse_args()

    # Router vers le bon pipeline
    if args.pipeline == "b2b":
        from pipelines.uc_b2b_enrichment.pipeline import run as run_pipeline
        run_pipeline(args.input, args.output, config_path=args.config, resume=args.resume)
    elif args.pipeline == "b2c":
        from pipelines.uc_b2c_investigation.pipeline import run as run_pipeline
        run_pipeline(args.input, args.output, config_path=args.config)
    elif args.pipeline == "hygiene":
        from pipelines.uc_crm_hygiene.pipeline import run as run_pipeline
        run_pipeline(args.input, args.output, config_path=args.config)


if __name__ == "__main__":
    main()
