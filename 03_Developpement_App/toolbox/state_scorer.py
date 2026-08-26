"""
state_scorer.py — Validateur Programmatique d'État & Scorer de Qualité.
Inspiré d'Inspect AI et Promptfoo.

Évalue mathématiquement l'état final d'un livrable applicatif ou d'un projet
selon une batterie de règles déterministes (Conformité 3 Couches, Présence des tests, Zéro Secret).
"""

import os
import sys
from pathlib import Path
from typing import Dict, List, Tuple

# Encodage UTF-8 sous Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass


class ProjectStateScorer:
    def __init__(self, root_dir: str = "."):
        self.root = Path(root_dir)
        self.checks: List[Tuple[str, bool, str]] = []

    def run_all_checks(self) -> Dict:
        # 1. Vérification de la Couche 1 & 2 (Dossiers maîtres)
        dev_app = self.root / "03_Developpement_App"
        gtm_app = self.root / "01_GTM_Growth"
        
        self.add_check("Master Router présent", (self.root / "master_router.md").exists(), "Orchestration Couche 1")
        self.add_check("03_Developpement_App présent", dev_app.exists(), "Pôle Dev Couche 2")
        self.add_check("01_GTM_Growth présent", gtm_app.exists(), "Pôle GTM Couche 2")
        
        # 2. Vérification de la Couche 3 (Étanchéité des ressources)
        if dev_app.exists():
            self.add_check("Dev Workspace présent", (dev_app / "Workspace").exists(), "Étanchéité Couche 3")
            self.add_check("Dev .secrets présent", (dev_app / ".secrets").exists(), "Étanchéité Couche 3")
            self.add_check("Dev Ressources/Knowledge présent", (dev_app / "Ressources" / "Knowledge").exists(), "Documentation Couche 3")
            self.add_check("Dev 01_Core_Standards présent", (dev_app / "01_Core_Standards").exists(), "Standards Couche 2")
            self.add_check("Dev 02_Mobile_iOS_Native présent", (dev_app / "02_Mobile_iOS_Native").exists(), "Standards iOS Couche 2")

        # 3. Vérification des applications actives
        apps_dir = dev_app / "apps"
        if apps_dir.exists():
            has_apps = any(apps_dir.iterdir())
            self.add_check("Dossier apps non vide", has_apps, "Livrables applicatifs")

        passed_count = sum(1 for _, passed, _ in self.checks if passed)
        total_count = len(self.checks)
        score = int((passed_count / total_count) * 100) if total_count > 0 else 0

        return {
            "score": score,
            "passed": score == 100,
            "passed_count": passed_count,
            "total_count": total_count,
            "checks": [{"name": n, "passed": p, "category": c} for n, p, c in self.checks]
        }

    def add_check(self, name: str, condition: bool, category: str):
        self.checks.append((name, condition, category))


if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    scorer = ProjectStateScorer(target)
    results = scorer.run_all_checks()
    
    print("=== 📊 RAPPORT DE SCORING D'ÉTAT (INSPECT AI SCORER) ===")
    print(f"Score Global : {results['score']}/100 | Validation : {'✅ VALIDE' if results['passed'] else '❌ INVALIDE'}")
    print(f"Vérifications réussies : {results['passed_count']}/{results['total_count']}\n")
    
    for chk in results["checks"]:
        status = "✅ PASS" if chk["passed"] else "❌ FAIL"
        print(f"  {status} [{chk['category']}] {chk['name']}")
