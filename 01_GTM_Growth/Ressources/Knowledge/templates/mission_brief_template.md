# 🎯 Mission Brief : [Nom de la Campagne]
**Date :** YYYY-MM-DD | **Mode Actif :** B2B Enterprise / B2C App | **Statut :** Validé

---

## 1. Contexte Stratégique & Cible
* **Source de Vérité Activée :** `Ressources/Knowledge/product-marketing-[b2b|b2c].md`
* **ICP / Persona Visé :** [Ex: Directeurs des Partenariats & Alliances Stratégiques]
* **Données d'Entrée :** `Workspace/04_scored_crm.csv` ([X] leads qualifiés Tier Gold $\ge 85$)
* **Objectif Clé :** [Ex: Obtenir des rendez-vous d'échange pour un partenariat co-marqué]

---

## 2. Plan d'Action & Pôles Métiers Mobilisés

| Pôle Cible | Livrable Attendu | Framework / Méthodologie | Fichier de Sortie |
|---|---|---|---|
| **04_Outbound_and_CRM/** | Séquence Cold Email 3 touches | Framework PAS (Problem - Agitate - Solution) | `Workspace/campaigns/<nom>/outbound/sequence_partenariats.md` |
| **03_Experimentation/** | Landing Page de démo partenariat | HTML5 / CSS Vanilla Responsive + CRO | `Workspace/campaigns/<nom>/landing_pages/index.html` |
| **02_Acquisition_and_AEO/** | Post LinkedIn Thought Leadership | Format Storytelling / Preuve sociale | `Workspace/campaigns/<nom>/acquisition/post_linkedin.md` |

---

## 3. Garde-Fous & Quality Gates Validés
* [x] **Délivrabilité :** Seuls les contacts `Tier: Gold` (Score 85 à 98/100) sont contactés.
* [x] **Anti-Spam Linter :** 0 spam trigger word dans les objets et corps de mail.
* [x] **Cohérence de Marque :** Arguments 100% alignés avec `product-marketing-*.md`.

---

## 4. Ordre de Dispatching aux Studios
1. **Étape 1 :** Rédaction de la séquence d'outreach dans `04_Outbound_and_CRM/`.
2. **Étape 2 :** Conception de la Landing Page de destination dans `03_Experimentation/`.
3. **Étape 3 :** Programmation du contenu d'accompagnement dans `02_Acquisition_and_AEO/`.
