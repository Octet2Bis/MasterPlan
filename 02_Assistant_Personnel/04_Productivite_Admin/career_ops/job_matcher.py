"""
job_matcher.py — Moteur de Qualification & Scoring d'Opportunités Professionnelles (Zéro Dépendance).

Scanne scraped_jobs.csv, compare les compétences requises par l'offre avec l'arsenal complet du profil,
attribue une note sur 100 et classe par Tier (Gold >= 85, Silver 70-84, Bronze < 70).
"""

import csv
import io
import re
import sys
from pathlib import Path
from typing import Dict, List

# Encodage UTF-8 sous Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass


def compute_job_match_score(job_desc: str, job_title: str, required_skills_str: str, profile_skills: List[str]) -> Dict:
    """
    Calcule le score de correspondance entre les compétences exigées par l'offre et l'arsenal du candidat.
    """
    profile_skills_lower = [s.lower().strip() for s in profile_skills]
    
    # Extraire la liste des compétences requises par l'offre
    job_skills = [s.strip() for s in required_skills_str.replace(";", ",").split(",") if s.strip()]
    if not job_skills:
        job_skills = ["Growth", "Marketing"]

    matched_skills = []
    missing_skills = []
    
    for req in job_skills:
        req_clean = req.lower().strip()
        is_matched = False
        for p_skill in profile_skills_lower:
            if p_skill in req_clean or req_clean in p_skill:
                is_matched = True
                break
        if is_matched:
            matched_skills.append(req)
        else:
            missing_skills.append(req)
            
    match_ratio = len(matched_skills) / max(1, len(job_skills))
    base_score = int(match_ratio * 88)
    
    # Bonus Full Remote (+12)
    full_text = (job_title + " " + job_desc).lower()
    if any(k in full_text for k in ["full remote", "remote", "télétravail"]):
        base_score += 12
        
    score = min(100, max(0, base_score))
        
    if score >= 85:
        tier = "Gold"
        recommendation = "Candidature prioritaire avec tailoring sur-mesure (CV ATS + Lettre Drafter-Reviewer)."
    elif score >= 70:
        tier = "Silver"
        recommendation = "Bonne opportunité avec légères adaptations dans la lettre."
    else:
        tier = "Bronze"
        recommendation = "Opportunité secondaire."
        
    return {
        "score": score,
        "tier": tier,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "recommendation": recommendation
    }


def process_scraped_jobs(input_csv: str, output_csv: str, profile_skills: List[str]):
    input_path = Path(input_csv)
    output_path = Path(output_csv)
    
    if not input_path.exists():
        print(f"Erreur : {input_csv} introuvable.")
        return
        
    scored_rows = []
    
    with open(input_path, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            res = compute_job_match_score(
                job_desc=row.get("description", ""),
                job_title=row.get("title", ""),
                required_skills_str=row.get("skills_required", ""),
                profile_skills=profile_skills
            )
            
            row_out = dict(row)
            row_out["match_score"] = res["score"]
            row_out["tier"] = res["tier"]
            row_out["matched_skills"] = ", ".join(res["matched_skills"])
            row_out["missing_skills"] = ", ".join(res["missing_skills"]) if res["missing_skills"] else "Aucune"
            row_out["recommendation"] = res["recommendation"]
            scored_rows.append(row_out)
            
    # Tri décroissant par score
    scored_rows.sort(key=lambda x: int(x["match_score"]), reverse=True)
    
    with open(output_path, mode="w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=list(scored_rows[0].keys()))
        writer.writeheader()
        writer.writerows(scored_rows)
        
    print(f"✅ {len(scored_rows)} offres scorées et enregistrées dans : {output_path}")


if __name__ == "__main__":
    # Arsenal complet des compétences maîtrisées dans notre Master Plan
    profile_skills = [
        "Growth", "GTM", "Outbound", "Campaigns", "Inbound", "CRO", "SEO", "AEO", "GEO",
        "Analytics", "HubSpot", "Copywriting", "Scraping", "DataLayer", "Python",
        "Paid Media", "Lifecycle", "Automation", "CRM", "Emailing", "A/B Testing",
        "Google Ads", "Meta Ads", "Retargeting", "Onboarding", "SQL", "Landing Pages",
        "Bento UI", "Cold Email", "Delivrabilité", "DNS", "RevOps", "Sales Enablement",
        "Demand Generation", "Content", "Webhooks", "Lead Nurturing", "Social Ads",
        "CMS", "Notion", "Retention", "Hook Model", "Product Marketing", "Tracking",
        "Tagging", "Attribution", "Content Strategy", "Schema.org", "AI Tools", "Make",
        "Zapier", "Enrichment", "Scoring"
    ]
    
    process_scraped_jobs(
        input_csv="02_Assistant_Personnel/Workspace/career/scraped_jobs.csv",
        output_csv="02_Assistant_Personnel/Workspace/career/04_scored_jobs.csv",
        profile_skills=profile_skills
    )
