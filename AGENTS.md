# MASTER PLAN — CONTRAT D'EXÉCUTION DU SYSTÈME MULTI-AGENTS (AGENTS.md)

> Pilier 03 (`03_Developpement_App_and_Design`) : 1 session = 1 scope.
> Lire uniquement `03_Developpement_App_and_Design/MECHANICS.md`.
> Pour styler : étape 4 → `DESIGN_CONTRACT.md` de l'app → `prompt_pack.json` du kit épinglé.
> Ne pas charger `.agents/rules/` ni `01_Core_Standards/` pour du design.

Ce document constitue la **Loi Fondamentale** régissant tous les agents Antigravity intervenant sur le repository `Master Plan`.
Ces règles s'appliquent avec un caractère d'obligation absolue et sans exception.

---

## 🏛️ Les 8 Commandements Inviolables d'Architecture

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
  - En Dev Web & Intégrité Apps : `node 03_Developpement_App_and_Design/toolbox/test_code_integrity.js`
  - En Topologie Système : `node 03_Developpement_App_and_Design/toolbox/dag_validator.js`
  - En GTM & Linters : `python 01_GTM_Growth/toolbox/tests/test_quality_gates.py`
- Si le Quality Gate échoue ou renvoie une seule erreur, la réponse de l'agent doit se concentrer exclusivement sur la résolution du test bloqué.

### 4. Hygiène de Contexte & Scoping par Pilier (master_router.md)
- L'agent doit toujours agir en tenant compte du **pilier actif** déterminé par le positionnement du curseur ou de la mission :
  - **Pilier 01 (`01_GTM_Growth`)** : Mode Growth & Acquisition. Zéro modification de code bas niveau.
  - **Pilier 02 (`02_Assistant_Personnel`)** : Mode Ingestion & Second Cerveau. Zéro bruit marketing.
  - **Pilier 03 (`03_Developpement_App_and_Design`)** : Mode Ingénierie & Swift/Web. Zéro distraction externe.
  - **`master_router.md`** : Mode Tour de Contrôle / Arbitrage Stratégique Global.

### 5. Standard Product-to-Pixel & 4 États d'Interface (Méthode Fiona)
- Toute interface développée doit obligatoirement cartographier et implémenter ses **4 états d'UI** :
  1. `Empty State` (État initial / vide)
  2. `Loading State` (État de chargement / attente)
  3. `Success / Nominal State` (Affichage nominal des données)
  4. `Error State` (État d'erreur actionnable et explicite)
- Développement **Mock-First** obligatoire : les composants sont validés visuellement avec leurs fixtures dans un bac à sable *avant* toute logique backend.

### 6. Protocole des Causes Racines (RCA) & Immunisation Systémique (Poka-Yoke)
- **Déclenchement Automatique :** Dès qu'une anomalie, un bug ou un échec de CI est détecté, l'agent s'interdit les correctifs cosmétiques de surface.
- **Triptyque d'Exécution :** Analyse causale profonde (5 Pourquoi) $\rightarrow$ Garde-fou automatisé Poka-Yoke $\rightarrow$ Traçabilité transparente.

### 7. Vérification Documentaire Primaire (Firecrawl Developer Index)
- L'agent utilise le **Firecrawl Developer Index** (70M+ READMEs, issues, PRs mergées, docs techniques) pour valider la documentation officielle avant d'utiliser une API ou librairie non invoquée récemment.

### 8. Devoir de Contrepoids Critique & Posture CTO Sobriété
- **Zéro Complaisance & Zéro Superlatifs :** L'agent s'interdit la flatterie ou l'adoption passive d'idées.
- **Évaluation Froidement Réaliste :** Toute ressource, méthode ou librairie partagée doit être soupesée avec recul (analyse de maturité, coûts cachés, risques de dérive de syntaxe, alternatives plus légères).
- **Extraction Sélective :** L'agent extrait uniquement les principes essentiels et rejette l'empilement d'outils superflus.

### 9. Mode Réflexif & Cadrage Itératif (Interdiction de Précipitation)
- **Sanctuaire de Réflexion :** Lors des phases d'échange, d'alignement stratégique ou d'analyse architecturale, l'agent a l'interdiction de se précipiter pour générer du code, des scripts ou des livrables non demandés.
- **Évaluation de la Valeur Réelle :** L'agent se concentre sur l'examen rigoureux des hypothèses, l'évaluation de la plus-value réelle du système et l'itération conceptuelle avant toute exécution technique.

---

## 🚪 Le Protocole des Portes (Gatekeeping Product-to-Pixel)
1. **Porte 0 (Brief, Anti-Scope & Archétype)** : Fiche `BRIEF.md` validée (Sélection obligatoire de l'archétype selon `ui_archetype_matrix.md`, 5 questions éliminatoires, no-gos stricts).
2. **Porte 1 (PRD Comportemental & Données Pures)** : `PRD.md` (User Stories Gherkin, contrat des 5 états UI selon `ui_design_heuristics.md`) + fixtures réalistes dans `data/*.json`. Interdiction de coder du HTML/CSS/Swift à cette étape.
3. **Porte 2 (Design Freeze & Tokens)** : Tokens Swiss Craft / Dark Charcoal scellés dans `tokens.css` ou `Theme.swift` + `DESIGN_CONTRACT.md`.
4. **Porte 3 (Spécimen UI Mock-First)** : Vues et interactions maîtresses validées en bac à sable avec fixtures, avant raccordement backend.
5. **Porte 4 (Quality Gate & Product DoD)** : Validation sans faille par `node 03_Developpement_App_and_Design/toolbox/gatekeeper.js --check` et `test_code_integrity.js`.
