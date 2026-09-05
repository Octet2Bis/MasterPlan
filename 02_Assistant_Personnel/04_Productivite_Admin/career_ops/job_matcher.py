"""
job_matcher.py — Moteur de Qualification & Scoring d'Opportunités (1-3 ans, FR/EN strict).
Plafond strict : < 230 lignes (AGENTS.md).
"""

import csv
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass


def is_fresh_under_48h(date_str: str) -> bool:
    """Vérifie si une date de publication remonte à moins de 48 heures (2 jours max)."""
    if not date_str:
        return False
    d_clean = date_str.strip().lower()
    if any(t in d_clean for t in ["hour", "minute", "today", "aujourd", "yesterday", "hier", "1 day", "24h", "48h", "1 j", "2 j"]):
        return True
    if any(t in d_clean for t in ["3 day", "4 day", "5 day", "6 day", "7 day", "week", "month", "year", "semaine", "mois", "an"]):
        return False
    match = re.search(r'(\d{4})-(\d{2})-(\d{2})', d_clean)
    if match:
        try:
            pub_date = datetime(int(match.group(1)), int(match.group(2)), int(match.group(3)))
            return 0 <= (datetime.now() - pub_date).days <= 2
        except Exception:
            return False
    return "récemment" in d_clean or "recent" in d_clean

is_fresh_under_7_days = is_fresh_under_48h


def _is_non_fr_en_language(text: str) -> bool:
    """Rejette toute langue européenne hors Français et Anglais."""
    t = text.lower()
    if re.search(r'[\u0400-\u04FF\u0370-\u03FF]', t):  # Cyrillique, Grec
        return True
    markers = {
        "de": ["und", "oder", "für", "wir", "werden", "suchen", "erfahrung", "mit", "eine", "unser", "arbeit", "kenntnisse", "aufgaben"],
        "nl": ["wij", "voor", "onze", "vacature", "ervaring", "zoeken", "werken", "samen", "jouw", "functie", "bieden"],
        "es": ["para", "como", "experiencia", "trabajo", "empresa", "buscamos", "nuestro", "habilidades", "responsabilidades"],
        "it": ["per", "con", "esperienza", "lavoro", "azienda", "cerchiamo", "requisiti", "competenze"],
        "pt": ["para", "com", "experiência", "trabalho", "empresa", "procuramos", "requisitos"],
        "pl": ["pracy", "doświadczenie", "wymagania", "umiejętności", "szukamy", "zespół"],
        "sv": ["och", "för", "att", "med", "som", "ett", "vi", "till", "söker", "erfarenhet"],
        "da_no": ["og", "for", "med", "som", "en", "vi", "til", "søger", "erfaring"]
    }
    for lang, words in markers.items():
        if sum(1 for w in words if re.search(r'\b' + re.escape(w) + r'\b', t)) >= 2:
            return True
    return False


def compute_job_match_score(job_desc: str, job_title: str, required_skills_str: str, location: str, profile_skills: List[str], date_published: str = "") -> Dict:
    """Calcule le score de qualification : 1-3 ans strict, FR/EN strict, Full Remote."""
    if date_published and not is_fresh_under_48h(date_published):
        return {"score": 0, "tier": "Disqualified", "matched_skills": [], "missing_skills": [], "recommendation": "Disqualifiée : Offre trop ancienne (> 48h)."}

    full_text = f"{job_title} {job_desc} {location}".lower()
    title_lower = job_title.lower()

    # 1. Filtre Linguistique Pan-Européen (Exclusion stricte non-FR/non-EN)
    if _is_non_fr_en_language(full_text):
        return {"score": 0, "tier": "Disqualified", "matched_skills": [], "missing_skills": [], "recommendation": "Disqualifiée : Rédigée dans une langue hors FR/EN."}

    # 2. Filtre Expérience Strict : EXCLUSIVEMENT 1 à 3 ans (Rejet Senior, Lead, Director, +4 ans)
    senior_exclusions = ["head of", "head ", "vp ", "vp-", "vice president", "director", "directeur", "directrice", "cmo", "chief", "senior", "sr.", "sr ", "lead", "principal", "staff"]
    if any(ex in title_lower for ex in senior_exclusions):
        return {"score": 0, "tier": "Disqualified", "matched_skills": [], "missing_skills": [], "recommendation": "Disqualifiée : Profil Senior/Lead (hors cible 1-3 ans)."}

    over_3_years_patterns = [
        r'\b([4-9]|1[0-9])\+?\s*(?:years?|ans|années)\b',
        r'\b(?:at least|minimum|min\.?|au moins)\s*([4-9]|1[0-9])\s*(?:years?|ans|années)\b',
        r'\b(3-5|4-6|5-7|5-8|5-10)\s*(?:years?|ans|années)\b'
    ]
    if any(re.search(pat, full_text) for pat in over_3_years_patterns):
        return {"score": 0, "tier": "Disqualified", "matched_skills": [], "missing_skills": [], "recommendation": "Disqualifiée : Exige plus de 3 ans d'expérience."}

    # 3. Taxonomie Cible : Growth, Digital Marketing, Product Ops, Demand Gen, Lifecycle, CRM
    growth_keywords = [
        "growth marketing", "digital marketing", "chargé de marketing", "marketing coordinator",
        "performance marketing", "marketing automation", "demand generation", "lifecycle marketing",
        "crm", "product marketing", "product ops", "product operations", "inbound", "outbound", "gtm"
    ]
    if not any(term in full_text for term in growth_keywords):
        return {"score": 0, "tier": "Disqualified", "matched_skills": [], "missing_skills": [], "recommendation": "Disqualifiée : Hors taxonomie Growth/Marketing 1-3 ans."}

    # 4. Filtre Présentiel / Hybride
    if any(h in full_text for h in ["hybrid", "hybride", "on-site", "sur site", "présentiel"]):
        return {"score": 0, "tier": "Disqualified", "matched_skills": [], "missing_skills": [], "recommendation": "Disqualifiée : Offre hybride ou présentielle."}

    # 5. Matching Compétences & Bonus Startup (+10)
    profile_skills_lower = [s.lower().strip() for s in profile_skills]
    job_skills = [s.strip() for s in required_skills_str.replace(";", ",").split(",") if s.strip()] or ["Growth", "Marketing"]

    matched_skills = [req for req in job_skills if any(p in req.lower() or req.lower() in p for p in profile_skills_lower)]
    missing_skills = [req for req in job_skills if req not in matched_skills]

    match_ratio = len(matched_skills) / max(1, len(job_skills))
    base_score = int(match_ratio * 75) + 10

    # Bonus Startup / Scale-up (+10)
    startup_signals = ["startup", "scale-up", "scaleup", "seed", "series a", "series b", "vc-backed", "early-stage", "saas", "station f", "founder"]
    if any(s in full_text for s in startup_signals):
        base_score += 10

    score = min(100, max(0, base_score))
    tier = "Gold" if score >= 85 else ("Silver" if score >= 70 else "Bronze")

    return {
        "score": score,
        "tier": tier,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "recommendation": "Candidature 1-3 ans qualifiée." if tier == "Gold" else "Opportunité secondaire."
    }


if __name__ == "__main__":
    from profile_data import process_scraped_jobs, profile_skills
    process_scraped_jobs(
        input_csv="02_Assistant_Personnel/Workspace/career/scraped_jobs.csv",
        output_csv="02_Assistant_Personnel/Workspace/career/04_scored_jobs.csv",
        skills=profile_skills
    )
