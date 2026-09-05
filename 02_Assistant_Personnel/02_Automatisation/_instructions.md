# ⚡ Studio 02 — Automatisation, Bots & Ingestion Multicanale (Hermes)

Ce pôle pilote les services d'arrière-plan, les adaptateurs d'ingestion multicanale (Telegram, notes vocales, webhooks) et la mise à jour déterministe des graphes de connaissances du Second Cerveau.

---

## 🧰 Services & Moteurs Actifs

* **[hermes_adapter.js](file:///c:/Users/HP/Desktop/Master%20Plan/02_Assistant_Personnel/02_Automatisation/hermes_adapter.js)** : Moteur d'extraction de triplets sémantiques et de relations `(Observation) -[mentions]-> (Entité)` alimentant `Workspace/pro_market_graph.json` et `perso_journal_graph.json`.
* **[telegram_bots_service.js](file:///c:/Users/HP/Desktop/Master%20Plan/02_Assistant_Personnel/02_Automatisation/telegram_bots_service.js)** : Démon Node.js d'écoute bi-canal durci (< 140 lignes, Whitelist Fail-Closed, Écritures atomiques Mutex, Magic Bytes).
* **[core/coach_engine.js](file:///c:/Users/HP/Desktop/Master%20Plan/02_Assistant_Personnel/02_Automatisation/core/coach_engine.js)** : Moteur de coaching interactif 3x3 (Rituels Matin, Respiration Midi / Aevum, Décharge Soir, Bilan Hebdo).
* **[core/meeting_ingestor.js](file:///c:/Users/HP/Desktop/Master%20Plan/02_Assistant_Personnel/02_Automatisation/core/meeting_ingestor.js)** : Connecteur d'ingestion Meetily (< 170 lignes, parsing des réunions, extraction d'engagements & push Telegram).
* **[core/atomic_graph_store.js](file:///c:/Users/HP/Desktop/Master%20Plan/02_Assistant_Personnel/02_Automatisation/core/atomic_graph_store.js)** : Stockage JSON thread-safe avec écriture atomique (.tmp -> rename) et Mutex Queue.
* **[core/session_store.js](file:///c:/Users/HP/Desktop/Master%20Plan/02_Assistant_Personnel/02_Automatisation/core/session_store.js)** : Persistance sécurisée de la session 2FA PIN (24h) sur disque.
* **[core/security_guard.js](file:///c:/Users/HP/Desktop/Master%20Plan/02_Assistant_Personnel/02_Automatisation/core/security_guard.js)** : Contrôle d'accès Fail-Closed, inspection Magic Bytes, quotas 25 Mo et sanitisation des chemins.
* **[core/link_enricher.js](file:///c:/Users/HP/Desktop/Master%20Plan/02_Assistant_Personnel/02_Automatisation/core/link_enricher.js)** : Scraper OpenGraph léger avec tagging `untrusted_external` anti-prompt-injection.
* **[hermes_entity_rules.json](file:///c:/Users/HP/Desktop/Master%20Plan/02_Assistant_Personnel/Ressources/Knowledge/hermes_entity_rules.json)** : Référentiel Couche 3 des entités et mots-clés reconnus (Aevum, Transit DA, Jarvis, Antoine, Longévité, GTM).
* **[coach_prompts_catalog.json](file:///c:/Users/HP/Desktop/Master%20Plan/02_Assistant_Personnel/Ressources/Knowledge/coach_prompts_catalog.json)** : Catalogue pur JSON des exercices de rédaction socratique et protocoles somatiques.
* **[meetily_config.json](file:///c:/Users/HP/Desktop/Master%20Plan/02_Assistant_Personnel/Ressources/Knowledge/meetily_config.json)** : Configuration déclarative du connecteur Meetily (inbox, archive, marqueurs d'actions).

---

## 🛡️ Règles Locales & Sécurité
* Zéro secret en dur dans le code : lecture exclusive depuis `02_Assistant_Personnel/.secrets/.env`.
* Les observations brutes sont normalisées et associées à une entité canonique sans saturation mémoire.
* Plafond strict : tout nouveau script d'automatisation doit rester sous 250 lignes (SRP).
