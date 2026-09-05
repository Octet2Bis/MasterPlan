---
name: firecrawl-dev-index
description: Recherche sémantique et extraits de code dans le Firecrawl Developer Index (70M+ READMEs, issues, PRs, docs techniques et specs OpenAPI). À utiliser pour chercher de la documentation officielle, des solutions de bugs ou des exemples de code sans bruit SEO.
---

# Firecrawl Developer Index Skill

Ce skill permet d'interroger le moteur **Firecrawl Developer Index**, un index spécialisé pour agents de développement couvrant plus de 70 millions de sources primaires (GitHub READMEs, issues, PRs mergées, docs techniques).

## 🚀 Fonctionnalités Clés
- **Zéro clé API requise** pour les requêtes standard (palier keyless).
- **Extraits Markdown purs :** Les tableaux et blocs de code sont préservés.
- **Sources primaires :** Évite les agrégateurs de contenu et cible directement les dépôts GitHub et documentations officielles.
- **Filtres avancés (POST) :** `types`, `repos`, `sources`, `language` pour cibler les résultats.

## 🛠️ Architecture des Modules

| Pilier | Module | Fonctions exposées |
|--------|--------|--------------------|
| **Noyau (02)** | `02_Assistant_Personnel/.../core/firecrawl_dev_search.js` | `searchDeveloperIndex(query, limit)`, `searchDeveloperFiltered(query, options)`, `formatDevSearchResults(results)` |
| **GTM (01)** | `01_GTM_Growth/toolbox/core/firecrawl_gtm_adapter.js` | `searchSchemaOrgDocs(type)`, `searchTrackingDocs(platform, question)`, `searchApiDocs(apiName)` |
| **Dev (03)** | `03_Developpement_App_and_Design/toolbox/firecrawl_dev_adapter.js` | `searchSwiftDocs(framework, question)`, `searchErrorFix(errorMessage)`, `searchPackage(packageName)` |
| **Telegram** | Commande `/dev <sujet>` sur El interpretor | Recherche interactive en temps réel |

## 🎯 Matrice d'Invocation par Pilier

### Pilier 01 — GTM & Growth
| Situation | Fonction à appeler | Exemple |
|-----------|-------------------|---------|
| Rédaction de JSON-LD Schema.org | `searchSchemaOrgDocs('FAQPage')` | Vérifier les propriétés obligatoires |
| Configuration tracking | `searchTrackingDocs('GA4', 'purchase event value')` | Trouver la syntaxe exacte d'un event |
| Intégration nouvelle API | `searchApiDocs('Apollo')` | Trouver le README et les endpoints |

### Pilier 02 — Assistant Personnel
| Situation | Fonction à appeler | Exemple |
|-----------|-------------------|---------|
| Recherche technique ad-hoc | `/dev shader gradient react` (Telegram) | Documentation et repos en temps réel |
| Auto-enrichissement de veille | Automatique sur catégories techniques | Ajout de docs Firecrawl aux rapports |

### Pilier 03 — App Development
| Situation | Fonction à appeler | Exemple |
|-----------|-------------------|---------|
| Porte 1 (PRD) — vérifier une API iOS | `searchSwiftDocs('HealthKit', 'workout session')` | Specs officielles avant PRD |
| Porte 2 (Design) — trouver un package | `searchPackage('cindori/fluidgradient')` | README et exemples d'un Swift Package |
| Porte 3 (Core Loop) — résoudre une erreur | `searchErrorFix('Type does not conform to DeviceActivityMonitor')` | Issue/PR exacte avec le fix |

## ⚡ Utilisation directe (cURL / HTTP)

```bash
# GET — recherche basique (keyless)
curl -s "https://api.firecrawl.dev/v2/search/developer?query=swiftui+mesh+gradient&k=3"

# POST — recherche avec filtres
curl -X POST https://api.firecrawl.dev/v2/search/developer \
  -H "Content-Type: application/json" \
  -d '{"query": "breathing animation timer", "k": 3, "types": ["readme","doc"], "language": "Swift"}'
```

## 🚫 Quand NE PAS utiliser Firecrawl
- **Données propriétaires :** Secrets, tokens, `.env` — utiliser les fichiers locaux.
- **Quality Gates :** Ne remplace JAMAIS les tests automatisés (Commandement 3).
- **Contenu non-technique :** Copywriting, stratégie GTM, rédaction — utiliser les skills dédiés.
- **Données de scoring/pipeline :** Les CSV et JSON transactionnels restent dans `Workspace/`.
