# 🏛️ Méthodologie Manus & Standard Layers UI (ui_layers_manus_craft.md)

Ce document formalise la **loi d'exécution frontend et d'artisanat visuel (Craft)** régissant les interfaces Web et Mobiles du Master Plan (Aevum, Portfolio, Outbound Sniper).

Inspiré de la galerie d'artisanat **Layers** et de la méthode d'ingénierie **Manus**, ce standard élimine définitivement les designs génériques et les tics visuels de l'intelligence artificielle (*AI Slop*).

---

## 🎨 1. Le Système Physique des Surfaces Étagées (Dark Charcoal)

Une interface d'élite ne doit **jamais** être plate. Elle est modélisée comme un empilement physique de plans éclairés par une source de lumière supérieure douce.

| Niveau de Surface | Token CSS | Teinte Hexadécimale | Rôle Physique & Éclairage |
| :--- | :--- | :--- | :--- |
| **Surface 0 (Toile)** | `--surface-0` | `#080A0E` | Fond absolu du viewport (`100vh`, absorbant la lumière). |
| **Surface 1 (Cartes / Bento)** | `--surface-1` | `#11151C` | Conteneurs structuraux. Bordure 1px `rgba(255, 255, 255, 0.07)`. |
| **Surface 2 (Interactions)** | `--surface-2` | `#1A202A` | Éléments cliquables, champs, pilules au repos. Reflet supérieur `inset 0 1px 0 rgba(255,255,255,0.08)`. |
| **Surface 3 (Flottant / Modales)** | `--surface-3` | `#232B38` | Menus déroulants, modals. Ombre gaussienne `0 16px 36px -6px rgba(0,0,0,0.7)`. |

```css
/* Règle de Bordure Photonique Subtile (Signature Layers) */
.layer-card {
  background: var(--surface-1);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.5),
              inset 0 1px 0 0 rgba(255, 255, 255, 0.06);
  border-radius: 12px;
}
```

---

## 📐 2. Typographie à Gravité & Contraste Élevé

1. **Titres Majeurs (H1/H2) :**
   - Polices modernes géométriques (`Space Grotesk`, `Outfit`, `Inter`).
   - Suivi optique serré obligatoire : `letter-spacing: -0.03em`.
   - Contraste blanc titane : `#F9FAFB` sur fond sombre.
2. **Métriques, Télémétrie & Horodatages :**
   - Police monospace nette (`JetBrains Mono`, `SF Mono`).
   - Formatage tabulaire pour éviter les tremblements d'interface : `font-variant-numeric: tabular-nums`.
3. **Badges & Micro-Étiquettes :**
   - Tout en capitales, espacement aéré : `text-transform: uppercase`, `letter-spacing: 0.06em`, `font-size: 11px`.

---

## ⚡ 3. Micro-Feedback Tactile & Courbes Cinétiques (Manus Engine)

Tout élément interactif doit réagir instantanément avec un retour haptique visuel doux :

```css
/* Courbe cinétique universelle Layers */
--transition-craft: 160ms cubic-bezier(0.16, 1, 0.3, 1);

.btn-craft, .interactive-pill {
  transition: transform var(--transition-craft),
              background var(--transition-craft),
              border-color var(--transition-craft),
              box-shadow var(--transition-craft);
}

.btn-craft:hover {
  transform: translateY(-1px);
  border-color: rgba(255, 255, 255, 0.18);
  box-shadow: 0 6px 20px -4px rgba(0, 0, 0, 0.6);
}

.btn-craft:active {
  transform: translateY(0px) scale(0.985);
  box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.4);
}
```

---

## 🛠️ 4. Protocole d'Ingénierie Specimen-First (Méthode Manus)

L'interdiction de l'improvisation IA :

1. **Isolation en Bac à Sable :** Ne jamais coder une page complète d'un seul bloc. Construire chaque composant isolément avec ses fixtures de test (Mock-First).
2. **Les 4 États Systématiques :** Tout composant interactif doit implémenter visuellement :
   - `Empty State` (Illustration ou message d'accueil guidé).
   - `Loading State` (Skeleton shimmer sombre, zéro spinner rotatif criard).
   - `Success / Nominal State` (Affichage nominal et harmonisé).
   - `Error State` (Notification sobre avec bouton de réessai immédiat).
3. **Zéro Flou ni Gradients Arc-en-Ciel :** Proscrire les dégradés violets/roses criards générés par défaut par les LLMs. N'utiliser que des accents ciblés à haute signification :
   - Émeraude (`#10B981`) pour la vitalité et la réussite.
   - Ambre (`#F59E0B`) pour l'attention et les états intermédiaires.
   - Rubis (`#EF4444`) pour les blocages et la toxicité attentionnelle.
