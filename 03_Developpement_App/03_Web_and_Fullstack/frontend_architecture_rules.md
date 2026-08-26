# 🌐 Standards d'Architecture Web, Fullstack & Vercel Best Practices

Ce document définit les règles d'ingénierie et d'optimisation pour la conception de WebApps (React 19, Next.js 15, Vanilla Web) et de Landing Pages ultra-performantes, alignées sur **[vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills)**.

---

## ⚡ 1. Performance & Core Web Vitals (Google UX Metrics)

Pour garantir un score **Google PageSpeed $\ge 95$** et une réactivité optimale :
* **LCP (Largest Contentful Paint) < 1.2s :** Préchargement des images critiques (`<link rel="preload">`) et polices avec `font-display: swap`.
* **INP (Interaction to Next Paint) < 50ms :** Réduction drastique du JavaScript bloquant le Main Thread.
* **CLS (Cumulative Layout Shift) = 0 :** Dimensions explicites (`width` et `height` ou `aspect-ratio`) sur toutes les images, vidéos et conteneurs Bento.

---

## ⚛️ 2. Standards React 19 & Next.js 15 (Vercel Labs Core)

* **Découpage Strict RSC vs Client Components :**
  * Par défaut, tous les composants sont des **Server Components (RSC)** pour un poids client nul.
  * Réserver `'use client'` aux seules feuilles de l'arbre qui manipulent des hooks d'état (`useState`, `useEffect`) ou des événements utilisateur (`onClick`).
* **Server Actions & Mises à Jour Optimistes :**
  * Les mutations de données s'exécutent via des Server Actions typées, combinées avec `useOptimistic` pour une sensation d'instantanéité.
* **Streaming SSR & Suspense Boundaries :**
  * Envelopper tout chargement de données asynchrone dans un composant `<Suspense fallback={<BentoSkeleton />}>`.
* **Optimisation de Bundle & Tree-Shaking :**
  * Utiliser `next/dynamic` pour le chargement différé des modales et graphiques lourds.

---

## 🎨 3. Accessibilité & Design Guidelines (WCAG 2.2 AA)

* **Contrastes HSL :** Ratio de contraste $\ge 4.5:1$ pour le texte normal et $\ge 3:1$ pour les éléments interactifs.
* **Touch Targets Mobiles :** Dimensions minimales de $48\times 48\text{px}$ avec un espacement suffisant pour les clics sur smartphone.
* **Sémantique ARIA :** Tout élément interactif personnalisé doit comporter les attributs `role`, `aria-label`, `aria-expanded` appropriés.

---

## 🚀 4. Déploiements Éphémères & Prévisualisations Live (Vercel Claimable)

* Pour tout prototype ou page de vente, générer une prévisualisation instantanée via `npx vercel` ou le runner local pour valider le rendu en conditions réelles avant livraison.

---

## 🛡️ 5. Sécurité Frontend & Hygiène XSS
* Échappement systématique des entrées utilisateurs (zéro `dangerouslySetInnerHTML` non sanitisé).
* Politique de sécurité de contenu stricte (Content Security Policy - CSP).

