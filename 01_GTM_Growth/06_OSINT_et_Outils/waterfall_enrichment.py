import os
import re
import sys
import time
import random
import argparse
import unicodedata
import requests
import pandas as pd
from dotenv import load_dotenv

# Reconfigure stdout for UTF-8 compatibility
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Charger le fichier .env s'il est présent
load_dotenv("/app/data/.env")
load_dotenv()

class QuotaExceededError(Exception):
    """Exception levée en cas de quota dépassé ou de rate limit (HTTP 401, 403, 429)."""
    pass

def normalize_text(text):
    """Nettoie le texte : minuscules, sans accents, suppression des caractères spéciaux."""
    if not text or pd.isna(text):
        return ""
    text = str(text).strip()
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    text = re.sub(r'[^a-zA-Z0-9]', '', text.lower())
    return text

def normalize_domain(domain):
    """
    Normalisation du domaine selon le framework Attio :
    - Supprime http(s):// et les chemins /
    - Supprime les préfixes www., group., corporate., jobs., careers.
    - Supprime ou cartographie les suffixes et domaines carrières connus.
    """
    if not domain or pd.isna(domain):
        return ""
    domain = str(domain).strip().lower()
    domain = re.sub(r'^https?://', '', domain).split('/')[0]
    domain = re.sub(r'^(?:www\.|group\.|corporate\.|jobs\.|careers\.)+', '', domain)
    if "wondergroupcareers.com" in domain:
        domain = "wonderbox.com"
    domain = re.sub(r'\.careers$', '.com', domain)
    return domain

# ==========================================
# 1. FINDERS (Moteurs de recherche d'e-mails)
# ==========================================

def finder_hunter(first_name, last_name, domain):
    api_key = os.getenv("HUNTER_API_KEY")
    if not api_key:
        return None, 0
    url = "https://api.hunter.io/v2/email-finder"
    params = {
        "domain": domain,
        "first_name": first_name,
        "last_name": last_name,
        "api_key": api_key
    }
    try:
        resp = requests.get(url, params=params, timeout=5)
    except Exception as e:
        raise Exception(f"Timeout/Erreur réseau Hunter : {e}")
        
    if resp.status_code in (401, 403, 429):
        raise QuotaExceededError(f"Hunter HTTP {resp.status_code}")
    if resp.status_code == 200:
        data = resp.json().get("data", {})
        email = data.get("email")
        score = data.get("score", 75) if email else 0
        return email, score
    return None, 0

def finder_tomba(first_name, last_name, domain):
    api_key = os.getenv("TOMBA_API_KEY")
    if not api_key:
        return None, 0
    url = "https://api.tomba.io/v1/email-finder"
    headers = {"X-Tomba-Key": api_key}
    params = {
        "domain": domain,
        "first_name": first_name,
        "last_name": last_name
    }
    try:
        resp = requests.get(url, headers=headers, params=params, timeout=5)
    except Exception as e:
        raise Exception(f"Timeout/Erreur réseau Tomba : {e}")
        
    if resp.status_code in (401, 403, 429):
        raise QuotaExceededError(f"Tomba HTTP {resp.status_code}")
    if resp.status_code == 200:
        data = resp.json().get("data", {})
        email = data.get("email")
        score = data.get("score", 75) if email else 0
        return email, score
    return None, 0

def finder_dropcontact(first_name, last_name, domain):
    api_key = os.getenv("DROPCONTACT_API_KEY")
    if not api_key:
        return None, 0
    url = "https://api.dropcontact.com/v1/contact/enrich"
    headers = {
        "X-Access-Token": api_key,
        "Content-Type": "application/json"
    }
    payload = {
        "data": [{"first_name": first_name, "last_name": last_name, "company": domain}]
    }
    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=5)
    except Exception as e:
        raise Exception(f"Timeout/Erreur réseau Dropcontact : {e}")
        
    if resp.status_code in (401, 403, 429):
        raise QuotaExceededError(f"Dropcontact HTTP {resp.status_code}")
    if resp.status_code == 200:
        result = resp.json()
        data_list = result.get("data", [])
        if data_list and isinstance(data_list, list):
            email_info = data_list[0].get("email", [])
            if email_info and isinstance(email_info, list):
                email = email_info[0].get("email")
                return email, 85
    return None, 0

# ==========================================
# 2. VERIFIERS (Validation des e-mails)
# ==========================================

def verifier_zerobounce(email):
    api_key = os.getenv("ZEROBOUNCE_API_KEY")
    if not api_key or not email:
        return "Not Verified", 50
    url = "https://api.zerobounce.net/v2/validate"
    params = {"api_key": api_key, "email": email}
    try:
        resp = requests.get(url, params=params, timeout=5)
        if resp.status_code in (401, 403, 429):
            print(f"  [!] ZeroBounce Quota dépassé ({resp.status_code})")
            return "Not Verified", 50
        if resp.status_code == 200:
            res = resp.json()
            status = res.get("status", "").lower()
            if status == "valid":
                return "Valid", 100
            elif status == "catch-all":
                return "Catch-All", 75
            elif status in ("do_not_mail", "spamtrap", "abuse"):
                return "Risky", 35
            elif status == "invalid":
                return "Invalid", 0
    except Exception as e:
        print(f"  [!] Erreur réseau ZeroBounce : {e}")
    return "Not Verified", 50

def verifier_abstract(email):
    api_key = os.getenv("ABSTRACT_API_KEY")
    if not api_key or not email:
        return "Not Verified", 50
    url = "https://emailvalidation.abstractapi.com/v1/"
    params = {"api_key": api_key, "email": email}
    try:
        resp = requests.get(url, params=params, timeout=5)
        if resp.status_code == 200:
            res = resp.json()
            deliverability = res.get("deliverability", "")
            quality_score = float(res.get("quality_score", 0.5)) * 100
            if deliverability == "DELIVERABLE":
                return "Valid", int(quality_score)
            elif deliverability == "UNDELIVERABLE":
                return "Invalid", 0
            else:
                return "Risky", int(quality_score)
    except Exception as e:
        print(f"  [!] Erreur réseau AbstractAPI : {e}")
    return "Not Verified", 50

