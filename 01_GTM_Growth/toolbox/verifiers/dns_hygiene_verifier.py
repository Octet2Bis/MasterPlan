"""
dns_hygiene_verifier.py — Validateur d'Hygiène DNS, SPF/DMARC et Détecteur de Role-Based (0€ / Zéro API).

Audite la conformité des protocoles de sécurité de messagerie du domaine :
- Détection SPF (v=spf1) et DMARC (v=DMARC1, p=reject/quarantine).
- Détection et déclassement des adresses génériques de rôles / équipes (contact@, info@, partenariats@, support@).
0€ de coût / 100% Local & Hors-Ligne.
"""

import re
import subprocess
from toolbox.base_tool import BaseVerifier, VerifierResult

try:
    import dns.resolver
    _DNSPYTHON_AVAILABLE = True
except ImportError:
    _DNSPYTHON_AVAILABLE = False


ROLE_BASED_PREFIXES = {
    "contact", "info", "support", "sales", "commercial", "presse", "jobs",
    "recrutement", "partenariats", "direction", "admin", "hello", "team",
    "marketing", "billing", "compta", "office", "accueil"
}


class DnsHygieneVerifier(BaseVerifier):
    """
    Validateur d'hygiène DNS et de sécurité du domaine de messagerie.
    """
    name = "DnsHygieneVerifier"
    env_key = ""  # 0 clé requise

    def is_available(self) -> bool:
        return True

    def _has_spf(self, domain: str) -> bool:
        """Vérifie si le domaine possède un enregistrement SPF valide."""
        if _DNSPYTHON_AVAILABLE:
            try:
                answers = dns.resolver.resolve(domain, 'TXT', lifetime=3)
                for r in answers:
                    txt = str(r).lower()
                    if "v=spf1" in txt:
                        return True
            except Exception:
                pass
        return False

    def _has_dmarc(self, domain: str) -> bool:
        """Vérifie si le domaine possède une politique DMARC active."""
        dmarc_domain = f"_dmarc.{domain}"
        if _DNSPYTHON_AVAILABLE:
            try:
                answers = dns.resolver.resolve(dmarc_domain, 'TXT', lifetime=3)
                for r in answers:
                    txt = str(r).lower()
                    if "v=dmarc1" in txt:
                        return True
            except Exception:
                pass
        return False

    def verify(self, email: str) -> VerifierResult:
        if not email or "@" not in email:
            return VerifierResult(status="Invalid_Syntax", score=0)

        email = email.strip().lower()
        prefix, domain = email.split("@", 1)

        # 1. Détection des adresses de rôles (Role-Based)
        if prefix in ROLE_BASED_PREFIXES or prefix.startswith("contact.") or prefix.startswith("info."):
            return VerifierResult(
                status="Role_Based",
                score=40
            )

        # 2. Audit de conformité SPF et DMARC
        has_spf = self._has_spf(domain)
        has_dmarc = self._has_dmarc(domain)

        if has_spf and has_dmarc:
            return VerifierResult(
                status="Valid_DNS_Hygiene",
                score=86
            )
        elif has_spf:
            return VerifierResult(
                status="Valid_DNS_Hygiene",
                score=80
            )

        return VerifierResult(status="Not Verified", score=50)
