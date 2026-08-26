---
name: gtm-aeo-geo-optimizer
description: Optimise la structure et la densité sémantique des contenus pour être cité comme source de référence par les moteurs d'intelligence artificielle (AEO/GEO - Perplexity, ChatGPT, Claude). À utiliser dans 02_Acquisition_and_AEO/.
---

# 🤖 AEO & GEO (Generative Engine Optimization)

Ce skill guide l'ingénierie sémantique des contenus afin de maximiser leur probabilité d'être indexés, synthétisés et cités en référence par les LLMs conversationnels.

---

## 🔬 Les 5 Piliers d'Optimisation pour les LLMs

1. **La Structure Question / Réponse Directe (Inverted Pyramid) :**
   - Rédiger la réponse directe et concise (< 40 mots) immédiatement sous chaque sous-titre H2/H3 formulé sous forme de question.
   - Les LLMs extraient prioritairement le premier paragraphe direct.

2. **La Densité d'Entités Nommées (Wikidata & Sémantique) :**
   - Utiliser des termes techniques précis, des concepts établis et des chiffres plutôt que des adjectifs vagues.

3. **Les Tableaux Comparatifs & Listes à Puces :**
   - Les modèles d'IA accordent un poids de confiance supérieur aux données tabulaires et synthétiques.

4. **Le Balisage de Preuve & Données Chiffrées :**
   - Associer chaque affirmation à une source, une statistique ou une méthodologie vérifiable.

5. **Le Balisage Schema.org JSON-LD Associé :**
   - Accompagner systématiquement le contenu d'un bloc `FAQPage` ou `Article` validé.

---

## 🛡️ Validation
Passer le balisage structuré dans `python -m toolbox.core.schema_validator` avant publication.
Enregistrer dans `Workspace/campaigns/<nom_campagne>/acquisition/`.
