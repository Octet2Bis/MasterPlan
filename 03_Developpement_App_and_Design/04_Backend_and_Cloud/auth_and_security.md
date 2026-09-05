# 🔒 Standard d'Authentification, Autorisation & Sécurité API Backend

Ce document définit les règles de sécurité incompressibles pour la conception des endpoints, la gestion des sessions utilisateurs et la protection des données sensibles (aligné sur l'OWASP API Security Top 10).

---

## 🔑 1. Stratégie d'Authentification & Tokens

1. **Architecture Dual-Token (Access + Refresh Token) :**
   * **Access Token (JWT) :** Durée de vie courte (**15 minutes maximum**). Signé avec algorithme asymétrique `RS256` ou `Ed25519`. Stocké en mémoire vive côté client (jamais dans le `localStorage`).
   * **Refresh Token :** Durée de vie longue (7 à 30 jours). Stocké exclusivement dans un cookie sécurisé :
     ```http
     Set-Cookie: refresh_token=...; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth/refresh
     ```
   * **Rotation & Révocation :** À chaque renouvellement, le refresh token précédent est invalidé. En cas de réutilisation frauduleuse, toute la chaîne de session de l'utilisateur est révoquée.

2. **Flux OAuth2 + PKCE :**
   * Pour toute connexion tierce (Google, Apple, GitHub), l'implémentation de la vérification dynamique PKCE (*Proof Key for Code Exchange*) est obligatoire.

---

## 🛡️ 2. Isolation des Données & Row Level Security (RLS)

1. **Politique Zéro Exposition Directe :**
   * Aucune table relationnelle (PostgreSQL / Supabase) ne peut être accédée directement sans politique RLS explicite.
   * Exemple de règle PostgreSQL stricte :
     ```sql
     ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
     
     CREATE POLICY user_isolation_policy ON user_profiles
     FOR ALL
     USING (auth.uid() = user_id)
     WITH CHECK (auth.uid() = user_id);
     ```

2. **Principe du Moindre Privilège :**
   * L'API backend se connecte à la base avec un rôle applicatif restreint (`app_user`), et non avec le rôle `postgres` superuser.

---

## 🚦 3. Rate Limiting & Protection Anti-Abus

1. **Limites par Endpoint (Algorithme Token Bucket) :**
   * **Endpoints d'authentification (`/login`, `/register`, `/forgot-password`) :** 5 requêtes par minute par IP.
   * **Endpoints de consultation publique :** 60 requêtes par minute par IP.
   * **Endpoints de mutation authentifiés :** 120 requêtes par minute par utilisateur.
2. **En-têtes de Réponse Obligatoires :**
   * Retourner systématiquement `RateLimit-Limit`, `RateLimit-Remaining` et `RateLimit-Reset`.
   * En cas de dépassement, répondre avec HTTP 429 *Too Many Requests* et l'en-tête `Retry-After: <secondes>`.

---

## 🌐 4. Configuration CORS & En-têtes HTTP de Sécurité

1. **CORS Restreint :**
   * Bannir formellement `Access-Control-Allow-Origin: *` sur les endpoints acceptant des credentials.
   * Définir une liste blanche stricte des domaines autorisés (`https://app.aevum.com`, `https://api.aevum.com`).

2. **En-têtes de Sécurité Obligatoires (Helmet / Middleware) :**
   ```http
   Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none';
   Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
   X-Content-Type-Options: nosniff
   X-Frame-Options: DENY
   Referrer-Policy: strict-origin-when-cross-origin
   ```

---

## 🧪 5. Audit Automatisé Avant Déploiement

Avant tout déploiement, exécuter le scanner local de sécurité Strix :
```bash
python 03_Developpement_App_and_Design/security/strix_audit_runner.py
```
*Critère de validation : 0 faille critique, 0 secret exposé dans le code.*
