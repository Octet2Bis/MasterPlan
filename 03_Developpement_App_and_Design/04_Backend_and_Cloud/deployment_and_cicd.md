# 🚀 Standard de Déploiement Conteneurisé, CI/CD & Observabilité

Ce document standardise le cycle de vie des conteneurs, les pipelines d'intégration continue et les endpoints de santé pour tous les services backend du Master Plan.

---

## 🐳 1. Dockerfile Multi-Stage Optimisé (Standard de Production)

Chaque service backend doit adopter un `Dockerfile` en plusieurs étapes pour minimiser la surface d'attaque et la taille de l'image finale :

```dockerfile
# — Étape 1 : Builder & Compilation des dépendances —
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm ci
COPY src/ ./src/
RUN npm run build && npm prune --production

# — Étape 2 : Runtime Léger & Sécurisé —
FROM node:20-alpine AS runner
WORKDIR /app

# Sécurité : Exécution sous utilisateur non-root
RUN addgroup -g 1001 -S appgroup && adduser -u 1001 -S appuser -G appgroup
USER appuser

ENV NODE_ENV=production
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/package.json ./package.json

EXPOSE 3000

# Endpoint de santé intégré pour Docker & Kubernetes
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/healthz || exit 1

CMD ["node", "dist/server.js"]
```

---

## 🩺 2. Endpoints de Santé & Arrêt Propre (Graceful Shutdown)

1. **Endpoint de Liveness & Readiness (`/healthz`) :**
   * Doit répondre immédiatement en HTTP 200 avec le statut des dépendances critiques :
     ```json
     {
       "status": "healthy",
       "uptime_seconds": 3420,
       "checks": {
         "database": "connected",
         "redis": "connected"
       },
       "timestamp": "2026-08-25T13:10:00Z"
     }
     ```

2. **Interception des Signaux Système (`SIGTERM` / `SIGINT`) :**
   * À la réception de `SIGTERM`, le serveur arrête d'accepter de nouvelles connexions, termine les requêtes en cours (délai de grâce de 10s), ferme les connexions de base de données, puis se termine avec le code 0.

---

## 🔄 3. Pipeline CI/CD GitHub Actions (Étapes Incompressibles)

Chaque push ou pull request sur la branche principale déclenche les étapes séquentielles :

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Lint & Format Check (ESLint / Stylelint / Ruff)          │
├─────────────────────────────────────────────────────────────┤
│ 2. Type Check (TypeScript strict / mypy)                    │
├─────────────────────────────────────────────────────────────┤
│ 3. Tests Unitaires & Couverture (Vitest / Pytest >= 80%)    │
├─────────────────────────────────────────────────────────────┤
│ 4. Scanner de Sécurité Strix (Secrets & Vulnérabilités)     │
├─────────────────────────────────────────────────────────────┤
│ 5. Build Image Docker Multi-Stage                           │
├─────────────────────────────────────────────────────────────┤
│ 6. Déploiement Staging ➔ Smoke Test /healthz ➔ Prod        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 4. Journalisation Structurée & Tracing (Observabilité)

* Toutes les sorties de logs doivent être émises au format **JSON structuré sur stdout** :
  ```json
  {"level":"info","timestamp":"2026-08-25T13:12:00Z","service":"aevum-api","requestId":"req-8f4b2c","message":"User login successful","userId":"usr_102"}
  ```
* Interdiction absolue des `console.log` non structurés en environnement de production.
