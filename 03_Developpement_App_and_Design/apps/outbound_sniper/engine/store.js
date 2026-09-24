/**
 * STORE — ACCÈS UNIQUE AUX FICHIERS data/ & À LA CONFIGURATION (Node.js 20+)
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / Engine
 * - Référentiels (lecture seule, versionnés) : REF_DIR = data/
 * - État utilisateur (config.json, contacts, tracking…) : DATA_DIR, surchargeable par SNIPER_DATA_DIR (tests)
 * - Valeurs par défaut : UNIQUEMENT data/config.example.json, surchargées par data/config.json
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const REF_DIR = path.join(__dirname, '../data');
const DATA_DIR = process.env.SNIPER_DATA_DIR || REF_DIR;

function readJSON(file, fallback) {
  try {
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {}
  return fallback;
}

function loadRef(name, fallback = null) { return readJSON(path.join(REF_DIR, name), fallback); }
function load(name, fallback = null) { return readJSON(path.join(DATA_DIR, name), fallback); }

function save(name, data) {
  const file = path.join(DATA_DIR, name);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

function isObject(v) { return v && typeof v === 'object' && !Array.isArray(v); }

function deepMerge(base, over) {
  const out = { ...base };
  for (const [k, v] of Object.entries(over || {})) out[k] = isObject(v) && isObject(base[k]) ? deepMerge(base[k], v) : v;
  return out;
}

/** Configuration effective = config.example.json ⊕ config.json. Génère le secret de signature des clics au 1er lancement. */
function loadConfig() {
  const cfg = deepMerge(loadRef('config.example.json', {}), load('config.json', {}));
  if (!cfg.tracking?.secret) {
    cfg.tracking = { ...(cfg.tracking || {}), secret: crypto.randomBytes(24).toString('hex') };
    saveConfigPatch({ tracking: { secret: cfg.tracking.secret } });
  }
  return cfg;
}

/** Applique un patch partiel sur config.json (seules les surcharges utilisateur y sont stockées). */
function saveConfigPatch(patch) {
  save('config.json', deepMerge(load('config.json', {}), patch));
}

module.exports = { REF_DIR, DATA_DIR, loadRef, load, save, loadConfig, saveConfigPatch, deepMerge };
