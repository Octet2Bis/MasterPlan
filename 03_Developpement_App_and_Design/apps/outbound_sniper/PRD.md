# 🚪 PORTE 1 : PRD COMPORTEMENTAL & MODÉLISATION DES DONNÉES (PRD.md)

**Application :** Outbound Sniper Studio  
**Méthode :** Fiona Product-to-Pixel  
**Statut :** 🟢 Validé (Porte 1)

---

## 1. 👤 User Stories & Scénarios Gherkin (Given-When-Then)

### Scénario 1 : Import & Détection Automatique des Colonnes
* **Story :** *En tant qu'opérateur, je veux glisser un fichier CSV ou Excel pour charger mes contacts sans formater manuellement les colonnes.*
* **Given :** L'utilisateur est sur l'écran d'import (État Vide).
* **When :** L'utilisateur dépose un fichier `.csv` ou `.xlsx` avec des en-têtes français ou anglais (*Courriel*, *First Name*, *Company*).
* **Then :** Les contacts sont normalisés dans le tableau, le compteur s'actualise, et chaque contact est prêt pour la vérification.

### Scénario 2 : Vérification DNS Cascade avec Animation par Ligne
* **Story :** *En tant qu'opérateur, je veux voir l'état d'analyse en direct pour chaque contact afin d'identifier les adresses risquées.*
* **Given :** Le tableau contient 200 contacts en statut `PENDING`.
* **When :** L'utilisateur clique sur *« 🛡️ Vérifier Délivrabilité »*.
* **Then :** Chaque ligne affiche un spinner/pulsation pendant la résolution MX, puis s'actualise avec son badge de score (*Délivrable 95%*, *Jetable 0%*, *Erreur MX 20%*).

### Scénario 3 : Dispatch Sécurisé & Coupe-Circuit Préventif
* **Story :** *En tant qu'opérateur, je veux que l'envoi s'arrête automatiquement avant d'atteindre le plafond Google pour protéger mon domaine.*
* **Given :** Une campagne prête avec 50 contacts validés et un quota quotidien de 30 emails.
* **When :** Le 28ème email est expédié.
* **Then :** Le dispatcheur déclenche une mise en pause préventive automatique, enregistre l'index du contact, et affiche une alerte ambre explicite.

### Scénario 4 : Tracking Live & Téléchargement des 3 Listes
* **Story :** *En tant qu'opérateur, je veux télécharger des listes segmentées pour relancer uniquement les prospects engagés.*
* **Given :** Des événements d'ouverture et de clics enregistrés dans le dashboard.
* **When :** L'utilisateur clique sur *« 📥 Exporter Ouvreurs »* ou *« 📥 Exporter Cliqueurs »*.
* **Then :** Un fichier CSV filtré est généré et téléchargé instantanément dans son navigateur.

---

## 2. 🗺️ Cartographie des 4 États d'Interface

| Composant | 1. Empty State (Vide) | 2. Loading State (Attente) | 3. Success State (Nominal) | 4. Error State (Actionnable) |
| :--- | :--- | :--- | :--- | :--- |
| **Zone d'Import** | Dropzone en pointillés avec icône + modèle CSV | Animation de parsing du fichier | Tableau affichant la liste des contacts | Alerte rouge : *« Fichier illisible ou colonne email manquante »* |
| **Lignes Contacts** | Badge gris : `En attente` | Spinner animé + pulsation bleu cyan | Badge vert : `Délivrable (95%)` | Badge rouge : `Invalide (0%)` |
| **Studio 6 Campagnes** | Texte : *« Sélectionnez une campagne »* | Transition d'affichage du template | Prévisualisation avec tags `{{prenom}}` | Alerte ambre : *« Variables non renseignées »* |
| **Dispatcheur** | Bouton inactif tant que 0 contact validé | Compte à rebours temporisé (ex: 210s) | Badge vert : *« Campagne terminée »* | Alerte ambre : *« Pause de sécurité : Quota 28/30 »* |
| **Tracking & Exports** | Compteurs à 0 + message d'attente | Animation des chiffres au rafraîchissement | KPIs colorés + 3 boutons d'export actifs | Alerte si déconnexion du flux d'événements |

---

## 3. 📊 Contrats de Données Pures (`data/*.json`)

1. `data/config.json` : Expéditeur, base URL du tracking (local ou VM), temporisation, seuil de coupure.
2. `data/campaigns.json` : Les 6 templates et angles neuro-comportementaux.
3. `data/contacts.json` : Modèle normalisé des contacts cibles.
4. `data/tracking_events.json` : Journal des ouvertures et clics.
