/**
 * UI HELPERS — ÉCHAPPEMENT HTML, VARIABLES, CSV, FILTRES & HORIZON D'ENVOI
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / UI
 * Règle : toute donnée issue d'un CSV ou du serveur passe par esc() avant innerHTML.
 */
(function() {
  const BAD_VALUES = new Set(['undefined', 'null', 'n/a', 'na', '-', '--', 'none', 'aucun', 'vide', 'nan', 'nil']);
  const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, ch => ESCAPES[ch]);

  /** Aperçu : mêmes règles que engine/variable_resolver.js ; renvoie du HTML échappé. */
  function resolveFrontVariables(template, contact) {
    if (!template) return { text: '', isValid: true, unresolved: [] };
    const unresolved = [];
    const c = contact || {};
    const parts = String(template).split(/(\{\{[^}]+\}\})/g).map(chunk => {
      const m = chunk.match(/^\{\{([^}]+)\}\}$/);
      if (!m) return esc(chunk);
      const [name, ...fb] = m[1].split('|');
      const key = name.trim().toLowerCase();
      let val = c[key] ?? c.custom_fields?.[key];
      val = val === undefined || val === null ? '' : String(val).trim();
      if (val && !BAD_VALUES.has(val.toLowerCase())) return esc(val);
      if (fb.length && fb.join('|').trim()) return esc(fb.join('|').trim());
      unresolved.push(key);
      return `<span class="unresolved-var-tag" title="Variable manquante">{{${esc(key)}}}</span>`;
    });
    const text = parts.join('').replace(/\{([^{}]+)\}/g, (_, choices) => `<span class="spintax-tag" title="Spintax : ${choices}">${choices.split('|')[0]}</span>`);
    return { text, isValid: unresolved.length === 0, unresolved };
  }

  /** Estimation à partir de la configuration réelle (délai moyen, horaires, quota). */
  function calculateETA(count, cfg) {
    if (!count || count <= 0) return 'Aucun contact éligible à l\'envoi.';
    if (!cfg) return `${count} contact(s) éligible(s).`;
    const avgMin = (cfg.min_delay_seconds + cfg.max_delay_seconds) / 2 / 60;
    const today = Math.min(count, cfg.daily_send_limit);
    const totalMin = Math.round(today * avgMin);
    const days = Math.ceil(count / cfg.daily_send_limit);
    return `⏱️ ${count} contact(s) · ${today} max aujourd'hui (~${Math.floor(totalMin / 60)}h${String(totalMin % 60).padStart(2, '0')})${days > 1 ? ` · ${days} jours ouvrés au total` : ''}`;
  }

  function normalizeHeader(h) {
    return String(h || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  }

  function cleanName(str) {
    return String(str || '').trim().split(/([\s-]+)/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
  }

  /** Parseur CSV (RFC 4180) : guillemets, virgules/points-virgules/tabulations, retours à la ligne dans les champs. */
  function parseCSVRows(text) {
    const src = String(text || '').replace(/^﻿/, '');
    const firstLine = src.split(/\r?\n/, 1)[0];
    const delim = [';', ',', '\t'].map(d => [d, firstLine.split(d).length]).sort((a, b) => b[1] - a[1])[0][0];
    const rows = [];
    let row = [], field = '', inQuotes = false;
    for (let i = 0; i < src.length; i++) {
      const ch = src[i];
      if (inQuotes) {
        if (ch === '"' && src[i + 1] === '"') { field += '"'; i++; }
        else if (ch === '"') inQuotes = false;
        else field += ch;
      } else if (ch === '"') inQuotes = true;
      else if (ch === delim) { row.push(field); field = ''; }
      else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && src[i + 1] === '\n') i++;
        row.push(field); rows.push(row); row = []; field = '';
      } else field += ch;
    }
    if (field || row.length) { row.push(field); rows.push(row); }
    return rows.filter(r => r.some(cell => cell.trim()));
  }

  /** Aucune valeur inventée : un champ absent reste vide pour que le contrôle des variables le détecte. */
  function parseCSVContent(rawText) {
    const rows = parseCSVRows(rawText);
    if (rows.length <= 1) return { error: 'Fichier vide ou sans ligne d\'en-tête.' };
    const headers = rows[0].map(h => normalizeHeader(h));
    const find = (test) => headers.findIndex(test);
    const eIdx = find(h => h.includes('email') || h.includes('courriel') || h === 'mail');
    const pIdx = find(h => h.startsWith('prenom') || h.includes('first_name') || h === 'firstname');
    const nIdx = find(h => (h === 'nom' || h.includes('last_name') || h === 'lastname' || h.startsWith('nom_')) && !h.includes('prenom'));
    const cIdx = find(h => h.includes('societe') || h.includes('entreprise') || h.includes('company'));
    const rIdx = find(h => h.includes('role') || h.includes('poste') || h.includes('fonction') || h.includes('titre') || h.includes('title'));
    if (eIdx === -1) return { error: 'Colonne Email introuvable : nommez-la « Email » ou « Courriel ».' };
    const stamp = Date.now();
    const cell = (r, idx) => (idx >= 0 ? String(r[idx] || '').trim() : '');
    const parsed = rows.slice(1).map((r, i) => {
      const custom_fields = {};
      headers.forEach((h, col) => { if (h && String(r[col] || '').trim()) custom_fields[h] = String(r[col]).trim(); });
      return {
        id: `cnt_${stamp}_${i}`, email: cell(r, eIdx).toLowerCase(),
        prenom: cleanName(cell(r, pIdx)), nom: cleanName(cell(r, nIdx)), entreprise: cell(r, cIdx), role: cell(r, rIdx),
        custom_fields, status: 'PENDING'
      };
    }).filter(c => c.email.includes('@'));
    if (parsed.length === 0) return { error: 'Aucune adresse email détectée dans la colonne Email.' };
    return { parsed, headers };
  }

  function downloadCSV(filename, rows) {
    if (!rows || rows.length === 0) return;
    const keys = [...new Set(rows.flatMap(r => Object.keys(r)))].filter(k => k !== 'custom_fields');
    const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = [keys.join(','), ...rows.map(r => keys.map(k => q(r[k])).join(','))].join('\r\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  const GROUPS = {
    DELIVERABLE: ['VERIFIED', 'SENT'],
    UNVERIFIED: ['UNVERIFIED', 'CATCH_ALL', 'PENDING'],
    RISKY: ['RISKY', 'ROLE_ACCOUNT'],
    INVALID: ['INVALID', 'INVALID_MAILBOX', 'NO_MX', 'DISPOSABLE']
  };

  function filterContacts(contacts, key) {
    const list = Array.isArray(contacts) ? contacts : [];
    return GROUPS[key] ? list.filter(c => GROUPS[key].includes(c.status || 'PENDING')) : list;
  }

  function getContactsTriageCounts(contacts) {
    const count = (k) => filterContacts(contacts, k).length;
    return { all: (contacts || []).length, deliverable: count('DELIVERABLE'), unverified: count('UNVERIFIED'), risky: count('RISKY'), invalid: count('INVALID') };
  }

  function paginate(items, page = 1, pageSize = 8) {
    const list = Array.isArray(items) ? items : [];
    const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
    const curPage = Math.min(Math.max(1, page), totalPages);
    const start = (curPage - 1) * pageSize;
    return { items: list.slice(start, start + pageSize), totalPages, curPage, totalCount: list.length, startIdx: list.length ? start + 1 : 0, endIdx: Math.min(list.length, start + pageSize) };
  }

  async function api(path, body) {
    const opts = body === undefined ? {} : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
    const res = await fetch(path, opts);
    return res.json();
  }

  window.SniperUIHelpers = {
    esc, api, resolveFrontVariables, calculateETA, normalizeHeader, cleanName, downloadCSV,
    filterContacts, getContactsTriageCounts, paginate, parseCSVContent, parseCSVRows
  };
})();
