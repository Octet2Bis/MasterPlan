# 🕵️‍♂️ UC_B2C_Investigation — Deep OSINT & Profiling

Ce pipeline est dédié à l'investigation pure, s'appuyant fortement sur l'open source pour trouver l'empreinte numérique d'un individu.

## 🛑 Différence avec B2B
Contrairement à la cascade B2B (qui s'arrête dès qu'un résultat Valid est trouvé), ici **TOUS les Investigators sont exécutés** car chaque source apporte des données complémentaires.

## 🔍 Les Investigators (configurables via YAML)

### Collecte d'Empreintes (Social & Deep Web) :
1. **Epieos** (API) — Lie un email à des comptes existants (Google Maps, Skype) sans SMTP.
2. **phonebook.cz / Intelligence X** (API) — Archives historiques d'emails et domaines.

### Preuves de Vie (Validation par l'historique) :
3. **h8mail** (Open Source) — Recherche dans les fuites de données (Data Breaches).
4. **EmailRep** (API) — Réputation de l'adresse (âge, spam, adresse jetable).

## ⚙️ Exécution
```bash
docker run --rm \
  --env-file .secrets/.env \
  -v $(pwd)/Workspace:/app/data \
  antigravity-toolbox \
  --pipeline b2c --input /app/data/emails_cibles.csv --output /app/data/report_b2c.json
```

## 📊 Format de sortie
- **JSON** : Rapport détaillé avec les findings de chaque Investigator.
- **CSV** : Résumé avec Email, Sources utilisées, Confiance max.
