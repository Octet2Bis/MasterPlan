"""
sso_realm_verifier.py — Validateur Multi-Fournisseurs SSO & Sonde de Compte O365 (0€ / Zéro API).

Interroge les annuaires publics d'authentification et protocoles d'identité d'entreprise :
1. Sonde de Compte Microsoft 365 / Azure AD (GetCredentialType & Autodiscover) :
   Vérifie si le compte utilisateur individuel existe réellement dans le tenant Azure AD.
2. Microsoft 365 / Azure AD Realm Discovery (Managed vs Federated SSO).
3. Google Workspace Cloud Identity.
4. Endpoints OpenID Connect d'entreprise (/.well-known/openid-configuration).
0€ de coût / Zéro clé requise / 0 ping SMTP.
"""

import requests
from toolbox.base_tool import BaseVerifier, VerifierResult
from toolbox.core.dns_check import get_mx_hosts


class SsoRealmVerifier(BaseVerifier):
    """
    Validateur d'infrastructure d'identité d'entreprise (SSO, OIDC, SAML, M365, Google).
    """
    name = "SsoRealmVerifier"
    env_key = ""  # 0 clé requise

    def __init__(self, timeout: float = 2.5):
        self.timeout = timeout

    def is_available(self) -> bool:
        return True

    def _check_m365_user_account(self, email: str) -> str:
        """
        Interroge l'endpoint public GetCredentialType d'Azure AD.
        Retourne :
        - 'EXISTS' : Le compte utilisateur individuel existe formellement dans Azure AD (IfExistsResult == 0).
        - 'FEDERATED' : Le domaine est fédéré / SSO (IfExistsResult == 5).
        - 'NOT_EXISTS' : Le compte n'existe pas dans le tenant (IfExistsResult == 1).
        - 'UNKNOWN' : Erreur ou pas de réponse.
        """
        url = "https://login.microsoftonline.com/common/GetCredentialType"
        payload = {"username": email, "isOtherIdpSupported": True}
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "Content-Type": "application/json"
        }
        try:
            resp = requests.post(url, json=payload, headers=headers, timeout=self.timeout)
            if resp.status_code == 200:
                data = resp.json()
                res = data.get("IfExistsResult")
                if res == 0:
                    return "EXISTS"
                elif res in (5, 6):
                    return "FEDERATED"
                elif res == 1:
                    return "NOT_EXISTS"
        except Exception:
            pass
        return "UNKNOWN"

    def _check_m365_realm(self, email: str) -> bool:
        """Vérifie le rattachement du domaine à un tenant Microsoft 365 / Azure AD."""
        url = "https://login.microsoftonline.com/getuserrealm.srf"
        try:
            resp = requests.get(
                url,
                params={"login": email, "json": "1"},
                timeout=self.timeout,
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
            )
            if resp.status_code == 200:
                data = resp.json()
                ns_type = data.get("NameSpaceType", "")
                return ns_type in ("Managed", "Federated")
        except Exception:
            pass
        return False

    def _check_google_workspace(self, domain: str) -> bool:
        """Vérifie si le domaine est géré par Google Workspace."""
        mx_hosts = get_mx_hosts(domain)
        for h in mx_hosts:
            if "google.com" in h.lower() or "googlemail.com" in h.lower():
                return True
        return False

    def _check_oidc_discovery(self, domain: str) -> bool:
        """Vérifie si l'entreprise expose un portail SSO OpenID Connect public."""
        urls = [
            f"https://{domain}/.well-known/openid-configuration",
            f"https://sso.{domain}/.well-known/openid-configuration",
            f"https://identity.{domain}/.well-known/openid-configuration"
        ]
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        for u in urls:
            try:
                resp = requests.get(u, headers=headers, timeout=1.2)
                if resp.status_code == 200 and "issuer" in resp.text:
                    return True
            except Exception:
                continue
        return False

    def verify(self, email: str) -> VerifierResult:
        if not email or "@" not in email:
            return VerifierResult(status="Invalid_Syntax", score=0)

        email = email.strip().lower()
        domain = email.split("@")[-1]

        # 1. Sonde de compte individuel Azure AD / M365 (Inspiré o365spray)
        m365_account_status = self._check_m365_user_account(email)
        if m365_account_status == "EXISTS":
            # Compte utilisateur individuel confirmé vivant dans Azure AD !
            return VerifierResult(
                status="Valid_O365_Account",
                score=98
            )
        elif m365_account_status == "FEDERATED":
            # Tenant fédéré d'entreprise confirmé
            return VerifierResult(
                status="Valid_SSO",
                score=90
            )

        # 2. Vérification Realm Microsoft 365 (si non détecté par la sonde directe)
        if self._check_m365_realm(email):
            return VerifierResult(
                status="Valid_SSO",
                score=90
            )

        # 3. Vérification Google Workspace
        if self._check_google_workspace(domain):
            return VerifierResult(
                status="Valid_SSO",
                score=88
            )

        # 4. Vérification Portail OIDC / SSO d'entreprise
        if self._check_oidc_discovery(domain):
            return VerifierResult(
                status="Valid_SSO",
                score=88
            )

        return VerifierResult(status="Not Verified", score=50)
