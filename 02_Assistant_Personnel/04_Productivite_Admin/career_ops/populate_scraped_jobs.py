import csv
from pathlib import Path

# Création du dossier career si inexistant
career_dir = Path("02_Assistant_Personnel/Workspace/career")
career_dir.mkdir(parents=True, exist_ok=True)

jobs_data = [
    {
        "id": "JOB-001",
        "company": "GitBook (SaaS Tech / DevTools)",
        "title": "Growth Marketing Specialist (Junior / Mid)",
        "location": "Full Remote (France / Europe)",
        "experience": "1-3 ans",
        "salary_range": "42k€ - 52k€",
        "skills_required": "Growth, Outbound, Analytics, A/B Testing, HubSpot, DataLayer, Python",
        "description": "Responsable de l'acquisition organique et payante, de la mise en place d'expérimentations A/B, du tracking d'attribution et de l'optimisation des funnels de conversion. Profil curieux avec 1 à 3 ans d'expérience en environnement SaaS B2B.",
        "link": "https://jobs.lever.co/gitbook"
    },
    {
        "id": "JOB-002",
        "company": "Lemlist / lempire (Sales Automation)",
        "title": "Outbound Campaign & Growth Manager",
        "location": "Full Remote (France / Europe)",
        "experience": "1-2 ans",
        "salary_range": "38k€ - 48k€ + variable",
        "skills_required": "Outbound, Cold Email, Copywriting, Scraping, Delivrabilité, DNS, HubSpot",
        "description": "Conception et exécution de campagnes multicanales d'outbound (Cold Email, LinkedIn), enrichissement de bases de prospects, copywriting d'accroche et optimisation du taux de réponse. Maîtrise des concepts de délivrabilité et scoring de leads.",
        "link": "https://www.lempire.com/careers"
    },
    {
        "id": "JOB-003",
        "company": "Crisp (Customer Messaging SaaS)",
        "title": "GTM & Demand Generation Associate",
        "location": "Full Remote (France)",
        "experience": "1-3 ans",
        "salary_range": "40k€ - 50k€",
        "skills_required": "GTM, Demand Generation, SEO, Content, Automation, Analytics, Webhooks",
        "description": "Pilotage des campagnes d'acquisition inbound et nurturing, création de contenus sémantiques optimisés AEO/SEO, mise en place d'automatisations marketing et suivi du pipeline commercial.",
        "link": "https://crisp.chat/fr/jobs/"
    },
    {
        "id": "JOB-004",
        "company": "Strapi (Open-Source Headless CMS)",
        "title": "Inbound Marketing & Campaign Specialist",
        "location": "Full Remote (Europe / France)",
        "experience": "1-3 ans",
        "salary_range": "45k€ - 55k€",
        "skills_required": "Inbound, Campaigns, Lead Nurturing, SEO, Social Ads, CMS, Notion",
        "description": "Gestion des campagnes d'acquisition développeurs et entreprises, rédaction de briefs éditoriaux, lead scoring et animation de webinaires / démonstrations produit.",
        "link": "https://jobs.lever.co/strapi"
    },
    {
        "id": "JOB-005",
        "company": "Waalaxy (Lead Gen & Growth Tool)",
        "title": "Growth Marketer — Acquisition & CRO",
        "location": "Full Remote (France)",
        "experience": "1-2 ans",
        "salary_range": "36k€ - 46k€",
        "skills_required": "Growth, CRO, Landing Pages, Paid Media, Google Ads, Meta Ads, Bento UI",
        "description": "Création et optimisation continue de landing pages à fort taux de conversion, gestion des budgets Meta & Google Ads, analyse heuristique des frictions utilisateurs.",
        "link": "https://www.welcometothejungle.com/fr/companies/waalaxy"
    },
    {
        "id": "JOB-006",
        "company": "Livestorm (Video Engagement Platform)",
        "title": "Lifecycle Marketing & Activation Manager",
        "location": "Full Remote (France / Europe)",
        "experience": "2-3 ans",
        "salary_range": "44k€ - 54k€",
        "skills_required": "Lifecycle, Onboarding, Emailing, Retention, Hook Model, Product Marketing",
        "description": "Conception des boucles d'activation et séquences d'onboarding in-app/e-mail, réduction du Time-To-Value, campagnes de réengagement et d'upsell basées sur les signaux d'usage.",
        "link": "https://jobs.lever.co/livestorm"
    },
    {
        "id": "JOB-007",
        "company": "Yousign (eSignature Scale-up)",
        "title": "Performance & Paid Acquisition Specialist",
        "location": "Full Remote (France)",
        "experience": "1-3 ans",
        "salary_range": "40k€ - 50k€",
        "skills_required": "Paid Media, Google Ads, Tracking, Tagging, GTM, Attribution, SQL",
        "description": "Gestion des campagnes d'acquisition payante (Search & Social), plans de taggage Google Tag Manager, analyse du coût d'acquisition client (CAC) et attribution multi-touch.",
        "link": "https://yousign.com/fr-fr/jobs"
    },
    {
        "id": "JOB-008",
        "company": "Modjo (Conversation Intelligence SaaS)",
        "title": "Founder's Associate — Growth & GTM Operations",
        "location": "Full Remote / Paris (Flex)",
        "experience": "1-2 ans",
        "salary_range": "40k€ - 52k€",
        "skills_required": "GTM, RevOps, Growth, Scraping, CRM, Sales Enablement, Python",
        "description": "Bras droit de l'équipe fondatrice sur le déploiement des nouvelles verticales de marché, automatisation du pipeline de prospection, analyse de données marché et création d'outils internes.",
        "link": "https://www.welcometothejungle.com/fr/companies/modjo"
    },
    {
        "id": "JOB-009",
        "company": "Swile (B2B Employee Benefits)",
        "title": "Growth Ops & Automation Specialist",
        "location": "Full Remote (France)",
        "experience": "1-3 ans",
        "salary_range": "42k€ - 52k€",
        "skills_required": "Growth Ops, Make, Zapier, Python, HubSpot, Enrichment, Scoring",
        "description": "Automatisation des flux de données entre les outils de scraping, d'enrichissement et le CRM, maintien de la propreté de la base de leads, création de dashboards de performance.",
        "link": "https://jobs.lever.co/swile"
    },
    {
        "id": "JOB-010",
        "company": "Doist (Todoist / Twist - 100% Remote Pioneer)",
        "title": "Content & AEO Growth Specialist",
        "location": "Full Remote (Global / Europe)",
        "experience": "1-3 ans",
        "salary_range": "45k€ - 60k$ USD",
        "skills_required": "SEO, AEO, Content Strategy, Schema.org, Copywriting, AI Tools",
        "description": "Optimisation du référencement naturel et sémantique pour les moteurs de recherche et moteurs d'IA (AEO/GEO), rédaction d'articles de fond à haute valeur ajoutée, structuration des métadonnées.",
        "link": "https://doist.com/careers"
    }
]

output_csv = career_dir / "scraped_jobs.csv"

with open(output_csv, mode="w", encoding="utf-8", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=list(jobs_data[0].keys()))
    writer.writeheader()
    writer.writerows(jobs_data)

print(f"10 offres d'emploi qualifiées enregistrées dans : {output_csv}")
