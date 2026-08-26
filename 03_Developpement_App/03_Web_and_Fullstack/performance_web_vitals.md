# ⚡ Standard d'Optimisation Web & Core Web Vitals (INP / LCP / CLS)

Ce guide définit les seuils d'acceptation stricts et les techniques d'optimisation obligatoires pour tout livrable Web (Landing Pages, WebApps React/Next.js, Simulateurs).

---

## 🎯 1. Métriques Cibles & Seuils Incompressibles

| Métrique | Seuil Optimal | Seuil Alerte | Impact Business / SEO |
| :--- | :--- | :--- | :--- |
| **LCP** (*Largest Contentful Paint*) | **< 1.2s** | > 2.0s | Taux de rebond immédiat, pénalité ranking Google |
| **INP** (*Interaction to Next Paint*) | **< 50ms** | > 150ms | Sensation de lag, friction à la conversion |
| **CLS** (*Cumulative Layout Shift*) | **= 0.00** | > 0.05 | Clics manqués, frustration utilisateur |
| **TTFB** (*Time To First Byte*) | **< 200ms** | > 600ms | Dépendance CDN / SSR Edge |
| **TBT** (*Total Blocking Time*) | **< 100ms** | > 250ms | Saturation du Main Thread JS |

---

## 📦 2. Règles d'Optimisation des Assets & Médias

### A. Images & Formats Modernes
1. **Formats Obligatoires :** Utiliser exclusivement le format **WebP** ou **AVIF**. Bannir le PNG non compressé sur les photos de fond.
2. **Dimensionnement Explicite :** Toute balise `<img>` doit obligatoirement comporter `width=""` et `height=""` (ou un ratio CSS `aspect-ratio: 16/9`) pour éliminer le CLS.
3. **Chargement Différé :** `loading="lazy"` et `decoding="async"` sur toutes les images sous la ligne de flottaison (*Below the Fold*).
4. **Hero Image Préchargée :** L'image principale au-dessus de la ligne de flottaison doit être préchargée dans le `<head>` :
   ```html
   <link rel="preload" as="image" href="assets/hero_bg.webp" type="image/webp">
   ```

### B. Gestion des Polices Web (Zero Layout Shift)
1. **Règle d'affichage :** Déclarer systématiquement `font-display: swap;` sur toutes les règles `@font-face`.
2. **Sous-ensemble (Subsetting) :** Ne charger que les glyphes nécessaires (Latin-1) au format WOFF2.
3. **Fallback Metrics Matching :** Définir une police système de repli avec ajustement de taille (`size-adjust`, `ascent-override`) pour éviter le saut visuel au chargement.

---

## 🏎️ 3. Budget JavaScript & Main Thread Relief

1. **Budget Bundle Initial :** Le code JavaScript initial exécuté au chargement ne doit **jamais dépasser 50 Ko (gzippé)**.
2. **Découpage de Code (*Code Splitting*) :** Tout composant lourd (lecteur vidéo, canvas de graphiques, modales complexes) doit être chargé à la demande via `import()` dynamique ou `React.lazy()`.
3. **Élimination des Dépendances Bloquantes :**
   * Bannir les bibliothèques lourdes pour des micro-fonctions (ex: préférer le natif `Intl` et `Date` à Moment.js).
   * Utiliser des icônes SVG inline optimisées plutôt que des packs d'icônes monolithiques.

---

## 🧪 4. Protocole d'Audit & Validation

Avant de déclarer une page prête pour la production :
1. Exécuter un audit Lighthouse en conditions mobiles émulées (Throttle 4G, CPU 4x slowdown).
2. Valider les scores minimaux :
   * **Performance : $\ge 95/100$**
   * **Accessibilité : $100/100$**
   * **Best Practices : $100/100$**
   * **SEO : $100/100$**
