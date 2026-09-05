# Guide d'Intégration Typographique Mosaic Type (Swiss Craft & Transit)

## 📌 Contexte & Origine
Inspiré par le générateur **Mosaic Type Generator** (`jumy0ung/mosaic-type-generator`), ce standard applique l'esthétique des carrelages en mosaïque du métro de New York (NYC Subway Lettering) au design system **Dark Charcoal / Swiss Craft** d'Aevum.

---

## 🎨 Spécifications Graphiques (Tokens de Rendu)
* **Taille de carreau de référence :** `6px × 6px` avec un rayon de bordure de `1px` (`tile_radius_px: 1`).
* **Espacement (Gap) :** `2px` constant.
* **Palette de Carreaux :**
  - Fond de matrice : `#0D0F12` (Surface 1)
  - Carreau inactif : `#242B35` (Surface 2 / Bordure)
  - Carreau actif (Lettre) : `#E5E7EB` (Texte Primaire)
  - Carreau d'accentuation : `#10B981` (Vert Végétal / Vitalité Aevum)

---

## 🚀 Cas d'Usage dans Aevum & GTM
1. **Hero Header Landing Page :** Titrage `AEVUM` en mosaïque SVG vectorisée, poids < 4 Ko, 0 dépendance JavaScript au runtime.
2. **Badges de Vitalité & Bio-Age :** Affichage signalétique du score (`BIO-AGE 24`) sur les widgets Bento.
3. **Pochettes de Décompression :** Vignettes graphiques pour les 12 protocoles de santé.
