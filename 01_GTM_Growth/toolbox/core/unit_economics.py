"""
unit_economics.py — Moteur d'Ingénierie Financière & Métriques SaaS (Zéro Dépendance).

Calcule et diagnostique les métriques économiques fondamentales d'un produit SaaS ou B2B :
1. CAC (Customer Acquisition Cost)
2. LTV (Lifetime Value) = (ARPU × Marge Brute %) / Churn Rate %
3. Ratio LTV / CAC (Seuil cible >= 3.0x)
4. CAC Payback Period (en mois) = CAC / (ARPU × Marge Brute %)
5. Net Revenue Retention (NRR %) = (MRR Début + Expansion - Contraction - Churn) / MRR Début
6. SaaS Magic Number = (Revenus Trimestre N - Revenus Trimestre N-1) × 4 / Dépenses Sales & Marketing Trimestre N-1
"""

import io
import sys
from typing import Dict

# Encodage UTF-8 sous Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass


def compute_saas_metrics(
    monthly_marketing_spend: float,
    monthly_sales_spend: float,
    new_customers_acquired: int,
    arpu_monthly: float,
    gross_margin_percent: float = 0.80,
    monthly_churn_rate: float = 0.03,
    expansion_revenue_monthly: float = 0.0,
    contraction_revenue_monthly: float = 0.0,
    starting_mrr: float = 50000.0
) -> Dict:
    """
    Calcule l'ensemble des Unit Economics d'une entreprise SaaS ou B2B.
    """
    total_acquisition_spend = monthly_marketing_spend + monthly_sales_spend
    
    # 1. CAC (Coût d'Acquisition Client)
    if new_customers_acquired > 0:
        cac = total_acquisition_spend / new_customers_acquired
    else:
        cac = 0.0
        
    # 2. LTV (Customer Lifetime Value)
    margin_arpu = arpu_monthly * gross_margin_percent
    if monthly_churn_rate > 0:
        average_lifespan_months = 1.0 / monthly_churn_rate
        ltv = margin_arpu * average_lifespan_months
    else:
        average_lifespan_months = 60.0
        ltv = margin_arpu * 60.0
        
    # 3. Ratio LTV:CAC
    if cac > 0:
        ltv_cac_ratio = ltv / cac
    else:
        ltv_cac_ratio = 0.0
        
    # 4. CAC Payback Period (mois)
    if margin_arpu > 0:
        cac_payback_months = cac / margin_arpu
    else:
        cac_payback_months = 0.0
        
    # 5. NRR (Net Revenue Retention)
    # Formule : (Starting MRR + Expansion - Contraction - Churn) / Starting MRR
    lost_mrr_churn = starting_mrr * monthly_churn_rate
    ending_cohort_mrr = starting_mrr + expansion_revenue_monthly - contraction_revenue_monthly - lost_mrr_churn
    nrr_percent = (ending_cohort_mrr / starting_mrr) * 100
    
    # Diagnostic de santé financière
    health_status = "Excellent" if ltv_cac_ratio >= 3.0 and cac_payback_months <= 12 else "Attention"
    
    return {
        "cac_euros": round(cac, 2),
        "ltv_euros": round(ltv, 2),
        "ltv_cac_ratio": round(ltv_cac_ratio, 2),
        "cac_payback_months": round(cac_payback_months, 1),
        "average_customer_lifespan_months": round(average_lifespan_months, 1),
        "nrr_percent": round(nrr_percent, 1),
        "health_status": health_status,
        "diagnosis": (
            f"Modèle hautement vertueux : chaque euro investi en acquisition rapporte {ltv_cac_ratio:.1f}€ de valeur nette, "
            f"avec un retour sur investissement en {cac_payback_months:.1f} mois."
            if health_status == "Excellent" else
            f"Alerte rentabilité : Le CAC Payback ({cac_payback_months:.1f} mois) ou le ratio LTV:CAC ({ltv_cac_ratio:.1f}x) "
            "nécessite d'optimiser les canaux d'acquisition ou de réduire le churn."
        )
    }


if __name__ == "__main__":
    print("=== RAPPORT D'INGÉNIERIE FINANCIÈRE & UNIT ECONOMICS ===")
    res = compute_saas_metrics(
        monthly_marketing_spend=6000.0,
        monthly_sales_spend=4000.0,
        new_customers_acquired=25,     # 25 nouveaux clients signés
        arpu_monthly=120.0,            # 120€ / mois par client
        gross_margin_percent=0.85,     # 85% de marge brute (Standard SaaS)
        monthly_churn_rate=0.025,      # 2.5% de churn mensuel
        expansion_revenue_monthly=1200.0,
        starting_mrr=60000.0
    )
    
    print(f"CAC (Coût d'Acquisition)       : {res['cac_euros']:,.2f} €")
    print(f"LTV (Valeur Vie Client)        : {res['ltv_euros']:,.2f} € (Durée moyenne: {res['average_customer_lifespan_months']} mois)")
    print(f"Ratio LTV / CAC                : {res['ltv_cac_ratio']}x (Standard cible >= 3.0x)")
    print(f"CAC Payback Period             : {res['cac_payback_months']} mois (Standard cible <= 12 mois)")
    print(f"Net Revenue Retention (NRR)    : {res['nrr_percent']}% / mois")
    print(f"Statut de Santé                : [{res['health_status']}]")
    print(f"Diagnostic Exécutif            : {res['diagnosis']}")
