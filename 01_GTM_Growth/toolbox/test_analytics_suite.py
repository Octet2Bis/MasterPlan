"""
test_analytics_suite.py — Suite de Tests Unitaires des Nouveaux Outils Analytics & Tracking GTM (100% Zéro Dépendance).
"""

import sys
from pathlib import Path

# Garantir que 01_GTM_Growth est dans sys.path pour les imports de toolbox
TOOLBOX_PARENT = Path(__file__).resolve().parent.parent
if str(TOOLBOX_PARENT) not in sys.path:
    sys.path.insert(0, str(TOOLBOX_PARENT))

# Reconfiguration UTF-8 propre
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from toolbox.core.tracking_validator import validate_datalayer_payload
from toolbox.core.attribution_engine import compute_attribution
from toolbox.core.ab_test_calculator import calculate_sample_size, evaluate_ab_test
from toolbox.core.unit_economics import compute_saas_metrics


def run_tests():
    print("=== DEMARRAGE DE LA SUITE DE TESTS ANALYTICS ===")
    
    # 1. Test Tracking Validator
    res_dl = validate_datalayer_payload({"event": "generate_lead", "value": 100, "currency": "EUR"})
    assert res_dl["valid"] == True, "Echec validation DataLayer valide"
    res_dl_bad = validate_datalayer_payload({"event": "Bad Event Name"})
    assert res_dl_bad["valid"] == False, "Echec detection DataLayer invalide"
    print(" [1/4] tracking_validator.py : PASS")
    
    # 2. Test Attribution Engine (W-Shaped)
    journey = ["LinkedIn", "Blog", "Outbound", "Search"]
    res_attr = compute_attribution(journey, deal_value=1000.0, model="w_shaped")
    assert round(sum(res_attr.values()), 1) == 1000.0, "Echec somme attribution W-Shaped"
    print(" [2/4] attribution_engine.py (W-Shaped & Multi-Touch) : PASS")
    
    # 3. Test A/B Test Calculator
    sample_needed = calculate_sample_size(0.05, 0.20)
    assert sample_needed > 0, "Echec calcul taille echantillon"
    res_ab = evaluate_ab_test(1000, 30, 1000, 60)
    assert res_ab["is_significant_95"] == True, "Echec significativite A/B test"
    print(" [3/4] ab_test_calculator.py (Bayesian & Sample Size) : PASS")
    
    # 4. Test Unit Economics
    res_econ = compute_saas_metrics(5000, 5000, 20, 100, 0.8, 0.02)
    assert res_econ["cac_euros"] == 500.0, "Echec calcul CAC"
    assert res_econ["ltv_cac_ratio"] > 0, "Echec calcul ratio LTV:CAC"
    print(" [4/4] unit_economics.py (CAC, LTV, Payback) : PASS")
    
    print("\nTOUS LES TESTS ANALYTICS SONT VALIDES AVEC SUCCES (100% VERT) !")


if __name__ == "__main__":
    run_tests()
