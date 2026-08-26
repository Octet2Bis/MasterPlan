---
name: gtm-b2b-partnership-outreach
description: Rédige des séquences de prospection et d'approche de partenariats stratégiques B2B non-agressives, hyper-personnalisées et orientées valeur (Wonderbox, Accor, grands comptes). À utiliser dans 04_Outbound_and_CRM/.
---

# 🤝 B2B Partnership & Strategic Alliances Outreach

Ce skill guide l'agent pour concevoir des campagnes d'approche pour les **Directeurs et Responsables de Partenariats / Alliances Stratégiques**.

---

## 🎯 Principes Fondamentaux de l'Approche Partenariats
1. **Posture Peer-to-Peer :** Ne jamais pitcher comme un vendeur de logiciel. Parler de "synergies d'audience", d'"échange de visibilité" et d'"effet de levier mutuel".
2. **Concision Extrême :** Moins de 120 mots par email. Les cadres dirigeants lisent sur smartphone en 15 secondes.
3. **Signal d'Intention (*Attachment*) :** Ancrer l'email sur une actualité réelle du compte (ex: nouvelle gamme Wonderbox, expansion Accor, saisonnalité).
4. **Injection SSOT Obligatoire :** Charger les variables clés depuis `Ressources/Knowledge/product-marketing-b2b.md`.

---

## 📋 Architecture d'une Séquence en 3 Touches

### Touch 1 (J0) : L'Accroche Synergie (Framework PAS)
* **Objet :** `Partenariat {{COMPANY}} x [Notre Solution] ?` ou `Synergie [Secteur] / {{FIRSTNAME}}`
* **Structure :**
  - Salutation sobre : `Bonjour {{FIRSTNAME}},`
  - Contexte / Constat métier : `J'ai remarqué votre développement récent sur [Segment/Actualité] chez {{COMPANY}}.`
  - Le Pain partagé / L'Opportunité : `Beaucoup de directeurs de partenariats dans [Secteur] font face à [PAIN_POINT].`
  - La Proposition de Valeur concrète : `Nous avons développé [VALUE_PROP] permettant de générer [BENEFICE_CHIFFRE] sans [FRICTION].`
  - CTA Doux & Non-engageant : `Seriez-vous ouvert à un rapide échange de 10 min mardi ou jeudi pour voir si une synergie fait sens ?`

### Touch 2 (J+3) : L'Actif de Valeur / Preuve Sociale
* **Objet :** `Re: Partenariat {{COMPANY}} x [Notre Solution]`
* **Structure :** Partager un exemple concret ou un actif sans rien demander de lourd en retour.
  - *Exemple :* `Bonjour {{FIRSTNAME}}, pour faire suite à mon mot, voici comment nous avons permis à [Acteur similaire] de [Résultat mesurable]. Seriez-vous disponible pour un tour d'horizon rapide ?`

### Touch 3 (J+7) : Le Break-Up Email Élégant
* **Objet :** `Dernier mot / Partenariat {{COMPANY}}`
* **Structure :** Clôturer la boucle avec courtoisie.
  - *Exemple :* `Bonjour {{FIRSTNAME}}, je suppose que ce n'est pas votre priorité du moment. Je ne vous relance plus. Si le sujet du [BENEFICE] redevient d'actualité, vous avez mes coordonnées. Excellente continuation !`

---

## 🛡️ Quality Gate & Validation
* Passer impérativement le texte dans `python -m toolbox.core.email_linter --body "..."` avant d'exporter dans `Workspace/campaigns/<nom>/outbound/`.
