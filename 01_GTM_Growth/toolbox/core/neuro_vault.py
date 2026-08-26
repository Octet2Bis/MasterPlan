"""
neuro_vault.py — Moteur Interactif de Recherche & Recommandation de Leviers Neuro-Cognitifs (Zéro Dépendance).

Permet de requêter la base de connaissances en neurosciences appliquées au marketing :
- Recherche de biais cognitifs par situation (ex: "objection prix", "manque de confiance", "landing page hero")
- Profilage DISC instantané par rôle (ex: "CTO", "CEO", "CMO", "DRH")
- Génération d'accroches de copywriting neuro-calibrées
"""

import argparse
import sys
from typing import Dict, List

# Encodage UTF-8 sous Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass


COGNITIVE_BIASES_VAULT = [
    {
        "id": "anchoring",
        "name": "Effet d'Ancrage (Anchoring)",
        "author": "Kahneman & Tversky",
        "keywords": ["prix", "cher", "budget", "pricing", "valeur", "négociation"],
        "mechanism": "Le premier chiffre vu sert de référence absolue pour évaluer la suite.",
        "application": "Annoncer le coût astronomique de l'alternative avant d'annoncer votre tarif.",
        "example_hook": "Un audit externe facture 3 500€. Obtenez le même diagnostic pour 49€."
    },
    {
        "id": "loss_aversion",
        "name": "Aversion à la Perte & Coût de l'Inaction",
        "author": "Daniel Kahneman (Prospect Theory)",
        "keywords": ["statu quo", "inaction", "perte", "fuite", "retard", "urgence", "churn"],
        "mechanism": "La douleur d'une perte est ressentie 2x plus intensément que la joie d'un gain équivalent.",
        "application": "Chiffrer ce que l'entreprise perd chaque mois en ne changeant rien.",
        "example_hook": "En ce moment, 14% de vos leads B2B sont perdus à cause d'une mauvaise configuration DNS."
    },
    {
        "id": "reciprocity",
        "name": "Réciprocité Asymétrique (Value-First)",
        "author": "Robert Cialdini",
        "keywords": ["don", "gratuit", "audit", "lead magnet", "ressource", "premier contact"],
        "mechanism": "Recevoir une valeur tangible sans contrepartie déclenche une obligation morale d'écoute.",
        "application": "Donner un mini-audit ou template personnalisé avant de formuler une demande.",
        "example_hook": "J'ai audité votre infrastructure et j'ai préparé ce rapport sans rien à payer."
    },
    {
        "id": "social_proof",
        "name": "Preuve Sociale de Pairs (Bandwagon)",
        "author": "Cialdini & Thaler",
        "keywords": ["confiance", "doute", "peur", "nouveau", "sécurité", "référence"],
        "mechanism": "Le cerveau imite le comportement de ses pairs pour réduire l'anxiété du risque.",
        "application": "Citer des entreprises comparables de même taille et même secteur.",
        "example_hook": "Déjà adopté par plus de 450 équipes RevOps et Growth en France."
    },
    {
        "id": "micro_commitment",
        "name": "Micro-Engagement & Pied dans la Porte",
        "author": "Chris Voss & Cialdini",
        "keywords": ["cta", "friction", "call", "rendez-vous", "réponse", "conversion"],
        "mechanism": "Une micro-validation binaire sans friction engage le biais de cohérence.",
        "application": "Poser une question fermée orientée sur le refus plutôt que de demander un call.",
        "example_hook": "Seriez-vous contre le fait que je vous partage le document en 1 clic ?"
    },
    {
        "id": "curiosity_gap",
        "name": "Trou Informationnel de Loewenstein",
        "author": "George Loewenstein",
        "keywords": ["accroche", "clic", "ouverture", "angle mort", "mystère", "email subject"],
        "mechanism": "Le cerveau ressent un inconfort face à une lacune de savoir qu'il cherche à combler.",
        "application": "Révéler l'existence d'une anomalie invisible sans donner la solution immédiatement.",
        "example_hook": "L'angle mort méconnu qui dégrade la délivrabilité de 7 boîtes sur 10."
    },
    {
        "id": "zeigarnik",
        "name": "Effet Zeigarnik (Tension d'Inachèvement)",
        "author": "Bluma Zeigarnik",
        "keywords": ["onboarding", "activation", "progression", "étape", "formulaire"],
        "mechanism": "Une tâche inachevée reste active dans la mémoire de travail et pousse à sa complétion.",
        "application": "Indiquer une barre de progression déjà entamée (ex: 75% complété).",
        "example_hook": "Votre espace est configuré à 80% — plus qu'un clic pour finaliser."
    },
    {
        "id": "decoy_effect",
        "name": "Effet Leurre (Decoy Effect)",
        "author": "Dan Ariely",
        "keywords": ["pricing", "grille", "tarifs", "choix", "abonnement", "upsell"],
        "mechanism": "Une option intermédiaire asymétrique fait paraître l'offre cible irrésistible.",
        "application": "Créer une offre intermédiaire proche en prix de la version Pro mais avec moins de valeur.",
        "example_hook": "Offre Standard: 40€ | Offre Pro (avec support 24/7): 49€ (90% choisissent Pro)."
    }
]

