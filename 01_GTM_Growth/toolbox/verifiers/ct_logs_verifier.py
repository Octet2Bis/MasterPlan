"""
ct_logs_verifier.py — Validateur d'Infrastructure par Logs de Transparence TLS (0€ / Zéro API).

Interroge les registres publics mondiaux de certificats SSL/TLS (Certificate Transparency Logs via crt.sh)
pour auditer l'infrastructure de messagerie officielle de l'entreprise (mail.*, webmail.*, owa.*, autodiscover.*, smtp.*).
Preuve formelle d'activité IT et de serveurs de messagerie activement maintenus.
"""

import requests
from typing import Dict, Set
from toolbox.base_tool import BaseVerifier, VerifierResult

# Sous-domaines caractéristiques d'une infrastructure de messagerie d'entreprise active
MAIL_SUBDOMAIN_INDICATORS = {
    "mail.", "webmail.", "owa.", "autodiscover.", "exchange.", "smtp.",
    "zimbra.", "email.", "mx.", "relay.", "mta.", "roundcube."
}

# Cache mémoire pour éviter les requêtes redondantes sur un même domaine
_CT_LOGS_CACHE: Dict[str, bool] = {}


class CtLogsVerifier(BaseVerifier):
    """
    Validateur d'infrastructure de messagerie par Certificate Transparency Logs.
    """
    name = "CtLogsVerifier"
    env_key = ""  # 0 clé requise

    def __init__(self, timeout: float = 2.0):
        self.timeout = timeout

    def is_available(self) -> bool:
        return True

    def _query_ct_logs(self, domain: str) -> bool:
        """Interroge l'API publique crt.sh pour extraire les sous-domaines de messagerie certifiés."""
        if domain in _CT_LOGS_CACHE:
            return _CT_LOGS_CACHE[domain]

        url = f"https://crt.sh/?q=%.{domain}&output=json"
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        try:
            resp = requests.get(url, headers=headers, timeout=self.timeout)
            if resp.status_code == 200:
                data = resp.json()
                for entry in data[:60]:  # Inspecter les certificats récents
                    name_value = str(entry.get("name_value", "")).lower()
                    for indicator in MAIL_SUBDOMAIN_INDICATORS:
                        if indicator in name_value:
                            _CT_LOGS_CACHE[domain] = True
                            return True
        except Exception:
            pass

        _CT_LOGS_CACHE[domain] = False
        return False

    def verify(self, email: str) -> VerifierResult:
        if not email or "@" not in email:
            return VerifierResult(status="Invalid_Syntax", score=0)

        domain = email.split("@")[-1].strip().lower()

        if self._query_ct_logs(domain):
            return VerifierResult(
                status="Valid_CT_Logs",
                score=84
            )

        return VerifierResult(status="Not Verified", score=50)
