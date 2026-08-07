# 🏢 UC_B2B_Enrichment — Génération de Leads Outbound

Ce pipeline utilise la **méthode de la cascade (Waterfall)** pour maximiser le taux de découverte tout en minimisant les coûts d'API.

## 🛑 Règle du "Dumb Pipe" (Canal Passif)
Ce pipeline est un canal passif. Son seul rôle est de prendre une donnée stricte (Prénom, Nom, Domaine), de l'envoyer aux outils Finders/Verifiers configurés dans `cascade_config.yaml`, et d'enregistrer la donnée brute retournée. Il a l'INTERDICTION d'altérer la donnée d'origine ou de la juger.

## 🔀 Ordre de la Cascade (configurable via YAML)

### Les Finders (Recherche d'emails) :
1. **Hunter.io** (API) — Le standard pour identifier le pattern d'email.
2. **Voila Norbert** (API) — L'un des moteurs les plus précis du marché.
3. **Tomba.io** (API) — Alternative solide dans la rotation.
4. **Snov.io** (API) — Alternative dans la rotation.
5. **Prospeo** (API) — Alternative dans la rotation.
6. **Dropcontact** (API - Premium) — En fin de cascade. Excellent pour l'EU/RGPD.
7. **theHarvester** (Open Source) — Fallback OSINT ultime si toutes les API échouent.

### Les Verifiers (Validation technique) :
1. **ZeroBounce** (API) — Référence pour le statut SMTP (Valid, Catch-All, Invalid).
2. **AbstractAPI** (API) — Solution de secours.
3. **Email-Checker** (API) — Solution de secours supplémentaire.

## ⚙️ Exécution
```bash
# Via Docker
docker run --rm \
  --env-file .secrets/.env \
  -v $(pwd)/Workspace:/app/data \
  antigravity-toolbox \
  --pipeline b2b --input /app/data/test_leads.csv --output /app/data/output_b2b.csv
```

## 📊 Colonnes de sortie
| Colonne | Description |
|---|---|
| `Clean_FirstName` | Prénom normalisé (minuscules, sans accents) |
| `Clean_Domain` | Domaine nettoyé (sans www., group., etc.) |
| `Email_Found` | Email trouvé par la cascade |
| `Email_Source` | Nom du Finder qui a trouvé l'email |
| `Email_Status` | Statut technique (Valid, Catch-All, Risky, Invalid) |
| `Confidence_Score` | Score final Attio (0-100) |
