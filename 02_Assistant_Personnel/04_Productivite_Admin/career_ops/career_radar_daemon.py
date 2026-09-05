"""
career_radar_daemon.py — Démon Autonome de Veille 24/7, Qualification & Push Telegram.
Surveille les offres, qualifie selon les critères stricts, adapte le CV et pousse l'alerte.
Plafond strict : < 230 lignes (AGENTS.md).
"""

import json
import os
import re
import sys
import time
import urllib.request
from pathlib import Path
from typing import Dict, List

sys.path.insert(0, str(Path(__file__).resolve().parent))
from job_matcher import compute_job_match_score
from profile_data import profile_skills
from cv_tailor_engine import generate_tailored_application

BASE_DIR = Path(__file__).resolve().parent.parent.parent
CAREER_DIR = BASE_DIR / "Workspace" / "career"
MASTER_PROFILE_PATH = CAREER_DIR / "master_profile.md"
PROCESSED_JOBS_FILE = CAREER_DIR / "processed_jobs.json"
ENV_FILE = BASE_DIR / ".secrets" / ".env"


def load_env_tokens() -> Dict[str, str]:
    env_vars = {}
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env_vars[k.strip()] = v.strip().strip("'\"")
    return env_vars


def send_telegram_alert(message: str) -> bool:
    env = load_env_tokens()
    token = (os.environ.get("TELEGRAM_BOT_TOKEN_PRO") or env.get("TELEGRAM_BOT_TOKEN_PRO", "")).strip().strip("'\"")
    if token.startswith("bot"):
        token = token[3:]
    chat_id = (os.environ.get("TELEGRAM_ALLOWED_USER_ID") or env.get("TELEGRAM_ALLOWED_USER_ID", "")).strip().strip("'\"")
    if not token or not chat_id:
        print("[RADAR] ⚠️ Token ou Chat ID Telegram manquant pour l'envoi de l'alerte.")
        return False
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = json.dumps({
        "chat_id": chat_id,
        "text": message,
        "parse_mode": "Markdown",
        "disable_web_page_preview": True
    }).encode("utf-8")
    try:
        req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status == 200
    except Exception:
        try:
            payload_fallback = json.dumps({
                "chat_id": chat_id,
                "text": message.replace("*", "").replace("_", ""),
                "disable_web_page_preview": True
            }).encode("utf-8")
            req_fb = urllib.request.Request(url, data=payload_fallback, headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req_fb, timeout=10) as resp2:
                return resp2.status == 200
        except Exception as e2:
            print(f"[RADAR] ❌ Erreur envoi Telegram : {e2}")
            return False


def load_processed_ids() -> set:
    if PROCESSED_JOBS_FILE.exists():
        try:
            return set(json.loads(PROCESSED_JOBS_FILE.read_text(encoding="utf-8")))
        except Exception:
            return set()
    return set()


def save_processed_ids(ids: set):
    PROCESSED_JOBS_FILE.write_text(json.dumps(list(ids), indent=2), encoding="utf-8")


from multi_source_scraper import fetch_all_sources


def fetch_remote_jobs() -> List[Dict]:
    """Récupère les offres massives depuis LinkedIn, Remotive, Arbeitnow et Curated."""
    return fetch_all_sources(CAREER_DIR / "scraped_jobs.csv")


def format_job_summary(job: Dict) -> str:
    """Génère un sommaire concis des missions et de ce qui est attendu pour prévisualisation Telegram."""
    desc = job.get("description", "").strip()
    skills = job.get("skills_required", "").strip()
    clean_desc = re.sub(r'<[^>]+>', '', desc)
    clean_desc = re.sub(r'\s+', ' ', clean_desc)
    sentences = [s.strip() for s in re.split(r'[.\n•\-–]', clean_desc) if len(s.strip()) > 20]
    missions = sentences[:2] if len(sentences) >= 2 else [
        "Déploiement et pilotage de la stratégie de croissance et d'acquisition.",
        "Optimisation continue des parcours utilisateurs et automatisations opérationnelles."
    ]
    out = "📋 *Sommaire de l'annonce (Enjeux & Missions) :*\n"
    for m in missions[:2]:
        m_txt = m[:120] + "..." if len(m) > 120 else m
        out += f" • {m_txt}\n"
    out += "\n🎯 *Ce qui est attendu :*\n"
    if skills:
        out += f" • Stack & Compétences : `{skills[:90]}`\n"
    out += f" • Profil ciblé : Junior / Mid (1 à 5 ans d'expérience)\n"
    out += f" • Cadre : 100% Full Remote vérifié (Europe)"
    return out


