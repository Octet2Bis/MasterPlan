# 💼 Studio 04 — Productivité, Opérations Carrière & Automatisation Admin

Ce pôle pilote la qualification des opportunités professionnelles (Job Matching ATS), l'étayage par preuves de code et la génération documentaire de haute fidélité visuelle.

---

## 🧰 Skills & Moteurs Actifs dans ce Studio

* [career-job-hunter](file:///c:/Users/HP/Desktop/Master%20Plan/.agents/skills/career-job-hunter/SKILL.md) : Détection d'opportunités, scoring ATS (Tier Gold >= 85) et rédaction de candidatures d'élite (Drafter-Reviewer).
* [minimax-doc-generator](file:///c:/Users/HP/Desktop/Master%20Plan/.agents/skills/minimax-doc-generator/SKILL.md) : Génération de documents professionnels (PDF, DOCX, XLSX, Pitch Decks).
* **[career_proof_engine.js](file:///c:/Users/HP/Desktop/Master%20Plan/02_Assistant_Personnel/04_Productivite_Admin/career_ops/career_proof_engine.js)** : Moteur d'appariement d'offres et d'audit physique des 10 preuves de code du Master Plan.
* **[skill_proof_graph.json](file:///c:/Users/HP/Desktop/Master%20Plan/02_Assistant_Personnel/Workspace/career/skill_proof_graph.json)** : Graphe bipartite reliant compétences clés ATS et livrables réels du Master Plan.

---

## 🛡️ Règles Locales & Quality Gates
* Zéro candidature soumise sans audit d'intégrité préalable (`node career_proof_engine.js --audit-proofs`).
* Seules les opportunités classées **Tier Gold** ($\ge 85/100$) déclenchent la rédaction sur-mesure d'un dossier complet.
