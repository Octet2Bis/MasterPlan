/**
 * MASTER PLAN — ATOMIC GRAPH STORE SÉCURISÉ (Node.js)
 * Pilier 02 : Assistant Personnel
 * Rôle : Stockage de graphe avec écriture atomique (.tmp -> rename) & Mutex Queue anti-corruption.
 * Plafond strict : < 130 lignes
 */

const fs = require('node:fs');
const path = require('node:path');

class AtomicGraphStore {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = { entities: [], relations: [], observations: [] };
    this.writeQueue = Promise.resolve();
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = {
          entities: Array.isArray(parsed.entities) ? parsed.entities : [],
          relations: Array.isArray(parsed.relations) ? parsed.relations : [],
          observations: Array.isArray(parsed.observations) ? parsed.observations : []
        };
      } else {
        this.saveSync();
      }
    } catch (err) {
      console.error(`[ATOMIC_STORE] Erreur lecture ${path.basename(this.filePath)}: ${err.message}`);
      this.data = { entities: [], relations: [], observations: [] };
    }
  }

  saveSync() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const tempPath = `${this.filePath}.tmp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
    fs.renameSync(tempPath, this.filePath);
  }

  async saveAtomic() {
    this.writeQueue = this.writeQueue.then(async () => {
      try {
        const dir = path.dirname(this.filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        const tempPath = `${this.filePath}.tmp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        await fs.promises.writeFile(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
        await fs.promises.rename(tempPath, this.filePath);
      } catch (err) {
        console.error(`[ATOMIC_STORE] Erreur écriture atomique sur ${path.basename(this.filePath)}: ${err.message}`);
      }
    });
    return this.writeQueue;
  }

  async addObservation(obs) {
    return new Promise((resolve) => {
      this.writeQueue = this.writeQueue.then(async () => {
        const newId = (this.data.observations.length || 0) + 1;
        const newObs = {
          id: newId,
          createdAt: obs.createdAt || new Date().toISOString(),
          ...obs
        };
        this.data.observations.push(newObs);
        
        try {
          const dir = path.dirname(this.filePath);
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          const tempPath = `${this.filePath}.tmp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
          await fs.promises.writeFile(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
          await fs.promises.rename(tempPath, this.filePath);
        } catch (err) {
          console.error(`[ATOMIC_STORE] Erreur enregistrement observation: ${err.message}`);
        }
        resolve(newObs);
      });
    });
  }

  getData() {
    return this.data;
  }

  getObservationCount() {
    return this.data.observations.length;
  }
}

module.exports = { AtomicGraphStore };
