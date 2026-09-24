# AGENTS.md — OUTBOUND SNIPER

> Design : lire `DESIGN_CONTRACT.md` → extraire `design_system` → charger
> `03_Developpement_App_and_Design/Ressources/Design_System/kits/chamfer-paper-ink/prompt_pack.json`
> et rien d'autre pour le thème.
> Si tu styles sans ce pack, tu es hors contrat.

Les règles générales sont dans le `AGENTS.md` racine (250 lignes max par fichier, données dans `data/*.json`, tests obligatoires). Ce fichier ne contient que ce qui est propre à l'app.

## Où lire
| Besoin | Fichier |
|---|---|
| Fonctionnement, configuration, structure | `README.md` |
| Pourquoi c'est construit ainsi, non-objectifs | `DECISIONS.md` |
| Ce qui marche, prochaine étape, feuille de route | `STATE.md` |
| Cadrage produit | `BRIEF.md`, `PRD.md` |
| Historique du nettoyage | `AUDIT.md` |

## Règles propres à l'app
1. **Rien ne simule un succès.** Un envoi, une vérification ou un contrôle qui ne peut pas conclure renvoie un échec ou `UNVERIFIED`, jamais « OK ».
2. **`VERIFIED` = preuve** (MX qui accepte la boîte et refuse une adresse aléatoire, ou Hunter `valid`). Voir ADR-005.
3. **Envoi = API Gmail uniquement** (`engine/google_oauth.js`). Pas de SMTP, pas de mot de passe d'application.
4. **Aucun secret vers le navigateur** : passer par `engine.publicConfig()` et `googleOAuth.publicStatus()`.
5. **Tout texte issu d'un CSV ou du serveur est échappé** avant `innerHTML` (`SniperUIHelpers.esc`) et dans les emails (`mail_composer.js`).
6. **Configuration** : défauts uniquement dans `data/config.example.json`, lecture via `engine/store.js`.
7. Mettre à jour `STATE.md` à la fin d'un chantier.

## Validation avant « terminé »
```bash
npm test                                                        # depuis apps/outbound_sniper
node 03_Developpement_App_and_Design/toolbox/test_code_integrity.js
node 03_Developpement_App_and_Design/toolbox/gatekeeper.js --check
```
