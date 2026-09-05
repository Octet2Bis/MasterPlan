"""
neuro_acquisition_engine.py — Moteur d'Acquisition Neuro-Comportementale & Persuasion Éthique.
Pilier : 01_GTM_Growth / Toolbox / Core (< 150 lignes, Commandements #1 & #2).
"""

import sys
import json
from pathlib import Path
from typing import Dict, List

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

DATA_PATH = Path(__file__).parent / "data" / "neuro_levers.json"

def load_neuro_levers() -> Dict:
    try:
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}

NEURO_LEVERS_METADATA = load_neuro_levers()


def generate_neuro_acquisition_variant(
    lever_code: str,
    target_persona: str,
    problem_statement: str,
    offer_summary: str,
    proof_metric: str,
    free_resource: str
) -> Dict:
    """
    Génère une proposition d'acquisition labellisée pour un levier psychologique donné.
    """
    meta = NEURO_LEVERS_METADATA.get(lever_code, {
        "name": "Levier Standard",
        "author": "Marketing Direct",
        "mechanism": "Argumentation rationnelle standard."
    })
    
    templates = {
        "PSY-LOSS-AVERSION": {
            "subject": f"Le coût invisible sur {problem_statement} chez vos pairs",
            "body": (
                f"Bonjour,\n\n"
                f"En analysant les opérations de plusieurs {target_persona}s cette semaine, un angle mort revient systématiquement : "
                f"l'inaction sur {problem_statement} engendre en moyenne 15% à 25% de déperdition de marge non détectée.\n\n"
                f"Notre approche ({offer_summary}) a permis de sécuriser {proof_metric} dès le premier trimestre.\n\n"
                f"Seriez-vous opposé à jeter un œil au calcul d'impact pour vérifier si votre équipe est exposée ?"
            ),
            "headline": f"Arrêtez de perdre du budget sur {problem_statement}.",
            "subheadline": f"Identifiez vos fuites de conversion en 60 secondes grâce à {offer_summary} ({proof_metric}).",
            "cta": "Calculer mon coût d'inaction"
        },
        "PSY-RECIPROCITY": {
            "subject": f"{free_resource} (accès direct pour votre équipe)",
            "body": (
                f"Bonjour,\n\n"
                f"Nous venons de finaliser {free_resource}, synthétisant les données de référence sur {problem_statement} pour les {target_persona}s.\n\n"
                f"Je vous le transmets ci-joint sans aucun engagement ni formulaire.\n\n"
                f"Si vous souhaitez que l'on applique la même rigueur à vos chiffres via {offer_summary}, faites-moi signe."
            ),
            "headline": f"{free_resource} : Téléchargement libre et immédiat.",
            "subheadline": f"Le benchmark opérationnel pour {target_persona}s cherchant à optimiser {problem_statement}.",
            "cta": f"Télécharger {free_resource}"
        },
        "PSY-SOCIAL-PROOF": {
            "subject": f"Comment d'autres {target_persona}s résolvent {problem_statement}",
            "body": (
                f"Bonjour,\n\n"
                f"Plusieurs organisations comparables à la vôtre ont récemment revu leur approche de {problem_statement}.\n\n"
                f"En déployant {offer_summary}, elles ont atteint {proof_metric} sans perturber leurs flux existants.\n\n"
                f"Est-ce un chantier ouvert chez vous ce trimestre ?"
            ),
            "headline": f"La méthode adoptée par les {target_persona}s pour maîtriser {problem_statement}.",
            "subheadline": f"Rejoignez les équipes qui atteignent {proof_metric} grâce à {offer_summary}.",
            "cta": "Voir les cas d'usage pairs"
        },
        "PSY-AUTHORITY-DATA": {
            "subject": f"{proof_metric} : benchmark chiffré sur {problem_statement}",
            "body": (
                f"Bonjour,\n\n"
                f"Une étude menée sur un échantillon représentatif de {target_persona}s montre que {offer_summary} délivre très exactement {proof_metric} sur {problem_statement}.\n\n"
                f"Les méthodologies classiques plafonnent généralement à des ratios bien inférieurs.\n\n"
                f"Souhaitez-vous recevoir la ventilation méthodologique complète ?"
            ),
            "headline": f"{proof_metric} mesurés sur {problem_statement}.",
            "subheadline": f"La seule solution d'ingénierie {offer_summary} avec preuves déterministes.",
            "cta": "Consulter les données de l'étude"
        },
        "PSY-MICRO-COMMITMENT": {
            "subject": f"Question rapide sur {problem_statement}",
            "body": (
                f"Bonjour,\n\n"
                f"Est-ce que {problem_statement} fait partie de vos priorités opérationnelles actuelles en tant que {target_persona} ?\n\n"
                f"Si oui, nous avons documenté comment atteindre {proof_metric} via {offer_summary}.\n\n"
                f"Un simple 'oui' par retour d'email suffit pour que je vous transmette la fiche de synthèse."
            ),
            "headline": f"Optimisez {problem_statement} étape par étape.",
            "subheadline": f"Commencez par un diagnostic gratuit de 2 minutes avec {offer_summary}.",
            "cta": "Lancer le diagnostic 2 min"
        },
        "PSY-FRAMING-CONTRAST": {
            "subject": f"1 audit {offer_summary} vs 3 mois de perte sur {problem_statement}",
            "body": (
                f"Bonjour,\n\n"
                f"Subir les frictions de {problem_statement} coûte généralement l'équivalent d'un poste senior à temps plein sur une année.\n\n"
                f"À l'inverse, déployer {offer_summary} représente une fraction dérisoire de ce coût pour un résultat certifié à {proof_metric}.\n\n"
                f"Seriez-vous ouvert à comparer les deux trajectoires sur vos chiffres ?"
            ),
            "headline": f"Pourquoi continuer à payer le prix fort pour {problem_statement} ?",
            "subheadline": f"Divisez vos coûts opérationnels grâce à {offer_summary} ({proof_metric}).",
            "cta": "Comparer les coûts"
        },
        "PSY-CURIOSITY-GAP": {
            "subject": f"L'anomalie souvent ignorée sur {problem_statement}",
            "body": (
                f"Bonjour,\n\n"
                f"En observant les protocoles habituels sur {problem_statement}, nous avons identifié une anomalie structurelle que 80% des {target_persona}s ne mesurent jamais.\n\n"
                f"Cette faille explique pourquoi les performances stagnent, même avec les meilleurs outils.\n\n"
                f"Voulez-vous que je vous partage le schéma explicatif ?"
            ),
            "headline": f"L'angle mort de {problem_statement} que vos outils ne vous montrent pas.",
            "subheadline": f"Découvrez comment {offer_summary} résout cette faille pour garantir {proof_metric}.",
            "cta": "Révéler l'angle mort"
        }
    }
    
    t = templates.get(lever_code, templates["PSY-LOSS-AVERSION"])
    
    return {
        "lever_code": lever_code,
        "lever_name": meta.get("name"),
        "author_reference": meta.get("author"),
        "cognitive_mechanism": meta.get("mechanism"),
        "cold_email": {
            "subject": t["subject"],
            "body": t["body"],
            "cta_question": t["body"].split("\n\n")[-1]
        },
        "landing_page_hero": {
            "headline": t["headline"],
            "subheadline": t["subheadline"],
            "cta_button": t["cta"]
        }
    }


def generate_all_neuro_angles(
    target_persona: str,
    problem_statement: str,
    offer_summary: str,
    proof_metric: str,
    free_resource: str
) -> List[Dict]:
    """Génère l'ensemble des 7 variantes labellisées pour une offre et une cible."""
    results = []
    for code in NEURO_LEVERS_METADATA.keys():
        variant = generate_neuro_acquisition_variant(
            lever_code=code,
            target_persona=target_persona,
            problem_statement=problem_statement,
            offer_summary=offer_summary,
            proof_metric=proof_metric,
            free_resource=free_resource
        )
        results.append(variant)
    return results
