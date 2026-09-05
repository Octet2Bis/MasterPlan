//
//  Segmented_Pill_Control.swift
//  Component Library — Essential 7 (03_Developpement_App_and_Design)
//  Sélecteur d'onglets glissant façon Apple / Linear
//  Plafond strict : < 70 lignes
//

import SwiftUI

public struct SegmentedPillControl: View {
    public let options: [String]
    @Binding public var selectedIndex: Int
    @Namespace private var animationNamespace

    public init(options: [String], selectedIndex: Binding<Int>) {
        self.options = options
        self._selectedIndex = selectedIndex
    }

    public var body: some View {
        HStack(spacing: 4) {
            ForEach(0..<options.count, id: \.self) { index in
                Button {
                    withAnimation(.spring(response: 0.35, dampingFraction: 0.75)) {
                        selectedIndex = index
                    }
                } label: {
                    Text(options[index])
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(selectedIndex == index ? .black : Color(white: 0.6))
                        .padding(.vertical, 8)
                        .padding(.horizontal, 14)
                        .background {
                            if selectedIndex == index {
                                Capsule()
                                    .fill(Color(white: 0.95))
                                    .matchedGeometryEffect(id: "activePill", in: animationNamespace)
                            }
                        }
                }
                .buttonStyle(.plain)
            }
        }
        .padding(4)
        .background(Color(red: 0.08, green: 0.11, blue: 0.16))
        .clipShape(Capsule())
        .overlay(Capsule().stroke(Color.white.opacity(0.08), lineWidth: 1))
    }
}
