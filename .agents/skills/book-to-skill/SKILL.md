---
name: book-to-skill
description: Méta-compétence permettant de convertir n'importe quel livre business, technique ou méthodologique (PDF, EPUB, mémo) en un skill exécutable Antigravity structuré (Modèles mentaux, Cheatsheet, Anti-patterns) avec une réduction de 30x à 50x de la consommation de tokens.
---

# 📚 Book to Skill — Méta-Compilateur de Savoir

Ce skill permet de distiller des livres entiers ou des documents techniques denses pour les transformer en **compétences opérationnelles résidentes** dans `.agents/skills/`.

---

## 🏗️ Protocole de Distillation en 4 Étapes

Lorsqu'un livre ou document est fourni (dans `Ressources/Knowledge/books/`) :

1. **Extraction de la Thèse Centrale & des Modèles Mentaux :**
   - Identifier les 3 à 5 concepts clés non négociables introduits par l'auteur.
   - Éliminer toutes les anecdotes narratives, métaphores de remplissage et introductions.

2. **Formulation des Règles Heuristiques (Cheatsheet) :**
   - Condenser les conseils en listes d'actions conditionnelles (*"Si situation X ➔ Appliquer action Y"*).
   - Formuler les équations ou formules mathématiques/stratégiques du livre.

3. **Cartographie des Anti-Patterns :**
   - Extraire ce que l'auteur déconseille formellement (*"Ce que font les débutants vs ce que font les experts"*).

4. **Génération du Fichier `SKILL.md` :**
   - Créer le dossier `.agents/skills/book-<slug>/` et générer le fichier conforme à la syntaxe Antigravity.

---

## 📁 Rangement des Sources & Livrables
* Livres bruts (PDF / EPUB) : Déposés dans `Ressources/Knowledge/books/`.
* Skills générés : Enregistrés dans `.agents/skills/book-<slug>/SKILL.md`.
