# 📱 Guide Opérationnel : Compilation Cloud iOS & Streaming Appetize.io

Ce guide documente la procédure pour compiler n'importe quelle application iOS native du Master Plan dans le cloud (macOS Runner GitHub Actions) et la tester en direct dans le navigateur sur votre PC Windows.

---

## ⚡ 1. Fonctionnement de la Pipeline

```
[VOTRE PC WINDOWS] ──(git push)──> [GITHUB ACTIONS] (Runner macOS-14 Apple Silicon)
                                           │
                                    1. XcodeGen (génère .xcodeproj)
                                    2. xcodebuild (iphonesimulator SDK)
                                    3. Compression .app -> app.zip
                                           │
                                           ├──> [ARTEFACT GITHUB] (.zip téléchargeable)
                                           └──> [APPETIZE.IO] (Stream interactif dans Chrome)
```

---

## 🚀 2. Déclencher une Compilation (2 Méthodes)

### Méthode A : Depuis l'Interface Web de GitHub (1 Clic)
1. Allez sur votre dépôt GitHub dans l'onglet **Actions**.
2. Cliquez sur le workflow **`iOS Cloud Build & Stream (Appetize.io)`**.
3. Cliquez sur **`Run workflow`**, renseignez le nom du dossier (`aevum_ios`) et validez.
4. Au bout de 2 à 3 minutes, la compilation se termine.

### Méthode B : En Ligne de Commande via GitHub CLI (`gh`)
```bash
gh workflow run ios_build_and_stream.yml -f app_name="aevum_ios"
```

---

## 🕹️ 3. Accéder à l'Émulateur Interactif

### Sans Clé d'API (Gratuit / Sans Inscription) :
1. Dès que le job est terminé, téléchargez l'artefact **`aevum_ios-simulator-app`** (fichier `.zip`).
2. Rendez-vous sur **[appetize.io/upload](https://appetize.io/upload)**.
3. Glissez-déposez le `.zip` : l'émulateur iPhone 14 démarre instantanément dans votre navigateur Chrome.

### Avec Clé d'API Appetize (Entièrement Automatique) :
1. Créez un compte gratuit sur [appetize.io](https://appetize.io) (100 minutes d'émulation gratuites / mois).
2. Récupérez votre API Token dans votre dashboard Appetize.
3. Dans les **Settings > Secrets and variables > Actions** de votre repo GitHub, ajoutez le secret :
   - Nom : `APPETIZE_API_TOKEN`
   - Valeur : `votre_token`
4. À chaque compilation, GitHub Actions affichera directement le **lien cliquable vers votre iPhone 14 virtuel** dans le résumé du job !

---

## 📱 4. Le Pont Physique vers votre iPhone 14

Puisque vous possédez un iPhone 14, pour les fonctionnalités exclusives nécessitant du hardware réel (*Screen Time API*, *HealthKit*) :
* Cette même infrastructure cloud permet de générer un `.ipa` signé via Fastlane.
* Il est alors distribué directement sur votre iPhone via l'application Apple **TestFlight** sans jamais avoir besoin de brancher un câble à un Mac.
