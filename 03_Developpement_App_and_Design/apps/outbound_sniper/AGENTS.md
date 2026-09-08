# AGENTS.md — CONTRAT D'EXÉCUTION & ARCHITECTURE POUR ANTIGRAVITY (OUTBOUND SNIPER)

> Design : lire `DESIGN_CONTRACT.md` → extraire `design_system` → charger
> `03_Developpement_App_and_Design/Ressources/Design_System/kits/chamfer-paper-ink/prompt_pack.json`
> et rien d'autre pour le thème.
> Si tu styles sans ce pack, tu es hors contrat.

Ce document constitue la **Loi Fondamentale et le Manuel Opérationnel** pour tout agent Antigravity (ou développeur) intervenant sur l'application **Outbound Sniper Studio**.
Si vous prenez la suite de ce projet sur une nouvelle machine ou dans un nouveau workspace, ce document vous donne toutes les clés pour comprendre, exécuter et faire évoluer le système sans régression.

---

## 🎯 1. Rôle et Philosophie du Produit

**Outbound Sniper** est un studio local de micro-campagnes d'outreach chirurgical (10 à 25 emails/jour max) vers des cibles qualifiées (contacts tièdes, prospects semi-warm, partenariats B2B).
* **Objectif central :** 100% de délivrabilité, 0 passage en spam, 0 pénalité de réputation de domaine.
* **Anti-Pattern banni :** Ce n'est **PAS** un outil de mass mailing (comme Instantly ou Lemlist avec 500 emails/jour). Aucun spamming agressif.
* **Philosophie d'exécution :** Tout tourne en **local avec Node.js natif**, sans dépendance à des plateformes cloud tierces payantes.

---

## 🏛️ 2. Les 6 Commandements Inviolables d'Architecture

1. **Plafond Monolithique Strict (< 250 Lignes par Fichier) :**
   - Interdiction formelle de créer ou d'étendre un fichier `.js` au-delà de **250 lignes**.
   - Tout module approchant 230 lignes doit être découpé selon le principe de Responsabilité Unique (SRP) :
     - `engine/` : Logique métier pure, sans DOM ni HTML.
     - `public/` : Composants UI modulaires (`ui_contacts.js`, `ui_campaigns.js`, `ui_score_checker.js`, etc.).
     - `server.js` : Orchestrateur et routage HTTP (< 210 lignes).
2. **Zéro Dépendance Externe Lourde (Node.js Natif) :**
   - L'application utilise **exclusivement** les modules natifs de Node.js (`http`, `https`, `fs`, `path`, `dns`, `tls`, `crypto`, `url`).
   - Aucun `npm install` requis. L'application doit démarrer instantanément avec `node server.js` sur toute machine disposant de Node.js 18+.
3. **Bannissement de l'Inlining de Données Brutes :**
   - Aucune donnée métier en dur dans le code JS. Tout réside dans `data/*.json`.
4. **Standard Product-to-Pixel & 4 États d'Interface :**
   - Chaque vue doit gérer : `Empty State`, `Loading State`, `Success/Nominal State`, `Error State`.
   - Esthétique imposée : **Swiss Craft / Dark Charcoal** (Palette `#1E1B18`, fond `#FAF9F6`, police Geist/Inter, accent `#10B981`).
5. **Quality Gate Déterministe :**
   - Validation obligatoire avant toute conclusion :
     ```bash
     node 03_Developpement_App_and_Design/toolbox/test_code_integrity.js
     ```
6. **Suivi d'Avancement Déterministe :**
   - Mettre à jour systématiquement [`ROADMAP.md`](ROADMAP.md) au fil des tâches réalisées.

---

## 🗂️ 3. Cartographie Complète des Fichiers

