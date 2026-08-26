---
name: gtm-schema-generator
description: Génère des blocs de données structurées Schema.org JSON-LD valides (FAQPage, SoftwareApplication, HowTo, Organization) pour booster le référencement naturel et les citations IA. À utiliser dans 02_Acquisition_and_AEO/.
---

# 🏷️ Générateur Schema.org JSON-LD

Ce skill génère et formate des blocs de métadonnées sémantiques conformes aux standards Schema.org et recommandés par Google.

---

## 📋 Modèles Prêts à l'Emploi

### 1. Modèle `FAQPage` (Recommandé pour les Landing Pages et Articles)
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Quelle est la valeur d'un partenariat avec [Solution] ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "La solution permet de générer [BENEFICE_CHIFFRE] en connectant directement [OFFRE] avec [AUDIENCE] sans friction technique."
      }
    }
  ]
}
</script>
```

### 2. Modèle `SoftwareApplication` (Recommandé pour les SaaS & Apps Mobiles)
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "[Nom du SaaS / App]",
  "operatingSystem": "Web / iOS / Android",
  "applicationCategory": "BusinessApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "EUR"
  }
}
</script>
```

---

## 🛡️ Validation Automatisée
Toujours exécuter `python -m toolbox.core.schema_validator --json "..."` pour s'assurer de l'absence d'erreurs de syntaxe avant insertion dans le HTML.
