"""
ai_slop_linter.py — Linter et Détecteur de Tics d'Écriture IA (Zéro Dépendance).

Scanne les emails, articles et pages de vente pour identifier et corriger
plus de 20 patterns et clichés typiques générés par les LLMs :
- Contrastes binaires creux ("Ce n'est pas X, c'est Y", "It's not about X, it's about Y")
- Introductions pompeuses ("Soyons clairs", "Voici le problème", "Here's the thing")
- Faux insights ("Le futur n'arrive pas, il est déjà là")
- Superlatifs vides ("révolutionnaire", "incontournable", "redéfinir le paysage")
- Conclusions prévisibles ("En résumé", "Dans un monde en constante évolution")
"""

import io
import re
import sys
from typing import Dict, List, Tuple

# Forcer l'encodage UTF-8 sous Windows
if sys.platform == "win32":
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    except Exception:
        pass


SLOP_PATTERNS = [
    # 1. Contrastes binaires creux
    (r"\b(ce n'est pas|il ne s'agit pas de)\b.*?\b(mais|c'est)\b", "Contraste binaire artificiel ('Ce n'est pas X, c'est Y')"),
    (r"\b(it's not (just|about))\b.*?\b(it's (about|a))\b", "Contraste binaire artificiel ('It's not about X, it's about Y')"),
    
    # 2. Introductions & Transitions pompeuses
    (r"\b(soyons clairs|voici la vérité|la vérité est que|disons-le clairement)\b", "Introduction pompeuse / faux suspense"),
    (r"\b(here's the thing|let's be honest|let that sink in|make no mistake)\b", "Throat-clearing opener / faux suspense"),
    (r"\b(dans un monde où|dans le paysage actuel|à l'ère du digital|à l'ère de l'ia)\b", "Cliché d'ouverture générique ('Dans un monde où...')"),
    (r"\b(in today's (fast-paced|rapidly evolving|digital) world)\b", "Generic opening cliché"),
    
    # 3. Superlatifs creux et buzzwords
    (r"\b(révolutionnaire|game-changer|disruptif|incontournable|pionnier)\b", "Superlatif marketing creux ('game-changer / révolutionnaire')"),
    (r"\b(delve|dive deep|testament to|beacon of|tapestry|unleash|elevate)\b", "Vocabulaire sur-utilisé par les LLMs ('delve, unleash, elevate...')"),
    (r"\b(propulsez vos|décuplez vos|boostez vos|libérez le potentiel)\b", "Formule d'accroche commerciale artificielle"),
    
    # 4. Faux insights & Métaphores prévisibles
    (r"\b(le futur n'attend pas|l'avenir est déjà là|la clé du succès réside)\b", "Fausse profondeur philosophique"),
    (r"\b(the future isn't coming|it's already here|the secret sauce)\b", "Faux-insight setup"),
    
    # 5. Conclusions mécaniques
    (r"\b(en conclusion|pour résumer|en définitive|au final, une chose est sûre)\b", "Conclusion mécanique de type résumé scolaire"),
    (r"\b(in conclusion|to sum up|at the end of the day)\b", "Mechanical closing marker"),
]


def audit_text_for_ai_slop(text: str) -> Dict:
    """
    Audite un texte et retourne un score de pureté stylistique (/100)
    ainsi que la liste des tics IA identifiés avec leurs lignes.
    """
    if not text or not text.strip():
        return {"purity_score": 100, "slop_detected_count": 0, "issues": []}

    lines = text.split("\n")
    issues = []
    penalties = 0

    for line_idx, line in enumerate(lines, start=1):
        clean_line = line.strip()
        if not clean_line:
            continue

        for pattern, label in SLOP_PATTERNS:
            matches = re.finditer(pattern, clean_line, re.IGNORECASE)
            for m in matches:
                matched_str = m.group(0)
                issues.append({
                    "line": line_idx,
                    "matched_text": matched_str,
                    "issue_type": label,
                    "recommendation": f"Remplacer '{matched_str}' par une formulation directe, concrète et factuelle."
                })
                penalties += 12

    purity_score = max(0, 100 - penalties)

    return {
        "purity_score": purity_score,
        "is_human_grade": purity_score >= 85,
        "slop_detected_count": len(issues),
        "issues": issues
    }


if __name__ == "__main__":
    # Test unitaire d'exemple
    bad_ai_copy = """
    Soyons clairs : dans un monde où la technologie évolue à toute vitesse, 
    ce n'est pas une simple solution que nous proposons, mais une approche révolutionnaire.
    Propulsez vos ventes dès aujourd'hui et libérez le potentiel de votre équipe !
    En conclusion, le futur n'attend pas.
    """

    good_human_copy = """
    Bonjour David,
    
    J'ai analysé les offres actuelles de coffrets Wonderbox sur le segment week-ends en Normandie.
    Nous constatons une hausse de 18% des réservations directes chez nos 45 partenaires hôteliers 
    lorsque les disponibilités sont synchronisées en temps réel.
    
    Seriez-vous ouvert à un échange de 10 minutes mardi à 14h pour étudier les synergies possibles ?
    """

    print("=== TEST 1 : TEXTE CHARGÉ DE TICS IA ===")
    res_bad = audit_text_for_ai_slop(bad_ai_copy)
    print(f"Score de Pureté : {res_bad['purity_score']}/100 (Humain: {res_bad['is_human_grade']})")
    for iss in res_bad["issues"]:
        print(f"  [Ligne {iss['line']}] {iss['issue_type']} -> '{iss['matched_text']}'")

    print("\n=== TEST 2 : TEXTE SOBRE ET HUMAIN ===")
    res_good = audit_text_for_ai_slop(good_human_copy)
    print(f"Score de Pureté : {res_good['purity_score']}/100 (Humain: {res_good['is_human_grade']})")
    print(f"Anomalies détectées : {res_good['slop_detected_count']}")
