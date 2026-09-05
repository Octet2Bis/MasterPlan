//
//  Haptic_Action_Button.swift
//  Component Library — Essential 7 (03_Developpement_App_and_Design)
//  Bouton d'action tactile avec retour haptique et échelle élastique
//  Plafond strict : < 70 lignes
//

import SwiftUI

public struct HapticActionButton: View {
    public let title: String
    public let systemImage: String?
    public let backgroundColor: Color
    public let action: () -> Void

    public init(
        title: String,
        systemImage: String? = nil,
        backgroundColor: Color = Color(red: 0.96, green: 0.62, blue: 0.04), // Accent Ambre
        action: @escaping () -> Void
    ) {
        self.title = title
        self.systemImage = systemImage
        self.backgroundColor = backgroundColor
        self.action = action
    }

    public var body: some View {
        Button {
            #if canImport(UIKit)
            let generator = UIImpactFeedbackGenerator(style: .medium)
            generator.impactOccurred()
            #endif
            action()
        } label: {
            HStack(spacing: 8) {
                if let icon = systemImage {
                    Image(systemName: icon)
                        .font(.system(size: 14, weight: .bold))
                }
                Text(title)
                    .font(.system(size: 14, weight: .bold))
            }
            .foregroundColor(.black)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(backgroundColor)
            .cornerRadius(8)
            .shadow(color: backgroundColor.opacity(0.3), radius: 8, x: 0, y: 4)
        }
        .buttonStyle(ScalePressButtonStyle())
    }
}

struct ScalePressButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.97 : 1.0)
            .animation(.spring(response: 0.2, dampingFraction: 0.6), value: configuration.isPressed)
    }
}
