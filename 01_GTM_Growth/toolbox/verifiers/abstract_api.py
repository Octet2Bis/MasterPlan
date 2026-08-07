"""
abstract_api.py — Verifier AbstractAPI (API)

Solution de secours si ZeroBounce est indisponible.
Tier gratuit : 100 vérifications/mois.
"""

import os
from toolbox.base_tool import BaseVerifier, VerifierResult, QuotaExceededError


class AbstractApiVerifier(BaseVerifier):
    name = "AbstractAPI"
    env_key = "ABSTRACT_API_KEY"

    def verify(self, email: str) -> VerifierResult:
        api_key = os.getenv(self.env_key)
        if not api_key or not email:
            return VerifierResult()

        resp = self._safe_request("get", "https://emailvalidation.abstractapi.com/v1/", params={
            "api_key": api_key,
            "email": email,
        })

        if resp.status_code == 200:
            res = resp.json()
            deliverability = res.get("deliverability", "")
            quality_score = float(res.get("quality_score", 0.5)) * 100

            if deliverability == "DELIVERABLE":
                return VerifierResult(status="Valid", score=int(quality_score))
            elif deliverability == "UNDELIVERABLE":
                return VerifierResult(status="Invalid", score=0)
            else:
                return VerifierResult(status="Risky", score=int(quality_score))

        return VerifierResult()
