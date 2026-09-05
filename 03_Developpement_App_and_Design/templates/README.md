# 📦 Bibliothèque des Templates Universels — Master Plan (03_Developpement_App_and_Design)

Ce dossier regroupe les briques architecturales, composants d'interface et clients de dépendance standardisés, conçus pour accélérer la création de nouvelles applications iOS et Web tout en garantissant une étanchéité absolue et le respect strict du Quality Gate.

---

## 🏛️ 1. Architecture Modulaire des Templates

```
03_Developpement_App_and_Design/templates/
├── README.md                             # Ce registre central
├── mobile_ios/                           # Tronc Natif Swift (iOS / SwiftUI)
│   ├── TCA_Feature_Template.swift        # Pattern Reducer / State / Action (Point-Free style)
│   ├── Dependency_Clients_Template.swift # Clients Audio, Haptics, Storage (Live & Mock)
│   ├── Bento_Card_Component.swift        # Carte Bento Swiss Craft avec subpixel hairline border
│   └── Preview_MiniApp_Template.swift    # App autonome pour tests d'isolation de features
├── web_preview/                          # Tronc Simulateur Web / PWA (Vanilla JS/CSS)
│   ├── store_unidirectional.js           # Micro-store Redux Zero-Dependency (< 80 lignes)
│   ├── swiss_craft_tokens.css            # Tokens CSS UI-UX Pro Max (Surfaces étagées, 60-30-10)
│   ├── audio_synth_engine.js             # Moteur WebAudio procédural & haptique (< 90 lignes)
│   └── app_shell.html                    # Coque HTML sémantique responsive (< 100 lignes)
└── shared_contracts/                     # Contrats & Schémas Partagés
    ├── schema_catalog_template.json      # Schéma JSON standard pour catalogues de données
    └── causal_graph_template.json        # Modèle de graphe relationnel déterministe
```

---

## ⚡ 2. Principes Fondamentaux d'Ingénierie

1. **Zero-Dependency by Default :** Tous les templates fonctionnent immédiatement sans installer de packages NPM tiers ou de frameworks SPM lourds.
2. **Plafond Monolithique Strict (< 120 Lignes) :** Chaque template est atomique et concis.
3. **Parité Déterministe Swift / Web :** Tout concept architectural a son équivalent natif iOS et son jumeau de simulation web.
4. **Ports & Adapters :** Les effets secondaires (sons, stockage, horloge) sont découplés via des interfaces avec implémentations `live` et `mock`.

---

## 🚀 3. Génération Automatisée d'Applications

Pour instancier une nouvelle application complète à partir de ces templates, utiliser le scaffolder :
```bash
node 03_Developpement_App_and_Design/toolbox/scaffold_app.js --name="mon_app"
```
Le scaffolder clone les templates, configure les variables d'environnement et vérifie instantanément l'intégrité via `test_code_integrity.js`.
