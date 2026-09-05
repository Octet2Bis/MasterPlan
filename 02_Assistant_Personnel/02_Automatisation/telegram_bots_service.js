/**
 * AEVUM / MASTER PLAN — TELEGRAM TRI-BOT HARDENED SERVICE (Node.js 24)
 * Pilier : 02_Assistant_Personnel
 * Rôle : Orchestrateur tri-canal :
 *   1. PRO : Recherche de travail 100% remote & validation human-in-the-loop
 *   2. PERSO : Coach personnel, rituels & second cerveau
 *   3. RESEARCH : Agent d'extraction de veille, analyse & comptes-rendus d'applicabilité
 * Plafond strict : < 240 lignes (AGENTS.md).
 */

const fs = require('node:fs');
const path = require('node:path');

const { SessionStore } = require('./core/session_store');
const { AtomicGraphStore } = require('./core/atomic_graph_store');
const { RateLimiter } = require('./core/security_guard');
const { HardenedTelegramBot } = require('./core/telegram_client');
const { CoachEngine } = require('./core/coach_engine');
const { MeetingIngestor } = require('./core/meeting_ingestor');
const { HermesIngestionAdapter } = require('./hermes_adapter');
const { CareerBotEngine } = require('./core/career_bot_engine');
const { ResearchBotEngine } = require('./core/research_bot_engine');

const BASE_DIR = path.resolve(__dirname, '..');
const WORKSPACE_DIR = path.join(BASE_DIR, 'Workspace');
const SECRETS_DIR = path.join(BASE_DIR, '.secrets');
const ENV_FILE = fs.existsSync(path.join(SECRETS_DIR, '.env')) ? path.join(SECRETS_DIR, '.env') : path.join(BASE_DIR, '.env');
const CAREER_DIR = fs.existsSync(path.join(WORKSPACE_DIR, 'career')) ? path.join(WORKSPACE_DIR, 'career') : path.join(BASE_DIR, 'career');
const STATE_FILE = path.join(SECRETS_DIR, 'session_state.json');

const INBOX_PRO = path.join(WORKSPACE_DIR, 'inbox_pro');
const INBOX_PERSO = path.join(WORKSPACE_DIR, 'inbox_perso');
const INBOX_RESEARCH = path.join(WORKSPACE_DIR, 'research_inbox');
const QUARANTINE_DIR = path.join(WORKSPACE_DIR, '.quarantine');
const DB_PRO_FILE = path.join(WORKSPACE_DIR, 'pro_market_graph.json');
const DB_PERSO_FILE = path.join(WORKSPACE_DIR, 'perso_journal_graph.json');

