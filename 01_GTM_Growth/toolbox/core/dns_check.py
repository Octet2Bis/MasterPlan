"""
dns_check.py — Vérification DNS et MX locale (100% Hors-Ligne & Gratuit).

Utilise dnspython en priorité (très rapide), avec fallback sur nslookup.
Permet d'éliminer immédiatement les domaines sans serveur de messagerie avant tout appel API.
"""

import re
import subprocess
from typing import List

# Essayer d'importer dnspython pour une résolution ultra-rapide
try:
    import dns.resolver
    _DNSPYTHON_AVAILABLE = True
except ImportError:
    _DNSPYTHON_AVAILABLE = False


def get_mx_hosts(domain: str) -> list[str]:
    """
    Récupère les serveurs MX d'un domaine.
    Retourne une liste de hostnames MX ou une liste vide si aucun MX n'est configuré.
    """
    clean_domain = re.sub(r'^https?://', '', domain.strip().lower()).split('/')[0]
    if not clean_domain:
        return []

    # 1. Résolution via dnspython
    if _DNSPYTHON_AVAILABLE:
        try:
            answers = dns.resolver.resolve(clean_domain, 'MX', lifetime=4)
            mx_hosts = [str(r.exchange).rstrip('.') for r in answers]
            if mx_hosts:
                return mx_hosts
        except Exception:
            pass

    # 2. Fallback via nslookup
    try:
        result = subprocess.run(
            ["nslookup", "-q=MX", clean_domain],
            capture_output=True,
            text=True,
            timeout=4
        )
        output = result.stdout
        mx_hosts = re.findall(r'mail exchanger\s*=\s*([a-zA-Z0-9.-]+)', output, re.IGNORECASE)
        if not mx_hosts:
            mx_hosts = re.findall(r'MX preference\s*=\s*\d+,\s*mail exchanger\s*=\s*([a-zA-Z0-9.-]+)', output, re.IGNORECASE)
        return [host.rstrip('.') for host in mx_hosts]
    except (subprocess.TimeoutExpired, FileNotFoundError, Exception):
        return []


def has_mx_record(domain: str) -> bool:
    """Raccourci : retourne True si le domaine a au moins un serveur de messagerie actif."""
    return len(get_mx_hosts(domain)) > 0
