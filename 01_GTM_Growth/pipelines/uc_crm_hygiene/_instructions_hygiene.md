# 🧹 UC_CRM_Hygiene — Data & Scoring Hors-Ligne

Ce pipeline tourne strictement **hors-ligne**. Il ne fait aucune requête externe facturée. Il se contente de calculer, nettoyer et scorer.

## 🛑 Règle Absolue
Ce module est le garant de l'hygiène (Framework Attio) et de l'intelligence des données. Il opère **AVANT** et **APRÈS** les modules OSINT (B2B/B2C).

## 📋 Modes d'exécution

### Mode `pre` — Nettoyage PRE-OSINT
Avant toute campagne, ce pipeline :
- Génère `Clean_FirstName` (minuscules, sans accents)
- Génère `Clean_Domain` (retrait des "group.", ".careers")
- Vérifie les enregistrements MX des domaines (via dnspython/nslookup)

### Mode `post` — Scoring POST-OSINT
Après enrichissement par B2B/B2C :
- Analyse les colonnes `Email_Source` et `Email_Status`
- Calcule le `Confidence_Score` final (0-100) via le moteur Attio
- Prend la décision d'inclusion/exclusion (`Include_In_CRM`)

### Mode `full` — PRE + POST
Exécute les deux phases en séquence.

## ⚙️ Exécution
```bash
# PRE-OSINT
python pipelines/uc_crm_hygiene/pipeline.py --input data.csv --output clean.csv --mode pre

# POST-OSINT (après enrichissement B2B)
python pipelines/uc_crm_hygiene/pipeline.py --input enriched.csv --output scored.csv --mode post --threshold 60
```

## 🧰 Outils utilisés (hors-ligne uniquement)
- **dnspython / nslookup** — Vérification MX native
- **Scripts Python natifs** — Framework Attio (normalisation + scoring)
