# 📊 Standards d'Évaluation Déterministe (Inspect AI) & CI/CD Guardrails (Promptfoo)

Ce document standardise le framework d'évaluation et de validation déterministe inspiré de **[UKGovernmentBEIS/inspect_ai](https://github.com/UKGovernmentBEIS/inspect_ai)** et **[promptfoo/promptfoo](https://github.com/promptfoo/promptfoo)**.

---

## 🏛️ 1. Le Modèle Tripartite d'Évaluation (Inspect AI)

Toute tâche complexe exécutée par un agent doit être modélisée selon 3 couches strictement indépendantes :

```
┌────────────────────────────────────────────────────────────────────────┐
│                        1. SOLVER (L'Agent & la Méthode)                │
│    • Stratégie ReAct, Plan-and-Execute, ou Prompting Spécialisé         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        2. SANDBOX (Le Runtime Isolé)                   │
│    • Environnement conteneurisé (Docker, MicroVM E2B, dossier hermétique│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        3. SCORER (La Validation Déterministe)          │
│    • Fonction mathématique ou programmatique qui vérifie l'état final  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📐 2. Typologie des "Scorers" de Validation dans le Master Plan

Chaque mission doit spécifier son **Scorer** dans sa Quality Gate :

1. **Scorers Booléens (Pass / Fail) :**
   * *Code Cleanliness :* 0 erreur de compilation / 0 faille de sécurité Strix.
   * *API Contract :* Schéma JSON conforme au schéma Pydantic/Zod à 100%.
2. **Scorers Continues (Métriques 0 à 100) :**
   * *Délivrabilité Outbound :* Score de confiance email $\ge 85$ (Tier Gold).
   * *Performance Web :* Google Core Web Vitals $\ge 95/100$.
   * *Linter Anti-Slop :* 0 mot cliché IA sur une page de vente.

---

## 🧪 3. Guardrails CI/CD & Conformité des Règles (Inspiré de Promptfoo)

* **Vérification Déterministe des Fichiers Markdown :**
  * Validation automatique que les fichiers de configuration ou de documentation respectent la hiérarchie des titres (H1 unique, balises d'alertes GitHub valides).
* **Test de Non-Régression des Prompts :**
  * S'assurer qu'une modification de prompt ou de skill n'introduit pas d'hallucinations sur les formats de sortie.
