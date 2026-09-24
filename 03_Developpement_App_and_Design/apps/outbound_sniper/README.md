# 🎯 Outbound Sniper Studio

Studio local de micro-campagnes de prospection B2B : import CSV, vérification des adresses, envoi cadencé depuis votre compte Google (API Gmail), suivi des clics.
Pas de mass mailing : quota journalier et délai aléatoire entre deux envois.

Node.js 20+ natif, **zéro dépendance** (`npm install` inutile).

---

## ⚡ Démarrage

```bash
node server.js          # ou : npm start, start_windows.bat, ./start_mac_linux.sh
```
Puis ouvrir **http://localhost:3500**. Le serveur n'écoute que sur `127.0.0.1`.

Au premier lancement, `data/config.json` est créé avec un secret de signature des clics.
Les valeurs par défaut viennent de `data/config.example.json` ; `config.json` ne contient que vos surcharges.

## 🔐 Connecter le compte Google (seul canal d'envoi)

1. Google Cloud Console → créer un projet → activer **Gmail API**.
2. Écran de consentement OAuth (type d'utilisateur) :
   - **Adresse Google Workspace → « Interne »** (recommandé) : aucune validation Google, aucune expiration de l'accès.
   - **Gmail personnel → « Externe »** : en statut « Test », Google fait expirer l'accès au bout de **7 jours** (il faut se reconnecter ; l'app met la campagne en pause en attendant). Pour éviter cela, passez le statut à « En production » : sans validation Google, un écran « application non validée » s'affiche à la connexion, que vous pouvez accepter pour votre propre compte.
3. Identifiants → **ID client OAuth** de type « Application Web ».
   URI de redirection autorisée : `http://localhost:3500/api/auth/google/callback` (affichée dans « Profil & connexions »).
4. Dans l'app : « Profil & connexions » → Client ID + Client Secret → « Se connecter avec Google ».

Portées demandées : `gmail.send`, `userinfo.email`, `userinfo.profile`. Les jetons restent dans `data/google_auth.json` (ignoré par git) et ne sont jamais renvoyés au navigateur.

## ✅ Vérification des adresses : ce que signifie chaque statut

