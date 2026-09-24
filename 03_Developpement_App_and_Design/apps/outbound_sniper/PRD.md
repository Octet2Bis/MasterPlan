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

### Scénario 2 : Vérification des adresses sans faux positif
* **Story :** *En tant qu'opérateur, je veux savoir quelles adresses sont prouvées, afin de ne jamais envoyer vers une boîte inexistante.*
* **Given :** Le tableau contient des contacts en statut `PENDING`.
* **When :** L'utilisateur clique sur *« Vérifier les adresses »*.
* **Then :** Chaque ligne passe en `VERIFIED` (preuve SMTP ou Hunter), `UNVERIFIED`/`CATCH_ALL` (non prouvée), ou un statut invalide. Seules les `VERIFIED` sont envoyées par défaut.

### Scénario 3 : Envoi cadencé et arrêt au quota
* **Story :** *En tant qu'opérateur, je veux que l'envoi s'arrête au quota journalier pour protéger mon domaine.*
* **Given :** Une campagne avec 50 contacts vérifiés et `daily_send_limit` = 28.
* **When :** Le 28ᵉ email réel est envoyé.
* **Then :** Le dispatcheur passe en `PAUSED_SAFETY` et l'affiche. Une simulation ne consomme pas le quota.

### Scénario 4 : Suivi des clics et export des cliqueurs
* **Story :** *En tant qu'opérateur, je veux relancer uniquement les prospects qui ont cliqué.*
* **Given :** Des clics signés captés par la passerelle et synchronisés.
* **When :** L'utilisateur clique sur *« Exporter les cliqueurs »*.
* **Then :** Un CSV des contacts ayant cliqué (clics probablement humains) est téléchargé.

---

## 2. 🗺️ Cartographie des 4 États d'Interface

| Composant | 1. Empty State (Vide) | 2. Loading State (Attente) | 3. Success State (Nominal) | 4. Error State (Actionnable) |
| :--- | :--- | :--- | :--- | :--- |
| **Zone d'Import** | Dropzone en pointillés avec icône + modèle CSV | Animation de parsing du fichier | Tableau affichant la liste des contacts | Alerte rouge : *« Fichier illisible ou colonne email manquante »* |
| **Lignes Contacts** | Badge : `À vérifier` | Badge : `Vérification…` | Badge vert : `Vérifiée` | Badge rouge : `Boîte inexistante` / `Domaine sans MX` |
| **Éditeur de message** | Champs vides | Aperçu en cours | Aperçu résolu pour le contact choisi | Alerte : *« Variable manquante pour ce contact »* |
| **Dispatcheur** | *« Aucun contact éligible »* | Compte à rebours jusqu'au prochain envoi | *« Fin de la campagne »* | *« Envoi bloqué : … »* / *« Quota journalier atteint »* |
| **Clics & exports** | Compteurs à 0 + *« Aucun clic »* | Synchronisation en cours | Envoyés, cliqueurs, taux de clic | *« Passerelle non joignable »* |

---

## 3. 📊 Contrats de données (`data/`)

1. `config.example.json` (versionné) : valeurs par défaut ; `config.json` (local) : surcharges utilisateur et `tracking.secret`.
2. `campaigns.json` : campagnes (`subject`, `body`, `cta_label`, `target_url`, `track_clicks`).
3. `campaign_contacts/<id>.json` (local) : contacts normalisés d'une campagne et leur statut de vérification ou d'envoi.
4. `tracking_events.json` (local) : clics synchronisés (`CLICK`, `is_bot`, `target_url`).
5. Référentiels : `disposable_domains.json`, `email_hygiene_rules.json`, `spam_rules.json`, `tracking_rules.json`.
