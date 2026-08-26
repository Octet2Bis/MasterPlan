---
name: agent-harness-ops
description: Manuel opérationnel et standards d'exécution pour agents autonomes inspirés des harnesses de référence mondiaux (SWE-Agent, OpenHands, Aider, Inspect AI, Promptfoo, E2B, Daytona). À utiliser dans 03_Developpement_App/ et 01_GTM_Growth/.
---

# 🤖 Agent Harness Operations & Execution Standards

Ce skill définit les protocoles d'ingénierie agentique, de fenêtrage chirurgical (ACI), d'évaluation déterministe (Scorers) et de sandboxing sécurisé pour toute mission autonome.

---

## 🏛️ Les 3 Piliers du Harness Opérationnel

```
                                  [AGENT HARNESS OPS]
                                          │
        ┌─────────────────────────────────┼─────────────────────────────────┐
        ▼                                 ▼                                 ▼
 [1. ACTION & ACI]               [2. ÉVALUATION & SCORERS]         [3. SANDBOX & RUNTIME]
 • SWE-Agent (Fenêtrage)          • Inspect AI (Tripartite)         • E2B (Firecracker MicroVMs)
 • OpenHands (EventStream)        • Promptfoo (CI/CD Rules)         • Daytona (Dev Environments)
 • Aider (Repo-Map & Git Loop)    • Strix (OWASP Quality Gate)      • Docker (Multi-stage non-root)
```

---

## 🛠️ 1. Standards d'Action & Modification de Code (SWE-Agent & Aider)
* **Édition Chirurgicale :** Toujours cibler les lignes exactes (`replace_file_content`) avec les balises de contexte. Interdiction d'écraser un fichier entier de plus de 100 lignes.
* **Repo-Map Avant Exploration :** Exécuter `python 03_Developpement_App/toolbox/repo_mapper.py <dossier>` pour obtenir les signatures de classes et de fonctions sans saturer la fenêtre de contexte.
* **Cycle Git Déterministe :** *Edit $\rightarrow$ Linter de syntaxe $\rightarrow$ Test unitaire $\rightarrow$ Commit ou Rollback*.

---

## 📊 2. Standards d'Évaluation & Quality Gates (Inspect AI & Promptfoo)
* **Modèle Tripartite :** Séparer explicitement le **Solver** (la stratégie de l'agent), la **Sandbox** (l'environnement d'exécution), et le **Scorer** (la fonction de test programmatique).
* **Validation d'État :** Exécuter `python 03_Developpement_App/toolbox/state_scorer.py` pour valider mathématiquement qu'aucune règle de l'architecture 3 couches n'a été violée.

---

## ⚡ 3. Standards de Sandboxing & Isolation (OpenHands & E2B)
* **Effets Réversibles :** Tout processus temporaire (serveur de test, conteneur de build) doit être arrêté ou détruit après exécution (`docker run --rm`).
* **Isolation des Secrets :** Zéro clé d'API passée en dur dans les prompts ou les scripts. Injection systématique via `.secrets/.env`.
