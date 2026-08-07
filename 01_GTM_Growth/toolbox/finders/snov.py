"""
snov.py — Finder Snov.io (API)

Alternative solide dans la rotation de cascade.
Tier gratuit : 50 crédits/mois.
"""

import os
from toolbox.base_tool import BaseFinder, FinderResult, QuotaExceededError


class SnovFinder(BaseFinder):
    name = "Snov.io"
    env_key = "SNOV_API_KEY"

    def _get_access_token(self) -> str | None:
        """Snov.io utilise un flow OAuth client_credentials pour obtenir un access_token."""
        client_id = os.getenv("SNOV_CLIENT_ID", os.getenv(self.env_key))
        client_secret = os.getenv("SNOV_CLIENT_SECRET", "")
        if not client_id:
            return None
        try:
            resp = self._safe_request("post", "https://api.snov.io/v1/oauth/access_token", json={
                "grant_type": "client_credentials",
                "client_id": client_id,
                "client_secret": client_secret,
            })
            if resp.status_code == 200:
                return resp.json().get("access_token")
        except QuotaExceededError:
            pass
        return None

    def find(self, first_name: str, last_name: str, domain: str) -> FinderResult:
        token = self._get_access_token()
        if not token:
            return FinderResult(source=self.name)

        resp = self._safe_request("post", "https://api.snov.io/v1/get-emails-from-names", json={
            "access_token": token,
            "firstName": first_name,
            "lastName": last_name,
            "domain": domain,
        })

        if resp.status_code == 200:
            data = resp.json().get("data", {})
            emails = data.get("emails", [])
            if emails:
                best = emails[0]
                email = best.get("email")
                score = best.get("emailStatusInt", 70)
                return FinderResult(email=email, source=self.name, raw_score=score)

        return FinderResult(source=self.name)
