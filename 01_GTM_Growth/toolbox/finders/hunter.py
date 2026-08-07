"""
hunter.py — Finder Hunter.io (API)

Le standard pour identifier le pattern d'email d'un nom de domaine.
Tier gratuit : 25 recherches/mois.
"""

import os
from toolbox.base_tool import BaseFinder, FinderResult, QuotaExceededError


class HunterFinder(BaseFinder):
    name = "Hunter"
    env_key = "HUNTER_API_KEY"

    def find(self, first_name: str, last_name: str, domain: str) -> FinderResult:
        api_key = os.getenv(self.env_key)
        if not api_key:
            return FinderResult(source=self.name)

        resp = self._safe_request("get", "https://api.hunter.io/v2/email-finder", params={
            "domain": domain,
            "first_name": first_name,
            "last_name": last_name,
            "api_key": api_key,
        })

        if resp.status_code == 200:
            data = resp.json().get("data", {})
            email = data.get("email")
            score = data.get("score", 75) if email else 0
            return FinderResult(email=email, source=self.name, raw_score=score)

        return FinderResult(source=self.name)
