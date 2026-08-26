---
name: gtm-landing-page-wireframing
description: Conçoit et structure des wireframes et pages de destination (Landing Pages) HTML5/CSS réactives et ultra-rapides orientées conversion. À utiliser dans 03_Experimentation/.
---

# 📐 Landing Page Wireframing & Conversion Architecture

Ce skill guide l'agent pour structurer et coder des Landing Pages légères, réactives et optimisées pour maximiser le taux de conversion.

---

## 🏗️ Structure en 7 Blocs d'une Landing Page à Haute Conversion

```
┌────────────────────────────────────────────────────────┐
│ 1. NAVBAR : Logo sobre + CTA unique                    │
├────────────────────────────────────────────────────────┤
│ 2. HERO SECTION (Above the fold) :                     │
│    • Titre percutant (Bénéfice principal)              │
│    • Sous-titre explicatif (Comment ça marche)         │
│    • CTA Primaire + Micro-copie rassurante             │
│    • Visuel produit ou aperçu interactif               │
├────────────────────────────────────────────────────────┤
│ 3. SOCIAL PROOF BAR : Logos d'entreprises / Partenaires│
├────────────────────────────────────────────────────────┤
│ 4. FEATURES & VALUE PROPS : 3 bénéfices majeurs (PAS)  │
├────────────────────────────────────────────────────────┤
│ 5. INTERACTIVE SECTION : Démo / Calculatrice / Aperçu  │
├────────────────────────────────────────────────────────┤
│ 6. FAQ ACCORDION (Balisage Schema.org FAQPage)         │
├────────────────────────────────────────────────────────┤
│ 7. FINAL CTA & FOOTER                                  │
└────────────────────────────────────────────────────────┘
```

---

## 💻 Règles de Code Frontend
1. **HTML5 Sémantique & CSS Vanilla :** Pas de frameworks JS lourds (React/Vue) pour une landing page de capture. Utiliser du HTML5 pur avec CSS moderne (Flexbox/Grid, Dark mode élégant, Glassmorphism).
2. **Mobile-First :** 70% du trafic publicitaire arrive sur mobile. La section Hero doit être parfaitement lisible sur écran de 375px.
3. **Temps de Chargement (< 500ms) :** Aucune image externe lourde non optimisée.
4. **Intégration DataLayer :** Chaque bouton d'action doit déclencher `dataLayer.push({'event': 'click_cta', 'cta_name': '...'})`.

---

## 📁 Enregistrement
Enregistrer le fichier HTML final dans `Workspace/campaigns/<nom_campagne>/landing_pages/index.html`.
