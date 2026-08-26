# MASTER PLAN — CONTRAT D'EXÉCUTION DU SYSTÈME MULTI-AGENTS (AGENTS.md)

Ce document constitue la **Loi Fondamentale** régissant tous les agents Antigravity intervenant sur le repository `Master Plan`.
Ces règles s'appliquent avec un caractère d'obligation absolue et sans exception.

---

## 🏛️ Les 6 Commandements Inviolables d'Architecture

### 1. Plafond Monolithique Strict (< 250 Lignes par Fichier)
- **Interdiction formelle** de créer ou d'étendre un fichier de code (`.js`, `.ts`, `.swift`, `.py`) au-delà de **250 lignes**.
- Tout module approchant cette limite doit être immédiatement scindé selon le principe de Responsabilité Unique (SRP) :
  - `data/` : Données pures au format `.json`
  - `engine/` : Moteurs de calcul et logique métier
  - `ui/` ou `components/` : Vues et rendu visuel
  - `app.js` / `main.py` : Orchestrateur central (< 80 lignes).

### 2. Bannissement Absolu de l'Inlining de Données Brutes
- Les catalogues, listes de protocoles, datasets et matrices ne doivent **JAMAIS** être déclarés en dur à l'intérieur des fichiers de code exécutable ou recopiés dans le chat.
- Ils doivent obligatoirement résider dans des fichiers autonomes `data/*.json`, chargés de manière asynchrone (`fetch`, `fs.readFile`, `Bundle.main.url`).
- **Objectif :** Réduire la consommation de tokens par 30x à 50x et préserver la mémoire vive de l'agent.

### 3. Quality Gate Déterministe Obligatoire (Zéro "Done" sans Test)
- L'agent a l'interdiction formelle de déclarer une tâche terminée, fonctionnelle ou résolue sans avoir exécuté au préalable le script de test automatisé approprié :
  - En Dev Web & Intégrité Apps : `node 03_Developpement_App/toolbox/test_code_integrity.js`
  - En Topologie Système : `node 03_Developpement_App/toolbox/dag_validator.js`
  - En GTM & Linters : `python 01_GTM_Growth/toolbox/tests/test_quality_gates.py`
- Si le Quality Gate échoue ou renvoie une seule erreur, la réponse de l'agent doit se concentrer exclusivement sur la résolution du test bloqué.

### 4. Hygiène de Contexte & Scoping par Pilier (master_router.md)
- L'agent doit toujours agir en tenant compte du **pilier actif** déterminé par le positionnement du curseur ou de la mission :
  - **Pilier 01 (`01_GTM_Growth`)** : Mode Growth & Acquisition. Zéro modification de code bas niveau.
  - **Pilier 02 (`02_Assistant_Personnel`)** : Mode Ingestion & Second Cerveau. Zéro bruit marketing.
  - **Pilier 03 (`03_Developpement_App`)** : Mode Ingénierie & Swift/Web. Zéro distraction externe.
  - **`master_router.md`** : Mode Tour de Contrôle / Arbitrage Stratégique Global.
- Pour les tâches de compilation massive ou de scraping lourd, l'agent doit déléguer le travail à un sous-agent éphémère pour ne pas saturer le fil principal.

### 5. Intégrité Visuelle et Non-Régression (ui-ux-pro-max)
- L'esthétique de l'application Aevum doit rigoureusement respecter l'identité **Transit Signalétique / Dark Charcoal / Swiss Craft** définie dans `ui_visual_anti_slop.md`.
- Interdiction d'introduire des palettes génériques, des composants désalignés ou des états d'erreur console silencieux.

### 6. Protocole des Causes Racines (RCA) & Immunisation Systémique (Poka-Yoke)
- **Déclenchement Automatique :** Dès qu'une anomalie, un bug, un échec de CI ou une divergence de données est détecté, l'agent a l'interdiction formelle de se limiter à un correctif cosmétique ou un "patch de surface".
- **Le Triptyque d'Exécution Obligatoire :**
  1. **Analyse Causale Profonde (Les 5 Pourquoi) :** Remonter la chaîne d'exécution jusqu'à identifier la faille structurelle d'origine (ex: dépendance implicite au répertoire d'exécution, absence de packaging, duplication manuelle de données, import circulaire).
  2. **Immunisation Déterministe (Poka-Yoke) :** Concevoir et intégrer un garde-fou automatisé qui rend cette classe d'erreur techniquement impossible à reproduire (ex: test de parité SHA-256, packaging standardisé, linter de schéma, règle de CI bloquante).
  3. **Traçabilité Transparente :** Expliquer clairement à l'utilisateur la cause racine identifiée et la parade systémique mise en place pour immuniser le code pour l'avenir.
