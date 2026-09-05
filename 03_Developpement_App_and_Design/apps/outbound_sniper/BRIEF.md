# 🚪 PORTE 0 : FICHE DE CADRAGE & ANTI-SCOPE (BRIEF.md)

**Nom du Projet :** Outbound Sniper Studio (Instantly-like Local-First & VM Tracking)  
**Emplacement :** `03_Developpement_App_and_Design/apps/outbound_sniper/`  
**Statut :** 🟢 Validé & Scellé (Porte 0)

---

## 1. 🎯 Le Problème n°1 Résolu
Permettre à un opérateur de piloter des micro-campagnes de prospection ciblées (200 contacts max) depuis une adresse Google Workspace Pro avec vérification DNS préalable, séquences personnalisées à haute conversion, et tracking d'ouvertures/clics 24/7 relié à une VM distante, sans abonnement SaaS externe.

---

## 2. 👤 Persona Cible & Contexte d'Usage
* **Persona :** Fondateur, Business Developer ou Opérateur Tiers.
* **Contexte :** 
  - *Phase 1 :* Calibré en local sur l'ordinateur de travail, connecté à la VM pour le tracking public.
  - *Phase 2 :* Package exportable prêt à être déployé sur une nouvelle VM pour un tiers sans compétences techniques.

---

## 3. 🚫 L'Anti-Scope (Les No-Gos Stricts)
* ❌ **Pas d'envois massifs sans temporisation :** Cadence obligatoire de 180s à 300s entre chaque email.
* ❌ **Pas de dépendance cloud payante :** Tracking autonome via micro-service HTTP sur VM.
* ❌ **Pas de formats fermés :** Support universel des imports `.csv` et `.xlsx` (Excel).
* ❌ **Pas de saturation de boîte mail :** Coupe-circuit automatique à 28/30 envois/jour.

---

## 4. ⏱️ Appétit & Périmètre
* **Format :** Application Web Locale / Hybride VM.
* **Composants :** UI Bento 4 Panneaux (Import & DNS, Studio 6 Campagnes, Dispatcher Google, Tracking Live & 3 Exports).

---

## 5. 💻 Plateforme Cible & Livrable
* **Runtime :** Node.js 20+ (Windows, macOS, Linux / VM Debian/Ubuntu).
* **Package :** Dossier autonome exportable avec `package.json`, `server.js`, `public/`, `data/`, `README_INSTALL.md`.
