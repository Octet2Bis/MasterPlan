---
name: ios-screentime-architect
description: Guide d'architecture et d'implémentation pour applications iOS natives en SwiftUI intégrant la Screen Time API (FamilyControls, ManagedSettings, DeviceActivity), HealthKit, WidgetKit et Live Activities. À utiliser dans 03_Developpement_App/.
---

# 🍏 iOS Screen Time & SwiftUI Architect

Ce skill définit les standards d'architecture, les modèles de code Swift et les règles de conformité pour concevoir une application iOS native moderne avec verrouillage/shielding d'applications, suivi d'activité et intégration HealthKit.

---

## 🏛️ 1. Architecture Modulaire des Cibles (Targets iOS)

Une application utilisant la Screen Time API ne peut pas être un simple binaire unique ; elle est obligatoirement découpée en **Target Principale + Extensions d'Application** isolées par le système :

```
AevumApp (Workspace Xcode)
├── Aevum (Main App Target)
│   ├── App / Navigation / State (AppStorage, SwiftData)
│   ├── Views (Bento UI, Onboarding, Protocol Timers, Insights)
│   ├── Managers (ScreenTimeManager, HealthKitManager, NotificationManager)
│   └── Entitlements: com.apple.developer.family-controls
│
├── AevumShield (ShieldConfigurationExtension Target)
│   ├── ShieldConfigurationExtension.swift
│   └── Fournit l'UI native (icône, titre, bouton défi) quand une app bloquée s'ouvre
│
├── AevumShieldAction (ShieldActionExtension Target)
│   ├── ShieldActionExtension.swift
│   └── Intercepte le clic sur le bouton du Shield pour rediriger vers le défi
│
└── AevumActivityMonitor (DeviceActivityMonitor Target)
    ├── DeviceActivityMonitorExtension.swift
    └── Réagit aux seuils d'utilisation ou aux plannings de blocage
```

---

## 🛡️ 2. Moteur Screen Time : Les 3 Piliers Swift

### A. Autorisation `FamilyControls`
```swift
import FamilyControls

@MainActor
class ScreenTimeManager: ObservableObject {
    static let shared = ScreenTimeManager()
    let center = AuthorizationCenter.shared
    
    @Published var isAuthorized: Bool = false
    
    func requestAuthorization() async {
        do {
            try await center.requestAuthorization(for: .individual)
            self.isAuthorized = true
        } catch {
            print("Erreur d'autorisation FamilyControls: \(error.localizedDescription)")
            self.isAuthorized = false
        }
    }
}
```

### B. Blocage & Déblocage via `ManagedSettingsStore`
```swift
import ManagedSettings
import FamilyControls

class ShieldService {
    static let shared = ShieldService()
    let store = ManagedSettingsStore()
    
    // Applique le bouclier sur la sélection de l'utilisateur
    func applyShield(to selection: FamilyActivitySelection) {
        store.shield.applications = selection.applicationTokens.isEmpty ? nil : selection.applicationTokens
        store.shield.applicationCategories = selection.categoryTokens.isEmpty ? nil : .specific(selection.categoryTokens)
    }
    
    // Débloque temporairement les applications après validation du micro-défi
    func removeShield() {
        store.shield.applications = nil
        store.shield.applicationCategories = nil
    }
}
```

### C. Personnalisation du Shield (`ShieldConfigurationExtension`)
```swift
import ManagedSettingsUI
import ManagedSettings
import UIKit

class ShieldConfigurationExtension: ShieldConfigurationDataSource {
    override func configuration(shielding application: Application) -> ShieldConfiguration {
        return ShieldConfiguration(
            backgroundBlurStyle: .systemUltraThinMaterialDark,
            backgroundColor: UIColor(red: 0.05, green: 0.07, blue: 0.11, alpha: 1.0),
            icon: UIImage(systemName: "heart.and.sparkles.fill"),
            title: ShieldConfiguration.Label(text: "Aevum • Micro-Défi Requis", color: .white),
            subtitle: ShieldConfiguration.Label(text: "Prenez 30 secondes pour régénérer votre posture avant de continuer.", color: .lightGray),
            primaryButtonLabel: ShieldConfiguration.Label(text: "Lancer le Micro-Défi (30s)", color: .white),
            primaryButtonBackgroundColor: UIColor(red: 0.12, green: 0.53, blue: 0.90, alpha: 1.0),
            secondaryButtonLabel: ShieldConfiguration.Label(text: "Quitter vers l'Accueil", color: .gray)
        )
    }
}
```

---

## 🩺 3. Intégration HealthKit (Respect strict Privacy 5.1)

```swift
import HealthKit

class HealthKitService: ObservableObject {
    let healthStore = HKHealthStore()
    
    func requestPermissions() async -> Bool {
        guard HKHealthStore.isHealthDataAvailable() else { return false }
        
        let readTypes: Set<HKObjectType> = [
            HKObjectType.quantityType(forIdentifier: .heartRateVariabilitySDNN)!,
            HKObjectType.quantityType(forIdentifier: .stepCount)!,
            HKObjectType.categoryType(forIdentifier: .sleepAnalysis)!
        ]
        
        let writeTypes: Set<HKSampleType> = [
            HKObjectType.categoryType(forIdentifier: .mindfulSession)!,
            HKObjectType.quantityType(forIdentifier: .dietaryWater)!
        ]
        
        do {
            try await healthStore.requestAuthorization(toShare: writeTypes, read: readTypes)
            return true
        } catch {
            return false
        }
    }
    
    // Enregistre la validation d'une séance de respiration
    func recordMindfulSession(durationSeconds: Double) async {
        guard let mindfulType = HKObjectType.categoryType(forIdentifier: .mindfulSession) else { return }
        let now = Date()
        let start = now.addingTimeInterval(-durationSeconds)
        let sample = HKCategorySample(type: mindfulType, value: 0, start: start, end: now)
        try? await healthStore.save(sample)
    }
}
```

---

## 🎨 4. Standards UI/UX SwiftUI (Bento Grid & Animations)

* **Design Tokens :** Utilisation des palettes HSL sombres (`#0B0F19`, `#1E293B`, `#38BDF8`).
* **Haptique :** `UIImpactFeedbackGenerator(style: .medium).impactOccurred()` à chaque étape du timer respiratoire.
* **Canvas d'Animation :** `TimelineView` et courbes d'accélération `.easeInOut(duration: 4.0)` pour guider le souffle de façon fluide et hypnotique à 120Hz.
