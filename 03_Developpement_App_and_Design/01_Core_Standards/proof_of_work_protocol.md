# 🛡️ Protocole de Preuve de Travail & Gouvernance Agentique (Agentic-OS)

Ce document standardise le protocole de gouvernance inspiré de **[KbWen/agentic-os](https://github.com/KbWen/agentic-os)** : **"Nothing is Done Without Proof"** (Rien n'est considéré comme terminé sans preuve vérifiable).

---

## 🏛️ 1. Le Cycle d'Exécution en 5 Étapes

Tout agent ou développeur opérant dans le Master Plan doit obligatoirement franchir ces 5 étapes de manière séquentielle :

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌────────────┐
│   1. PLAN   │ ──> │  2. BUILD   │ ──> │  3. REVIEW   │ ──> │   4. TEST   │ ──> │  5. SHIP   │
└─────────────┘     └─────────────┘     └──────────────┘     └─────────────┘     └────────────┘
       │                   │                   │                    │                   │
  Cadrage &           Édition ACI         Auto-Critique        Exécution des       Livraison &
  Spécification       Chirurgicale        Code & Anti-Slop     Tests Unitaires     Commit Git
```

---

## 📜 2. La Règle d'Or : Preuve Obligatoire de Validation

Une tâche n'est JAMAIS considérée comme achevée sur simple affirmation textuelle. Elle requiert obligatoirement **au moins une preuve tangible** :

1. **Pour le Code (Swift, Python, TypeScript) :**
   * Preuve de compilation ou d'exécution des tests unitaires sans erreur (`Test Suite passed`).
   * Rapport du linter syntaxique ACI avec zéro erreur.
2. **Pour le Design & Frontend :**
   * Capture d'écran ou rendu interactif vérifié dans le navigateur ou simulateur.
3. **Pour le GTM & Copywriting :**
   * Rapport du linter Anti-Slop (`score >= 80` et zéro placeholder non résolu).
4. **Pour la Sécurité :**
   * Rapport du scanner Strix avec zéro faille critique.

---

## 🛑 3. Gestion des Échecs & Rollback Automatique

Si l'étape 4 (TEST) échoue :
* Interdiction formelle de masquer l'erreur ou de pousser le code.
* Déclenchement automatique de la phase de correction (*Repair Loop*) ou rollback immédiat vers l'état stable précédent.
