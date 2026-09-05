import SwiftUI

// MARK: - Widget Bento : Série d'Adhérence (Streak) & Régularité
public struct StreakCalendarWidget: View {
    public var streakDays: Int
    public var completedCount: Int
    
    private let days = ["L", "M", "M", "J", "V", "S", "D"]
    
    public var body: some View {
        BentoCard(accentColor: AevumTheme.amberAccent) {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Label("SÉRIE ACTIVE", systemImage: "flame.fill")
                        .font(.system(size: 10, weight: .bold, design: .rounded))
                        .foregroundColor(AevumTheme.amberAccent)
                        .tracking(1.2)
                    Spacer()
                    Text("\(completedCount) défis totaux")
                        .font(.system(size: 11, weight: .medium, design: .rounded))
                        .foregroundColor(AevumTheme.textSecondary)
                }
                
                HStack(alignment: .firstTextBaseline, spacing: 6) {
                    Text("\(streakDays)")
                        .font(.system(size: 32, weight: .black, design: .rounded))
                        .foregroundColor(.white)
                    Text("JOURS CONSÉCUTIFS")
                        .font(.system(size: 11, weight: .bold, design: .rounded))
                        .foregroundColor(AevumTheme.amberAccent)
                }
                
                // Pastilles des jours de la semaine
                HStack(spacing: 6) {
                    ForEach(0..<7) { index in
                        VStack(spacing: 4) {
                            Circle()
                                .fill(index <= 4 ? AevumTheme.amberAccent : AevumTheme.bgSecondary)
                                .frame(width: 24, height: 24)
                                .overlay(
                                    Image(systemName: index <= 4 ? "checkmark" : "")
                                        .font(.system(size: 10, weight: .bold))
                                        .foregroundColor(AevumTheme.bgPrimary)
                                )
                            Text(days[index])
                                .font(.system(size: 9, weight: .bold, design: .rounded))
                                .foregroundColor(AevumTheme.textMuted)
                        }
                        .frame(maxWidth: .infinity)
                    }
                }
            }
        }
    }
}
