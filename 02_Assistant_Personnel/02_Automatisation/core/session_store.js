/**
 * MASTER PLAN — SESSION STORE SÉCURISÉ (Node.js)
 * Pilier 02 : Assistant Personnel
 * Rôle : Persistance sur disque du déverrouillage 2FA PIN (TTL 24h).
 * Plafond strict : < 80 lignes
 */

const fs = require('node:fs');
const path = require('node:path');

class SessionStore {
  constructor(stateFilePath) {
    this.stateFilePath = stateFilePath;
    this.unlockedUntil = 0;
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.stateFilePath)) {
        const raw = fs.readFileSync(this.stateFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (typeof parsed.unlockedUntil === 'number') {
          this.unlockedUntil = parsed.unlockedUntil;
        }
      }
    } catch {
      this.unlockedUntil = 0;
    }
  }

  save() {
    try {
      const dir = path.dirname(this.stateFilePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const tempPath = `${this.stateFilePath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify({ unlockedUntil: this.unlockedUntil }, null, 2), 'utf-8');
      fs.renameSync(tempPath, this.stateFilePath);
    } catch (err) {
      console.error(`[SESSION_STORE] Erreur sauvegarde session: ${err.message}`);
    }
  }

  isUnlocked() {
    return Date.now() < this.unlockedUntil;
  }

  unlock(hours = 24) {
    this.unlockedUntil = Date.now() + (hours * 3600 * 1000);
    this.save();
  }

  lock() {
    this.unlockedUntil = 0;
    this.save();
  }

  getRemainingTime() {
    const diff = this.unlockedUntil - Date.now();
    if (diff <= 0) return '0m (Verrouillé)';
    const hours = Math.floor(diff / (3600 * 1000));
    const mins = Math.floor((diff % (3600 * 1000)) / (60 * 1000));
    return `${hours}h ${mins}m restantes`;
  }
}

module.exports = { SessionStore };
