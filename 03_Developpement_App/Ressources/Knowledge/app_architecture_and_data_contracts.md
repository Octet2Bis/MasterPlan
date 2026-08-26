# 📐 Architecture Logicielle & Contrats de Données : "Aevum"

Ce document définit les structures de données Swift, le schéma de persistance locale (SwiftData / SQLite) et les contrats de communication de l'application Aevum.

---

## 🏛️ 1. Architecture Modulaire de l'App (MVVM-Clean)

```
03_Developpement_App/apps/aevum_ios/
├── App/
│   ├── AevumApp.swift                      # Point d'entrée principal
│   └── AppState.swift                      # État global réactif (@Observable)
├── Core/
│   ├── Models/                             # Entités pures et Enums
│   │   ├── ProtocolModel.swift             # Définition des micro-défis
│   │   ├── UserProfile.swift               # Âge biologique, objectifs, préférences
│   │   └── ChallengeSession.swift          # Historique des défis validés
│   ├── Services/                           # Services techniques isolés
│   │   ├── ScreenTimeManager.swift         # Gestion FamilyControls & ManagedSettings
│   │   ├── HealthKitManager.swift          # Synchronisation HRV, Sommeil, Mindful Mins
│   │   └── SoundHapticManager.swift        # Haptique et sons binauraux
│   └── Engine/                             # Moteur de règles
│       └── ProtocolRecommendationEngine.swift # Algorithme circadien & choix de défi
├── UI/
│   ├── DesignSystem/                       # Tokens, Bento Cards, Boutons luminescents
│   │   ├── Theme.swift
│   │   └── Components/ (BentoCard, AnimatedBreathingOrb, PulsingTimer)
│   ├── Onboarding/                         # Flow d'accueil et calcul du Vitality Score
│   │   ├── OnboardingContainerView.swift
│   │   └── Steps/ (Quiz, Permissions, AppPicker)
│   ├── Dashboard/                          # Vue principale Bento Grid
│   │   ├── DashboardView.swift
│   │   └── BentoWidgets/ (StreakWidget, QuickChallengeWidget, VitalityScoreWidget)
│   └── ChallengePlayer/                    # Lecteur interactif de micro-défis
│       ├── BreathingPlayerView.swift
│       └── MobilityPlayerView.swift
└── Extensions/                             # Targets Screen Time
    ├── AevumShield/
    ├── AevumShieldAction/
    └── AevumActivityMonitor/
```

---

## 📦 2. Contrats de Données Swift

### A. Le Modèle de Protocole (`ProtocolModel.swift`)
```swift
import Foundation

public enum ProtocolCategory: String, Codable, CaseIterable {
    case nervousSystem = "Système Nerveux"
    case postureMobility = "Mobilité & Rachis"
    case visionBrain = "Vision & Mental"
    case hydrationMetabolism = "Hydratation & Énergie"
    
    public var iconName: String {
        switch self {
        case .nervousSystem: return "wind"
        case .postureMobility: return "figure.walk"
        case .visionBrain: return "eye"
        case .hydrationMetabolism: return "drop.fill"
        }
    }
    
    public var accentColorHex: String {
        switch self {
        case .nervousSystem: return "#38BDF8"      // Bleu cyan
        case .postureMobility: return "#34D399"    // Vert émeraude
        case .visionBrain: return "#A78BFA"        // Violet lavande
        case .hydrationMetabolism: return "#F59E0B" // Ambre solaire
        }
    }
}

public struct LongevityProtocol: Identifiable, Codable {
    public let id: String
    public let title: String
    public let subtitle: String
    public let category: ProtocolCategory
    public let durationSeconds: Int
    public let scientificSource: String
    public let steps: [ProtocolStep]
    public let targetCircadianSlot: [CircadianSlot]
}

public enum CircadianSlot: String, Codable {
    case morning
    case afternoon
    case evening
}

public struct ProtocolStep: Codable {
    public let phaseName: String       // ex: "Inspiration", "Rétention", "Étirement"
    public let durationSeconds: Double
    public let instructionText: String
}
```

### B. Le Profil Utilisateur & Score Vitalité (`UserProfile.swift`)
```swift
import Foundation

public struct UserProfile: Codable {
    public var chronologicalAge: Int
    public var estimatedBiologicalAge: Double
    public var currentVitalityScore: Int      // 0 à 100
    public var completedChallengesCount: Int
    public var currentStreakDays: Int
    public var lastChallengeDate: Date?
    public var gracePeriodMinutes: Int       // ex: 15 minutes de déblocage après défi
    
    public static var defaultProfile: UserProfile {
        UserProfile(
            chronologicalAge: 30,
            estimatedBiologicalAge: 30.0,
            currentVitalityScore: 78,
            completedChallengesCount: 0,
            currentStreakDays: 1,
            lastChallengeDate: nil,
            gracePeriodMinutes: 15
        )
    }
}
```

---

## 💾 3. Persistance Locale & Données de Session (`ChallengeSession`)

```swift
public struct ChallengeSession: Identifiable, Codable {
    public let id: UUID
    public let protocolId: String
    public let timestamp: Date
    public let durationCompletedSeconds: Int
    public let category: ProtocolCategory
    public let wasInitiatedFromShield: Bool
}
```

Toutes les sessions sont enregistrées localement via `SwiftData` ou sérialisées de façon chiffrée dans les documents de l'application, avec synchronisation optionnelle vers Supabase si le compte cloud est activé.
