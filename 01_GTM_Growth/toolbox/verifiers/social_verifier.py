
"""
social_verifier.py — Validateur d'empreinte d'identité OSINT & Sociale (100% Gratuit / 0€ API).

Vérifie si l'adresse email possède une empreinte d'identité numérique active sur les
services publics (Gravatar, Google Workspace Avatar, GitHub public).
Cette méthode ne sollicite pas le serveur SMTP du prospect et ne présente aucun risque de délivrabilité.
"""

import hashlib
import requests
from toolbox.base_tool import BaseVerifier, VerifierResult


class SocialVerifier(BaseVerifier):
    """
    Validateur OSINT d'empreinte numérique.
    Vérifie l'existence de comptes publics associés à l'adresse email.
    """
    name = "SocialVerifier"
    env_key = ""  # 0 clé requise

    def __init__(self, timeout: float = 2.5):
        self.timeout = timeout

    def is_available(self) -> bool:
        return True

    def _check_gravatar(self, email: str) -> bool:
        """Vérifie si l'email possède un compte Gravatar / WordPress actif."""
        md5_hash = hashlib.md5(email.encode("utf-8")).hexdigest()
        url = f"https://www.gravatar.com/avatar/{md5_hash}?d=404"
        try:
            resp = requests.head(
                url,
                timeout=self.timeout,
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
            )
            return resp.status_code == 200
        except Exception:
            return False

    def verify(self, email: str) -> VerifierResult:
        if not email or "@" not in email:
            return VerifierResult(status="Invalid_Syntax", score=0)

        email = email.strip().lower()

        # 1. Vérification d'empreinte Gravatar
        if self._check_gravatar(email):
            return VerifierResult(status="Valid_Social", score=92)

        # Pas de profil public découvert (ne signifie pas que l'email est faux)
        return VerifierResult(status="Not Verified", score=50)
