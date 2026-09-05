#!/usr/bin/env node
/**
 * MASTER PLAN — AEVUM DATASET SYNCHRONIZER
 * Propage les catalogues sources de AevumApp/Resources/Data vers web_preview/data.
 * Plafond strict : < 60 lignes
 */

const fs = require('fs');
const path = require('path');

const APP_DIR = path.resolve(__dirname, '../apps/aevum_ios');
const SRC_DIR = path.join(APP_DIR, 'AevumApp', 'Resources', 'Data');
const DEST_DIR = path.join(APP_DIR, 'web_preview', 'data');

if (!fs.existsSync(SRC_DIR)) {
  console.error(`🚨 Dossier source introuvable : ${SRC_DIR}`);
  process.exit(1);
}

if (!fs.existsSync(DEST_DIR)) {
  fs.mkdirSync(DEST_DIR, { recursive: true });
}

const files = fs.readdirSync(SRC_DIR).filter(f => f.endsWith('.json'));
console.log(`\n🔄 Synchronisation de ${files.length} catalogues de données Aevum...`);

let synced = 0;
files.forEach(f => {
  const src = path.join(SRC_DIR, f);
  const dest = path.join(DEST_DIR, f);
  fs.copyFileSync(src, dest);
  console.log(`  ✅ Synchronisé : ${f}`);
  synced++;
});

console.log(`🎉 ${synced} catalogues synchronisés avec succès (AevumApp -> web_preview).\n`);
