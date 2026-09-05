/**
 * MASTER PLAN — SECURITY GUARD HARDENED (Node.js)
 * Pilier 02 : Assistant Personnel
 * Rôle : Whitelist Fail-Closed, Magic Bytes, Quotas de bande passante & Sanitisation.
 * Plafond strict : < 140 lignes
 */

const fs = require('node:fs');
const path = require('node:path');

function validateUser(userId, allowedUserId) {
  const normAllowed = String(allowedUserId || '').trim();
  const normUser = String(userId || '').trim();
  if (!normAllowed || normUser !== normAllowed) {
    return { allowed: false, reason: `Accès refusé. Identifiant non autorisé : ${normUser || 'inconnu'}` };
  }
  return { allowed: true };
}

function sanitizeFilename(rawName, fallbackExt = '.bin') {
  const base = path.basename(rawName || '');
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.+/g, '.');
  if (!cleaned || cleaned === '.' || cleaned === '..') {
    return `file_${Date.now()}${fallbackExt}`;
  }
  return cleaned;
}

function inspectFileMagicBytes(filePath) {
  try {
    const buffer = Buffer.alloc(32);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 32, 0);
    fs.closeSync(fd);

    // 1. Détection immédiate des exécutables masqués
    if (buffer[0] === 0x4D && buffer[1] === 0x5A) { // 'MZ' Windows PE / .exe
      return { valid: false, error: 'ALERTE SÉCURITÉ : Binaire Windows (.exe/.dll) masqué détecté !' };
    }
    if (buffer[0] === 0x7F && buffer[1] === 0x45 && buffer[2] === 0x4C && buffer[3] === 0x46) { // ELF Linux
      return { valid: false, error: 'ALERTE SÉCURITÉ : Binaire Linux (ELF) masqué détecté !' };
    }
    const hex0_4 = buffer.subarray(0, 4).toString('hex');
    if (['feedface', 'feedfacf', 'cefaedfe', 'cffaedfe'].includes(hex0_4)) { // Mach-O macOS
      return { valid: false, error: 'ALERTE SÉCURITÉ : Binaire macOS (Mach-O) masqué détecté !' };
    }

    // 2. Validation des signatures de médias légitimes
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
      return { valid: true, mime: 'image/jpeg', type: 'photo' };
    }
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      return { valid: true, mime: 'image/png', type: 'photo' };
    }
    if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
      return { valid: true, mime: 'image/webp', type: 'photo' };
    }
    const headerAscii = buffer.toString('ascii', 4, 12);
    if (headerAscii.includes('ftyp') || headerAscii.includes('moov')) {
      return { valid: true, mime: 'video/mp4', type: 'video' };
    }

    return { valid: false, error: 'Type de fichier binaire non autorisé ou corrompu.' };
  } catch (err) {
    return { valid: false, error: `Erreur inspection Magic Bytes: ${err.message}` };
  }
}

class RateLimiter {
  constructor(maxPerMin = 30, maxFileBytes = 25 * 1024 * 1024, maxHourlyBytes = 100 * 1024 * 1024) {
    this.MAX_PER_MINUTE = maxPerMin;
    this.MAX_FILE_BYTES = maxFileBytes;
    this.MAX_HOURLY_BYTES = maxHourlyBytes;
    this.messageHistory = [];
    this.hourlyBytes = 0;
    this.lastReset = Date.now();
  }

  checkMessageRate() {
    const now = Date.now();
    this.messageHistory = this.messageHistory.filter(t => now - t < 60000);
    if (this.messageHistory.length >= this.MAX_PER_MINUTE) {
      return { allowed: false, reason: 'Limite de messages dépassée (30 msg/min).' };
    }
    this.messageHistory.push(now);
    return { allowed: true };
  }

  checkFileQuota(fileSize) {
    const now = Date.now();
    if (now - this.lastReset > 3600000) {
      this.hourlyBytes = 0;
      this.lastReset = now;
    }
    if (fileSize > this.MAX_FILE_BYTES) {
      return { allowed: false, reason: 'Fichier supérieur au plafond de 25 Mo.' };
    }
    if (this.hourlyBytes + fileSize > this.MAX_HOURLY_BYTES) {
      return { allowed: false, reason: 'Quota horaire de 100 Mo dépassé.' };
    }
    return { allowed: true };
  }

  recordDownload(size) {
    this.hourlyBytes += size;
  }
}

module.exports = {
  validateUser,
  sanitizeFilename,
  inspectFileMagicBytes,
  RateLimiter
};
