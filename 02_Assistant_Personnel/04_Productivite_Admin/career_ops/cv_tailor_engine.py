"""
cv_tailor_engine.py — Moteur d'Adaptation de CV (ATS Tailoring) & Rédaction Drafter-Reviewer.
Plafond strict : < 200 lignes (AGENTS.md).
"""

import json
import urllib.request
import re
from pathlib import Path
from typing import Dict

def query_local_llm(prompt: str, timeout: int = 90) -> str:
    """Interroge le modèle local Qwen 2.5 sur Ollama (127.0.0.1:11434)."""
    try:
        url = "http://127.0.0.1:11434/api/generate"
        payload = json.dumps({
            "model": "qwen2.5:3b",
            "prompt": prompt,
            "stream": False,
            "keep_alive": "24h"
        }).encode("utf-8")
        req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            res = data.get("response", "").strip()
            if res:
                return res
    except Exception as e:
        print(f"[LLM] Notice: {e}")
    return ""


def generate_tailored_application(job_info: Dict, master_profile_path: Path, output_base_dir: Path) -> Dict:
    """
    Génère un dossier complet de candidature sur-mesure pour une offre Gold :
    1. CV adapté aux mots-clés ATS et aux besoins spécifiques de l'offre.
    2. Message d'accroche direct pour le décideur (Recruteur / Fondateur / Head of).
    3. Fiche récapitulative des points de contact.
    """
    company = job_info.get("company", "Entreprise").split("(")[0].strip()
    company_slug = re.sub(r'[^a-zA-Z0-9]+', '_', company).strip('_').lower()
    app_dir = output_base_dir / "applications" / company_slug
    app_dir.mkdir(parents=True, exist_ok=True)

    profile_text = master_profile_path.read_text(encoding="utf-8") if master_profile_path.exists() else ""

    # 1. Identification du rôle décideur clé
    target_role = "Talent Acquisition / Head of Growth / Founder"
    if "growth" in job_info.get("title", "").lower():
        target_role = "Head of Growth / CMO"
    elif "product" in job_info.get("title", "").lower():
        target_role = "Head of Product / CPO"
    elif "marketing" in job_info.get("title", "").lower():
        target_role = "Head of Marketing / CMO"
    elif "automation" in job_info.get("title", "").lower() or "ops" in job_info.get("title", "").lower():
        target_role = "Head of Growth Ops / VP Ops"

    # 2. Rédaction du Message d'Accroche Sur-Mesure (Modèle Haute Conversion Way2Tech)
    pitch_text = (
        f"Bonjour,\n\n"
        f"En découvrant le poste de {job_info.get('title')} chez {company}, j'ai immédiatement fait le lien avec "
        f"mes réalisations chez Way2Tech.ai : séquences outbound à ~50% d'ouverture (Lemlist/Apollo), "
        f"optimisation continue des funnels de conversion (A/B Testing, Hotjar) et automatisations n8n.\n\n"
        f"Votre focus sur {job_info.get('skills_required')} correspond exactement à mon approche : "
        f"acquisition méthodique, tracking rigoureux (GTM/DataLayer) et culture du résultat chiffré.\n\n"
        f"Seriez-vous ouvert à un court échange de 10 minutes cette semaine ?\n\n"
        f"Bien à vous,\nAntoine Lecerf | https://antoinelecerf.fit/"
    )

    # 3. CV Adapté (Sélection et réordonnancement des réalisations)
    cv_content = f"""# CV — Antoine Lecerf
**Candidature dédiée pour :** {company} — {job_info.get('title')}
**Format :** 100% Full Remote | **Portfolio :** https://antoinelecerf.fit/
**Contact :** lecerfantoine@gmail.com

---

## 🎯 Proposition de Valeur pour {company}
Profil hybride Produit, Growth & Technique capable de piloter l'acquisition et l'optimisation continue du produit :
* Maîtrise des requis clés : **{job_info.get('matched_skills', job_info.get('skills_required'))}**.
* Culture du résultat chiffré, de l'expérimentation rapide et de la rigueur d'exécution.

---

## 💼 Expériences Pertinentes Ciblées

### Way2Tech.ai — Product Manager & Growth
* **Acquisition & Outbound :** Pilotage de campagnes B2B multicanales (Apollo, Lemlist, Brevo) atteignant une moyenne de **~50% de taux d'ouverture**.
* **Funnels & CRO :** Optimisation continue des tunnels de conversion via A/B Testing, refontes de landing pages et analyses de sessions Hotjar.
* **Automatisations :** Conception de workflows n8n & Zapier pour le scraping, l'enrichissement et la synchronisation CRM en temps réel.
* **Tracking & Analytics :** Intégration de plans de taggage et suivi des métriques d'acquisition.

### 🤖 Maîtrise IA & Orchestration Intelligente (Master Plan)
* **Architecture Multi-Agents :** Conception de systèmes multi-agents avec Quality Gates déterministes (Drafter-Reviewer, validations Poka-Yoke).
* **Automatisation Growth End-to-End :** Pipelines autonomes scraping → scoring IA → CRM → alerte Telegram (n8n + Python + Ollama).
* **Optimisation AEO/GEO :** Référencement pour moteurs de recherche IA (Perplexity, ChatGPT Search) et structuration Schema.org.

### Aubay — Consultant QA & Support Technique (Allianz Trade & Crédit Agricole)
* **Garantie de Qualité :** Stratégies de tests fonctionnels, accessibilité WCAG/RGAA et qualification de progiciels critiques.
* **Alignement Cross-Fonctionnel :** Coordination Devs / Product sous Jira, Xray et Confluence.
* **Diagnostic Technique :** Analyse d'APIs REST via Postman et suivi d'incidents.

---

## 🛠️ Stack & Outils Prioritaires pour le Poste
* **Growth & Marketing :** {job_info.get('skills_required')}
* **Data & Tracking :** Google Tag Manager, GA4, Meta Pixel, DataLayer
* **IA & Automation :** n8n, Python, Ollama, Agents IA Multi-Couches
* **Product & No-Code :** Figma, Zapier, Notion, Jira
"""

    cv_file = app_dir / f"CV_Antoine_Lecerf_{company_slug}.md"
    pitch_file = app_dir / f"Message_Accroche_{company_slug}.md"
    contact_file = app_dir / "interlocuteur_cible.json"

    cv_file.write_text(cv_content, encoding="utf-8")
    pitch_file.write_text(pitch_text, encoding="utf-8")

    contact_info = {
        "company": company,
        "job_title": job_info.get("title"),
        "target_role": target_role,
        "search_query": f"site:linkedin.com/in/ ({target_role.replace('/', ' OR ')}) \"{company}\"",
        "link": job_info.get("link"),
        "generated_at": job_info.get("scraped_at", "2026-08-28")
    }
    contact_file.write_text(json.dumps(contact_info, indent=2, ensure_ascii=False), encoding="utf-8")

    return {
        "company": company,
        "company_slug": company_slug,
        "app_dir": str(app_dir),
        "cv_file": str(cv_file),
        "pitch_file": str(pitch_file),
        "target_role": target_role,
        "pitch_text": pitch_text
    }


if __name__ == "__main__":
    import sys
    base_dir = Path(__file__).resolve().parent.parent.parent
    career_dir = base_dir / "Workspace" / "career"
    master_profile = career_dir / "master_profile.md"
    pending_file = career_dir / "pending_gold_jobs.json"

    if len(sys.argv) > 1:
        target_slug = sys.argv[1].lower().strip()
        if pending_file.exists():
            pending = json.loads(pending_file.read_text(encoding="utf-8"))
            match = next((j for j in pending if j.get("slug") == target_slug or str(j.get("index")) == target_slug or j.get("company", "").lower().startswith(target_slug)), None)
            if match:
                res = generate_tailored_application(match, master_profile, career_dir)
                match["status"] = "TAILORED"
                pending_file.write_text(json.dumps(pending, indent=2, ensure_ascii=False), encoding="utf-8")
                print(json.dumps(res, ensure_ascii=False))
                sys.exit(0)
        # Fallback si l'offre est passée en paramètre JSON
        try:
            job_obj = json.loads(sys.argv[1])
            res = generate_tailored_application(job_obj, master_profile, career_dir)
            print(json.dumps(res, ensure_ascii=False))
        except Exception as e:
            print(f'{{"error": "{e}"}}')

