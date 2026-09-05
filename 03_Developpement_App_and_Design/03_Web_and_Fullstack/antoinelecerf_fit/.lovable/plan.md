## Objectif

Ajouter un widget Google Translate en haut du site permettant de basculer entre Français et Anglais, avec traduction automatique de tout le contenu.

## Estimation crédits

**~1 à 2 crédits** (probablement 1 seul message suffit).

C'est une intégration très légère :
- 1 composant React `<GoogleTranslateWidget />` (~30 lignes)
- 1 ajout de script dans `index.html`
- 1 insertion du widget dans le layout (au-dessus du Hero ou dans une barre fixe)
- Quelques styles pour masquer la barre Google par défaut et harmoniser l'apparence

Aucune refonte du contenu, aucun fichier de traduction à créer, aucune modification de `portfolio.ts`. Google Translate s'occupe de tout côté navigateur.

## Ce qui sera fait

1. Création de `src/components/GoogleTranslateWidget.tsx` qui charge le script Google Translate et expose un sélecteur FR/EN.
2. Ajout du widget en haut de `Index.tsx` (et potentiellement `Contact.tsx` / `MentionsLegales.tsx` si tu veux qu'il soit présent partout — ou via un layout commun).
3. Styles dans `index.css` pour :
   - Masquer la barre/banner Google en haut
   - Aligner le sélecteur avec le design existant (coral / tons du site)

## Limites à connaître

- Qualité = traduction automatique Google (acceptable mais pas parfaite, surtout sur les termes métier comme "CRM", "QA", "Growth" qui resteront tels quels la plupart du temps).
- Le widget Google ajoute une petite mention "Powered by Google Translate".
- SEO : la version anglaise n'est pas indexable (traduction côté client uniquement). Pour du vrai SEO multilingue, il faudrait une vraie i18n (beaucoup plus coûteux en crédits).

## Détails techniques

```text
src/
├── components/
│   └── GoogleTranslateWidget.tsx   (nouveau)
├── pages/
│   └── Index.tsx                   (1 ligne ajoutée)
└── index.css                       (quelques règles CSS)

index.html                          (1 balise <script> ajoutée)
```
