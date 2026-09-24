# 🚪 PORTE 0 : FICHE DE CADRAGE & ANTI-SCOPE (BRIEF.md)

**Nom du Projet :** Outbound Sniper Studio (local-first, suivi des clics via VM)  
**Emplacement :** `03_Developpement_App_and_Design/apps/outbound_sniper/`  
**Statut :** 🟢 Validé & Scellé (Porte 0)

---

## 1. 🎯 Le Problème n°1 Résolu
Permettre à un opérateur de piloter des micro-campagnes de prospection ciblées (200 contacts max) depuis un compte Google (API Gmail), avec vérification préalable des adresses, messages personnalisés et suivi des clics 24/7 via une passerelle sur VM, sans abonnement SaaS externe.

---

## 2. 👤 Persona Cible & Contexte d'Usage
* **Persona :** Fondateur, Business Developer ou Opérateur Tiers.
* **Contexte :** 
  - *Phase 1 :* Calibré en local sur l'ordinateur de travail, connecté à la VM pour le tracking public.
  - *Phase 2 (non commencée) :* installation guidée pour un tiers.

---

## 3. 🚫 L'Anti-Scope (Les No-Gos Stricts)
* ❌ **Pas d'envois massifs sans temporisation :** délai aléatoire entre deux emails (`min_delay_seconds`–`max_delay_seconds`, 7 à 15 min par défaut).
* ❌ **Pas de dépendance cloud payante :** suivi des clics via une passerelle HTTP autonome sur VM (Hunter.io reste optionnel).
* ❌ **Pas de formats fermés :** import `.csv` (UTF-8). Depuis Excel : enregistrer en CSV.
* ❌ **Pas de saturation de boîte mail :** quota journalier (`daily_send_limit`, 28 par défaut), compté sur les envois réels.

---

## 4. ⏱️ Appétit & Périmètre
* **Format :** Application Web Locale / Hybride VM.
* **Composants :** UI en 5 onglets (Contacts & vérification, Message, Diagnostic, Envoi, Clics).

---

## 5. 💻 Plateforme Cible & Livrable
* **Runtime :** Node.js 20+ (Windows, macOS, Linux ; passerelle de clics sur VM Ubuntu).
* **Livrable :** dossier autonome (`server.js`, `api/`, `engine/`, `public/`, `data/`, `gateway/`), démarrage par `node server.js`.
