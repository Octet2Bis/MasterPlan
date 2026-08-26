# 🎯 Studio 04 — Outbound, Prospection & Lifecycle CRM

Ce pôle est responsable de la transformation des contacts certifiés en conversations d'affaires réelles, de la génération d'actifs documentaires commerciaux (PDF, Pitch Decks) et de l'animation du cycle de vie prospect/client.

---

## 🧰 Skills Activables dans ce Studio

* [gtm-b2b-partnership-outreach](file:///c:/Users/HP/Desktop/Master%20Plan/.agents/skills/gtm-b2b-partnership-outreach/SKILL.md) : Approches de partenariats et alliances stratégiques.
* [gtm-copywriting-frameworks](file:///c:/Users/HP/Desktop/Master%20Plan/.agents/skills/gtm-copywriting-frameworks/SKILL.md) : Frameworks de rédaction (PAS, AIDA, BAB).
* [gtm-lead-magnet-funnel](file:///c:/Users/HP/Desktop/Master%20Plan/.agents/skills/gtm-lead-magnet-funnel/SKILL.md) : Conception d'actifs d'accroche à forte valeur.
* [minimax-doc-generator](file:///c:/Users/HP/Desktop/Master%20Plan/.agents/skills/minimax-doc-generator/SKILL.md) : Générateur de propositions commerciales PDF et slides de Pitch Decks B2B.

---

## 🎯 Compétences & Livrables Produits

1. **Séquences Cold Email B2B Hyper-Ciblées** :
   - Approches Peer-to-Peer courtes (< 120 mots), basées sur un signal d'intention ou un constat métier concret.
   - Séquences en 3 à 4 touches : Accroche valeur ➔ Étude de cas / Preuve ➔ Relance d'angle ➔ Break-up email courtois.

2. **Playbooks de Partenariats & Co-Marketing** :
   - Formats d'emails adaptés aux directeurs de partenariats (*Wonderbox, Accor, Atout France*), axés sur l'échange de visibilité et les synergies d'audience.

3. **Documents Commerciaux Haute Fidélité** :
   - Génération de Pitch Decks de partenariats (`.pptx` / Slides) et mémos stratégiques (`.pdf`).

4. **Lifecycle Marketing B2C & Nurturing** :
   - Séquences d'onboarding e-mail (J+1, J+3, J+7) et notifications push de réengagement.

---

## 🛡️ Règles Locales du Pôle & Quality Gates
* **Règle de Délivrabilité Absolue :** Ne rédiger et n'envoyer de séquences qu'aux leads classés `Tier: Gold` (Confidence Score $\ge 85$) issus de `Workspace/04_scored_crm.csv` ou de l'enrichissement.
* **Audit Linter Obligatoire :** Tout email doit être audité avec `python -m toolbox.core.email_linter` avant d'être sauvegardé.
* Les séquences et templates sont enregistrés dans `Workspace/campaigns/<nom_campagne>/outbound/` et les documents dans `Workspace/campaigns/<nom_campagne>/documents/`.
