import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Lang = "fr" | "en";

type LanguageContextType = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

/* ---------- UI translations ---------- */
const ui: Record<Lang, Record<string, string>> = {
  fr: {
    // Navigation
    "nav.about": "À PROPOS",
    "nav.download": "Télécharger CV",
    "nav.download_alert": "Le CV sera bientôt disponible au téléchargement.",

    // Hero
    "hero.profil": "PROFIL",
    "hero.subtitle": "CX/CS • UX/UI • QA • CRM & Growth",
    "hero.subtitle2": "Un profil hybride au service de votre produit.",
    "hero.explore": "Explorer mes compétences",
    "hero.contact": "Me contacter",

    // Section headers
    "section.skills.title": "COMPÉTENCES",
    "section.skills.subtitle": "EXPLOREZ MES DOMAINES — CHAQUE CATÉGORIE MÈNE AUX EXPÉRIENCES",
    "section.parcours.title": "PARCOURS",
    "section.parcours.subtitle": "MISSIONS RÉCENTES · PRODUIT, QA & B2B",
    "section.formation.title": "FORMATION & CERTIFICATIONS",
    "section.formation.subtitle": "ÉCOLES · BOOTCAMPS · CERTIFICATIONS",
    "section.stack.title": "STACK",
    "section.stack.subtitle": "L'INTÉGRALITÉ DES OUTILS · RANGÉS PAR DOMAINE",

    // Skills explorer
    "skills.experiences": "expérience",
    "skills.experiences_plural": "expériences",
    "skills.tools": "Outils",
    "skills.softskills": "Soft skills",
    "skills.linked": "Expériences liées — cliquez pour ouvrir",
    "skills.more": "En savoir +",
    "skills.scroll": "Faites défiler",

    // Experience cards
    "exp.usecase": "Use Case",
    "exp.tools_count": "outils",
    "exp.formation": "FORMATION",
    "exp.certification": "CERTIFICATION",

    // Formation sub-sections
    "formation.sub_a": "Formations",
    "formation.sub_b": "Certifications",
    "formation.count": "cursus",
    "formation.cert_count": "certifs",

    // Outro
    "outro.merci": "MERCI",
    "outro.discuss": "Discutons de votre prochain projet produit.",

    // About page
    "about.title": "À PROPOS",
    "about.subtitle": "DÉCOUVREZ LE PARCOURS D'ANTOINE LECERF",
    "about.headline1": "UN PROFIL AU SERVICE DU PRODUIT",
    "about.headline2": "ET DE L'ÉVOLUTION",
    "about.bio1": "Mon parcours a commencé dans le domaine de la <strong>communication visuelle</strong>, où j’ai pu développer un réel intérêt autant qu'un regard sur la manière dont une idée prend forme à travers une interface. Au fil de mes études puis de mes premières expériences professionnelles (dont une à l'étranger en support client), j’ai eu l’occasion de concevoir des maquettes de sites web et d’applications mobiles. Comprenant alors que je souhaitais aller plus loin que l’aspect purement graphique, je me suis formé à l’<strong>UX/UI design</strong> ainsi qu’au <strong>développement web</strong> dans une logique de voir \"ce qu'il y a sous le capot\".",
    "about.bio2": "Cette évolution m’a conduit vers la <strong>QA</strong>, un métier de bon sens pour moi, car se situant au croisement du design, de la technique et de l’expérience utilisateur. En travaillant sur la qualité de produits numériques, ainsi que des missions de support technique, j’ai acquis une <strong>vision globale du cycle de vie</strong> d’un produit logiciel : de sa conception à sa mise en production, en passant par les phases de test, de correction et d’<strong>amélioration continue</strong>. Tout cela au sein d'équipes pluridisciplinaires, et d'environnements très variés (de la start-up aux équipes internationales de grands groupes).",
    "about.bio3": "Porté par l’envie de rejoindre une aventure entrepreneuriale en contribuant à un projet innovant, j’ai intégré <strong>Way2Tech.ai</strong>. Recruté dans un premier temps pour assurer la qualité du produit, mes compétences et ma curiosité, ainsi que l'autonomie m'ayant été offerte, ont très rapidement élargi mon périmètre d'action. Au fil du temps, mes missions se sont étendues à des domaines tels que le <strong>growth hacking</strong>, la <strong>gestion de la relation client (CRM)</strong> et le <strong>référencement naturel (SEO)</strong>, avec toujours le même objectif : améliorer la performance du produit et accompagner sa croissance.",
    "about.bio4": "Aujourd’hui, j’apprécie particulièrement les environnements où la <strong>créativité, la technique et la stratégie</strong> se rencontrent. Mon parcours m’a permis de développer un <strong>profil polyvalent</strong>, capable de naviguer entre design, qualité, support et acquisition. J’aime comprendre les <strong>besoins des utilisateurs</strong>, identifier les points de friction et mettre en place des solutions concrètes.",
    "about.engagements": "Mes Engagements",
    "about.engagement_1": "Rigueur & Précision",
    "about.engagement_2": "Empathie Utilisateur",
    "about.engagement_3": "Agilité & Réactivité",
    "about.engagement_4": "Vision ROIste",
    "about.langues": "Langues",
    "about.lang_fr": "Français (Maternel)",
    "about.lang_en": "Anglais (C1 - Full Professional)",
    "about.lang_es": "Espagnol (B1)",
    "about.contact_direct": "Contact Direct",
    "about.email": "Email",
    "about.localisation": "Localisation",
    "about.cta_title": "Besoin d'un profil polyvalent ?",
    "about.cta_text": "Je suis ouvert à de nouvelles opportunités en freelance ou en CDI pour des postes de Product Ops, QA Engineer ou Growth Manager. Je cherche aujourd'hui des opportunités qui me permettraient à terme de renforcer mes compétences en growth marketing.",
    "about.cta_button": "Discutons-en",
    "about.softskills_title": "SOFT SKILLS",
    "about.softskills_subtitle": "COMPÉTENCES HUMAINES & TRANSVERSALES",
    "about.footer": "Antoine Lecerf · 2026 · Profil Hybride",

    // Mentions légales
    "legal.back": "Retour",
    "legal.title": "Mentions légales",
    "legal.editor": "Éditeur du site",
    "legal.email": "Email",
    "legal.phone": "Téléphone",
    "legal.hosting_title": "Hébergement",
    "legal.hosting": "Site hébergé par Vercel.",
    "legal.ip_title": "Propriété intellectuelle",
    "legal.ip": "L'ensemble des contenus présents sur ce site (textes, visuels, logos) est la propriété exclusive de leur auteur, sauf mention contraire.",

    // Use case descriptions (Index.tsx)
    "usecase.way2tech.alt": "Workflow Growth Way2Tech : ICP Mapping, Enrichissement, Segmentation, Outreach personnalisé, Création contenu, Analytics",
    "usecase.way2tech.caption": "Growth Workflow — de l'identification ICP au pilotage full-funnel.",
    "usecase.aubay.intro": "Recette d'un logiciel GED",
    "usecase.aubay.desc": "(Gestion Électronique de Documents) pour un acteur bancaire : workflow QA complet, de la stratégie de test à la livraison, sur des parcours d'indexation, classement, recherche full-text et gestion des droits documentaires.",
    "usecase.aubay.alt": "Workflow QA Aubay sur logiciel GED : Stratégie, Conception, Environnement, Exécution, Anomalies, Reporting",
    "usecase.aubay.caption": "QA Workflow — de la stratégie de test à la recette livrée.",
    "usecase.support.intro": "Support utilisateurs SaaS santé",
    "usecase.support.desc": "(Acteurs leaders du secteur) et plateformes B2B/B2C : pipeline de résolution d'incidents multicanal, alliant écoute client et rigueur technique (analyse APIs REST, lecture de logs, console réseau) pour respecter les SLA et nourrir la roadmap produit.",
    "usecase.support.alt": "Workflow de support technique : Réception, Qualification, Reproduction, Investigation, Résolution, Capitalisation",
    "usecase.support.caption": "Incident Resolution Workflow — du ticket entrant à la capitalisation produit.",
    "usecase.design.intro": "Process de design freelance",
    "usecase.design.desc": "appliqué à l'identité visuelle, l'UI et le motion : du cadrage produit jusqu'à la livraison de supports cohérents print & digital, avec une approche orientée parcours et hiérarchie de l'information.",
    "usecase.design.alt": "Design Workflow : Brief & Recherche, Wireframes, UI Design, Livraison",
    "usecase.design.caption": "Design Workflow — du brief à la livraison.",
    "usecase.telus.intro": "Première immersion en relation client par chat",
    "usecase.telus.desc": "sur un produit digital à fort volume, en environnement international à Sofia : 6 mois centrés sur la réactivité, la satisfaction et la remontée structurée vers le produit.",
    "usecase.telus.alt": "Chat Support Flow Telus : Connexion chat, Diagnostic, Réponse, Feedback",
    "usecase.telus.caption": "Chat Support Flow — temps réel, multilingue, orienté satisfaction.",

    // Aubay use case detail items
    "usecase.aubay.strategie": "Stratégie",
    "usecase.aubay.strategie_d": "cadrage du périmètre GED, analyse de risques, plan de test aligné aux exigences métier & conformité.",
    "usecase.aubay.conception": "Conception",
    "usecase.aubay.conception_d": "cas de tests fonctionnels et de régression, jeux de données documentaires, scénarios d'indexation et de workflow d'approbation.",
    "usecase.aubay.env": "Environnement",
    "usecase.aubay.env_d": "préparation des bases, profils utilisateurs, droits, documents témoins (PDF, Office, scans) pour rejouabilité.",
    "usecase.aubay.exec": "Exécution",
    "usecase.aubay.exec_d": "tests manuels + automatisation Playwright sur les parcours critiques (upload, OCR, recherche, partage).",
    "usecase.aubay.anomalies": "Anomalies",
    "usecase.aubay.anomalies_d": "tri, reproduction, qualification et suivi via Jira / Xray, échanges réguliers PO ↔ dev.",
    "usecase.aubay.reporting": "Reporting",
    "usecase.aubay.reporting_d": "KPIs qualité (couverture, défauts par sévérité), PV de recette et go/no-go de mise en production.",

    // Support use case detail items
    "usecase.support.reception": "Réception",
    "usecase.support.reception_d": "tickets entrants par chat, email ou téléphone, déclenchement SLA et accusé de prise en charge.",
    "usecase.support.qualif": "Qualification",
    "usecase.support.qualif_d": "catégorisation, priorisation, contexte utilisateur et compte concerné.",
    "usecase.support.repro": "Reproduction",
    "usecase.support.repro_d": "replay du parcours, captures, vérification environnement et device.",
    "usecase.support.invest": "Investigation",
    "usecase.support.invest_d": "tests d'endpoints REST avec Postman, lecture de logs applicatifs, console réseau.",
    "usecase.support.resol": "Résolution / Escalade",
    "usecase.support.resol_d": "fix N1-N2 ou escalade structurée vers les équipes dev avec contexte enrichi.",
    "usecase.support.capital": "Capitalisation",
    "usecase.support.capital_d": "article de base de connaissances, scripts de réponses et remontée des pain points produit.",
  },
  en: {
    // Navigation
    "nav.about": "ABOUT",
    "nav.download": "Download CV",
    "nav.download_alert": "CV will be available for download soon.",

    // Hero
    "hero.profil": "PROFILE",
    "hero.subtitle": "CX/CS • UX/UI • QA • CRM & Growth",
    "hero.subtitle2": "A hybrid profile at the service of your product.",
    "hero.explore": "Explore my skills",
    "hero.contact": "Contact me",

    // Section headers
    "section.skills.title": "SKILLS",
    "section.skills.subtitle": "EXPLORE MY EXPERTISE — EACH CATEGORY LEADS TO EXPERIENCES",
    "section.parcours.title": "EXPERIENCE",
    "section.parcours.subtitle": "RECENT MISSIONS · PRODUCT, QA & B2B",
    "section.formation.title": "EDUCATION & CERTIFICATIONS",
    "section.formation.subtitle": "SCHOOLS · BOOTCAMPS · CERTIFICATIONS",
    "section.stack.title": "STACK",
    "section.stack.subtitle": "FULL TOOLSET · SORTED BY DOMAIN",

    // Skills explorer
    "skills.experiences": "experience",
    "skills.experiences_plural": "experiences",
    "skills.tools": "Tools",
    "skills.softskills": "Soft skills",
    "skills.linked": "Related experiences — click to open",
    "skills.more": "Learn more",
    "skills.scroll": "Scroll right",

    // Experience cards
    "exp.usecase": "Use Case",
    "exp.tools_count": "tools",
    "exp.formation": "EDUCATION",
    "exp.certification": "CERTIFICATION",

    // Formation sub-sections
    "formation.sub_a": "Education",
    "formation.sub_b": "Certifications",
    "formation.count": "programs",
    "formation.cert_count": "certs",

    // Outro
    "outro.merci": "THANKS",
    "outro.discuss": "Let's discuss your next product project.",

    // About page
    "about.title": "ABOUT",
    "about.subtitle": "DISCOVER ANTOINE LECERF'S CAREER PATH",
    "about.headline1": "A PROFILE AT THE SERVICE OF",
    "about.headline2": "PRODUCT AND EVOLUTION",
    "about.bio1": "My journey started in <strong>visual communication</strong>, where I developed a real interest and an eye for how an idea takes shape through an interface. Throughout my studies and my first professional experiences (including one abroad in customer support), I had the opportunity to design mockups for websites and mobile applications. Realizing that I wanted to go beyond the purely graphic aspect, I trained in <strong>UX/UI design</strong> as well as <strong>web development</strong> with the logic of looking \"under the hood\".",
    "about.bio2": "This evolution led me to <strong>QA</strong>, a common-sense profession for me, as it sits at the crossroads of design, tech, and user experience. By working on the quality of digital products, as well as technical support missions, I gained a <strong>global vision of a software product's lifecycle</strong>: from its conception to its release in production, through the testing, correction, and <strong>continuous improvement</strong> phases. All this within multidisciplinary teams and highly varied environments (from startups to international teams in large corporate groups).",
    "about.bio3": "Driven by the desire to join an entrepreneurial adventure by contributing to an innovative project, I joined <strong>Way2Tech.ai</strong>. Initially hired to ensure product quality, my skills and curiosity, along with the autonomy given to me, very quickly expanded my scope of action. Over time, my missions extended to areas such as <strong>growth hacking</strong>, <strong>customer relationship management (CRM)</strong>, and <strong>search engine optimization (SEO)</strong>, always with the same goal: improving product performance and supporting its growth.",
    "about.bio4": "Today, I particularly appreciate environments where <strong>creativity, tech, and strategy</strong> meet. My background has allowed me to develop a <strong>versatile profile</strong>, able to navigate between design, quality, support, and acquisition. I love understanding <strong>user needs</strong>, identifying friction points, and implementing concrete solutions.",
    "about.engagements": "My Commitments",
    "about.engagement_1": "Rigor & Precision",
    "about.engagement_2": "User Empathy",
    "about.engagement_3": "Agility & Responsiveness",
    "about.engagement_4": "ROI-driven Vision",
    "about.langues": "Languages",
    "about.lang_fr": "French (Native)",
    "about.lang_en": "English (C1 - Full Professional)",
    "about.lang_es": "Spanish (B1)",
    "about.contact_direct": "Direct Contact",
    "about.email": "Email",
    "about.localisation": "Location",
    "about.cta_title": "Need a versatile profile?",
    "about.cta_text": "I am open to new freelance or full-time opportunities for Product Ops, QA Engineer or Growth Manager roles. I am currently looking for opportunities that would allow me to further strengthen my growth marketing skills.",
    "about.cta_button": "Let's talk",
    "about.softskills_title": "SOFT SKILLS",
    "about.softskills_subtitle": "HUMAN & CROSS-FUNCTIONAL SKILLS",
    "about.footer": "Antoine Lecerf · 2026 · Hybrid Profile",

    // Mentions légales
    "legal.back": "Back",
    "legal.title": "Legal Notice",
    "legal.editor": "Website Editor",
    "legal.email": "Email",
    "legal.phone": "Phone",
    "legal.hosting_title": "Hosting",
    "legal.hosting": "Website hosted by Vercel.",
    "legal.ip_title": "Intellectual Property",
    "legal.ip": "All content on this website (text, visuals, logos) is the exclusive property of the author, unless otherwise stated.",

    // Use case descriptions (Index.tsx)
    "usecase.way2tech.alt": "Growth Workflow Way2Tech: ICP Mapping, Enrichment, Segmentation, Personalized Outreach, Content Creation, Analytics",
    "usecase.way2tech.caption": "Growth Workflow — from ICP identification to full-funnel management.",
    "usecase.aubay.intro": "Testing a DMS software",
    "usecase.aubay.desc": "(Document Management System) for a banking client: complete QA workflow, from test strategy to delivery, covering indexing, classification, full-text search and document rights management.",
    "usecase.aubay.alt": "QA Workflow Aubay on DMS software: Strategy, Design, Environment, Execution, Defects, Reporting",
    "usecase.aubay.caption": "QA Workflow — from test strategy to delivered acceptance.",
    "usecase.support.intro": "SaaS healthcare user support",
    "usecase.support.desc": "(Industry leading companies) and B2B/B2C platforms: multichannel incident resolution pipeline, combining customer listening and technical rigor (REST API analysis, log reading, network console) to meet SLAs and feed the product roadmap.",
    "usecase.support.alt": "Technical Support Workflow: Reception, Qualification, Reproduction, Investigation, Resolution, Capitalization",
    "usecase.support.caption": "Incident Resolution Workflow — from incoming ticket to product capitalization.",
    "usecase.design.intro": "Freelance design process",
    "usecase.design.desc": "applied to visual identity, UI and motion: from product scoping to delivery of consistent print & digital assets, with an approach focused on user journey and information hierarchy.",
    "usecase.design.alt": "Design Workflow: Brief & Research, Wireframes, UI Design, Delivery",
    "usecase.design.caption": "Design Workflow — from brief to delivery.",
    "usecase.telus.intro": "First immersion in customer relations via chat",
    "usecase.telus.desc": "on a high-volume digital product, in an international environment in Sofia: 6 months focused on responsiveness, satisfaction and structured feedback to the product team.",
    "usecase.telus.alt": "Chat Support Flow Telus: Chat Connection, Diagnosis, Response, Feedback",
    "usecase.telus.caption": "Chat Support Flow — real-time, multilingual, satisfaction-oriented.",

    // Aubay use case detail items
    "usecase.aubay.strategie": "Strategy",
    "usecase.aubay.strategie_d": "DMS scope framing, risk analysis, test plan aligned with business requirements & compliance.",
    "usecase.aubay.conception": "Design",
    "usecase.aubay.conception_d": "functional and regression test cases, document data sets, indexing scenarios and approval workflows.",
    "usecase.aubay.env": "Environment",
    "usecase.aubay.env_d": "database preparation, user profiles, permissions, reference documents (PDF, Office, scans) for replayability.",
    "usecase.aubay.exec": "Execution",
    "usecase.aubay.exec_d": "manual tests + Playwright automation on critical paths (upload, OCR, search, sharing).",
    "usecase.aubay.anomalies": "Defects",
    "usecase.aubay.anomalies_d": "sorting, reproduction, qualification and tracking via Jira / Xray, regular PO ↔ dev exchanges.",
    "usecase.aubay.reporting": "Reporting",
    "usecase.aubay.reporting_d": "quality KPIs (coverage, defects by severity), acceptance report and go/no-go for production release.",

    // Support use case detail items
    "usecase.support.reception": "Reception",
    "usecase.support.reception_d": "incoming tickets via chat, email or phone, SLA triggering and acknowledgment.",
    "usecase.support.qualif": "Qualification",
    "usecase.support.qualif_d": "categorization, prioritization, user context and account involved.",
    "usecase.support.repro": "Reproduction",
    "usecase.support.repro_d": "journey replay, screenshots, environment and device verification.",
    "usecase.support.invest": "Investigation",
    "usecase.support.invest_d": "REST endpoint testing with Postman, application log reading, network console.",
    "usecase.support.resol": "Resolution / Escalation",
    "usecase.support.resol_d": "L1-L2 fix or structured escalation to dev teams with enriched context.",
    "usecase.support.capital": "Capitalization",
    "usecase.support.capital_d": "knowledge base article, response scripts and product pain point escalation.",
  },
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("portfolio-lang") as Lang) || "fr";
    }
    return "fr";
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("portfolio-lang", l);
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key: string): string => ui[lang][key] ?? ui.fr[key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
