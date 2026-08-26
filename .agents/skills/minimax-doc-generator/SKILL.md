---
name: minimax-doc-generator
description: Génère des documents professionnels de haute fidélité visuelle (PDF, DOCX, XLSX, PPTX / Slides de Pitch Deck) pour les propositions de partenariats B2B et l'automatisation administrative. À utiliser dans 04_Outbound_and_CRM/ et 02_Assistant_Personnel/.
---

# 📄 MiniMax Doc Generator — Générateur Documentaire Haute Fidélité

Ce skill standardise la génération de documents bureautiques et commerciaux professionnels de niveau direction générale (PDF, Word, Excel, PowerPoint).

---

## 🎯 Les 4 Formats Pris en Charge

### 1. 📊 Pitch Decks & Présentations Commerciales (`.pptx` / Slides HTML)
* **Structure Standard d'un Deck Partenariat (10 Slides) :**
  1. *Couverture :* Titre percutant `Partenariat Stratégique [Notre Solution] x {{COMPANY}}`.
  2. *Le Constat Marché :* Évolution des attentes clients dans le secteur.
  3. *L'Opportunité Manquée :* Volume d'affaires non capté.
  4. *Notre Solution :* La proposition de valeur en 3 piliers visuels (Bento style).
  5. *L'Expérience Utilisateur :* Parcours client sans friction.
  6. *Le Modèle Économique :* Partage de valeur / Synergies.
  7. *Études de Cas & Preuves :* Chiffres de délivrabilité (Score 98/100) et ROI.
  8. *Le Plan de Déploiement en 3 Étapes :* Intégration en moins de 14 jours.
  9. *L'Équipe & Gouvernance.*
  10. *Contact & Prochaines Étapes.*

---

### 2. 📑 Propositions Commerciales & Mémos Stratégiques (`.pdf` / `.docx`)
* **Mise en Page Épurée :** Marges aérées (2.5cm), typographie `Plus Jakarta Sans` ou `Inter`, titres contrastés, callouts d'alerte/note encadrés.
* **Génération PDF :** Conçu via HTML/CSS imprimable (`@media print { ... }`) ou moteur Python léger (`reportlab`).

---

### 3. 📈 Feuilles de Calcul & Modèles Financiers (`.xlsx` / `.csv`)
* Tableaux de données structurés avec en-têtes formatés, totaux calculés par formules (`SUM`, `AVERAGE`) et colonnes ajustées.

---

## 📁 Rangement & Isolation
* Tous les documents générés pour une campagne commerciale sont enregistrés dans :
  `Workspace/campaigns/<nom_campagne>/documents/`
* Tous les documents d'assistant personnel sont enregistrés dans :
  `02_Assistant_Personnel/Workspace/`
