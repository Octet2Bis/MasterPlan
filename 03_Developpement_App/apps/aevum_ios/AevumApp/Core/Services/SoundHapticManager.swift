import Foundation
import SwiftUI
#if canImport(UIKit)
import UIKit
#endif
#if canImport(AudioToolbox)
import AudioToolbox
#endif

// MARK: - Moteur Haptique & Audio Sensoriel
public class SoundHapticManager {
    public static let shared = SoundHapticManager()
    
    private init() {}
    
    // MARK: - Retours Haptiques
    public func triggerHaptic(style: UIImpactFeedbackGenerator.FeedbackStyle = .medium) {
        #if canImport(UIKit)
        let generator = UIImpactFeedbackGenerator(style: style)
        generator.prepare()
        generator.impactOccurred()
        #endif
    }
    
    public func triggerNotificationFeedback(type: UINotificationFeedbackGenerator.FeedbackType) {
        #if canImport(UIKit)
        let generator = UINotificationFeedbackGenerator()
        generator.prepare()
        generator.notificationOccurred(type)
        #endif
    }
    
    // MARK: - Tonalités Sensorielle / Respiration
    public func playPhaseTransitionSound() {
        #if canImport(AudioToolbox)
        // Système sound ID doux (1057 = Tock doux Apple)
        AudioServicesPlaySystemSound(1057)
        #endif
    }
    
    public func playSuccessSound() {
        #if canImport(AudioToolbox)
        // Tonalité de réussite (1054 = Positive chime)
        AudioServicesPlaySystemSound(1054)
        #endif
    }
}
