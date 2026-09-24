# AUDIT — OUTBOUND SNIPER (2026-09-24)

> Base auditée : `main@8c4b006` (8 septembre). Tout travail non poussé depuis n'est pas couvert.
> Méthode : lecture intégrale de `server.js`, `engine/`, `public/*.js`, `data/`, docs ; croisement front ↔ routes ;
> vérification en exécution sur une copie jetable (aucune donnée du repo modifiée).
> Quality gates au moment de l'audit : `test_code_integrity.js` ✅ 137/137, `test_outbound_hunter_sent.js` ✅ 5/5.
> Les gates passent, mais ils ne couvrent aucun des défauts P0 ci-dessous.

---

## 1. Inventaire

50 fichiers, 6 514 lignes : 15 modules `engine/` (2 279 L), 8 fichiers JS UI (1 747 L), `index.html` (657 L),
`styles.css` + `tokens.css` (850 L), 12 documents Markdown, 6 fichiers `data/`.

Chaîne de valeur réellement utilisée :
**Import CSV → Vérification → Éditeur de message → Envoi cadencé (quota/jour) → Tracking.**

---

## 2. Défauts P0 — sécurité et intégrité (vérifiés en exécution)

| # | Défaut | Preuve | Conséquence |
|---|---|---|---|
| P0-1 | Envoi LIVE sans identifiants = faux succès | `smtp_client.js:120` renvoie `success: true` si mot de passe vide | Contacts marqués `SENT` sans qu'aucun email ne parte |
| P0-2 | Le mode simulation consomme le quota réel | `dispatch_manager.js:112-117` incrémente `global_sent_today` en dry-run | Un test à blanc bloque les vrais envois du jour |
| P0-3 | La sonde SMTP / détection catch-all ne s'exécute jamais | `deep_email_verifier.js:108-115` teste `127.0.0.1:25` sans handler `connect` → toujours `false`, même port ouvert | Tout domaine avec MX sort `VERIFIED 85`. L'ADR-005 (« Implémenté ») est faux. Le résolveur de patterns « confirme » `prenom.nom` sur tout domaine Google Workspace (score 95 sans sonde) → risque de hard bounces |
| P0-4 | Les valeurs par défaut à l'import neutralisent le garde-fou variables | `ui_helpers.js:119-125` injecte `Contact` / `Entreprise` / `Directeur` | Email envoyé « Bonjour Contact, » au lieu d'un blocage |
| P0-5 | Secrets exposés à n'importe quel site web | `GET /api/config` renvoie mot de passe d'application + clé Hunter ; `GET /api/auth/google/status` renvoie `client_secret` + refresh token ; `Access-Control-Allow-Origin: *` sur toutes les réponses ; écoute sur toutes les interfaces | Une page web ouverte pendant que l'app tourne peut lire les identifiants Gmail |
| P0-6 | Modification de config cross-site (CSRF) | `parseBody` parse du JSON quel que soit le `Content-Type` ; `POST text/plain` accepté | Vérifié : `daily_send_limit` passé à 500 depuis une origine tierce |
| P0-7 | XSS par le contenu du CSV | `ui_contacts.js:115-136` injecte `email` / `entreprise` en `innerHTML` | Un CSV tiers peut exécuter du JS dans l'app (qui peut envoyer des emails) |

## 3. Défauts P1 — fonctionnels

