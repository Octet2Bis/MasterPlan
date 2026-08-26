import SwiftUI

@main
public struct AevumApp: App {
    @StateObject private var appState = AppState()
    
    public init() {}
    
    public var body: some Scene {
        WindowGroup {
            ZStack {
                if !appState.profile.hasCompletedOnboarding {
                    OnboardingContainerView(
                        profile: $appState.profile,
                        onCompleteOnboarding: {
                            withAnimation(.spring()) {
                                appState.profile.hasCompletedOnboarding = true
                            }
                        },
                        onLaunchBreathingChallenge: { proto in
                            appState.activeProtocol = proto
                        }
                    )
                } else {
                    DashboardView(appState: appState) { selectedProtocol in
                        appState.activeProtocol = selectedProtocol
                    }
                }
            }
            .preferredColorScheme(.dark)
            // Gestion du Custom URL Scheme (depuis le Shield Screen Time)
            .onOpenURL { url in
                handleIncomingURL(url)
            }
            // Lecteur de Micro-Défi en plein écran
            .fullScreenCover(item: $appState.activeProtocol) { proto in
                if proto.category == .nervousSystem {
                    BreathingPlayerView(
                        longevityProtocol: proto,
                        onComplete: { completed in
                            appState.completeChallenge(protocol: completed)
                        },
                        onDismiss: {
                            appState.activeProtocol = nil
                        }
                    )
                } else {
                    MobilityPlayerView(
                        longevityProtocol: proto,
                        onComplete: { completed in
                            appState.completeChallenge(protocol: completed)
                        },
                        onDismiss: {
                            appState.activeProtocol = nil
                        }
                    )
                }
            }
            // Écran de Récompense
            .sheet(isPresented: $appState.showRewardScreen) {
                if let rewarded = appState.completedProtocolForReward {
                    SuccessRewardView(longevityProtocol: rewarded) {
                        appState.showRewardScreen = false
                        appState.profile.hasCompletedOnboarding = true
                    }
                }
            }
        }
    }
    
    // MARK: - Routage URL Scheme (aevum://challenge?id=RESP-01)
    private func handleIncomingURL(_ url: URL) {
        guard url.scheme == "aevum" else { return }
        
        if url.host == "challenge",
           let components = URLComponents(url: url, resolvingAgainstBaseURL: true),
           let protocolId = components.queryItems?.first(where: { $0.name == "id" })?.value {
            if let targetProtocol = LongevityCatalog.getProtocol(by: protocolId) {
                appState.activeProtocol = targetProtocol
            }
        }
    }
}
