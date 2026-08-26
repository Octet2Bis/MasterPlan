"""
neuro_acquisition_engine.py — Moteur d'Acquisition Neuro-Comportementale & Persuasion Éthique (Zéro Dépendance).

Génère des propositions et variantes d'acquisition (Cold Email, Landing Page Hero, Ad Copy)
explicitement labellisées selon les 7 grands leviers de neurosciences et d'économie comportementale :
1. [PSY-LOSS-AVERSION] : Aversion à la perte & Coût de l'inaction (Kahneman)
2. [PSY-RECIPROCITY] : Réciprocité asymétrique & Valeur d'abord (Cialdini)
3. [PSY-SOCIAL-PROOF] : Preuve sociale de pairs & Mimétisme (Thaler / Cialdini)
4. [PSY-AUTHORITY-DATA] : Autorité par la spécificité & Preuve chiffrée (Fogg / Cialdini)
5. [PSY-MICRO-COMMITMENT] : Pied dans la porte & CTA non-agressif (Voss / Cialdini)
6. [PSY-FRAMING-CONTRAST] : Cadrage & Ancrage financier (Kahneman / Tversky)
7. [PSY-CURIOSITY-GAP] : Trou informationnel & Détection d'anomalie (Loewenstein)
"""

import sys
from typing import Dict, List

# Encodage UTF-8 sous Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass


