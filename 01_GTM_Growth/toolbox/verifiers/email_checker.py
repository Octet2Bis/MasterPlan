"""
email_checker.py — Verifier Email-Checker / MailboxValidator (API)

Solution de secours supplémentaire dans la cascade de vérification.
Tier gratuit : variable selon le fournisseur.
"""

import os
from toolbox.base_tool import BaseVerifier, VerifierResult, QuotaExceededError


class EmailCheckerVerifier(BaseVerifier):
    name = "EmailChecker"
    env_key = "EMAILCHECKER_API_KEY"

    def verify(self, email: str) -> VerifierResult:
        api_key = os.getenv(self.env_key)
        if not api_key or not email:
            return VerifierResult()

        # Email-Checker.net API
        resp = self._safe_request("get", "https://api.email-checker.net/verify/v1", params={
            "key": api_key,
            "email": email,
        })

        if resp.status_code == 200:
            res = resp.json()
            result_status = res.get("result", "unknown").lower()

            if result_status == "ok":
                return VerifierResult(status="Valid", score=95)
            elif result_status in ("error", "bad_mailbox"):
                return VerifierResult(status="Invalid", score=0)
            elif result_status == "accept_all":
                return VerifierResult(status="Catch-All", score=70)
            else:
                return VerifierResult(status="Risky", score=40)

        return VerifierResult()
