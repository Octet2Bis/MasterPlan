---
name: gtm-watchtower-radar
description: Surveille les évolutions technologiques IA et GTM (délivrabilité DMARC/M365, algorithmes de recherche générative AEO/GEO, Consent Mode v2 GTM) et génère des rapports périodiques d'audit de santé des outils. À utiliser dans 02_Assistant_Personnel/ et 01_GTM_Growth/.
---

# 📡 GTM Watchtower Radar — Veille Stratégique IA & Audit de Pérennité

Ce skill assure la surveillance active des évolutions technologiques pour garantir qu'aucun changement de protocole (email, IA, tracking) ne vienne rendre nos outils obsolètes.

---

## 🔍 Les 4 Pôles de Surveillance
1. **Délivrabilité & Sécurité Email :** Normes SPF/DKIM/DMARC, politiques anti-spam Google/Yahoo/M365.
2. **Recherche Générative (AEO/GEO) :** Évolutions des modèles de citation de Perplexity, ChatGPT Search et Claude.
3. **Data & Consentement :** Normes Google Consent Mode v2, RGPD, mises à jour GA4 et DataLayer.
4. **Outillage IA & LLMs :** Nouveaux frameworks agentiques et dépréciations d'APIs.

---

## 🛠️ Exécution & Livrables
* Pour générer un rapport de santé des outils :
  `python 02_Assistant_Personnel/03_Recherche_et_Veille/gtm_ai_watchtower.py`
* Le livrable est archivé dans :
  `01_GTM_Growth/Workspace/newsletters/watchtower_radar_<date>.md`
