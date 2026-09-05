# 📸 Tests de Régression Visuelle avec SnapshotTesting

Ce guide documente l'intégration de **[pointfreeco/swift-snapshot-testing](https://github.com/pointfreeco/swift-snapshot-testing)** pour figer le rendu visuel de l'application et prévenir automatiquement les régressions d'interface.

---

## 🎯 1. Pourquoi le Snapshot Testing ?

Les tests unitaires classiques vérifient la logique métier, mais pas les bugs visuels (un texte tronqué en mode sombre, un bouton écrasé sur iPhone SE, ou un layout cassé avec Dynamic Type XXL). Le Snapshot Testing capture une image pixel-perfect de chaque composant et compare automatiquement le rendu avec l'image de référence à chaque pull request.

---

## 🛠️ 2. Modèle de Test Snapshot (Dark Mode & Formats d'Écran)

```swift
import XCTest
import SnapshotTesting
import SwiftUI
@testable import AevumApp

final class BentoSnapshotTests: XCTestCase {
    
    func testVitalityWidgetAppearance() {
        let widget = VitalityScoreWidget(
            profile: UserProfile(chronologicalAge: 30, estimatedBiologicalAge: 32.5, currentVitalityScore: 82),
            hrvScore: 58.0
        )
        .frame(width: 350, height: 180)
        .background(Color(red: 0.03, green: 0.04, blue: 0.07))
        .preferredColorScheme(.dark)
        
        let view = UIHostingController(rootView: widget)
        
        // 1. Test sur iPhone 15 Pro
        assertSnapshot(of: view, as: .image(on: .iPhone13Pro))
        
        // 2. Test avec Dynamic Type Extra Large
        assertSnapshot(
            of: view,
            as: .image(traits: .init(preferredContentSizeCategory: .accessibilityExtraLarge))
        )
    }
}
```

---

## 📋 3. Matrice de Validation Visuelle Obligatoire
* [ ] Mode Sombre natif (`.dark`)
* [ ] Mode Clair éventuel (`.light`)
* [ ] Taille d'écran compacte (iPhone SE / 4.7")
* [ ] Taille d'écran standard (iPhone 15 / 6.1")
* [ ] Taille d'écran Max (iPhone 15 Pro Max / 6.7")
* [ ] Taille de police Accessibility XXL (Dynamic Type)
