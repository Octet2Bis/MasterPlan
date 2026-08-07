"""
tomba.py — Finder Tomba.io (API)

Alternative solide à Hunter pour la rotation de cascade.
Tier gratuit : 50 recherches/mois.
"""

import os
from toolbox.base_tool import BaseFinder, FinderResult, QuotaExceededError


class TombaFinder(BaseFinder):
    name = "Tomba"
    env_key = "TOMBA_API_KEY"

    def find(self, first_name: str, last_name: str, domain: str) -> FinderResult:
        api_key = os.getenv(self.env_key)
        if not api_key:
            return FinderResult(source=self.name)

        resp = self._safe_request("get", "https://api.tomba.io/v1/email-finder",
            headers={"X-Tomba-Key": api_key},
            params={
                "domain": domain,
                "first_name": first_name,
                "last_name": last_name,
            }
        )

        if resp.status_code == 200:
            data = resp.json().get("data", {})
            email = data.get("email")
            score = data.get("score", 75) if email else 0
            return FinderResult(email=email, source=self.name, raw_score=score)

        return FinderResult(source=self.name)
