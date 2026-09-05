# 🚪 PORTE 2 : CONTRAT DE DESIGN & ARCHÉTYPE SCELLÉS (DESIGN_CONTRACT.md)

**Application :** Outbound Sniper Studio  
**Archétype UI/UX :** 📊 **Archétype 1 : SaaS B2B, Dashboards & Analytics**  
**Norme Graphique :** Swiss Craft / Dark Charcoal (Grille 8pt stricte)  
**Statut :** 🟢 Scellé & Non Négociable

---

## 1. 🗺️ Squelette Structurel de l'Archétype 1
* **Layout :** Grille Bento 2 colonnes (`grid-template-columns: repeat(2, 1fr)`).
* **Point Focal Unique :** Un seul bouton d'action primaire à fort contraste (`#btn-verify` ou `#btn-launch-dispatch`), toutes les autres actions en style secondaire `ghost` ou `outline`.
* **Hiérarchie Typographique :** Un seul `<h1>`, titres de cartes en `<h2>`, `Sentence case` obligatoire sur tous les labels.

---

## 2. 📐 Échelle Spatiale Grille 8pt
Tous les espacements (`padding`, `margin`, `gap`) sont strictement restreints aux variables :
* `--space-4` (4px), `--space-8` (8px), `--space-12` (12px), `--space-16` (16px), `--space-24` (24px), `--space-32` (32px), `--space-48` (48px).
* **Zéro pixel arbitraire :** Interdiction des valeurs impaires ou hors échelle.

---

## 3. 🔄 Implémentation des 5 États d'Interface
1. `Nominal (Success)` : Contacts avec badges colorés (`🟢 Délivrable 95%`) et compteurs temps réel.
2. `Loading State (Skeleton)` : Squelettes rectangulaires animés calqués sur les lignes du tableau lors de l'analyse DNS.
3. `Empty State` : Dropzone illustrative avec instruction en 1 phrase et bouton contextuel *« Télécharger le modèle CSV »*.
4. `Error State` : Bandeau rouge constructif explicitant l'erreur (ex: *« Colonne Email manquante dans le fichier importé »*).
5. `Partial / Stale State` : Indicateur discret de synchronisation lors des requêtes d'arrière-plan.

---

## 4. ♿ Accessibilité WCAG 2.1 AA & Ergonomie
* Cibles d'interaction : `min-height: 36px` à `44px` pour tous les éléments interactifs.
* `aria-label` présent sur tous les boutons d'action et inputs.
* Contraste texte/fond $\ge 4.5:1$ garanti.
