//
//  Bento_Card_Component.swift
//  Master Plan — Architecture & Core Templates (03_Developpement_App_and_Design)
//  Composant Réutilisable Swiss Craft (ui-ux-pro-max)
//  Plafond strict : < 80 lignes
//

import SwiftUI

public struct BentoCard<Content: View>: View {
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
                VStack(alignment: .leading, spacing: 4) {
                    Text(title.uppercased())
                        .font(.system(size: 11, weight: .heavy, design: .monospaced))
                        .foregroundColor(Color(white: 0.55))
                        .tracking(1.2)

                    if let sub = subtitle {
                        Text(sub)
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundColor(.white)
                            .tracking(-0.3)
                    }
                }
                Spacer()

                if let status = statusColor {
                    Circle()
                        .fill(status)
                        .frame(width: 8, height: 8)
                        .shadow(color: status.opacity(0.6), radius: 4, x: 0, y: 0)
                }
            }

            content
        }
        .padding(16)
        .background(Color(red: 0.08, green: 0.10, blue: 0.15)) // Surface-1 Dark Charcoal
        .cornerRadius(10)
        .overlay(
            RoundedRectangle(cornerRadius: 10)
                .stroke(Color.white.opacity(0.10), lineWidth: 0.5) // Hairline sub-pixel border
        )
    }
}
