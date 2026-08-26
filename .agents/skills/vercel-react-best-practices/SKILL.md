---
name: vercel-react-best-practices
description: Standards officiels Vercel Labs pour React 19, Next.js 15, Server Components (RSC), Server Actions, Streaming SSR, Tree-shaking et déploiements éphémères. À utiliser dans 03_Developpement_App/03_Web_and_Fullstack/.
---

# ⚡ Vercel Labs : React 19 & Next.js Best Practices

Ce skill encapsule les meilleures pratiques officielles de **[vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills)** pour concevoir des applications web ultra-rapides, déterministes et scalables.

---

## 🏛️ 1. Architecture Server-First (RSC Boundaries)

1. **Server Components par Défaut :**
   * Récupération de données directement dans le composant asynchrone (`async function Component()`).
   * Zéro fuite de code serveur vers le bundle client.
2. **Client Components Minimaux (`'use client'`) :**
   * Pousser la directive `'use client'` le plus bas possible dans l'arbre DOM (au niveau des seuls boutons, formulaires ou widgets interactifs).
3. **Mises à Jour Optimistes :**
   * Utiliser le hook `useOptimistic` pour mettre à jour l'UI instantanément avant confirmation du serveur.

---

## 🏎️ 2. Performance de Chargement & Streaming

* **Suspense & Skeleton Loading :**
  ```tsx
  <Suspense fallback={<BentoSkeleton />}>
    <AsyncVitalityWidget userId={user.id} />
  </Suspense>
  ```
* **Imports Dynamiques & Bundle Splitting :**
  ```tsx
  import dynamic from 'next/dynamic';
  const ChartModal = dynamic(() => import('@/components/ChartModal'), { ssr: false });
  ```

---

## 🚀 3. Déploiement Éphémère (Claimable Previews)
* Pour tester un composant ou une landing page en direct :
  `npx vercel --yes` génère une URL de prévisualisation immédiate et partageable.
