---
name: no-ai-slop
description: Détecte et élimine les tics d'écriture artificiels et clichés générés par les IA (contrastes binaires, superlatifs creux, faux suspense, vocabulaire sur-utilisé) pour garantir un copywriting authentique et humain. À utiliser dans 04_Outbound_and_CRM/ et 02_Acquisition_and_AEO/.
---

# 🛡️ No AI Slop — Règle de Copywriting Authentique & Anti-Clichés

Ce skill sert de garde-fou rédactionnel pour éliminer le "slop" (les tics d'écriture artificiels) dans tous les livrables textuels générés.

---

## 🚫 Les 5 Familles de Slop à Proscrire Absolument

### 1. ❌ Les Contrastes Binaires Artificiels
* *À bannir :* "Ce n'est pas juste un outil, c'est une révolution." / "Il ne s'agit pas de vendre, mais de créer du lien." / "It's not about X, it's about Y."
* *Correction humaine :* Énoncer directement le fait ou le résultat sans mise en scène binaire.

### 2. ❌ Le "Throat-Clearing" & Faux Suspense
* *À bannir :* "Soyons clairs", "Voici la vérité", "Here's the thing", "Let that sink in", "Dans un monde en constante évolution..."
* *Correction humaine :* Entrer directement dans le vif du sujet dès le premier mot.

### 3. ❌ Le Vocabulaire LLM Sur-utilisé
* *À bannir :* "Propulser", "décupler", "révolutionnaire", "disruptif", "incontournable", "delve", "dive deep", "tapestry", "unleash", "elevate".
* *Correction humaine :* Utiliser des verbes d'action précis (mesurer, synchroniser, automatiser, réduire de 15%, tester).

### 4. ❌ La Fausse Profondeur Philosophique
* *À bannir :* "Le futur n'attend pas", "L'avenir est déjà là", "La clé réside dans...".
* *Correction humaine :* Remplacer par une preuve chiffrée, une date ou un exemple d'usage réel.

### 5. ❌ Les Conclusions Mécaniques de Synthèse
* *À bannir :* "En conclusion...", "Pour résumer...", "En définitive...".
* *Correction humaine :* Terminer sur un Call to Action direct ou une question ouverte sans paragraphe de résumé.

---

## 🧪 Validation & Quality Gate
* Avant de sauvegarder un email ou un article dans `Workspace/`, valider le texte avec le linter :
  `python -m toolbox.core.ai_slop_linter`
* Seuil d'acceptation obligatoire : **Purity Score $\ge 85/100$**.
