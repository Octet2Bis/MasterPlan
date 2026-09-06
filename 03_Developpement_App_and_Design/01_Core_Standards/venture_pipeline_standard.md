# 🚀 Standard Officiel : Venture Pipeline Standard (Venture Machine)

Ce document constitue la **Loi d'Ingénierie & d'Exécution** pour l'automatisation holistique de tout nouveau projet applicatif, de son cadrage initial jusqu'à sa distribution de contenu.

---

## 🏛️ Les 4 Piliers Inviolables du Pipeline

```
[BRIEF INITIAL]
       │
       ▼
[PILIER 1 : MOTEUR HEADLESS & BDD DÉTERMINISTE]
• FSM TypeScript pur (Zero-DOM)
• Spécifications Gherkin BDD
• Contrats Zod (InputSchema, ConfigSchema, OutputSchema)
• Gate 1 : 100% tests Vitest au vert (< 15ms)
       │
       ▼
[PILIER 2 : MATRICE DE CORRÉLATION DESIGN & DA]
• Sélection parmi les 6 Archétypes Visuels
• Primitives : Radix UI, Vaul, CMDK, Visx, Motion Primitives
• Parité Typographique Fonderies & Fontshare
• Gate 2 : Mock-First (4 états d'UI) avec tokens scellés
       │
       ▼
[PILIER 3 : PROTOCOLE GTM & FUNNEL DATA]
• Neuro-Copywriting 3 blocs (Transformation / Confiance / Formule)
• Machine-Readability & AEO (llms.txt + Schema.org WebApplication)
• DataLayer PostHog typé & debouncé 500ms
• Gate 3 : Funnel sans friction avec verrou d'export HD
       │
       ▼
[PILIER 4 : USINE DE CONTENU & AUTOMATISATION VIDÉO]
• Playwright Headless (60 fps 1080p)
• Automated Motion Engine (Remotion avec spline smoothing)
• Moteur Satori (Carrousel LinkedIn PDF & Open Graph dynamique)
• Kit de diffusion : 16:9, 9:16, GIF < 2 Mo, pitch.txt, social_thread.md
```

---

## ⚙️ Pilier 1 : Moteur Headless & BDD Déterministe (Core Logic)

L'application doit fonctionner à 100 % dans un terminal avant d'écrire la moindre ligne de JSX, CSS ou Swift.

