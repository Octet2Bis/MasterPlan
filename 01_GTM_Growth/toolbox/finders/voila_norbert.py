"""
voila_norbert.py — Finder Voila Norbert (API)

L'un des moteurs de recherche B2B les plus précis du marché.
Tier gratuit : 50 leads/mois.
"""

import os
from toolbox.base_tool import BaseFinder, FinderResult, QuotaExceededError


class VoilaNorbertFinder(BaseFinder):
    name = "Voila Norbert"
    env_key = "VOILANORBERT_API_KEY"

    def find(self, first_name: str, last_name: str, domain: str) -> FinderResult:
        api_key = os.getenv(self.env_key)
        if not api_key:
            return FinderResult(source=self.name)

        resp = self._safe_request("post", "https://api.voilanorbert.com/2018-01-08/search/new",
            auth=("", api_key),
            json={
                "name": f"{first_name} {last_name}",
                "domain": domain,
            }
        )

        if resp.status_code == 200:
            data = resp.json()
            email = data.get("email", {}).get("email")
            score = data.get("email", {}).get("score", 80) if email else 0
            return FinderResult(email=email, source=self.name, raw_score=score)

        return FinderResult(source=self.name)
