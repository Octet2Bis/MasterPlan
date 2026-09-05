# 📐 Bible Normative Anti-IA-Slop & Standard Swiss Craft

Ce document constitue la **Loi Visuelle Fondamentale** pour toute interface développée au sein du Master Plan.
Tout code généré violant ces principes sera rejeté par le linter de conformité `test_code_integrity.js`.

---

## 🚫 1. Les 6 Interdictions Absolues (Zéro Tolérance)

1. ❌ **Interdiction des Émojis dans l'UI :** Aucun émoji (`🚀`, `🎯`, `🛡️`, `📂`, `🔥`, etc.) ne doit figurer dans les boutons, titres, tableaux ou badges. Utiliser exclusivement les micro-icônes SVG géométriques de `Ressources/Design_System/icons/`.
2. ❌ **Interdiction des Couleurs Primaires Brutes & Néons :** Bannir le noir pur `#000000`, le vert fluo `#00FF00` ou le bleu criard `#0000FF`. Utiliser uniquement les échelles perceptuelles CIELAB (Tokyo Basalt, Forest Jade, Electric Iris, Warm Ochre).
3. ❌ **Interdiction des Lueurs Factices (Glow Néon) :** Interdiction des `box-shadow` luminescents colorés qui dégradent le rendu. Les surfaces doivent être mates avec des bordures de 1px nettes.
4. ❌ **Interdiction des Titres Sensationnalistes :** Bannir le jargon pseudo-scientifique (*"Sniper"*, *"Neuro-Comportemental"*, *"Super-IA"*). Utiliser un vocabulaire d'ingénierie sobre (*« Campagnes »*, *« Séquences »*, *« Validation DNS »*).
5. ❌ **Interdiction des Chiffres Flottants :** Tout affichage numérique (tableaux, compteurs, pourcentages) doit activer les chiffres tabulaires (`font-feature-settings: 'tnum' 1`) pour empêcher les sauts de pixels lors des chargements.
6. ❌ **Interdiction des Libellés Passifs :** Interdiction des libellés vagues (*« OK »*, *« Valider »*, *« Soumettre »*). Utiliser impérativement **[Verbe d'action] + [Objet]** en Sentence case (ex: *« Importer les contacts »*, *« Démarrer l'envoi »*).

---

## 🎨 2. Palette Radix Non-Générique (Tokyo Basalt)

| Token Sémantique | Code Hex / RGBA | Rôle Visuel |
| :--- | :--- | :--- |
| `--bg-canvas` | `#090B10` | Fond d'écran profond, zéro fatigue oculaire |
| `--surface-card` | `#11141D` | Surface de carte étagée (Niveau 1) |
| `--surface-card-hover`| `#171B26` | État survol / focus des cartes |
| `--surface-input` | `#0D0F15` | Fond des champs et zones de données (Niveau 0) |
| `--border-subtle` | `#222A3A` | Séparateurs de tableaux et bordures de cartes |
| `--accent-primary` | `#5E6AD2` | Bouton d'action focal unique (Electric Iris) |
| `--accent-success` | `#29A366` / `#3DD68C` | Statut validé / délivrable (Forest Jade) |
| `--accent-warning` | `#EB9004` / `#FFB224` | Avertissement / seuil de quota (Warm Ochre) |
| `--accent-error` | `#E5484D` / `#FF6B6B` | Erreur DNS / fichier corrompu (Crimson Rust) |
| `--text-primary` | `#F1F5F9` | Typographie principale blanche nette |
| `--text-secondary` | `#8D9CB8` | Métadonnées et descriptions secondaires |

---

## 🔤 3. Pairing Typographique Fontjoy & Propriétés OpenType

* **Titres & En-têtes :** `Plus Jakarta Sans`, graisses 600/700, `letter-spacing: -0.02em`.
* **Interface & Corps :** `Inter`, graisses 400/500/600, `line-height: 1.6`.
* **Données Techniques & Logs :** `JetBrains Mono`, graisses 500/600.
* **Propriétés CSS Obligatoires sur l'Interface :**
  ```css
  font-feature-settings: 'tnum' 1, 'cv05' 1, 'cv11' 1;
  ```

---

## 🚪 4. Porte 2 du Protocole : Validation Anti-Slop Obligatoire
Aucune vue ne peut être validée en Porte 2 ou 3 si elle ne passe pas le linter automatisé Poka-Yoke dans `test_code_integrity.js`.
