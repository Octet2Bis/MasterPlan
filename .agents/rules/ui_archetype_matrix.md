# 📐 Matrice des Archétypes UI/UX (Patterns & Squelettes de Navigation)

Ce document régit le choix du squelette structurel de toute interface développée au sein du Master Plan.

---

## 🏛️ Règle Fondamentale de la Porte 0 (Brief)
**Interdiction formelle d'écrire le PRD (Porte 1) ou de coder des vues tant que l'archétype produit n'est pas explicitement sélectionné et validé.**

---

## 🗺️ Les 4 Archétypes Canoniques du Master Plan

### 1. 📊 Archétype 1 : SaaS B2B, Dashboards & Analytics
* **Cas d'Usage :** Cockpit local, Outbound Sniper, simulateurs Web, auditeurs GTM.
* **Squelette de Navigation (Shell) :**
  - Header Bento supérieur ou Sidebar gauche rétractable.
  - Grille modulaire 2 ou 3 colonnes (Bento Grid).
  - Zone de contenu : Data table paginée avec filtres et logs défilants.
* **Composants Clés :** Cartouches KPI avec micro-badges, barres de progression, indicateurs de statut colorés.
* **Références de Patterns :** *Shadcn Blocks / Tremor (implémentés via Tokens CSS natifs sans dépendances lourdes)*.

### 2. 📱 Archétype 2 : Mobile Consumer & iOS Natif (SwiftUI)
* **Cas d'Usage :** Application native `Aevum iOS`.
* **Squelette de Navigation (Shell) :**
  - TabBar persistante dans le tiers inférieur (Thumb Zone).
  - NavigationStack fluide avec `Large Titles` rétractables au scroll.
* **Composants Clés :** Cartes Bento tactiles (min 44 × 44 pt), Sheets modales ascendantes, Timer/Orb respiratoire avec retours haptiques.
* **Références de Patterns :** *SwiftUI Cookbook / Apple Human Interface Guidelines*.

### 3. 🎯 Archétype 3 : Landing Page & Lead Gen
* **Cas d'Usage :** Pages de destination, formulaires de capture, micro-audits CRO.
* **Squelette de Navigation (Shell) :**
  - Header minimaliste (Logo + CTA unique).
  - Section Hero centrée (Proposition de valeur + Preuve visuelle).
  - Grille de fonctionnalités en 3 blocs + Formulaire / CTA sticky.
* **Composants Clés :** Calculatrices interactives, grilles tarifaires comparatives, cartes de témoignages.
* **Références de Patterns :** *Vercel Commerce / Grille Heuristique CRO*.

### 4. 🤖 Archétype 4 : Copilote & Second Cerveau
* **Cas d'Usage :** Assistant personnel, flux de recherche et synthèses documentaires.
* **Squelette de Navigation (Shell) :**
  - Panneau latéral gauche d'historique (collapsible).
  - Fil de lecture principal centré (largeur maximale : 768px).
  - Barre d'entrée flottante en bas de page.
* **Composants Clés :** Blocs d'artéfacts extensibles, citations documentaires avec liens, badges de confiance.
* **Références de Patterns :** *Vercel AI UI Patterns*.
