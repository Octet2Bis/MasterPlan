---
name: pixel-rag
description: RAG visuel et moteur de reverse engineering Vision-to-Code. Analyse une capture d'écran, un site web ou une image d'inspiration pour extraire les surfaces étagées, la palette, la typographie et la grille, puis génère du code de haute précision (HTML/CSS Layers ou SwiftUI).
---

# PIXELRAG — VISION-TO-CODE REVERSE ENGINEERING ENGINE

Ce skill guide l'agent pour reproduire, cloner ou rétro-concevoir une interface utilisateur à partir d'une **image**, d'une **capture d'écran** ou d'un **spécimen visuel**.

Plutôt que d'essayer de scraper le code HTML qui casse fréquemment sous l'effet des obfuscateurs, minificateurs ou protections anti-bot, **PixelRAG** traite l'image comme la source de vérité absolue et en déduit l'arborescence UI et les tokens de design.

---

## 🎯 Quand utiliser ce Skill ?

- Lorsque l'utilisateur fournit une capture d'écran ou un lien vers un visuel et demande : *"Reproduis-moi ce composant"*, *"Recrée ce site"*, *"Fais-moi un écran comme cette image d'inspiration"*.
- Pour analyser la hiérarchie spatiale et la composition d'une interface d'élite (ex: Layers, Fiona UI, DAFES).
- Pour convertir un design mobile/web en code de production Swiss Craft (Vanilla HTML/CSS ou SwiftUI natif).

---

## 🛠️ Protocole d'Exécution Vision-to-Code (3 Étapes)

### Étape 1 : Analyse Géométrique & Extraction des Tokens
Invoquer le moteur PixelRAG :
```bash
node 03_Developpement_App_and_Design/toolbox/pixel_rag_engine.js --specimen "chemin/vers/image.png" --target html
```
Le moteur extrait :
1. **Palette et Surfaces** : Teinte du canvas (`--surface-0`), cartes (`--surface-1`), accents (`--accent`).
2. **Grille Spatiale** : Espacements, paddings, marges calés sur la grille 8px.
3. **Typographie** : Hiérarchie des titres (H1, H2, body) et espacement des lettres (`letter-spacing`).
4. **Composants Structurels** : Navbar, Hero, Bento Grid, Cards, CTA.

### Étape 2 : Alignement avec la Règle Layers UI
Vérifier que le code produit respecte la norme [ui_layers_manus_craft.md](file:///c:/Users/HP/Desktop/Master%20Plan/.agents/rules/ui_layers_manus_craft.md) :
- Zéro dégradé criard ou flou artificiel (*Anti-AI-Slop*).
- Surfaces étagées physiques avec bordure photonique fine (`1px solid rgba(255, 255, 255, 0.08)`).
- Micro-interactions tactiles sous 180ms.

### Étape 3 : Spécimen Autonome & Validation
1. Sauvegarder le résultat dans un fichier spécimen autonome (ex : `specimen_view.html` ou `SpecimenView.swift`).
2. Tester visuellement avec fixtures réelles dans le navigateur ou le simulateur.
3. Valider avec le Quality Gate : `node 03_Developpement_App_and_Design/toolbox/test_code_integrity.js`.
