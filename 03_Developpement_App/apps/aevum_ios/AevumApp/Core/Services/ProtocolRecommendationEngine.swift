import Foundation

// MARK: - Moteur de Recommandation Circadien
public final class ProtocolRecommendationEngine {
    public static let shared = ProtocolRecommendationEngine()
    
    private init() {}
    
    // Détermine le créneau circadien actuel
    public func currentCircadianSlot(for date: Date = Date()) -> CircadianSlot {
        let hour = Calendar.current.component(.hour, from: date)
        switch hour {
        case 6..<12:
            return .morning
        case 12..<18:
            return .afternoon
        default:
            return .evening
        }
    }
    
    // Recommande le protocole prioritaire selon l'heure et l'historique
    public func recommendPriorityProtocol(for profile: UserProfile, date: Date = Date()) -> LongevityProtocol {
        let slot = currentCircadianSlot(for: date)
        
        switch slot {
        case .morning:
            // Matin : Déverrouillage Myofascial ou Soupir Physiologique
            return LongevityCatalog.getProtocol(by: "MOB-06") ?? LongevityCatalog.allProtocols[0]
        case .afternoon:
            // Après-midi : Décompression Text-Neck, Pompes Soléaires ou Vision 20-20-20
            if profile.hasJointStiffness {
                return LongevityCatalog.getProtocol(by: "MOB-03") ?? LongevityCatalog.allProtocols[1]
            } else {
                return LongevityCatalog.getProtocol(by: "HYD-01") ?? LongevityCatalog.allProtocols[4]
            }
        case .evening:
            // Soir : Palming Oculaire 4-7-8 ou Décharge Dopaminergique
            return LongevityCatalog.getProtocol(by: "VIS-02") ?? LongevityCatalog.allProtocols[3]
        }
    }
    
    // Filtre les protocoles par moment de la journée
    public func protocols(for slot: CircadianSlot) -> [LongevityProtocol] {
        return LongevityCatalog.allProtocols.filter { $0.targetCircadianSlot.contains(slot) }
    }
}
