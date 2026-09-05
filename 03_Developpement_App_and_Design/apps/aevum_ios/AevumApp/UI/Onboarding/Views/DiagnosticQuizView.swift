import SwiftUI

// MARK: - Étape 1 : Quiz Diagnostic d'Âge Biologique
public struct DiagnosticQuizView: View {
    @Binding public var currentStep: Int
    @Binding public var profile: UserProfile
    
    @State private var selectedScreenOption: Int = 1
    @State private var selectedUnconsciousOption: Int = 1
    @State private var jointStiffness: Bool = true
    @State private var brainFog: Bool = true
    
    public var body: some View {
        VStack(alignment: .leading, spacing: 24) {
            // Header
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("DIAGNOSTIC SANTÉ 30 ANS")
                        .font(.system(size: 11, weight: .bold, design: .rounded))
                        .foregroundColor(AevumTheme.cyanAccent)
                        .tracking(1.5)
                    Spacer()
                    Text("Étape 1 sur 3")
                        .font(.system(size: 12, weight: .medium, design: .rounded))
                        .foregroundColor(AevumTheme.textMuted)
                }
                
                Text("Mesurez l'impact du quotidien sur votre capital biologique.")
                    .font(.system(size: 22, weight: .bold, design: .rounded))
                    .foregroundColor(AevumTheme.textPrimary)
            }
            
            ScrollView(showsIndicators: false) {
                VStack(spacing: 20) {
                    // Question 1 : Écran
                    BentoCard {
                        Text("1. Temps passé assis sur les écrans par jour")
                            .font(.system(size: 14, weight: .semibold, design: .rounded))
                            .foregroundColor(.white)
                        
                        HStack(spacing: 10) {
                            quizOptionButton(title: "< 4h", isSelected: selectedScreenOption == 0) {
                                selectedScreenOption = 0
                                profile.dailyScreenHours = 3.5
                            }
                            quizOptionButton(title: "5h à 7h", isSelected: selectedScreenOption == 1) {
                                selectedScreenOption = 1
                                profile.dailyScreenHours = 6.5
                            }
                            quizOptionButton(title: "8h+", isSelected: selectedScreenOption == 2) {
                                selectedScreenOption = 2
                                profile.dailyScreenHours = 9.0
                            }
                        }
                    }
                    
                    // Question 2 : Réflexe Inconscient
                    BentoCard {
                        Text("2. Déverrouillages machinaux du téléphone / jour")
                            .font(.system(size: 14, weight: .semibold, design: .rounded))
                            .foregroundColor(.white)
                        
                        HStack(spacing: 10) {
                            quizOptionButton(title: "< 20 fois", isSelected: selectedUnconsciousOption == 0) {
                                selectedUnconsciousOption = 0
                                profile.dailyUnconsciousUnlocks = 15
                            }
                            quizOptionButton(title: "30-50 fois", isSelected: selectedUnconsciousOption == 1) {
                                selectedUnconsciousOption = 1
                                profile.dailyUnconsciousUnlocks = 40
                            }
                            quizOptionButton(title: "60+ fois", isSelected: selectedUnconsciousOption == 2) {
                                selectedUnconsciousOption = 2
                                profile.dailyUnconsciousUnlocks = 70
                            }
                        }
                    }
                    
                    // Question 3 : Raideurs
                    BentoCard {
                        Toggle(isOn: $jointStiffness) {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Raideurs lombaires ou cervicales")
                                    .font(.system(size: 14, weight: .semibold, design: .rounded))
                                    .foregroundColor(.white)
                                Text("Tension en fin de journée ou au réveil")
                                    .font(.system(size: 12, weight: .regular, design: .rounded))
                                    .foregroundColor(AevumTheme.textSecondary)
                            }
                        }
                        .tint(AevumTheme.emeraldAccent)
                        .onChange(of: jointStiffness) { val in
                            profile.hasJointStiffness = val
                        }
                    }
                    
                    // Question 4 : Brouillard de 15h
                    BentoCard {
                        Toggle(isOn: $brainFog) {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Coup de barre & brouillard à 15h")
                                    .font(.system(size: 14, weight: .semibold, design: .rounded))
                                    .foregroundColor(.white)
                                Text("Baisse d'énergie ou envie de sucre")
                                    .font(.system(size: 12, weight: .regular, design: .rounded))
                                    .foregroundColor(AevumTheme.textSecondary)
                            }
                        }
                        .tint(AevumTheme.cyanAccent)
                        .onChange(of: brainFog) { val in
                            profile.afternoonBrainFog = val
                        }
                    }
                }
                .padding(.bottom, 20)
            }
            
            // Bouton Calculer
            Button {
                profile.recalculateBiologicalAge()
                SoundHapticManager.shared.triggerHaptic(style: .medium)
                withAnimation(.spring()) {
                    currentStep = 1
                }
            } label: {
                HStack {
                    Text("Calculer mon Âge Biologique")
                        .font(.system(size: 16, weight: .bold, design: .rounded))
                    Image(systemName: "arrow.right")
                }
                .foregroundColor(AevumTheme.bgPrimary)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(AevumTheme.vitalityGradient)
                .clipShape(RoundedRectangle(cornerRadius: AevumTheme.radiusButton))
                .shadow(color: AevumTheme.cyanAccent.opacity(0.4), radius: 12)
            }
        }
        .padding(.horizontal, 20)
    }
    
    @ViewBuilder
    private func quizOptionButton(title: String, isSelected: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 12, weight: .semibold, design: .rounded))
                .foregroundColor(isSelected ? .white : AevumTheme.textSecondary)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
                .background(isSelected ? AevumTheme.cyanAccent.opacity(0.3) : AevumTheme.bgSecondary)
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(isSelected ? AevumTheme.cyanAccent : AevumTheme.cardBorder, lineWidth: 1)
                )
                .clipShape(RoundedRectangle(cornerRadius: 12))
        }
    }
}
