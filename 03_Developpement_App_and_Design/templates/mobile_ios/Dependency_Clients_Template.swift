//
//  Dependency_Clients_Template.swift
//  Master Plan — Architecture & Core Templates (03_Developpement_App_and_Design)
//  Pattern Ports & Adapters / Dependency Injection (Point-Free style)
//  Plafond strict : < 110 lignes
//

import Foundation
import AudioToolbox

// MARK: - 1. Audio & Haptics Client Contract
public struct AudioHapticsClient {
    public var playChime: () -> Void
    public var playSuccess: () -> Void
    public var triggerImpact: (_ style: ImpactStyle) -> Void

    public enum ImpactStyle {
        case light, medium, heavy
    }

    public init(
        playChime: @escaping () -> Void,
        playSuccess: @escaping () -> Void,
        triggerImpact: @escaping (_ style: ImpactStyle) -> Void
    ) {
        self.playChime = playChime
        self.playSuccess = playSuccess
        self.triggerImpact = triggerImpact
    }
}

// MARK: - 2. Live Implementation (Production iOS)
extension AudioHapticsClient {
    public static let live = AudioHapticsClient(
        playChime: {
            AudioServicesPlaySystemSound(1057) // Tock / Chime système
        },
        playSuccess: {
            AudioServicesPlaySystemSound(1025) // Succès système
        },
        triggerImpact: { style in
            #if canImport(UIKit)
            let feedback = UIImpactFeedbackGenerator(
                style: style == .light ? .light : (style == .medium ? .medium : .heavy)
            )
            feedback.impactOccurred()
            #endif
        }
    )
}

// MARK: - 3. Mock / Test Implementation (Deterministic Zero Side-Effect)
extension AudioHapticsClient {
    public static let mock = AudioHapticsClient(
        playChime: {},
        playSuccess: {},
        triggerImpact: { _ in }
    )
}

// MARK: - 4. Key-Value Storage Client Contract
public struct StorageClient {
    public var stringForKey: (_ key: String) -> String?
    public var setString: (_ value: String, _ key: String) -> Void
    public var boolForKey: (_ key: String) -> Bool
    public var setBool: (_ value: Bool, _ key: String) -> Void

    public static let live = StorageClient(
        stringForKey: { UserDefaults.standard.string(forKey: $0) },
        setString: { UserDefaults.standard.set($0, forKey: $1) },
        boolForKey: { UserDefaults.standard.bool(forKey: $0) },
        setBool: { UserDefaults.standard.set($0, forKey: $1) }
    )

    public static func inMemory() -> StorageClient {
        var store: [String: Any] = [:]
        return StorageClient(
            stringForKey: { store[$0] as? String },
            setString: { store[$1] = $0 },
            boolForKey: { (store[$0] as? Bool) ?? false },
            setBool: { store[$1] = $0 }
        )
    }
}