NEURO_LEVERS_METADATA = {
    "PSY-LOSS-AVERSION": {
        "name": "Aversion à la Perte & Coût de l'Inaction",
        "author": "Daniel Kahneman & Amos Tversky (Système 1 / Prospect Theory)",
        "mechanism": (
            "Le cerveau humain ressent 2 à 2.5 fois plus intensément la douleur d'une perte que le plaisir d'un gain équivalent. "
            "Le message chiffre explicitement ce que l'inaction ou le statu quo fait perdre chaque mois à l'entreprise."
        )
    },
    "PSY-RECIPROCITY": {
        "name": "Réciprocité Asymétrique (Value-First)",
        "author": "Robert Cialdini (Principes d'Influence)",
        "mechanism": (
            "Offrir une ressource à haute valeur perçue (mini-audit, benchmark, modèle) immédiatement et sans contrepartie "
            "déclenche un réflexe neuro-psychologique d'obligation morale et d'écoute bienveillante."
        )
    },
    "PSY-SOCIAL-PROOF": {
        "name": "Preuve Sociale de Pairs (Bandwagon & Nudge)",
        "author": "Robert Cialdini & Richard Thaler",
        "mechanism": (
            "Face à l'incertitude, le cerveau économise de l'énergie cognitive en observant le comportement de ses pairs directs. "
            "Citer des entreprises comparables réduit l'anxiété du risque d'achat."
        )
    },
    "PSY-AUTHORITY-DATA": {
        "name": "Autorité par la Spécificité Chiffrée",
        "author": "B.J. Fogg & Robert Cialdini",
        "mechanism": (
            "Le cerveau rejette instinctivement les superlatifs vagues ('leader', 'meilleur'). "
            "Les chiffres précis et non arrondis (ex: '98.4%') activent le cortex analytique et inspirent une crédibilité maximale."
        )
    },
    "PSY-MICRO-COMMITMENT": {
        "name": "Micro-Engagement & Validation Binaire (Foot-in-the-Door)",
        "author": "Chris Voss & Robert Cialdini",
        "mechanism": (
            "Remplacer les demandes à forte friction ('prenons 30 min en visio') par une question à réponse binaire et sans risque "
            "oriente le prospect vers une micro-validation, créant un biais de cohérence pour l'étape suivante."
        )
    },
    "PSY-FRAMING-CONTRAST": {
        "name": "Effet de Cadrage & Ancrage Financier",
        "author": "Daniel Kahneman (Système 2 / Framing Effect)",
        "mechanism": (
            "La perception de valeur dépend du point de référence. Comparer le coût de la solution au coût d'un problème récurrent "
            "(ex: un recrutement raté ou un mois de churn) fait paraître l'offre dérisoire."
        )
    },
    "PSY-CURIOSITY-GAP": {
        "name": "Trou Informationnel & Détection d'Angle Mort",
        "author": "George Loewenstein",
        "mechanism": (
            "Mettre en lumière une disparité entre ce que le prospect sait et ce qu'il devrait savoir crée un inconfort cognitif "
            "que le cerveau cherche immédiatement à combler en lisant la suite."
        )
    }
}


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
    
    # Formulations calibrées selon le levier
    if lever_code == "PSY-LOSS-AVERSION":
        subject = f"Le coût invisible du statu quo sur {problem_statement}"
        body = (
            f"Bonjour {target_persona},\n\n"
            f"En ce moment, l'absence d'optimisation sur {problem_statement} représente une perte directe estimée à {proof_metric} par trimestre. "
            f"{offer_summary} permet de colmater cette fuite dès la première semaine sans bouleverser vos équipes.\n\n"
            f"Seriez-vous ouvert à ce que je vous montre d'où provient cette déperdition ?"
        )
        headline = f"Arrêtez de perdre {proof_metric} chaque mois sur {problem_statement}"
        subheadline = f"Découvrez comment {offer_summary} sécurise vos résultats sans friction."
        cta = "Calculer ma déperdition estimée"
        
    elif lever_code == "PSY-RECIPROCITY":
        subject = f"Audit offert : 3 opportunités repérées sur {problem_statement}"
        body = (
            f"Bonjour {target_persona},\n\n"
            f"J'ai pris quelques minutes pour analyser {problem_statement} dans votre secteur et j'ai préparé {free_resource}. "
            f"Vous y trouverez 3 actions concrètes activables immédiatement sans aucun engagement.\n\n"
            f"Voulez-vous que je vous dépose le lien ici ?"
        )
        headline = f"Votre diagnostic offert : {free_resource}"
        subheadline = f"Identifiez immédiatement vos 3 leviers de croissance sur {problem_statement}."
        cta = f"Recevoir {free_resource} (0€)"
        
    elif lever_code == "PSY-SOCIAL-PROOF":
        subject = f"Comment vos pairs optimisent {problem_statement}"
        body = (
            f"Bonjour {target_persona},\n\n"
            f"Plusieurs équipes comparables à la vôtre ont récemment revu leur approche de {problem_statement}, "
            f"obtenant un gain mesuré de {proof_metric} grâce à {offer_summary}.\n\n"
            f"Est-ce un sujet sur lequel vous échangez en ce moment avec vos équipes ?"
        )
        headline = f"Rejoignez les équipes qui maîtrisent {problem_statement}"
        subheadline = f"Découvrez les méthodes ayant permis d'atteindre {proof_metric} de performance."
        cta = "Voir les cas concrets de nos pairs"
        
    elif lever_code == "PSY-AUTHORITY-DATA":
        subject = f"Chiffres réels : {proof_metric} d'efficacité sur {problem_statement}"
        body = (
            f"Bonjour {target_persona},\n\n"
            f"Les tests documentés sur {problem_statement} démontrent un résultat précis : {proof_metric} d'amélioration mesurée. "
            f"Pas de promesses théoriques, uniquement des données vérifiables via {offer_summary}.\n\n"
            f"Seriez-vous curieux de voir la décomposition méthodologique ?"
        )
        headline = f"Des résultats prouvés : {proof_metric} sur {problem_statement}"
        subheadline = f"Une méthodologie rigoureuse et testée pour transformer votre approche de {problem_statement}."
        cta = "Accéder aux données de validation"
        
    elif lever_code == "PSY-MICRO-COMMITMENT":
        subject = f"Question rapide sur {problem_statement}"
        body = (
            f"Bonjour {target_persona},\n\n"
            f"Nous avons conçu {free_resource} pour résoudre {problem_statement} en moins de 10 minutes. "
            f"Aucune inscription requise, c'est disponible directement.\n\n"
            f"Seriez-vous contre le fait que je vous envoie l'accès en 1 clic ?"
        )
        headline = f"Résolvez {problem_statement} en 10 minutes chrono"
        subheadline = f"Accédez gratuitement à {free_resource} sans créer de compte."
        cta = "Tester en 1 clic (Accès libre)"
        
    elif lever_code == "PSY-FRAMING-CONTRAST":
        subject = f"Pourquoi {problem_statement} coûte plus cher qu'un mauvais recrutement"
        body = (
            f"Bonjour {target_persona},\n\n"
            f"Résoudre {problem_statement} en interne mobilise en moyenne 3 mois de temps d'ingénierie et des milliers d'euros. "
            f"En comparaison, {offer_summary} déploie la même capacité en 48 heures pour une fraction de ce coût ({proof_metric}).\n\n"
            f"Seriez-vous ouvert à une comparaison chiffrée de 2 minutes ?"
        )
        headline = f"Divisez par 4 le coût de traitement de {problem_statement}"
        subheadline = f"Pourquoi mobiliser des mois d'efforts internes quand {offer_summary} livre le résultat en 48h ?"
        cta = "Comparer les coûts en 2 min"
        
    elif lever_code == "PSY-CURIOSITY-GAP":
        subject = f"Une anomalie fréquente sur {problem_statement}"
        body = (
            f"Bonjour {target_persona},\n\n"
            f"En analysant les infrastructures sur {problem_statement}, nous constatons que 7 équipes sur 10 ignorent un angle mort critique "
            f"qui dégrade leurs résultats de {proof_metric}. {free_resource} détaille comment le détecter en 3 clics.\n\n"
            f"Voulez-vous vérifier si votre organisation est concernée ?"
        )
        headline = f"L'angle mort méconnu sur {problem_statement}"
        subheadline = f"Découvrez si votre infrastructure est concernée par cette anomalie et comment la corriger."
        cta = "Découvrir l'angle mort"
        
    else:
        subject = f"Optimisation de {problem_statement}"
        body = f"Bonjour {target_persona},\n\nVoici comment améliorer {problem_statement} avec {offer_summary}.\n\nIntéressé ?"
        headline = f"Améliorez {problem_statement}"
        subheadline = f"Découvrez {offer_summary} dès aujourd'hui."
        cta = "En savoir plus"

    return {
        "label": f"[{lever_code}]",
        "lever_name": meta["name"],
        "author_reference": meta["author"],
        "cognitive_mechanism": meta["mechanism"],
        "cold_email": {
            "subject": subject,
            "body": body,
            "cta_question": body.split("\n\n")[-1]
        },
        "landing_page_hero": {
            "headline": headline,
            "subheadline": subheadline,
            "cta_button": cta
        }
    }


