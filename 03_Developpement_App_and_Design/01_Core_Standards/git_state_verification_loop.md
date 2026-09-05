# 🔄 Boucle de Vérification d'État & Rollback Automatique (Inspiré d'Aider)

Ce document standardise le cycle d'itération déterministe basé sur l'état Git et l'analyse statique de code, inspiré du **harness benchmark d'[Aider-AI/aider](https://github.com/Aider-AI/aider)**.

---

## 🔁 1. Le Cycle d'Exécution "Edit ➔ Test ➔ Commit / Rollback"

Pour garantir qu'une modification de code ne casse jamais un projet en production :

```
             ┌────────────────────────────────────────────────────────┐
             │                     1. CODE EDIT                       │
             │           Modification ciblée via ACI                  │
             └───────────────────────────┬────────────────────────────┘
                                         │
                                         ▼
             ┌────────────────────────────────────────────────────────┐
             │                 2. SYNTAX & LINT CHECK                 │
             │         Vérification de syntaxe immédiate              │
             └───────────────────────────┬────────────────────────────┘
                                         │
                                         ▼
             ┌────────────────────────────────────────────────────────┐
             │                 3. AUTOMATED TEST RUN                  │
             │            Exécution des tests unitaires               │
             └───────────────────────────┬────────────────────────────┘
                                         │
                      ┌──────────────────┴──────────────────┐
                      ▼                                     ▼
             [TESTS VALIDES (VERT)]               [TESTS ÉCHOUÉS (ROUGE)]
                      │                                     │
                      ▼                                     ▼
           ┌──────────────────────┐              ┌──────────────────────┐
           │   4a. AUTO-COMMIT    │              │    4b. AUTO-ROLLBACK │
           │   Validation d'état  │              │    Restauration état │
           │   dans Git           │              │    propre précédent  │
           └──────────────────────┘              └──────────────────────┘
```

---

## 🌲 2. Le Concept de "Repo-Map" (Cartographie AST)

Plutôt que d'injecter des milliers de lignes de code dans la fenêtre de contexte de l'agent :
* **Extraction des Signatures Pures :** Extraire uniquement les définitions de classes, structs, protocoles, types et signatures de fonctions.
* **Résultat :** Réduction de 30x de la consommation de tokens tout en offrant à l'agent une vision parfaite de l'architecture globale sans halluciner de méthodes.
