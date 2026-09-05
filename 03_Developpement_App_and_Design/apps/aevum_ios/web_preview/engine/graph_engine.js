/**
 * AEVUM — CAUSAL PROTOCOL GRAPH ENGINE
 * Moteur déterministe de prescription biologique (< 80 lignes)
 */

class CausalProtocolGraphEngine {
  constructor() {
    this.graph = null;
  }

  async init(dataPath = './data/protocol_graph.json') {
    try {
      const res = await fetch(dataPath);
      this.graph = await res.json();
      window.AEVUM_GRAPH = this.graph;
      console.log(`[GRAPH] Initialisé avec ${this.graph.nodes.length} nœuds et ${this.graph.edges.length} arêtes.`);
    } catch (e) {
      console.warn(`[GRAPH] Fallback local : ${e.message}`);
    }
  }

  resolveIntervention(context = {}) {
    if (!this.graph) return null;
    const hour = context.hour !== undefined ? context.hour : new Date().getHours();
    const sessionMins = context.sessionMinutes || 0;
    const category = context.category || 'all';

    // 1. Détection des déclencheurs actifs
    const activeTriggers = [];
    if (hour >= 22 || hour < 6) activeTriggers.push('trig_late_night_scroll');
    if (sessionMins >= 45) activeTriggers.push('trig_prolonged_immobility');
    if (category === 'social' || category === 'entertainment') activeTriggers.push('trig_dopamine_binge');
    if (activeTriggers.length === 0) activeTriggers.push('trig_compulsive_unlock');

    // 2. Traversée causale : Trigger -> Biomarqueur -> Protocole
    const scores = new Map();
    const nodeMap = new Map(this.graph.nodes.map(n => [n.id, n]));

    activeTriggers.forEach(trigId => {
      const trigEdges = this.graph.edges.filter(e => e.from === trigId && e.relation === 'degrades');
      trigEdges.forEach(tEdge => {
        const bioId = tEdge.to;
        const restoreEdges = this.graph.edges.filter(e => e.to === bioId && e.relation === 'restores');
        restoreEdges.forEach(rEdge => {
          const protoId = rEdge.from;
          const current = scores.get(protoId) || { score: 0, biomarkerId: bioId, mechanism: rEdge.mechanism };
          current.score += (tEdge.weight * rEdge.weight);
          scores.set(protoId, current);
        });
      });
    });

    // 3. Sélection du protocole optimal
    let best = null;
    let maxScore = -1;
    for (const [protoId, data] of scores.entries()) {
      if (data.score > maxScore) {
        maxScore = data.score;
        best = {
          protocolId: protoId,
          protocol: nodeMap.get(protoId),
          biomarker: nodeMap.get(data.biomarkerId),
          mechanism: data.mechanism,
          score: Number(maxScore.toFixed(2))
        };
      }
    }

    // 4. Résolution du micro-happening associé
    if (best) {
      const hapEdge = this.graph.edges.find(e => e.from === best.protocolId && e.relation === 'actioned_by');
      if (hapEdge) best.happening = nodeMap.get(hapEdge.to);
    }
    return best;
  }
}

if (typeof window !== 'undefined') {
  window.graphEngine = new CausalProtocolGraphEngine();
}
if (typeof module !== 'undefined') module.exports = { CausalProtocolGraphEngine };