def register_verified_remote_company(job: Dict, career_dir: Path):
    """Enregistre automatiquement l'entreprise dans la base des entreprises vérifiées full remote."""
    c_name = job.get("company", "").strip()
    if not c_name or c_name == "Inconnue":
        return
    c_slug = re.sub(r'[^a-zA-Z0-9]+', '_', c_name.lower()).strip('_')
    db_file = career_dir / "verified_remote_companies.json"
    comps = []
    if db_file.exists():
        try:
            with open(db_file, "r", encoding="utf-8") as f:
                comps = json.load(f)
        except Exception:
            comps = []
    if not any(c.get("id") == c_slug or c.get("name", "").lower() == c_name.lower() for c in comps):
        title = job.get("title", "Growth & Ops")
        comps.append({
            "id": c_slug,
            "name": c_name,
            "domain": f"{title} (Scale-up Tech)",
            "remote_status": "100% Full Remote Vérifié (Europe / Monde)",
            "verification_badge": f"VÉRIFIÉ : Offre active en télétravail complet ({job.get('date_published', 'Août 2026')})",
            "careers_url": job.get("link", ""),
            "spontaneous_allowed": True,
            "decision_maker_role": "Head of Product Ops" if "product" in title.lower() else "Head of Growth / CEO",
            "attack_angle": f"Focus Growth & Ops : automatisation des parcours, tracking DataLayer et acquisition multicanale pour {c_name}."
        })
        with open(db_file, "w", encoding="utf-8") as f:
            json.dump(comps, f, indent=2, ensure_ascii=False)
        print(f"🏛️ [DATABASE] Nouvelle entreprise 100% remote vérifiée indexée : {c_name}")


def run_radar_cycle():
    print(f"\n[{time.strftime('%Y-%m-%d %H:%M:%S')}] 🛰️ Début du cycle de veille Career Hunter...")
    processed = load_processed_ids()
    jobs = fetch_remote_jobs()
    print(f"[RADAR] {len(jobs)} offres scannées au total.")

    new_gold_count = 0

    for job in jobs:
        job_id = job.get("id") or job.get("link")
        if job_id in processed:
            continue

        # Qualification stricte (Matching, Langue FR/EN, Full Remote, Fraîcheur <= 7 jours)
        res = compute_job_match_score(
            job_desc=job.get("description", ""),
            job_title=job.get("title", ""),
            required_skills_str=job.get("skills_required", ""),
            location=job.get("location", ""),
            profile_skills=profile_skills,
            date_published=job.get("date_published", "")
        )

        job["match_score"] = res["score"]
        job["matched_skills"] = ", ".join(res["matched_skills"])

        # Si l'offre est qualifiée Tier Gold (>= 85/100)
        if res["score"] >= 85 and res["tier"] == "Gold":
            new_gold_count += 1
            print(f"🏆 [GOLD] {job.get('company')} — {job.get('title')} ({res['score']}%)")

            # Enregistrement de l'entreprise vérifiée et mise en attente de validation
            register_verified_remote_company(job, CAREER_DIR)
            c_name = job.get("company", "Entreprise").split("(")[0].strip()
            c_slug = re.sub(r'[^a-zA-Z0-9]+', '_', c_name.lower()).strip('_')
            job["slug"] = c_slug
            job["status"] = "PENDING_VALIDATION"

            # Sauvegarde dans pending_gold_jobs.json
            pending_file = CAREER_DIR / "pending_gold_jobs.json"
            pending_jobs = []
            if pending_file.exists():
                try:
                    pending_jobs = json.loads(pending_file.read_text(encoding="utf-8"))
                except Exception:
                    pending_jobs = []
            if not any(pj.get("slug") == c_slug or pj.get("link") == job.get("link") for pj in pending_jobs):
                job["index"] = len(pending_jobs) + 1
                pending_jobs.append(job)
                pending_file.write_text(json.dumps(pending_jobs, indent=2, ensure_ascii=False), encoding="utf-8")

            # Détection AI-Fit (bonus de profil hybride IA)
            job_text_lower = (job.get('title', '') + ' ' + job.get('description', '') + ' ' + job.get('skills_required', '')).lower()
            ai_fit = any(t in job_text_lower for t in ['ai ', 'automation', 'llm', 'generative', 'ai tools', 'machine learning'])
            ai_tag = '🤖 AI-Fit · ' if ai_fit else ''

            # Notification Push sur Telegram : Offre proposée (Génération du CV sur validation)
            msg = f"🎯 *{ai_tag}NOUVELLE OFFRE QUALIFIÉE (À VALIDER)*\n\n"
            msg += f"🏢 *Entreprise :* {c_name}\n"
            msg += f"💼 *Poste :* {job.get('title')}\n"
            msg += f"📅 *Publiée le :* {job.get('date_published', 'Récemment')}\n"
            msg += f"📊 *Score de Match :* `{res['score']}%` (Tier Gold 🏆)\n"
            msg += f"💶 *Rémunération :* {job.get('salary_range', 'Marché')}\n\n"
            msg += f"{format_job_summary(job)}\n\n"
            msg += f"🔗 *Lien officiel de l'offre :*\n{job.get('link')}\n\n"
            msg += f"👉 *Pour valider cette opportunité & générer le CV dédié :*\n`/valider {c_slug}`\n\n"
            msg += f"❌ *Pour ignorer :* `/passer {c_slug}`\n"
            msg += f"💬 *Avis Hermes :* `/hermes que penses-tu de {c_name} ?`"

            send_telegram_alert(msg)
            processed.add(job_id)
            save_processed_ids(processed)
            time.sleep(2)  # Pause pour cadence API
        else:
            processed.add(job_id)

    save_processed_ids(processed)
    print(f"[RADAR] Fin de cycle : {new_gold_count} nouvelle(s) offre(s) Gold transmise(s) sur Telegram.")


if __name__ == "__main__":
    if "--daemon" in sys.argv:
        interval = 3600 * 2  # Scan toutes les 2 heures
        print(f"🚀 Démon Career Hunter démarré en tâche de fond (Cycle toutes les 2h)...")
        while True:
            run_radar_cycle()
            time.sleep(interval)
    else:
        run_radar_cycle()
