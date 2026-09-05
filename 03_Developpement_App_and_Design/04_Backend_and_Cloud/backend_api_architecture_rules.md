# ⚙️ Standards d'Architecture Backend, APIs & Infrastructure Cloud

Ce document définit les standards d'ingénierie pour la conception d'APIs robustes, de bases de données sécurisées et de microservices conteneurisés.

---

## 🏛️ 1. Architecture Hexagonale & Contrats d'API

* **Typage Strict des DTOs (Data Transfer Objects) :**
  * En Python : Modèles `Pydantic v2` avec validation stricte à l'entrée et à la sortie de chaque endpoint.
  * En TypeScript : Schémas `Zod` ou contrats de types partagés entre le frontend et le backend.
* **Format des Réponses Standardisé :**
  ```json
  {
    "success": true,
    "data": { ... },
    "error": null,
    "timestamp": "2026-08-24T09:50:00Z"
  }
  ```

---

## 🗄️ 2. Persistance & Sécurité des Données (PostgreSQL / Supabase)

* **Row Level Security (RLS) Obligatoire :**
  * Aucune table contenant des données utilisateurs ne doit être exposée sans politique RLS explicite (`auth.uid() = user_id`).
* **Migrations Versionnées :**
  * Toutes les modifications de schéma SQL passent par des fichiers de migration versionnés (Alembic / Prisma / Drizzle) stockés dans le dépôt.
* **Chiffrement au Repos & en Transit :**
  * TLS 1.3 obligatoire pour toutes les communications API.

---

## 🐳 3. Paradigme Conteneurisé Docker (Couche 3)

* **Multi-Stage Builds :** Réduction drastique de la taille des images finales (séparation de l'étape de compilation et de l'environnement d'exécution).
* **Utilisateur Non-Root :** Tout conteneur d'API s'exécute sous un utilisateur dédié sans privilèges (`USER appuser`).
* **Injection des Secrets :** Les clés privées et tokens sont injectés au runtime via `--env-file .secrets/.env` et ne sont jamais stockés dans l'image Docker (`Dockerfile`).
