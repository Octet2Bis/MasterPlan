import SwiftUI

// MARK: - Orbe Respiratoire Lumineux Aevum
public struct AnimatedBreathingOrb: View {
    public var scale: CGFloat // 0.8 à 1.3
    public var phaseName: String
    public var remainingSeconds: Double
    public var accentColor: Color
    
    public init(
        scale: CGFloat,
        phaseName: String,
        remainingSeconds: Double,
        accentColor: Color = AevumTheme.cyanAccent
    ) {
        self.scale = scale
        self.phaseName = phaseName
        self.remainingSeconds = remainingSeconds
        self.accentColor = accentColor
    }
    
    public var body: some View {
        ZStack {
            // Halo lumineux externe
            Circle()
                .fill(
                    RadialGradient(
                        colors: [accentColor.opacity(0.35), accentColor.opacity(0.0)],
                        center: .center,
                        startRadius: 40,
                        endRadius: 160
                    )
                )
                .scaleEffect(scale * 1.15)
                .blur(radius: 20)
            
            // Anneau pulsant
            Circle()
                .stroke(
                    LinearGradient(
                        colors: [accentColor, AevumTheme.emeraldAccent],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: 3
                )
                .scaleEffect(scale)
                .shadow(color: accentColor.opacity(0.6), radius: 15)
            
            // Cœur de l'Orbe
            Circle()
                .fill(
                    LinearGradient(
                        colors: [accentColor.opacity(0.8), AevumTheme.emeraldAccent.opacity(0.4)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .scaleEffect(scale * 0.85)
                .overlay(
                    Circle()
                        .stroke(Color.white.opacity(0.2), lineWidth: 1)
                )
            
            // Textes centraux
            VStack(spacing: 6) {
                Text(phaseName.uppercased())
                    .font(.system(size: 16, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                    .tracking(2)
                
                Text(String(format: "%.1fs", remainingSeconds))
                    .font(.system(size: 28, weight: .heavy, design: .rounded))
                    .foregroundColor(AevumTheme.textPrimary)
            }
        }
        .frame(width: 260, height: 260)
    }
}