def verify_email_status(email, initial_score):
    """
    Passe l'e-mail trouvé au Verifier pour obtenir l'Email_Status et le Confidence_Score.
    """
    if not email:
        return "Not Found", 0
    status, score = verifier_zerobounce(email)
    if status == "Not Verified":
        status, score = verifier_abstract(email)
    if status == "Not Verified":
        # Fallback heuristique si aucune clé Verifier n'est configurée
        status = "Valid" if initial_score >= 80 else ("Catch-All" if initial_score >= 60 else "Risky")
        score = initial_score
    return status, score

# ==========================================
# 3. MOTEUR WATERFALL ATTIO
# ==========================================

def run_waterfall(first_name, last_name, domain):
    """
    Exécute la cascade :
    1. Teste Hunter -> Tomba -> Dropcontact.
    2. En cas de 401/403/429 ou Timeout 5s, bascule vers le Finder suivant.
    3. Si e-mail trouvé, le passe au Verifier.
    4. Dès qu'un e-mail 'Valid' est trouvé, arrête la cascade et renvoie le résultat.
    """
    finders = [
        ("Hunter", finder_hunter),
        ("Tomba", finder_tomba),
        ("Dropcontact", finder_dropcontact)
    ]
    
    candidate_email = ""
    candidate_source = "None"
    candidate_status = "Not Found"
    candidate_score = 0

    for source_name, finder_func in finders:
        try:
            email, score = finder_func(first_name, last_name, domain)
            if email:
                status, ver_score = verify_email_status(email, score)
                if status == "Valid":
                    # E-mail Valid certifié -> On arrête la cascade pour ce prospect !
                    return email, source_name, status, ver_score
                elif status in ("Catch-All", "Risky"):
                    # On garde cet e-mail en candidat mais on continue la cascade au cas où le suivant donne un 'Valid'
                    if not candidate_email:
                        candidate_email, candidate_source, candidate_status, candidate_score = email, source_name, status, ver_score
        except QuotaExceededError as qe:
            print(f"  [-] {source_name}: Quota/Rate Limit atteint ({qe}). Bascule vers le Finder suivant...")
            continue
        except Exception as e:
            print(f"  [-] {source_name}: Erreur ({e}). Bascule vers le Finder suivant...")
            continue
            
    if candidate_email:
        return candidate_email, candidate_source, candidate_status, candidate_score
    return "", "None", "Not Found", 0

def main():
    parser = argparse.ArgumentParser(description="Moteur d'enrichissement Waterfall réutilisable (Framework Attio).")
    parser.add_argument("--input", required=True, help="Chemin du fichier CSV d'entrée")
    parser.add_argument("--output", required=True, help="Chemin du fichier CSV de sortie")
    args = parser.parse_args()

    if not os.path.exists(args.input):
        print(f"[!] Erreur : Fichier d'entrée introuvable ({args.input})")
        sys.exit(1)

    print(f"[*] Lecture de la source : {args.input}")
    df = pd.read_csv(args.input)

    # Identification dynamique des colonnes sources
    fn_col = next((c for c in ["firstName", "first_name", "prénom", "prenom"] if c in df.columns), None)
    ln_col = next((c for c in ["lastName", "last_name", "nom"] if c in df.columns), None)
    dom_col = next((c for c in ["companyDomain", "domain", "colonne domaine", "company_domain", "company"] if c in df.columns), None)

    if not fn_col or not ln_col or not dom_col:
        print("[!] Erreur : Les colonnes requises (prénom, nom, domaine) sont introuvables dans le CSV.")
        sys.exit(1)

    print("[*] Normalisation des données (Clean_FirstName, Clean_LastName, Clean_Domain)...")
    df["Clean_FirstName"] = df[fn_col].apply(normalize_text)
    df["Clean_LastName"] = df[ln_col].apply(normalize_text)
    df["Clean_Domain"] = df[dom_col].apply(normalize_domain)

    emails_found = []
    sources = []
    statuses = []
    scores = []

    total = len(df)
    print(f"[*] Exécution de la cascade Waterfall pour {total} prospects...\n")

    for i, row in df.iterrows():
        first = row["Clean_FirstName"]
        last = row["Clean_LastName"]
        dom = row["Clean_Domain"]

        print(f"[{i+1}/{total}] Prospect : {row.get(fn_col, '')} {row.get(ln_col, '')} ({dom})")
        email, source, status, score = run_waterfall(first, last, dom)
        
        if email:
            print(f"  [+] E-mail trouvé : {email} | Source: {source} | Statut: {status} | Confiance: {score}/100")
        else:
            print("  [-] Aucun e-mail valide trouvé dans la cascade.")

        emails_found.append(email)
        sources.append(source)
        statuses.append(status)
        scores.append(score)

        # Délai de courtoisie pour respecter les API Rate Limits
        time.sleep(random.uniform(0.5, 1.2))

    df["Email_Found"] = emails_found
    df["Email_Source"] = sources
    df["Email_Status"] = statuses
    df["Confidence_Score"] = scores

    os.makedirs(os.path.dirname(args.output) or ".", exist_ok=True)
    df.to_csv(args.output, index=False, encoding="utf-8")
    print(f"\n[*] Traitement Waterfall terminé ! {sum(1 for e in emails_found if e)} e-mails trouvés.")
    print(f"[*] Export généré : {args.output}")

if __name__ == "__main__":
    main()
