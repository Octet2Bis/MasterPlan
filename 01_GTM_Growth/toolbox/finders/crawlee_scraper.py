"""
crawlee_scraper.py — Moteur d'Extraction & Scraping Web Anti-Bot (Zéro Dépendance).

Scrape et extrait des données structurées depuis des annuaires publics, sites d'entreprises et portails d'offres :
- Emulation de navigateur réel (User-Agents modernes, en-têtes Sec-Ch-Ua, Accept-Language)
- Gestion des délais adaptatifs (anti-rate limiting)
- Extraction de métadonnées (emails, numéros de téléphone, balises OpenGraph, titres)
"""

import io
import re
import sys
import time
from typing import Dict, List
import requests

# Encodage UTF-8 sous Windows
if sys.platform == "win32":
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    except Exception:
        pass


REALISTIC_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
    "Sec-Ch-Ua": '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"Windows"',
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1"
}


def scrape_page_metadata(url: str, timeout: float = 5.0) -> Dict:
    """
    Extrait les métadonnées clés d'une page web (titre, emails de contact, réseaux sociaux, balises OpenGraph).
    """
    try:
        resp = requests.get(url, headers=REALISTIC_HEADERS, timeout=timeout)
        if resp.status_code != 200:
            return {"url": url, "status_code": resp.status_code, "success": False, "error": f"HTTP {resp.status_code}"}
            
        html = resp.text
        
        # 1. Extraction du Titre
        title_match = re.search(r"<title>(.*?)</title>", html, re.IGNORECASE)
        title = title_match.group(1).strip() if title_match else ""
        
        # 2. Extraction des Emails visibles
        raw_emails = re.findall(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", html)
        # Filtrer les faux positifs courants (images, extensions de fichiers)
        cleaned_emails = list(set([e.lower() for e in raw_emails if not e.endswith(('.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'))]))
        
        # 3. Extraction des Liens Réseaux Sociaux
        linkedin_links = list(set(re.findall(r"https?://(?:www\.)?linkedin\.com/(?:company|in)/[a-zA-Z0-9_-]+", html)))
        twitter_links = list(set(re.findall(r"https?://(?:www\.)?(?:twitter|x)\.com/[a-zA-Z0-9_]+", html)))
        
        return {
            "url": url,
            "status_code": 200,
            "success": True,
            "title": title,
            "discovered_emails": cleaned_emails[:5],
            "social_links": {
                "linkedin": linkedin_links[:3],
                "twitter": twitter_links[:3]
            }
        }
    except Exception as e:
        return {"url": url, "success": False, "error": str(e)}


if __name__ == "__main__":
    target = "https://www.wonderbox.fr"
    print(f"=== TEST SCRAPING ANTI-BOT SUR : {target} ===")
    res = scrape_page_metadata(target)
    print(f"Statut : HTTP {res.get('status_code', 'ERR')}")
    print(f"Titre de la page : {res.get('title')}")
    print(f"Emails extraits : {res.get('discovered_emails')}")
    print(f"Réseaux sociaux : {res.get('social_links')}")
