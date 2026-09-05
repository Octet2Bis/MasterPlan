# 🗺️ MAP — OUTBOUND SNIPER STUDIO

## Architecture & Modules Principaux
- **Orchestrateur & API** : `server.js` (HTTP REST, endpoints `/api/*`, tracking `/t/*`)
- **Moteur Métier (Engine)** :
  - `engine/sniper_core_engine.js` : Coordination campagnes, tracking, envoi
  - `engine/smtp_client.js` : Envoi SMTP sécurisé TLS 465 (Gmail App Password)
  - `engine/sender_manager.js` : Gestion multi-expéditeurs et sous-domaines
- **Données Pures (`data/`)** :
  - `config.json` : Port, URL de tracking, quota journalier (28/j)
  - `senders.json` : Expéditeurs configurés et domaines
  - `campaigns.json` : Définition des campagnes
  - `contacts.json` : Registre des contacts par campagne
  - `tracking_events.json` : Journal des ouvertures et clics
- **Interface Utilisateur (`public/`)** :
  - `index.html` : Shell Bento Grid (Home, Workspace 4 étapes, Modal Profil)
  - `tokens.css` / `styles.css` : Design system Dark Charcoal Swiss Craft
  - `app.js`, `ui_campaigns.js`, `ui_contacts.js`, `ui_dispatch.js` : Contrôleurs UI
- **Infrastructure Cloud** :
  - VM Oracle Cloud Always Free (ARM64 Ampere Ubuntu 24.04)
  - `setup_oracle_vm.sh` : Script de provisioning automatique
