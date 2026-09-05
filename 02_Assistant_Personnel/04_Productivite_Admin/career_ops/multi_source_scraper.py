"""
multi_source_scraper.py — Collecteur Multi-Sources Ultra-Frais (< 48h / Live).
Sources directes : LinkedIn (Live 24h), RemoteOK, Remotive, WeWorkRemotely, Arbeitnow.
Plafond strict : < 225 lignes (AGENTS.md).
"""

import json
import re
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Dict, List

import sys
sys.path.insert(0, str(Path(__file__).resolve().parent))
from job_matcher import is_fresh_under_48h

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9,fr;q=0.8"
}


def fetch_linkedin_live_jobs(keywords: List[str]) -> List[Dict]:
    """Scrape l'API invité LinkedIn en mode ULTRA-FRAIS (Dernières 24h : f_TPR=r86400 + sortBy=DD)."""
    jobs = []
    for kw in keywords:
        try:
            encoded_kw = urllib.parse.quote(kw)
            # f_TPR=r86400 = 24h max | sortBy=DD = Plus récentes en premier | f_WT=2 = Full Remote
            url = f"https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords={encoded_kw}&location=Europe&f_WT=2&f_TPR=r86400&sortBy=DD&start=0"
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=10) as resp:
                html = resp.read().decode("utf-8", errors="ignore")
                titles = re.findall(r'<h3 class="base-search-card__title">\s*([\s\S]*?)\s*</h3>', html)
                companies = re.findall(r'<h4 class="base-search-card__subtitle">[\s\S]*?<a[^>]*>\s*([\s\S]*?)\s*</a>', html)
                links = re.findall(r'<a class="base-card__full-link[^"]*" href="([^"?]*)', html)
                dates = re.findall(r'<time[^>]*datetime="([^"]*)"', html)
                locs = re.findall(r'<span class="job-search-card__location">\s*([\s\S]*?)\s*</span>', html)

                for i in range(len(titles)):
                    comp = companies[i].strip() if i < len(companies) else "Scale-up Tech"
                    link = links[i].strip() if i < len(links) else ""
                    dt = dates[i].strip() if i < len(dates) else "Aujourd'hui"
                    loc = locs[i].strip() if i < len(locs) else "Europe (Remote)"
                    if link and titles[i].strip() and is_fresh_under_48h(dt):
                        jobs.append({
                            "id": f"LI-{hash(link) & 0xfffffff}",
                            "company": comp,
                            "title": titles[i].strip(),
                            "location": f"{loc} (100% Remote)",
                            "skills_required": kw,
                            "description": f"Offre LinkedIn fraîche (< 24h) pour {titles[i].strip()} chez {comp}.",
                            "salary_range": "Selon profil",
                            "link": link,
                            "date_published": dt,
                            "source": "LinkedIn (Live 24h)"
                        })
        except Exception as e:
            print(f"[SCRAPER] Notice LinkedIn ({kw}): {e}")
    return jobs


def fetch_remoteok_jobs() -> List[Dict]:
    """Récupère les offres fraîches en direct depuis l'API RemoteOK."""
    jobs = []
    try:
        url = "https://remoteok.com/api?tag=marketing"
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            for item in data[1:30]:  # Le 1er élément est une notice légale
                pub_date = (item.get("date") or "")[:10]
                if is_fresh_under_48h(pub_date):
                    jobs.append({
                        "id": f"ROK-{item.get('id', hash(item.get('url')))}",
                        "company": item.get("company", "Tech Company"),
                        "title": item.get("position", ""),
                        "location": item.get("location", "Worldwide (Remote)"),
                        "skills_required": ", ".join(item.get("tags", [])),
                        "description": re.sub(r'<[^>]+>', '', item.get("description", ""))[:800],
                        "salary_range": item.get("salary", "Selon profil") or "Selon profil",
                        "link": item.get("url", "https://remoteok.com"),
                        "date_published": pub_date,
                        "source": "RemoteOK"
                    })
    except Exception as e:
        print(f"[SCRAPER] Notice RemoteOK: {e}")
    return jobs


