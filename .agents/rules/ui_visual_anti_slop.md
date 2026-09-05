# 🛡️ Règle Globale : Anti-AI-Slop Visuel & Typographique

> **Scope :** TOUS les projets de développement (`03_Developpement_App_and_Design/`, `01_GTM_Growth/03_Experimentation/`, tout fichier `.html`, `.css`, `.js` générant de l'UI).
> **Priorité :** HAUTE — Cette règle est chargée automatiquement et prévaut sur les préférences par défaut de l'agent.

---

## 1. 🚫 LISTE NOIRE — Patterns Visuels Interdits

### A. Effets de Blur & Glassmorphism Décoratifs
| Interdit ❌ | Autorisé ✅ |
|:---|:---|
| `backdrop-filter: blur()` sur des cartes de contenu, modales ou sections | `backdrop-filter: blur(12px)` UNIQUEMENT sur les barres de navigation flottantes (top bar, bottom tab bar) avec fond opaque ≥ 70% |
| `background: rgba(255,255,255,0.05)` + blur comme "surface" | Surfaces opaques étagées (Surface-0 `#0B0F17`, Surface-1 `#151B28`, Surface-2 `#1E293B`) |
| Halos néon flous (`box-shadow: 0 0 40px rgba(139,92,246,0.3)`) | Bordures sub-pixel nettes : `border: 1px solid rgba(255,255,255,0.08)` |
| Ombres portées géantes diffuses | Inset highlights : `box-shadow: inset 0 1px 0 rgba(255,255,255,0.06)` |

### B. Couleurs & Dégradés
| Interdit ❌ | Autorisé ✅ |
|:---|:---|
| Dégradés arc-en-ciel (violet → cyan → rose) | **Un seul accent franc** par projet (ex: `#DC2626` rouge signal OU `#2563EB` bleu cobalt) |
| Palette par défaut Indigo/Violet/Émeraude (`#6366F1`, `#8B5CF6`, `#10B981`) | Palette monolithique **60-30-10** : 60% fond neutre, 30% structure charbon, 10% accent unique |
| Couleurs nommées CSS (`red`, `blue`, `green`) | Variables CSS sémantiques (`var(--color-accent)`, `var(--color-surface-1)`) |
| Plus de 3 teintes saturées distinctes dans un même écran | Maximum 2 teintes saturées + 1 teinte neutre par écran |

### C. Typographie
| Interdit ❌ | Autorisé ✅ |
|:---|:---|
| Utiliser Inter/Roboto/System UI par défaut sans justification | Polices à personnalité : Space Grotesk, Syne, Cabinet Grotesk, Plus Jakarta Sans, Helvetica Neue |
| Titres avec `letter-spacing` ≥ 0 (trop aéré, générique) | Titres H1/H2 avec tracking négatif : `letter-spacing: -0.02em` à `-0.04em` |
| Taille unique de texte sans hiérarchie | Échelle modulaire stricte (Major Third 1.250 ou Perfect Fourth 1.333) |
| Graisse unique (400 regular partout) | Minimum 3 niveaux de graisse (400 corps, 600 sous-titres, 700-800 titres) |
| `font-size` en pixels fixes | `font-size` en `rem` ou `clamp()` pour le responsive |

### D. Ombres & Effets
| Interdit ❌ | Autorisé ✅ |
|:---|:---|
| `box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5)` (ombre trop lourde) | Ombres légères étagées : `box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.06)` |
| Multiples ombres superposées pour un effet "depth" excessif | Une seule ombre subtile par élément |
| `text-shadow` décoratif sur le corps de texte | `text-shadow` uniquement sur les overlays de texte sur image/vidéo |

### E. Layout & Espacement
| Interdit ❌ | Autorisé ✅ |
|:---|:---|
| Padding/margin en valeurs arbitraires (13px, 22px, 37px) | Grille de 4px/8px stricte (4, 8, 12, 16, 24, 32, 48, 64, 96, 128) |
| `border-radius` excessif (24px, 32px sur les cartes) | `border-radius` contraint : 4px (boutons), 8px (cartes), 12px (modales), 9999px (pills/badges) |
| Sections avec `min-height: 100vh` systématique | Hauteur dictée par le contenu, sauf hero section |

---

## 2. ✅ STANDARDS OBLIGATOIRES

### A. Structure des Tokens CSS
Tout projet doit déclarer ses tokens dans un bloc `:root` en haut du fichier CSS principal :

```css
:root {
  /* — Surfaces (échelle opaques, PAS de blur) — */
  --surface-0: #0B0F17;    /* Fond principal */
  --surface-1: #151B28;    /* Cartes, panneaux */
  --surface-2: #1E293B;    /* Éléments surélevés */
  --surface-3: #334155;    /* Éléments interactifs hover */
  
  /* — Texte — */
  --text-primary: #F8FAFC;
  --text-secondary: #94A3B8;
  --text-muted: #64748B;
  
  /* — Accent (UN SEUL par projet) — */
  --color-accent: #DC2626;           /* Défini par projet */
  --color-accent-hover: #B91C1C;
  --color-accent-subtle: rgba(220, 38, 38, 0.12);
  
  /* — Bordures — */
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-default: rgba(255, 255, 255, 0.12);
  
  /* — Typographie (Échelle Modulaire Major Third 1.250) — */
  --text-xs: 0.64rem;    /* 10.24px — micro-labels */
  --text-sm: 0.8rem;     /* 12.8px  — captions */
  --text-base: 1rem;     /* 16px    — corps */
  --text-lg: 1.25rem;    /* 20px    — sous-titres */
  --text-xl: 1.563rem;   /* 25px    — titres H3 */
  --text-2xl: 1.953rem;  /* 31.25px — titres H2 */
  --text-3xl: 2.441rem;  /* 39px    — titres H1 */
  --text-4xl: 3.052rem;  /* 48.83px — hero display */
  
  /* — Espacement (Grille 8px) — */
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */
  --space-24: 6rem;    /* 96px */
  --space-32: 8rem;    /* 128px */
  
  /* — Rayons de bordure — */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
}
```

### B. Typographie — Règle de Tracking
```css
/* OBLIGATOIRE sur tous les titres */
h1, h2, .display-text { letter-spacing: -0.03em; }
h3 { letter-spacing: -0.02em; }

/* OBLIGATOIRE sur tous les micro-labels / badges */
.label, .badge, .overline {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
  font-size: var(--text-xs);
}
```

### C. Densité d'Information (Règle Suisse)
- Chaque écran doit contenir **au moins 3 niveaux de hiérarchie visuelle** (titre, sous-titre, corps).
- Les sections vides ou "aérées" sans contenu structurant sont interdites.
- L'alignement sur la grille 8px doit être vérifiable visuellement.

---

## 3. 🧰 TOOLBOX D'AUTOCORRECTION — Outils de Référence

### A. Linting & Validation Automatique (Code)

| Outil | Usage | Commande / URL |
|:---|:---|:---|
| **Stylelint** | Linter CSS standard. Détecte les violations de tokens et les valeurs hardcodées | `npx stylelint "**/*.css"` |
| **stylelint-declaration-strict-value** | Plugin Stylelint forçant l'usage de `var()` pour couleurs, espacements, tailles | `npm install --save-dev stylelint-declaration-strict-value` |
| **Stylelint `color-no-hex`** | Règle intégrée interdisant les couleurs hex brutes (force l'usage de tokens) | Config : `"color-no-hex": true` |
| **Project Wallace CSS Analyzer** | Audit visuel complet du CSS : nombre de couleurs uniques, tailles de police, sélecteurs complexes | [projectwallace.com](https://www.projectwallace.com/css-analyzer) |
| **TokenLens** | Compare les tokens JSON déclarés vs les valeurs réellement utilisées dans le CSS (détecte le drift) | [tokenlens.app](https://tokenlens.app) |
| **Design Tokens Validator (W3C)** | Valide la conformité des fichiers de tokens au standard W3C Design Tokens Community Group | [design-tokens-validator.com](https://www.design-tokens-validator.com) |

### B. Typographie & Échelle Modulaire

| Outil | Usage | URL |
|:---|:---|:---|
| **Typescale** | Générateur d'échelles typographiques modulaires avec export CSS | [typescale.com](https://typescale.com) |
| **Precise Type** | Système typographique harmonieux avec contraintes de line-height et baseline | [precisetype.com](https://precisetype.com) |
| **Typewolf** | Veille sur les tendances typographiques réelles et associations de polices haut de gamme | [typewolf.com](https://typewolf.com) |
| **Fontjoy** | Générateur mathématique de contrastes typographiques (titre ↔ corps) | [fontjoy.com](https://fontjoy.com) |
| **Google Fonts — Échelle Variable** | Polices variables avec axes de graisse, largeur et optical-sizing | [fonts.google.com](https://fonts.google.com) |
| **Material Design Type Scale** | Référence professionnelle de structure typographique en catégories sémantiques | [m3.material.io/styles/typography](https://m3.material.io/styles/typography/type-scale-tokens) |

### C. Couleurs & Palettes Contraintes

| Outil | Usage | URL |
|:---|:---|:---|
| **Radix Colors** | Échelles de couleurs en 12 étapes, accessibles, avec variantes light/dark/alpha (P3) | [radix-ui.com/colors](https://www.radix-ui.com/colors) |
| **Huetone** | Création de rampes de couleurs perceptuellement uniformes (LCH) avec contraste APCA live | [huetone.ardh.ro](https://huetone.ardh.ro) |
| **Leonardo Color (Adobe)** | Génération de palettes par ratio de contraste cible (accessibility-first) | [leonardocolor.io](https://leonardocolor.io) |
| **Realtime Colors** | Prévisualisation en temps réel d'une palette sur un template UI réaliste | [realtimecolors.com](https://realtimecolors.com) |
| **Happy Hues** | Inspiration de palettes contextualisées (montre OÙ appliquer chaque couleur) | [happyhues.co](https://www.happyhues.co) |
| **Atmos Style** | Construction de systèmes de couleurs UI avec tokens sémantiques et échelles accessibles | [atmos.style](https://atmos.style) |
| **Coolors** | Génération rapide de palettes harmonieuses (à contraindre manuellement en 60-30-10) | [coolors.co](https://coolors.co) |

### D. Contraste & Accessibilité (WCAG / APCA)

| Outil | Usage | URL |
|:---|:---|:---|
| **WebAIM Contrast Checker** | Vérification WCAG AA/AAA pour les combinaisons texte/fond | [webaim.org/resources/contrastchecker](https://webaim.org/resources/contrastchecker) |
| **Stark** | Suite complète : contraste, simulation daltonisme, annotations accessibilité (plugin Figma + extension navigateur) | [getstark.co](https://www.getstark.co) |
| **WAVE** | Audit d'accessibilité de pages web live (contraste, sémantique, ARIA) | [wave.webaim.org](https://wave.webaim.org) |
| **TPGi Colour Contrast Analyser** | Application desktop OS-level pour échantillonner les couleurs de n'importe quelle application | [tpgi.com/color-contrast-checker](https://www.tpgi.com/color-contrast-checker) |
| **Accessible Brand Colors** | Matrice de validation WCAG complète pour toute la palette d'une marque | [abc.useallfive.com](https://abc.useallfive.com) |

### E. Design Systems de Référence (Les Étalons Anti-Slop)

| Référence | Pourquoi c'est l'étalon | URL |
|:---|:---|:---|
| **Linear Design System** | Zéro blur décoratif. Contrastes tranchants. Bordures 1px. Typographie calibrée. Le standard absolu du dark UI utilitaire. | [linear.app](https://linear.app) |
| **Raycast Design System** | Densité d'information maximale. Minimalisme fonctionnel. Raccourcis clavier. | [raycast.com](https://raycast.com) |
| **Vercel Design** | Noir & blanc dominant. Un seul accent. Espacement chirurgical. | [vercel.com/design](https://vercel.com/design) |
| **Refactoring UI** | Le guide pragmatique sur la hiérarchie visuelle et l'élimination des bordures superflues | [refactoringui.com](https://www.refactoringui.com) |
| **Apple HIG (Dark Mode)** | Référence des surfaces étagées, du vibrancy system, et de la typographie SF Pro | [developer.apple.com/design/human-interface-guidelines](https://developer.apple.com/design/human-interface-guidelines) |

### F. Fichiers de Contraintes pour IA (DESIGN.md)

| Ressource | Usage | URL |
|:---|:---|:---|
| **DESIGN.md Spec (Google Labs)** | Format officiel de fichier de contraintes design pour agents IA | [github.com/google-labs-code/design.md](https://github.com/google-labs-code/design.md) |
| **designmd.ai** | Bibliothèque communautaire de design systems au format DESIGN.md | [designmd.ai](https://designmd.ai) |
| **Style Dictionary (Amazon)** | Transforme les tokens design en CSS, SCSS, Swift, Android, etc. | [amzn.github.io/style-dictionary](https://amzn.github.io/style-dictionary) |
| **Tokens Studio for Figma** | Synchronisation de tokens Figma ↔ code via JSON/GitHub | [tokens.studio](https://tokens.studio) |

### G. Espacement & Grille

| Outil | Usage | URL |
|:---|:---|:---|
| **Pacgie** | Générateur de Design System tout-en-un (spacing, couleurs, typo) avec export CSS/Tailwind | [pacgie.com](https://pacgie.com) |
| **Grid Maker Pro** | Visualisation de grilles 8pt/4pt, espacement modulaire et rythme baseline | [gridmakerpro.com](https://gridmakerpro.com) |

---

## 4. 📋 CHECKLIST DE VALIDATION PRÉ-LIVRAISON

Avant de soumettre toute production UI au review utilisateur, vérifier :

- [ ] **Aucune couleur hex brute** dans le CSS → toutes les couleurs passent par `var(--color-*)`.
- [ ] **Zéro `backdrop-filter: blur()`** sur des éléments de contenu (cartes, sections, modales).
- [ ] **Tracking négatif** appliqué sur H1 et H2 (`letter-spacing` < 0).
- [ ] **Maximum 2 teintes saturées** visibles dans le même écran.
- [ ] **Espacement sur grille 8px** vérifié (pas de valeurs arbitraires comme 13px, 22px).
- [ ] **Échelle typographique modulaire** respectée (les tailles de texte suivent un ratio, pas des valeurs ad hoc).
- [ ] **Contraste WCAG AA** validé sur toutes les paires texte/fond (ratio ≥ 4.5:1 pour le corps, ≥ 3:1 pour les grands titres).
- [ ] **Pas de polices génériques** sans justification (Inter, Roboto, Arial, sans-serif nu).
- [ ] **Pas de `border-radius` > 12px** sur des éléments rectangulaires (sauf pills/badges avec `9999px`).
- [ ] **Une seule ombre subtile** par élément, pas d'empilement d'ombres décoratives.

---

## 5. ⚡ PROTOCOLE D'APPLICATION

1. **Chargement automatique :** Cette règle est lue par l'agent à chaque session impliquant de l'UI.
2. **Avant de coder :** L'agent vérifie l'existence du bloc `:root` de tokens dans le CSS du projet.
3. **Pendant le code :** Chaque propriété visuelle doit référencer un token, pas une valeur brute.
4. **Avant de livrer :** L'agent parcourt la checklist §4 et corrige tout écart.
5. **En cas de doute :** L'agent consulte les référentiels Linear / Vercel / Apple HIG plutôt que ses propres préférences par défaut.