for (const dir of [INBOX_PRO, INBOX_PERSO, INBOX_RESEARCH, QUARANTINE_DIR, SECRETS_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadEnv() {
  const env = {};
  if (fs.existsSync(ENV_FILE)) {
    const lines = fs.readFileSync(ENV_FILE, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [k, ...rest] = trimmed.split('=');
        env[k.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  }
  return env;
}

const ENV = loadEnv();
const TOKEN_PRO = process.env.TELEGRAM_BOT_TOKEN_PRO || ENV.TELEGRAM_BOT_TOKEN_PRO || '';
const TOKEN_PERSO = process.env.TELEGRAM_BOT_TOKEN_PERSO || ENV.TELEGRAM_BOT_TOKEN_PERSO || '';
const TOKEN_RESEARCH = process.env.TELEGRAM_BOT_TOKEN_RESEARCH || ENV.TELEGRAM_BOT_TOKEN_RESEARCH || '';
const ALLOWED_USER_ID = String(process.env.TELEGRAM_ALLOWED_USER_ID || ENV.TELEGRAM_ALLOWED_USER_ID || '').trim();
const SECURITY_PIN = String(process.env.TELEGRAM_SECURITY_PIN || ENV.TELEGRAM_SECURITY_PIN || '1234').trim();

process.env.TELEGRAM_BOT_TOKEN_PRO = TOKEN_PRO;
process.env.TELEGRAM_ALLOWED_USER_ID = ALLOWED_USER_ID;

const sessionStore = new SessionStore(STATE_FILE);
const rateLimiter = new RateLimiter();
const dbPro = new AtomicGraphStore(DB_PRO_FILE);
const dbPerso = new AtomicGraphStore(DB_PERSO_FILE);
const hermes = new HermesIngestionAdapter();
const coachEngine = new CoachEngine(BASE_DIR);
const meetingIngestor = new MeetingIngestor(BASE_DIR);
const careerEngine = new CareerBotEngine(BASE_DIR);
const researchEngine = new ResearchBotEngine(BASE_DIR);

function handleNewObservation(botType) {
  try { hermes.reindexGraph(botType.toLowerCase()); }
  catch (err) { console.error(`[HERMES] Erreur réindexation (${botType}): ${err.message}`); }
}

const botPro = new HardenedTelegramBot({
  token: TOKEN_PRO, botType: 'PRO', inboxDir: INBOX_PRO, quarantineDir: QUARANTINE_DIR,
  dbStore: dbPro, sessionStore, rateLimiter, allowedUserId: ALLOWED_USER_ID,
  securityPin: SECURITY_PIN, careerEngine, onNewObservation: handleNewObservation
});

const botPerso = new HardenedTelegramBot({
  token: TOKEN_PERSO, botType: 'PERSO', inboxDir: INBOX_PERSO, quarantineDir: QUARANTINE_DIR,
  dbStore: dbPerso, sessionStore, rateLimiter, allowedUserId: ALLOWED_USER_ID,
  securityPin: SECURITY_PIN, coachEngine, onNewObservation: handleNewObservation
});

const botResearch = new HardenedTelegramBot({
  token: TOKEN_RESEARCH, botType: 'RESEARCH', inboxDir: INBOX_RESEARCH, quarantineDir: QUARANTINE_DIR,
  dbStore: null, sessionStore, rateLimiter, allowedUserId: ALLOWED_USER_ID,
  securityPin: SECURITY_PIN, researchEngine
});

async function main() {
  console.log('======================================================================');
  console.log('🛡️ SERVICE TELEGRAM HARDENED TRI-CANAL (MASTER PLAN)');
  console.log('======================================================================');
  console.log(`💼 Bot PRO (Job Hunter)   : ${botPro.isConfigured() ? '✅ OUI' : '❌ NON'}`);
  console.log(`🎨 Bot PERSO (Coach)      : ${botPerso.isConfigured() ? '✅ OUI' : '❌ NON'}`);
  console.log(`🔬 Bot RESEARCH (Veille)  : ${botResearch.isConfigured() ? '✅ OUI' : '❌ NON'}`);
  console.log(`🛡️ Whitelist ID           : ${ALLOWED_USER_ID ? `✅ ${ALLOWED_USER_ID} (Fail-Closed)` : '🚨 NON DÉFINI'}`);
  console.log(`🔑 Session 2FA            : ${sessionStore.isUnlocked() ? '🔓 Active' : '🔒 Verrouillée'}`);
  console.log('======================================================================\n');

  if (botPro.isConfigured()) {
    await botPro.setCommands([
      { command: 'jobs', description: 'Radar offres qualifiées (statut validation)' },
      { command: 'radar', description: 'Rapport synthétique du dernier scan 15 min' },
      { command: 'valider', description: 'Valider une offre & générer le CV (/valider 1)' },
      { command: 'remarque', description: 'Faire une remarque sur le CV (/remarque 1 ...)' },
      { command: 'cv', description: 'Consulter le CV & pitch (/cv 1)' },
      { command: 'postuler', description: 'Candidature 1-clic (/postuler 1)' },
      { command: 'spontane', description: 'Entreprises 100% remote vérifié' },
      { command: 'scanremote', description: 'Scanner les sites carrières 100% remote' },
      { command: 'hermes', description: 'Discuter avec ton IA locale Qwen 2.5' },
      { command: 'status', description: 'Statut du système & session' },
      { command: 'unlock', description: 'Déverrouiller avec le code PIN' }
    ]);
  }

  if (botPerso.isConfigured()) {
    await botPerso.setCommands([
      { command: 'matin', description: 'Rituel d activation matinale' },
      { command: 'respi', description: 'Pause respiration & cohérence' },
      { command: 'soir', description: 'Clôture de journée & bilan' },
      { command: 'bilan', description: 'Bilan de vitalité & habitudes' },
      { command: 'status', description: 'Statut du système & session' }
    ]);
  }

  if (botResearch.isConfigured()) {
    await botResearch.setCommands([
      { command: 'reports', description: 'Consulter les derniers comptes-rendus' },
      { command: 'search', description: 'Rechercher dans les ressources indexées' },
      { command: 'dev', description: 'Recherche technique dans Firecrawl (70M+ docs)' },
      { command: 'help', description: 'Guide du bot de veille & analyse' },
      { command: 'status', description: 'Statut de l agent de recherche' },
      { command: 'unlock', description: 'Déverrouiller avec le code PIN' }
    ]);
  }

  let isRunning = true;
  let loopCount = 0;
  const cleanup = () => {
    if (!isRunning) return;
    isRunning = false;
    console.log('\n[DAEMON] Arrêt propre du service Telegram tri-canal...');
    process.exit(0);
  };
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  let lastJobScanAt = 0;
  let lastDailyScanAt = 0;

  while (isRunning) {
    loopCount++;
    const now = Date.now();
    if (botPro.isConfigured()) {
      await botPro.poll();
      if (loopCount % 10 === 0 && ALLOWED_USER_ID) {
        await meetingIngestor.scanAndIngest(dbPro, botPro, ALLOWED_USER_ID);
      }
      if (now - lastJobScanAt >= 15 * 60 * 1000) {
        lastJobScanAt = now;
        try {
          const { autoScanAndNotify } = require(path.join(BASE_DIR, '04_Productivite_Admin', 'career_ops', 'live_job_scraper'));
          const r = await autoScanAndNotify(CAREER_DIR, ENV_FILE);
          console.log(`[JOB_RADAR] Scan exécuté : ${r.qualifiedCount} qualifiées, ${r.newPushed} alertes transmises.`);
        } catch (e) {
          console.error(`[JOB_RADAR] Erreur scan : ${e.message}`);
        }
      }
      if (now - lastDailyScanAt >= 24 * 3600 * 1000) {
        lastDailyScanAt = now;
        try {
          const { runDailyRemoteScanner } = require(path.join(BASE_DIR, '04_Productivite_Admin', 'career_ops', 'daily_remote_company_scanner'));
          await runDailyRemoteScanner({ careerDir: CAREER_DIR, envPath: ENV_FILE });
          console.log(`[REMOTE_SCANNER] Scan quotidien exécuté.`);
        } catch (e) {
          console.error(`[REMOTE_SCANNER] Erreur : ${e.message}`);
        }
      }
    }
    if (botPerso.isConfigured()) {
      await botPerso.poll();
      if (ALLOWED_USER_ID) coachEngine.checkScheduledTriggers(botPerso, ALLOWED_USER_ID);
    }
    if (botResearch.isConfigured()) {
      await botResearch.poll();
    }
    await new Promise(r => setTimeout(r, 1000));
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error(`[FATAL] Erreur démon Telegram: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { botPro, botPerso, botResearch, sessionStore };
