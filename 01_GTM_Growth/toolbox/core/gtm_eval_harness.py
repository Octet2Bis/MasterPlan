"""
gtm_eval_harness.py — Harness d'Évaluation Déterministe pour Livrables GTM.
Inspiré d'Inspect AI (UK AISI) et Promptfoo.

Structure l'évaluation des livrables (Emails, Landing Pages, Ads) selon le modèle :
  1. SOLVER (Contenu généré)
  2. SANDBOX (Environnement de test isolé)
  3. SCORER (Validation programmatique multi-critères)
"""

import re
import sys
from typing import Dict, List, Any

# Forçage encodage UTF-8 sous Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass


class GTMEvalScorer:
    """Scorer déterministe pour tester la qualité et la conformité des livrables GTM."""

    SLOP_PATTERNS = [
        r"\bgame-changer\b", r"\brevolutionn(?:er|aire)\b", r"\bincontournable\b",
        r"\bplongeons dans\b", r"\bdans le monde d['']aujourd['']hui\b", r"\bleverage\b",
        r"\btaylor-made\b", r"\bharness\s+the\s+power\b", r"\bunleash\b", r"\bdelve\b"
    ]

    PLACEHOLDER_PATTERNS = [
        r"\{\{[^}]+\}\}", r"\[(?:VOTRE|NOM|ENTREPRISE|LIEN|PRÉNOM|TODO|TBD)[^\]]*\]",
        r"TODO:", r"TBD:", r"INSERT_"
    ]

    def score_content(self, text: str, content_type: str = "email") -> Dict[str, Any]:
        results = {
            "content_type": content_type,
            "total_chars": len(text),
            "checks": [],
            "score": 100,
            "passed": True,
            "violations": []
        }

        # 1. Vérification des Placeholders non remplis (CRITIQUE : -40 pts)
        placeholder_matches = []
        for pat in self.PLACEHOLDER_PATTERNS:
            matches = re.findall(pat, text, re.IGNORECASE)
            placeholder_matches.extend(matches)
        
        if placeholder_matches:
            results["score"] -= 40
            results["violations"].append(f"Variables ou placeholders non remplis détectés : {placeholder_matches}")
            results["checks"].append({"name": "No Placeholders", "status": "FAIL", "penalty": 40})
        else:
            results["checks"].append({"name": "No Placeholders", "status": "PASS", "penalty": 0})

        # 2. Vérification Anti-Slop / Clichés IA (-10 pts par occurrence, max -30)
        slop_found = []
        for pat in self.SLOP_PATTERNS:
            if re.search(pat, text, re.IGNORECASE):
                slop_found.append(pat)
        
        if slop_found:
            penalty = min(30, len(slop_found) * 10)
            results["score"] -= penalty
            results["violations"].append(f"Clichés IA détectés : {slop_found}")
            results["checks"].append({"name": "Anti-AI Slop", "status": "FAIL", "penalty": penalty})
        else:
            results["checks"].append({"name": "Anti-AI Slop", "status": "PASS", "penalty": 0})

        # 3. Vérification de Longueur & Lisibilité Mobile (-20 pts si trop long)
        if content_type == "email":
            word_count = len(text.split())
            if word_count > 200:
                results["score"] -= 20
                results["violations"].append(f"Email trop long ({word_count} mots). Limite conseillée : < 150 mots.")
                results["checks"].append({"name": "Email Length (<150 words)", "status": "FAIL", "penalty": 20})
            else:
                results["checks"].append({"name": "Email Length (<150 words)", "status": "PASS", "penalty": 0})

        # 4. Vérification de Présence de Call-To-Action (CTA) (-20 pts si absent)
        cta_keywords = ["?", "discuter", "échange", "rendez-vous", "cliquez", "découvrir", "lien", "appel"]
        has_cta = any(k in text.lower() for k in cta_keywords)
        if not has_cta:
            results["score"] -= 20
            results["violations"].append("Aucun appel à l'action (CTA) explicite détecté.")
            results["checks"].append({"name": "Call To Action Clarity", "status": "FAIL", "penalty": 20})
        else:
            results["checks"].append({"name": "Call To Action Clarity", "status": "PASS", "penalty": 0})

        results["score"] = max(0, results["score"])
        results["passed"] = results["score"] >= 80

        return results


if __name__ == "__main__":
    sample = """
    Bonjour Thomas,
    J'ai vu que vous cherchiez à révolutionner votre acquisition.
    Notre solution est un game-changer absolu.
    Seriez-vous ouvert à un rapide échange de 10 min mardi prochain ?
    """
    
    scorer = GTMEvalScorer()
    res = scorer.score_content(sample, "email")
    print("=== 📊 RAPPORT HARNESS GTM (INSPECT AI / PROMPTFOO) ===")
    print(f"Score : {res['score']}/100 | Statut : {'✅ VALIDE' if res['passed'] else '❌ REJETÉ'}\n")
    for chk in res["checks"]:
        print(f"  [{chk['status']}] {chk['name']} (Pénalité: -{chk['penalty']} pts)")
    if res["violations"]:
        print("\n⚠️ Violations à corriger :")
        for v in res["violations"]:
            print(f"  - {v}")
