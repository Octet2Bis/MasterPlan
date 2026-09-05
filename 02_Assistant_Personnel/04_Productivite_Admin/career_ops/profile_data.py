"""
profile_data.py — Données du Profil Antoine Lecerf & Runner de Scoring CSV.
Séparé de job_matcher.py pour respecter le plafond de 250 lignes (AGENTS.md).
"""

import csv
from pathlib import Path
from typing import List

from job_matcher import compute_job_match_score


# Profil Antoine Lecerf : Compétences vérifiées
profile_skills = [
    # Growth, Outbound & Ads
    "Growth", "GTM", "Outbound", "Inbound", "CRO", "SEO", "AEO", "GEO", "Analytics",
    "HubSpot", "Copywriting", "Scraping", "DataLayer", "Paid Media", "Automation",
    "CRM", "Emailing", "A/B Testing", "Google Ads", "Meta Ads", "Cold Email",
    "Delivrabilité", "Lemlist", "Brevo", "Apollo", "Cognism", "Funnels", "Tracking",
    "Performance Marketing", "Demand Generation", "Lead Nurturing", "Marketing Ops",
    # Product, UX/UI & Ops
    "Product", "Product Manager", "Product Ops", "Figma", "UX/UI", "Wireframes",
    "Hotjar", "User Journey", "Notion", "Jira", "Confluence", "n8n", "Zapier",
    # IA & Orchestration Intelligente (Master Plan)
    "AI Tools", "AI Automation", "LLM", "Prompt Engineering", "Multi-Agent",
    "Generative AI", "Schema.org", "AI Workflows", "Ollama",
    # QA (argument différenciant, pas mission première)
    "QA", "Quality Assurance", "Tests", "ISTQB", "WCAG", "RGAA", "Postman", "REST API",
    "Xray", "Squash TM", "JavaScript", "React", "Python", "SQL", "Git", "PowerShell"
]


def process_scraped_jobs(input_csv: str, output_csv: str, skills: List[str]):
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
                location=row.get("location", ""),
                profile_skills=skills
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
    process_scraped_jobs(
        input_csv="02_Assistant_Personnel/Workspace/career/scraped_jobs.csv",
        output_csv="02_Assistant_Personnel/Workspace/career/04_scored_jobs.csv",
        skills=profile_skills
    )
