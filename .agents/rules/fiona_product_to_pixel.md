# 🎯 Standard d'Ingénierie Product-to-Pixel (Méthode Fiona & Posture CTO)

Ce standard régit la conception, l'évaluation et l'implémentation de tout produit logiciel au sein de `03_Developpement_App_and_Design`.

---

## 🏛️ 1. Posture CTO & Devoir de Contrepoids Critique
1. **Zéro Complaisance & Zéro Superlatifs :** L'agent s'interdit les formules flatteuses ou l'approbation automatique. Il analyse chaque idée ou framework avec rigueur, lucidité et modération.
2. **Évaluation d'Écosystème & Coûts Cachés :** Tout nouvel outil apporté doit être analysé sous l'angle de :
   - Sa maturité réelle et ses alternatives plus légères.
   - Son overhead de maintenance et de tokens pour l'agent.
   - Ses risques de dérive de syntaxe (ex: refontes de versions).
3. **Extraction Sélective :** N'extraire que les principes à fort effet de levier sans importer de complexité ou de dépendances inutiles.

---

## 🧭 2. Le Cycle Product-to-Pixel en 5 Portes

### 🚪 Porte 0 : Brief, Anti-Scope & Sélection de l'Archétype
* **Archétype Structurel Obligatoire :** Choisir parmi les 4 archétypes de `ui_archetype_matrix.md` (*1. SaaS B2B, 2. Mobile iOS, 3. Landing GTM, 4. Copilote IA*).
* **Questions Éliminatoires :** Formaliser le problème n°1, le persona, la plateforme cible et les no-gos stricts dans `BRIEF.md`.

### 🚪 Porte 1 : PRD Comportemental & Données Pures (`data/*.json`)
* **Format Given-When-Then :** Formaliser les flux critiques (*Étant donné..., Quand..., Alors...*).
* **Contrat des 5 États d'Interface (selon `ui_design_heuristics.md`) :**
  1. `Nominal (Success)` : Affichage ordonné des données formatées.
  2. `Loading State` : Squelette animé calqué sur la structure finale (Skeleton).
  3. `Empty State` : Explication concise + bouton d'action contextuel.
  4. `Error State` : Message d'erreur constructif sans jargon + bouton de récupération.
  5. `Partial / Stale State` : Données en cache + indicateur discret de rafraîchissement.
* **Fixtures Métiers Réalistes :** Fichiers `data/*.json` autonomes, zéro inlining (Commandement #2).

### 🚪 Porte 2 : Design Freeze, Tokens & Contraintes Quantifiables
* Déclaration scellée des tokens de style (Dark Charcoal / Swiss Craft / Grille 8pt stricte).
* Respect des heuristiques de `ui_design_heuristics.md` (Cibles tactiles min 44pt, Sentence case, 1 seul H1, 1 seule action primaire).

### 🚪 Porte 3 : Développement UI Mock-First en Bac à Sable
* **Isolation Totale :** Implémentation et test visuel des composants avec les fixtures **avant** tout développement de logique backend ou d'API.
* **Découpage en Micro-Tâches :** 1 écran ou 1 interaction maîtresse à la fois.
* **Preuve Empirique :** Inspection visuelle via le sous-agent navigateur (`browser_subagent`) ou le simulateur local.

### 🚪 Porte 4 : Product Definition of Done (DoD) & Quality Gates
Une tâche n'est déclarée terminée que si :
* [ ] Les 5 états de l'écran sont implémentés et vérifiés.
* [ ] L'accessibilité de base est respectée (labels, contrastes WCAG AA, clavier/touch).
* [ ] Le parcours complet s'exécute sans rechargement brutal ni friction.
* [ ] Les Quality Gates déterministes (`test_code_integrity.js`, `dag_validator.js`, `gatekeeper.js --check`) retournent 100% de succès.
