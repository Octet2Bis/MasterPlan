# ⚙️ MECHANICS.md — Interface d'Exploitation du Pilier 03

> **Règle d'or de contexte :** 1 session = 1 scope.  
> Tout agent intervenant dans `03_Developpement_App_and_Design` lit **exclusivement ce fichier** et le kit design épinglé dans le `DESIGN_CONTRACT.md` de l'application cible.  
> La doctrine complète ([AGENTS.md](../AGENTS.md), [01_Core_Standards/](01_Core_Standards/)) est consultée **à la demande uniquement**.

---

## 🧭 Le Cycle de Vie d'une Tâche en 7 Étapes

```
1. ROUTAGE ──► 2. CADRAGE ──► 3. CRÉATION ──► 4. DESIGN ──► 5. CONTRÔLE ──► 6. CI ──► 7. SUPERVISION
```

---

### Étape 1 — Routage (Aiguillage de la mission)
Résout l'intention utilisateur et oriente vers le sous-système exact.

| Paramètre | Spécification Opérationnelle |
| :--- | :--- |
| **Entrée** | Intention utilisateur brute en argument texte |
| **Outil** | `node 03_Developpement_App_and_Design/toolbox/harness_graph_router.js` *(Source unique de vérité)* |
| **Sortie** | Nœud de graphe ciblé, pôle métier et liste des fichiers à modifier |
| **Qui l'invoque** | Manuel (agent ou développeur au démarrage de la tâche) |
| **Note architecture** | `harness_graph_router.py` (1,3 KB) est un wrapper legacy déléguant à Node.js ; ne pas l'utiliser comme routeur autonome. |

---

### Étape 2 — Cadrage (Verrouillage du périmètre)
Interdit tout codage avant formalisation et accord explicite.

| Paramètre | Spécification Opérationnelle |
| :--- | :--- |
| **Entrée** | Description du besoin, anti-scope et contraintes |
| **Outil** | **Planning Mode Antigravity** (rédaction de `implementation_plan.md`)<br>*Optionnel :* `node 03_Developpement_App_and_Design/toolbox/squad_bridge.js` (uniquement si orchestration multi-agents Lead/Worker/Inspector) |
| **Sortie** | `implementation_plan.md` scellé avec sections User Review et Verification Plan |
| **Qui décide du Done** | **Humain** (approbation explicite obligatoire avant exécution) |

---

### Étape 3 — Création (Scaffolding & Cartographie)
Génère les structures conformes sans improvisation de squelette.

| Paramètre | Spécification Opérationnelle |
| :--- | :--- |
| **Entrée** | Nom de la nouvelle app ou cible d'audit |
| **Outils** | 1. `node 03_Developpement_App_and_Design/toolbox/scaffold_app.js --name=<app_name>`<br>2. `python 03_Developpement_App_and_Design/toolbox/repo_mapper.py` (cartographie des modules) |
| **Sortie** | Arborescence standardisée (`BRIEF.md`, `PRD.md`, `data/`, `ui/`, `app.js`)<br>Copier `templates/DESIGN_CONTRACT.stub.md` vers `apps/<app>/DESIGN_CONTRACT.md` puis épingler un kit avant l'étape 4 |
| **Qui l'invoque** | Manuel (agent en phase d'initialisation) |

---

### Étape 4 — Design (Application des tokens & composants)
Applique une identité visuelle sans styles ad-hoc.

| Paramètre | Spécification Opérationnelle |
| :--- | :--- |
| **Entrée** | Spécifications d'écrans ou captures de référence |
| **Procédure d'injection** | a) Lire `DESIGN_CONTRACT.md` de l'app cible → extraire `design_system: kits/<nom>@<version>` (ex: Outbound Sniper → `kits/chamfer-paper-ink@1.0.0`)<br>b) Charger UNIQUEMENT `Ressources/Design_System/kits/<nom>/prompt_pack.json` (pas `tokens.css`, pas la bible anti-slop, pas `color_palettes.json`)<br>c) Appliquer le pack. Si la clé `design_system` est absente : stop, ne pas styler. |
| **Outils d'appui** | 1. `node 03_Developpement_App_and_Design/toolbox/pixel_rag_engine.js` (analyse de spécimens visuels)<br>2. [Ressources/Component_Library/](Ressources/Component_Library/) (The Essential 7 en HTML/Swift)<br>*(Outils d'appui uniquement, PAS comme source du thème)* |
| **Sortie** | `DESIGN_CONTRACT.md` de l'app scellé + vues consommant les tokens sans valeur en dur |
| **Qui l'invoque** | Manuel (agent en phase d'assemblage d'interface) |

---

### Étape 5 — Contrôle Local (Validation Precommit Poka-Yoke)
Filet déterministe local bloquant tout livrable non conforme.

