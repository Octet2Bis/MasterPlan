# 🎯 Outbound Sniper Studio — Guide d'Installation & Prise en Main

Application autonome locale de prospection ciblée (200 contacts max), vérification de délivrabilité DNS et tracking temps réel des ouvertures et des clics.

---

## 🚀 Démarrage en 1 Clic (Zéro Dépendance Externe)

### Prérequis
* **Node.js** version 18 ou supérieure installée sur votre machine ([nodejs.org](https://nodejs.org/)).

### Lancement
1. Ouvrez un terminal dans ce dossier.
2. Lancez le serveur local :
   ```bash
   npm start
   ```
   *(ou `node server.js`)*
3. Ouvrez votre navigateur sur : **`http://localhost:3000`**

---

## 🗂️ Structure du Package Exportable

* `public/` : Interface Web Bento (Dark Charcoal / Swiss Craft).
* `engine/` : Moteur logique de calcul, vérification DNS et tracking.
* `data/` :
  - `contacts.json` : Vos contacts cibles.
  - `campaigns.json` : Les 6 campagnes et séquences personnalisées.
  - `config.json` : Paramètres d'expéditeur et limites de cadence.
  - `tracking_events.json` : Journal des ouvertures et des clics.

---

## 🛡️ Respect des Règles de Délivrabilité
* **Temporisation aléatoire :** 180s à 300s entre chaque email.
* **Plafond de sécurité :** Maximum 25-30 emails par jour pour protéger votre domaine.
* **Mode Simulation :** Activez le flag `Mode Simulation (Dry-Run)` pour tester l'intégralité du flux sans envoyer de vrais emails.
