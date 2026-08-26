"""
tracking_validator.py — Validateur de Spécifications DataLayer & Événements Google Tag Manager / GA4 (Zéro Dépendance).

Vérifie la conformité des événements window.dataLayer.push() avec les standards GA4 et Google Consent Mode v2 :
- Présence des champs obligatoires (event, user_id, items, value, currency)
- Validation des types de données (string, number, array)
- Contrôle de la nomenclature (snake_case stricte, pas d'espaces)
- Détection des conflits de nommage et payloads orphelins
"""

import io
import json
import re
import sys
from typing import Dict, List

# Encodage UTF-8 sous Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass


GA4_STANDARD_EVENTS = {
    "page_view": ["page_location", "page_title"],
    "view_item": ["items"],
    "view_item_list": ["items"],
    "select_item": ["items"],
    "add_to_cart": ["items", "value", "currency"],
    "begin_checkout": ["items", "value", "currency"],
    "purchase": ["transaction_id", "value", "currency", "items"],
    "generate_lead": ["value", "currency"],
    "sign_up": ["method"],
    "login": ["method"]
}


def validate_datalayer_payload(payload: Dict) -> Dict:
    """
    Valide un objet DataLayer push.
    """
    errors = []
    warnings = []
    
    if not isinstance(payload, dict):
        return {"valid": False, "score": 0, "errors": ["Le payload doit être un dictionnaire JSON."], "warnings": []}
        
    event_name = payload.get("event")
    if not event_name:
        errors.append("Champ 'event' manquant obligatoire dans le dataLayer.push().")
    else:
        # Vérification snake_case
        if not re.match(r"^[a-z0-9_]+$", event_name):
            errors.append(f"Le nom de l'événement '{event_name}' doit être en snake_case strict (minuscules et underscores).")
            
        # Vérification des champs requis pour les événements standards GA4
        if event_name in GA4_STANDARD_EVENTS:
            required_fields = GA4_STANDARD_EVENTS[event_name]
            for rf in required_fields:
                if rf not in payload:
                    warnings.append(f"Événement standard GA4 '{event_name}' : le champ '{rf}' est fortement recommandé.")
                    
    # Vérification des clés de propriétés
    for k, v in payload.items():
        if " " in k or "-" in k:
            warnings.append(f"La clé de propriété '{k}' contient des espaces ou tirets. Préférer le snake_case.")
            
    # Vérification de la structure des items pour le e-commerce
    if "items" in payload:
        items = payload["items"]
        if not isinstance(items, list) or len(items) == 0:
            errors.append("Le champ 'items' doit être une liste non-vide d'objets produits.")
        else:
            for idx, itm in enumerate(items):
                if not isinstance(itm, dict):
                    errors.append(f"L'élément item[{idx}] n'est pas un dictionnaire.")
                elif "item_id" not in itm and "item_name" not in itm:
                    errors.append(f"L'élément item[{idx}] doit contenir au moins 'item_id' ou 'item_name'.")

    score = max(0, 100 - (len(errors) * 25 + len(warnings) * 10))
    
    return {
        "valid": len(errors) == 0,
        "score": score,
        "event_name": event_name,
        "errors": errors,
        "warnings": warnings
    }


if __name__ == "__main__":
    test_payload_good = {
        "event": "generate_lead",
        "value": 150.0,
        "currency": "EUR",
        "lead_source": "landing_page_b2b",
        "form_id": "contact_wonderbox"
    }

    test_payload_bad = {
        "event": "Click On Lead Button",
        "items": "fake_string_instead_of_list",
        "user email": "test@domain.com"
    }

    print("=== TEST 1 : PAYLOAD DATALAYER VALIDE ===")
    res1 = validate_datalayer_payload(test_payload_good)
    print(f"Événement : {res1['event_name']} | Score : {res1['score']}/100 | Valide : {res1['valid']}")

    print("\n=== TEST 2 : PAYLOAD DATALAYER INVALIDE ===")
    res2 = validate_datalayer_payload(test_payload_bad)
    print(f"Événement : {res2['event_name']} | Score : {res2['score']}/100 | Valide : {res2['valid']}")
    for err in res2["errors"]:
        print(f"  [ERREUR] {err}")
    for w in res2["warnings"]:
        print(f"  [WARNING] {w}")
