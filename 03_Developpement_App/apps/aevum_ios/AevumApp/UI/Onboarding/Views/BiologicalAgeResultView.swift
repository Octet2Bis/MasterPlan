import SwiftUI

// MARK: - Étape 2 : Révélation du Diagnostic & Contraste
public struct BiologicalAgeResultView: View {
    @Binding public var currentStep: Int
    @Binding public var profile: UserProfile
    public var onStartFirstChallenge: () -> Void
    
    public var body: some View {
        VStack(spacing: 24) {
            Spacer()
            
            // Badge & Titre
            VStack(spacing: 8) {
                Text("RÉSULTAT DE VOTRE BILAN")
                    .font(.system(size: 11, weight: .bold, design: .rounded))
                    .foregroundColor(AevumTheme.emeraldAccent)
                    .tracking(2)
                
                Text("Votre Capital Biologique")
                    .font(.system(size: 26, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
            }
            
            // Jauge Bento Centrale
            BentoCard(accentColor: AevumTheme.cyanAccent) {
                VStack(spacing: 16) {
                    HStack(spacing: 24) {
                        VStack(spacing: 4) {
                            Text("Âge Réel")
                                .font(.system(size: 12, weight: .medium, design: .rounded))
                                .foregroundColor(AevumTheme.textSecondary)
                            Text("\(profile.chronologicalAge) ans")
                                .font(.system(size: 24, weight: .bold, design: .rounded))
                                .foregroundColor(.white)
                        }
                        
                        Image(systemName: "arrow.right")
                            .foregroundColor(AevumTheme.roseAccent)
                            .font(.system(size: 18, weight: .bold))
                        
                        VStack(spacing: 4) {
                            Text("Âge Biologique")
                                .font(.system(size: 12, weight: .bold, design: .rounded))
                                .foregroundColor(AevumTheme.roseAccent)
                            Text(String(format: "%.1f ans", profile.estimatedBiologicalAge))
                                .font(.system(size: 32, weight: .heavy, design: .rounded))
                                .foregroundColor(AevumTheme.roseAccent)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    
                    Divider().background(AevumTheme.cardBorder)
                    
                    HStack {
                        Image(systemName: "shield.lefthalf.filled")
                            .foregroundColor(AevumTheme.cyanAccent)
                        Text("Score de Vitalité : \(profile.currentVitalityScore)/100")
                            .font(.system(size: 14, weight: .semibold, design: .rounded))
                            .foregroundColor(AevumTheme.textPrimary)
                    }
                }
                .padding(.vertical, 8)
            }
            
            // Message d'ancrage psychologique
            VStack(alignment: .leading, spacing: 10) {
                HStack(alignment: .top, spacing: 12) {
                    Image(systemName: "sparkles")
                        .foregroundColor(AevumTheme.emeraldAccent)
                        .font(.system(size: 18))
                    
                    Text("Bonne nouvelle : ce décalage est entièrement réversible en remplaçant vos réflexes d'écran passifs par nos micro-protocoles de 30 secondes.")
                        .font(.system(size: 13, weight: .regular, design: .rounded))
                        .foregroundColor(AevumTheme.textSecondary)
                        .lineSpacing(3)
                }
            }
            .padding(16)
            .background(AevumTheme.bgSecondary)
            .clipShape(RoundedRectangle(cornerRadius: 16))
            
            Spacer()
            
            // Bouton vers le 1er Défi (Aha! Moment)
            Button {
                SoundHapticManager.shared.triggerHaptic(style: .heavy)
                onStartFirstChallenge()
            } label: {
                HStack {
                    Image(systemName: "wind")
                    Text("Faire mon 1er Défi : Soupir (26s)")
                        .font(.system(size: 16, weight: .bold, design: .rounded))
                }
                .foregroundColor(AevumTheme.bgPrimary)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(AevumTheme.vitalityGradient)
                .clipShape(RoundedRectangle(cornerRadius: AevumTheme.radiusButton))
                .shadow(color: AevumTheme.emeraldAccent.opacity(0.4), radius: 12)
            }
        }
        .padding(.horizontal, 20)
    }
}
