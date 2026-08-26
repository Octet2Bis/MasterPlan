"""
lifecycle_rules.py — Moteur de Règles d'Engagement & Lifecycle Marketing Événementiel (Zéro Dépendance).

Évalue les signaux d'usage réels d'un utilisateur et déclenche l'action de communication optimale :
1. Onboarding / Premier Pas (J0 - J1)
2. Déblocage de la Valeur / Activation (J3 si usage inactif)
3. Alerte d'Atteinte de Quota / Upsell (Quota >= 80%)
4. Prévention du Churn / Réengagement (Inactivité > 14 jours)
5. Demande de Témoignage / Net Promoter Score (Power User actif > 30 jours)
"""

import io
import sys
from typing import Dict, List

# Encodage UTF-8 sous Windows
if sys.platform == "win32":
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    except Exception:
        pass


def evaluate_user_lifecycle_state(
    user_id: str,
    days_since_signup: int,
    has_completed_first_action: bool,
    quota_used_percent: float,
    days_since_last_login: int,
    subscription_plan: str = "Free"
) -> Dict:
    """
    Détermine l'étape du cycle de vie et le déclencheur d'email / message in-app approprié.
    """
    triggered_actions = []
    urgency = "Normal"
    
    # 1. Règle Onboarding Immédiat (J0)
    if days_since_signup == 0:
        triggered_actions.append({
            "trigger_name": "welcome_onboarding",
            "channel": "Email + In-App Guide",
            "subject": "Bienvenue — Vos 60 premières secondes vers votre premier résultat",
            "cta": "Lancer le guide interactif"
        })
        
    # 2. Règle de Non-Activation (J1 à J3 sans première action)
    elif 1 <= days_since_signup <= 3 and not has_completed_first_action:
        urgency = "High"
        triggered_actions.append({
            "trigger_name": "activation_rescue_nudge",
            "channel": "Email",
            "subject": "Besoin d'un coup de main pour configurer votre premier projet ?",
            "cta": "Réserver 10 min avec un expert"
        })
        
    # 3. Règle d'Expansion / Atteinte de Quota (Quota >= 80%)
    if quota_used_percent >= 80.0 and subscription_plan.lower() in ("free", "starter"):
        urgency = "High"
        triggered_actions.append({
            "trigger_name": "quota_upsell_trigger",
            "channel": "In-App Banner + Email",
            "subject": f"Vous avez consommé {int(quota_used_percent)}% de votre quota gratuit",
            "cta": "Passer au plan Pro (Illimité)"
        })
        
    # 4. Règle de Prévention du Churn (Inactivité > 14 jours)
    if days_since_last_login >= 14:
        urgency = "Critical"
        triggered_actions.append({
            "trigger_name": "churn_prevention_reengagement",
            "channel": "Email",
            "subject": "Nouvelles fonctionnalités disponibles sur votre compte",
            "cta": "Découvrir les nouveautés"
        })
        
    # 5. Règle Power User (Actif, première action terminée, quota < 80%)
    if has_completed_first_action and days_since_signup >= 30 and days_since_last_login <= 3:
        triggered_actions.append({
            "trigger_name": "nps_satisfaction_survey",
            "channel": "In-App Modal",
            "subject": "Une minute pour nous donner votre avis ?",
            "cta": "Noter l'expérience (1 à 10)"
        })
        
    if not triggered_actions:
        triggered_actions.append({
            "trigger_name": "standard_nurturing",
            "channel": "None",
            "subject": "Aucune communication requise aujourd'hui (Statut nominal)",
            "cta": "None"
        })

    return {
        "user_id": user_id,
        "days_since_signup": days_since_signup,
        "urgency": urgency,
        "actions_count": len(triggered_actions),
        "recommended_actions": triggered_actions
    }


if __name__ == "__main__":
    print("=== TEST 1 : UTILISATEUR BLOQUÉ EN ONBOARDING (J+2 SANS ACTION) ===")
    res1 = evaluate_user_lifecycle_state(
        user_id="usr_12345",
        days_since_signup=2,
        has_completed_first_action=False,
        quota_used_percent=10.0,
        days_since_last_login=1
    )
    print(f"Urgence : [{res1['urgency']}]")
    for act in res1["recommended_actions"]:
        print(f"  • Déclencheur : {act['trigger_name']} -> {act['subject']}")

    print("\n=== TEST 2 : UTILISATEUR SUR LE POINT DE DÉPASSER SON QUOTA (85%) ===")
    res2 = evaluate_user_lifecycle_state(
        user_id="usr_67890",
        days_since_signup=12,
        has_completed_first_action=True,
        quota_used_percent=85.0,
        days_since_last_login=0,
        subscription_plan="Free"
    )
    print(f"Urgence : [{res2['urgency']}]")
    for act in res2["recommended_actions"]:
        print(f"  • Déclencheur : {act['trigger_name']} -> {act['subject']}")