| # | Défaut | Emplacement |
|---|---|---|
| P1-1 | Le pré-vol lit `campaign.template_body` (inexistant) : le corps n'est jamais analysé | `preflight_scanner.js:20` |
| P1-2 | `data/config.json` absent du repo → un clone neuf tourne sur le port 3000 alors que les scripts ouvrent 3500 ; valeurs par défaut dispersées en 4 endroits | `server.js:16`, `sniper_core_engine.js:34-39`, `dispatch_manager.js:21-25`, docs |
| P1-3 | `.xlsx` accepté par le sélecteur mais lu comme du texte ; le parseur CSV casse sur les virgules entre guillemets | `index.html:174`, `ui_helpers.js:107,116` |
| P1-4 | Le code du serveur de tracking de la VM vit dans `aevum_ios/web_preview/tracking_router.js` ; le `/t/open` local ne filtre pas les bots ; la campagne existante est en `stealth_mode` (tracking désactivé) | hors dossier de l'app |
| P1-5 | Contacts d'une campagne sans fichier = 15 premiers de `contacts.json` (fallback implicite) | `sniper_core_engine.js:62-63` |
| P1-6 | MIME SMTP : HTML seul sans partie texte, base64 non replié à 76 car., `From` sans nom ; Gmail API déclare `7bit` avec de l'UTF-8 | `smtp_client.js:186-198`, `google_oauth.js:104-109` |
| P1-7 | Postmark en échec = `isPassing: true` (fail-open) | `link_and_spamcheck_engine.js:111-120` |
| P1-8 | `dns.setServers` global au chargement du module (effet de bord sur tout le process) | `domain_deliverability_checker.js:12` |
| P1-9 | Quota `28` codé en dur dans les logs et l'UI | `dispatch_manager.js:117`, `app.js:117,125` |
| P1-10 | Export CSV tronqué au premier `#` (`encodeURI` sur data-URL) | `ui_helpers.js:63` |

---

## 4. Code mort et doublons (suppression sans changement de comportement)

| Élément | Lignes | Motif |
|---|---|---|
| `engine/dispatch_queue.js` | 203 | Jamais importé ; doublon de `dispatch_manager.js` |
| Routes `/api/preview`, `/api/hunter/verify`, `/api/hunter/find`, `/api/deliverability/audit-sender` | ~15 | Aucun appel du front |
| `verifyContact`, `generatePatternCandidates`, `auditCampaignVariables` (core) ; `VariableResolver.auditCampaign` / `extractVariables` ; `SenderManager.deleteSender` | ~60 | Aucun appelant |
| `package-lock.json` | 14 | Zéro dépendance |
| `data/contacts.json` + fallback associé | — | Voir P1-5 |
| Résolution de variables dupliquée front/back (`resolveFrontVariables` vs `VariableResolver`) et pré-vol vs `VariableResolver` | — | 3 implémentations divergentes de la même règle |

## 5. Documentation : 12 fichiers contradictoires

