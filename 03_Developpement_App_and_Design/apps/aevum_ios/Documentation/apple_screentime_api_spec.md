# 🍏 Spécification Technique : Intégration Apple Screen Time API dans "Aevum"

Ce document détaille l'architecture des extensions natives iOS et le cycle de vie du verrouillage / déverrouillage de l'application Aevum.

---

## 🏗️ 1. Architecture des Composants Apple

```
┌────────────────────────────────────────────────────────────────────────┐
│                        AEVUM MAIN APPLICATION                          │
│  • Vue de sélection des applications (FamilyActivityPicker)             │
│  • Stockage persistant de la sélection (FamilyActivitySelection)        │
│  • Enregistrement du planning de surveillance (DeviceActivitySchedule)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Partage via App Group (.group.com.aevum.app)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│             MANAGED SETTINGS & DEVICE ACTIVITY EXTENSIONS              │
│                                                                        │
│  ┌──────────────────────────────┐    ┌──────────────────────────────┐  │
│  │ ShieldConfigurationExtension │    │   ShieldActionExtension      │  │
│  │  (Rendu visuel du blocage)   │    │  (Bouton "Lancer le Défi")   │  │
│  └──────────────────────────────┘    └──────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                  DeviceActivityMonitorExtension                  │  │
│  │  (Détecte les intervalles d'écran & applique le ManagedSettings) │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 2. Cycle de Vie du "Bouclier de Friction Positive"

1. **Phase de Configuration (Onboarding / Réglages) :**
   * L'utilisateur accorde la permission `FamilyControls.AuthorizationCenter.shared.requestAuthorization(for: .individual)`.
   * L'utilisateur choisit ses applications cibles (ex: Instagram, TikTok, Twitter, Reddit) via le composant système `familyActivityPicker(isPresented: $showPicker, selection: $activitySelection)`.
   * Les tokens d'applications et de catégories sont sérialisés dans le conteneur partagé `UserDefaults(suiteName: "group.com.aevum.app")`.

2. **Phase de Surveillance Passive :**
   * `DeviceActivityCenter.shared.startMonitoring(.dailyInterval, during: schedule, events: events)`.
   * Le `ManagedSettingsStore()` applique le bouclier (`store.shield.applications = selection.applicationTokens`).

3. **Phase d'Interception (L'utilisateur ouvre une app bloquée) :**
   * iOS affiche immédiatement la vue fournie par `ShieldConfigurationExtension`.
   * Le texte affiche le micro-défi recommandé en fonction de l'horloge circadienne (ex: *"30s de décompression lombaire requise"*).
   * L'utilisateur clique sur le bouton primaire : `ShieldActionExtension` gère l'action et ouvre l'application Aevum via le Custom URL Scheme (`aevum://challenge?id=MOB-01`).

4. **Phase de Déverrouillage :**
   * L'utilisateur termine le micro-défi dans Aevum (timer validé, haptique déclenchée).
   * Aevum lève temporairement le bouclier (`ManagedSettingsStore().shield.applications = nil`) pour une durée paramétrée (ex: 15 minutes de déblocage).
   * À la fin de la fenêtre de grâce, le bouclier est réappliqué automatiquement.

---

## 🛡️ 3. Gestion des Entitlements & App Review

* **Entitlement requis :** `com.apple.developer.family-controls`
* **Catégorie déclarée :** Health & Fitness / Productivity
* **Stockage Sécurisé :** Les données de santé HealthKit ne sont **jamais** écrites dans l'App Group ou partagées avec les extensions. Seul l'état de validation du défi est synchronisé.
