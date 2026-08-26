"""
signal_engine.py — Moteur de Signaux d'Intention & Décroissance Temporelle (Zéro Dépendance).

Évalue et score la fraîcheur des signaux d'achat (Intent Triggers) pour éviter de contacter
des prospects sur des signaux obsolètes (Signal Decay Logic) :
- Types de signaux : Nomination/Prise de poste, Échéance réglementaire (BACS), Recrutement, Migration d'outils
- Demi-vie du signal (Half-life) : Un signal perd 50% de sa valeur après N jours
- Filtrage strict : Tout signal de plus de 60 jours ou au score < 40 est classé 'EXPIRÉ / NE PAS CONTACTER'
"""

import math
import sys
from datetime import datetime
from typing import Dict, List

# Encodage UTF-8 sous Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass


SIGNAL_CATALOG = {
    "job_change_decision_maker": {
        "name": "Prise de poste d'un nouveau décideur",
        "base_weight": 95,
        "half_life_days": 30,  # Très chaud les 30 premiers jours, périmé après 90j
        "description": "Un nouveau Directeur Général ou Directeur Technique cherche à poser sa marque dans ses 90 premiers jours."
    },
    "regulatory_deadline_bacs": {
        "name": "Échéance Réglementaire (Décret BACS / Tertiaire)",
        "base_weight": 90,
        "half_life_days": 60,
        "description": "L'approche d'une échéance légale crée une obligation de conformité non négociable."
    },
    "tech_stack_migration": {
        "name": "Changement / Migration d'outils détectée",
        "base_weight": 85,
        "half_life_days": 21,  # Fenêtre courte pendant la transition
        "description": "L'entreprise est en phase active de refonte de ses logiciels ou automates."
    },
    "active_hiring_pain_point": {
        "name": "Recrutement actif sur le sujet",
        "base_weight": 75,
        "half_life_days": 45,
        "description": "L'entreprise recrute sur la compétence, prouvant que le sujet est prioritaire mais en sous-capacité."
    },
    "company_funding_expansion": {
        "name": "Levée de fonds / Acquisition / Expansion de site",
        "base_weight": 70,
        "half_life_days": 40,
        "description": "Nouveau budget débloqué et ouverture de nouveaux bâtiments."
    }
}


def compute_signal_score(signal_type: str, days_elapsed: int) -> Dict:
    """
    Calcule le score actuel d'un signal en appliquant la décroissance exponentielle temporelle.
    Score = Base Weight * exp(- (ln(2) / half_life) * days_elapsed)
    """
    if signal_type not in SIGNAL_CATALOG:
        return {
            "signal_type": signal_type,
            "status": "INCONNU",
            "current_score": 0,
            "is_actionable": False,
            "recommendation": "Signal non répertorié dans la bibliothèque."
        }
        
    meta = SIGNAL_CATALOG[signal_type]
    base_weight = meta["base_weight"]
    half_life = meta["half_life_days"]
    
    # Formule de décroissance radioactive / demi-vie
    decay_rate = math.log(2) / half_life
    current_score = base_weight * math.exp(-decay_rate * max(0, days_elapsed))
    current_score = round(current_score, 1)
    
    # Seuil d'actionnabilité : score minimum de 40/100
    is_actionable = current_score >= 40.0
    
    if current_score >= 75.0:
        status = "🟢 ULTRA-CHAUD (Signal Prioritaire)"
        recommendation = "Contacter immédiatement dans les 48h en mentionnant explicitement l'événement déclencheur."
    elif current_score >= 50.0:
        status = "🟡 TIÈDE (Signal Valide)"
        recommendation = "Contacter sous 7 jours avec une approche orientée valeur / ressource offerte."
    elif is_actionable:
        status = "🟠 TIÈDE-FROID (En Déclin)"
        recommendation = "Dernière fenêtre d'opportunité avant péremption du signal."
    else:
        status = "🔴 EXPIRÉ (Ne Pas Contacter)"
        recommendation = "Signal trop ancien. Risque élevé de saturation ou d'inpertinence. Ne pas polluer le prospect."

    return {
        "signal_type": signal_type,
        "signal_name": meta["name"],
        "days_elapsed": days_elapsed,
        "base_weight": base_weight,
        "current_score": current_score,
        "status": status,
        "is_actionable": is_actionable,
        "recommendation": recommendation
    }


if __name__ == "__main__":
    print("=== TEST DU MOTEUR DE SIGNAUX & SIGNAL DECAY ===")
    
    tests = [
        ("job_change_decision_maker", 5),   # Nouveau DG il y a 5 jours
        ("job_change_decision_maker", 45),  # Nouveau DG il y a 45 jours
        ("job_change_decision_maker", 100), # Nouveau DG il y a 100 jours (expiré)
        ("regulatory_deadline_bacs", 15),   # Échéance BACS il y a 15 jours
    ]
    
    for sig, days in tests:
        res = compute_signal_score(sig, days)
        print(f"\n📡 Signal : {res['signal_name']} (Ancienneté: {res['days_elapsed']} jours)")
        print(f"   Score Actuel : {res['current_score']}/100 | Statut : {res['status']}")
        print(f"   Actionnable : {res['is_actionable']}")
        print(f"   Conseil : {res['recommendation']}")
