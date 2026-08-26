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


# Mapping étendu des domaines vitrines, filiales et raccourcisseurs connus
DOMAIN_MAPPINGS = {
    "wondergroupcareers.com": "wonderbox.com",
    "recrutement.reside-etudes.fr": "reside-etudes.fr",
    "voyages.carrefour.fr": "carrefour.com",
    "corporate.huttopia.com": "huttopia.com",
    "group.accor.com": "accor.com",
}

# Raccourcisseurs ou services de liens à interdire comme domaines de messagerie
LINK_SERVICES = {
    "bit.ly", "linktr.ee", "bio.link", "t.co", "lnkd.in", "tinyurl.com", "ow.ly", "buff.ly"
}

# Sous-domaines fonctionnels à rabattre systématiquement sur le domaine racine
STRIP_SUBDOMAINS = (
    "recrutement.", "jobs.", "careers.", "corporate.", "group.", "groupe.",
    "rh.", "presse.", "news.", "marketing.", "espace.", "portail.", "voyages."
)


def normalize_domain(domain: Optional[str], company_name: Optional[str] = None) -> str:
    """
    Normalise un nom de domaine selon le framework Attio :
    - Supprime http(s)://, www. et les chemins /
    - Supprime les sous-domaines fonctionnels (recrutement., jobs., corporate., etc.)
    - Résout les mappings d'entreprises connus
    - Nettoie les raccourcisseurs de liens (bit.ly, linktr.ee) avec fallback sur le nom de l'entreprise
    - Corrige les extensions parasites (.careers → .com)
    
    Utilisé pour générer Clean_Domain.
    """
    if not domain or (isinstance(domain, float) and pd.isna(domain)):
        domain = ""
    else:
        domain = str(domain).strip().lower()

    # Retirer protocole et chemins
    domain = re.sub(r'^https?://', '', domain).split('/')[0]
    
    # 1. Vérification dans le mapping direct
    if domain in DOMAIN_MAPPINGS:
        return DOMAIN_MAPPINGS[domain]

    # 2. Gestion des raccourcisseurs de liens (ex: bit.ly, linktr.ee)
    if domain in LINK_SERVICES or not domain:
        if company_name and isinstance(company_name, str):
            comp_clean = normalize_text(company_name)
            # Cas particuliers bien identifiés
            if "bbhotel" in comp_clean or "b&b" in str(company_name).lower():
                return "hotelbb.com"
            elif "aecvillage" in comp_clean or "aec" in comp_clean:
                return "aec-vacances.com"
            elif comp_clean:
                # Fallback déductif raisonnable : nom-entreprise.com / .fr
                return f"{comp_clean}.com"
        if domain in LINK_SERVICES:
            return ""

    # 3. Retrait des sous-domaines fonctionnels (ex: recrutement.reside-etudes.fr → reside-etudes.fr)
    for sub in STRIP_SUBDOMAINS:
        if domain.startswith(sub):
            domain = domain[len(sub):]
            break

    # Retirer les préfixes www. restants
    domain = re.sub(r'^(?:www\.)+', '', domain)

    # 4. Nettoyage du suffixe .careers → .com
    domain = re.sub(r'\.careers$', '.com', domain)
    
    # Re-check dans les mappings après nettoyage de sous-domaine
    if domain in DOMAIN_MAPPINGS:
        return DOMAIN_MAPPINGS[domain]

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
