"""
ab_test_calculator.py — Moteur de Calcul Statistique & Tests A/B (Zéro Dépendance).

Évalue la significativité statistique d'un test A/B et calcule la taille d'échantillon requise :
- Z-score et p-value (Test bilatéral d'hypothèse pour 2 proportions)
- Probabilité de victoire de la variante (Confidence Level)
- Calculateur de taille d'échantillon minimale requise (Sample Size Calculator)
"""

import io
import math
import sys
from typing import Dict

# Encodage UTF-8 sous Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass


def calculate_sample_size(baseline_rate: float, mde: float, alpha: float = 0.05, power: float = 0.80) -> int:
    """
    Calcule le nombre minimum de visiteurs requis PAR VARIANTE.
    baseline_rate : Taux de conversion actuel (ex: 0.05 pour 5%)
    mde : Minimum Detectable Effect relatif (ex: 0.20 pour une hausse de 20%, soit 6% cible)
    alpha : Risque d'erreur de type I (0.05 = 95% de confiance)
    power : Puissance statistique (0.80 = 80% de chance de détecter l'effet)
    """
    p1 = baseline_rate
    p2 = baseline_rate * (1 + mde)
    delta = abs(p2 - p1)
    
    if delta == 0:
        return 0
        
    # Valeurs critiques normales
    z_alpha = 1.96  # Pour alpha = 0.05
    z_beta = 0.84   # Pour power = 0.80
    
    p_bar = (p1 + p2) / 2
    numerator = (z_alpha * math.sqrt(2 * p_bar * (1 - p_bar)) + z_beta * math.sqrt(p1 * (1 - p1) + p2 * (1 - p2))) ** 2
    denominator = delta ** 2
    
    sample_per_variant = int(math.ceil(numerator / denominator))
    return sample_per_variant


def evaluate_ab_test(visitors_a: int, conversions_a: int, visitors_b: int, conversions_b: int) -> Dict:
    """
    Évalue les résultats d'un test A/B entre la variante A (Contrôle) et B (Challenger).
    """
    if visitors_a <= 0 or visitors_b <= 0:
        return {"error": "Le nombre de visiteurs doit être supérieur à 0."}
        
    rate_a = conversions_a / visitors_a
    rate_b = conversions_b / visitors_b
    
    uplift = ((rate_b - rate_a) / max(0.0001, rate_a)) * 100
    
    # Calcul du Z-Score pour la différence de 2 proportions
    pooled_p = (conversions_a + conversions_b) / (visitors_a + visitors_b)
    se = math.sqrt(pooled_p * (1 - pooled_p) * (1 / visitors_a + 1 / visitors_b))
    
    if se == 0:
        z_score = 0.0
    else:
        z_score = (rate_b - rate_a) / se
        
    # Approximation de la fonction de répartition normale pour la p-value
    # Utilisation de la fonction d'erreur math.erf
    p_value = 2 * (1 - 0.5 * (1 + math.erf(abs(z_score) / math.sqrt(2))))
    confidence = (1 - p_value) * 100
    
    is_significant = p_value < 0.05
    
    if is_significant:
        if uplift > 0:
            conclusion = f"Gagnant clair : La variante B surperforme la variante A avec {confidence:.1f}% de confiance (+{uplift:.1f}% de conversion)."
        else:
            conclusion = f"Perdant clair : La variante B sous-performe significativement (-{abs(uplift):.1f}%)."
    else:
        conclusion = f"Résultat non significatif ({confidence:.1f}% de confiance, seuil requis 95%). Poursuivre le test pour accumuler plus de données."
        
    return {
        "rate_a": round(rate_a * 100, 2),
        "rate_b": round(rate_b * 100, 2),
        "uplift_percent": round(uplift, 2),
        "z_score": round(z_score, 3),
        "p_value": round(p_value, 4),
        "confidence_level": round(confidence, 2),
        "is_significant_95": is_significant,
        "conclusion": conclusion
    }


if __name__ == "__main__":
    print("=== 1. CALCULATEUR DE TAILLE D'ÉCHANTILLON ===")
    needed = calculate_sample_size(baseline_rate=0.03, mde=0.25)
    print(f"Pour un taux de base de 3% et une hausse visée de +25% :")
    print(f"-> Il faut {needed:,} visiteurs par variante ({needed*2:,} au total) pour un test fiable à 95%.\n")

    print("=== 2. ÉVALUATION D'UN TEST A/B RÉEL ===")
    # Variante A (Contrôle) : 1 200 visiteurs, 36 conversions (3.0%)
    # Variante B (Bento UI) : 1 250 visiteurs, 62 conversions (4.96%)
    res = evaluate_ab_test(visitors_a=1200, conversions_a=36, visitors_b=1250, conversions_b=62)
    print(f"Taux Variante A : {res['rate_a']}%")
    print(f"Taux Variante B : {res['rate_b']}% (Uplift: +{res['uplift_percent']}%)")
    print(f"Niveau de Confiance : {res['confidence_level']}% (P-Value: {res['p_value']})")
    print(f"Significatif à 95% : {res['is_significant_95']}")
    print(f"Conclusion : {res['conclusion']}")
