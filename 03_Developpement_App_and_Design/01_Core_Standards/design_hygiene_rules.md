# 💎 Standards d'Hygiène UI/UX, Design System & Accessibilité

Ce document définit les **règles d'hygiène visuelle et ergonomique immuables** applicables à tous les projets de l'écosystème (iOS, Web, Mobile).

---

## 🎨 1. Règle du Design Luxury & Bento Grid
* **Palette HSL Maîtrisée :** Toujours privilégier des fonds sombres profonds (`#070A11`, `#0E1422`, `#141C2E`) avec des bordures subtiles (`#1E2B45`) et des accents néon ciblés (`#38BDF8` Cyan, `#34D399` Émeraude, `#A78BFA` Violet, `#F59E0B` Ambre).
* **Hiérarchie Visuelle à 3 Niveaux :**
  1. *Niveau 1 (Hero Metric / Primary Action) :* Chiffre géant, bouton luminescent principal avec gradient.
  2. *Niveau 2 (Bento Cards & Widgets) :* Informations secondaires bien compartimentées avec séparateurs discrets.
  3. *Niveau 3 (Métadonnées & Badges) :* Typographies légères, textes atténués (`#94A3B8`, `#64748B`), tags arrondis.
* **Rayons de Courbure Harmoniques :** Cartes = `22-24px`, Boutons = `14-16px`, Pastilles/Pills = `999px`.

---

## ♿ 2. Accessibilité & Standards de Rigueur (Inspiré de Wikipedia-iOS)
* **Support Exhaustif de Dynamic Type :**
  * Interdiction des hauteurs de conteneurs de texte fixes qui coupent les polices agrandies.
  * Utilisation systématique de polices relatives (`.font(.system(.body, design: .rounded))` en SwiftUI).
* **VoiceOver & Navigation Accessible :**
  * Chaque élément interactif ou icône sans texte doit avoir un label d'accessibilité explicite (`.accessibilityLabel("Lancer le micro-défi")`).
  * Les éléments purement décoratifs doivent être masqués à l'arbre d'accessibilité (`.accessibilityHidden(true)`).
* **Contraste WCAG AAA :** Ratio de contraste minimal de 7:1 pour le texte normal et 4.5:1 pour le grand texte.

---

## ⚡ 3. Retours Haptiques & Micro-Interactions (Inspiré d'IceCubesApp)
* **Feedback Haptique Synchrone :**
  * `UIImpactFeedbackGenerator(style: .light)` : Clics sur des boutons secondaires, sélections dans des listes.
  * `UIImpactFeedbackGenerator(style: .medium)` : Début et fin d'une action, transition de phase de timer.
  * `UINotificationFeedbackGenerator(type: .success)` : Accomplissement d'un défi, validation de paiement.
* **Fluidité 120Hz ProMotion :**
  * Zéro blocage du thread principal (Main Thread). Tout décodage ou calcul lourd doit s'exécuter en tâche de fond.
