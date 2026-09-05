# 🗺️ ROADMAP & FEUILLE DE ROUTE OPÉRATIONNELLE — OUTBOUND SNIPER

Document de référence et registre d'exécution pas-à-pas. 
Chaque point est coché et documenté au fur et à mesure de sa validation technique et ergonomique.

---

## 📌 Registre d'Avancement Global

| # | Chantier Stratégique | Statut | Priorité | Fichiers Clés |
| :-: | :--- | :-: | :-: | :--- |
| **1** | **Sous-domaines d'envoi & Lecture des réponses** | 🟡 En cours | Haute | `engine/sender_manager.js`, `engine/inbox_reader.js`, UI |
| **2** | **Authentification Google OAuth2 (Tutoriel & Config)** | 🟡 En cours | Haute | `engine/google_oauth.js`, Guide pas-à-pas |
| **3** | **Tracking fiable & haute fidélité (Passerelle VM 24/7)** | 🟢 Opérationnel & Déployé | Haute | VM Oracle (`88.96.57.168:3000`), `ui_performance.js` |
| **4** | **Intégration & Quotas de crédits Hunter.io** | 🟢 Opérationnel & Intégré | Moyenne | `engine/hunter_client.js`, `public/ui_profile.js`, UI |
| **5** | **Refonte graphique & Navigation ergonomique** | 🟢 V1 Livrée (5 Onglets) | Haute | `public/index.html`, `public/styles.css` |
| **6** | **Score Anti-Spam (Postmark SpamAssassin + Mail-Tester)** | 🟢 Opérationnel & Vérifié | Haute | `engine/link_and_spamcheck_engine.js`, `public/ui_score_checker.js` |

---

## 📋 Détail Opérationnel des 6 Chantiers

### 1. 📬 Sous-domaines d'envoi & Réception des Réponses
- [ ] **Modélisation des sous-domaines dans `senders.json`** : regrouper plusieurs adresses sous un même domaine (ex: `antoine@contact.entreprise.com`, `contact@contact.entreprise.com`).
- [ ] **Sélecteur d'expéditeur par micro-campagne** : assignation dynamique de l'expéditeur au moment du paramétrage de l'envoi.
- [ ] **Module de lecture des réponses (Inbox / IMAP ou Gmail API)** :
  - Interrogation périodique de la boîte de réception pour détecter les retours.
  - Détection automatique des réponses positives, questions et désabonnements ("Stop").
  - Désactivation automatique des relances pour tout prospect ayant répondu.

### 2. 🔐 Authentification Google OAuth2 (Zéro Mot de Passe d'App)
- [ ] **Rédaction du tutoriel pas-à-pas officiel Google Cloud 2026** (Écran de consentement, Scopes `gmail.send` & `gmail.readonly`, Identifiants Web, URIs de redirection autorisées).
- [ ] **Validation du flux d'échange de jetons en local** (`/api/auth/google/callback`).
- [ ] **Affichage du profil connecté dans l'UI** (Avatar, Email vérifié, Statut du token).

### 3. 🎯 Tracking Fiable & Passerelle VM Cloud 24/7
- [x] **Déploiement de la passerelle de tracking sur la VM Oracle Always Free (`88.96.57.168:3000`)** :
  - Endpoint `/t/open` : Pixel 1x1 GIF invisible avec en-têtes `no-cache` et de-duplication.
  - Endpoint `/t/click` : Redirection 302 instantanée et horodatage de la cible.
  - Endpoint `/api/tracking/events` : Exposition de l'API de synchronisation.
  - Endpoint `/api/tracking/ping` : Vérification de liaison temps réel depuis le studio local.
- [x] **Bouclier Anti-Bot Shield** : Détection et étiquetage automatique des robots de sécurité (GoogleImageProxy, BingPreview, Proofpoint, Barracuda, etc.) pour ne pas fausser le taux de clic et d'ouverture humain.
- [x] **Synchronisation 1-clic & flux en direct dans l'onglet 5** : Récupération des événements distants, calcul du CTR et journal d'activité chronologique avec export CSV des Hot Leads.

### 4. 🔍 Intégration & Gestion des Crédits Hunter.io
- [x] **Affichage du solde de crédits restants en direct dans le profil & topbar** (Appel API Hunter `/v2/account` restituant recherches dispo, vérifications dispo et date de renouvellement).
- [x] **Garde-fou Poka-Yoke de consommation de crédits** : utilisation prioritaire du résolveur DNS/MX local gratuit, recours à Hunter uniquement si le pattern est inconnu ou ambigu.
- [x] **Enrichissement des fiches contacts via l'API Hunter Email Finder** : détection automatique lors du test de pattern avec étiquette dédiée `🎯 Hunter.io Finder`.

### 5. 🎨 Refonte Graphique & Navigation Fluide
- [x] **En-tête épuré Swiss Craft** avec jauge de délivrabilité et statut du quota.
- [x] **Découpage en 5 onglets logiques** (Contacts, Message, Score Anti-Spam, Envoi, Performances).
- [ ] **Navigation latérale (Sidebar) ou Workflow guidé** pour éliminer tout sentiment de fouillis.
- [ ] **Fiche contact enrichie** : historique des interactions (ouvert, cliqué, répondu) directement dans le tableau.

### 6. 🧪 Score Anti-Spam & Délivrabilité (SpamAssassin + Liens + Mail-Tester)
- [x] **Moteur SpamAssassin automatisé (API Postmark Spamcheck)** : analyse du payload MIME en direct sans clé d'API, calcul de la note et restitution des pénalités actives.
- [x] **Vérificateur de santé des liens** : détection automatique des codes HTTP 404, timeouts et interdiction absolue des raccourcisseurs de liens (`bit.ly`, etc.).
- [x] **Ajout d'un bloc "Test Réel Mail-Tester"** dans l'onglet Score Anti-Spam avec champ d'adresse temporaire et lien direct.
- [x] **Bouton d'action "🚀 Envoyer à Mail-Tester"** : expédie le template réel avec signature et en-têtes via `/api/send-test`.
