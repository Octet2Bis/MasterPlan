import os
import re
import sys
import time
import random
import requests
import pandas as pd
from dotenv import load_dotenv

# Reconfigure stdout for UTF-8 compatibility
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Charger le fichier .env s'il est présent ou monté
load_dotenv("/app/data/.env")
load_dotenv()

class QuotaExceededError(Exception):
    """Exception levée en cas d'erreur 401, 403 ou 429 sur une API."""
    pass

def clean_domain(domain):
    """
    Nettoie le nom de domaine :
    - Supprime http://, https://, www.
    - Supprime les préfixes group., corporate., jobs., careers.
    - Corrige ou supprime les suffixes .careers et les domaines vitrines connus.
    """
    if not domain or pd.isna(domain):
        return ""
    domain = str(domain).strip().lower()
    domain = re.sub(r'^https?://', '', domain).split('/')[0]
    # Supprimer les préfixes usuels (group., corporate., www., jobs., careers.)
    domain = re.sub(r'^(?:www\.|group\.|corporate\.|jobs\.|careers\.)+', '', domain)
    # Mapping ou nettoyage des domaines vitrines connus
    if "wondergroupcareers.com" in domain:
        domain = "wonderbox.com"
    domain = re.sub(r'\.careers$', '.com', domain)
    return domain

def verify_email_hunter(first_name, last_name, domain):
    api_key = os.getenv("HUNTER_API_KEY")
    if not api_key:
        raise QuotaExceededError("Clé API Hunter manquante.")
    
    url = "https://api.hunter.io/v2/email-finder"
    params = {
        "domain": domain,
        "first_name": first_name,
        "last_name": last_name,
        "api_key": api_key
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
    except Exception as e:
        raise QuotaExceededError(f"Erreur réseau Hunter : {e}")
        
    if response.status_code in (401, 403, 429):
        raise QuotaExceededError(f"Erreur Hunter statut {response.status_code}")
        
    if response.status_code == 200:
        data = response.json().get("data", {})
        return data.get("email")
    return None

def verify_email_zerobounce(first_name, last_name, domain):
    api_key = os.getenv("ZEROBOUNCE_API_KEY")
    if not api_key:
        print("  [!] Clé API ZeroBounce manquante dans le .env.")
        return None
    
    first = str(first_name).strip().lower() if pd.notna(first_name) else ""
    last = str(last_name).strip().lower() if pd.notna(last_name) else ""
    if not first or not last:
        return None
        
    candidates = [
        f"{first}.{last}@{domain}",
        f"{first[0]}.{last}@{domain}" if first else f"{last}@{domain}",
        f"{first}@{domain}",
        f"{first}{last}@{domain}"
    ]
    
    url = "https://api.zerobounce.net/v2/validate"
    for candidate in candidates:
        params = {
            "api_key": api_key,
            "email": candidate
        }
        try:
            response = requests.get(url, params=params, timeout=10)
            if response.status_code == 200:
                result = response.json()
                status = result.get("status")
                if status == "valid":
                    return candidate
            elif response.status_code in (401, 403, 429):
                print(f"  [!] Quota ZeroBounce également épuisé (statut {response.status_code}).")
                break
        except Exception as e:
            print(f"  [!] Erreur réseau ZeroBounce : {e}")
            break
        time.sleep(0.5)
    return None

def verify_email(first_name, last_name, domain):
    if not domain or not first_name or not last_name:
        return None
    
    try:
        return verify_email_hunter(first_name, last_name, domain)
    except QuotaExceededError:
        print("Quota Hunter épuisé, bascule sur ZeroBounce")
        return verify_email_zerobounce(first_name, last_name, domain)
    except Exception:
        print("Quota Hunter épuisé, bascule sur ZeroBounce")
        return verify_email_zerobounce(first_name, last_name, domain)

def main():
    input_file = "/app/data/input.csv"
    if not os.path.exists(input_file):
        # Fallback si le fichier s'appelle test_leads.csv dans /app/data
        if os.path.exists("/app/data/test_leads.csv"):
            input_file = "/app/data/test_leads.csv"
        else:
            print(f"Fichier d'entrée introuvable : {input_file}")
            return

    print(f"[*] Chargement du fichier : {input_file}")
    df = pd.read_csv(input_file)
    
    # Identification de la colonne domaine
    domain_col = None
    for col_name in ["companyDomain", "domain", "colonne domaine", "company_domain"]:
        if col_name in df.columns:
            domain_col = col_name
            break
            
    if not domain_col:
        print("  [!] Aucune colonne de domaine trouvée dans le CSV d'entrée.")
        return
        
    print(f"[*] Nettoyage de la colonne domaine ('{domain_col}')...")
    df["domain_cleaned"] = df[domain_col].apply(clean_domain)
    
    results = []
    total_rows = len(df)
    print(f"[*] Démarrage de la rotation d'APIs pour {total_rows} leads...")
    
    for idx, row in df.iterrows():
        first_name = row.get("firstName", row.get("first_name", ""))
        last_name = row.get("lastName", row.get("last_name", ""))
        domain = row.get("domain_cleaned", "")
        
        print(f"[{idx+1}/{total_rows}] Vérification de {first_name} {last_name} ({domain})...")
        valid_email = verify_email(first_name, last_name, domain)
        if valid_email:
            print(f"  [+] Email trouvé : {valid_email}")
        results.append(valid_email)
        
        # Délai de courtoisie Anti-Ban
        time.sleep(random.uniform(0.5, 1.5))
        
    df["validEmail"] = results
    
    output_file = "/app/data/output.csv"
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    df.to_csv(output_file, index=False, encoding="utf-8")
    print(f"[*] Traitement terminé ! Résultats sauvegardés dans {output_file}")

if __name__ == "__main__":
    main()
