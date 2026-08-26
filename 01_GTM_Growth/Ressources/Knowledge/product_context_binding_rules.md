# 🎯 Règles de Liaison de Contexte Produit (Product Context Binding)

Ce document standardise le protocole d'injection de contexte inspiré de **[coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills)** pour éliminer les copies génériques et aligner toute production marketing sur l'ADN réel du produit.

---

## ⚡ 1. Le Principe du "Context Binding" Automatique

Avant de générer une page de vente, une annonce publicitaire, un brief SEO ou une séquence d'emails, l'agent doit **obligatoirement lier et charger le contexte produit** approprié :

```
┌──────────────────────────────────────┐          ┌──────────────────────────────────────┐
│       TÂCHE MARKETING ENTRANTE       │          │      FICHIER CONTEXTE OBLIGATOIRE    │
├──────────────────────────────────────┼──────────┼──────────────────────────────────────┤
│ Campagne Grand Public / Mobile App   │ ───────> │ Ressources/Knowledge/                │
│ (ex: Aevum, Fitness, D2C)            │          │ product-marketing-b2c.md             │
├──────────────────────────────────────┼──────────┼──────────────────────────────────────┤
│ Campagne Entreprise / B2B / SaaS     │ ───────> │ Ressources/Knowledge/                │
│ (ex: Partenariats Wonderbox, Accor)  │          │ product-marketing-b2b.md             │
└──────────────────────────────────────┘          └──────────────────────────────────────┘
```

---

## 🔍 2. Les 4 Piliers Invariables Extraits du Contexte

Pour toute création de contenu, l'agent extrait systématiquement les 4 variables clés du fichier contexte :

1. **Le Persona & l'Âge Cible :** (ex: Homme 30 ans, cadre sédentaire, soucieux de sa longévité).
2. **Le Pain Point Émotionnel Majeur :** (ex: Culpabilité du doom-scrolling, fatigue visuelle et posture dégradée).
3. **Le Mécanisme Unique (Friction Positive) :** (ex: Imposer 30s de décompression physiologique pour débloquer 15 min d'écran).
4. **La Récompense & Transformation :** (ex: Régénération de l'âge biologique et score de vitalité mesuré).

---

## 🛑 3. Interdiction Formelle des Textes Génériques Hors-Sol

Tout livrable généré sans liaison préalable avec le contexte produit sera rejeté par le harness de scoring (`gtm_eval_harness.py`).
