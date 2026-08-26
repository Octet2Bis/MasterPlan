# ♿ Standard d'Accessibilité Web (WCAG 2.2 Niveau AA / AAA)

Ce document établit les exigences strictes d'accessibilité numérique pour toutes les interfaces utilisateur développées dans le Master Plan.

---

## 🎯 1. Ratios de Contraste Incompressibles (Couleurs)

Toute combinaison de couleurs texte / fond doit être validée mathématiquement :

| Type de Contenu | Seuil WCAG AA | Seuil Recommandé AAA | Exemple Conforme |
| :--- | :--- | :--- | :--- |
| **Corps de texte normal (< 18px)** | **$\ge 4.5:1$** | $\ge 7:1$ | `#F8FAFC` sur `#0B0F17` (Ratio > 16:1) |
| **Grands Titres ($\ge 18\text{px}$ bold ou $\ge 24\text{px}$)** | **$\ge 3.0:1$** | $\ge 4.5:1$ | `#94A3B8` sur `#0B0F17` (Ratio > 7:1) |
| **Composants d'interface (Bordures de champs, icônes)** | **$\ge 3.0:1$** | $\ge 4.5:1$ | `rgba(255,255,255,0.2)` sur fond sombre |

*Interdiction absolue du texte gris clair `#64748B` sur fond blanc cassé ou gris sombre non contrasté.*

---

## ⌨️ 2. Navigation au Clavier & Gestion du Focus

1. **Visibilité du Focus :** Ne **jamais** utiliser `outline: none;` sans fournir un style de focus de remplacement ultra-visible :
   ```css
   :focus-visible {
     outline: 2px solid var(--accent-main);
     outline-offset: 2px;
   }
   ```
2. **Ordre du Tabulation Logique :** L'ordre de tabulation au clavier (`Tab` / `Shift+Tab`) doit correspondre exactement à l'ordre de lecture visuel.
3. **Pièges de Focus (Focus Traps) dans les Modales :**
   * À l'ouverture d'une modale, le focus est immédiatement transféré sur le premier élément interactif ou le bouton de fermeture.
   * La touche `Escape` doit fermer la modale instantanément et restituer le focus à l'élément déclencheur.

---

## 🏷️ 3. Structure Sémantique & Attributs ARIA

1. **Hiérarchie des Titres Unique :** Un seul `<h1>` par document HTML. Progression logique stricte `<h1>` ➔ `<h2>` ➔ `<h3>` sans sauter de niveau.
2. **Boutons vs Liens :**
   * Utiliser `<button>` pour toute action modifiant l'état (ouvrir modale, soumettre formulaire, déclencher timer).
   * Utiliser `<a>` avec attribut `href` valide pour toute navigation ou changement d'URL.
3. **Labels pour Lecteurs d'Écran :**
   * Tout bouton contenant uniquement une icône SVG doit comporter un attribut `aria-label` explicite :
     ```html
     <button class="btn-icon" aria-label="Fermer la fenêtre modale">
       <svg>...</svg>
     </button>
     ```
   * Les champs de formulaire doivent tous être liés à un `<label for="id">`.

---

## 📱 4. Cibles Tactiles Mobiles (Touch Targets)

* Dimension minimale absolue de toute zone cliquable : **$48 \times 48\text{ px}$** (avec marge de sécurité de 8px entre cibles adjacentes).
* Les éléments d'action ne doivent jamais se chevaucher sur petit écran (viewport mobile 375px).
