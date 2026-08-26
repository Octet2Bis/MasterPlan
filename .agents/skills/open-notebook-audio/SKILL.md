---
name: open-notebook-audio
description: Pilote la synthèse documentaire et la génération de podcasts audio multi-voix (MP3) à partir de notes, PDFs et documents de recherche via Open Notebook. À utiliser dans 02_Assistant_Personnel/.
---

# 🎙️ Open Notebook Audio — Studio de Podcasts & Synthèse Documentaire

Ce skill permet d'ingérer des documents denses et de produire des synthèses orales sous forme d'émissions de podcast animées par deux voix IA (un présentateur et un expert métier).

---

## 🛠️ Workflow Opérationnel

1. **Dépôt des Sources :**
   - Placer les PDFs, articles ou notes à résumer dans `02_Assistant_Personnel/Workspace/sources/`.

2. **Démarrage du Studio :**
   - Exécuter `powershell -File 02_Assistant_Personnel/apps/open_notebook/start_notebook.ps1`.
   - L'interface locale est accessible sur `http://localhost:8080`.

3. **Génération du Podcast :**
   - Configurer le format (ex: *Débat 10 min*, *Synthèse rapide 5 min*).
   - Les fichiers MP3 générés sont automatiquement sauvegardés dans `02_Assistant_Personnel/Workspace/podcasts/`.

4. **Arrêt du Studio (Économie de RAM) :**
   - Exécuter `powershell -File 02_Assistant_Personnel/apps/open_notebook/stop_notebook.ps1`.
