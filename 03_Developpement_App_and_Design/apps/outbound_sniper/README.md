# 🎯 Outbound Sniper Studio

**Studio local d'outreach chirurgical B2B, d'audit de délivrabilité et de tracking déterministe.**  
Conçu pour exécuter des micro-campagnes hautement ciblées (10 à 25 emails/jour max) vers des contacts chauds ou tièdes, avec **0 risque de passage en spam** et **préservation absolue de la réputation de domaine**.

---

## ✨ Points Forts & Architecture

* **🚀 Zéro Dépendance NPM Lourde :** Construit à 100% sur les modules natifs de Node.js (`http`, `https`, `tls`, `dns`, `crypto`). Aucun `npm install` requis.
* **🛡️ Cockpit Score Anti-Spam (Postmark SpamAssassin API) :** Analyse instantanée et gratuite du payload MIME brut (seuil déterministe < 2.5).
* **🔗 Contrôleur de Santé des Liens :** Détection automatique des erreurs 404, timeouts et interdiction absolue des raccourcisseurs d'URL (`bit.ly`, etc.).
* **📬 Sandbox Mail-Tester (1 Clic) :** Envoi d'un tir de test en direct vers votre adresse temporaire `mail-tester.com` pour valider votre note sur 10.
* **🌐 Audit DNS Temps Réel :** Vérification synchrone des en-têtes SPF, DMARC et serveurs MX sur les résolveurs publics `8.8.8.8` et `1.1.1.1`.
* **🎲 Cadencement Humain Aléatoire :** Temporisation entre 7 et 15 minutes par envoi avec arrêt automatique à 25-30 emails/jour.
* **🎨 Interface Swiss Craft / Dark Charcoal :** Design sobre, ultra-rapide et découpé en 5 onglets logiques.

---

## ⚡ Démarrage Rapide

### Prérequis
* **Node.js** version 18, 20 ou 22+ installée sur la machine ([nodejs.org](https://nodejs.org/)).

### Sous Windows
Double-cliquez simplement sur le fichier **`start_windows.bat`**.  
Le terminal démarrera le serveur sur le port 3500 et ouvrira automatiquement votre navigateur sur `http://localhost:3500`.

### Sous macOS ou Linux
Dans un terminal :
```bash
chmod +x start_mac_linux.sh
./start_mac_linux.sh
```

*(Ou en ligne de commande directe : `node server.js`)*

---

## ⚙️ Configuration Initiale (`data/config.json`)

Le fichier `data/config.json` pilote l'ensemble des paramètres de sécurité :
```json
{
  "port": 3500,
  "daily_send_limit": 28,
  "min_delay_seconds": 420,
  "max_delay_seconds": 900,
  "sender": {
    "name": "Votre Prénom Nom",
    "email": "votre_adresse@domaine.com",
    "signature": "Votre Signature",
    "app_password": "mot de passe application si gmail"
  }
}
```

---

## 🤖 Pour les Agents IA & Antigravity

Consultez le fichier **[`AGENTS.md`](AGENTS.md)** pour connaître :
* Les 6 commandements d'architecture (notamment le plafond strict de < 250 lignes par fichier JS).
* L'organisation des répertoires (`engine/`, `public/`, `data/`).
* Le Quality Gate automatisé (`node 03_Developpement_App_and_Design/toolbox/test_code_integrity.js`).
* Le suivi des tâches en cours dans **[`ROADMAP.md`](ROADMAP.md)**.
