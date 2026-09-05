import SwiftUI

// MARK: - Lecteur Guidé de Mobilité & Décompression
public struct MobilityPlayerView: View {
    public let longevityProtocol: LongevityProtocol
    public var onComplete: (LongevityProtocol) -> Void
    public var onDismiss: () -> Void
    
    @State private var currentStepIndex: Int = 0
    @State private var stepTimeRemaining: Double = 0.0
    @State private var timer: Timer? = nil
    
    public var body: some View {
        ZStack {
            AevumTheme.bgPrimary.ignoresSafeArea()
            
            VStack(spacing: 32) {
                // Header
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
                    Color.clear.frame(width: 24, height: 24)
                }
                .padding(.horizontal, 20)
                .padding(.top, 16)
                
                Spacer()
                
                // Jauge Circulaire
                if currentStepIndex < longevityProtocol.steps.count {
                    let currentStep = longevityProtocol.steps[currentStepIndex]
                    let progress = stepTimeRemaining / currentStep.durationSeconds
                    
                    PulsingTimer(
                        progress: progress,
                        remainingSeconds: Int(ceil(stepTimeRemaining)),
                        accentColor: longevityProtocol.category.accentColor
                    )
                }
                
                // Instructions de posture
                if currentStepIndex < longevityProtocol.steps.count {
                    VStack(spacing: 8) {
                        Text(longevityProtocol.steps[currentStepIndex].phaseName.uppercased())
                            .font(.system(size: 12, weight: .bold, design: .rounded))
                            .foregroundColor(longevityProtocol.category.accentColor)
                            .tracking(1.5)
                        
                        Text(longevityProtocol.steps[currentStepIndex].instructionText)
                            .font(.system(size: 16, weight: .medium, design: .rounded))
                            .foregroundColor(.white)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 32)
                    }
                    .frame(height: 80)
                }
                
                Spacer()
                
                // Progression
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
            startMobility()
        }
        .onDisappear {
            timer?.invalidate()
        }
    }
    
    private func startMobility() {
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
        
        SoundHapticManager.shared.triggerHaptic(style: .medium)
        
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
