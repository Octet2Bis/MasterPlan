"""
test_quality_gates.py — Test unitaire des Linters et Validateurs.
"""

import sys
import io
from pathlib import Path

# Garantir que 01_GTM_Growth est dans sys.path pour les imports de toolbox
TOOLBOX_PARENT = Path(__file__).resolve().parent.parent.parent
if str(TOOLBOX_PARENT) not in sys.path:
    sys.path.insert(0, str(TOOLBOX_PARENT))

# Forcer l'encodage UTF-8 pour la console Windows
if hasattr(sys.stdout, 'buffer'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from toolbox.core.email_linter import EmailLinter
from toolbox.core.schema_validator import SchemaValidator

def main():
    print("=== TEST 1: EMAIL LINTER ===")
    linter = EmailLinter()
    
    clean_email = (
        "Bonjour David, j'ai remarqué votre développement récent sur le pôle partenariats chez Wonderbox. "
        "Beaucoup de directeurs font face au défi d'optimiser la contractualisation. "
        "Seriez-vous ouvert à un rapide échange de 10 min mardi pour voir si une synergie fait sens ?"
    )
    clean_res = linter.lint("Synergie Wonderbox x Antigravity", clean_email)
    print(f"Clean Email -> Status: {clean_res['status']}, Score: {clean_res['deliverability_score']}/100")
    
    spam_email = (
        "Gagnez de l'argent facile sans risque ! Cliquez ici pour devenir riche avec notre opportunité unique. "
        "{{FIRSTNAME}} profitez de ce cadeau exceptionnel 100% gratuit !!!"
    )
    spam_res = linter.lint("OFFRE EXCEPTIONNELLE 100% GRATUIT !!!", spam_email)
    print(f"Spam Email  -> Status: {spam_res['status']}, Score: {spam_res['deliverability_score']}/100")
    print(f"Spam Words  : {spam_res['detected_spam_words']}")
    print(f"Unresolved  : {spam_res['unresolved_vars']}")

    print("\n=== TEST 2: SCHEMA VALIDATOR ===")
    validator = SchemaValidator()
    
    valid_faq = '''{
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [{
        "@type": "Question",
        "name": "Comment intégrer un partenariat ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "L'intégration se fait en 3 étapes via nos API standardisées."
        }
      }]
    }'''
    val_res = validator.validate_json_string(valid_faq)
    print(f"Valid FAQ   -> Is Valid: {val_res['is_valid']}, Type: {val_res['schema_type']}")

    invalid_faq = '{"@context": "wrong", "@type": "FAQPage"}'
    inval_res = validator.validate_json_string(invalid_faq)
    print(f"Invalid FAQ -> Is Valid: {inval_res['is_valid']}, Errors: {inval_res['errors']}")

    assert clean_res['status'] == 'PASS', "Clean email must PASS"
    assert spam_res['status'] == 'FAIL', "Spam email must FAIL"
    assert val_res['is_valid'] is True, "Valid FAQ must be True"
    assert inval_res['is_valid'] is False, "Invalid FAQ must be False"
    print("\n[OK] TOUS LES TESTS DE QUALITY GATES ONT REUSSI AVEC SUCCES !")

if __name__ == "__main__":
    main()
