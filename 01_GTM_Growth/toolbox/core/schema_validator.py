"""
schema_validator.py — Quality Gate & Validateur Schema.org JSON-LD (0€ / Zéro Dépendance).

Valide la conformité syntaxique et structurelle des blocs de données structurées JSON-LD
générés pour le référencement IA (AEO/GEO) et les moteurs de recherche.
"""

import json
import re
import sys
import argparse
from typing import Dict, Any, List

REQUIRED_SCHEMA_FIELDS = {
    "FAQPage": ["@context", "@type", "mainEntity"],
    "Question": ["@type", "name", "acceptedAnswer"],
    "Answer": ["@type", "text"],
    "SoftwareApplication": ["@context", "@type", "name", "operatingSystem", "applicationCategory"],
    "Article": ["@context", "@type", "headline", "author", "publisher"],
    "Organization": ["@context", "@type", "name", "url"],
    "HowTo": ["@context", "@type", "name", "step"]
}


class SchemaValidator:
    """
    Validateur de blocs de données structurées JSON-LD.
    """

    def validate_json_string(self, json_str: str) -> Dict[str, Any]:
        warnings: List[str] = []
        errors: List[str] = []

        try:
            data = json.loads(json_str)
        except Exception as e:
            return {
                "is_valid": False,
                "schema_type": "Unknown",
                "errors": [f"Erreur de syntaxe JSON : {str(e)}"],
                "warnings": []
            }

        # Vérification @context et @type
        context = data.get("@context", "")
        if "schema.org" not in str(context).lower():
            errors.append("Le champ '@context' doit pointer vers 'https://schema.org'.")

        schema_type = data.get("@type", "")
        if not schema_type:
            errors.append("Le champ '@type' est obligatoire dans un bloc Schema.org.")
        else:
            required = REQUIRED_SCHEMA_FIELDS.get(schema_type, ["@context", "@type", "name"])
            for req in required:
                if req not in data:
                    errors.append(f"Champ obligatoire manquant pour le type '{schema_type}' : '{req}'.")

        # Validation spécifique FAQPage
        if schema_type == "FAQPage":
            main_entity = data.get("mainEntity", [])
            if not isinstance(main_entity, list) or len(main_entity) == 0:
                errors.append("'mainEntity' doit être une liste non vide de questions pour une 'FAQPage'.")
            else:
                for idx, q in enumerate(main_entity):
                    if not isinstance(q, dict) or q.get("@type") != "Question" or not q.get("name"):
                        errors.append(f"Élément {idx+1} dans mainEntity n'est pas une 'Question' valide.")
                    answer = q.get("acceptedAnswer", {})
                    if not isinstance(answer, dict) or answer.get("@type") != "Answer" or not answer.get("text"):
                        warnings.append(f"Question {idx+1} ('{q.get('name', '')[:30]}...') manque d'une 'Answer' textuelle complète.")

        is_valid = len(errors) == 0
        return {
            "is_valid": is_valid,
            "schema_type": schema_type,
            "errors": errors,
            "warnings": warnings
        }

    def validate_html_content(self, html_content: str) -> List[Dict[str, Any]]:
        """Extrait et valide tous les blocs <script type="application/ld+json"> du HTML."""
        blocks = re.findall(r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', html_content, re.DOTALL | re.IGNORECASE)
        if not blocks:
            return [{"is_valid": False, "schema_type": "None", "errors": ["Aucun bloc <script type='application/ld+json'> trouvé dans le HTML."], "warnings": []}]

        results = []
        for b in blocks:
            results.append(self.validate_json_string(b.strip()))
        return results


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Validateur Schema.org JSON-LD")
    parser.add_argument("--file", help="Chemin du fichier JSON ou HTML à auditer")
    parser.add_argument("--json", help="Chaîne JSON directe à auditer")

    args = parser.parse_args()
    validator = SchemaValidator()

    if args.file:
        with open(args.file, "r", encoding="utf-8") as f:
            content = f.read()
        if args.file.endswith(".html") or "<script" in content:
            res_list = validator.validate_html_content(content)
        else:
            res_list = [validator.validate_json_string(content)]
    elif args.json:
        res_list = [validator.validate_json_string(args.json)]
    else:
        print("Veuillez fournir --file ou --json")
        sys.exit(1)

    print("\n--- 🔍 RAPPORT DE VALIDATION SCHEMA.ORG ---")
    all_valid = True
    for idx, res in enumerate(res_list):
        print(f"\nBloc #{idx+1} [Type: {res['schema_type']}] : {'✅ VALIDE' if res['is_valid'] else '❌ INVALIDE'}")
        if res["errors"]:
            all_valid = False
            for err in res["errors"]:
                print(f"  ❌ Erreur : {err}")
        if res["warnings"]:
            for warn in res["warnings"]:
                print(f"  ⚠️ Alerte : {warn}")

    print("-------------------------------------------\n")
    sys.exit(0 if all_valid else 1)
