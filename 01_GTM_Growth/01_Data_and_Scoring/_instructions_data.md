# 🧠 Hub de Traitement : Data & Scoring

Ce module est le garant de l'hygiène (Attio Framework) et de l'intelligence de nos données. Il opère AVANT et APRÈS le module OSINT.

**1. Rôle PRE-OSINT (Nettoyage & Normalisation) :**
- Avant toute campagne, c'est ce module qui génère les scripts pour créer les colonnes `Clean_FirstName` (minuscules, sans accents) et `Clean_Domain` (retrait des "group.", ".careers").

**2. Rôle POST-OSINT (Scoring & Validation) :**
- Ce module récupère les fichiers bruts sortis par l'OSINT.
- C'est lui qui analyse la colonne `Email_Source` et `SMTP_Status` pour générer le `Confidence_Score` (ex: si Source = Dropcontact, Score = 90. Si Source = Snovio Guess, Score = 50).
- C'est lui qui prend la décision finale d'inclure ou d'exclure un lead de la campagne CRM.
