# 🏗️ Architecture TCA & Gestion d'État Unidirectionnelle

Ce guide documente les meilleures pratiques issues de **[pointfreeco/swift-composable-architecture](https://github.com/pointfreeco/swift-composable-architecture) (TCA)** et de **[element-hq/element-x-ios](https://github.com/element-hq/element-x-ios)** pour structurer des applications iOS modulaires et déterministes.

---

## 🔄 1. Le Flux Unidirectionnel TCA (State ➔ Action ➔ Reducer ➔ Effect)

```
        ┌─────────────────────────────────────────────────────────┐
        │                        USER INTERFACE                   │
        │                     (SwiftUI View / Store)              │
        └──────────────┬───────────────────────────▲──────────────┘
                       │                           │
          Envoie une Action                   Met à jour l'État
                       │                           │
                       ▼                           │
        ┌────────────────────────┐       ┌────────────────────────┐
        │        REDUCER         │───────┤         STATE          │
        │ (Logique Métier Pure)  │       │ (Source Unique Vérité) │
        └──────────────┬─────────┘       └────────────────────────┘
                       │
             Déclenche un Effect (Async)
                       │
                       ▼
        ┌────────────────────────┐
        │      DEPENDENCY /      │
        │     ASYNC SERVICE      │
        │  (ScreenTime / GRDB)   │
        └────────────────────────┘
```

---

## 🛠️ 2. Modèle de Code Réutilisable (Pattern Reducer)

```swift
import ComposableArchitecture
import Foundation

@Reducer
struct ChallengeFeature {
    @ObservableState
    struct State: Equatable {
        var activeProtocol: LongevityProtocol?
        var timeRemaining: Double = 0.0
        var isShieldActive: Bool = true
        var completedSessionsCount: Int = 0
    }
    
    enum Action: Equatable {
        case launchProtocol(LongevityProtocol)
        case timerTicked
        case challengeCompleted
        case dismissChallenge
    }
    
    @Dependency(\.continuousClock) var clock
    @Dependency(\.soundHaptic) var haptic
    
    var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case let .launchProtocol(proto):
                state.activeProtocol = proto
                state.timeRemaining = Double(proto.durationSeconds)
                return .run { send in
                    await haptic.trigger(.medium)
                }
                
            case .timerTicked:
                if state.timeRemaining > 0.1 {
                    state.timeRemaining -= 0.1
                    return .none
                } else {
                    return .send(.challengeCompleted)
                }
                
            case .challengeCompleted:
                state.completedSessionsCount += 1
                state.isShieldActive = false
                return .run { send in
                    await haptic.playSuccess()
                }
                
            case .dismissChallenge:
                state.activeProtocol = nil
                return .none
            }
        }
    }
}
```

---

## 📦 3. Modularisation & Découpage par Modules (Inspiré d'Element-X)

Pour les applications qui grandissent :
1. **Module `AppCore` :** Contrats, types primitifs et entités de domaine partagés.
2. **Module `DesignSystem` :** Composants visuels, palettes, modificateurs Bento.
3. **Module `ScreenTimeService` :** Client d'encapsulation de l'API Apple avec mock automatique pour les tests.
4. **Features Isolées :** Chaque écran ou flux (`OnboardingFeature`, `DashboardFeature`, `ChallengeFeature`) vit dans son propre sous-module Swift Package.
