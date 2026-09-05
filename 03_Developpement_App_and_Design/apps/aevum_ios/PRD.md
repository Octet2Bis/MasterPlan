# 📑 PRD (Porte 1) : Aevum iOS

## 1. Cas d'Usage Principaux
1. **Diagnostic Initial d'Âge Biologique :** Questionnaire anamnestique en 3 étapes calculant l'écart d'âge biologique et recommandant un protocole prioritaire.
2. **Dashboard Circadien & Agave Vivante :** Visualisation de la vitalité quotidienne matérialisée par l'Agave Aevum, nourrie par les micro-actions.
3. **Sas de Décompression & Interception :** Déclenchement automatique d'une pause active de 45 secondes lors du dépassement de seuil d'application verrouillée.
4. **Catalogue des 12 Protocoles de Longévité :** Respiration carrée, motricité oculaire 20-20-20, décompression spinale, micro-défis cognitifs.

## 2. Machine à États Finis (FSM)
- `ONBOARDING` ➔ `DIAGNOSTIC` ➔ `DASHBOARD_IDLE`
- `DASHBOARD_IDLE` ➔ `CHALLENGE_ACTIVE` ➔ `CHALLENGE_COMPLETED` ➔ `REWARD_STREAK`
- `SHIELD_INTERCEPT` ➔ `DECOMPRESSION_RUNNING` ➔ `SHIELD_RELEASE`

## 3. Modélisation des Données Pures Découplées
Les catalogues et états résident exclusivement dans `AevumApp/Resources/Data/` et `web_preview/data/` (garantie de parité SHA-256) :
- `agave_biometrics.json` : Modèle de calcul biométrique et vitalité.
- `longevity_catalog.json` : Les 12 protocoles physiologiques validés.
- `daily_shots.json` : Micro-défis circadiens journaliers.
- `decompression_articles.json` : Contenus de décompression guidée.
- `streak_rewards.json` : Paliers de récompenses et badges.
- `protocol_graph.json` : Graphe des prérequis et des affinités.
