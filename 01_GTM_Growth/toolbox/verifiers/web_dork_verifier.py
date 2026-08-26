"""
web_dork_verifier.py — Validateur OSINT de Citations Documentaires Web (0€ / Zéro API).

Recherche si l'adresse email exacte apparaît textuellement sur le web public
(communiqués de presse, PDF institutionnels, comptes rendus d'assemblées, mentions légales).
Si l'email est indexé publiquement ➔ Certitude absolue (Score = 100/100).
"""

import re
import urllib.parse
import requests
from toolbox.base_tool import BaseVerifier, VerifierResult


class WebDorkVerifier(BaseVerifier):
    """
    Validateur de citations documentaires publiques.
    Recherche l'email exact entre guillemets sur les moteurs de recherche publics.
    """
    name = "WebDorkVerifier"
    env_key = ""  # 0 clé requise

    def __init__(self, timeout: float = 2.5):
        self.timeout = timeout

    def is_available(self) -> bool:
        return True

    def _search_duckduckgo_lite(self, email: str) -> bool:
        """Recherche l'email exact via l'interface publique DuckDuckGo Lite."""
        query = f'"{email}"'
        url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote(query)}"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3"
        }
        try:
            resp = requests.get(url, headers=headers, timeout=self.timeout)
            if resp.status_code == 200 and email.lower() in resp.text.lower():
                # Vérifier que l'occurrence n'est pas juste dans la barre de recherche
                # en cherchant l'email dans les corps des résultats
                matches = re.findall(re.escape(email.lower()), resp.text.lower())
                return len(matches) >= 2
        except Exception:
            pass
        return False

    def verify(self, email: str) -> VerifierResult:
        if not email or "@" not in email:
            return VerifierResult(status="Invalid_Syntax", score=0)

        email = email.strip().lower()

        if self._search_duckduckgo_lite(email):
            return VerifierResult(
                status="Valid_Citation",
                score=100
            )

        return VerifierResult(status="Not Verified", score=50)
