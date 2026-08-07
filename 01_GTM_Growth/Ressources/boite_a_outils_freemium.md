# 🧰 Référentiel des Outils Freemium (Inspiré de free-for.dev)

Ce document liste les alternatives gratuites utilisables en cas de blocage technique.

**1. Finders — Recherche d'emails B2B**
- *Hunter.io* (25 recherches/mois) : Standard pour identifier le pattern d'email d'un domaine.
- *Voila Norbert* (50 leads/mois) : L'un des moteurs les plus précis du marché.
- *Tomba.io* (50 recherches/mois) : Alternative solide dans la rotation.
- *Snov.io* (50 crédits/mois) : Alternative avec flow OAuth.
- *Prospeo* (75 crédits/mois) : Alternative solide.
- *Dropcontact* (Premium) : Excellent sur le marché EU (RGPD).
- *theHarvester* (Open Source) : Fallback OSINT, moissonne les moteurs de recherche.
- *infoga* (Open Source) : Complément agressif à theHarvester.

**2. Verifiers — Validation technique d'emails**
- *ZeroBounce* (100 vérifications/mois) : Référence pour le statut SMTP exact.
- *AbstractAPI* (100 vérifications/mois) : Solution de secours (email + IP + phone).
- *Email-Checker* (variable) : Solution de secours supplémentaire.

**3. Investigators — Deep OSINT & Profiling B2C**
- *Epieos* (API) : Lie un email à des comptes sociaux sans requête SMTP.
- *phonebook.cz / Intelligence X* (API) : Archives historiques d'emails et domaines.
- *h8mail* (Open Source) : Recherche dans les fuites de données (Data Breaches).
- *EmailRep* (API gratuite) : Réputation d'adresse (âge, spam, jetable).

**4. Contournement de Blocage IP / CAPTCHA (Scraping)**
- *ScraperAPI* (1000 req/mois) : Gère les proxys résidentiels.
- *ScrapingBee* (1000 req/mois) : Idéal pour les sites avec rendu JavaScript lourd.

**5. Webhooks & Connecteurs**
- *Pipedream / Make* : Utile si un script Python natif échoue à cause d'une API trop complexe ; utiliser un webhook HTTP simple vers ces plateformes.
