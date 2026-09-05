import SwiftUI

// MARK: - Widget Bento : Score de Vitalité & Âge Biologique
public struct VitalityScoreWidget: View {
    public var profile: UserProfile
    public var hrvScore: Double
    
    public var body: some View {
        BentoCard(accentColor: AevumTheme.cyanAccent) {
            VStack(alignment: .leading, spacing: 14) {
                // Header du widget
                HStack {
                    Label("INDICE HEALTHSPAN", systemImage: "bolt.heart.fill")
                        .font(.system(size: 11, weight: .bold, design: .rounded))
                        .foregroundColor(AevumTheme.cyanAccent)
                        .tracking(1.5)
                    Spacer()
                    Text("NIVEAU \(profile.currentLevel)")
                        .font(.system(size: 10, weight: .heavy, design: .rounded))
                        .foregroundColor(AevumTheme.emeraldAccent)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(AevumTheme.emeraldAccent.opacity(0.15))
                        .clipShape(Capsule())
                }
                
                // Données principales
                HStack(alignment: .bottom, spacing: 16) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("\(profile.currentVitalityScore)")
                            .font(.system(size: 42, weight: .black, design: .rounded))
                            .foregroundColor(.white)
                        Text("Score / 100")
                            .font(.system(size: 12, weight: .medium, design: .rounded))
                            .foregroundColor(AevumTheme.textSecondary)
                    }
                    
                    Spacer()
                    
                    VStack(alignment: .trailing, spacing: 2) {
                        Text(String(format: "%.1f ans", profile.estimatedBiologicalAge))
                            .font(.system(size: 24, weight: .bold, design: .rounded))
                            .foregroundColor(AevumTheme.emeraldAccent)
                        Text("Âge Biologique")
                            .font(.system(size: 12, weight: .medium, design: .rounded))
                            .foregroundColor(AevumTheme.textSecondary)
                    }
                }
                
                // Barre de progression XP
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text("Progression XP : \(profile.totalXp % 100)/100")
                            .font(.system(size: 10, weight: .semibold, design: .rounded))
                            .foregroundColor(AevumTheme.textMuted)
                        Spacer()
                        Text("HRV : \(Int(hrvScore)) ms")
                            .font(.system(size: 10, weight: .semibold, design: .rounded))
                            .foregroundColor(AevumTheme.cyanAccent)
                    }
                    
                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            Capsule().fill(AevumTheme.bgSecondary)
                            Capsule()
                                .fill(AevumTheme.vitalityGradient)
                                .frame(width: geo.size.width * CGFloat(profile.totalXp % 100) / 100.0)
                        }
                    }
                    .frame(height: 6)
                }
            }
        }
    }
}
