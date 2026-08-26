import Foundation

// MARK: - Modèle de Session de Défi Validée
public struct ChallengeSession: Identifiable, Codable {
    public let id: UUID
    public let protocolId: String
    public let protocolTitle: String
    public let category: ProtocolCategory
    public let timestamp: Date
    public let durationCompletedSeconds: Int
    public let xpEarned: Int
    public let wasInitiatedFromShield: Bool
    
    public init(
        id: UUID = UUID(),
        protocolId: String,
        protocolTitle: String,
        category: ProtocolCategory,
        timestamp: Date = Date(),
        durationCompletedSeconds: Int,
        xpEarned: Int,
        wasInitiatedFromShield: Bool = false
    ) {
        self.id = id
        self.protocolId = protocolId
        self.protocolTitle = protocolTitle
        self.category = category
        self.timestamp = timestamp
        self.durationCompletedSeconds = durationCompletedSeconds
        self.xpEarned = xpEarned
        self.wasInitiatedFromShield = wasInitiatedFromShield
    }
}
