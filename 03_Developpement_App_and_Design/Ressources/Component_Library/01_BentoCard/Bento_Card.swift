//
//  Bento_Card.swift
//  Component Library — Essential 7 (03_Developpement_App_and_Design)
//  Conteneur Bento avec bordure subpixel et lumière zénithale
//  Plafond strict : < 70 lignes
//

import SwiftUI

public struct EssentialBentoCard<Content: View>: View {
    private let title: String
    private let subtitle: String?
    private let statusColor: Color?
    private let content: Content

    public init(
        title: String,
        subtitle: String? = nil,
        statusColor: Color? = nil,
        @ViewBuilder content: () -> Content
    ) {
        self.title = title
        self.subtitle = subtitle
        self.statusColor = statusColor
        self.content = content()
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .center) {
                VStack(alignment: .leading, spacing: 3) {
                    Text(title.uppercased())
                        .font(.system(size: 10, weight: .bold, design: .monospaced))
                        .foregroundColor(Color(white: 0.55))
                        .tracking(1.2)

                    if let sub = subtitle {
                        Text(sub)
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(.white)
                            .tracking(-0.3)
                    }
                }
                Spacer()

                if let color = statusColor {
                    Circle()
                        .fill(color)
                        .frame(width: 8, height: 8)
                        .shadow(color: color.opacity(0.5), radius: 3)
                }
            }

            content
        }
        .padding(16)
        .background(Color(red: 0.08, green: 0.11, blue: 0.16)) // Surface-1 Dark Charcoal
        .cornerRadius(10)
        .overlay(
            RoundedRectangle(cornerRadius: 10)
                .stroke(Color.white.opacity(0.10), lineWidth: 0.5) // Hairline border
        )
    }
}
