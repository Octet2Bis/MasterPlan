"""
emailrep.py — Investigator EmailRep / emailrep.io (API)

Vérifie la réputation d'une adresse email :
- Âge estimé de l'email
- Signalements pour spam
- Adresse jetable détectée
- Présence sur des listes de fuites
"""

import os
from toolbox.base_tool import BaseInvestigator, InvestigatorResult, QuotaExceededError


class EmailRepInvestigator(BaseInvestigator):
    name = "EmailRep"
    env_key = "EMAILREP_API_KEY"

    def investigate(self, email: str) -> InvestigatorResult:
        if not email:
            return InvestigatorResult(source=self.name)

        headers = {"User-Agent": "Antigravity-OSINT/1.0"}
        api_key = os.getenv(self.env_key)
        if api_key:
            headers["Key"] = api_key

        resp = self._safe_request("get", f"https://emailrep.io/{email}",
            headers=headers
        )

        if resp.status_code == 200:
            data = resp.json()
            findings = {
                "reputation": data.get("reputation", "none"),
                "suspicious": data.get("suspicious", False),
                "references": data.get("references", 0),
                "details": {
                    "disposable": data.get("details", {}).get("disposable", False),
                    "free_provider": data.get("details", {}).get("free_provider", False),
                    "spam": data.get("details", {}).get("spam", False),
                    "data_breach": data.get("details", {}).get("data_breach", False),
                    "credentials_leaked": data.get("details", {}).get("credentials_leaked", False),
                    "first_seen": data.get("details", {}).get("first_seen", "never"),
                    "profiles": data.get("details", {}).get("profiles", []),
                }
            }

            # Calculer la confiance basée sur la réputation
            rep = data.get("reputation", "none")
            confidence_map = {"high": 90, "medium": 60, "low": 30, "none": 10}
            confidence = confidence_map.get(rep, 10)

            return InvestigatorResult(
                findings=findings,
                source=self.name,
                confidence=confidence
            )

        return InvestigatorResult(source=self.name)
