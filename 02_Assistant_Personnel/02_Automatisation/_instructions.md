# ⚡ Studio 02 — Automatisation, Bots & Ingestion Multicanale (Hermes)

Ce pôle pilote les services d'arrière-plan, les adaptateurs d'ingestion multicanale (Telegram, notes vocales, webhooks) et la mise à jour déterministe des graphes de connaissances du Second Cerveau.

---

## 🧰 Services & Moteurs Actifs

* **[hermes_adapter.js](file:///c:/Users/HP/Desktop/Master%20Plan/02_Assistant_Personnel/02_Automatisation/hermes_adapter.js)** : Moteur d'extraction de triplets sémantiques et de relations `(Observation) -[mentions]-> (Entité)` alimentant `Workspace/pro_market_graph.json` et `perso_journal_graph.json`.
* **[telegram_bots_service.js](file:///c:/Users/HP/Desktop/Master%20Plan/02_Assistant_Personnel/02_Automatisation/telegram_bots_service.js)** : Démon Node.js d'écoute bi-canal durci (Whitelist Telegram ID, PIN 2FA 24h, inspection Magic Bytes, rate limiting).
* **[hermes_entity_rules.json](file:///c:/Users/HP/Desktop/Master%20Plan/02_Assistant_Personnel/Ressources/Knowledge/hermes_entity_rules.json)** : Référentiel Couche 3 des entités et mots-clés reconnus (Aevum, Transit DA, Jarvis, Antoine, Longévité, GTM).

---

## 🛡️ Règles Locales & Sécurité
* Zéro secret en dur dans le code : lecture exclusive depuis `02_Assistant_Personnel/.secrets/.env`.
* Les observations brutes sont normalisées et associées à une entité canonique sans saturation mémoire.
* Plafond strict : tout nouveau script d'automatisation doit rester sous 250 lignes (SRP).