def fetch_remotive_jobs() -> List[Dict]:
    """Récupère les offres marketing depuis l'API officielle Remotive (filtre <= 48h)."""
    jobs = []
    try:
        url = "https://remotive.com/api/remote-jobs?category=marketing"
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            for item in data.get("jobs", [])[:40]:
                pub_date = (item.get("publication_date") or "")[:10]
                if not is_fresh_under_48h(pub_date):
                    continue
                jobs.append({
                    "id": f"REM-{item.get('id')}",
                    "company": item.get("company_name", "Inconnue"),
                    "title": item.get("title", ""),
                    "location": item.get("candidate_required_location", "Full Remote"),
                    "skills_required": ", ".join(item.get("tags", [])),
                    "description": re.sub(r'<[^>]+>', '', item.get("description", ""))[:800],
                    "salary_range": item.get("salary", "Selon profil") or "Selon profil",
                    "link": item.get("url", "https://remotive.com"),
                    "date_published": pub_date,
                    "source": "Remotive"
                })
    except Exception as e:
        print(f"[SCRAPER] Notice Remotive: {e}")
    return jobs


def fetch_weworkremotely_jobs() -> List[Dict]:
    """Récupère le flux RSS ultra-frais de We Work Remotely."""
    jobs = []
    try:
        url = "https://weworkremotely.com/categories/remote-marketing-jobs.rss"
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=10) as resp:
            root = ET.fromstring(resp.read().decode("utf-8"))
            for item in root.findall(".//item")[:25]:
                title = item.findtext("title", "")
                link = item.findtext("link", "")
                pub_date = item.findtext("pubDate", "")
                desc = re.sub(r'<[^>]+>', '', item.findtext("description", ""))[:800]
                if link and is_fresh_under_48h(pub_date):
                    parts = title.split(":") if ":" in title else [title, title]
                    jobs.append({
                        "id": f"WWR-{hash(link) & 0xfffffff}",
                        "company": parts[0].strip(),
                        "title": parts[1].strip() if len(parts) > 1 else parts[0].strip(),
                        "location": "Full Remote",
                        "skills_required": "Marketing, Growth, Ops",
                        "description": desc,
                        "salary_range": "Selon profil",
                        "link": link,
                        "date_published": pub_date[:16],
                        "source": "WeWorkRemotely"
                    })
    except Exception as e:
        print(f"[SCRAPER] Notice WWR: {e}")
    return jobs


def fetch_all_sources(curated_csv_path: Path = None) -> List[Dict]:
    """Agrège, nettoie et déduplique uniquement les offres ULTRA-FRAÎCHES (< 48h)."""
    all_jobs = []

    # 1. LinkedIn Live 24h (Mots-clés cibles Europe Remote)
    li_keywords = [
        "growth marketing", "product ops", "marketing automation",
        "demand generation", "lifecycle marketing", "growth ops",
        "founders associate", "performance marketing"
    ]
    all_jobs.extend(fetch_linkedin_live_jobs(li_keywords))

    # 2. We Work Remotely RSS (Temps-Réel)
    all_jobs.extend(fetch_weworkremotely_jobs())

    # 3. RemoteOK Live API
    all_jobs.extend(fetch_remoteok_jobs())

    # 4. Remotive API (< 48h)
    all_jobs.extend(fetch_remotive_jobs())

    # Déduplication stricte par URL et couple (titre, entreprise)
    seen_keys = set()
    unique_jobs = []
    for j in all_jobs:
        if not is_fresh_under_48h(j.get("date_published", "")):
            continue
        key = (j.get("company", "").strip().lower(), j.get("title", "").strip().lower())
        url_key = j.get("link", "").strip().lower()
        if key not in seen_keys and url_key not in seen_keys:
            seen_keys.add(key)
            if url_key:
                seen_keys.add(url_key)
            unique_jobs.append(j)

    print(f"🌐 [RADAR LIVE] {len(unique_jobs)} offres ultra-fraîches (< 48h) collectées.")
    return unique_jobs


if __name__ == "__main__":
    results = fetch_all_sources()
    print(f"Échantillon : {len(results)} offres.")
