//
//  Stat_Metric_Tile.swift
//  Component Library — Essential 7 (03_Developpement_App_and_Design)
//  Tuile KPI avec grande valeur, label et indicateur de delta
//  Plafond strict : < 70 lignes
//

import SwiftUI

public struct StatMetricTile: View {
    public let label: String
    public let value: String
    public let unit: String?
    public let deltaText: String?
    public let isPositive: Bool

    public init(
        label: String,
        value: String,
        unit: String? = nil,
        deltaText: String? = nil,
        isPositive: Bool = true
    ) {
        self.label = label
        self.value = value
        self.unit = unit
        self.deltaText = deltaText
        self.isPositive = isPositive
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(label.uppercased())
                .font(.system(size: 10, weight: .bold, design: .monospaced))
                .foregroundColor(Color(white: 0.55))
                .tracking(1.0)

            HStack(alignment: .lastTextBaseline, spacing: 4) {
                Text(value)
                    .font(.system(size: 28, weight: .heavy, design: .rounded))
                    .foregroundColor(.white)

                if let unit = unit {
                    Text(unit)
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(Color(white: 0.6))
                }
            }

            if let delta = deltaText {
                HStack(spacing: 4) {
                    Image(systemName: isPositive ? "arrow.up.right" : "arrow.down.right")
                        .font(.system(size: 10, weight: .bold))
                    Text(delta)
                        .font(.system(size: 11, weight: .semibold))
                }
                .foregroundColor(isPositive ? Color.green : Color.red)
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(red: 0.08, green: 0.11, blue: 0.16))
        .cornerRadius(10)
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.white.opacity(0.1), lineWidth: 0.5))
    }
}
