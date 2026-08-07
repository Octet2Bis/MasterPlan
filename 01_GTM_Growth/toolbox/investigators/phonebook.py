"""
phonebook.py — Investigator phonebook.cz / Intelligence X (API)

Base de données massive pour rechercher des occurrences d'emails
ou de domaines dans des archives historiques (Deep Web).
"""

import os
from toolbox.base_tool import BaseInvestigator, InvestigatorResult, QuotaExceededError


class PhonebookInvestigator(BaseInvestigator):
    name = "Phonebook/IntelX"
    env_key = "INTELX_API_KEY"

    def investigate(self, email: str) -> InvestigatorResult:
        api_key = os.getenv(self.env_key)
        if not api_key or not email:
            return InvestigatorResult(source=self.name)

        # Intelligence X — Phonebook API
        # Étape 1 : Lancer la recherche
        resp = self._safe_request("post", "https://2.intelx.io/phonebook/search", 
            headers={"x-key": api_key},
            json={
                "term": email,
                "maxresults": 20,
                "media": 0,
                "target": 1,  # 1 = emails
                "timeout": 10,
            }
        )

        if resp.status_code != 200:
            return InvestigatorResult(source=self.name)

        search_id = resp.json().get("id")
        if not search_id:
            return InvestigatorResult(source=self.name)

        # Étape 2 : Récupérer les résultats
        import time
        time.sleep(2)  # Attendre que la recherche se termine

        results_resp = self._safe_request("get",
            f"https://2.intelx.io/phonebook/search/result",
            headers={"x-key": api_key},
            params={"id": search_id, "limit": 20}
        )

        if results_resp.status_code == 200:
            data = results_resp.json()
            selectors = data.get("selectors", [])

            findings = {
                "related_emails": [],
                "related_domains": [],
                "related_urls": [],
            }

            for sel in selectors:
                selector_type = sel.get("selectortype", 0)
                value = sel.get("selectorvalue", "")
                if selector_type == 1:  # Email
                    findings["related_emails"].append(value)
                elif selector_type == 2:  # Domain
                    findings["related_domains"].append(value)
                elif selector_type == 3:  # URL
                    findings["related_urls"].append(value)

            total_found = len(selectors)
            confidence = min(80, total_found * 10 + 15) if total_found > 0 else 5
            return InvestigatorResult(
                findings=findings,
                source=self.name,
                confidence=confidence
            )

        return InvestigatorResult(source=self.name)
