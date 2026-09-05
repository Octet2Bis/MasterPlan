//
//  Subscription_Tier_Card.swift
//  Component Library — Essential 7 (03_Developpement_App_and_Design)
//  Plafond strict : < 70 lignes
//

import SwiftUI

public struct SubscriptionTierCard: View {
    public let tierName: String
    public let priceText: String
    public let isPopular: Bool
    public let features: [String]
    public let action: () -> Void

    public init(tierName: String, priceText: String, isPopular: Bool = false, features: [String], action: @escaping () -> Void) {
        self.tierName = tierName
        self.priceText = priceText
        self.isPopular = isPopular
        self.features = features
        self.action = action
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                Text(tierName).font(.system(size: 16, weight: .bold)).foregroundColor(.white)
                Spacer()
                if isPopular {
                    Text("POPULAIRE")
                        .font(.system(size: 9, weight: .heavy, design: .monospaced))
                        .foregroundColor(.black)
                        .padding(.horizontal, 8).padding(.vertical, 3)
                        .background(Color.green).clipShape(Capsule())
                }
            }

            HStack(alignment: .lastTextBaseline, spacing: 2) {
                Text(priceText).font(.system(size: 26, weight: .heavy, design: .rounded)).foregroundColor(.white)
                Text("/mois").font(.system(size: 12, weight: .medium)).foregroundColor(Color(white: 0.6))
            }

            VStack(alignment: .leading, spacing: 8) {
                ForEach(features, id: \.self) { feat in
                    HStack(spacing: 6) {
                        Image(systemName: "checkmark.circle.fill").font(.system(size: 12)).foregroundColor(.green)
                        Text(feat).font(.system(size: 12)).foregroundColor(Color(white: 0.8))
                    }
                }
            }

            Button("Activer l'Accès", action: action)
                .font(.system(size: 13, weight: .bold)).foregroundColor(.black)
                .frame(maxWidth: .infinity).padding(.vertical, 10)
                .background(isPopular ? Color.green : Color.white).cornerRadius(6)
        }
        .padding(16)
        .background(Color(red: 0.09, green: 0.12, blue: 0.18))
        .cornerRadius(12)
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(isPopular ? Color.green.opacity(0.4) : Color.white.opacity(0.1), lineWidth: 1))
    }
}
