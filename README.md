# 🏛️ MASTER PLAN — SYSTÈME MULTI-AGENTS AUTONOME

[![Quality Gates](https://github.com/Octet2Bis/MasterPlan/actions/workflows/quality_gates.yml/badge.svg)](https://github.com/Octet2Bis/MasterPlan/actions/workflows/quality_gates.yml)
[![Architecture](https://img.shields.io/badge/Architecture-3_Piliers_Hermétiques-0ea5e9.svg)](file:///master_router.md)
[![Rule Enforcement](https://img.shields.io/badge/Loi_Fondamentale-AGENTS.md-10b981.svg)](file:///AGENTS.md)

Le **Master Plan** est une infrastructure modulaire d'ingénierie logicielle, d'acquisition de croissance (GTM) et d'assistance personnelle pilotée par des agents IA autonomes.

---

## 🧭 Navigation Rapide dans l'Écosystème

| Composant | Rôle & Documentation |
| :--- | :--- |
| **Tour de Contrôle** | 👉 [`master_router.md`](master_router.md) — Arbitrage stratégique global et routage des contextes |
| **Loi Fondamentale** | 👉 [`AGENTS.md`](AGENTS.md) — Plafond strict (< 250 lignes), zéro inlining JSON et Quality Gates obligatoires |
| **Pilier 01 : GTM & Growth** | 👉 [`01_GTM_Growth/`](01_GTM_Growth/) — Moteurs d'enrichissement, scoring neuro-cognitif, pipelines de prospection |
| **Pilier 02 : Assistant Personnel** | 👉 [`02_Assistant_Personnel/`](02_Assistant_Personnel/) — Ingestion Telegram sécurisée 2FA, automatisation, career ops |
| **Pilier 03 : Développement d'Apps** | 👉 [`03_Developpement_App/`](03_Developpement_App/) — Application native iOS **Aevum** (SwiftUI / Screen Time) & Simulateur Web |

---

## 🛡️ Les 3 Couches d'Intégrité Inviolables

1. **Couche 1 (Routage Étanche)** : Chaque action est confinée à son pilier sans pollution croisée.
2. **Couche 2 (Séparation des Responsabilités)** : Découpage strict UI / Engine / Services (< 250 lignes par fichier).
3. **Couche 3 (Étanchéité des Ressources)** : Données transactionnelles dans `/Workspace/`, secrets dans `/.secrets/` (exclus de Git), zéro binaire lourd dans l'arborescence.

---

## 🧪 Exécution des Quality Gates

```bash
# Vérification d'intégrité du code (Dev Web & iOS)
node 03_Developpement_App/toolbox/test_code_integrity.js

# Vérification des pipelines et scoring (GTM)
python 01_GTM_Growth/toolbox/test_quality_gates.py
```
