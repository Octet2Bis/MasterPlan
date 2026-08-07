"""
dropcontact.py — Finder Dropcontact (API - Premium)

Excellent pour le marché européen (RGPD) et les leads difficiles.
À placer en fin de cascade (coût plus élevé).
"""

import os
from toolbox.base_tool import BaseFinder, FinderResult, QuotaExceededError


class DropcontactFinder(BaseFinder):
    name = "Dropcontact"
    env_key = "DROPCONTACT_API_KEY"

    def find(self, first_name: str, last_name: str, domain: str) -> FinderResult:
        api_key = os.getenv(self.env_key)
        if not api_key:
            return FinderResult(source=self.name)

        resp = self._safe_request("post", "https://api.dropcontact.com/v1/contact/enrich",
            headers={
                "X-Access-Token": api_key,
                "Content-Type": "application/json",
            },
            json={
                "data": [{"first_name": first_name, "last_name": last_name, "company": domain}]
            }
        )

        if resp.status_code == 200:
            result = resp.json()
            data_list = result.get("data", [])
            if data_list and isinstance(data_list, list):
                email_info = data_list[0].get("email", [])
                if email_info and isinstance(email_info, list):
                    email = email_info[0].get("email")
                    return FinderResult(email=email, source=self.name, raw_score=85)

        return FinderResult(source=self.name)
