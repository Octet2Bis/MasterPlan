//
//  HappeningModel.swift
//  AevumApp
//
//  Modèle de données pour les 50 Mini-Happenings, Micro-Jeux WarioWare & Récompenses d'Esprit.
//

import Foundation

public enum HappeningCategory: String, Codable, CaseIterable {
    case mantrasChalkboard = "Tableaux & Mantras"
    case manualDexterity = "Ergonomie & Doigts"
    case postureAnatomy = "Anatomie & Miroirs AR"
    case existentialCaptchas = "Captchas & Neuro"
    case socialDuels = "Social & Mèmes UGC"
    
    public var iconName: String {
        switch self {
        case .mantrasChalkboard: return "pencil.and.scribble"
        case .manualDexterity: return "hand.raised.fill"
        case .postureAnatomy: return "figure.stand"
        case .existentialCaptchas: return "brain.head.profile"
        case .socialDuels: return "person.2.fill"
        }
    }
    
    public var accentColorHex: String {
        switch self {
        case .mantrasChalkboard: return "#1B3B2B" // Vert tableau noir
        case .manualDexterity: return "#E6392F"   // Rouge transit
        case .postureAnatomy: return "#00A86B"    // Vert émeraude
        case .existentialCaptchas: return "#0066CC" // Bleu métro
        case .socialDuels: return "#F5B800"       // Jaune signalétique
        }
    }
}

public enum InteractionType: String, Codable {
    case rapidTapping
    case fingerSculptor
    case arCamera
    case audioBreath
    case gyroShake
    case captchaSelection
    case stampSignature
}

public struct MiniHappening: Identifiable, Codable {
    public let id: String
    public let title: String
    public let category: HappeningCategory
    public let interactionType: InteractionType
    public let durationSeconds: Int
    public let targetAnatomy: String
    public let phonePathology: String
    public let physiologicalBenefit: String
    public let promptInstruction: String
    public let punchlineReward: String
    public let ugcBadgeTitle: String
    
    public init(
        id: String,
        title: String,
        category: HappeningCategory,
        interactionType: InteractionType,
        durationSeconds: Int,
        targetAnatomy: String,
        phonePathology: String,
        physiologicalBenefit: String,
        promptInstruction: String,
        punchlineReward: String,
        ugcBadgeTitle: String
    ) {
        self.id = id
        self.title = title
        self.category = category
        self.interactionType = interactionType
        self.durationSeconds = durationSeconds
        self.targetAnatomy = targetAnatomy
        self.phonePathology = phonePathology
        self.physiologicalBenefit = physiologicalBenefit
        self.promptInstruction = promptInstruction
        self.punchlineReward = punchlineReward
        self.ugcBadgeTitle = ugcBadgeTitle
    }
}

public struct VaultItem: Identifiable, Codable {
    public let id: UUID
    public let happeningId: String
    public let unlockedAt: Date
    public let title: String
    public let punchline: String
    public let category: HappeningCategory
    public var isFavorite: Bool
    
    public init(
        id: UUID = UUID(),
        happeningId: String,
        unlockedAt: Date = Date(),
        title: String,
        punchline: String,
        category: HappeningCategory,
        isFavorite: Bool = false
    ) {
        self.id = id
        self.happeningId = happeningId
        self.unlockedAt = unlockedAt
        self.title = title
        self.punchline = punchline
        self.category = category
        self.isFavorite = isFavorite
    }
}
