---
name: archify
description: Génère des diagrammes d'architecture techniques interactifs, déterministes et vérifiables (fichiers HTML auto-contenus, dark/light mode, animations de flux et export SVG/PNG) pour documenter les flux de données, l'infrastructure iOS Aevum, les pipelines GTM et le Master Plan.
---

# ARCHIFY — AGENTIC ARCHITECTURE DIAGRAM GENERATOR

Ce skill guide la conception et la génération de **diagrammes d'architecture techniques interactifs, vérifiables et prêts pour la production**.

Au lieu de simples diagrammes statiques en boîte noire, Archify génère des **fichiers HTML interactifs autonomes** (Single-File Architecture Maps) respectant les principes d'ingénierie et l'esthétique Swiss Craft du Master Plan.

---

## 🏛️ Les 5 Règles d'Or Archify

### 1. Déterminisme & Code-Grounded Facts
- Le diagramme ne doit comporter **aucune liaison imaginaire**.
- Chaque composant, extension ou pipeline doit correspondre à un fichier ou service réel du dépôt (`AevumApp`, `DeviceActivityMonitor`, `HealthKitManager`, `OSINT Waterfall`).

### 2. Clarté Cognitive (8 à 12 Composants Clés)
- Éviter le "spaghetti diagram". Privilégier 8 à 12 blocs stratégiques majeurs.
- Les détails d'implémentation secondaires doivent résider dans des **cartes dépliables / infobulles contextuelles** plutôt que d'encombrer le canvas principal.

### 3. Visualisation des Frontières de Sécurité (Trust Boundaries)
- Mettre en évidence les zones étanches :
  - `Zone iOS Native (Apple Sandbox & FamilyControls)`
  - `Zone Sandboxée Locale (Workspace / Ingestion)`
  - `Zone Réseau Externe (APIs, Webhook, Apple HealthKit)`
  - `Zone Secrets (Variables d'environnement .env isolées)`

### 4. Rendu Interactif & Motion Intentionnel
- Chaque diagramme généré est un fichier HTML autonome contenant :
  - **Animation de flux (Pulsing flow particles / SVG paths animés)** illustrant le sens de circulation des données.
  - **Bascule Dark / Light mode** (palette Dark Charcoal `#0B0C0E` / Swiss Paper `#F8F9FA`).
  - **Bouton d'Export Vectoriel SVG / PNG** pour intégration dans les pitch decks ou revues de code.

### 5. Typographie & Grille Épurée
- Typographies : **Space Grotesk** pour les titres système, **Plus Jakarta Sans / Inter** pour les descriptions, **JetBrains Mono** pour les endpoints et variables.
- Grille orthogonale 8px avec connecteurs à angles droits (`polyline` ou `path` SVG nets).

---

## 📐 Structure Standard d'un Diagramme Archify

```text
+-----------------------------------------------------------------------------------+
|  [ 🗺️ MASTER PLAN / AEVUM ]   Architecture Runtime v2.0    [ ☀️ Mode ] [ 💾 SVG ]  |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|   [ TRUST BOUNDARY : APPLE SANDBOX ]                                              |
|   +--------------------------+           +------------------------------------+   |
|   | 📱 User App (SwiftUI)    |  ======>  | 🛡️ DeviceActivityMonitor (Ext.)    |   |
|   | Views, MVVM, HealthKit   |           | Détection Screen Time & Quotas     |   |
|   +--------------------------+           +------------------------------------+   |
|                 ||                                        ||                      |
|                 \/                                        \/                      |
|   +--------------------------+           +------------------------------------+   |
|   | 🫁 Longevity Engine      |           | 🛑 ShieldConfiguration (Ext.)      |   |
|   | 12 Protocoles de Santé   |  <======  | Déviation positive vers Aevum      |   |
|   +--------------------------+           +------------------------------------+   |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

---

## 🛠️ Instructions de Génération pour l'Agent

Lorsqu'on te demande de créer un diagramme Archify :
1. **Analyser le module cible** (ex: `03_Developpement_App_and_Design/apps/aevum_ios/` ou `01_GTM_Growth/pipelines/`).
2. **Extraire les 8 à 12 entités maîtresses** et leurs flux d'appels.
3. **Créer le fichier HTML interactif** dans `Workspace/` ou `artifacts/` avec les styles CSS intégrés, les SVG de connecteurs animés et le script d'export.
4. **Valider l'étanchéité** (< 250 lignes de structure ou modularisé).