Contradictions relevées : port (3000 / 3500), cadence (45-120 s / 180-300 s / 420-900 s), quota (25-30 / 28 / 30),
thème (« Dark Charcoal » dans `AGENTS.md` app vs « Paper & Ink » dans `DESIGN_CONTRACT.md`), fichiers fantômes
(`ui_dispatch.js`, `setup_oracle_vm.sh`, `inbox_reader.js`, `senders.json`), promesses non tenues (xlsx, ADR-005,
« 100 % local » alors que l'app appelle Microsoft, Postmark, Hunter et Google). `STATE.md` date du 1er septembre.

Cible proposée (12 → 6) :

| Garder | Fusionner dedans | Supprimer |
|---|---|---|
| `BRIEF.md`, `PRD.md`, `DESIGN_CONTRACT.md` (portes) | — | — |
| `README.md` | `README_INSTALL.md`, `QUICKSTART.md`, `MAP.md` | les 3 sources |
| `DECISIONS.md` | `NON_GOALS.md` | la source |
| `STATE.md` | `ROADMAP.md` | la source |
| `AGENTS.md` (allégé : renvoie à la racine, ne recopie pas les commandements) | — | — |

## 6. Fonctionnalités à arbitrer (non nécessaires au cœur)

| Fonctionnalité | Coût | Avis |
|---|---|---|
| « Télémétrie Google Leak » (dwell time, placement prédit Principale/Promotions) | ~50 L + UI | Heuristiques sans base mesurable présentées comme prédictions → supprimer, garder le linter lexical |
| Sonde Microsoft `GetCredentialType` | ~25 L | Endpoint non officiel, limité en débit ; utile mais fragile |
| Double chemin d'envoi OAuth Gmail API + SMTP mot de passe d'app | ~290 L | En garder un seul |
| Hunter.io | ~150 L + UI | Seule vérification réelle possible si le port 25 sortant est bloqué (cas le plus courant) |
| Multi-expéditeurs / sous-domaines | ~110 L + UI | À moitié implémenté (ROADMAP 🟡) |
| Tracking VM + sync | ~90 L + code hors dossier | Décider : tracking oui/non (défaut actuel = furtif) |
| Spintax | ~40 L | Faible valeur à 28 envois/jour |
| Packaging tiers (`package_standalone.js`, `.bat`, `.sh`) | ~130 L | Phase 2 du BRIEF, pas le besoin actuel |

---

## 7. Plan proposé

1. **Lot 1 : nettoyage pur** (§4 + §5). Aucun changement de comportement ; gates relancés.
2. **Lot 2 : correctifs P0**, chacun avec son test de non-régression dans `test_outbound_hunter_sent.js`.
3. **Lot 3 : périmètre**, selon les arbitrages du §6, puis correctifs P1 sur ce qui reste.

---

## 8. Résolution (2026-09-24)

Arbitrages : envoi via Google OAuth uniquement, Hunter.io conservé, suivi des clics conservé.
Règle appliquée : **ce qui prétend fonctionner est rendu fonctionnel, remplacé, ou retiré.**
Chaque correctif P0 est couvert par un test (`tests/`, 21 tests, exécutés en CI).

| # | Traitement |
|---|---|
| P0-1 | SMTP supprimé. `sendGmailMessage` renvoie un échec fatal sans compte connecté. Le serveur refuse un envoi réel sans compte |
| P0-2 | La simulation ne touche plus au quota ; quota vérifié aussi au lancement |
| P0-3 | Vraie sonde SMTP sur le MX (RCPT TO boîte + adresse aléatoire). `VERIFIED` seulement sur preuve, sinon `UNVERIFIED`/`CATCH_ALL`. Sonde Microsoft non officielle retirée. Hunter en complément sur demande |
| P0-4 | Plus aucune valeur par défaut à l'import. Contrôle avant envoi bloquant, rejoué par le serveur au lancement |
| P0-5 | Aucun secret renvoyé au navigateur, CORS supprimé, écoute sur 127.0.0.1 |
| P0-6 | Écritures : Host local, Origin identique et JSON obligatoires |
| P0-7 | Échappement systématique dans l'UI et dans les emails |
| P1-1 | Le contrôle avant envoi lit `body`, respecte `{{var|défaut}}`, bloque sans opt-out |
| P1-2 | Défauts uniquement dans `config.example.json` (`engine/store.js`) ; port 3500 partout |
| P1-3 | `.xlsx` retiré (CSV UTF-8) ; parseur CSV RFC 4180 |
| P1-4 | Pixel d'ouverture supprimé ; liens signés HMAC ; passerelle autonome `gateway/tracking_gateway.js` ; filtre anti-robots partagé |
| P1-5 | Fallback `contacts.json` supprimé |
| P1-6 | MIME Gmail : texte + HTML en base64 replié à 76 caractères, nom d'expéditeur encodé, `List-Unsubscribe` |
| P1-7 | Postmark en panne = « indisponible », jamais « conforme » |
| P1-8 | Résolveur DNS dédié, sans effet de bord global |
| P1-9 | Quota lu dans la configuration partout |
| P1-10 | Export CSV via Blob |
| §4 | Code mort supprimé (`dispatch_queue.js`, routes et méthodes inutilisées, `package-lock.json`, `package_standalone.js`) ; `sender_manager.js` retiré (un seul expéditeur : le compte Google) |
| §5 | Documentation 12 → 8 : `README`, `DECISIONS` (+ non-objectifs), `STATE` (+ feuille de route), `AGENTS` allégé, `BRIEF`/`PRD` corrigés, `DESIGN_CONTRACT`, cet audit |
| §6 | « Télémétrie Google Leak » et placement prédit retirés ; DKIM (sélecteur google) ajouté au diagnostic ; spintax conservé (fonctionnel) |

Reste ouvert (voir `STATE.md`) : détection des rebonds et réponses, qui exige le scope `gmail.readonly`.
