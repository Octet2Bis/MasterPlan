# 📐 Doctrine Catalogue d'Artéfacts & Grille Suisse (ui_swiss_catalog_tbi_craft.md)

Ce document régit l'architecture visuelle des **galeries de produits numériques, boutiques d'artéfacts, catalogues de templates et vitrines de code/design** du Master Plan.
Inspiré des standards d'élégance radicale et de rigueur géométrique de **The Brand Identity Store** (`the-brandidentity.com/store`), ce cadre élimine les poncifs du e-commerce générique pour imposer une autorité muséale et technique.

---

## 🏛️ 1. Les 3 Piliers de l'Ultra-Grid Suisse

### 1. La Géométrie Orthogonale Radicale (`border-radius: 0px`)
Bannir le réflexe moderne des cartes arrondies molles (`rounded-xl`, `border-radius: 12px` ou `16px`) sur les galeries d'artéfacts.
L'artéfact numérique (code, mockup, deck, outil) s'expose sur une grille rigoureuse aux arêtes vives (`border-radius: 0px`), sans bordures épaisses ni ombres floues artificielles. C'est l'alignement typographique qui crée la structure.

### 2. Le Sélecteur Typographique Continu (*Inline Editorial Row*)
Interdiction d'utiliser des pilules ou badges SaaS fermés multicolores pour les filtres de catégories.
* Les filtres sont disposés en **phrase typographique horizontale continue**, séparés par des virgules ou des espaces rythmés (`32px` - `36px` sur desktop, `line-height: 1.15`).
* **État Actif :** Noir absolu `#000000`, graisse `font-weight: 500 / 600`.
* **État Inactif :** Gris ardoise estompé `rgba(0, 0, 0, 0.35)` ou `#8C8C8C`, graisse `font-weight: 400`.
* Un bouton d'action discret et encadré à l'extrémité droite (`FILTER` ou `TRI`) permet d'affiner sans polluer la lecture.

### 3. La Carte d'Artéfact 4:3 à Double Face (*Crossfade Hover*)
Toute carte produit/artéfact suit un agencement strict :
1. **Zone Visuelle Ratio 4:3 :** Conteneur photo/preview monté sur un fond gris studio neutre (`#E5E5E5`).
2. **Micro-Interaction de Survol (Backstage Swap) :** Le survol déclenche un fondu enchaîné subtil (200ms `ease-out`) révélant l'intérieur du produit (diapositive interne d'un deck, vue de code d'un outil, détail technique).
3. **Triade Typographique d'Information :**
   * **H3 Titre Produit :** `16px`, `font-weight: 500`, `#000000` (ex: *Outbound Sniper Core OS – Code & Engine*).
   * **H4 Créateur / Studio :** `14px`, `font-weight: 400`, `#666666` (ex: *Antoine Lecerf Studio*).
   * **Prix / Statut :** `14px`, `font-weight: 500`, `#000000` (ex: *Inclus Master Plan* ou *$79.00* avec ancien prix barré en `#8C8C8C`).

---

## 🎨 2. Palette Studio Monochrome Suisse (`tbi_monochrome_studio`)

```css
:root {
  --tbi-canvas-backdrop: #F4F4F4;      /* Toile générale lumineuse et calme */
  --tbi-surface-studio: #E5E5E5;       /* Réceptacle neutre des visuels 4:3 */
  --tbi-ink-solid: #000000;            /* Noir pur suisse pour titrage et prix */
  --tbi-ink-muted: #666666;            /* Auteur, spécifications, formats */
  --tbi-filter-inactive: rgba(0,0,0,0.35); /* Filtres secondaires au repos */
  --tbi-accent-alert: #E02424;         /* Remise ou exclusivité uniquement */
}
```

---

## 📐 3. Grille & Espacements Déterministes

* **Disposition Desktop :** Grille à 3 colonnes (`grid-template-columns: repeat(3, 1fr)`) avec un espacement uniforme de `24px` à `32px`.
* **Disposition Tablette / Mobile :** 2 colonnes (`768px`) puis 1 colonne (`< 480px`).
* **Zero CLS (*Cumulative Layout Shift*) :** L'application explicite du ratio `aspect-ratio: 4 / 3` sur chaque conteneur visuel garantit l'absence totale de sautillement lors du chargement des images.

---

## 🛡️ 4. Garde-Fou Poka-Yoke & Anti-Scope

* **Périmètre d'application :** Cette grille est réservée aux vitrines de livrables, portfolios d'outils, catalogues de templates et boutiques d'artéfacts.
* **Interdiction formelle :** Ne pas appliquer la règle du `border-radius: 0px` et de la disparition des conteneurs aux formulaires de saisie transactionnels denses (ex: paramètres SMTP d'Outbound Sniper) qui requièrent des frontières de champs explicites.