1. **Architecture Machine à États Finis (FSM) :**
   * Le workflow métier est modélisé comme un automate fini (via un reducer TypeScript pur ou XState headless).
   * Les transitions sont prévisibles et interdisent formellement les états impossibles (ex. impossible d'être en calcul sans données validées).
2. **Spécifications Gherkin sans ambiguïté :**
   ```gherkin
   Fonctionnalité: Calcul du score d'efficience
     Scénario: Entrée standard sans friction
       Étant donné un jeu de paramètres "nominal.json"
       Quand la fonction executeCoreLoop() est appelée
       Alors le résultat contient un score numérique entre 0 et 100
       Et le temps d'exécution est inférieur à 15 millisecondes
   ```
3. **Contrats d'I/O Zod stricts :**
   * Séparation étanche entre les entrées (`InputSchema`), la configuration (`ConfigSchema`) et la sortie immuable (`OutputSchema`).
4. **Zéro dépendance UI :**
   * Le moteur ne manipule aucun élément du DOM (`window`, `document`), ce qui permet son exécution instantanée sous Vitest ou dans un Worker d'arrière-plan.
5. **Critère de passage (Gate 1) :**
   * 100 % des tests BDD au vert sur 3 jeux de données : nominal, valeurs limites, entrées corrompues.

---

## 🎨 Pilier 2 : Matrice de Corrélation Design & Ingénierie Créative

Pour éviter le rendu générique des kits UI par défaut, le design repose sur des composants spécialisés de haut niveau : primitives headless (**Radix UI**), tiroirs gestuels (**Vaul**), palettes de commande (**CMDK**), visualisations de données (**Visx** / **Bklit-UI**), micro-interactions cinétiques (**Motion Primitives**) et typographies de fonderies indépendantes.

### La Matrice des 6 Archétypes Visuels

| Archétype | Cible & État mental | Typographie & Palette | Composants spécialisés & UI | Physique Motion & Micro-interactions |
| :--- | :--- | :--- | :--- | :--- |
| **1. Swiss Engineering** | Développeurs, DevOps, SecOps.<br>*Mental : Rigoureux, sans détour.* | **Geist Mono** ou **JetBrains Mono**.<br>Noir absolu (`#050505`), blanc craie, bordures 1px acier (`#222`). | Palette CMDK, tables de logs monospaces, commutateurs radio stricts, badges d'état ASCII. | Zéro spring. Transitions instantanées (0ms ou 75ms linéaire). Hover avec inversion de contraste nette. |
| **2. Transit Bento** | Opérations, Logistique, Productivité.<br>*Mental : Pressé, cherche la synthèse.* | **PP Neue Montreal** (Fallback : **General Sans**).<br>Gris asphalte, fond coquille d'œuf, accent Rouge Signalétique. | Grilles Bento strictes, cartes à bordures denses, jauges vectorielles SVG, métriques géantes tabulaires. | Déplacement morphique des cartes (`layoutId`), feedback tactile subtil (`scale: 0.98`), scroll fluide via Lenis. |
| **3. Kinetic FinTech** | Directeurs financiers, SaaS B2B, Traders.<br>*Mental : Précis, orienté ROI.* | **Söhne** (Fallback : **Inter Display** tnum).<br>Bleu nuit profond, vert néon de validation, verres dépolis. | Graphiques interactifs Visx / Bklit, compteurs numériques à défilement odométrique, tiroirs fluides Vaul. | Ressorts amortis haute vélocité (`stiffness: 300`, `damping: 30`). Shaders de gradient canvas discrets en arrière-plan. |
| **4. Monastic Editorial** | Dirigeants, RH haut de gamme, Conseil.<br>*Mental : Réflexion, posture premium.* | **Newsreader Serif** + **Suisse Int'l** (Fallback : **Instrument Sans**).<br>Ivoire chaud (`#FBF9F5`), texte fusain sombre, filet sépia. | Accordéons de lecture sans bordure, citations en exergue, pagination discrète, champs de saisie minimalistes. | Fondu enchaîné doux (`opacity: 0.2` vers `1.0`), apparitions échelonnées au défilement (`stagger` de 0,08s). |
| **5. Tactile Neo-Pop** | Créateurs, Solopreneurs, Micro-outils.<br>*Mental : Curieux, cherche la gratification.* | **Clash Display** ou **Plus Jakarta Sans**.<br>Pastels saturés (menthe, lilas), ombres franches portées (*hard shadows*). | Sliders à résistance dynamique, boutons rebondissants, pastilles de validation animées, confetti canvas légers. | Physique rebondissante prononcée (`bounce: 0.4`), bascule d'angles au clic (`rotate: [-1deg, 1deg]`), micro-haptique visuelle. |
| **6. Cyber Spatial** | IA, Web3, Deep Tech, R&D.<br>*Mental : Visionnaire, cherche la pointe.* | **FK Grotesk** ou **Space Grotesk**.<br>Noir mat, vert phosphore ou cyan, effets de trame matricielle. | Fonds avec bruit de Perlin (Canvas 2D optimisé ou WebGL), panneaux HUD flottants, indicateurs radar SVG. | Balayage lumineux sur les bordures (lignes d'énergie SVG), micro-distorsions au survol, lissage inertiel continu. |

---

## 📈 Pilier 3 : Protocole GTM & Orchestration du Funnel

Dès que l'interface répond aux critères fonctionnels et visuels, la couche de distribution et d'instrumentation est injectée.

1. **Neuro-Copywriting en 3 blocs :**
   * **Accroche :** `[Transformation majeure]` sans `[Friction habituelle]` (ex. *« Auditez vos marges brutes en 30 secondes sans exporter un seul fichier CSV »*).
   * **Démonstration de confiance :** Micro-témoignage ou pastille de validation sous l'action principale.
   * **Levée de doute :** Section *« Comment nous calculons cela »* (transparence totale sur la formule).
2. **Machine-Readability & AEO (Answer Engine Optimization) :**
   * Création d'un point d'accès `public/llms.txt` documentant les fonctionnalités de l'outil pour les moteurs d'inférence (ChatGPT, Claude, Perplexity).
   * Schéma structuré JSON-LD de type `WebApplication` enrichi avec `featureList`, `operatingSystem` et `browserRequirements`.
3. **Architecture d'Activation & DataLayer :**
   * Branchement d'événements analytiques typés (PostHog / Mixpanel) sans bloquer le fil d'exécution :
     - `$session_start` : avec capture des UTM et du referrer.
     - `$core_input_change` : avec délai de garde (*debounce* de 500 ms).
     - `$result_generated` : avec le temps passé avant d'atteindre le résultat.
     - `$gate_interacted` : pour surveiller l'abandon au moment de la capture d'email ou du paiement.
4. **Lead Magnet & Rétention :**
   * L'outil reste fonctionnel sans barrière ; la friction (email ou accès membre) ne bloque que l'export haute fidélité (PDF automatisé, intégration webhook ou template prêt à l'emploi).

---

## 🎥 Pilier 4 : Usine de Contenu & Automatisation Vidéo

Le produit génère lui-même ses propres supports de diffusion de façon programmatique.

1. **Rendu vidéo en code pur via Remotion :**
   * Un script Remotion compile le composant web, simule des mouvements de souris naturels par interpolation spline, applique des zooms automatiques sur les champs saisis et ajoute des sous-titres typographiques calés sur le rythme de l'action.
2. **Variations multiformats instantanées :**
   * **16:9 Desktop :** pour les démos, la documentation et Twitter/X.
   * **9:16 Vertical :** centré sur la carte de calcul pour LinkedIn, TikTok et Shorts.
   * **GIF optimisé (< 2 Mo) :** pour les emails de prospection à froid.
3. **Moteur Satori / Canvas vectoriel :**
   * Génération automatique du carrousel LinkedIn (PDF multi-slides) et des bannières Open Graph dynamiques.
4. **Kit de diffusion asynchrone (`distribution/`) :**
   * `pitch.txt` : Trois variantes d'emails froids articulés autour du problème résolu.
   * `social_thread.md` : Fil de discussion structuré décortiquant le cas d'usage avec images pré-générées.
   * `metadata.json` : Résumé des métriques de performance et arguments clés du produit.

---

## 🏛️ Découpage Modulaire & Plafond < 250 Lignes

Chaque projet venture créé doit obligatoirement respecter l'arborescence étanche suivante :

```text
apps/<venture_name>/
├── BRIEF.md                    # Cadrage et 9 questions éliminatoires
├── PRD.md                      # Specs comportementales Gherkin
├── data/                       # Fixtures et jeux de tests (nominal, limites, corrompu)
│   ├── nominal.json
│   ├── edge_cases.json
│   └── corrupted.json
├── engine/                     # Logique pure Headless (< 250L par fichier)
│   ├── fsm.ts                  # Automate fini d'état pur
│   ├── schemas.ts              # Schémas Zod I/O
│   └── core.ts                 # executeCoreLoop()
├── ui/                         # Interface Mock-First (< 250L par fichier)
│   ├── tokens.css              # Variables de l'Archétype scellé
│   └── components/             # Primitives modulaires isolées
├── gtm/                        # Télémétrie et référencement
│   ├── analytics.ts            # DataLayer typé
│   └── llms.txt                # Contrat pour moteurs IA
└── distribution/               # Pipeline Remotion & Satori
    ├── remotion_entry.tsx
    ├── pitch.txt
    └── social_thread.md
```
