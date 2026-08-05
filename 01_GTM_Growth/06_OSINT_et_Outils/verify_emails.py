import csv
import os
import random
import re
import smtplib
import sys
import time
import unicodedata
import subprocess

# Reconfigure stdout for UTF-8 compatibility
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

if os.path.exists("/data/test_leads.csv"):
    INPUT_FILE = "/data/test_leads.csv"
    OUTPUT_FILE = "/data/emails_valides.csv"
else:
    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "Ressources"))
    INPUT_FILE = os.path.join(BASE_DIR, "test_leads.csv")
    OUTPUT_FILE = os.path.join(BASE_DIR, "emails_valides.csv")

SENDER_EMAIL = "verify@domain.com"
TIMEOUT = 5

def sanitize(text):
    if not text:
        return ""
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    text = re.sub(r'[^a-zA-Z0-9]', '', text.lower())
    return text

def generate_email_permutations(first_name, last_name, domain):
    first = sanitize(first_name)
    last = sanitize(last_name)
    if not domain or not first or not last:
        return []
    
    clean_domain = re.sub(r'^https?://', '', domain.strip().lower()).split('/')[0]
    first_initial = first[0] if first else ""
    
    permutations = [
        f"{first}.{last}@{clean_domain}",
        f"{first_initial}.{last}@{clean_domain}",
        f"{first}@{clean_domain}",
        f"{first}{last}@{clean_domain}",
        f"{first}_{last}@{clean_domain}",
        f"{first_initial}{last}@{clean_domain}"
    ]
    return list(dict.fromkeys(permutations))

def get_mx_hosts(domain):
    clean_domain = re.sub(r'^https?://', '', domain.strip().lower()).split('/')[0]
    try:
        result = subprocess.run(
            ["nslookup", "-q=MX", clean_domain],
            capture_output=True,
            text=True,
            timeout=5
        )
        output = result.stdout
        mx_hosts = re.findall(r'mail exchanger\s*=\s*([a-zA-Z0-9.-]+)', output, re.IGNORECASE)
        if not mx_hosts:
            mx_hosts = re.findall(r'MX preference\s*=\s*\d+,\s*mail exchanger\s*=\s*([a-zA-Z0-9.-]+)', output, re.IGNORECASE)
        return [host.rstrip('.') for host in mx_hosts]
    except Exception:
        return []

def verify_smtp(email, mx_host):
    try:
        server = smtplib.SMTP(timeout=TIMEOUT)
        server.connect(mx_host, 25)
        server.helo("check.com")
        server.mail(SENDER_EMAIL)
        code, message = server.rcpt(email)
        server.quit()
        return code == 250
    except Exception:
        return False

def main():
    if not os.path.exists(INPUT_FILE):
        print(f"Fichier introuvable : {INPUT_FILE}")
        return

    valid_leads = []
    
    with open(INPUT_FILE, mode='r', encoding='utf-8') as infile:
        reader = csv.DictReader(infile)
        fieldnames = list(reader.fieldnames) if reader.fieldnames else []
        if "validEmail" not in fieldnames:
            fieldnames.append("validEmail")
            
        rows = list(reader)
        print(f"Traitement de {len(rows)} leads...")

        for idx, row in enumerate(rows, 1):
            first_name = row.get("firstName", "")
            last_name = row.get("lastName", "")
            domain = row.get("companyDomain", "")
            
            print(f"[{idx}/{len(rows)}] Verification de {first_name} {last_name} ({domain})...")
            
            mx_hosts = get_mx_hosts(domain)
            if not mx_hosts:
                print(f"  [-] Pas de serveur MX trouve pour {domain}")
                continue

            mx_host = mx_hosts[0]
            permutations = generate_email_permutations(first_name, last_name, domain)
            
            valid_email_found = None
            for candidate in permutations:
                time.sleep(random.uniform(2.0, 5.0))
                
                is_valid = verify_smtp(candidate, mx_host)
                if is_valid:
                    print(f"  [+] Email Valide trouve : {candidate}")
                    valid_email_found = candidate
                    break

            if valid_email_found:
                row["validEmail"] = valid_email_found
                valid_leads.append(row)

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, mode='w', encoding='utf-8', newline='') as outfile:
        writer = csv.DictWriter(outfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(valid_leads)

    print(f"Traitement termine. {len(valid_leads)} emails valides sauvegardes dans {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
