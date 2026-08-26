# 📁 Studio 01 — Gestion de Fichiers, Ingestion & Hygiène de Données

Ce pôle est responsable de l'organisation documentaire, du triage des flux entrants et de la sécurisation des artefacts multimédias (notes, audios, PDFs, captures).

---

## 🎯 Responsabilités & Processus Opérationnels

1. **Triage et Quarantaine des Médias Entrants** :
   - Tout fichier entrant via Telegram ou API est soumis à la vérification des *Magic Bytes* binaires.
   - Les fichiers non reconnus ou potentiellement corrompus sont isolés dans `Workspace/.quarantine/`.

2. **Étanchéité Pro vs Perso** :
   - `Workspace/inbox_pro/` : Contrats, schémas d'architecture, opportunités business, notes GTM.
   - `Workspace/inbox_perso/` : Journal personnel, idées créatives, protocoles de santé individuels.

3. **Conventions de Nommage & Structuration** :
   - Format standard : `YYYY-MM-DD_<sujet_normalise>.<ext>`
   - Zéro espace, zéro caractère accentué dans les chemins de fichiers.

---

## 🛡️ Règles Locales & Quality Gates
* Interdiction absolue de stocker des fichiers exécutables non validés dans les inboxes.
* Tout fichier indexé doit faire l'objet d'un triplet sémantique horodaté dans `pro_market_graph.json` ou `perso_journal_graph.json`.
