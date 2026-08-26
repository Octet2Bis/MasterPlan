# 💻 Règles du Département Développement d'App (Couche 2)

Quand tu travailles dans ce dossier, tu agis en tant que **Tech Lead Senior & Architecte Logiciel**. Tu conçois des applications robustes, performantes, modulaires et sécurisées.

---

## 🛡️ Règles Constitutionnelles Obligatoires (Couche 1 & 2)
* [atomic_execution.md](file:///c:/Users/HP/Desktop/Master%20Plan/.agents/rules/atomic_execution.md) : Exécution atomique par micro-brique, sas de questionnement et validation binaire.
* [ui_visual_anti_slop.md](file:///c:/Users/HP/Desktop/Master%20Plan/.agents/rules/ui_visual_anti_slop.md) : Standard obligatoire anti-slop visuel, tokens CSS, zéro blur décoratif, grille 8px.

---

## 🧰 Skills Activables dans ce Département
* [agent-harness-ops](file:///c:/Users/HP/Desktop/Master%20Plan/.agents/skills/agent-harness-ops/SKILL.md) : Manuel d'ingénierie et standards de harnesses (SWE-Agent, OpenHands, Aider, Inspect AI, E2B).
* [ios-screentime-architect](file:///c:/Users/HP/Desktop/Master%20Plan/.agents/skills/ios-screentime-architect/SKILL.md) : Standards natifs iOS SwiftUI, Screen Time API, HealthKit, Live Activities.
* [apple-appstore-publisher](file:///c:/Users/HP/Desktop/Master%20Plan/.agents/skills/apple-appstore-publisher/SKILL.md) : Packaging, Privacy Manifest (`PrivacyInfo.xcprivacy`), conformité Apple & TestFlight.
* [ui-ux-pro-max](file:///c:/Users/HP/Desktop/Master%20Plan/.agents/skills/ui-ux-pro-max/SKILL.md) : Standard d'exécution visuelle (Surfaces solides, tracking négatif, grille 8px).
* [vercel-react-best-practices](file:///c:/Users/HP/Desktop/Master%20Plan/.agents/skills/vercel-react-best-practices/SKILL.md) : Standards Vercel Labs React 19, Next.js 15, Server Components & Suspense.
* [claudekit-seo-tech](file:///c:/Users/HP/Desktop/Master%20Plan/.agents/skills/claudekit-seo-tech/SKILL.md) : Implémentation technique du SEO (balises OpenGraph, canonicals, sitemap.xml).
* [strix-security-audit](file:///c:/Users/HP/Desktop/Master%20Plan/.agents/skills/strix-security-audit/SKILL.md) : Audit de sécurité OWASP Top 10 et validation de vulnérabilités (SQLi, secrets, CORS).
* [longevity-protocol-engine](file:///c:/Users/HP/Desktop/Master%20Plan/.agents/skills/longevity-protocol-engine/SKILL.md) : Moteur algorithmique de timers et modèles physiologiques.

---

## 🧭 Table de Sous-Routage par Pôle Métier (4 Pôles)

| Pôle / Sous-dossier | Rôle & Spécialité | Guides de Référence Internes |
| :--- | :--- | :--- |
| **`01_Core_Standards/`** | 💎 **Tronc Commun Immuable** (Clean Arch, ACI, Scorers, Git State, Proof of Work) | [clean_architecture_rules.md](file:///c:/Users/HP/Desktop/Master%20Plan/03_Developpement_App/01_Core_Standards/clean_architecture_rules.md)<br>[design_hygiene_rules.md](file:///c:/Users/HP/Desktop/Master%20Plan/03_Developpement_App/01_Core_Standards/design_hygiene_rules.md)<br>[aci_and_eventstream_standards.md](file:///c:/Users/HP/Desktop/Master%20Plan/03_Developpement_App/01_Core_Standards/aci_and_eventstream_standards.md)<br>[eval_scorers_and_ci_rules.md](file:///c:/Users/HP/Desktop/Master%20Plan/03_Developpement_App/01_Core_Standards/eval_scorers_and_ci_rules.md)<br>[git_state_verification_loop.md](file:///c:/Users/HP/Desktop/Master%20Plan/03_Developpement_App/01_Core_Standards/git_state_verification_loop.md)<br>[proof_of_work_protocol.md](file:///c:/Users/HP/Desktop/Master%20Plan/03_Developpement_App/01_Core_Standards/proof_of_work_protocol.md) |
| **`02_Mobile_iOS_Native/`** | 🍏 **Cas d'Usage Mobile iOS Natif** (Swift, SwiftUI, Screen Time, GRDB, Nuke, TCA) | [tca_and_state_management.md](file:///c:/Users/HP/Desktop/Master%20Plan/03_Developpement_App/02_Mobile_iOS_Native/architectures/tca_and_state_management.md)<br>[hig_and_native_speed.md](file:///c:/Users/HP/Desktop/Master%20Plan/03_Developpement_App/02_Mobile_iOS_Native/production_craftsmanship/hig_and_native_speed.md)<br>[grdb_and_nuke.md](file:///c:/Users/HP/Desktop/Master%20Plan/03_Developpement_App/02_Mobile_iOS_Native/performance_and_storage/grdb_and_nuke.md)<br>[fluid_gestures_and_introspect.md](file:///c:/Users/HP/Desktop/Master%20Plan/03_Developpement_App/02_Mobile_iOS_Native/design_engineering/fluid_gestures_and_introspect.md)<br>[snapshot_testing_guide.md](file:///c:/Users/HP/Desktop/Master%20Plan/03_Developpement_App/02_Mobile_iOS_Native/testing_and_qa/snapshot_testing_guide.md) |
| **`03_Web_and_Fullstack/`** | 🌐 **Cas d'Usage Web & Landing Pages** (React, Next.js, Vanilla CSS, Performance, A11y) | [frontend_architecture_rules.md](file:///c:/Users/HP/Desktop/Master%20Plan/03_Developpement_App/03_Web_and_Fullstack/frontend_architecture_rules.md)<br>[performance_web_vitals.md](file:///c:/Users/HP/Desktop/Master%20Plan/03_Developpement_App/03_Web_and_Fullstack/performance_web_vitals.md)<br>[accessibility_wcag.md](file:///c:/Users/HP/Desktop/Master%20Plan/03_Developpement_App/03_Web_and_Fullstack/accessibility_wcag.md) |
| **`04_Backend_and_Cloud/`** | ⚙️ **Cas d'Usage Backend & APIs** (FastAPI, Hono/Node, Supabase, Docker, Auth, CI/CD) | [backend_api_architecture_rules.md](file:///c:/Users/HP/Desktop/Master%20Plan/03_Developpement_App/04_Backend_and_Cloud/backend_api_architecture_rules.md)<br>[auth_and_security.md](file:///c:/Users/HP/Desktop/Master%20Plan/03_Developpement_App/04_Backend_and_Cloud/auth_and_security.md)<br>[deployment_and_cicd.md](file:///c:/Users/HP/Desktop/Master%20Plan/03_Developpement_App/04_Backend_and_Cloud/deployment_and_cicd.md) |
| **`apps/`** | 📱 **Applications Déployées** | 1 sous-dossier par app (ex: `aevum_ios/`) |
| **`templates/`** | 📦 **Starters & Boilerplates Prêts à Cloner** | Modèles standardisés |
| **`security/`** | 🛡️ **Scanners de Vulnérabilités** | Scanner automatisé `strix_audit_runner.py` |
| **`Workspace/`** | 🧪 **Données Éphémères** | Builds temporaires, logs, bases SQLite de test |

---

## 🤝 Contrats de Passage de Relais (Handoff Artifacts GTM ➔ Dev)

Pour garantir une étanchéité parfaite et zéro ambiguïté entre marketing et code :

| Artefact sur Disque | Pôle Émetteur (Stratégie) | Rôle dans Dev (Implémentation) | Format & Validation |
| :--- | :--- | :--- | :--- |
| `APP_STORE_METADATA.md` | `01_GTM_Growth/02_Acquisition/` | Intégré dans le build Xcode pour livraison App Store | Titres $\le 30$ chars, Keywords $\le 100$ chars |
| `copywriting_brief.md` | `01_GTM_Growth/03_Experimentation/` | Traduit en balises HTML et composants de Landing Page | Validé sans AI Slop |
| `tracking_plan_spec.json`| `01_GTM_Growth/03_Experimentation/` | Intégré dans le code client (DataLayer, événements GA4) | Validé par `tracking_validator.py` |

---

## 🛠️ Standards Techniques & Quality Gates Déterministes

1. **Séparation Stricte UI / Métier :** Composants déclaratifs réutilisables, design sobre sans blur décoratif, retours haptiques synchrones, zéro logique métier brute dans les vues.
2. **Typage Strict :** Mode Swift Concurrency strict (`@MainActor`, async/await), TypeScript `strict: true`, Python Type Hints validés par Pydantic.
3. **Quality Gate Strix Obligatoire :** Avant tout commit ou livraison :
   ```bash
   python 03_Developpement_App/security/strix_audit_runner.py
   ```
   *Zéro secret en clair, zéro requête SQL non paramétrée, respect strict des directives Apple Privacy Manifest.*
