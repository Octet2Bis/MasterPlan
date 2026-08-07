"""
dns_check.py — Vérification MX hors-ligne via nslookup (ou dnspython si disponible).

Module HORS-LIGNE (pas de requête API facturée).
Utilisé par UC_CRM_Hygiene pour valider qu'un domaine a des enregistrements MX.
"""

import re
import subprocess
from typing import list


def get_mx_hosts(domain: str) -> list[str]:
    """
    Récupère les serveurs MX d'un domaine via nslookup.
    
    Retourne une liste de hostnames MX triés, ou une liste vide
    si le domaine n'a pas d'enregistrement MX.
    """
    clean_domain = re.sub(r'^https?://', '', domain.strip().lower()).split('/')[0]
    if not clean_domain:
        return []
    
    try:
        result = subprocess.run(
            ["nslookup", "-q=MX", clean_domain],
            capture_output=True,
            text=True,
            timeout=5
        )
        output = result.stdout
        # Parser les différents formats de sortie nslookup (Windows/Linux)
        mx_hosts = re.findall(
            r'mail exchanger\s*=\s*([a-zA-Z0-9.-]+)', output, re.IGNORECASE
        )
        if not mx_hosts:
            mx_hosts = re.findall(
                r'MX preference\s*=\s*\d+,\s*mail exchanger\s*=\s*([a-zA-Z0-9.-]+)',
                output, re.IGNORECASE
            )
        return [host.rstrip('.') for host in mx_hosts]
    except (subprocess.TimeoutExpired, FileNotFoundError, Exception):
        return []


def has_mx_record(domain: str) -> bool:
    """Raccourci : retourne True si le domaine a au moins 1 serveur MX."""
    return len(get_mx_hosts(domain)) > 0
