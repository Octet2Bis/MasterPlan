---
name: gtm-b2c-hook-model
description: Crée et calibre des boucles d'habitudes et d'engagement pour applications mobiles et SaaS B2C basées sur le Hook Model (Nir Eyal). À utiliser dans 05_Activation_and_CSM/.
---

# 🪝 Le Hook Model & Boucles d'Habitudes (B2C & Product Growth)

Ce skill guide la mise en place de mécanismes de rétention comportementale pour ancrer l'usage quotidien d'un produit.

---

## 🔄 Les 4 Phases du Hook Model

```
       ┌────────────────────────┐
       │   1. TRIGGER (Signal)   │
       │  Externe (Push, Email) │
       │  Interne (Ennui, Peur) │
       └───────────┬────────────┘
                   │
                   ▼
       ┌────────────────────────┐
       │   2. ACTION (Comport.) │
       │  Effort min. (1 clic)  │
       │  Motivation maximale   │
       └───────────┬────────────┘
                   │
                   ▼
       ┌────────────────────────┐
       │ 3. VARIABLE REWARD     │
       │  Tribu (Social/Likes)  │
       │  Chasse (Trouvaille)   │
       │  Soi (Accomplissement) │
       └───────────┬────────────┘
                   │
                   ▼
       ┌────────────────────────┐
       │ 4. INVESTMENT          │
       │  Données sauvegardées  │
       │  Amis invités / Profil │
       └────────────────────────┘
```

---

## 🎯 Application Pratique aux Notifications Push & Emails
* **Objet / Push :** Toujours axé sur la curiosité ou la valeur personnelle (`Votre bilan de la semaine est prêt`, `Un nouveau contact a visité votre profil`).
* **Livrable :** Matrice de déclencheurs enregistrée dans `Workspace/campaigns/<nom_campagne>/activation/hook_matrix.md`.
