# 🚪 Le Protocole des 4 Portes (Gatekeeping) & Intégration Open Design MCP

Ce document constitue le **Standard de Gouvernance et de Verrouillage du Développement** au sein du département `03_Developpement_App_and_Design`. Il régit la création, l'itération et l'industrialisation de toute application logicielle (Web Preview, Micro-App, Application iOS Native).

---

## 🏛️ 1. Philosophie & Origines Industrielles

Le Protocole des 4 Portes a été conçu pour éliminer définitivement le syndrome du *"code jetable"* et les dérives des agents d'IA non cadrés :
1. **Working Backwards (Amazon)** : On clarifie l'objectif, le persona, le problème n°1 et les No-Gos avant d'écrire la première ligne technique.
2. **Shape Up (Basecamp)** : On fixe un appétit (budget temps et complexité) et on trace des frontières rigides autour du périmètre pour bannir l'inflation fonctionnelle (*Scope Creep*).
3. **Setup Anti-Slop & Design Freeze** : Les tokens visuels (palette limitée, typographies, grille 8px) et les contrats de données sont gelés avant d'assembler la moindre vue.
4. **Local-First Visual Prototyping (Open Design MCP)** : Les explorations et maquettes graphiques s'opèrent sur le canvas visuel Open Design avant extraction chirurgicale des tokens vers le code de production.

> ⚠️ **LOI FONDAMENTALE POKA-YOKE :**  
> L'agent a l'interdiction formelle et absolue de franchir la Porte $N+1$ tant que les livrables de la Porte $N$ ne sont pas scellés et validés. Tout composant UI codé sans données modélisées ou sans tokens scellés constitue une violation critique d'architecture.

---

## 🧭 2. Synthèse Matricielle des Portes

| Étape | Nom de la Porte | Règle Inviolable (Poka-Yoke) | Rôle du MCP Open Design | Livrables Exigés |
| :--- | :--- | :--- | :--- | :--- |
| **Porte 0** | **Appétit & Anti-Scope** | Répondre à 5 questions éliminatoires. Interdiction formelle d'écrire du code. | Optionnel : `collect_brief` / `confirm_brief` pour structurer le brief d'interface. | `BRIEF.md` (1 page max). |
| **Porte 1** | **PRD & Données Pures** | **Interdiction formelle de coder du HTML, CSS, React ou Swift.** Données pures modélisées dans `data/*.json`. | N/A (Focus sur les structures et les flux d'états). | `PRD.md` approuvé + `data/*.json` valides. |
| **Porte 2** | **Design Freeze & Open Design** | Déclaration isolée des tokens graphiques (Swiss Craft & Dark Charcoal, grille 8px). Zéro style ad-hoc dans les vues. | Prototypage visuel sur canvas local (`create_artifact`, `get_artifact`, `search_files`, `od://design-systems/`). Extraction des tokens vers le code. | `tokens.css` ou `Theme.swift` scellé + `DESIGN_CONTRACT.md`. |
| **Porte 3** | **Spécimen Core Loop** | Coder **uniquement et exclusivement** l'interaction maîtresse (l'action centrale), testée en isolation sans navigation périphérique. | Test de sensation et validation visuelle directe sur canvas Open Design ou preview locale. | `engine/<core_engine>.js` + Vue unitaire validée par l'utilisateur. |
| **Porte 4** | **Quality Gate Déterministe** | Audit automatisé sans complaisance : < 250 lignes/fichier, 0 inlining de données, 0 section orpheline, parité SHA-256. | Assemblage modulaire propre, respect strict du Single Responsibility Principle. | `test_code_integrity.js` 100% vert. |

---

## 🔍 3. Déroulement Opérationnel Détaillé

