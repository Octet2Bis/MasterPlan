---
name: career-job-hunter
description: Pilote la détection d'opportunités professionnelles, le scoring de correspondance (Tier Gold >= 85), le tailoring de CV aux normes ATS et la rédaction de candidatures d'élite avec l'architecture Drafter-Reviewer. À utiliser dans 02_Assistant_Personnel/.
---

# 💼 Career Job Hunter — Chasseur d'Opportunités & Copilote de Carrière

Ce skill automatise la qualification des offres d'emploi / missions de conseil et la génération de dossiers de candidature sur-mesure à fort taux de conversion.

---

## 🏛️ Architecture Contradictoire "Drafter - Reviewer"

Pour chaque offre d'emploi qualifiée **Tier Gold ($\ge 85/100$)** :

### 1. ✍️ L'Agent Drafter (Créateur de Valeur)
* Analyse les requis exacts de l'offre et les mots-clés ATS (compétences, outils, méthodologies).
* Réorganise les expériences du `master_profile.md` pour mettre en avant les preuves chiffrées correspondant exactement aux attentes de l'entreprise.
* Rédige un message d'accroche direct pour le décideur (Recruteur ou Fondateur) sans formules clichées (conforme `no-ai-slop`).

### 2. 🧐 L'Agent Reviewer (Audit Impitoyable / Recruteur Exigeant)
* Évalue la candidature selon une grille rigoureuse (A à F) :
  - **Pertinence des preuves :** Les résultats sont-ils quantifiés ? ($ ou % d'augmentation).
  - **Densité de mots-clés :** L'ATS va-t-il attribuer un score de matching maximal ?
  - **Clarté & Concision :** Pas de blabla, longueur < 1 page.
* Si la note est inférieure à **A-**, force le Drafter à réécrire les sections faibles.

---

## 📁 Rangement & Confidentialité des Données
* Profil de référence du candidat : `02_Assistant_Personnel/Workspace/career/master_profile.md`.
* Offres scrapées & qualifiées : `02_Assistant_Personnel/Workspace/career/scraped_jobs.csv`.
* Dossiers de candidatures générés : `02_Assistant_Personnel/Workspace/career/applications/<entreprise>/`.