| Statut | Signification | Envoyé ? |
|---|---|---|
| `VERIFIED` | Le serveur mail a accepté la boîte **et** refusé une adresse aléatoire (ou Hunter.io l'a validée) | Oui |
| `UNVERIFIED` | MX valide mais boîte non prouvable (port 25 sortant bloqué, refus lié à votre IP, réponse non concluante, DNS indisponible) | Seulement si « Inclure les adresses non prouvées » |
| `CATCH_ALL` | Le domaine accepte n'importe quelle adresse : existence non prouvée | Idem |
| `ROLE_ACCOUNT`, `RISKY` | Adresse générique (contact@…) ou ancien domaine FAI | Non |
| `INVALID_MAILBOX`, `NO_MX`, `DISPOSABLE`, `INVALID` | Boîte refusée, domaine sans MX, jetable, syntaxe | Non |

La sonde SMTP n'envoie jamais de message (`RCPT TO` puis `QUIT`). Un refus n'est lu comme « boîte inexistante » que si le serveur le dit explicitement (code 5.1.x ou message clair) ; un refus lié à votre IP (liste noire, 5.7.x) reste `UNVERIFIED`. La plupart des FAI et des clouds **bloquent le port 25 sortant** : dans ce cas tout sort en `UNVERIFIED`, c'est normal. Cochez alors « Compléter avec Hunter.io » (clé dans le profil, consomme des crédits).

## 🖱️ Suivi des clics

- Les **ouvertures ne sont pas mesurées** : les proxys d'images (Apple Mail Privacy Protection, Gmail) les rendent non fiables, et un pixel dégrade la délivrabilité.
- Un clic n'est mesurable que via une **passerelle publique** : `gateway/tracking_gateway.js`, à déployer sur votre VM :
  ```bash
  TRACKING_SECRET=<tracking.secret de data/config.json> PORT=3000 node gateway/tracking_gateway.js
  ```
  Placez-la derrière un reverse proxy HTTPS sur un sous-domaine (ex. `https://clics.votredomaine.com`). Un lien en IP brute ou en HTTP est pénalisé par les filtres anti-spam : le contrôle avant envoi le signale.
- Les liens sont **signés (HMAC)** : la passerelle refuse toute cible non signée, ce qui empêche la redirection ouverte. Le journal des clics n'est lisible qu'avec le secret.
- Le filtre anti-robots (user-agent) est indicatif : certains scanners de sécurité imitent un navigateur.

## 🛡️ Garde-fous à l'envoi

Le diagnostic DNS (MX, SPF, DKIM, DMARC) distingue « absent » (prouvé par le DNS, pénalisé) et « indéterminé » (panne ou délai DNS, sans pénalité).

Le **contrôle avant envoi** est rejoué par le serveur au lancement. Il bloque si :
- aucun compte Google n'est connecté (sauf en simulation) ;
- l'objet ou le corps est vide, ou la phrase d'opposition (« répondez stop ») est absente ;
- une variable `{{…}}` n'a pas de valeur pour un contact (utilisez `{{variable|texte par défaut}}`) ;
- un secret apparaît dans le message ;
- le suivi des clics est activé avec une passerelle absente ou locale.

Ensuite :
- **Quota** : `daily_send_limit` par jour, compté uniquement sur les envois réels réussis (la simulation n'y touche pas).
- **Cadence** : délai aléatoire entre `min_delay_seconds` et `max_delay_seconds`, pendant les `working_hours`.
- **Coupe-circuit** : arrêt sur erreur Gmail fatale (authentification, quota Google).
- **Limite connue** : un rebond (adresse inexistante) arrive plus tard par email. Il n'est pas détecté automatiquement, faute de lecture de la boîte de réception (voir `STATE.md`).

## ⚙️ Configuration (`data/config.json`, surcharge de `config.example.json`)

| Clé | Défaut | Rôle |
|---|---|---|
| `host`, `port` | `127.0.0.1`, `3500` | Écoute du serveur local |
| `daily_send_limit` | `28` | Envois réels maximum par jour |
| `min_delay_seconds` / `max_delay_seconds` | `420` / `900` | Délai aléatoire entre deux envois |
| `working_hours` | 08:30–18:30, lun.–ven. | Plage d'envoi (heure locale) |
| `sender.name`, `sender.signature` | vide | Nom affiché et signature (éditables dans le profil) |
| `tracking.vm_tracking_url` | vide | URL publique de la passerelle de clics |
| `tracking.secret` | généré | Secret HMAC partagé avec la passerelle |
| `hunter.api_key` | vide | Clé Hunter.io (optionnelle) |

## 🗂️ Structure

```
server.js                 Orchestrateur HTTP : garde de sécurité, routage, clics, fichiers statiques
api/                      Routes : routes_campaigns.js (config, Google, campagnes, contacts, Hunter), routes_delivery.js (audits, envoi, stats)
engine/                   Logique métier sans DOM : store, google_oauth, dispatch_manager, deep_email_verifier,
                          email_pattern_resolver, hunter_client, mail_composer, tracking, preflight_scanner,
                          deliverability_linter, domain_deliverability_checker, link_and_spamcheck_engine, variable_resolver
gateway/                  Passerelle publique de clics (VM)
public/                   Interface (Vanilla JS, 5 onglets)
data/                     Référentiels versionnés (*.json) + état local ignoré par git (config, contacts, jetons, clics)
tests/                    Tests de non-régression (npm test)
```

## 🧪 Tests

```bash
npm test    # ou : node 03_Developpement_App_and_Design/toolbox/test_outbound_hunter_sent.js
```
Aucun appel réseau externe : faux serveur SMTP local, données dans un dossier temporaire (`SNIPER_DATA_DIR`). Les tests tournent aussi en CI (`quality_gates.yml`).
