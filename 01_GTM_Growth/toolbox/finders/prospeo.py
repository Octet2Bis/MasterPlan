"""
prospeo.py — Finder Prospeo (API)

Alternative solide dans la rotation de cascade.
Tier gratuit : 75 crédits/mois.
"""

import os
from toolbox.base_tool import BaseFinder, FinderResult, QuotaExceededError


class ProspeoFinder(BaseFinder):
    name = "Prospeo"
    env_key = "PROSPEO_API_KEY"

    def find(self, first_name: str, last_name: str, domain: str) -> FinderResult:
        api_key = os.getenv(self.env_key)
        if not api_key:
            return FinderResult(source=self.name)

        resp = self._safe_request("post", "https://api.prospeo.io/email-finder",
            headers={
                "Content-Type": "application/json",
                "X-KEY": api_key,
            },
            json={
                "first_name": first_name,
                "last_name": last_name,
                "company": domain,
            }
        )

        if resp.status_code == 200:
            data = resp.json().get("response", {})
            email = data.get("email")
            confidence = data.get("email_confidence", 70) if email else 0
            return FinderResult(email=email, source=self.name, raw_score=confidence)

        return FinderResult(source=self.name)
