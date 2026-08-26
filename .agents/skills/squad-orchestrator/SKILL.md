---
name: squad-orchestrator
description: Orchestrateur multi-agents déterministe basé sur l'architecture Squad (Manager, Worker, Inspector) pour coordonner des agents CLI autonomes sans daemon lourd, avec exécution obligatoire des Quality Gates.
---

# SQUAD ORCHESTRATOR — MULTI-AGENT COORDINATION STANDARD

Ce skill formalise l'orchestration multi-agents au sein du **Master Plan**, inspirée du moteur `mco-org/squad`.

---

## 🏛️ Les 3 Rôles Fondamentaux du Swarm

```mermaid
flowchart TD
    M["<b>1. MANAGER (master_router)</b><br/>Lit les intentions stratégiques & décompose en tickets étanches"] --> W1["<b>WORKER : Pilier 01</b><br/>GTM & Acquisition"]
    M --> W2["<b>WORKER : Pilier 02</b><br/>Assistant & Ingestion"]
    M --> W3["<b>WORKER : Pilier 03</b><br/>App Dev (Swift / Web)"]
    
    W1 --> I["<b>3. INSPECTOR (Quality Gate)</b><br/>Audit de conformité (< 250 L, Zéro secret, Tests 100%)"]
    W2 --> I
    W3 --> I
    
    I -->|Succès 100%| DONE["<b>MERGE & DÉPLOIEMENT</b>"]
    I -->|Erreur détectée| REJECT["<b>REJET & CORRECTION IMMÉDIATE</b>"]
```

---

### 1. Le Rôle `MANAGER` (Tour de Contrôle)
- **Source de Vérité** : [`master_router.md`](file:///c:/Users/HP/Desktop/Master%20Plan/master_router.md).
- **Mission** : Réceptionner la demande utilisateur, identifier le ou les piliers concernés, et émettre des tâches atomiques ne violant jamais la frontière d'un pilier.

### 2. Le Rôle `WORKER` (Spécialistes par Pilier)
- **Worker GTM** : Opère exclusivement dans `01_GTM_Growth/` (zéro modification d'assets iOS).
- **Worker Assistant** : Opère exclusivement dans `02_Assistant_Personnel/` (ingestion, bots Telegram, veille).
- **Worker App Dev** : Opère exclusivement dans `03_Developpement_App/` (SwiftUI, simulateur Web, UI Bento).

### 3. Le Rôle `INSPECTOR` (Garant Inviolable de la Qualité)
- **Règle Absolue** : Zéro validation sans exécution du test déterministe.
- Exécute `node 03_Developpement_App/toolbox/test_code_integrity.js` et `python 01_GTM_Growth/toolbox/test_quality_gates.py`.
- Si un seul fichier dépasse **250 lignes** ou contient des données brutes inlinées, l'Inspector rejette la pull request.

---

## 🛠️ Commandes CLI Rapides

```bash
# Lancer l'inspection automatique (Rôle Inspector)
node 03_Developpement_App/toolbox/squad_bridge.js inspect

# Dispatcher une tâche vers un Worker spécifique
node 03_Developpement_App/toolbox/squad_bridge.js dispatch 03_Developpement_App "Refonte Player Teenage Engineering"
```
