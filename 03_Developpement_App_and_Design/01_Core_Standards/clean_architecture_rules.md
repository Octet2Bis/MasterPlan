# 🏛️ Principes d'Ingénierie Logicielle & Clean Architecture

Ce document définit les standards d'architecture applicables à tous les développements applicatifs (Frontend, Mobile, Backend).

---

## 🧭 1. Les 3 Cercles de l'Architecture Hexagonale

```
                     ┌──────────────────────────────────────────────┐
                     │          ADAPTERS / UI / PLUGINS             │
                     │  (SwiftUI Views, React Components, FastAPIs) │
                     │                                              │
                     │      ┌────────────────────────────────┐      │
                     │      │       USE CASES / SERVICES     │      │
                     │      │  (ProtocolEngine, UserProfile) │      │
                     │      │                                │      │
                     │      │      ┌──────────────────┐      │      │
                     │      │      │  CORE / DOMAIN   │      │      │
                     │      │      │ (Entities, Enums)│      │      │
                     │      │      └──────────────────┘      │      │
                     │      └────────────────────────────────┘      │
                     └──────────────────────────────────────────────┘
```

* **Le Domaine (Core) est Agnostique :** Les structures de données pures (`LongevityProtocol`, `UserProfile`) ne doivent importer aucun framework d'interface (ni SwiftUI, ni UIKit, ni React).
* **Flux Unidirectionnel des Dépendances :** Les couches externes connaissent les couches internes, jamais l'inverse.
* **Inversion de Dépendances (DIP) :** Les services externes (HealthKit, SQLite, Réseau) sont injectés via des interfaces/protocoles abstraits pour permettre un mock instantané dans les tests unitaires.

---

## 🛡️ 2. Gestion des Effets de Bord & Concurrence
* **Isolation Concurrente (Swift Concurrency / TypeScript Async) :**
  * L'état de l'UI est strictement confiné à `@MainActor` (en Swift) pour éviter les *Data Races*.
  * Les requêtes de base de données et calculs de fichiers s'exécutent sur des acteurs ou threads d'arrière-plan isolés.
* **Gestion Déterministe des Erreurs :**
  * Interdiction d'utiliser des `try!` ou des `fatalError()` en production.
  * Chaque fonction susceptible d'échouer retourne un `Result<T, AppError>` ou lève une erreur typée exhaustivement.
