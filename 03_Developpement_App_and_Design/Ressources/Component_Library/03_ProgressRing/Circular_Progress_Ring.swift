//
//  Circular_Progress_Ring.swift
//  Component Library — Essential 7 (03_Developpement_App_and_Design)
//  Anneau de progression circulaire type Apple Watch / Fitness
//  Plafond strict : < 70 lignes
//

import SwiftUI

public struct CircularProgressRing: View {
    public let progress: Double // 0.0 à 1.0
    public let ringColor: Color
    public let lineWidth: CGFloat

    public init(
        progress: Double,
        ringColor: Color = Color.green,
        lineWidth: CGFloat = 10
    ) {
        self.progress = min(max(progress, 0.0), 1.0)
        self.ringColor = ringColor
        self.lineWidth = lineWidth
    }

    public var body: some View {
        ZStack {
            // Piste d'arrière-plan
            Circle()
                .stroke(ringColor.opacity(0.15), lineWidth: lineWidth)

            // Anneau actif animé
            Circle()
                .trim(from: 0.0, to: CGFloat(progress))
                .stroke(
                    ringColor,
                    style: StrokeStyle(lineWidth: lineWidth, lineCap: .round)
                )
                .rotationEffect(.degrees(-90))
                .animation(.spring(response: 0.6, dampingFraction: 0.8), value: progress)
        }
        .padding(lineWidth / 2)
    }
}
