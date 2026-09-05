/**
 * remote_company_indexer.js — Moissonneur & Indexeur d'Entreprises 100% Remote
 * Pilier : 02_Assistant_Personnel / Career Ops
 * Rôle : Enrichit en continu la base verified_remote_companies.json
 *        à partir des entreprises sourcées sur les flux certifiés télétravail.
 * Plafond strict : < 140 lignes (AGENTS.md).
 */

const fs = require('node:fs');
const path = require('node:path');

function slugify(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 30);
}

function inferDomainAndAngle(job) {
  const title = (job.title || '').toLowerCase();
  const desc = (job.description || '').toLowerCase();
  const skills = (job.skills_required || '').toLowerCase();
  const combined = `${title} ${desc} ${skills}`;

  let domain = 'Scale-up Tech & Services Numériques';
  let targetRole = 'Head of Growth / CEO';
  let angle = "Optimisation de l'acquisition multicanale, tracking d'attribution et automatisation opérationnelle n8n.";

  if (combined.includes('saas') || combined.includes('b2b') || combined.includes('software')) {
    domain = 'B2B SaaS & Outils Collaboratifs Cloud';
    targetRole = 'Head of Growth / VP Marketing';
    angle = "Accélération du pipeline d'inbound et outbound ciblée, plans de taggage GTM et optimisation de l'activation produit (PLG).";
  } else if (combined.includes('crm') || combined.includes('lifecycle') || combined.includes('retention')) {
    domain = 'Platforme Numérique & Rétention Client';
    targetRole = 'Head of CRM & Lifecycle';
    angle = "Structuration de boucles d'onboarding personnalisées, segmentation de base et réactivation automatisée de comptes dormants.";
  } else if (combined.includes('product') || combined.includes('ops') || combined.includes('operations')) {
    domain = 'Product Ops & Automatisation des Flux';
    targetRole = 'Head of Product Operations / VP Ops';
    angle = "Fluidification des processus entre équipes, fiabilisation des flux de données et création d'automatisations No-Code/API.";
  } else if (combined.includes('ecommerce') || combined.includes('b2c') || combined.includes('paid')) {
    domain = 'E-Commerce & Marque Digitale D2C';
    targetRole = 'Head of Performance / CMO';
    angle = "Optimisation continue du ROAS (Meta & Google Ads), tracking server-side (CAPI) et expérimentations CRO sur les pages de vente.";
  }

  return { domain, targetRole, angle };
}

function indexRemoteCompanies(rawJobs = [], careerDir) {
  const dbPath = path.join(careerDir, 'verified_remote_companies.json');
  let companies = [];
  if (fs.existsSync(dbPath)) {
    try { companies = JSON.parse(fs.readFileSync(dbPath, 'utf8')); } catch {}
  }

  const existingSlugs = new Set(companies.map(c => (c.id || '').toLowerCase()));
  const existingNames = new Set(companies.map(c => (c.name || '').toLowerCase()));
  const newlyAdded = [];

  for (const j of rawJobs) {
    if (!j || !j.company) continue;
    const cleanName = j.company.replace(/\(.*?\)/g, '').replace(/[\t\n]/g, '').trim();
    if (!cleanName || cleanName.length < 2 || cleanName.toLowerCase() === 'scale-up tech' || cleanName.toLowerCase() === 'inconnue') continue;

    const slug = slugify(cleanName);
    if (!slug || existingSlugs.has(slug) || existingNames.has(cleanName.toLowerCase())) continue;

    // Ne retenir que les entreprises provenant de plateformes 100% remote ou validées remote
    const isRemotePlatform = ['himalayas', 'remoteok', 'remotive', 'working nomads', 'jobspresso', 'weworkremotely', 'arbeitnow'].some(
      s => (j.source || '').toLowerCase().includes(s)
    );
    const hasRemoteLocation = (j.location || '').toLowerCase().includes('remote') || (j.location || '').toLowerCase().includes('télétravail');

    if (!isRemotePlatform && !hasRemoteLocation) continue;

    const { domain, targetRole, angle } = inferDomainAndAngle(j);
    const dateStr = j.date_published || new Date().toISOString().slice(0, 10);

    const record = {
      id: slug,
      name: cleanName,
      domain,
      remote_status: '100% Full Remote (Vérifié par recrutement actif)',
      verification_badge: `VÉRIFIÉ : Recrutement en télétravail complet (${j.source || 'Plateforme Remote'}) [${dateStr}]`,
      careers_url: j.link || `https://www.google.com/search?q=${encodeURIComponent(cleanName + ' careers')}`,
      spontaneous_allowed: true,
      decision_maker_role: targetRole,
      attack_angle: angle,
      first_seen: new Date().toISOString()
    };

    companies.push(record);
    existingSlugs.add(slug);
    existingNames.add(cleanName.toLowerCase());
    newlyAdded.push(record);
  }

  if (newlyAdded.length > 0) {
    fs.writeFileSync(dbPath, JSON.stringify(companies, null, 2), 'utf8');
  }

  return {
    newlyAdded,
    totalCount: companies.length
  };
}

module.exports = { indexRemoteCompanies, slugify, inferDomainAndAngle };