```
outbound_sniper/
├── server.js                          # Serveur HTTP natif & routeur d'API (< 210 L)
├── tokens.css                         # Design tokens Swiss Craft scellés
├── package.json                       # Manifeste projet (zéro external dependencies)
├── start_windows.bat                  # Lanceur 1-clic pour Windows
├── start_mac_linux.sh                 # Lanceur 1-clic pour macOS et Linux
├── AGENTS.md                          # Ce document (guide d'exécution pour l'agent)
├── README.md                          # Documentation complète utilisateur & dev
├── ROADMAP.md                         # Suivi d'avancement pas-à-pas des 6 piliers
│
├── data/                              # Données pures JSON persistées
│   ├── config.json                    # Configuration générale (port 3500, quotas, cadences)
│   ├── config.example.json            # Modèle propre pour initialisation sur nouvelle machine
│   ├── campaigns.json                 # Définition des campagnes et messages
│   ├── campaign_contacts/             # Listes de contacts isolées par campagne
│   ├── senders.json                   # Profils d'expéditeurs et sous-domaines
│   ├── google_auth.json               # Tokens Google OAuth2 persistés
│   ├── disposable_domains.json        # Dictionnaire des domaines jetables bannis
│   ├── email_hygiene_rules.json       # Règles de validation de syntaxe & MX
│   ├── spam_rules.json                # Linter lexical anti-spam & spintax presets
│   └── tracking_events.json           # Journal des ouvertures et clics
│
├── engine/                            # Moteurs de calcul et logique métier pure (< 250 L/fichier)
│   ├── deep_email_verifier.js         # Vérificateur de délivrabilité syntaxe + MX + catch-all
│   ├── deliverability_linter.js        # Linter lexical, détection de spam words & densité de liens
│   ├── domain_deliverability_checker.js# Audit DNS temps réel (SPF, DMARC, MX)
│   ├── link_and_spamcheck_engine.js   # Audit HTTP des liens + API SpamAssassin Postmark
│   ├── smtp_client.js                 # Client SMTP natif Node.js TLS (Google App Password)
│   ├── google_oauth.js                # Flux OAuth2 Google (échange de tokens & envoi Gmail API)
│   ├── hunter_client.js               # Client API Hunter.io (Domain Search & Email Finder)
│   ├── dispatch_manager.js            # Moteur d'envoi cadencé et respect des quotas
│   ├── dispatch_queue.js              # File d'attente d'envoi asynchrone
│   ├── email_pattern_resolver.js      # Résolveur heuristique des patterns de nom (@domaine)
│   ├── sender_manager.js              # Gestionnaire multi-expéditeurs et sous-domaines
│   ├── server_helpers.js              # Utilitaires HTTP, parsing de requêtes et réponses JSON
│   ├── sniper_core_engine.js          # Façade principale d'orchestration
│   └── variable_resolver.js           # Injection des variables de template ({{prenom}}, etc.)
│
└── public/                            # Frontend Web modulaire (< 250 L/fichier)
    ├── index.html                     # Structure HTML épurée en 5 onglets
    ├── styles.css                     # Styles Swiss Craft épurés
    ├── app.js                         # Orchestrateur UI principal
    ├── ui_contacts.js                 # Onglet 1 : Gestion & vérification de la liste
    ├── ui_campaigns.js                # Onglet 2 : Éditeur de message & preview
    ├── ui_score_checker.js            # Onglet 3 : Cockpit de Score Anti-Spam & Mail-Tester
    ├── ui_profile.js                  # Modale de configuration expéditeur & Google OAuth
    └── ui_helpers.js                  # Utilitaires de rendu et notifications toast
```

---

## 🧭 4. Les 6 Piliers Stratégiques & Feuille de Route

Consultez toujours [`ROADMAP.md`](ROADMAP.md) pour connaître l'état précis :
1. **Sous-domaines d'envoi & Lecture des réponses** : modéliser dans `senders.json` et implémenter `inbox_reader.js`.
2. **Authentification Google OAuth2** : guider l'utilisateur pour connecter son compte Google Cloud sans mot de passe d'application.
3. **Tracking fiable (Opens/Clicks)** : pixel transparent et liens réécrits via passerelle VM ou Cloudflare.
4. **Intégration crédits Hunter.io** : interrogation du solde `/v2/account` et recherche d'emails.
5. **Refonte graphique & Navigation** : 5 onglets logiques livrés, maintenir la clarté et l'ergonomie.
6. **Score Anti-Spam (SpamAssassin + Liens + Mail-Tester)** : **100% OPÉRATIONNEL**.

---

## ⚡ 5. Commandes Utiles

* **Démarrer le serveur local :**
  ```bash
  node server.js
  # Accessible sur http://localhost:3500
  ```
* **Vérifier l'intégrité du code (< 250 lignes & JSON valides) :**
  ```bash
  node 03_Developpement_App_and_Design/toolbox/test_code_integrity.js
  ```
* **Créer une archive ZIP autonome :**
  ```bash
  node package_standalone.js
  ```
