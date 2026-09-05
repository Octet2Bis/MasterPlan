import SwiftUI

// MARK: - Jauge Circulaire de Compte à Rebours
public struct PulsingTimer: View {
    public var progress: Double // 0.0 à 1.0
    public var remainingSeconds: Int
    public var accentColor: Color
    
    public init(
        progress: Double,
        remainingSeconds: Int,
        accentColor: Color = AevumTheme.emeraldAccent
    ) {
        self.progress = progress
        self.remainingSeconds = remainingSeconds
        self.accentColor = accentColor
    }
    
    public var body: some View {
        ZStack {
            // Piste de fond
            Circle()
                .stroke(AevumTheme.bgCard, lineWidth: 10)
            
            // Anneau de progression
            Circle()
                .trim(from: 0.0, to: CGFloat(progress))
                .stroke(
                    LinearGradient(
                        colors: [accentColor, AevumTheme.cyanAccent],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    style: StrokeStyle(lineWidth: 10, lineCap: .round)
                )
                .rotationEffect(.degrees(-90))
                .animation(.linear(duration: 0.1), value: progress)
                .shadow(color: accentColor.opacity(0.5), radius: 10)
            
            // Affichage du temps
            VStack(spacing: 2) {
                Text("\(remainingSeconds)")
                    .font(.system(size: 48, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                
                Text("SECONDES")
                    .font(.system(size: 11, weight: .bold, design: .rounded))
                    .foregroundColor(AevumTheme.textSecondary)
                    .tracking(1.5)
            }
        }
        .frame(width: 200, height: 200)
    }
}
