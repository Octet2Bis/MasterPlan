"""
h8mail.py — Investigator h8mail (Open Source - Script Python)

Outil de recherche dans les fuites de données (Data Breaches).
Confirme qu'un email est utilisé par un véritable humain si ses
identifiants ont fuité dans le passé.

Nécessite que le binaire `h8mail` soit installé dans le conteneur Docker.
"""

import subprocess
import json
import re
from toolbox.base_tool import BaseInvestigator, InvestigatorResult


class H8mailInvestigator(BaseInvestigator):
    name = "h8mail"
    env_key = ""  # Outil open source (peut utiliser des clés optionnelles)

    def is_available(self) -> bool:
        try:
            result = subprocess.run(
                ["h8mail", "--help"],
                capture_output=True, text=True, timeout=5
            )
            return result.returncode == 0
        except (FileNotFoundError, subprocess.TimeoutExpired):
            return False

    def investigate(self, email: str) -> InvestigatorResult:
        if not self.is_available() or not email:
            return InvestigatorResult(source=self.name)

        try:
            result = subprocess.run(
                ["h8mail", "-t", email, "--json", "/tmp/h8mail_out.json"],
                capture_output=True,
                text=True,
                timeout=60
            )

            # Tenter de lire le fichier JSON de sortie
            try:
                with open("/tmp/h8mail_out.json", "r") as f:
                    data = json.load(f)
            except (FileNotFoundError, json.JSONDecodeError):
                data = {}

            findings = {}
            breaches = []

            # Parser les résultats
            targets = data.get("targets", [])
            for target in targets:
                target_data = target.get("data", [])
                for item in target_data:
                    if isinstance(item, str) and "breach" in item.lower():
                        breaches.append(item)

            if breaches:
                findings["breaches"] = breaches
                findings["breach_count"] = len(breaches)

            confidence = min(85, len(breaches) * 20 + 10) if breaches else 0
            return InvestigatorResult(
                findings=findings,
                source=self.name,
                confidence=confidence
            )

        except (subprocess.TimeoutExpired, Exception):
            pass

        return InvestigatorResult(source=self.name)
