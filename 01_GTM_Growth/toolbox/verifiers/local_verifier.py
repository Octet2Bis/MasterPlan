"""
local_verifier.py — Validateur technique d'email 100% local (0€ / Zéro API).

Vérifie la conformité syntaxique (RFC 5322), la présence d'enregistrements MX
et l'absence de domaine jetable (disposable email).
"""

import re
from toolbox.base_tool import BaseVerifier, VerifierResult
from toolbox.core.dns_check import has_mx_record

# Liste des domaines d'emails jetables courants
DISPOSABLE_DOMAINS = {
    "mailinator.com", "yopmail.com", "guerrillamail.com", "tempmail.com",
    "10minutemail.com", "trashmail.com", "getairmail.com", "sharklasers.com",
    "throwawaymail.com", "temp-mail.org", "fakeinbox.com"
}

EMAIL_REGEX = re.compile(
    r"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$"
)


class LocalVerifier(BaseVerifier):
    """
    Validateur local gratuit ne nécessitant aucune clé d'API.
    Vérifie la syntaxe, les serveurs MX et filtre les domaines jetables.
    """
    name = "LocalVerifier"
    env_key = ""  # 0 clé requise

    def is_available(self) -> bool:
        return True

    def verify(self, email: str) -> VerifierResult:
        if not email or not isinstance(email, str):
            return VerifierResult(status="Invalid", score=0)

        email = email.strip().lower()

        # 1. Validation de la syntaxe
        if not EMAIL_REGEX.match(email):
            return VerifierResult(status="Invalid_Syntax", score=0)

        domain = email.split("@")[-1]

        # 2. Filtrage des emails jetables
        if domain in DISPOSABLE_DOMAINS:
            return VerifierResult(status="Disposable", score=10)

        # 3. Vérification des serveurs MX du domaine
        if not has_mx_record(domain):
            return VerifierResult(status="No_MX", score=0)

        # Si syntaxe OK + MX actifs + Non jetable
        return VerifierResult(status="Valid_MX", score=65)
