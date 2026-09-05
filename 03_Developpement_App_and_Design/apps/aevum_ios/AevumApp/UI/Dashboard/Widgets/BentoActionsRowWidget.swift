import SwiftUI

// MARK: - Widget Bento Actions Rapides (Vidéo ➔ Article & Mini-jeu)
public struct BentoActionsRowWidget: View {
    public var onSelectVideoArticle: () -> Void = {}
    public var onSelectMiniGame: () -> Void = {}
    
    private let signalOrange = Color(red: 1.0, green: 0.27, blue: 0.0)
    private let transitGreen = Color(red: 0.0, green: 0.78, blue: 0.33)
    
    public var body: some View {
        HStack(spacing: 12) {
            // Carte 1 : Vidéo ➔ Article
            Button(action: onSelectVideoArticle) {
                VStack(alignment: .leading, spacing: 10) {
                    ZStack {
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color(red: 0.07, green: 0.07, blue: 0.09))
                            .frame(height: 75)
                        
                        Circle()
                            .fill(signalOrange)
                            .frame(width: 34, height: 34)
                            .overlay(
                                Image(systemName: "play.fill")
                                    .font(.system(size: 13, weight: .bold))
                                    .foregroundColor(.white)
                                    .offset(x: 1)
                            )
                        
                        // Barre de progression
                        VStack {
                            Spacer()
                            GeometryReader { geo in
                                ZStack(alignment: .leading) {
                                    Rectangle().fill(Color.white.opacity(0.1))
                                    Rectangle().fill(signalOrange)
                                        .frame(width: geo.size.width * 0.85)
                                }
                            }
                            .frame(height: 3)
                            .cornerRadius(1.5)
                        }
                    }
                    .frame(height: 75)
                    
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Vidéo ➔ Article")
                            .font(.system(size: 13, weight: .heavy, design: .rounded))
                            .foregroundColor(.white)
                        Text("Cette vidéo touche à sa fin. Découvre l'article.")
                            .font(.system(size: 10, weight: .medium))
                            .foregroundColor(Color(white: 0.6))
                            .lineLimit(2)
                    }
                }
                .padding(12)
                .background(Color(red: 0.10, green: 0.10, blue: 0.13))
                .cornerRadius(16)
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(Color(white: 0.12), lineWidth: 1.5)
                )
            }
            .buttonStyle(.plain)
            
            // Carte 2 : Mini-Jeu WarioWare
            Button(action: onSelectMiniGame) {
                VStack(alignment: .leading, spacing: 10) {
                    ZStack {
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color(red: 0.07, green: 0.07, blue: 0.09))
                            .frame(height: 75)
                        
                        VStack(spacing: 6) {
                            Image(systemName: "gamecontroller.fill")
                                .font(.system(size: 24))
                                .foregroundColor(.white)
                            
                            Text("45 SEC")
                                .font(.system(size: 8, weight: .black, design: .monospaced))
                                .foregroundColor(.black)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(transitGreen)
                                .cornerRadius(3)
                        }
                    }
                    .frame(height: 75)
                    
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Mini-jeu")
                            .font(.system(size: 13, weight: .heavy, design: .rounded))
                            .foregroundColor(.white)
                        Text("Ouvre pour jouer et faire une pause !")
                            .font(.system(size: 10, weight: .medium))
                            .foregroundColor(Color(white: 0.6))
                            .lineLimit(2)
                    }
                }
                .padding(12)
                .background(Color(red: 0.10, green: 0.10, blue: 0.13))
                .cornerRadius(16)
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(Color(white: 0.12), lineWidth: 1.5)
                )
            }
            .buttonStyle(.plain)
        }
    }
}
