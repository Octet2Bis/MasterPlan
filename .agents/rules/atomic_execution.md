# Protocole d'Exécution Atomique & Cadrage Consultatif (Anti-Déviation)

## 1. Principe Fondamental : Zéro Anticipation Prématurée (Atomic Slices)
L'agent a l'interdiction formelle de coder plusieurs briques fonctionnelles ou créatives en une seule passe. 
Chaque idée complexe doit être découpée en micro-jalons unitaires vérifiables.

## 2. Règle du Plafond Monolithique (< 250 Lignes)
Aucun fichier de code ne doit dépasser 250 lignes. Les données sont isolées dans `data/*.json`, les moteurs dans `engine/*.js`, et l'orchestration dans `app.js`.

## 3. Le Sas de Questionnement Systématique (Gate Questioning)
Avant d'écrire la moindre ligne de code sur une idée créative, d'UI/UX ou de parcours complexe :
1. **Poser 1 à 2 questions de cadrage ciblées** pour clarifier les ambiguïtés, le tempo ou les choix de design.
2. **Attendre la réponse ou la validation du jalon** avant de modifier les fichiers.

## 4. Règle du Check Binaire & Quality Gate Obligatoire
- L'agent ne passe **JAMAIS** au jalon $N+1$ sans que le Quality Gate automatisé (`test_code_integrity.js` ou `test_quality_gates.py`) ait confirmé 0 erreur.
- Pas de fonctionnalités « bonus », pas de composants parasites non demandés.
- Priorité absolue à la stabilité et à la fidélité chirurgicale de la brique en cours.