### 🚪 Porte 0 : Appétit & Anti-Scope (`BRIEF.md`)
Avant d'écrire la moindre ligne de code, l'agent et le développeur doivent répondre exhaustivement aux 5 questions éliminatoires du cadrage :
1. **Le Problème n°1 :** Quelle friction humaine ou physiologique exacte résolvons-nous ?
2. **Le Persona & Contexte :** Pour qui concevons-nous ? Dans quel état d'esprit l'utilisateur ouvre-t-il l'app ?
3. **L'Anti-Scope (Les No-Gos Stricts) :** Que s'interdit formellement l'application ? (Ex: pas de flux social, pas d'inscription obligatoire, pas de graphiques 3D superflus).
4. **L'Appétit & Complexité :** Quel est le budget temps ? L'application est-elle un micro-outil, un widget ou un système complet ?
5. **La Plateforme Cible :** Web Preview Standalone, iOS Swift Natif ou Hybride partagé ?

* **Livrable :** Fichier `BRIEF.md` placé à la racine du projet applicatif (`03_Developpement_App_and_Design/apps/<app_name>/BRIEF.md`).

---

### 🚪 Porte 1 : PRD Fonctionnel & Modélisation des Données Pures (`data/*.json`)
* **Principe Poka-Yoke :** Aucun composant d'interface n'a le droit d'exister sans schéma de données sous-jacent. L'inlining de catalogues bruts dans le code est banni (Commandement 2 de `AGENTS.md`).
* **Actions requises :**
  1. Rédiger le document fonctionnel `PRD.md` définissant les cas d'usage, la machine à états finis (FSM) et les flux utilisateur.
  2. Modéliser l'ensemble des données dans des fichiers `.json` autonomes stockés dans `data/` :
     * `profile.json` : Modèle d'utilisateur, état courant, score de progression.
     * `catalog.json` / `protocols.json` : Données métier et métadonnées d'exercices.
     * `rewards.json` : Badges, jalons et système de streak.
  3. Valider la syntaxe JSON stricte (`node -e "JSON.parse(fs.readFileSync(...))"`).

* **Livrable :** Fichier `PRD.md` validé par l'utilisateur + répertoire `data/` peuplé de fichiers `.json` conformes.

---

### 🚪 Porte 2 : Design System Freeze & Intégration Native Open Design MCP
* **Principe Poka-Yoke :** Aucun bouton, conteneur ou texte ne peut être codé avec des valeurs arbitraires ("magiques"). Les styles doivent dériver exclusivement des tokens déclarés et gelés.
* **Pipeline avec le MCP Open Design :**
  1. **Initialisation Canvas :** Créer ou ouvrir un projet dans Open Design via `open-design:create_project` ou `open-design:get_active_context`.
  2. **Exploration & Composition Visuelle :**
     * Générer et raffiner les propositions de design sur le canvas visuel Open Design via `open-design:create_artifact` ou `open-design:write_file`.
     * Inspecter les designs existants et les brand specs via les ressources `od://design-systems/<id>/DESIGN.md`.
  3. **Extraction Chirurgicale :**
     * Extraire l'arbre de composants et les styles avec `open-design:get_artifact(project)`.
     * Isoler les tokens graphiques fondamentaux selon la charte **Swiss Craft & Dark Charcoal** :
       - Palette chromatique : 1 fond sombre (`#0B0D10`), 1 surface cartouche (`#14171C`), 1 bordure fine (`#1F242D`), 2 accents fonctionnels max (ex: Émeraude `#00F29D`, Cyan `#00C2FF`, Signal Orange `#FF4400`).
       - Typographie : Système géométrique (Inter, Outfit ou SF Pro), hiérarchie stricte à 3 niveaux.
       - Grille & Rayons : Grille de 8px, angles stricts (0px pour boîtes suisses ou 12-16px bento doux).
  4. **Scellement des Tokens dans le Repo :**
     * Web : `web_preview/tokens.css` ou `index.css` (variables `:root`).
     * iOS Swift : `AevumApp/UI/DesignSystem/Theme.swift`.

* **Livrable :** Fichier `tokens.css` ou `Theme.swift` scellé + `DESIGN_CONTRACT.md` documentant la palette, les polices et l'ID d'artefact Open Design de référence.

