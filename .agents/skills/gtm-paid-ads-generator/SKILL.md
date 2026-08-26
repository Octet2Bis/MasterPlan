---
name: gtm-paid-ads-generator
description: Génère des campagnes et variantes publicitaires optimisées pour Google Ads (Responsive Search Ads) et Meta Ads (Accroches visuelles, Textes primaires, CTA). À utiliser dans 03_Experimentation/.
---

# 📢 Générateur de Variantes Publicitaires (Paid Media)

Ce skill standardise la création de variantes publicitaires structurées pour les plateformes Google Ads et Meta Ads.

---

## 🎯 Formats & Structures par Plateforme

### 1. Google Ads — Responsive Search Ads (RSA)
*Génère 15 titres et 4 descriptions interchangeables :*
* **Titres (Max 30 caractères chacun) :**
  - 5 Titres basés sur les Mots-clés exacts (ex: `Solution Partenariat B2B`)
  - 5 Titres basés sur les Bénéfices / Valeur (ex: `+30% de Volume d'Affaires`)
  - 5 Titres avec Call to Action / Urgence (ex: `Découvrez la Démo en Ligne`)
* **Descriptions (Max 90 caractères chacune) :**
  - 2 Descriptions axées sur le problème / douleur (PAS)
  - 2 Descriptions axées sur la preuve sociale et les garanties

### 2. Meta Ads (Facebook & Instagram) — Structure Triple Accroche
*Génère 3 angles créatifs distincts pour l'A/B testing :*
* **Angle 1 : L'Accroche Viscérale (Pain Point / Contre-intuitif)**
  - *Hook :* Une phrase choc arrêtant le scroll.
  - *Body :* Explication du mécanisme en 3 lignes.
  - *CTA :* Lien vers la Landing Page.
* **Angle 2 : La Preuve Sociale / Cas d'Usage (Case Study)**
  - *Hook :* Chiffre marquant ou citation client.
* **Angle 3 : L'Offre Directe (Lead Magnet / Démo)**
  - *Hook :* Accès gratuit à la calculatrice ou à l'outil.

---

## 📁 Enregistrement
Enregistrer les variantes dans `Workspace/campaigns/<nom_campagne>/paid_ads/ads_copy.md`.
