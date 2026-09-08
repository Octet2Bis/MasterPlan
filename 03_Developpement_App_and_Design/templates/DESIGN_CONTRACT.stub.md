# 🚪 PORTE 2 : CONTRAT DE DESIGN & ARCHÉTYPE SCELLÉS (DESIGN_CONTRACT.md)

**Application :** <nom_de_l_application>  
**Archétype UI/UX :** <archetype_choisi>  
**Norme Graphique :** <norme_graphique_retenue>  
**Statut :** 🟢 Scellé & Non Négociable  
design_system: kits/<nom>@<version>

> Tant que <nom> n'est pas un kit réel sous Ressources/Design_System/kits/, interdiction de styler (MECHANICS étape 4c).

---

## 1. 🗺️ Squelette Structurel de l'Archétype
* **Layout :** Structure définie selon l'archétype sélectionné.
* **Point Focal Unique :** Un seul bouton d'action primaire à fort contraste par vue.
* **Hiérarchie Typographique :** Polices et styles issus exclusivement du `prompt_pack.json` du kit épinglé.

---

## 2. 📐 Échelle Spatiale
* Espacements = uniquement les `--space-*` du `prompt_pack.json` du kit épinglé.
* **Zéro valeur arbitraire :** Interdiction des valeurs en dur ou hors tokens.

---

## 3. 🔄 Implémentation des 5 États d'Interface
1. `Nominal (Success)` : Rendu nominal des données.
2. `Loading State (Skeleton)` : Squelettes animés calqués sur les blocs finaux.
3. `Empty State` : Guidage contextuel avec bouton d'action primaire.
4. `Error State` : Message d'erreur explicite et remédiation actionnable.
5. `Partial / Stale State` : Indicateur d'arrière-plan ou état intermédiaire.

---

## 4. ♿ Accessibilité WCAG & Ergonomie
* Cibles d'interaction calibrées selon les tokens du kit épinglé.
* `aria-label` présent sur tous les éléments interactifs.
* Contraste texte/fond conforme WCAG garanti par les tokens du kit.
