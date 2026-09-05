/**
 * AGENT REACH ADAPTER — INGESTION SOUVERAINE DE CONTENU MULTI-SOURCES (Node.js 24)
 * Pilier : 02_Assistant_Personnel / 02_Automatisation / Core (< 140 lignes)
 */

const fs = require('node:fs');
const path = require('node:path');

const RESEARCH_GRAPH_PATH = path.resolve(__dirname, '../../Workspace/research_graph.json');

class AgentReachAdapter {
  constructor() {
    this.graphPath = RESEARCH_GRAPH_PATH;
  }

  parsePostContent(rawText, sourceUrl = '') {
    const lines = (rawText || '').split('\n').map(l => l.trim()).filter(Boolean);
    const title = lines[0] || 'Note sans titre';
    const cleanUrl = (sourceUrl || '').split('?')[0];

    return {
      id: `RES-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: cleanUrl ? 'link' : 'note',
      content: cleanUrl || rawText,
      title: title.slice(0, 80),
      summary: lines.slice(1, 4).join(' ').slice(0, 240),
      category: this.detectCategory(rawText),
      sender: 'Antoine'
    };
  }

  detectCategory(text) {
    const low = (text || '').toLowerCase();
    if (low.includes('seo') || low.includes('backlink') || low.includes('acquisition') || low.includes('ads')) {
      return 'Growth & Acquisition';
    }
    if (low.includes('agent') || low.includes('rag') || low.includes('llm') || low.includes('claude')) {
      return 'IA & Systèmes Multi-Agents';
    }
    if (low.includes('ui') || low.includes('design') || low.includes('css') || low.includes('font')) {
      return 'UI & Animations';
    }
    return 'Code & Repositories';
  }

  ingestIntoResearchGraph(item) {
    let graph = { resources: [], generatedAt: new Date().toISOString() };
    try {
      if (fs.existsSync(this.graphPath)) {
        graph = JSON.parse(fs.readFileSync(this.graphPath, 'utf-8'));
      }
    } catch {}

    if (!Array.isArray(graph.resources)) graph.resources = [];
    
    // Éviter les doublons exacts sur le contenu
    const exists = graph.resources.some(r => r.content === item.content);
    if (!exists) {
      graph.resources.unshift(item);
      fs.writeFileSync(this.graphPath, JSON.stringify(graph, null, 2), 'utf-8');
      return { ingested: true, id: item.id };
    }
    return { ingested: false, reason: 'Duplicate content' };
  }
}

if (require.main === module) {
  const adapter = new AgentReachAdapter();
  console.log('=== AGENT REACH ADAPTER TEST ===');
  const sample = adapter.parsePostContent(
    'Mosaic Type Generator : typographie personnalisée inspirée du métro de New York.\nIdéal pour les titrages Swiss Craft et la signalétique d\'Aevum.',
    'https://instagram.com/p/DcWRZBXkbcR/'
  );
  console.log('Item parsé :', sample);
}

module.exports = { AgentReachAdapter };
