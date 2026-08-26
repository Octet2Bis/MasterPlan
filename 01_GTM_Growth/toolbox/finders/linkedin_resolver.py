"""
linkedin_resolver.py — Finder & Résolveur d'Identité via URL LinkedIn (0€ / Zéro API).

Extrait et normalise l'identité complète d'un prospect depuis son slug de profil LinkedIn
(gestion des noms composés, des particules, des doubles noms maritaux et des noms tronqués "Marie B.").
Permet de générer des patterns d'emails ultra-précis basés sur l'identité réelle du profil.
"""

import re
import urllib.parse
from typing import Optional, List, Tuple
from toolbox.base_tool import BaseFinder, FinderResult
from toolbox.core.normalize import normalize_text


class LinkedinResolver(BaseFinder):
    """
    Finder d'identité augmentée par extraction du slug LinkedIn.
    """
    name = "LinkedIn_Resolver"
    env_key = ""  # 0 clé requise

    def is_available(self) -> bool:
        return True

    @staticmethod
    def parse_linkedin_slug(linkedin_url: str) -> Tuple[str, str]:
        """
        Extrait le prénom et le nom complet depuis une URL de profil LinkedIn.
        Exemple : 'https://www.linkedin.com/in/marie-briand-taillefer' ➔ ('marie', 'briand-taillefer')
                  'https://www.linkedin.com/in/david-heylen-8076684'  ➔ ('david', 'heylen')
        """
        if not linkedin_url or not isinstance(linkedin_url, str):
            return "", ""

        # Décoder l'URL
        url = urllib.parse.unquote(linkedin_url).strip().lower()
        
        # Extraire le slug après /in/
        match = re.search(r'/in/([^/?#]+)', url)
        if not match:
            return "", ""

        raw_slug = match.group(1)
        
        # Retirer les identifiants numériques/hexadécimaux de fin (ex: -8076684, -05a7971b)
        clean_slug = re.sub(r'-[0-9a-f]{5,15}$', '', raw_slug)
        clean_slug = re.sub(r'-[0-9]{3,}$', '', clean_slug)

        parts = clean_slug.split('-')
        parts = [p for p in parts if p and not p.isdigit()]

        if not parts:
            return "", ""
        elif len(parts) == 1:
            return parts[0], ""
        elif len(parts) == 2:
            return parts[0], parts[1]
        else:
            # Prénom + nom composé (ex: marie + briand-taillefer)
            first = parts[0]
            last = "-".join(parts[1:])
            return first, last

    def find(self, first_name: str, last_name: str, domain: str, linkedin_url: Optional[str] = None) -> FinderResult:
        if not domain:
            return FinderResult(source=self.name)

        dom = domain.strip().lower()

        # Si une URL LinkedIn est fournie, tenter la résolution avancée
        if linkedin_url:
            in_first, in_last = self.parse_linkedin_slug(linkedin_url)
            
            # Si le nom LinkedIn apporte plus de précision (ex: nom complet vs initiale)
            if in_first and in_last and (len(in_last) > len(last_name) or "-" in in_last):
                fn = normalize_text(in_first)
                ln = normalize_text(in_last.replace("-", ""))
                ln_hyphen = normalize_text(in_last.split("-")[0])  # Premier nom si composé

                email_candidate = f"{fn}.{ln}@{dom}"
                return FinderResult(
                    email=email_candidate,
                    source=self.name,
                    raw_score=85
                )

        return FinderResult(source=self.name)
