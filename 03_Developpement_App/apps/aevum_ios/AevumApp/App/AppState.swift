import Foundation
import SwiftUI
import Combine

// MARK: - État Central Réactif de l'Application Aevum
@MainActor
public class AppState: ObservableObject {
    @Published public var profile: UserProfile {
        didSet {
            saveProfile()
        }
    }
    
    @Published public var sessionHistory: [ChallengeSession] = [] {
        didSet {
            saveSessions()
        }
    }
    
    @Published public var activeProtocol: LongevityProtocol? = nil
    @Published public var showRewardScreen: Bool = false
    @Published public var completedProtocolForReward: LongevityProtocol? = nil
    
    // Services
    public let screenTimeManager = ScreenTimeManager.shared
    public let healthKitManager = HealthKitManager.shared
    
    private let profileKey = "aevum_user_profile"
    private let sessionsKey = "aevum_sessions_history"
    
    public init() {
        // Chargement du profil
        if let data = UserDefaults.standard.data(forKey: profileKey),
           let decoded = try? JSONDecoder().decode(UserProfile.self, from: data) {
            self.profile = decoded
        } else {
            self.profile = UserProfile.defaultProfile
        }
        
        // Chargement de l'historique
        if let data = UserDefaults.standard.data(forKey: sessionsKey),
           let decoded = try? JSONDecoder().decode([ChallengeSession].self, from: data) {
            self.sessionHistory = decoded
        }
    }
    
    // MARK: - Protocole Recommandé Circadien
    public var recommendedProtocol: LongevityProtocol {
        return ProtocolRecommendationEngine.recommendProtocol(
            recentSessions: sessionHistory,
            profile: profile
        )
    }
    
    // MARK: - Validation d'un Défi
    public func completeChallenge(protocol: LongevityProtocol, fromShield: Bool = false) {
        let session = ChallengeSession(
            protocolId: `protocol`.id,
            protocolTitle: `protocol`.title,
            category: `protocol`.category,
            durationCompletedSeconds: `protocol`.durationSeconds,
            xpEarned: `protocol`.xpReward,
            wasInitiatedFromShield: fromShield
        )
        
        // Mise à jour de l'historique et des métriques
        self.sessionHistory.append(session)
        self.profile.completedChallengesCount += 1
        self.profile.totalXp += `protocol`.xpReward
        self.profile.lastChallengeDate = Date()
        self.profile.recalculateBiologicalAge()
        
        // Synchronisation HealthKit (Mindful Minutes)
        if `protocol`.category == .nervousSystem {
            Task {
                await healthKitManager.recordMindfulSession(durationSeconds: Double(`protocol`.durationSeconds))
            }
        }
        
        // Déblocage Screen Time pour 15 minutes (Fenêtre de Grâce)
        screenTimeManager.grantGracePeriod(minutes: profile.gracePeriodMinutes)
        
        // Affichage de la récompense
        self.completedProtocolForReward = `protocol`
        self.activeProtocol = nil
        self.showRewardScreen = true
    }
    
    // MARK: - Persistance
    private func saveProfile() {
        if let encoded = try? JSONEncoder().encode(profile) {
            UserDefaults.standard.set(encoded, forKey: profileKey)
        }
    }
    
    private func saveSessions() {
        if let encoded = try? JSONEncoder().encode(sessionHistory) {
            UserDefaults.standard.set(encoded, forKey: sessionsKey)
        }
    }
}
