import SwiftUI

// MARK: - Widget Bento : Contrôle Rapide du Bouclier Screen Time
public struct QuickShieldToggleWidget: View {
    @ObservedObject public var screenTimeManager: ScreenTimeManager
    public var onSelectApps: () -> Void
    
    public var body: some View {
        BentoCard(accentColor: screenTimeManager.isShieldActive ? AevumTheme.emeraldAccent : AevumTheme.roseAccent) {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Label("BOUCLIER DE FRICTION", systemImage: screenTimeManager.isShieldActive ? "shield.fill" : "shield.slash.fill")
                        .font(.system(size: 10, weight: .bold, design: .rounded))
                        .foregroundColor(screenTimeManager.isShieldActive ? AevumTheme.emeraldAccent : AevumTheme.roseAccent)
                        .tracking(1.2)
                    Spacer()
                    
                    if screenTimeManager.gracePeriodRemainingSeconds > 0 {
                        Text("Débloqué (\(screenTimeManager.gracePeriodRemainingSeconds / 60)m)")
                            .font(.system(size: 10, weight: .bold, design: .rounded))
                            .foregroundColor(AevumTheme.cyanAccent)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(AevumTheme.cyanAccent.opacity(0.15))
                            .clipShape(Capsule())
                    }
                }
                
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(screenTimeManager.isShieldActive ? "Protection Active" : "Bouclier en Pause")
                            .font(.system(size: 16, weight: .bold, design: .rounded))
                            .foregroundColor(.white)
                        Text("\(screenTimeManager.selectedAppCount) applications sélectionnées")
                            .font(.system(size: 11, weight: .regular, design: .rounded))
                            .foregroundColor(AevumTheme.textSecondary)
                    }
                    Spacer()
                    
                    // Bouton Configurer
                    Button(action: onSelectApps) {
                        Image(systemName: "slider.horizontal.3")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(.white)
                            .padding(10)
                            .background(AevumTheme.bgSecondary)
                            .clipShape(Circle())
                            .overlay(Circle().stroke(AevumTheme.cardBorder, lineWidth: 1))
                    }
                }
            }
        }
    }
}
