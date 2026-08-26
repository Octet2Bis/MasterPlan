# 🧪 Studio 03 — Expérimentation, Conversion (CRO) & Landing Pages

Ce pôle est responsable de la conversion du trafic en opportunités et utilisateurs actifs (Landing Pages réactives, Wireframes, A/B Testing et Tracking GTM).

---

## 🧰 Skills Activables dans ce Studio

* [gtm-landing-page-wireframing](file:///c:/Users/HP/Desktop/Master%20Plan/.agents/skills/gtm-landing-page-wireframing/SKILL.md) : Structuration et code HTML5/CSS de pages de capture.
* [ui-ux-pro-max](file:///c:/Users/HP/Desktop/Master%20Plan/.agents/skills/ui-ux-pro-max/SKILL.md) : Intelligence de design moderne (Bento Grids, Glassmorphism, Palettes HSL, Typographie).
* [gtm-cro-heuristics](file:///c:/Users/HP/Desktop/Master%20Plan/.agents/skills/gtm-cro-heuristics/SKILL.md) : Audit heuristique de conversion et réduction des frictions.
* [gtm-paid-ads-generator](file:///c:/Users/HP/Desktop/Master%20Plan/.agents/skills/gtm-paid-ads-generator/SKILL.md) : Générateur de variantes publicitaires Google Ads et Meta Ads.
* [gtm-tracking-plan](file:///c:/Users/HP/Desktop/Master%20Plan/.agents/skills/gtm-tracking-plan/SKILL.md) : Spécifications DataLayer et plans de taggage GTM.

---

## 🎯 Compétences & Livrables Produits

1. **Wireframing & Landing Pages HTML/CSS (UI/UX Pro Max)** :
   - Pages de capture ultra-légères, orientées conversion, responsive et sans dépendances lourdes.
   - Respect strict des principes de design : Hiérarchie visuelle, preuve sociale, Bento Grid et CTA unique au-dessus de la ligne de flottaison (*Above the Fold*).

2. **Frameworks de Copywriting CRO** :
   - Application des structures de conversion éprouvées : **PAS** (Problem - Agitate - Solution) ou **AIDA** (Attention - Interest - Desire - Action).

3. **Plans de Tracking & Tagging GTM** :
   - Spécification des événements DataLayer (`view_item`, `generate_lead`, `click_cta`) pour Google Tag Manager et Meta Pixel.

4. **Multi-Armed Bandits & RICE** :
   - Formulation systématique d'une hypothèse chiffrée (*Reach, Impact, Confidence, Effort*) avant tout test de variante.

---

## 🛡️ Règles Locales du Pôle & Quality Gates
* **Gabarits de Référence :** Un modèle Swiss Craft pré-configuré avec DataLayer est disponible dans [templates/landing_page_template.html](file:///c:/Users/HP/Desktop/Master%20Plan/01_GTM_Growth/03_Experimentation/templates/landing_page_template.html).
* **Isolation des Campagnes :** Toute Landing Page opérationnelle doit être un fichier HTML autonome (`index.html`) enregistré dans `01_GTM_Growth/Workspace/campaigns/<nom_campagne>/landing_pages/` (Couche 3).
* **Conformité Analytics :** Vérifier impérativement la présence du conteneur DataLayer et des événements `click_cta`.
