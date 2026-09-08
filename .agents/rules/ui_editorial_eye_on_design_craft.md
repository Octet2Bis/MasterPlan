# 🏛️ Doctrine Graphique Éditoriale & Typographie de Caractère (ui_editorial_eye_on_design_craft.md)

Ce document constitue la **loi de direction artistique et d'élégance visuelle** du Master Plan.
Inspiré de l'école suisse internationale et de la sensibilité graphique d'**AIGA Eye on Design**, il fournit le vocabulaire plastique pour concevoir des Hero sections, portfolios et manifestes à forte personnalité, sans jamais tomber dans les tics génériques de l'IA (*AI Slop*).

---

## 📐 1. Les 4 Duos Typographiques Éditoriaux (Google Fonts 100% Gratuits)

L'utilisation d'Inter ou de Roboto comme police de titrage principale est proscrite pour tout projet de vitrine ou de marque.

| Archétype Graphique | Police Display (H1/H2) | Police Interface / Corps | Police Données & Code | Rendu & Caractère |
| :--- | :--- | :--- | :--- | :--- |
| **A. Grotesque Suisse Radicale** *(Défaut Studio)* | `Space Grotesk` (800, `-0.04em`) | `Plus Jakarta Sans` (400/500) | `JetBrains Mono` | Rigueur moderniste, brutalité contenue, autorité technique. |
| **B. Haute Couture Éditoriale** *(Prestige & Réflexion)* | `Instrument Serif` (Italic 400, `-0.02em`) | `Inter` (400, `line-height: 1.6`) | `Fragment Mono` | Contraste dramatique entre humanisme littéraire et rigueur produit. |
| **C. Constructiviste Monumental** *(Lab & Manifeste)* | `Syne` (700/800, uppercase, `+0.04em`) | `Work Sans` (400/600) | `Space Mono` | Posture d'avant-garde, tension d'affiche géométrique. |
| **D. Organique Humaniste** *(Aevum Longévité)* | `Epilogue` (700, `-0.03em`) | `Plus Jakarta Sans` (400/600) | `JetBrains Mono` | Chaleur biomécanique, sérénité scientifique, clarté vitale. |

---

## 🎨 2. Les 4 Palettes d'Accords Rares (Haute Tension Chromatique)

Interdiction formelle d'utiliser la triade paresseuse "Fond blanc + Gris neutre + Bouton bleu SaaS `#2563EB`".

### 🔴 Accord 1 : Swiss International (Bichromie Affiche)
* **Toile :** Papier lin `#F7F7F5` (Light) ou Dark Carbon `#0E1015` (Dark).
* **Accent Flamme :** Rouge International Klein `#FF3B00` (Saturation pure, zéro dégradé).
* **Encre :** Noir graphite profond `#111318`.
* **Usage :** Portfolios d'ingénieurs, pages de garde manifestes.

### 🧪 Accord 2 : Acid Chartreuse & Obsidian (Tech Organique)
* **Toile :** Obsidian profond `#0B0D11` avec reflets carbone `#161B22`.
* **Accent Luminescent :** Acid Chartreuse `#D4F63C` ou Vert Olive Néon `#A3E635`.
* **Texte Titane :** `#F9FAFB` (Contraste 16:1 certifié).
* **Usage :** Aevum iOS/Web, cockpits de performance, Live Activities.

### 🍷 Accord 3 : Merlot Éditorial & Crème Papier (Prestige Historique)
* **Toile :** Crème vierge `#F9F8F6` ou Noir Merlot `#09070A`.
* **Surfaces :** Lie-de-vin dense `#4A1525`.
* **Accents :** Carmin d'alerte `#D9383A` et Champagne brossé `#D4AF37`.
* **Usage :** Second cerveau, propositions B2B institutionnelles, rapports de synthèse.

### 🌌 Accord 4 : Cobalt Risographie & Lilas Fumé
* **Toile :** Craie `#F4F5F8` ou Bleu Minuit `#070B14`.
* **Accent Maître :** Cobalt électrique `#1D4ED8`.
* **Teinte de Soutien :** Lilas fumé `#C4B5FD` (badges, tags secondaires).
* **Usage :** Outbound Sniper, tracking analytique, flux de données.

---

## 🏛️ 3. Les 3 Règles de Composition en « Tension Affiche »

1. **Le Ratio Monumental H1 / Body (4:1 minimum) :**
   Le titre H1 ne doit pas être tiède. Il doit dominer l'espace avec une taille comprise entre **48px et 72px** sur desktop (`line-height: 1.05`), créant un saut d'échelle net avec le premier paragraphe (`15px` - `16px`).
2. **L'Asymétrie Contrôlée & Ligne de Fuite :**
   Bannir le centrage automatique de tous les blocs de texte. Aligner le propos fort sur la gauche avec une colonne vide ou un élément visuel interactif en flottaison décalée (orb, capture 3D, télémétrie en direct).
3. **Le Silence Graphique Actif (Negative Space $\ge$ 40%) :**
   Le vide n'est pas un espace perdu, c'est le cadre qui donne du prix à la donnée. Toute section Hero doit préserver au moins 40% de surface libre respirante, débarrassée de cartes ou de séparateurs superflus.

---

## 🛡️ 4. Garde-Fou Poka-Yoke : L'Équilibre Inviolable Produit-to-Pixel

* L'audace graphique d'*Eye on Design* ne doit **jamais** compromettre les **4 états d'UI déterministes** (*Empty, Loading, Nominal, Error*).
* Le contraste de texte doit impérativement respecter le ratio minimal **WCAG AA (4.5:1 pour le corps, 3:1 pour les grands titres)**.
* Toute interaction conserve la courbe cinétique de craft : `transition: all 160ms cubic-bezier(0.16, 1, 0.3, 1)`.