def generate_all_neuro_angles(
    target_persona: str,
    problem_statement: str,
    offer_summary: str,
    proof_metric: str,
    free_resource: str
) -> List[Dict]:
    """
    Génère l'ensemble des 7 variantes labellisées pour une offre et une cible.
    """
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


if __name__ == "__main__":
    print("=== TEST DU MOTEUR D'ACQUISITION NEURO-COMPORTEMENTALE ===")
    angles = generate_all_neuro_angles(
        target_persona="Directeur Marketing B2B",
        problem_statement="la délivrabilité et l'enrichissement des emails de prospection",
        offer_summary="notre cascade de vérification SSO M365 & MX",
        proof_metric="98.4% de délivrabilité certifiée",
        free_resource="le Baromètre de Délivrabilité des Grandes Marques"
    )
    
    for a in angles[:2]:  # Afficher les 2 premiers pour démo
        print(f"\n🏷️  {a['label']} : {a['lever_name']}")
        print(f"📚 Réf : {a['author_reference']}")
        print(f"🧠 Mécanisme : {a['cognitive_mechanism']}")
        print(f"📧 Email Subject : {a['cold_email']['subject']}")
        print(f"💬 Email CTA : {a['cold_email']['cta_question']}")
        print(f"🌐 Landing Hero : {a['landing_page_hero']['headline']}")
        print("-" * 65)
