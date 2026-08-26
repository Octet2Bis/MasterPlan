import Foundation

// MARK: - Moteur de Recommandation Circadien de Protocoles
public struct ProtocolRecommendationEngine {
    
    // Détermine le créneau circadien actuel
    public static func getCurrentCircadianSlot() -> CircadianSlot {
        let hour = Calendar.current.component(.hour, from: Date())
        switch hour {
        case 6..<12:
            return .morning
        case 12..<18:
            return .afternoon
        default:
            return .evening
        }
    }
    
    // Sélectionne le protocole recommandé le plus pertinent
    public static func recommendProtocol(
        from availableProtocols: [LongevityProtocol] = LongevityCatalog.allProtocols,
        recentSessions: [ChallengeSession] = [],
        profile: UserProfile
    ) -> LongevityProtocol {
        let currentSlot = getCurrentCircadianSlot()
        
        // 1. Filtrer les protocoles adaptés au créneau circadien
        let matchingSlot = availableProtocols.filter { $0.targetCircadianSlot.contains(currentSlot) }
        
        // 2. Éviter de proposer 2 fois de suite le même défi
        let lastProtocolId = recentSessions.last?.protocolId
        let nonRepeated = matchingSlot.filter { $0.id != lastProtocolId }
        
        if let selected = nonRepeated.randomElement() {
            return selected
        }
        
        // 3. Fallback : Soupir physiologique universel
        return LongevityCatalog.getProtocol(by: "RESP-01") ?? availableProtocols[0]
    }
}
