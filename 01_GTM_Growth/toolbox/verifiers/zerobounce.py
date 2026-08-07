"""
zerobounce.py — Verifier ZeroBounce (API)

L'outil de référence pour vérifier le statut SMTP exact d'un email
(Valid, Catch-All, Invalid) avant l'injection dans le CRM.
Tier gratuit : 100 vérifications/mois.
"""

import os
from toolbox.base_tool import BaseVerifier, VerifierResult, QuotaExceededError


class ZeroBounceVerifier(BaseVerifier):
    name = "ZeroBounce"
    env_key = "ZEROBOUNCE_API_KEY"

    # Mapping des statuts ZeroBounce vers nos statuts normalisés
    STATUS_MAP = {
        "valid":        "Valid",
        "catch-all":    "Catch-All",
        "invalid":      "Invalid",
        "do_not_mail":  "Risky",
        "spamtrap":     "Risky",
        "abuse":        "Risky",
        "unknown":      "Not Verified",
    }

    SCORE_MAP = {
        "Valid":        100,
        "Catch-All":    75,
        "Risky":        35,
        "Invalid":       0,
        "Not Verified": 50,
    }

    def verify(self, email: str) -> VerifierResult:
        api_key = os.getenv(self.env_key)
        if not api_key or not email:
            return VerifierResult()

        resp = self._safe_request("get", "https://api.zerobounce.net/v2/validate", params={
            "api_key": api_key,
            "email": email,
        })

        if resp.status_code == 200:
            res = resp.json()
            raw_status = res.get("status", "").lower()
            status = self.STATUS_MAP.get(raw_status, "Not Verified")
            score = self.SCORE_MAP.get(status, 50)
            return VerifierResult(status=status, score=score)

        return VerifierResult()
