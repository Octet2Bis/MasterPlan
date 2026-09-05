//
//  HappeningGameViews.swift
//  AevumApp
//
//  Composants SwiftUI des mini-jeux tactiles et posturaux.
//

import SwiftUI

// MARK: - Mini-Game 1: Le Tableau Noir
public struct ChalkboardGameView: View {
    @Binding var linesCopied: Int
    let onComplete: () -> Void
    
    public var body: some View {
        VStack(spacing: 12) {
            ZStack {
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color(hex: "#1B3B2B"))
                    .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color(hex: "#C2A649"), lineWidth: 4))
                
                VStack(alignment: .leading, spacing: 8) {
                    ForEach(0..<min(linesCopied, 5), id: \.self) { _ in
                        Text("• Je suis génial et je m'aime.")
                            .font(.system(size: 14, weight: .bold, design: .monospaced))
                            .foregroundColor(.white.opacity(0.9))
                    }
                    
                    if linesCopied < 5 {
                        Text("› [Touchez pour écrire la ligne \(linesCopied + 1)/5]")
                            .font(.system(size: 12, weight: .medium, design: .monospaced))
                            .foregroundColor(.white.opacity(0.4))
                    }
                }
                .padding(20)
            }
            .frame(height: 200)
            .padding(.horizontal, 20)
            .onTapGesture {
                withAnimation(.spring()) {
                    linesCopied += 1
                    if linesCopied >= 5 { onComplete() }
                }
            }
        }
    }
}

// MARK: - Mini-Game 2: Le Sculpteur de Phalanges
public struct FingerSculptorGameView: View {
    @Binding var fingersLowered: Set<Int>
    let onComplete: () -> Void
    let fingerNames = ["Pouce", "Index", "Majeur", "Annulaire", "Auriculaire"]
    
    public var body: some View {
        VStack(spacing: 16) {
            HStack(spacing: 10) {
                ForEach(0..<5, id: \.self) { i in
                    Button(action: {
                        withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
                            if fingersLowered.contains(i) {
                                fingersLowered.remove(i)
                            } else {
                                fingersLowered.insert(i)
                            }
                            if fingersLowered.count == 4 && !fingersLowered.contains(2) {
                                onComplete()
                            }
                        }
                    }) {
                        VStack(spacing: 8) {
                            RoundedRectangle(cornerRadius: 8)
                                .fill(fingersLowered.contains(i) ? Color.gray.opacity(0.3) : Color(hex: "#F5B800"))
                                .frame(width: 36, height: fingersLowered.contains(i) ? 40 : 100)
                            Text(fingerNames[i])
                                .font(.system(size: 9, weight: .bold))
                                .foregroundColor(Color(hex: "#F4EFE6"))
                        }
                    }
                }
            }
            .padding(20)
            .background(Color.white.opacity(0.04))
            .cornerRadius(16)
            .padding(.horizontal, 20)
        }
    }
}

// MARK: - Mini-Game 3: Le Miroir Crevette AR
public struct ShrimpCameraGameView: View {
    @Binding var isPostureFixed: Bool
    let onComplete: () -> Void
    
    public var body: some View {
        VStack(spacing: 16) {
            ZStack {
                Circle()
                    .stroke(isPostureFixed ? Color(hex: "#34D399") : Color(hex: "#FF4D4D"), lineWidth: 4)
                    .frame(width: 180, height: 180)
                    .background(Circle().fill(Color.white.opacity(0.05)))
                
                VStack(spacing: 6) {
                    Text(isPostureFixed ? "👑" : "🦞")
                        .font(.system(size: 54))
                    Text(isPostureFixed ? "Posture Royale" : "Détection Crevette : 94%")
                        .font(.system(size: 11, weight: .bold, design: .monospaced))
                        .foregroundColor(isPostureFixed ? Color(hex: "#34D399") : Color(hex: "#FF4D4D"))
                }
            }
            
            Button(action: {
                withAnimation(.spring()) {
                    isPostureFixed = true
                    onComplete()
                }
            }) {
                Text(isPostureFixed ? "✓ Nuque Redressée" : "Redresser le Menton")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(Color(hex: "#0B0B0C"))
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(Color(hex: isPostureFixed ? "#34D399" : "#F4EFE6"))
                    .cornerRadius(12)
                    .padding(.horizontal, 40)
            }
        }
    }
}
