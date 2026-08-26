//
//  HappeningPlayerView.swift
//  AevumApp
//
//  Lecteur SwiftUI interactif pour les micro-jeux Aevum (< 130 lignes).
//

import SwiftUI

public struct HappeningPlayerView: View {
    let happening: MiniHappening
    let onCompleted: (String) -> Void
    let onDismiss: () -> Void
    
    @State private var linesCopied: Int = 0
    @State private var fingersLowered: Set<Int> = []
    @State private var isPostureFixed: Bool = false
    @State private var isSuccess: Bool = false
    @State private var remainingSeconds: Int = 5
    
    public init(happening: MiniHappening, onCompleted: @escaping (String) -> Void, onDismiss: @escaping () -> Void) {
        self.happening = happening
        self.onCompleted = onCompleted
        self.onDismiss = onDismiss
        self._remainingSeconds = State(initialValue: happening.durationSeconds)
    }
    
    public var body: some View {
        ZStack {
            Color(hex: "#0B0B0C").ignoresSafeArea()
            
            VStack(spacing: 20) {
                // Header
                HStack {
                    Button(action: onDismiss) {
                        Image(systemName: "xmark")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(Color(hex: "#F4EFE6"))
                            .padding(10)
                            .background(Color.white.opacity(0.1))
                            .clipShape(Circle())
                    }
                    Spacer()
                    VStack {
                        Text(happening.category.rawValue.uppercased())
                            .font(.system(size: 10, weight: .black, design: .monospaced))
                            .foregroundColor(Color(hex: happening.category.accentColorHex))
                        Text(happening.title)
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(Color(hex: "#F4EFE6"))
                    }
                    Spacer()
                    Text("\(remainingSeconds)s")
                        .font(.system(size: 14, weight: .black, design: .monospaced))
                        .foregroundColor(Color(hex: "#F5B800"))
                        .padding(.horizontal, 10)
                        .padding(.vertical, 4)
                        .background(Color(hex: "#F5B800").opacity(0.15))
                        .cornerRadius(12)
                }
                .padding(.horizontal, 20)
                .padding(.top, 16)
                
                // Corps du jeu
                Spacer()
                switch happening.type {
                case .rapidTapping:
                    ChalkboardGameView(linesCopied: $linesCopied, onComplete: triggerSuccess)
                case .fingerSculptor:
                    FingerSculptorGameView(fingersLowered: $fingersLowered, onComplete: triggerSuccess)
                case .arCamera:
                    ShrimpCameraGameView(isPostureFixed: $isPostureFixed, onComplete: triggerSuccess)
                default:
                    VStack(spacing: 12) {
                        Text("🎯 \(happening.anatomyTarget)")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(Color(hex: "#34D399"))
                        Text("⚡ \(happening.immediateBenefit)")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(Color(hex: "#F4EFE6").opacity(0.8))
                        Button(action: triggerSuccess) {
                            Text("Valider le Défi")
                                .padding()
                                .background(Color(hex: "#F5B800"))
                                .foregroundColor(.black)
                                .cornerRadius(12)
                        }
                    }
                }
                Spacer()
                
                // Footer
                Text(happening.promptInstruction)
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(Color(hex: "#F4EFE6").opacity(0.7))
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 30)
                    .padding(.bottom, 20)
            }
            
            if isSuccess {
                SuccessRewardView(
                    challengeName: happening.title,
                    xpEarned: happening.xpReward,
                    onDismiss: { onCompleted(happening.punchlineReward) }
                )
            }
        }
    }
    
    private func triggerSuccess() {
        withAnimation(.spring()) { isSuccess = true }
    }
}
