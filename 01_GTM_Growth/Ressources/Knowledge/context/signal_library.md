# 📡 Bibliothèque des Signaux d'Intention & Règles de Demi-Vie (Signal Decay)

Ce document répertorie les déclencheurs (triggers) qui justifient une prise de contact et leur durée de validité avant péremption.

---

## ⚡ 1. Catalogue des 5 Signaux d'Achat Prioritaires

| ID Signal | Événement Déclencheur | Poids Initial | Demi-Vie (Half-Life) | Action Recommandée |
|---|---|---|---|---|
| `job_change_decision_maker` | **Nomination d'un nouveau DG / Directeur** | 95 / 100 | 30 jours | Contacter sous 48h (période de grâce des 90 premiers jours). |
| `regulatory_deadline_bacs` | **Échéance Réglementaire (Décret BACS)** | 90 / 100 | 60 jours | Offrir la check-list d'audit de conformité. |
| `tech_stack_migration` | **Migration d'outils / Refonte de site** | 85 / 100 | 21 jours | Proposer l'alternative d'intégration rapide sans travaux. |
| `active_hiring_pain_point` | **Recrutement actif sur le sujet** | 75 / 100 | 45 jours | Souligner la surcharge des équipes internes et la solution clé en main. |
| `company_funding_expansion` | **Levée de fonds / Nouveau site ouvert** | 70 / 100 | 40 jours | Féliciter et proposer la modélisation de passage à l'échelle. |

---

## ⏳ 2. Règles de Décroissance Temporelle (Signal Decay)
* **J0 à J15 :** Score intact (100% à 75%). Priorité absolue dans la file d'attente d'outreach.
* **J16 à J45 :** Score tiède (74% à 45%). Approche par ressource éducative offerte (Value-First).
* **Au-delà de J60 (ou Score < 40) :** **SIGNAL PÉRIMÉ.** Interdiction de contacter le prospect. Le risque de saturation par d'autres concurrents et de non-pertinence est trop élevé.
