# 📜 DECISIONS — REGISTRE DES ARBITRAGES TECHNIQUES

Ce document consigne les décisions d'architecture immuables pour éviter toute remise en question ou refactorisation superflue.

---

## ADR-001 : Stack Légère & Déterministe (Node.js Native + Vanilla JS)
- **Décision** : Utiliser les modules natifs Node.js (`node:http`, `node:fs`, `node:tls`) pour le backend et du JavaScript Vanilla avec ES Modules pour le frontend.
- **Raison** : Éliminer la fragilité des dépendances, garantir une exécution instantanée (< 200ms) et simplifier le partage de l'application via un simple script `.bat` / `.sh`.
- **Statut** : 🟢 Validé et Immuable.

---

## ADR-002 : Stockage Pures Données Asynchrones (`data/*.json`)
- **Décision** : Aucun SGBD lourd (PostgreSQL, MySQL). Stockage atomique dans des fichiers `data/*.json`.
- **Raison** : Respect strict du Commandement 2 du Master Plan, portabilité totale, inspection humaine directe et zéro coût d'infrastructure.
- **Statut** : 🟢 Validé.

---

## ADR-003 : Runtime Hybride & VM Oracle Cloud (Ampere ARM64)
- **Décision** : Hébergement du service de tracking public (pixels et redirections de clics) et des daemons 24/7 sur une VM Oracle Always Free (Ubuntu 24.04 aarch64). L'application d'envoi peut tourner en local ou sur la VM.
- **Raison** : Fournir une IP publique fixe sans frais mensuels, assurant que les événements de tracking soient captés même quand l'ordinateur local est éteint.
- **Statut** : 🟢 Validé.

---

## ADR-004 : Sécurité SMTP & Délivrabilité Maximale
- **Décision** : Envoi direct via SMTP TLS (Port 465) avec mot de passe d'application Google (16 caractères). Quota plafonné à 28 emails/jour avec intervalle aléatoire de 45 à 120s entre les envois.
- **Raison** : Protection absolue du domaine expéditeur contre le blacklistage et respect des normes anti-spam 2026.
- **Statut** : 🟢 Validé.

---

## ADR-005 : Validation Profonde & Détection Catch-All Active (Zéro Hard Bounce)
- **Décision** : Interdire la validation par simple résolution DNS MX. Obligation d'effectuer un probe SMTP (RCPT TO) et une détection Catch-All (test d'adresse aléatoire inexistante sur le domaine) avant de qualifier une adresse comme `DELIVERABLE`.
- **Raison** : Éliminer les faux positifs sur les domaines "accept-all" et prévenir les Hard Bounces 550 qui détruisent la réputation de l'expéditeur Google.
- **Statut** : 🟢 Validé et Implémenté.

