# 🚫 NON_GOALS — ANTI-SCOPE & LIMITES EXPLICITES

Ce document liste formellement les fonctionnalités, frameworks et optimisations prématurées strictement interdits sur Outbound Sniper.

---

1. **Pas de Frameworks JS Lourds (React, Next.js, Vue, Angular)** : L'application reste en Vanilla JS + modules ES natifs. L'ajout de bundlers complexes (Webpack, Vite) est exclu.
2. **Pas de Base de Données Relationnelle Lourde (PostgreSQL, MySQL, Prisma)** : Le stockage reste en fichiers `data/*.json` déterministes.
3. **Pas de "Mass Mailing" de Masse (> 30 emails/jour)** : L'outil est un outil de prospection chirurgicale (Sniper). Tout contournement des quotas journaliers de sécurité est interdit.
4. **Pas de Stockage des Mots de Passe Google Principaux** : Seuls les mots de passe d'application dédiés (16 caractères) sont acceptés.
5. **Pas de Fichiers Dépassant 250 Lignes** : Toute nouvelle fonctionnalité doit être modularisée en sous-composants ou services dédiés.
