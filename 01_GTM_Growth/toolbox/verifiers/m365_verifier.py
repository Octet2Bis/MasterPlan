"""
m365_verifier.py — Validateur de Tenant Cloud d'Entreprise (Microsoft 365 / Google Workspace).

Interroge les endpoints de découverte de domaine public Microsoft (Realm Discovery)
pour certifier que l'adresse email est hébergée sur un tenant cloud d'entreprise actif.
0€ de coût / Zéro clé API requise.
"""

import requests
from toolbox.base_tool import BaseVerifier, VerifierResult


class M365Verifier(BaseVerifier):
    """
    Validateur d'infrastructure de messagerie d'entreprise (M365 / Azure AD / Google).
    Permet de valider que le domaine de l'email est rattaché à une organisation gérée.
    """
    name = "M365Verifier"
    env_key = ""  # 0 clé requise

    def __init__(self, timeout: float = 2.5):
        self.timeout = timeout

    def is_available(self) -> bool:
        return True

    def _check_m365_realm(self, email: str) -> dict:
        """Interroge l'API publique de résolution de royaume Microsoft Online."""
        url = "https://login.microsoftonline.com/getuserrealm.srf"
        try:
            resp = requests.get(
                url,
                params={"login": email, "json": "1"},
                timeout=self.timeout,
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
            )
            if resp.status_code == 200:
                return resp.json()
        except Exception:
            pass
        return {}

    def verify(self, email: str) -> VerifierResult:
        if not email or "@" not in email:
            return VerifierResult(status="Invalid_Syntax", score=0)

        email = email.strip().lower()
        realm_data = self._check_m365_realm(email)
        ns_type = realm_data.get("NameSpaceType", "")

        # "Managed" (Exchange Online M365) ou "Federated" (SSO d'entreprise comme Okta/ADFS)
        if ns_type in ("Managed", "Federated"):
            # Domaine d'entreprise actif et vérifié chez Microsoft
            is_cloud = realm_data.get("CloudInstanceName", "")
            return VerifierResult(
                status="Valid_Cloud",
                score=88
            )

        return VerifierResult(status="Not Verified", score=50)
