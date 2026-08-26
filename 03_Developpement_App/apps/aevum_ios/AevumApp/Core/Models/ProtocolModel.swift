import Foundation
import SwiftUI

// MARK: - Catégories de Protocoles
public enum ProtocolCategory: String, Codable, CaseIterable, Identifiable {
    case nervousSystem = "Système Nerveux"
    case postureMobility = "Mobilité & Rachis"
    case visionBrain = "Vision & Clarté"
    case hydrationMetabolism = "Hydratation & Métabolisme"
    
    public var id: String { rawValue }
    
    public var iconName: String {
        switch self {
        case .nervousSystem: return "wind"
        case .postureMobility: return "figure.walk"
        case .visionBrain: return "eye"
        case .hydrationMetabolism: return "drop.fill"
        }
    }
    
    public var accentColorHex: String {
        switch self {
        case .nervousSystem: return "#38BDF8"       // Cyan lumineux
        case .postureMobility: return "#34D399"     // Émeraude vitalité
        case .visionBrain: return "#A78BFA"         // Lavande repos
        case .hydrationMetabolism: return "#F59E0B"  // Ambre solaire
        }
    }
    
    public var accentColor: Color {
        switch self {
        case .nervousSystem: return Color(red: 0.22, green: 0.74, blue: 0.97)
        case .postureMobility: return Color(red: 0.20, green: 0.83, blue: 0.60)
        case .visionBrain: return Color(red: 0.65, green: 0.55, blue: 0.98)
        case .hydrationMetabolism: return Color(red: 0.96, green: 0.62, blue: 0.04)
        }
    }
}

// MARK: - Créneau Circadien
public enum CircadianSlot: String, Codable, CaseIterable {
    case morning = "Matin (07h-12h)"
    case afternoon = "Après-midi (12h-18h)"
    case evening = "Soir (18h-23h)"
}

// MARK: - Étape d'un Protocole
public struct ProtocolStep: Codable, Identifiable {
    public var id: String { phaseName + "\(durationSeconds)" }
    public let phaseName: String
    public let durationSeconds: Double
    public let instructionText: String
    
    public init(phaseName: String, durationSeconds: Double, instructionText: String) {
        self.phaseName = phaseName
        self.durationSeconds = durationSeconds
        self.instructionText = instructionText
    }
}

// MARK: - Protocole de Longévité (Modèle Causal & Knowledge Graph)
public struct LongevityProtocol: Identifiable, Codable {
    public let id: String
    public let title: String
    public let subtitle: String
    public let category: ProtocolCategory
    public let durationSeconds: Int
    public let scientificSource: String
    public let clinicalCitation: String
    public let triggerBehavior: String
    public let biologicalMechanism: String
    public let targetAnatomy: String
    public let immediateBenefit: String
    public let xpReward: Int
    public let steps: [ProtocolStep]
    public let targetCircadianSlot: [CircadianSlot]
    
    public init(
        id: String,
        title: String,
        subtitle: String,
        category: ProtocolCategory,
        durationSeconds: Int,
        scientificSource: String,
        clinicalCitation: String = "",
        triggerBehavior: String = "Usage prolongé de l'écran",
        biologicalMechanism: String = "Tension autonome ou posturale",
        targetAnatomy: String = "Système nerveux",
        immediateBenefit: String = "Gain de vitalité immédiat",
        xpReward: Int = 15,
        steps: [ProtocolStep] = [],
        targetCircadianSlot: [CircadianSlot] = [.morning, .afternoon, .evening]
    ) {
        self.id = id
        self.title = title
        self.subtitle = subtitle
        self.category = category
        self.durationSeconds = durationSeconds
        self.scientificSource = scientificSource
        self.clinicalCitation = clinicalCitation.isEmpty ? scientificSource : clinicalCitation
        self.triggerBehavior = triggerBehavior
        self.biologicalMechanism = biologicalMechanism
        self.targetAnatomy = targetAnatomy
        self.immediateBenefit = immediateBenefit
        self.xpReward = xpReward
        self.steps = steps
        self.targetCircadianSlot = targetCircadianSlot
    }
}
