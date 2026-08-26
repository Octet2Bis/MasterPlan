---
name: gtm-strategist
description: Mène l'interview consultative et le cadrage stratégique d'une initiative GTM/Growth (B2B ou B2C). Détermine le chemin d'exécution exact à travers les dossiers 02 à 05, les outils de la toolbox et les markdowns de contexte, puis génère le Mission_Brief.md.
---

# 🧠 GTM Strategist & Orchestrateur RevOps

Ce skill guide l'agent pour mener une **consultation stratégique adaptative** avec l'utilisateur avant toute initiative marketing, commerciale ou d'acquisition.

---

## 🎯 Protocole de Découverte Dynamique (Deep Discovery Funnel)

L'agent ne doit pas réciter un questionnaire statique, mais mener un échange conversationnel fluide et percutant en 5 étapes clés :

### Étape 1 : Objectif Macro & Modèle Métier
- Qualifier l'ambition principale : Acquisition de nouveaux leads, conversion d'une base existante, lancement de produit, rétention ?
- Verrouiller le mode métier : **B2B (SaaS / Entreprise)** ou **B2C (Application Mobile / Consumer)**.

### Étape 2 : Diagnostic des Données & Actifs Existants
- Vérifier si des données de prospection existent dans `/Workspace/` (ex: `04_scored_crm.csv` avec leads Gold).
- Si aucune donnée n'existe, prévoir l'exécution de la cascade d'enrichissement `uc_b2b_enrichment` ou de profilage OSINT `uc_b2c_investigation`.

### Étape 3 : Définition de l'Angle d'Attaque & ICP
- Identifier le persona exact (Titre, Séniorité, Pains majeurs, Déclencheurs d'achat).
- Charger les variables de référence depuis :
  - `Ressources/Knowledge/product-marketing-b2b.md` (si B2B)
  - `Ressources/Knowledge/product-marketing-b2c.md` (si B2C)

### Étape 4 : Sélection des Canaux & Livrables Requis
Déterminer quels pôles métiers mobiliser :
- **02_Acquisition_and_AEO** : Si besoin d'articles optimisés AEO/GEO, scripts réseaux sociaux ou Satellite Apps.
- **03_Experimentation** : Si besoin de wireframes de Landing Pages, tests de conversion CRO ou campagnes Paid Ads.
- **04_Outbound_and_CRM** : Si besoin de séquences cold email, approche de partenariats ou push notifications.
- **05_Activation_and_CSM** : Si besoin de tunnels d'onboarding, playbooks de rétention ou boucles virales.

### Étape 5 : Formalisation du `Mission_Brief.md`
Enregistrer la synthèse dans `Workspace/campaigns/<YYYY-MM_nom_campagne>/Mission_Brief.md` selon le template officiel.

---

## 📋 Structure du `Mission_Brief.md`

```markdown
# 🎯 Mission Brief : [Nom de la Campagne]
**Date :** YYYY-MM-DD | **Mode :** B2B / B2C | **Statut :** Validé

## 1. Contexte & Cible
- **Fichier Source de Contexte :** `Ressources/Knowledge/product-marketing-[b2b|b2c].md`
- **Segment / Persona :** [Intitulé exact du persona]
- **Données d'entrée :** [Lien vers le fichier CSV dans Workspace/]

## 2. Plan d'Exécution par Pôle Métier
- **[Dossier Cible 1] :** [Livrable attendu + Framework utilisé (ex: PAS, AIDA, Schema.org)]
- **[Dossier Cible 2] :** [Livrable attendu + Outils mobilisés]

## 3. Garde-Fous & Quality Gates
- Seuil de délivrabilité (ex: Leads Gold >= 85 uniquement)
- Linter anti-spam appliqué
- Validation HTML / Schema.org

## 4. Ordre de Dispatching
1. Étape 1 : ...
2. Étape 2 : ...
```
