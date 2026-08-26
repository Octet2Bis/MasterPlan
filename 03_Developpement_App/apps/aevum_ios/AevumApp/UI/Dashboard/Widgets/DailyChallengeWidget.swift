import SwiftUI

// MARK: - Widget Bento : Défi Circadien Recommandé
public struct DailyChallengeWidget: View {
    public var currentProtocol: LongevityProtocol
    public var onLaunch: (LongevityProtocol) -> Void
    
    public var body: some View {
        BentoCard(accentColor: currentProtocol.category.accentColor) {
            VStack(alignment: .leading, spacing: 12) {
                // Header
                HStack {
                    Label(currentProtocol.category.rawValue.uppercased(), systemImage: currentProtocol.category.iconName)
                        .font(.system(size: 10, weight: .bold, design: .rounded))
                        .foregroundColor(currentProtocol.category.accentColor)
                        .tracking(1.2)
                    Spacer()
                    Text("\(currentProtocol.durationSeconds)s")
                        .font(.system(size: 11, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(currentProtocol.category.accentColor.opacity(0.2))
                        .clipShape(Capsule())
                }
                
                // Titre & Sous-titre
                VStack(alignment: .leading, spacing: 3) {
                    Text(currentProtocol.title)
                        .font(.system(size: 18, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                    Text(currentProtocol.subtitle)
                        .font(.system(size: 12, weight: .regular, design: .rounded))
                        .foregroundColor(AevumTheme.textSecondary)
                        .lineLimit(2)
                }
                
                // Bouton de lancement direct
                Button {
                    SoundHapticManager.shared.triggerHaptic(style: .medium)
                    onLaunch(currentProtocol)
                } label: {
                    HStack {
                        Image(systemName: "play.fill")
                            .font(.system(size: 11))
                        Text("Lancer le Micro-Défi")
                            .font(.system(size: 13, weight: .bold, design: .rounded))
                    }
                    .foregroundColor(AevumTheme.bgPrimary)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(currentProtocol.category.accentColor)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .shadow(color: currentProtocol.category.accentColor.opacity(0.35), radius: 8)
                }
            }
        }
    }
}
