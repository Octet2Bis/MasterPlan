"""
email_linter.py — Quality Gate & Linter de Délivrabilité Anti-Spam (0€ / Zéro Dépendance).

Analyse les objets et corps d'emails rédigés pour détecter :
1. Les mots et expressions déclencheurs de spam (Spam Trigger Words en FR et EN).
2. La longueur excessive (> 150 mots) qui pénalise la conversion B2B.
3. Les variables de template non résolues (ex: {{FIRSTNAME}}, {{COMPANY}}).
4. La ponctuation agressive (MAJUSCULES, points d'exclamation multiples).
5. L'absence d'un Call to Action (CTA) clair et unique.
"""

import re
import sys
import argparse
from typing import List, Dict, Any

# Liste des mots déclencheurs de filtres anti-spam (FR & EN)
SPAM_TRIGGER_WORDS = [
    # FR - Promesses financières / Urgence / Superlatifs
    "100% gratuit", "gratuit", "argent facile", "sans engagement", "urgent", "garanti",
    "gagner de l'argent", "offre exceptionnelle", "exclusif", "promotion", "réduction immédiate",
    "cliquez ici", "satisfait ou remboursé", "opportunité unique", "revenus passifs",
    "devenez riche", "miracle", "magique", "sans risque", "prix cassé", "meilleur prix",
    "félicitations", "vous avez gagné", "cash", "cadeau",
    # EN - High risk keywords
    "100% free", "free", "make money", "no risk", "guaranteed", "urgent", "act now",
    "limited time", "click here", "cash bonus", "winner", "congratulations",
    "risk free", "earn extra cash", "exclusive deal", "special promotion"
]


class EmailLinter:
    """
    Linter et auditeur de qualité de copie d'email froid.
    """

    def __init__(self, max_words: int = 140):
        self.max_words = max_words

    def lint(self, subject: str, body: str) -> Dict[str, Any]:
        warnings: List[str] = []
        penalties = 0

        full_text = f"{subject} {body}".lower()
        word_count = len(body.split())

        # 1. Détection des variables non résolues (ex: {{NOM}}, {Prénom})
        unresolved_vars = re.findall(r"(\{\{[^}]+\}\}|\{[A-Za-z_]+\})", f"{subject} {body}")
        if unresolved_vars:
            warnings.append(f"Variables de template non résolues détectées : {', '.join(set(unresolved_vars))}")
            penalties += 40

        # 2. Détection des Spam Trigger Words
        detected_spam_words = []
        for word in SPAM_TRIGGER_WORDS:
            # Recherche exacte de mot / locution
            if re.search(r"\b" + re.escape(word) + r"\b", full_text):
                detected_spam_words.append(word)
                penalties += 15

        if detected_spam_words:
            warnings.append(f"Mots déclencheurs de spam détectés : {', '.join(detected_spam_words)}")

        # 3. Contrôle de longueur
        if word_count > self.max_words:
            warnings.append(f"Email trop long ({word_count} mots). La limite recommandée en B2B est de {self.max_words} mots.")
            penalties += 10
        elif word_count < 25:
            warnings.append(f"Email très court ({word_count} mots). Risque de manquer de contexte.")
            penalties += 5

        # 4. Ponctuation agressive et majuscules
        if "!!!" in f"{subject} {body}" or "???" in f"{subject} {body}":
            warnings.append("Ponctuation excessive (!!! ou ???) détectée.")
            penalties += 10

        if subject.isupper() and len(subject) > 5:
            warnings.append("L'objet de l'email est entièrement en MAJUSCULES.")
            penalties += 25

        # 5. Présence d'un Call to Action (CTA)
        has_cta = "?" in body or any(cta in full_text for cta in ["disponible", "échange", "semaine", "créneau", "qu'en pensez-vous", "call", "rencontrer"])
        if not has_cta:
            warnings.append("Aucun Call to Action (CTA) clair ou question d'engagement détectée.")
            penalties += 10

        deliverability_score = max(0, 100 - penalties)
        status = "PASS" if deliverability_score >= 80 else ("WARN" if deliverability_score >= 60 else "FAIL")

        return {
            "deliverability_score": deliverability_score,
            "status": status,
            "word_count": word_count,
            "detected_spam_words": detected_spam_words,
            "unresolved_vars": list(set(unresolved_vars)),
            "warnings": warnings
        }


def lint_email_file(file_path: str) -> Dict[str, Any]:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Extraction simple objet / corps si au format standard
    subject = ""
    body = content
    if "Objet :" in content or "Subject:" in content:
        lines = content.splitlines()
        for i, line in enumerate(lines):
            if line.startswith("Objet :") or line.startswith("Subject:"):
                subject = line.split(":", 1)[1].strip()
                body = "\n".join(lines[i+1:])
                break

    linter = EmailLinter()
    return linter.lint(subject, body)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Linter de délivrabilité d'email anti-spam")
    parser.add_argument("--file", help="Chemin du fichier email markdown/texte à auditer")
    parser.add_argument("--subject", default="", help="Objet de l'email")
    parser.add_argument("--body", default="", help="Corps de l'email")

    args = parser.parse_args()

    linter = EmailLinter()
    if args.file:
        res = lint_email_file(args.file)
    else:
        res = linter.lint(args.subject, args.body)

    print("\n--- 🛡️ RAPPORT DE DÉLIVRABILITÉ EMAIL ---")
    print(f"Statut       : {res['status']}")
    print(f"Score        : {res['deliverability_score']} / 100")
    print(f"Nombre mots  : {res['word_count']}")
    if res["warnings"]:
        print("\n⚠️ Avertissements :")
        for w in res["warnings"]:
            print(f"  - {w}")
    else:
        print("\n✅ Aucun avertissement. Email prêt pour l'envoi !")
    print("------------------------------------------\n")
    sys.exit(0 if res["status"] in ("PASS", "WARN") else 1)
