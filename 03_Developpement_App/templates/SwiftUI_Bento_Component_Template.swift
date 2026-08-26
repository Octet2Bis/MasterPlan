//
//  SwiftUI_Bento_Component_Template.swift
//  Aevum Architecture Template — Reusable Swiss Craft Bento Widget
//  Plafond strict : < 80 lignes
//

import SwiftUI

public struct BentoCardTemplate<Content: View>: View {
    private let title: String
    private let subtitle: String?
    private let accentColor: Color
    private let content: Content

    public init(
        title: String,
        subtitle: String? = nil,
        accentColor: Color = Color(red: 0.86, green: 0.15, blue: 0.15),
        @ViewBuilder content: () -> Content
    ) {
        self.title = title
        self.subtitle = subtitle
        self.accentColor = accentColor
        self.content = content()
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(title.uppercased())
                        .font(.system(size: 11, weight: .bold, design: .monospaced))
                        .foregroundColor(Color(white: 0.6))
                        .tracking(1.0)
                    
                    if let sub = subtitle {
                        Text(sub)
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(.white)
                    }
                }
                Spacer()
                Circle()
                    .fill(accentColor)
                    .frame(width: 8, height: 8)
            }

            content
        }
        .padding(16)
        .background(Color(white: 0.07))
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color(white: 0.15), lineWidth: 1)
        )
    }
}
