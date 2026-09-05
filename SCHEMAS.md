# Registre Central des Schémas & Knowledge Graphs (SCHEMAS.md)

Ce document dresse l'inventaire officiel et normé des **5 Knowledge Graphs structurés** régissant le Master Plan, leur rôle opérationnel et leur validateur déterministe.

---

## 🗺️ Les 5 Graphes du Master Plan

| # | Nom du Graphe | Emplacement Canonique | Rôle & Entités Modélisées | Validateur Associé |
| :- | :--- | :--- | :--- | :--- |
| **1** | **Master Plan DAG** | [.agents/data/master_plan_dag.json](file:///c:/Users/HP/Desktop/Master%20Plan/.agents/data/master_plan_dag.json) | Topologie des dépendances entre livrables maîtres et conditions de blocage (0 cycle). | `node 03_Developpement_App_and_Design/toolbox/dag_validator.js` |
| **2** | **Intent Graph Router** | `03_Developpement_App_and_Design/toolbox/data/intent_graph.json` | Mapping des intentions agentiques, compétences requises et actions cibles. | `node 03_Developpement_App_and_Design/toolbox/harness_graph_router.js --list-nodes` |
| **3** | **Aevum Protocol Graph** | `03_Developpement_App_and_Design/apps/aevum_ios/AevumApp/Resources/Data/protocol_graph.json` | Graphe des 12 protocoles physiologiques, déclencheurs et micro-défis Aevum. | `node 03_Developpement_App_and_Design/toolbox/test_code_integrity.js` |
| **4** | **Competitor Keyword Graph** | `01_GTM_Growth/toolbox/core/data/competitor_keywords_targets.json` | Graphe des cibles concurrentes (*Opal, One Sec, Whoop*) et clusters d'intention AEO. | `python 01_GTM_Growth/toolbox/finders/openseo_adapter.py` |
| **5** | **Hermes Research Graph** | `02_Assistant_Personnel/Workspace/research_graph.json` | Graphe de veille, notes et synthèses documentaires du Second Cerveau. | `node 02_Assistant_Personnel/toolbox/test_meeting_ingestor.js` |

---

## 🔒 Règles de Non-Régression
* Aucun schéma ne doit être modifié sans exécuter son validateur déterministe.
* Le script [dag_validator.js](file:///c:/Users/HP/Desktop/Master%20Plan/03_Developpement_App_and_Design/toolbox/dag_validator.js) vérifie la cohérence globale de l'ensemble de ces graphes.
