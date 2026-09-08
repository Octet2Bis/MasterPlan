# 🌿 Doctrine Tactile, Minérale & Biomimétique (ui_tactile_biomimetic_craft.md)

Ce document constitue la **loi d'interaction sensorielle, de matière et de cinétique organique** du Master Plan.
Inspiré de la philosophie matérielle et cinétique de **This Is Colossal** (artisanat d'art, biomimétisme, sculptures cinétiques, céramique et matière vivante), ce cadre formalise l'intégration de la physique naturelle dans le code pour **Aevum** (Healthspan & Longévité) et les interfaces du studio.

---

## 🔬 1. La Physique Cinétique Biomimétique (Mouvement du Vivant)

Les interfaces numériques standards souffrent d'une inertie mécanique rigide (`ease-in-out` linéaire). La nature ne se déplace jamais selon des fonctions polynomiales simples : elle respire, oscille et amortit.

| Type d'Interaction | Courbe / Fonction CSS | Comportement Physique | Cas d'Usage Aevum & Studio |
| :--- | :--- | :--- | :--- |
| **Respiration Vitale** | `cubic-bezier(0.4, 0.0, 0.2, 1.0)` | Expansion douce, plateau apaisé, rétractation fluide | Timers respiratoires (Box breathing, 4-7-8), orbes de focus |
| **Ressort Minéral** | `cubic-bezier(0.34, 1.56, 0.64, 1.0)` | Dépassement élastique contrôlé (*overshoot* < 5%) | Révélation de cartes, badges d'accomplissement de protocoles |
| **Inertie Tissulaire** | `cubic-bezier(0.16, 1.0, 0.3, 1.0)` | Accélération immédiate, décélération longue et soyeuse | Tiroirs de navigation, modales, transitions de pages |

```css
/* Token standard de cinétique biomimétique */
:root {
  --motion-breath: 4000ms cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;
  --motion-spring: 320ms cubic-bezier(0.34, 1.56, 0.64, 1);
  --motion-tissue: 240ms cubic-bezier(0.16, 1, 0.3, 1);
}
```

---

## 🏺 2. Les Accords Chromatiques Telluriques & Minéraux

Issus de la décomposition spectrophotométrique des pigments naturels observés dans l'artisanat d'art :

### 🌿 Accord A : Verdigris & Juniper (Cuivre Oxydé & Genévrier Minéral)
* **Toile :** Craie minérale `#FCF6E9` (Light) ou Tourbe fumée sombre `#1C1E0D` (Dark).
* **Surfaces :** Lin brut `#FFF7E3` ou Carbone végétal `#252916`.
* **Accent Vivant :** Vert-de-gris cuivre `#A2EBD1` (luminescence subtile).
* **Accent Profond :** Genévrier sauvage `#006250` (autorité et contraste).
* **Usage :** Aevum (Monitoring cardiovasculaire, vitalité, biomarqueurs).

### 🧱 Accord B : Terra Cotta, Sandal & Driftwood (Terre Cuite & Bois Flotté)
* **Toile :** Poussière de terre claire `#F6F3EB` ou Noir Corbeau `#141512`.
* **Surfaces :** Santal chaud `#EDE7DA`.
* **Accent Terre Cuite :** Sanguine ocre `#AD2C0C` ou Saumon cuit `#F78F6E`.
* **Teinte d'Atténuation :** Bois flotté patiné `#817D6D`.
* **Usage :** Habitudes de longévité, posture, décompression ostéo-articulaire.

---

## 📜 3. Rendu Matière & Tactilité (Anti-Flat Design)

Le *Flat Design* aseptisé génère de la fatigue cognitive. Les surfaces doivent exprimer une tangibilité discrète sans tomber dans le skeuomorphisme kitsch des années 2010 :

1. **Le Micro-Grain de Matière (CSS SVG Noise) :**
   Une couche d'opacité ultra-faible (2% à 3.5%) avec un bruit fractal simule le papier lin pressé ou la porcelaine émaillée, cassant l'effet "plastique" des écrans OLED.
2. **La Réfraction de Verre Minéral (*Frosted Obsidian*) :**
   ```css
   .surface-mineral-glass {
     background: rgba(28, 30, 13, 0.72);
     backdrop-filter: blur(16px) saturate(140%);
     border: 1px solid rgba(162, 235, 209, 0.12);
   }
   ```
3. **L'Ombre Portée Naturelle Déportée :**
   Bannir les ombres noires floues centrées (`box-shadow: 0 0 10px #000`). Utiliser des ombres teintées à double étagement simulant une lumière zénithale chaude :
   `box-shadow: 0 4px 12px -2px rgba(28, 30, 13, 0.08), 0 12px 24px -4px rgba(28, 30, 13, 0.12);`

---

## 🛡️ 4. Garde-Fou Poka-Yoke & Règle d'Or Produit

* **Plafond de sobriété :** Le travail de texture et d'animation biomimétique ne doit **JAMAIS** dépasser 5% du budget CPU/GPU.
* Les animations respiratoires doivent impérativement respecter la directive système `prefers-reduced-motion: reduce`.
* Le contraste de lisibilité textuelle reste soumis à la règle inviolable **WCAG AA (4.5:1 minimum)**.
