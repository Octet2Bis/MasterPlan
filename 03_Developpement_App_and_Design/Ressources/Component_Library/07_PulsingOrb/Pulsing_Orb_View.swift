//
//  Pulsing_Orb_View.swift
//  Component Library — Essential 7 (03_Developpement_App_and_Design)
//  Orbe respiratoire animé avec pulsations continues ou guidées
//  Plafond strict : < 70 lignes
//

import SwiftUI

public struct PulsingOrbView: View {
    public let orbColor: Color
    public let isExpanded: Bool
    public let size: CGFloat

    public init(
        orbColor: Color = Color.cyan,
        isExpanded: Bool = false,
        size: CGFloat = 120
    ) {
        self.orbColor = orbColor
        self.isExpanded = isExpanded
        self.size = size
    }

    public var body: some View {
        ZStack {
            // Halo externe diffus
            Circle()
                .fill(orbColor.opacity(0.12))
                .frame(width: isExpanded ? size * 1.5 : size * 1.1, height: isExpanded ? size * 1.5 : size * 1.1)
                .blur(radius: 12)

            // Cœur lumineux
            Circle()
                .fill(
                    RadialGradient(
                        colors: [orbColor, orbColor.opacity(0.4)],
                        center: .center,
                        startRadius: 5,
                        endRadius: size / 2
                    )
                )
                .frame(width: isExpanded ? size * 1.25 : size * 0.85, height: isExpanded ? size * 1.25 : size * 0.85)
                .shadow(color: orbColor.opacity(0.6), radius: 20)
        }
        .animation(.easeInOut(duration: 3.5).repeatForever(autoreverses: true), value: isExpanded)
    }
}
