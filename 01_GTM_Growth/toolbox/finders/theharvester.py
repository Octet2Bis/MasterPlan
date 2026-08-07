"""
theharvester.py — Finder theHarvester (Open Source - Script Python)

Fallback OSINT ultime : moissonne les moteurs de recherche publics
si toutes les API commerciales échouent.

Nécessite que le binaire `theHarvester` soit installé dans le conteneur Docker.
"""

import subprocess
import re
from toolbox.base_tool import BaseFinder, FinderResult, ToolUnavailableError


class TheHarvesterFinder(BaseFinder):
    name = "theHarvester"
    env_key = ""  # Pas de clé API — outil open source

    def is_available(self) -> bool:
        """Vérifie que le binaire theHarvester est accessible."""
        try:
            result = subprocess.run(
                ["theHarvester", "-h"],
                capture_output=True, text=True, timeout=5
            )
            return result.returncode == 0
        except (FileNotFoundError, subprocess.TimeoutExpired):
            return False

    def find(self, first_name: str, last_name: str, domain: str) -> FinderResult:
        if not self.is_available():
            return FinderResult(source=self.name)

        try:
            result = subprocess.run(
                [
                    "theHarvester",
                    "-d", domain,
                    "-b", "bing,duckduckgo",  # Moteurs publics gratuits
                    "-l", "50",
                ],
                capture_output=True,
                text=True,
                timeout=30
            )
            output = result.stdout

            # Parser les emails trouvés dans la sortie
            emails_found = re.findall(
                r'[a-zA-Z0-9._%+-]+@' + re.escape(domain),
                output,
                re.IGNORECASE
            )

            if emails_found:
                # Chercher un email qui contient le prénom ou le nom
                target = f"{first_name.lower()}"
                for email in emails_found:
                    if target in email.lower():
                        return FinderResult(email=email.lower(), source=self.name, raw_score=40)
                # Sinon retourner le premier trouvé
                return FinderResult(email=emails_found[0].lower(), source=self.name, raw_score=30)

        except (subprocess.TimeoutExpired, Exception):
            pass

        return FinderResult(source=self.name)
