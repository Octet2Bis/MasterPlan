# 🎨 Design Engineering : Gestes Fluides, Physique des Ressorts & UIKit Introspect

Ce guide compile les techniques d'ingénierie visuelle issues de **[FluidGroup/FluidInterfaceKit](https://github.com/FluidGroup/FluidInterfaceKit)** et **[siteline/swiftui-introspect](https://github.com/siteline/swiftui-introspect)** pour créer des interfaces mobiles hautement réactives et fluides.

---

## 🌊 1. Les Principes des Interfaces Fluides Apple (Fluid Interfaces)

1. **Interfaces Interruptibles (Interruptible Animations) :**
   * L'utilisateur doit pouvoir interrompre n'importe quelle animation en cours de route (par exemple, attraper une carte qui se referme pour la rouvrir instantanément).
   * Utiliser des ressorts physiques (`.interactiveSpring(response: 0.35, dampingFraction: 0.86)`) plutôt que des courbes cubiques linéaires ou rigides.
2. **Continuité de Vélocité (Velocity Preservation) :**
   * Lorsque l'utilisateur relâche un geste de glissement (*drag gesture*), la vitesse initiale du doigt doit être transmise à l'animation de fermeture ou d'ouverture.

---

## 🔍 2. Accès Fin aux Composants UIKit via `swiftui-introspect`

Lorsque SwiftUI atteint ses limites sur les composants système (comportement du scroll, barres de défilement, navigation bar), `swiftui-introspect` permet d'accéder au composant UIKit sous-jacent sans réécrire toute la vue :

```swift
import SwiftUI
import SwiftUIIntrospect

struct BentoScrollView<Content: View>: View {
    let content: Content
    
    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }
    
    var body: some View {
        ScrollView {
            content
        }
        .introspect(.scrollView, on: .iOS(.v16, .v17)) { scrollView in
            // Désactiver le bounce excessif ou ajuster les insets
            scrollView.alwaysBounceVertical = true
            scrollView.showsVerticalScrollIndicator = false
            scrollView.decelerationRate = .fast // Sensation de scroll réactif
        }
    }
}
```

---

## 🎯 3. Gestes Personnalisés & Cartes Déroulantes (BottomSheet Fluid)

* Pour les tiroirs de défis ou les modales de sélection :
  * Utiliser `DragGesture()` combiné avec un calcul d'élasticité logarithmique en bout de course pour éviter un arrêt brutal.
