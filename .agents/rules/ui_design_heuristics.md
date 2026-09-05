# 📐 Heuristiques de Design & Contraintes Quantifiables (UI/UX Rules)

Ce document constitue la **spécification normative de design produit** pour l'ensemble des applications du Pilier `03_Developpement_App_and_Design`.

---

## 1. 📐 Hiérarchie Visuelle & Échelle Spatiale
* **Règle de la Grille 8pt :** Tous les espacements (`padding`, `margin`, `gap`) et dimensions doivent être strictement des multiples de 4 ou 8 : `4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px`.
  - *Interdiction formelle :* Valeurs impaires ou arbitraires (pas de `13px`, `17px` ou `27px`).
* **Ratio Typographique Strict :**
  - **1 seul `<h1>` par vue.**
  - **Interdiction de sauter des niveaux :** Pas de `<h3>` sans `<h2>` intermédiaire.
  - **Échelle proportionnelle :** Titre principal (20-24px bold), Titre de carte (14-16px semibold), Corps (13-14px regular), Légende/Meta (10-12px muted).
* **Point Focal Unique :** Un seul bouton d'action primaire par écran. Toutes les actions secondaires doivent être `outline` ou `ghost`.

---

## 2. 📱 Affordance & Ergonomie Mobile (Apple HIG & Web)
* **Cibles Tactiles Minimales :** Tout élément cliquable / tappable doit offrir une zone d'interaction minimale de **44 × 44 pt** sur iOS (ou `min-height: 36px` / `padding: 8px 12px` sur Web Desktop).
* **Thumb Zone (Zone du Pouce) :** Les actions critiques et la navigation principale se placent dans le tiers inférieur. Les actions destructives ou réglages secondaires se placent en haut.
* **Safe Areas :** Respect absolu des marges système (barre d'accueil, Dynamic Island, encoches).

---

## 3. 🔄 Le Contrat des 5 États Obligatoires par Composant
Tout composant ou écran affichant des données doit implémenter visuellement ces **5 états** :
1. `Nominal (Success)` : Données présentes, formatées et ordonnées.
2. `Loading (Skeleton)` : Squelettes gris animés calqués exactement sur la géométrie finale (pas de spinner plein écran bloquant).
3. `Empty State` : Icône illustrative + explication en 1 phrase + bouton d'action contextuel clair (ex: *« Aucun contact importé. Glissez un fichier CSV pour démarrer »*).
4. `Error State` : Message explicite, sans jargon technique, accompagné d'un bouton de récupération (*« Réessayer »* ou *« Vérifier le format »*).
5. `Partial / Stale State` : Rendu des données en cache avec indicateur discret de synchronisation en cours.

---

## 4. ✍️ Micro-Copie & UX Writing
* **Labels de Boutons Orientés Action :** Interdiction des libellés passifs ou vagues (*« OK »*, *« Valider »*, *« Soumettre »*). Utiliser impérativement **[Verbe d'action] + [Objet]** (ex: *« Importer les contacts »*, *« Lancer le dispatch »*, *« Télécharger la liste »*).
* **Format Sentence Case :** Majuscule uniquement sur le premier mot pour tous les titres, boutons et labels (ex: *« Paramètres du compte »*, et non *« Paramètres Du Compte »*).
* **Messages d'Erreur Constructifs :** Expliquer le problème et donner la solution immédiate (Éviter : *« Erreur 400 »* ; Préférer : *« La colonne Email est manquante dans votre fichier CSV »*).

---

## 5. ♿ Accessibilité & Adaptabilité
* **Contraste WCAG 2.1 AA :** Ratio minimal de **4,5:1** pour le texte normal et **3:1** pour les textes larges et bordures d'inputs.
* **Support du Dynamic Type :** Les conteneurs doivent s'étendre verticalement sans tronquer le texte si la police s'agrandit.
* **Étiquetage Accessible :** Tout bouton icône seul (fermer ✕, supprimer 🗑️) doit posséder un attribut `aria-label` ou `accessibilityLabel` explicite.
