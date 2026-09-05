"""
openseo_adapter.py — Adaptateur OpenSEO & DataForSEO Pay-As-You-Go.
Pilier : 01_GTM_Growth / Toolbox / Finders (< 120 lignes, Commandement #1 & #2).
"""

import os
import sys
import json
from pathlib import Path
from typing import Dict, List, Optional

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

DATA_FILE = Path(__file__).resolve().parent.parent / "core" / "data" / "competitor_keywords_targets.json"

class OpenSeoAdapter:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("DATAFORSEO_API_KEY")
        self.targets = self._load_targets()

    def _load_targets(self) -> Dict:
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {"competitors": [], "aeo_intent_clusters": []}

    def get_competitors(self) -> List[Dict]:
        return self.targets.get("competitors", [])

    def get_target_keywords_by_competitor(self, competitor_id: str) -> List[Dict]:
        for comp in self.targets.get("competitors", []):
            if comp.get("id") == competitor_id:
                return comp.get("target_keywords", [])
        return []

    def export_to_aeo_graph(self) -> Dict:
        """Formate les mots-clés pour ingestion directe dans aeo_graph_auditor.js"""
        nodes = []
        for comp in self.targets.get("competitors", []):
            for kw in comp.get("target_keywords", []):
                nodes.append({
                    "entity": kw.get("keyword"),
                    "type": "CompetitorKeywordTarget",
                    "competitor": comp.get("name"),
                    "domain": comp.get("domain"),
                    "search_volume": kw.get("volume_est"),
                    "intent": kw.get("intent"),
                    "difficulty": kw.get("kd")
                })
        return {
            "version": "1.0.0",
            "source": "OpenSEO / DataForSEO Cache",
            "total_entities": len(nodes),
            "entities": nodes,
            "intent_clusters": self.targets.get("aeo_intent_clusters", [])
        }


if __name__ == "__main__":
    adapter = OpenSeoAdapter()
    print("=== OPEN SEO ADAPTER — AUDIT MOTS-CLÉS CONCURRENTS ===")
    competitors = adapter.get_competitors()
    print(f"📊 Concurrents indexés : {len(competitors)}")
    for c in competitors:
        print(f"  • [{c['id'].upper()}] {c['name']} ({c['domain']}) - {len(c['target_keywords'])} mots-clés")

    export = adapter.export_to_aeo_graph()
    print(f"\n🚀 Prêt pour injection AEO : {export['total_entities']} entités exportées.")