DISC_ROLES_MAP = {
    "dominant": {
        "profile": "[D] DOMINANT",
        "typical_roles": ["CEO", "Fondateur", "Directeur Général", "VP Sales", "Directeur Commercial"],
        "psychological_drivers": "Vitesse, Résultats nets, ROI, Autonomie, Contrôle.",
        "communication_style": "Ultra-court (3 phrases max), direct, axé sur les résultats chiffrés. Zéro fioriture.",
        "forbidden_phrases": ["J'espère que vous allez bien", "Prenez le temps d'explorer", "Dans un monde en constante évolution"]
    },
    "conscientious": {
        "profile": "[C] CONSCIENTIEUX",
        "typical_roles": ["CTO", "Tech Lead", "Data Lead", "DAF", "Directeur Financier", "Développeur"],
        "psychological_drivers": "Données exactes, Méthodologie, Rigueur, Absence d'erreurs, Preuves.",
        "communication_style": "Structuré, chiffres précis, bullet points, sources et architecture vérifiables.",
        "forbidden_phrases": ["Solution magique", "Révolutionnaire", "Simple et sans effort"]
    },
    "influential": {
        "profile": "[I] INFLUENT",
        "typical_roles": ["CMO", "Directeur Marketing", "Head of Brand", "Responsable Communication"],
        "psychological_drivers": "Vision, Reconnaissance, Visibilité, Innovation, Réseau.",
        "communication_style": "Enthousiaste, vision inspirante, preuves sociales et logos prestigieux.",
        "forbidden_phrases": ["Détails techniques austères", "Processus rigide obligatoire"]
    },
    "steady": {
        "profile": "[S] STABLE",
        "typical_roles": ["DRH", "Head of People", "CSM Lead", "Responsable Support", "Operations"],
        "psychological_drivers": "Sécurité, Calme, Simplicité d'intégration, Accompagnement humain.",
        "communication_style": "Rassurant, bienveillant, orienté assistance pas-à-pas et réversibilité.",
        "forbidden_phrases": ["Rupture brutale", "Urgence absolue", "Dernière chance avant fermeture"]
    }
}


def search_neuro_vault(query: str) -> List[Dict]:
    """
    Recherche les biais cognitifs pertinents pour une situation ou un mot-clé.
    """
    q = query.lower()
    matches = []
    for b in COGNITIVE_BIASES_VAULT:
        score = 0
        if q in b["name"].lower() or q in b["id"]:
            score += 10
        for kw in b["keywords"]:
            if kw in q or q in kw:
                score += 5
        if score > 0:
            matches.append((score, b))
            
    matches.sort(key=lambda x: x[0], reverse=True)
    return [m[1] for m in matches] if matches else COGNITIVE_BIASES_VAULT[:3]


def get_disc_guidelines(role: str) -> Dict:
    """
    Retourne les recommandations psychologiques selon le poste du prospect.
    """
    r_lower = role.lower()
    for key, data in DISC_ROLES_MAP.items():
        if any(tr.lower() in r_lower for tr in data["typical_roles"]) or key in r_lower:
            return data
    return DISC_ROLES_MAP["dominant"]  # Fallback par défaut


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Moteur de Recherche Neuro-Cognitive")
    parser.add_argument("--situation", default="", help="Situation marketing (ex: 'objection prix', 'doute', 'onboarding')")
    parser.add_argument("--role", default="", help="Poste de la cible pour cadrage DISC (ex: 'CTO', 'CEO', 'CMO')")
    args = parser.parse_args()

    print("=================================================================")
    print("🧠 VAULT NEUROSCIENCES & PSYCHOLOGIE COMPORTEMENTALE")
    print("=================================================================\n")

    if args.role:
        disc = get_disc_guidelines(args.role)
        print(f"🎯 CADRAGE PSYCHOLOGIQUE POUR LE POSTE : [{args.role.upper()}]")
        print(f"  • Profil DISC : {disc['profile']}")
        print(f"  • Moteurs Cérébraux : {disc['psychological_drivers']}")
        print(f"  • Style Recommandé : {disc['communication_style']}")
        print(f"  • Expressions Interdites : {', '.join(disc['forbidden_phrases'])}\n")
        print("-" * 65 + "\n")

    query = args.situation if args.situation else "objection prix"
    print(f"🔍 RECHERCHE DE LEVIERS COGNITIFS POUR : '{query}'\n")
    results = search_neuro_vault(query)
    
    for idx, b in enumerate(results[:2], 1):
        print(f"[{idx}] 🏷️  {b['name']} — Réf: {b['author']}")
        print(f"    🧠 Mécanisme : {b['mechanism']}")
        print(f"    🛠️ Application : {b['application']}")
        print(f"    💬 Exemple d'accroche : \"{b['example_hook']}\"\n")
