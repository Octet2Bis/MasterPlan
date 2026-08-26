---
name: gtm-tracking-plan
description: Définit le plan de taggage et les spécifications DataLayer (Google Tag Manager, GA4, Meta Pixel) pour mesurer avec précision chaque étape du funnel de conversion. À utiliser dans 03_Experimentation/.
---

# 📊 Plan de Taggage & Tracking GTM (Google Tag Manager)

Ce skill standardise la mise en place du tracking d'événements pour alimenter les algorithmes de conversion et les tableaux de bord RevOps.

---

## 🎯 Événements Standards GA4 & DataLayer à Implémenter

| Étape du Tunnel | Nom d'Événement Standard | Paramètres Recommandés | Déclencheur GTM |
|---|---|---|---|
| Arrivée sur la page | `page_view` | `page_title`, `campaign_id` | All Pages |
| Lecture à 50% / Scroll | `scroll_depth` | `percent_scrolled: 50` | Scroll Depth Trigger |
| Clic sur CTA Primaire | `click_cta` | `cta_name`, `cta_location` | Click sur élément `[data-track="cta"]` |
| Soumission Formulaire | `generate_lead` | `form_id`, `lead_type` | Custom Event `form_submitted` |
| Vue de Confirmation | `view_thank_you` | `lead_id` | Page URL `/merci` |

---

## 💻 Spécification du Code DataLayer (Vanilla JS)

```javascript
// Exemple de push DataLayer lors du clic sur le bouton de conversion
function trackCtaClick(ctaName, location) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        'event': 'click_cta',
        'cta_name': ctaName,
        'cta_location': location,
        'timestamp': new Date().toISOString()
    });
}
```

---

## 📁 Livrable Produit
Générer le document de spécification technique dans `Workspace/campaigns/<nom_campagne>/tracking_plan.md`.
