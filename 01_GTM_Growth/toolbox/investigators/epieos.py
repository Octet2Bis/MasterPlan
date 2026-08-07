"""
epieos.py — Investigator Epieos (API / Scripting)

L'outil fondamental pour lier un email à des comptes existants
(Google Maps, Skype, etc.) sans interroger le serveur SMTP.
"""

import os
from toolbox.base_tool import BaseInvestigator, InvestigatorResult, QuotaExceededError


class EpieosInvestigator(BaseInvestigator):
    name = "Epieos"
    env_key = "EPIEOS_API_KEY"

    def investigate(self, email: str) -> InvestigatorResult:
        api_key = os.getenv(self.env_key)
        if not api_key or not email:
            return InvestigatorResult(source=self.name)

        # Epieos API v1
        resp = self._safe_request("get", f"https://api.epieos.com/v1/search", params={
            "email": email,
            "key": api_key,
        })

        if resp.status_code == 200:
            data = resp.json()
            findings = {}

            # Comptes sociaux détectés
            accounts = data.get("accounts", [])
            if accounts:
                findings["social_accounts"] = [
                    {"platform": a.get("name", ""), "url": a.get("url", "")}
                    for a in accounts
                ]

            # Informations Google (nom, photo, maps)
            google_data = data.get("google", {})
            if google_data:
                findings["google"] = {
                    "name": google_data.get("name", ""),
                    "photo": google_data.get("photo", ""),
                    "maps_reviews": google_data.get("maps_reviews", 0),
                }

            confidence = min(90, len(accounts) * 15 + 20) if accounts else 10
            return InvestigatorResult(
                findings=findings,
                source=self.name,
                confidence=confidence
            )

        return InvestigatorResult(source=self.name)
