---
name: apple-appstore-publisher
description: Standard de conformité, packaging et publication pour l'App Store Apple. Gère le Privacy Manifest (PrivacyInfo.xcprivacy), la justification d'entitlements FamilyControls, les règles HealthKit et l'App Store Optimization (ASO). À utiliser dans 03_Developpement_App_and_Design/ et 01_GTM_Growth/.
---

# 🍏 Apple App Store Publisher & Compliance

Ce skill fournit la checklist de validation, les fichiers de conformité et le protocole d'approbation pour publier avec succès une application iOS intégrant la Screen Time API et HealthKit.

---

## 📋 1. Checklist Incontournable de Soumission

* [ ] **Privacy Manifest (`PrivacyInfo.xcprivacy`) :** Obligatoire depuis 2024. Déclare les APIs à usage restreint (UserDefaults, File Timestamp, System Boot Time).
* [ ] **FamilyControls Entitlement Request :** Formulaire officiel soumis à Apple pour justifier l'usage de `com.apple.developer.family-controls` dans la catégorie *Digital Health & Wellbeing*.
* [ ] **HealthKit String Descriptions (`Info.plist`) :**
  * `NSHealthShareUsageDescription` : Justification claire et orientée utilisateur ("Aevum analyse votre variabilité cardiaque pour mesurer votre niveau de stress.").
  * `NSHealthUpdateUsageDescription` : ("Aevum enregistre vos minutes de pleine conscience.").
* [ ] **Directive 5.1.1 (Données de Santé) :** Zéro tracking publicitaire, interdiction stricte de revendre des données de santé ou de les stocker hors du conteneur sécurisé.
* [ ] **In-App Purchase & StoreKit 2 :** Présence obligatoire du lien des CGU (Terms of Use / EULA) et de la Politique de Confidentialité sur le paywall.

---

## 📄 2. Modèle de Privacy Manifest (`PrivacyInfo.xcprivacy`)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>NSPrivacyTracking</key>
    <false/>
    <key>NSPrivacyTrackingDomains</key>
    <array/>
    <key>NSPrivacyCollectedDataTypes</key>
    <array>
        <dict>
            <key>NSPrivacyCollectedDataType</key>
            <string>NSPrivacyCollectedDataTypeHealth</string>
            <key>NSPrivacyCollectedDataTypeLinked</key>
            <false/>
            <key>NSPrivacyCollectedDataTypeTracking</key>
            <false/>
            <key>NSPrivacyCollectedDataTypePurposes</key>
            <array>
                <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
            </array>
        </dict>
    </array>
    <key>NSPrivacyAccessedAPITypes</key>
    <array>
        <dict>
            <key>NSPrivacyAccessedAPIType</key>
            <string>NSPrivacyAccessedAPICategoryUserDefaults</string>
            <key>NSPrivacyAccessedAPITypeReasons</key>
            <array>
                <string>CA92.1</string>
            </array>
        </dict>
    </array>
</dict>
</plist>
```

---

## 📝 3. Modèle de Lettre de Justification pour l'App Reviewer Apple

> **Note aux Reviewers Apple :**
> *Aevum est une application de santé préventive et de longévité (Health & Fitness / Productivity). L'autorisation `FamilyControls` est strictement utilisée pour permettre à l'utilisateur de s'imposer des micro-pauses régénératrices de santé (respiration parasympathique, étirements du rachis) lorsqu'il tente d'ouvrir ses applications chronophages.*
> *Aucune donnée de navigation privée n'est transmise à des serveurs tiers. Tout le traitement du temps d'écran s'effectue localement via l'API officielle ManagedSettings.*
