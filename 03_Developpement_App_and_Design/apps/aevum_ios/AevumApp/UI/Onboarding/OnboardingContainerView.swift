import SwiftUI

// MARK: - Conteneur d'Onboarding Principal
public struct OnboardingContainerView: View {
    @Binding public var profile: UserProfile
    public var onCompleteOnboarding: () -> Void
    public var onLaunchBreathingChallenge: (LongevityProtocol) -> Void
    
    @State private var currentStep: Int = 0
    
    public var body: some View {
        ZStack {
            AevumTheme.bgPrimary.ignoresSafeArea()
            
            if currentStep == 0 {
                DiagnosticQuizView(currentStep: $currentStep, profile: $profile)
                    .transition(.asymmetric(insertion: .opacity, removal: .move(edge: .leading)))
            } else if currentStep == 1 {
                BiologicalAgeResultView(currentStep: $currentStep, profile: $profile) {
                    if let sighProtocol = LongevityCatalog.getProtocol(by: "RESP-01") {
                        onLaunchBreathingChallenge(sighProtocol)
                    }
                }
                .transition(.asymmetric(insertion: .move(edge: .trailing), removal: .opacity))
            }
        }
    }
}
