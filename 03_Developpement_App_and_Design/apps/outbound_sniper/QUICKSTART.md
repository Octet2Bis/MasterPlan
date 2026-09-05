# 🚀 GUIDE D'INSTALLATION & PRISE EN MAIN — OUTBOUND SNIPER STUDIO

Bienvenue sur **Outbound Sniper Studio** !  
Cette application est conçue pour piloter des campagnes de prospection ciblées ultra-qualitatives depuis un compte Google Workspace Pro ou un sous-domaine dédié, sans risque de brûler votre domaine ni dépendance à un abonnement SaaS.

---

## ⚡ Installation & Démarrage en 1-Clic

### Prérequis (1 minute) :
* Avoir installé **Node.js** (version 20 ou supérieure recommandée) depuis [nodejs.org](https://nodejs.org/).

### 💻 Sur Windows :
1. Faites un simple **double-clic** sur :
   ```text
   start_windows.bat
   ```
2. Le serveur démarre et votre navigateur s'ouvre automatiquement sur `http://localhost:3000`.

### 🍎 Sur macOS ou Linux :
1. Ouvrez un terminal dans le dossier et lancez :
   ```bash
   chmod +x start_mac_linux.sh
   ./start_mac_linux.sh
   ```
2. Votre navigateur s'ouvre automatiquement sur `http://localhost:3000`.

---

## 🛠️ Utilisation en 4 Étapes Clés

### 1. Sélection ou Création de la Campagne (Listes Dédiées)
* Dans l'onglet **1. Contacts**, sélectionnez votre campagne active.
* Glissez votre fichier `.csv` ou `.xlsx`. Chaque campagne possède son propre fichier de contacts isolé.
* Cliquez sur **« Valider la délivrabilité »** : l'algorithme teste la syntaxe, filtre les domaines jetables et vérifie les enregistrements MX.

### 2. Choix de l'Expéditeur & Sous-Domaine Anti-Brûlure
* Dans le bandeau supérieur, choisissez l'identité d'envoi :
  - **Compte Maître** (`contact@votredomaine.com`)
  - **Sous-domaine de chauffe** (`antoine@outbound.votredomaine.com`)
* Le badge vert/ambre vous indique si les entrées DNS (SPF, MX) de votre sous-domaine sont valides.

### 3. Connexion Google Workspace (Mot de passe d'application)
* Dans l'onglet **3. Envoi & Sécurité**, renseignez votre email Google Workspace et votre mot de passe d'application 16 caractères (obtenu sur *Compte Google ➔ Sécurité ➔ Mots de passe des applications*).
* Cliquez sur **« Tester la connexion »** pour valider le handshake SMTP direct (Port 465 SSL).

### 4. Lancement Désynchronisé & Coupe-Circuit 28/j
* Choisissez d'activer ou non le **Mode simulation** pour valider la séquence sans expédier.
* Cliquez sur **« Démarrer l'envoi »**.
* **Protection Poka-Yoke :** Le dispatcheur applique une cadence humaine (180s à 300s) et se met en **pause automatique dès 28 emails** envoyés dans la journée, protégeant ainsi la réputation de votre boîte mail.

---

## 🔒 Sécurité & Confidentialité
* **100% Local-First :** Aucune donnée, aucun contact et aucun identifiant ne transitent par un serveur tiers. Tout reste stocké localement dans vos fichiers `data/`.
