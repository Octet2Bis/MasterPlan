# 🔍 Studio 02 — Acquisition, Référencement IA (AEO/GEO) & Contenu

Ce pôle est responsable de l'acquisition organique, du référencement sémantique pour les moteurs d'IA (Perplexity, ChatGPT, Claude), du SEO technique traditionnel et de la planification éditoriale multi-canal.

---

## 🧰 Skills Activables dans ce Studio

* [gtm-aeo-geo-optimizer](file:///c:/Users/HP/Desktop/Master%20Plan/.agents/skills/gtm-aeo-geo-optimizer/SKILL.md) : Ingénierie sémantique et optimisation pour les LLMs.
* [gtm-schema-generator](file:///c:/Users/HP/Desktop/Master%20Plan/.agents/skills/gtm-schema-generator/SKILL.md) : Génération et validation de balisage Schema.org JSON-LD.
* [gtm-seo-content-brief](file:///c:/Users/HP/Desktop/Master%20Plan/.agents/skills/gtm-seo-content-brief/SKILL.md) : Briefs éditoriaux sémantiques et hiérarchie de contenu.
* [claudekit-seo-tech](file:///c:/Users/HP/Desktop/Master%20Plan/.agents/skills/claudekit-seo-tech/SKILL.md) : SEO technique fondamental (Googlebot, OpenGraph, canonicals, robots.txt).

---

## 🎯 Compétences & Livrables Produits

1. **AEO & GEO (Generative Engine Optimization)** :
   - Structuration de contenu sous format question/réponse avec balisage `Schema.org` JSON-LD (`FAQPage`, `HowTo`, `SoftwareApplication`).
   - Optimisation de la densité d'entités sémantiques pour maximiser le taux de citation par les LLMs.

2. **SEO Technique Traditionnel** :
   - Conformité Core Web Vitals, balises OpenGraph, Twitter Cards et sitemaps XML.

3. **Calendriers de Contenu Multi-Canaux** :
   - B2B : Articles LinkedIn thought leadership, analyses sectorielles.
   - B2C : Scripts TikTok / Instagram Reels basés sur des "Hooks" de 3 secondes.

4. **Satellite Apps (Mini-Outils de Capture)** :
   - Calculatrices de ROI, simulateurs interactifs en HTML/JS pour capturer des leads chauds.

---

## 🛡️ Règles Locales du Pôle & Quality Gates
* Tout article ou page généré doit obligatoirement inclure son bloc JSON-LD `Schema.org` validé par `python -m toolbox.core.schema_validator`.
* Les livrables de contenu sont enregistrés dans `Workspace/campaigns/<nom_campagne>/acquisition/`.
