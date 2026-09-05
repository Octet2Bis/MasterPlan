import SwiftUI

// MARK: - Lecteur Immersif de Respiration (Breathing Player)
public struct BreathingPlayerView: View {
    public let longevityProtocol: LongevityProtocol
    public var onComplete: (LongevityProtocol) -> Void
    public var onDismiss: () -> Void
    
    @State private var currentStepIndex: Int = 0
    @State private var stepTimeRemaining: Double = 0.0
    @State private var orbScale: CGFloat = 0.85
    @State private var timer: Timer? = nil
    
    public var body: some View {
        ZStack {
            AevumTheme.bgPrimary.ignoresSafeArea()
            
            VStack(spacing: 32) {
                // Header & Bouton Fermer
                HStack {
                    Button(action: {
                        timer?.invalidate()
                        onDismiss()
                    }) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 24))
                            .foregroundColor(AevumTheme.textMuted)
                    }
                    Spacer()
                    Text(longevityProtocol.title)
                        .font(.system(size: 14, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                    Spacer()
                    // Espace symétrique
                    Color.clear.frame(width: 24, height: 24)
                }
                .padding(.horizontal, 20)
                .padding(.top, 16)
                
                Spacer()
                
                // Orbe Central Animé
                if currentStepIndex < longevityProtocol.steps.count {
                    let currentStep = longevityProtocol.steps[currentStepIndex]
                    AnimatedBreathingOrb(
                        scale: orbScale,
                        phaseName: currentStep.phaseName,
                        remainingSeconds: stepTimeRemaining,
                        accentColor: longevityProtocol.category.accentColor
                    )
                }
                
                // Instruction Textuelle
                if currentStepIndex < longevityProtocol.steps.count {
                    Text(longevityProtocol.steps[currentStepIndex].instructionText)
                        .font(.system(size: 16, weight: .medium, design: .rounded))
                        .foregroundColor(AevumTheme.textSecondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 32)
                        .frame(height: 60)
                }
                
                Spacer()
                
                // Indicateur de Progression des Cycles
                HStack(spacing: 8) {
                    ForEach(0..<longevityProtocol.steps.count, id: \.self) { index in
                        Capsule()
                            .fill(index <= currentStepIndex ? longevityProtocol.category.accentColor : AevumTheme.bgCard)
                            .frame(height: 4)
                    }
                }
                .padding(.horizontal, 32)
                .padding(.bottom, 32)
            }
        }
        .onAppear {
            startProtocol()
        }
        .onDisappear {
            timer?.invalidate()
        }
    }
    
    // MARK: - Gestion du Cycle de Respiration
    private func startProtocol() {
        currentStepIndex = 0
        loadStep(index: 0)
    }
    
    private func loadStep(index: Int) {
        guard index < longevityProtocol.steps.count else {
            timer?.invalidate()
            SoundHapticManager.shared.playSuccessSound()
            onComplete(longevityProtocol)
            return
        }
        
        let step = longevityProtocol.steps[index]
        stepTimeRemaining = step.durationSeconds
        
        // Ajustement de l'orbe selon la phase
        let isExpansion = step.phaseName.lowercased().contains("inspi")
        let targetScale: CGFloat = isExpansion ? 1.25 : 0.85
        
        withAnimation(.easeInOut(duration: step.durationSeconds)) {
            orbScale = targetScale
        }
        
        SoundHapticManager.shared.triggerHaptic(style: .medium)
        SoundHapticManager.shared.playPhaseTransitionSound()
        
        timer?.invalidate()
        timer = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { _ in
            if stepTimeRemaining > 0.1 {
                stepTimeRemaining -= 0.1
            } else {
                currentStepIndex += 1
                loadStep(index: currentStepIndex)
            }
        }
    }
}
