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

### 5. 🏛️ Archétype 5 : Portfolio d'Ingénieur, Studio Lab & Manifeste Éditorial
* **Cas d'Usage :** Portfolio personnel `antoinelecerf.fit`, vitrines d'innovation, manifestes de marque et galeries de lab.
* **Squelette de Navigation (Shell) :**
  - Header minimaliste (Identité typographique + statut live de disponibilité + navigation épurée).
  - Section Hero monumentale asymétrique (H1 56px-72px + ratio 4:1 + visualiseur interactif WebGL/ASCII/Brik).
  - Grille éditoriale à grand souffle (Negative Space >= 40%) mettant en scène les projets réels sans cartes génériques.
* **Composants Clés :** Titrages éditoriaux acérés (`Space Grotesk`, `Instrument Serif`, `Syne`), bichromies ou accords rares, micro-interactions cinétiques douces.
* **Références de Patterns :** *AIGA Eye on Design / Swiss International Style / Layers.to*.

### 6. 📦 Archétype 6 : Catalogue d'Artéfacts, Studio Store & Galerie Produit
* **Cas d'Usage :** Boutiques de templates, catalogues d'outils digitaux, vitrines de livrables et galeries d'assets pour le Master Plan.
* **Squelette de Navigation (Shell) :**
  - Sélecteur typographique continu (*Inline Editorial Row*) avec catégories en phrase horizontale (`Favourites, Mockups, Decks, Tools, All`).
  - Grille rigoureuse 3 colonnes desktop (`border-radius: 0px`, ratio 4:3 strict).
  - Footer institutionnel sobre.
* **Composants Clés :** Cartes d'artéfacts 4:3 à fond studio `#E5E5E5` avec micro-interaction de survol (backstage crossfade), triade titre / créateur / prix, zéro ombre floue.
* **Références de Patterns :** *The Brand Identity Store (TBI) / Swiss Modernist Catalog*.
