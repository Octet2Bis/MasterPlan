"""
permutator.py — Finder local de permutations d'emails (100% Gratuit / Zéro API).

Génère les motifs (patterns) d'emails professionnels les plus fréquents en entreprise.
Ne consomme aucune requête API, fonctionne hors-ligne, 0€ de coût.
"""

import re
import unicodedata
from typing import List
from toolbox.base_tool import BaseFinder, FinderResult


def _clean_str(text: str) -> str:
    """Normalise un texte (minuscules, sans accents, sans caractères spéciaux)."""
    if not text:
        return ""
    text = unicodedata.normalize('NFKD', str(text)).encode('ASCII', 'ignore').decode('utf-8')
    text = re.sub(r'[^a-zA-Z0-9]', '', text)
    return text.lower().strip()


class PermutatorFinder(BaseFinder):
    """
    Finder local et 100% gratuit.
    Génère les combinaisons d'emails d'entreprise standards sans aucun appel API.
    """
    name = "Permutator"
    env_key = ""  # Aucun secret ni clé requis

    def is_available(self) -> bool:
        return True

    @staticmethod
    def generate_patterns(first_name: str, last_name: str, domain: str) -> list[str]:
        """Génère la liste exhaustive des patterns d'emails possibles ordonnés par probabilité."""
        fn = _clean_str(first_name)
        ln = _clean_str(last_name)
        dom = domain.strip().lower()

        if not dom:
            return []

        patterns = []
        if fn and ln:
            f = fn[0]
            l = ln[0]
            patterns.extend([
                f"{fn}.{ln}@{dom}",      # prenom.nom@domaine (standard FR/EU ~60%)
                f"{f}.{ln}@{dom}",       # p.nom@domaine
                f"{fn}{ln}@{dom}",        # prenomnom@domaine
                f"{f}{ln}@{dom}",         # pnom@domaine (standard US ~25%)
                f"{fn}_{ln}@{dom}",      # prenom_nom@domaine
                f"{fn}@{dom}",           # prenom@domaine (startups/PME)
                f"{ln}.{fn}@{dom}",      # nom.prenom@domaine
                f"{ln}@{dom}",           # nom@domaine
            ])
        elif fn:
            patterns.append(f"{fn}@{dom}")
        elif ln:
            patterns.append(f"{ln}@{dom}")

        # Dédoublonnage tout en préservant l'ordre
        seen = set()
        unique_patterns = []
        for p in patterns:
            if p not in seen:
                seen.add(p)
                unique_patterns.append(p)

        return unique_patterns

    def find(self, first_name: str, last_name: str, domain: str) -> FinderResult:
        """
        Retourne le pattern le plus probable comme candidat pour la cascade de vérification.
        """
        patterns = self.generate_patterns(first_name, last_name, domain)
        if patterns:
            return FinderResult(
                email=patterns[0],
                source=self.name,
                raw_score=60
            )
        return FinderResult(source=self.name)