| Paramètre | Spécification Opérationnelle |
| :--- | :--- |
| **Entrée** | Code source modifié (`.js`, `.ts`, `.swift`, `.py`, `.css`, `.json`) |
| **Outils** | Exécuter dans l'ordre strict :<br>1. `python 03_Developpement_App_and_Design/toolbox/aci_precommit_linter.py` (formatage, docstrings, limites)<br>2. `node 03_Developpement_App_and_Design/toolbox/skylos_scanner.js` (audit failles OWASP, fuites de secrets)<br>3. `node 03_Developpement_App_and_Design/toolbox/gatekeeper.js --check` (conformité des 4 Portes)<br>4. `node 03_Developpement_App_and_Design/toolbox/dag_validator.js` (intégrité des flux de données et topologies)<br>5. `node 03_Developpement_App_and_Design/toolbox/test_code_integrity.js` (plafond < 250 lignes, 0 inlining, parité SHA-256) |
| **Sortie** | 100% PASS sur tous les linters (0 avertissement, 0 erreur) |
| **Qui décide du Done** | **Precommit** (l'agent a interdiction formelle de commiter si un script renvoie une erreur) |

---

### Étape 6 — CI (Filet distant pré-merge)
Validation automatisée sur machine distante GitHub Actions.

| Paramètre | Spécification Opérationnelle |
| :--- | :--- |
| **Entrée** | Pull Request ou push sur branche cible |
| **Outils** | 1. [.github/workflows/quality_gates.yml](../.github/workflows/quality_gates.yml) (exécution des tests d'intégrité globale)<br>2. [.github/workflows/ios_build_and_stream.yml](../.github/workflows/ios_build_and_stream.yml) (compilation XcodeGen & tests iOS natifs) |
| **Sortie** | Statut GitHub Check vert (Merged PR autorisée) |
| **Qui décide du Done** | **CI GitHub Actions** (la CI doit être verte ; main n'est pas protégée, le merge humain reste possible) |

---

### Étape 7 — Supervision (Santé & État de la flotte)
Mesure la dérive de l'état système et centralise les logs d'exécution.

| Paramètre | Spécification Opérationnelle |
| :--- | :--- |
| **Entrée** | Flotte applicative et graphe d'intentions |
| **Outils** | 1. `python 03_Developpement_App_and_Design/toolbox/state_scorer.py` (calcul du score de complétude des apps)<br>2. `node 03_Developpement_App_and_Design/toolbox/cockpit/server.js` (serveur de télémétrie local)<br>3. `03_Developpement_App_and_Design/toolbox/cockpit/core/ai_responder.js` (agent de supervision et d'assistance)<br>4. `03_Developpement_App_and_Design/toolbox/data/intent_graph.json` (registre d'états) |
| **Sortie** | Dashboard de métriques à jour et graphe d'intention synchronisé |
| **Qui l'invoque** | Manuel ou service d'arrière-plan |

---

## 🛰️ Outils Satellite (Hors Cycle Principal)

Ces utilitaires répondent à des besoins ponctuels et ne font pas partie du pipeline séquentiel direct :

* `node 03_Developpement_App_and_Design/toolbox/dev_tech_watchtower.js` : Veille technologique automatisée (surveillance des versions et des dépendances externes).
* `node 03_Developpement_App_and_Design/toolbox/firecrawl_dev_adapter.js` : Client d'interrogation du Firecrawl Developer Index (recherche documentaire et extraits d'APIs).
* `node 03_Developpement_App_and_Design/toolbox/sync_aevum_datasets.js` : Synchronisation des datasets physiologiques pour l'application `aevum_ios`.
* `node 03_Developpement_App_and_Design/toolbox/test_outbound_hunter_sent.js` : Banc de test unitaire réservé à l'application `outbound_sniper` (test d'application spécifique, pas un outil générique de la toolbox).

---

## 🎯 Grille Déterministe d'Exécution Immédiate

Pour toute action dans le pilier 03, applique cette table de décision :

| Situation courante | Script exact à lancer | Autorité de validation ("Done") |
| :--- | :--- | :--- |
| Je commence une tâche et dois router le besoin | `node 03_Developpement_App_and_Design/toolbox/harness_graph_router.js` | Agent / Développeur |
| Je dois cadrer le plan technique | Rédiger `implementation_plan.md` | **Humain uniquement** |
| Je crée une nouvelle application | `node 03_Developpement_App_and_Design/toolbox/scaffold_app.js --name=<app>` | Structure générée |
| Je stylise une interface | Charger le `prompt_pack.json` du kit épinglé dans le DESIGN_CONTRACT | Respect des `rules_p0` + `forbidden` du pack |
| J'ai terminé d'écrire mon code | 1. `python 03_Developpement_App_and_Design/toolbox/aci_precommit_linter.py`<br>2. `node 03_Developpement_App_and_Design/toolbox/skylos_scanner.js`<br>3. `node 03_Developpement_App_and_Design/toolbox/gatekeeper.js --check`<br>4. `node 03_Developpement_App_and_Design/toolbox/dag_validator.js`<br>5. `node 03_Developpement_App_and_Design/toolbox/test_code_integrity.js` | **Precommit (0 erreur)** |
| Je prépare une livraison PR | Vérifier le passage de `.github/workflows/quality_gates.yml` | **CI GitHub** |
| Je mesure l'état global du pilier | `python 03_Developpement_App_and_Design/toolbox/state_scorer.py` | Rapport de score |
