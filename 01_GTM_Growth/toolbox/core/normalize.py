"""
normalize.py — Fonctions de nettoyage selon le Framework Attio.

Module HORS-LIGNE : aucune requête réseau.
Source unique de vérité pour la normalisation (plus de duplication).
"""

import re
import unicodedata
from typing import Optional

import pandas as pd


def normalize_text(text: Optional[str]) -> str:
    """
    Nettoie un texte (prénom, nom) :
    - Minuscules
    - Suppression des accents (NFD → filtre des diacritiques)
    - Suppression des caractères spéciaux (ne garde que alphanum)
    
    Utilisé pour générer Clean_FirstName, Clean_LastName.
    """
    if not text or (isinstance(text, float) and pd.isna(text)):
        return ""
    text = str(text).strip()
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    text = re.sub(r'[^a-zA-Z0-9]', '', text.lower())
    return text


def normalize_domain(domain: Optional[str]) -> str:
    """
    Normalise un nom de domaine selon le framework Attio :
    - Supprime http(s):// et les chemins /
    - Supprime les préfixes www., group., corporate., jobs., careers.
    - Corrige les suffixes .careers → .com
    - Cartographie les domaines vitrines connus
    
    Utilisé pour générer Clean_Domain.
    """
    if not domain or (isinstance(domain, float) and pd.isna(domain)):
        return ""
    domain = str(domain).strip().lower()
    # Retirer protocole et chemins
    domain = re.sub(r'^https?://', '', domain).split('/')[0]
    # Retirer les préfixes parasites
    domain = re.sub(r'^(?:www\.|group\.|corporate\.|jobs\.|careers\.)+', '', domain)
    # Mapping des domaines vitrines connus
    DOMAIN_MAPPINGS = {
        "wondergroupcareers.com": "wonderbox.com",
    }
    for pattern, replacement in DOMAIN_MAPPINGS.items():
        if pattern in domain:
            domain = replacement
            break
    # Nettoyage du suffixe .careers → .com
    domain = re.sub(r'\.careers$', '.com', domain)
    return domain


def generate_email_permutations(first_name: str, last_name: str, domain: str) -> list[str]:
    """
    Génère les permutations d'email les plus courantes pour un prospect.
    Utile comme fallback quand les API Finders échouent.
    """
    first = normalize_text(first_name)
    last = normalize_text(last_name)
    if not domain or not first or not last:
        return []
    
    clean_domain = re.sub(r'^https?://', '', domain.strip().lower()).split('/')[0]
    first_initial = first[0] if first else ""
    
    permutations = [
        f"{first}.{last}@{clean_domain}",
        f"{first_initial}.{last}@{clean_domain}",
        f"{first}@{clean_domain}",
        f"{first}{last}@{clean_domain}",
        f"{first}_{last}@{clean_domain}",
        f"{first_initial}{last}@{clean_domain}",
    ]
    # Déduplique tout en préservant l'ordre
    return list(dict.fromkeys(permutations))
