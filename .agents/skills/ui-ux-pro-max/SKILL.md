---
name: ui-ux-pro-max
description: Guide d'exécution UI/UX de haute facture (Swiss Craft, Dark Charcoal, Surfaces Étagées, Typographie à Gravité, Grille 8px). Bras exécutif de la règle ui_visual_anti_slop.md. À utiliser dans 03_Developpement_App/ et 01_GTM_Growth/03_Experimentation/.
---

# 🎨 UI/UX Pro Max — Standard d'Exécution Visuelle & Frontend

Ce skill est le **bras exécutif** de la règle constitutionnelle [ui_visual_anti_slop.md](file:///c:/Users/HP/Desktop/Master%20Plan/.agents/rules/ui_visual_anti_slop.md). Il fournit les snippets, structures et tokens immédiatement actionnables pour concevoir des interfaces web et mobile de niveau production (inspiration Linear, Vercel, Apple HIG).

---

## 🏛️ 1. Architecture des Surfaces (Zéro Blur Décoratif)

Les cartes et modales n'utilisent **jamais** de `backdrop-filter: blur()` baveux. On applique l'étagement de surfaces opaques solides :

```css
:root {
  /* Surfaces solides étagées */
  --surface-0: #0B0F17;    /* Toile de fond globale */
  --surface-1: #151B28;    /* Cartes, conteneurs de premier niveau */
  --surface-2: #1E293B;    /* Éléments surélevés, barres d'outils, modales */
  --surface-3: #334155;    /* Éléments interactifs en survol */
  
  /* Lignes de structure (Hairline Sub-pixel Borders) */
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-strong: rgba(255, 255, 255, 0.16);
  
  /* Inset highlight (Lumière zénithale discrète) */
  --highlight-top: inset 0 1px 0 rgba(255, 255, 255, 0.10);
}

/* Carte de contenu standard */
.card {
  background-color: var(--surface-1);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--highlight-top);
  border-radius: 8px;
  padding: 1.5rem;
}
```

---

## 🎨 2. Règle des Couleurs 60-30-10 & Monolithisme

Interdiction des dégradés arc-en-ciel violets/cyans. Un écran est structuré par **un seul accent sémantique fort** :

```css
:root {
  /* 60% : Fond dominant neutre */
  --bg-canvas: var(--surface-0);
  
  /* 30% : Structure et texte */
  --text-primary: #F8FAFC;
  --text-secondary: #94A3B8;
  --text-muted: #64748B;
  
  /* 10% : Accent unique (calibré par projet) */
  --accent-main: #DC2626;         /* Exemple : Rouge Signalétique */
  --accent-hover: #B91C1C;
  --accent-subtle: rgba(220, 38, 38, 0.12);
}
```

---

## 🔤 3. Typographie à Gravité & Échelle Modulaire

* **Titres H1/H2 :** Tracking resserré obligatoire pour donner de la densité éditoriale.
* **Micro-labels & Badges :** Majuscules avec tracking positif.

```css
/* Titres à forte personnalité (Space Grotesk, Plus Jakarta Sans, Helvetica Neue) */
h1, .hero-title {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.1;
  color: var(--text-primary);
}

h2, .section-title {
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.2;
  color: var(--text-primary);
}

/* Micro-labels / Badges / Overlines */
.badge, .overline {
  font-size: 0.6875rem; /* 11px */
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-secondary);
}
```

---

## 📐 4. Grille Modulaire 8px & Espacements

Toutes les dimensions de padding, margin et gap respectent la progression mathématique :
* `4px` (gap minimal, padding d'icône)
* `8px` (micro-espacement)
* `12px` / `16px` (padding de bouton, gap de grille serrée)
* `24px` / `32px` (padding de carte, séparation de sections)
* `48px` / `64px` (espacement vertical entre blocs majeurs)

---

## ⚡ 5. Micro-Interactions & Transitions Tactiles

```css
/* Bouton d'action principal */
.btn-primary {
  background-color: var(--accent-main);
  color: #FFFFFF;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.625rem 1.25rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 1px 2px rgba(0, 0, 0, 0.2);
  transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s ease;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: var(--accent-hover);
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: translateY(0);
}
```

---

## 🧪 6. Checklist de Contrôle Déterministe
Avant de livrer un fichier HTML/CSS, valider les 5 critères éliminatoires :
1. [ ] Aucune valeur de couleur hexadécimale brute hors du bloc `:root`.
2. [ ] Zéro `backdrop-filter: blur()` sur les cartes de contenu.
3. [ ] `letter-spacing: -0.03em` appliqué sur les titres H1/H2.
4. [ ] Un seul accent sémantique saturé visible sur l'écran.
5. [ ] Espacements alignés sur la grille 8px (zéro valeur arbitraire type `17px`, `23px`).
