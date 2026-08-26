---
name: gtm-neuro-acquisition
description: Génère des angles d'acquisition et propositions de copywriting (Cold Email, Landing Page, Ads) explicitement labellisés selon les 7 grands leviers de neurosciences et d'économie comportementale (Kahneman, Cialdini, Thaler, Voss). À utiliser dans 02_Acquisition_and_AEO/, 03_Experimentation/ et 04_Outbound_and_CRM/.
---

# 🧠 GTM Neuro-Acquisition — Moteur de Persuasion & Leviers Comportementaux

Ce skill structure toute proposition d'acquisition (campagne outbound, accroche de landing page, variante publicitaire) autour des **7 leviers neuro-comportementaux validés par les sciences cognitives**.

Chaque proposition générée par ce skill est **explicitement labellisée avec son badge cognitif et son explication neuroscientifique**.

---

## 🏷️ Les 7 Badges Cognitifs d'Acquisition

1. **`[PSY-LOSS-AVERSION]` (Aversion à la perte & Coût de l'inaction — Daniel Kahneman)** :
   * *Mécanisme :* Chiffrer ce que le prospect perd chaque mois en maintenant le statu quo (douleur de la perte 2x supérieure au plaisir du gain).
2. **`[PSY-RECIPROCITY]` (Réciprocité asymétrique / Value-First — Robert Cialdini)** :
   * *Mécanisme :* Offrir un audit offert, un template ou un benchmark actionnable avant de formuler la moindre demande.
3. **`[PSY-SOCIAL-PROOF]` (Preuve sociale de pairs — Richard Thaler & Robert Cialdini)** :
   * *Mécanisme :* Rassurer le cerveau en montrant que des organisations comparables ont déjà validé la solution.
4. **`[PSY-AUTHORITY-DATA]` (Autorité par la spécificité chiffrée — B.J. Fogg)** :
   * *Mécanisme :* Remplacer les superlatifs vagues par des métriques exactes et des preuves vérifiables.
5. **`[PSY-MICRO-COMMITMENT]` (Micro-engagement sans friction — Chris Voss)** :
   * *Mécanisme :* Poser une question à réponse binaire à 0 friction (*"Seriez-vous contre le fait que..."*) plutôt que de demander un appel de 30 min.
6. **`[PSY-FRAMING-CONTRAST]` (Effet de cadrage & Ancrage — Amos Tversky & Kahneman)** :
   * *Mécanisme :* Comparer le prix de la solution au coût d'un problème récurrent bien plus lourd (ex: le coût d'un recrutement ou d'un mois de retard).
7. **`[PSY-CURIOSITY-GAP]` (Trou informationnel — George Loewenstein)** :
   * *Mécanisme :* Révéler un angle mort ou une anomalie dans les processus de la cible pour stimuler l'envie irrépressible de savoir.

---

## 🛠️ Format Obligatoire de Restitution

Pour chaque variante d'acquisition proposée, l'agent doit formater le livrable comme suit :

```markdown
### 🏷️ [CODE-LEVIER] : Nom du Levier
* **📚 Fondement Scientifique :** [Auteur & Théorie]
* **🧠 Mécanisme Cognitif :** [Explication du réflexe cérébral activé]
* **📧 Proposition Cold Email / Message :**
  > **Objet :** [Objet court < 7 mots]
  > **Corps :** [Texte < 100 mots sans mot spam ni superlatif creux]
  > **CTA :** [Question d'engagement à friction nulle]
* **🌐 Accroche Landing Page (Hero) :**
  > **Titre H1 :** [Titre d'impact]
  > **Sous-titre :** [Clarification de la valeur]
  > **Bouton CTA :** [Verbe d'action orienté bénéfice]
```

---

## ⚙️ Exécution Automatisée via Toolbox
Pour générer les 7 variantes en une seule commande Python :
```bash
python -m toolbox.core.neuro_acquisition_engine
```
