---
name: claudekit-seo-tech
description: Audite et implémente les fondamentaux du SEO technique pour les moteurs de recherche (Googlebot) : balises canoniques, OpenGraph, Twitter Cards, robots.txt, Core Web Vitals et sitemaps XML. À utiliser dans 02_Acquisition_and_AEO/ et 03_Developpement_App/.
---

# 🛠️ ClaudeKit — SEO Technique & Audit d'Indexabilité

Ce skill standardise les exigences de référencement technique classique pour garantir l'indexation parfaite des pages web par les moteurs de recherche traditionnels.

---

## 📋 1. Checklist des Balises HTML Obligatoires (<head>)

Toute page HTML de production doit obligatoirement intégrer ce bloc dans son `<head>` :

```html
<!-- Métadonnées Primaires -->
<title>{{PAGE_TITLE}} — [Nom du Produit]</title>
<meta name="description" content="{{PAGE_DESCRIPTION_150_CHARS}}" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<link rel="canonical" href="{{CANONICAL_URL}}" />

<!-- Open Graph / Facebook / LinkedIn -->
<meta property="og:type" content="website" />
<meta property="og:url" content="{{CANONICAL_URL}}" />
<meta property="og:title" content="{{OG_TITLE}}" />
<meta property="og:description" content="{{OG_DESCRIPTION}}" />
<meta property="og:image" content="{{OG_IMAGE_URL_1200x630}}" />

<!-- Twitter Cards -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="{{OG_TITLE}}" />
<meta name="twitter:description" content="{{OG_DESCRIPTION}}" />
<meta name="twitter:image" content="{{OG_IMAGE_URL_1200x630}}" />
```

---

## ⚡ 2. Core Web Vitals & Performance
1. **LCP (Largest Contentful Paint < 2.5s) :** Précharger l'image principale de la section Hero avec `<link rel="preload" as="image" href="..." />`.
2. **CLS (Cumulative Layout Shift < 0.1) :** Toujours spécifier `width` et `height` explicites sur toutes les balises `<img>` ou vidéos.
3. **FID / INP (Interactivity < 200ms) :** Aucun script JS bloquant dans le `<head>`. Utiliser `defer` ou `async`.

---

## 🤖 3. Fichiers de Configuration Robots & Sitemap

### `robots.txt` Standard
```txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /Workspace/
Disallow: /.secrets/

Sitemap: {{SITE_URL}}/sitemap.xml
```

---

## 🛡️ Application dans le Projet
* À combiner avec `gtm-aeo-geo-optimizer` : ClaudeKit s'assure que Googlebot indexe techniquement la page, tandis que le skill AEO s'assure que Perplexity et Claude citent son contenu.
