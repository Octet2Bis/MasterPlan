# 🖥️ Standards ACI (SWE-Agent) & Architecture EventStream (OpenHands)

Ce document formalise les protocoles d'interaction machine-agent inspirés de **[princeton-nlp/SWE-agent](https://github.com/princeton-nlp/SWE-agent)** et **[All-Hands-AI/OpenHands](https://github.com/All-Hands-AI/OpenHands)** pour garantir des modifications de code déterministes, sûres et auditables.

---

## 🔍 1. Les Principes de l'ACI (Agent-Computer Interface - SWE-Agent)

L'ACI remplace les commandes bash imprévisibles et les réécritures complètes de fichiers par des primitives d'interaction contraintes et chirurgicales :

```
                                  [AGENT IA]
                                      │
              ┌───────────────────────┴───────────────────────┐
              ▼                                               ▼
   [1. FENÊTRAGE PAR LIGNES]                      [2. ÉDITION CHIRURGICALE]
   • Inspection ciblée (50-100 lignes)            • Remplacement de blocs précis
   • Zéro dump de fichiers de 1000+ lignes        • Vérification stricte du contexte
   • Préservation du contexte token               • Linter de syntaxe pré-application
```

### Règles Impératives d'Édition :
1. **Zéro Écrasement Brutal :** Ne jamais remplacer un fichier existant par un `write_file` complet si seule une fonction ou une classe doit être modifiée. Toujours utiliser le remplacement de bloc ciblé avec lignes de contexte.
2. **Fenêtrage Restreint :** Lors de l'exploration d'un fichier volumineux, inspecter des tranches de 50 à 100 lignes autour du symbole cible.
3. **Validation Pré-Commit :** Toute modification de code doit être validée par une vérification de syntaxe (linter) avant d'être considérée comme prête.

---

## 📡 2. L'Architecture EventStream (OpenHands)

Dans un système agentique robuste, le contrôleur de l'agent est strictement découplé de l'environnement d'exécution via un bus d'événements typés :

```
┌────────────────────────┐                                ┌────────────────────────┐
│    AGENT CONTROLLER    │                                │   SANDBOXED RUNTIME    │
│                        │─────── Action (JSON Event) ───>│                        │
│                        │                                │  (Exécution isolée)    │
│                        │<─── Observation (Result) ──────│                        │
└────────────────────────┘                                └────────────────────────┘
```

### Format Standard des Payloads :
* **Action :**
  ```json
  {
    "action_type": "file_edit",
    "target_file": "apps/aevum_ios/Core/Models/ProtocolModel.swift",
    "start_line": 42,
    "end_line": 56,
    "replacement_content": "..."
  }
  ```
* **Observation :**
  ```json
  {
    "observation_type": "edit_success",
    "status": "applied",
    "syntax_check": "passed",
    "affected_lines": 14
  }
  ```
