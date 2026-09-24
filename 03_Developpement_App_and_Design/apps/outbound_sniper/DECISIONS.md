# 📜 DECISIONS — ARBITRAGES TECHNIQUES & NON-OBJECTIFS

Règle transverse (2026-09-24) : **ce qui prétend fonctionner doit fonctionner, être remplacé, ou être retiré.**

---

## ADR-001 : Stack légère (Node.js natif + Vanilla JS)
- **Décision** : modules natifs Node.js 20+ côté serveur, JavaScript Vanilla côté interface, zéro dépendance npm.
- **Raison** : démarrage immédiat, aucune dépendance fragile.
- **Statut** : 🟢 Validé.

## ADR-002 : Stockage en fichiers `data/*.json`
- **Décision** : pas de SGBD. Référentiels versionnés dans `data/` ; état local (`config.json`, contacts, jetons, clics, quota) ignoré par git. Accès centralisé dans `engine/store.js`.
- **Statut** : 🟢 Validé.

## ADR-003 : La VM n'héberge que la passerelle de clics
- **Décision** : l'application tourne en local. Seule `gateway/tracking_gateway.js` est déployée sur une VM publique (Oracle Always Free), derrière un reverse proxy HTTPS sur un sous-domaine.
- **Raison** : un clic doit être capté même quand l'ordinateur local est éteint.
- **Statut** : 🟢 Validé (révisé le 2026-09-24).

## ADR-004 : Envoi uniquement via Google OAuth2 + API Gmail
- **Décision** : le client SMTP avec mot de passe d'application est supprimé. Un envoi sans compte connecté échoue, sans jamais simuler un succès.
- **Raison** : un seul canal à maintenir, aucun mot de passe stocké. L'ancien client renvoyait « succès » sans identifiants.
- **Statut** : 🟢 Validé (remplace l'ancien ADR-004 SMTP).

## ADR-005 : `VERIFIED` uniquement sur preuve
- **Décision** : une adresse est `VERIFIED` seulement si le MX accepte la boîte et refuse une adresse aléatoire, ou si Hunter.io la valide. Sinon : `UNVERIFIED` ou `CATCH_ALL`, exclues de l'envoi par défaut.
- **Raison** : l'ancienne sonde ne s'exécutait jamais et marquait « délivrable » toute adresse dont le domaine avait un MX.
- **Statut** : 🟢 Validé et testé (`tests/engine.test.js`).

## ADR-006 : Pas de mesure des ouvertures
- **Décision** : pixel d'ouverture supprimé ; seuls les clics sont suivis.
- **Raison** : les proxys d'images (Apple MPP, Gmail) faussent les ouvertures, et le pixel dégrade la délivrabilité.
- **Statut** : 🟢 Validé.

## ADR-007 : Liens de clic signés (HMAC)
- **Décision** : `cid|uid|target` signés avec `tracking.secret`. La passerelle refuse une cible non signée, et son journal exige le secret.
- **Raison** : supprimer la redirection ouverte et l'exposition publique du journal.
- **Statut** : 🟢 Validé.

## ADR-008 : API locale fermée au reste du web
- **Décision** : écoute sur `127.0.0.1`, pas d'en-tête CORS, `Host` local obligatoire. Pour les écritures : `Origin` identique et `Content-Type: application/json`. Aucun secret ni jeton renvoyé au navigateur.
- **Raison** : n'importe quel site ouvert pouvait lire le mot de passe Gmail et modifier la configuration.
- **Statut** : 🟢 Validé et testé (`tests/server.test.js`).

## ADR-009 : Pas de prédiction de placement
- **Décision** : l'indice de délivrabilité agrège des contrôles réels (DNS, contenu, liens, SpamAssassin). Le placement se mesure avec un envoi réel vers Mail-Tester.
- **Statut** : 🟢 Validé.

---

## 🚫 Non-objectifs
1. Pas de framework JS lourd ni de bundler.
2. Pas de base de données.
3. Pas de mass mailing : le quota journalier (`daily_send_limit`) ne se contourne pas.
4. Aucun mot de passe Google stocké (OAuth2 uniquement).
5. Pas de fichier de code au-delà de 250 lignes.
6. Pas d'import `.xlsx` sans dépendance fiable : exporter en CSV UTF-8 depuis Excel.
