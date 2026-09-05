# 🛠️ Artisanat iOS, Rigueur HIG & Performance Brute

Ce guide compile les leçons d'ingénierie et d'artisanat logiciel tirées de trois piliers open-source majeurs :
* **[Ranchero-Software/NetNewsWire](https://github.com/Ranchero-Software/NetNewsWire)** : Vitesse brute, simplicité, zéro artifice inutile, respect des HIG.
* **[Dimillian/IceCubesApp](https://github.com/Dimillian/IceCubesApp)** : 100% SwiftUI, micro-interactions, retours haptiques, listes volumineuses temps réel.
* **[wikimedia/wikipedia-ios](https://github.com/wikimedia/wikipedia-ios)** : Passage à l'échelle, accessibilité (VoiceOver/Dynamic Type), internationalisation.

---

## 🏎️ 1. Les 5 Règles de Vitesse Brute (Inspiré de NetNewsWire)

1. **Le Main Thread est Sacré :** Aucune opération d'E/S disque, aucun parsing JSON volumineux, aucun calcul géométrique complexe ne doit toucher le Main Thread.
2. **Pas d'Over-Engineering Visuel :** Éviter les cascades de modificateurs SwiftUI inutiles (`.background`, `.overlay`, `.clipShape` imbriqués 5 fois) qui alourdissent l'arbre de rendu (*Render Tree*).
3. **Poids Binaire Plume :** Préférer les bibliothèques légères et modulaires (SPM) aux frameworks monolithiques encombrants.
4. **Réactivité Immédiate aux Clics :** Le retour visuel ou haptique sur un tap doit se produire en moins de 16 ms (1 frame à 60Hz).
5. **Résilience Réseau & Hors-Ligne :** L'application doit démarrer instantanément et afficher les données en cache local même sans connexion internet.

---

## 🎨 2. Rigueur HIG & Sensibilité Sensorielle (Inspiré d'IceCubesApp)

* **Navigation Intuitive :** Utilisation de `NavigationStack` avec conservation de l'état de défilement.
* **Sensibilité Haptique Contextuelle :** Utiliser des impacts subtils plutôt que des vibrations lourdes qui fatiguent l'utilisateur.
* **Menus Contextuels & Glisser-Déposer :** Offrir des actions rapides via `.contextMenu` et `.swipeActions` sur les lignes de listes.

---

## 🌍 3. Robustesse à l'Échelle (Inspiré de Wikipedia-iOS)

* **Internationalisation Dès le Jour 1 :** Utiliser `String(localized: "cle_texte")` ou `LocalizedStringKey`.
* **Support Bidirectionnel (RTL) :** S'assurer que les layouts ne cassent pas en langues de droite à gauche (Arabe, Hébreu).
* **Isolation Modulaire :** Chaque sous-système (Auth, Base de Données, Synchronisation) doit pouvoir être compilé et testé de manière totalement isolée.
