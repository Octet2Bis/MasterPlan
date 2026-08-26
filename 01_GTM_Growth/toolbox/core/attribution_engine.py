"""
attribution_engine.py — Moteur d'Attribution Multi-Touch B2B & E-commerce (Zéro Dépendance).

Modélise la contribution réelle de chaque canal d'acquisition dans le cycle de vente :
1. First-Touch (100% au canal de découverte)
2. Last-Touch (100% au canal de conversion finale)
3. Linear (Répartition égale sur tous les points de contact)
4. U-Shaped (40% First, 40% Lead Creation, 20% Middle)
5. W-Shaped (30% First, 30% Lead Creation, 30% Opportunity Creation, 10% Middle) — Le standard B2B
6. Time-Decay (Pondération exponentielle croissante vers la date de signature)
"""

import io
import sys
from typing import Dict, List

# Encodage UTF-8 sous Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass


def compute_attribution(touchpoints: List[str], deal_value: float, model: str = "w_shaped") -> Dict[str, float]:
    """
    Calcule la répartition de la valeur de la transaction (deal_value) sur chaque canal.
    touchpoints : Liste ordonnée chronologiquement des canaux (ex: ["LinkedIn_Ad", "Blog_SEO", "Cold_Email", "Direct_Search"])
    """
    if not touchpoints:
        return {}

    n = len(touchpoints)
    weights = [0.0] * n
    model_lower = model.lower()

    if n == 1:
        weights = [1.0]
    elif model_lower == "first_touch":
        weights[0] = 1.0
    elif model_lower == "last_touch":
        weights[-1] = 1.0
    elif model_lower == "linear":
        weights = [1.0 / n] * n
    elif model_lower == "u_shaped":
        if n == 2:
            weights = [0.5, 0.5]
        else:
            weights[0] = 0.4
            weights[-1] = 0.4
            middle_weight = 0.2 / (n - 2)
            for i in range(1, n - 1):
                weights[i] = middle_weight
    elif model_lower == "w_shaped":
        if n == 2:
            weights = [0.5, 0.5]
        elif n == 3:
            weights = [0.333, 0.333, 0.334]
        else:
            # 30% First touch, 30% Midpoint (Lead creation), 30% Last touch, 10% réparti sur le reste
            mid_idx = n // 2
            weights[0] = 0.30
            weights[mid_idx] = 0.30
            weights[-1] = 0.30
            remaining_indices = [i for i in range(n) if i not in (0, mid_idx, n - 1)]
            if remaining_indices:
                rem_weight = 0.10 / len(remaining_indices)
                for i in remaining_indices:
                    weights[i] = rem_weight
    elif model_lower == "time_decay":
        # Pondération exponentielle 2^(i - (n - 1))
        raw_weights = [2 ** (i - (n - 1)) for i in range(n)]
        total_raw = sum(raw_weights)
        weights = [w / total_raw for w in raw_weights]
    else:
        # Fallback linéaire
        weights = [1.0 / n] * n

    # Agrégation par canal unique
    attribution_by_channel = {}
    for channel, weight in zip(touchpoints, weights):
        val = round(deal_value * weight, 2)
        attribution_by_channel[channel] = attribution_by_channel.get(channel, 0.0) + val

    return attribution_by_channel


if __name__ == "__main__":
    journey = ["LinkedIn_Thought_Leadership", "AEO_Article_Blog", "Cold_Email_Outreach", "Google_Search_Brand"]
    deal_mrr = 5000.0  # 5 000€ MRR signé

    print(f"=== PARCOURS CLIENT (4 TOUCHPOINTS) : {' -> '.join(journey)} ===")
    print(f"Valeur de la transaction : {deal_mrr} €\n")

    for m in ["first_touch", "last_touch", "linear", "w_shaped", "time_decay"]:
        res = compute_attribution(journey, deal_mrr, model=m)
        print(f"Modèle [{m.upper()}] :")
        for ch, amount in res.items():
            print(f"  • {ch:30} : {amount:8.2f} € ({amount/deal_mrr*100:.1f}%)")
        print()