---

### 🚪 Porte 3 : Spécimen Core Loop (L'Interaction Maîtresse Isolée)
* **Principe Poka-Yoke :** Interdiction d'assembler la navigation globale, les 5 écrans ou les réglages tant que le cœur battant de l'expérience n'a pas été éprouvé isolément.
* **Actions requises :**
  1. Développer le moteur logique dédié dans `engine/<core_engine>.js` (ex: calcul du compte à rebours, boucle respiratoire, scoring de combo, son Web Audio).
  2. Créer une vue unitaire minimale et interactive isolée (ex: le player 30 secondes ou le widget central).
  3. Tester en direct dans le navigateur local (`http://localhost:...`) ou sur le canvas Open Design.
  4. Recueillir le retour utilisateur sur le ressenti (fluidité, timing, clarté).

* **Livrable :** Spécimen d'interaction maîtresse fonctionnel, validé visuellement et ergonomiquement par l'utilisateur.

---

### 🚪 Porte 4 : Intégration Finale & Quality Gate Déterministe
* **Principe Poka-Yoke :** Zéro livraison sans succès automatisé à 100% sur la batterie de tests d'intégrité.
* **Actions requises :**
  1. Assembler les écrans secondaires et l'orchestrateur central (`app.js` < 80 lignes).
  2. Lancer la vérification de conformité des 4 Portes :
     ```bash
     node 03_Developpement_App_and_Design/toolbox/gatekeeper.js --check
     ```
  3. Lancer l'audit de code exhaustif :
     ```bash
     node 03_Developpement_App_and_Design/toolbox/test_code_integrity.js
     ```
  4. Vérifier la topologie globale :
     ```bash
     node 03_Developpement_App_and_Design/toolbox/dag_validator.js
     ```

* **Livrable :** Rapport d'audit 100% vert (0 erreur) + `walkthrough.md` récapitulant les preuves d'exécution.

---

## 🧰 4. Boîte à Outils Open Design MCP par Phase

| Outil MCP Open Design | Signature / Action | Quand l'utiliser dans le Protocole |
| :--- | :--- | :--- |
| `collect_brief` | Cadrage interactif du besoin UI | **Porte 0** : Structurer la fiche de brief sans inventer de features. |
| `confirm_brief` | Validation formelle du brief | **Porte 0** : Verrouiller les contraintes avant passage à la Porte 1. |
| `create_project` | Création de conteneur de design | **Porte 2** : Initialiser l'espace de travail visuel dédié à l'application. |
| `create_artifact` | Création de l'artefact visuel d'entrée | **Porte 2** : Écrire la structure HTML/CSS de maquettage sur le canvas. |
| `get_artifact` | Extraction complète du bundle | **Porte 2 & 3** : Récupérer d'un coup le HTML, les tokens CSS et les assets. |
| `get_file` / `write_file`| Lecture / Modification granulaire | **Porte 2** : Ajuster précisément un composant ou un fichier de tokens. |
| `search_files` | Recherche ciblée de composants/classes | **Porte 2 & 3** : Localiser un pattern ou un token dans le projet Open Design. |
| `list_projects` | Inventaire des projets disponibles | **Porte 0 à 4** : Vérifier les projets actifs sur le daemon local Codex. |

---

## 🛡️ 5. Commandes Utilitaires de la Toolbox

```bash
# Vérifier la conformité des 4 Portes sur tout le parc applicatif
node 03_Developpement_App_and_Design/toolbox/gatekeeper.js --check

# Vérifier la conformité d'une application spécifique
node 03_Developpement_App_and_Design/toolbox/gatekeeper.js --app=pulse_flow --check

# Initialiser une nouvelle application selon le gabarit des 4 Portes
node 03_Developpement_App_and_Design/toolbox/gatekeeper.js --init=my_new_app

# Lancer la validation complète de l'intégrité architecturale
node 03_Developpement_App_and_Design/toolbox/test_code_integrity.js
```
