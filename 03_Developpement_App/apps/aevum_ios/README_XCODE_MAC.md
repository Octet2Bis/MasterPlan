# 🍏 Guide de Déploiement & Build Xcode sur Mac : Application "Aevum"

Ce guide pas à pas est destiné à compiler et installer l'application **Aevum** sur iPhone ou à la publier sur **TestFlight** depuis un Mac équipé de Xcode 15+.

---

## ⚡ 1. Pré-requis & Outils
* **macOS :** Sonoma ou version ultérieure.
* **Xcode :** Version 15.0 ou supérieure avec le SDK iOS 16+.
* **Compte Apple Developer :** Actif (Apple Developer Program à 99$/an).
* **XcodeGen (Optionnel mais recommandé) :** `brew install xcodegen`.

---

## 🚀 2. Génération du Projet Xcode (.xcodeproj)

Dans le terminal de votre Mac, rendez-vous dans le dossier `aevum_ios` :
```bash
cd /chemin/vers/aevum_ios
xcodegen generate
```
*Cette commande va générer instantanément le fichier `Aevum.xcodeproj` avec toutes les cibles (Main App, Shield, ShieldAction, ActivityMonitor) et leurs dépendances configurées.*

*Note : Si XcodeGen n'est pas installé, vous pouvez simplement créer un nouveau projet SwiftUI "Aevum" dans Xcode et glisser-déposer les dossiers `AevumApp/` et `Extensions/`.*

---

## 🔑 3. Configuration de la Signature & des Identifiants (Signing & Capabilities)

Dans Xcode, ouvrez `Aevum.xcodeproj` :

1. **Sélectionnez la cible principale `Aevum` :**
   * Allez dans l'onglet **Signing & Capabilities**.
   * Cochez **Automatically manage signing**.
   * Sélectionnez votre **Team Apple Developer**.
   * Dans **Bundle Identifier**, renseignez votre identifiant (ex: `com.votre-nom.aevum`).
   * Vérifiez la présence des 2 capacités :
     * `Family Controls`
     * `App Groups` (sélectionnez `group.com.aevum.app`).

2. **Sélectionnez les 3 cibles d'extensions (`AevumShield`, `AevumShieldAction`, `AevumActivityMonitor`) :**
   * Sélectionnez la même **Team** de signature.
   * Assurez-vous que l'App Group `group.com.aevum.app` est coché pour chaque cible.

---

## 📲 4. Test Local sur iPhone (Installation Directe)

1. Branchez votre iPhone au Mac avec un câble Lightning/USB-C.
2. Déverrouillez votre iPhone et acceptez **Faire confiance à cet ordinateur**.
3. Dans la barre supérieure de Xcode, sélectionnez votre iPhone physique comme destination de build.
4. Cliquez sur **Product > Run (Cmd + R)**.
5. Sur votre iPhone, acceptez l'autorisation Screen Time (`FamilyControls`) et commencez votre premier protocole de respiration !

---

## ☁️ 5. Déploiement sur TestFlight (Distribution sans fil)

1. Dans la barre supérieure de Xcode, sélectionnez **Any iOS Device (arm64)** comme cible.
2. Cliquez sur **Product > Archive**.
3. Une fois l'archive terminée, la fenêtre *Organizer* s'ouvre :
   * Cliquez sur **Distribute App**.
   * Choisissez **Custom > App Store Connect > TestFlight Internal Only**.
   * Validez les étapes automatiques de signature.
4. Dans **App Store Connect (appstoreconnect.apple.com)** :
   * Allez dans l'onglet **TestFlight**.
   * Ajoutez votre e-mail dans le groupe **Testeurs Internes**.
   * Vous recevrez l'invitation sur votre iPhone en quelques minutes !
