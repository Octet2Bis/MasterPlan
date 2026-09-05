import SwiftUI

// MARK: - Écran de Succès, Récompense & Déblocage 15 min
public struct SuccessRewardView: View {
    public let longevityProtocol: LongevityProtocol
    public var onDismiss: () -> Void
    
    public var body: some View {
        ZStack {
            AevumTheme.bgPrimary.ignoresSafeArea()
            
            VStack(spacing: 28) {
                Spacer()
                
                // Icône de Succès Lumineuse
                ZStack {
                    Circle()
                        .fill(AevumTheme.emeraldAccent.opacity(0.15))
                        .frame(width: 120, height: 120)
                    
                    Circle()
                        .stroke(AevumTheme.emeraldAccent, lineWidth: 3)
                        .frame(width: 90, height: 90)
                        .shadow(color: AevumTheme.emeraldAccent.opacity(0.8), radius: 15)
                    
                    Image(systemName: "checkmark")
                        .font(.system(size: 40, weight: .bold))
                        .foregroundColor(AevumTheme.emeraldAccent)
                }
                
                // Titre & Félicitations
                VStack(spacing: 8) {
                    Text("MICRO-DÉFI VALIDÉ")
                        .font(.system(size: 11, weight: .bold, design: .rounded))
                        .foregroundColor(AevumTheme.emeraldAccent)
                        .tracking(2)
                    
                    Text("Corps Régénéré")
                        .font(.system(size: 28, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                    
                    Text(longevityProtocol.title)
                        .font(.system(size: 14, weight: .medium, design: .rounded))
                        .foregroundColor(AevumTheme.textSecondary)
                }
                
                // Bento Récompense
                BentoCard(accentColor: AevumTheme.cyanAccent) {
                    VStack(spacing: 16) {
                        HStack {
                            VStack(alignment: .leading, spacing: 2) {
                                Text("+\(longevityProtocol.xpReward) XP VITALITÉ")
                                    .font(.system(size: 16, weight: .bold, design: .rounded))
                                    .foregroundColor(AevumTheme.cyanAccent)
                                Text("Score de longévité renforcé")
                                    .font(.system(size: 11, weight: .regular, design: .rounded))
                                    .foregroundColor(AevumTheme.textSecondary)
                            }
                            Spacer()
                            Image(systemName: "sparkles")
                                .font(.system(size: 22))
                                .foregroundColor(AevumTheme.cyanAccent)
                        }
                        
                        Divider().background(AevumTheme.cardBorder)
                        
                        HStack {
                            VStack(alignment: .leading, spacing: 2) {
                                Text("ACCÈS ÉCRAN DÉBLOQUÉ")
                                    .font(.system(size: 14, weight: .bold, design: .rounded))
                                    .foregroundColor(AevumTheme.emeraldAccent)
                                Text("Fenêtre de 15 minutes accordée")
                                    .font(.system(size: 11, weight: .regular, design: .rounded))
                                    .foregroundColor(AevumTheme.textSecondary)
                            }
                            Spacer()
                            Image(systemName: "lock.open.fill")
                                .font(.system(size: 20))
                                .foregroundColor(AevumTheme.emeraldAccent)
                        }
                    }
                }
                .padding(.horizontal, 20)
                
                Spacer()
                
                // Bouton Terminer
                Button {
                    SoundHapticManager.shared.triggerHaptic(style: .medium)
                    onDismiss()
                } label: {
                    Text("Continuer vers l'Accueil")
                        .font(.system(size: 16, weight: .bold, design: .rounded))
                        .foregroundColor(AevumTheme.bgPrimary)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(AevumTheme.vitalityGradient)
                        .clipShape(RoundedRectangle(cornerRadius: AevumTheme.radiusButton))
                        .shadow(color: AevumTheme.emeraldAccent.opacity(0.4), radius: 12)
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 20)
            }
        }
    }
}
