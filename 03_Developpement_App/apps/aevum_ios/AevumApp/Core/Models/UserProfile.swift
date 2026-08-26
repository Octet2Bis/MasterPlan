import Foundation

// MARK: - Rang d'Autodiscipline & Longévité
public enum DisciplineRank: String, Codable, CaseIterable {
    case initiate = "Initiate"
    case bioArchitect = "Bio-Architect"
    case centenarian = "Centenarian Mindset"
    case aevumMaster = "Aevum Master"
    
    public var badgeIcon: String {
        switch self {
        case .initiate: return "sparkle"
        case .bioArchitect: return "atom"
        case .centenarian: return "flame.fill"
        case .aevumMaster: return "crown.fill"
        }
    }
}

// MARK: - Modèle de Profil Utilisateur
public struct UserProfile: Codable {
    public var chronologicalAge: Int
    public var estimatedBiologicalAge: Double
    public var currentVitalityScore: Int         // Score de 0 à 100
    public var totalXp: Int
    
    public var currentLevel: Int {
        return (totalXp / 100) + 1
    }
    
    public var currentRank: DisciplineRank {
        switch currentLevel {
        case 1...2: return .initiate
        case 3...5: return .bioArchitect
        case 6...9: return .centenarian
        default: return .aevumMaster
        }
    }
    
    public var xpInCurrentLevel: Int {
        return totalXp % 100
    }
    
    public var completedChallengesCount: Int
    public var currentStreakDays: Int
    public var lastChallengeDate: Date?
    public var gracePeriodMinutes: Int          // Fenêtre de déblocage après défi (ex: 15 min)
    public var hasCompletedOnboarding: Bool
    
    // Réponses au quiz initial
    public var dailyScreenHours: Double
    public var dailyUnconsciousUnlocks: Int
    public var hasJointStiffness: Bool
    public var afternoonBrainFog: Bool
    
    public init(
        chronologicalAge: Int = 30,
        estimatedBiologicalAge: Double = 30.0,
        currentVitalityScore: Int = 75,
        totalXp: Int = 0,
        completedChallengesCount: Int = 0,
        currentStreakDays: Int = 1,
        lastChallengeDate: Date? = nil,
        gracePeriodMinutes: Int = 15,
        hasCompletedOnboarding: Bool = false,
        dailyScreenHours: Double = 6.5,
        dailyUnconsciousUnlocks: Int = 40,
        hasJointStiffness: Bool = true,
        afternoonBrainFog: Bool = true
    ) {
        self.chronologicalAge = chronologicalAge
        self.estimatedBiologicalAge = estimatedBiologicalAge
        self.currentVitalityScore = currentVitalityScore
        self.totalXp = totalXp
        self.completedChallengesCount = completedChallengesCount
        self.currentStreakDays = currentStreakDays
        self.lastChallengeDate = lastChallengeDate
        self.gracePeriodMinutes = gracePeriodMinutes
        self.hasCompletedOnboarding = hasCompletedOnboarding
        self.dailyScreenHours = dailyScreenHours
        self.dailyUnconsciousUnlocks = dailyUnconsciousUnlocks
        self.hasJointStiffness = hasJointStiffness
        self.afternoonBrainFog = afternoonBrainFog
    }
    
    // Calcul de l'âge biologique estimé à partir des réponses
    public mutating func recalculateBiologicalAge() {
        var delta: Double = 0.0
        
        // Impact sédentarité écran
        if dailyScreenHours > 8.0 { delta += 2.5 }
        else if dailyScreenHours > 5.0 { delta += 1.2 }
        
        // Impact dispersion dopaminergique
        if dailyUnconsciousUnlocks > 50 { delta += 1.8 }
        else if dailyUnconsciousUnlocks > 25 { delta += 0.8 }
        
        // Impact articulations
        if hasJointStiffness { delta += 1.5 }
        
        // Impact brouillard mental
        if afternoonBrainFog { delta += 1.0 }
        
        // Bonus par les défis validés (chacun réduit le vieillissement perçu)
        let rejuvenationBonus = min(Double(completedChallengesCount) * 0.05, 4.0)
        
        self.estimatedBiologicalAge = max(Double(chronologicalAge) + delta - rejuvenationBonus, Double(chronologicalAge) - 3.0)
        self.currentVitalityScore = min(max(Int(100.0 - (delta * 6.0) + (Double(completedChallengesCount) * 2.0)), 35), 99)
    }
    
    public mutating func addXp(_ amount: Int) {
        self.totalXp += amount
        self.completedChallengesCount += 1
        self.lastChallengeDate = Date()
        self.recalculateBiologicalAge()
    }
    
    public static var defaultProfile: UserProfile {
        UserProfile()
    }
}
