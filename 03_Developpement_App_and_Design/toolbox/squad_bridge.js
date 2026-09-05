/**
 * AEVUM / MASTER PLAN — SQUAD MULTI-AGENT BRIDGE (Node.js)
 * Implémente le pattern Manager -> Worker -> Inspector
 * Plafond strict : < 150 lignes
 */

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const BASE_DIR = path.resolve(__dirname, '../..');
const SQUAD_DIR = path.join(BASE_DIR, '.squad');
const TASKS_FILE = path.join(SQUAD_DIR, 'tasks_queue.json');

function ensureSquadDir() {
  if (!fs.existsSync(SQUAD_DIR)) fs.mkdirSync(SQUAD_DIR, { recursive: true });
  if (!fs.existsSync(TASKS_FILE)) fs.writeFileSync(TASKS_FILE, JSON.stringify([], null, 2));
}

function dispatchTask(pillar, description) {
  ensureSquadDir();
  const tasks = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf-8'));
  const newTask = {
    id: `TSK-${Date.now()}`,
    pillar,
    description,
    status: 'ASSIGNED',
    timestamp: new Date().toISOString()
  };
  tasks.push(newTask);
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
  console.log(`[SQUAD MANAGER] Tâche dispatchée avec succès : [${newTask.id}] -> ${pillar}`);
}

function runInspector() {
  console.log('============================================================');
  console.log('🛡️ [SQUAD INSPECTOR] EXÉCUTION DU QUALITY GATE DÉTERMINISTE');
  console.log('============================================================\n');

  const testScript = path.join(BASE_DIR, '03_Developpement_App_and_Design', 'toolbox', 'test_code_integrity.js');
  try {
    const output = execSync(`node "${testScript}"`, { encoding: 'utf-8', cwd: BASE_DIR });
    console.log(output);
    console.log('✅ [SQUAD INSPECTOR] RÉSULTAT : 100% CONFORME. VALIDATION ACCORDÉE.\n');
    return true;
  } catch (err) {
    console.error('❌ [SQUAD INSPECTOR] ÉCHEC DU QUALITY GATE :');
    console.error(err.stdout || err.message);
    process.exit(1);
  }
}

function showStatus() {
  ensureSquadDir();
  const tasks = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf-8'));
  console.log(`[SQUAD] File d'attente active : ${tasks.length} tâche(s) enregistrée(s).`);
  tasks.forEach(t => console.log(` • [${t.status}] ${t.pillar} : ${t.description}`));
}

// CLI Routing
const [,, cmd, arg1, arg2] = process.argv;

switch (cmd) {
  case 'dispatch':
    if (!arg1 || !arg2) {
      console.log('Usage: node squad_bridge.js dispatch <pillar> "<description>"');
    } else {
      dispatchTask(arg1, arg2);
    }
    break;
  case 'inspect':
    runInspector();
    break;
  case 'status':
    showStatus();
    break;
  default:
    console.log('Squad Bridge CLI: [dispatch <pillar> <task> | inspect | status]');
}
