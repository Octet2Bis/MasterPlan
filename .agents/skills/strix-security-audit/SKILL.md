---
name: strix-security-audit
description: Audite et valide méthodiquement la sécurité des applications, APIs et bases de données contre les failles OWASP Top 10 (Injections SQL, fuites de secrets/tokens, failles d'authentification, configurations CORS non sécurisées). À utiliser dans 03_Developpement_App_and_Design/.
---

# 🕵️‍♂️ Strix Security Audit — Validateur & Scanner de Sécurité OWASP

Ce skill orchestre les audits de sécurité pré-déploiement pour garantir qu'aucun secret, faille d'injection ou anomalie d'authentification n'atteigne l'environnement de production.

---

## 🛡️ Les 5 Familles de Vulnérabilités Auditées

1. **Fuites de Secrets & Clés d'API en Clair :**
   - Aucune clé d'API, mot de passe ou jeton JWT ne doit être présent dans le code source.
   - Les variables sensibles doivent impérativement être injectées via `.secrets/.env`.

2. **Injections SQL & Requêtes Dynamiques :**
   - Toutes les requêtes en base de données doivent utiliser des requêtes préparées (Parameterized Queries / ORM).
   - Les `f-strings` et concaténations directes dans les clauses SQL sont formellement rejetées.

3. **Exécutions de Commandes Shell Non Sécurisées :**
   - Proscription des appels directs `os.system` ou `subprocess.Popen(shell=True)` sans assainissement strict.

4. **Politiques CORS & Headers de Sécurité :**
   - Refus du wildcard `*` en production pour les origines CORS.
   - Présence obligatoire des en-têtes de sécurité de base (`Content-Security-Policy`, `X-Content-Type-Options`).

---

## 🧪 Protocole de Validation Obligatoire
* Avant tout commit ou déploiement, exécuter le scanner de sécurité :
  `python 03_Developpement_App_and_Design/security/strix_audit_runner.py`
* Critère de passage : **Security Score = 100/100 (0 vulnérabilité critique ou élevée)**.
