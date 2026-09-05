/**
 * UI HELPERS — SYNTAXE VARIABLE, SPINTAX & HORIZON TEMPOREL (Node.js 24)
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / UI (< 90 lignes)
 */
(function() {
  const BAD_VALUES = new Set(['undefined', 'null', 'n/a', 'na', '-', '--', 'none', 'aucun', 'vide']);

  function resolveFrontVariables(template, contact) {
    if (!template) return { text: '', isValid: true, unresolved: [] };
    const unresolved = [];
    const text = template.replace(/\{\{([^}]+)\}\}/g, (_, expr) => {
      const parts = expr.split('|');
      const varName = parts[0].trim().toLowerCase();
      const fallback = parts.length > 1 ? parts.slice(1).join('|').trim() : null;
      let val = contact[varName];
      if (val === undefined && contact.custom_fields) val = contact.custom_fields[varName];
      if (val !== undefined && val !== null) {
        val = String(val).trim();
        if (BAD_VALUES.has(val.toLowerCase())) val = '';
      }
      if (val && val.length > 0) return val;
      if (fallback !== null) return fallback;
      unresolved.push(varName);
      return `<span class="unresolved-var-tag" title="Variable manquante">{{${varName}}}</span>`;
    });

    const withSpintax = text.replace(/\{([^{}]+)\}/g, (_, choices) => {
      const opts = choices.split('|');
      return `<span class="spintax-tag" style="background:rgba(16,185,129,0.12); color:#10b981; padding:1px 4px; border-radius:3px; font-weight:600;" title="Spintax : ${choices}">${opts[0]}</span>`;
    });
    return { text: withSpintax, isValid: unresolved.length === 0, unresolved };
  }

  function calculateETA(count) {
    if (!count || count <= 0) return '0 contact en attente';
    const avgSec = 660;
    const totalMin = Math.round((count * avgSec) / 60);
    const now = new Date();
    const curM = now.getHours() * 60 + now.getMinutes();
    const remainingToday = Math.max(0, (18 * 60 + 30) - curM);
    if (totalMin <= remainingToday) {
      const endT = new Date(now.getTime() + totalMin * 60000);
      return `⏱️ ${count} contacts · Durée ~${Math.floor(totalMin / 60)}h${String(totalMin % 60).padStart(2, '0')} · Fin prévue à ${endT.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    const todayCount = Math.min(count, Math.max(0, Math.floor(remainingToday / (avgSec / 60))));
    return `🌙 ${todayCount} aujourd'hui (jusqu'à 18h30) · Pause nocturne · ${count - todayCount} demain dès 08h30`;
  }

  function normalizeHeader(h) {
    return String(h || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  }

  function cleanName(str) {
    if (!str) return '';
    return str.trim().split(/[\s-]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  }

  function downloadCSV(filename, rows) {
    if (!rows || rows.length === 0) return;
    const headers = Object.keys(rows[0]).filter(k => k !== 'custom_fields').join(',');
    const lines = rows.map(r => Object.keys(r).filter(k => k !== 'custom_fields').map(k => `"${String(r[k] || '').replace(/"/g, '""')}"`).join(','));
    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURI([headers, ...lines].join('\n'));
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function filterContacts(contacts, filterKey) {
    if (!Array.isArray(contacts)) return [];
    if (filterKey === 'DELIVERABLE') return contacts.filter(c => c.status === 'VERIFIED' || c.status === 'SENT' || (c.score || 0) >= 80);
    if (filterKey === 'RISKY') return contacts.filter(c => ['RISKY', 'CATCH_ALL', 'ROLE_ACCOUNT', 'DISPOSABLE'].includes(c.status));
    if (filterKey === 'INVALID') return contacts.filter(c => ['INVALID_MAILBOX', 'NO_MX'].includes(c.status));
    return contacts;
  }

  function getContactsTriageCounts(contacts) {
    const list = Array.isArray(contacts) ? contacts : [];
    return {
      all: list.length,
      deliverable: list.filter(c => c.status === 'VERIFIED' || c.status === 'SENT' || (c.score || 0) >= 80).length,
      risky: list.filter(c => ['RISKY', 'CATCH_ALL', 'ROLE_ACCOUNT', 'DISPOSABLE'].includes(c.status)).length,
      invalid: list.filter(c => ['INVALID_MAILBOX', 'NO_MX'].includes(c.status)).length
    };
  }

  function paginate(items, page = 1, pageSize = 8) {
    const list = Array.isArray(items) ? items : [];
    const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
    const curPage = Math.min(Math.max(1, page), totalPages);
    const start = (curPage - 1) * pageSize;
    const end = start + pageSize;
    return {
      items: list.slice(start, end),
      totalPages,
      curPage,
      totalCount: list.length,
      startIdx: list.length ? start + 1 : 0,
      endIdx: Math.min(list.length, end)
    };
  }

  function parseCSVContent(rawText, campaignId = 'camp_1') {
    const lines = (rawText || '').split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length <= 1) return { error: "Fichier vide ou sans en-têtes valides." };
    const cleanHeaders = lines[0].split(/[,;]/).map(h => normalizeHeader(h.trim().replace(/^["']|["']$/g, '')));
    const eIdx = cleanHeaders.findIndex(h => h.includes('email') || h.includes('courriel') || h === 'mail');
    const pIdx = cleanHeaders.findIndex(h => h.startsWith('prenom') || h.includes('first_name'));
    const nIdx = cleanHeaders.findIndex(h => (h.includes('nom') || h.includes('last_name')) && !h.includes('prenom') && !h.includes('societe'));
    const cIdx = cleanHeaders.findIndex(h => h.includes('societe') || h.includes('entreprise') || h.includes('company'));
    const rIdx = cleanHeaders.findIndex(h => h.includes('role') || h.includes('poste') || h.includes('fonction') || h.includes('titre'));
    if (eIdx === -1) return { error: "Colonne Email introuvable. Assurez-vous d'avoir 'Email' ou 'Courriel'." };

    const parsed = lines.slice(1).map((l, i) => {
      const p = l.split(/[,;]/).map(x => x.trim().replace(/^["']|["']$/g, ''));
      const custom_fields = {};
      cleanHeaders.forEach((h, col) => { if (p[col]) custom_fields[h] = p[col]; });
      const role = rIdx >= 0 && p[rIdx] ? p[rIdx] : 'Directeur';
      return {
        id: `cnt_${Date.now()}_${i}`,
        prenom: pIdx >= 0 && p[pIdx] ? cleanName(p[pIdx]) : 'Contact',
        nom: nIdx >= 0 && p[nIdx] ? cleanName(p[nIdx]) : '',
        entreprise: cIdx >= 0 && p[cIdx] ? p[cIdx].trim() : 'Entreprise',
        role: ['france', 'paris', '-', 'none', 'n/a'].includes(role.toLowerCase()) ? 'Direction' : role,
        email: p[eIdx], custom_fields, status: 'PENDING', assigned_campaign_id: campaignId
      };
    }).filter(c => c.email && c.email.includes('@'));

    if (parsed.length === 0) return { error: "Aucune adresse email valide détectée." };
    return { parsed, headers: cleanHeaders };
  }

  window.SniperUIHelpers = {
    resolveFrontVariables, calculateETA, normalizeHeader, cleanName, downloadCSV,
    filterContacts, getContactsTriageCounts, paginate, parseCSVContent
  };
})();

