"""
test_analytics_suite.py — Suite de Tests Unitaires des Nouveaux Outils Analytics & Tracking GTM (100% Zéro Dépendance).
"""

import sys
from pathlib import Path

# Garantir que 01_GTM_Growth est dans sys.path pour les imports de toolbox
TOOLBOX_PARENT = Path(__file__).resolve().parent.parent.parent
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
    print(" [1/4] tracking_validator.py : PASS")

    # 2. Test Attribution Engine (W-Shaped)
    journey = ["SEO", "LinkedIn", "Webinar", "Direct"]
    attr = compute_attribution(journey, deal_value=10000, model="w_shaped")
    assert "SEO" in attr and "Webinar" in attr, "Echec modele d'attribution"
    print(" [2/4] attribution_engine.py (W-Shaped & Multi-Touch) : PASS")

    # 3. Test AB Test Calculator
    ss = calculate_sample_size(baseline_rate=0.05, mde=0.2)
    assert ss > 0, "Calcul de taille d'echantillon invalide"
    eval_ab = evaluate_ab_test(visitors_a=1000, conversions_a=50, visitors_b=1000, conversions_b=75)
    assert eval_ab["rate_b"] == 7.5, "Taux conversion B incorrect"
    print(" [3/4] ab_test_calculator.py (Bayesian & Sample Size) : PASS")

    # 4. Test Unit Economics
    econ = compute_saas_metrics(
        monthly_marketing_spend=5000,
        monthly_sales_spend=5000,
        new_customers_acquired=20,
        arpu_monthly=100,
        gross_margin_percent=0.80,
        monthly_churn_rate=0.02
    )
    assert econ["cac_euros"] == 500.0, "Calcul CAC errone"
    assert econ["ltv_euros"] == 4000.0, "Calcul LTV errone"
    assert econ["ltv_cac_ratio"] == 8.0, "Ratio LTV:CAC errone"
    print(" [4/4] unit_economics.py (CAC, LTV, Payback) : PASS")

    print("\nTOUS LES TESTS ANALYTICS SONT VALIDES AVEC SUCCES (100% VERT) !")

if __name__ == "__main__":
    run_tests()
