import SwiftUI

// MARK: - Aevum Design System & Dynamic Theme Tokens (Light & Dark)
public struct AevumTheme {
    // Mode Lumineux (Daylight Luxury) vs Sombre
    public static func bgPrimary(for colorScheme: ColorScheme) -> Color {
        colorScheme == .dark ? Color(red: 0.03, green: 0.04, blue: 0.07) : Color(red: 0.97, green: 0.98, blue: 0.99)
    }
    
    public static func bgSecondary(for colorScheme: ColorScheme) -> Color {
        colorScheme == .dark ? Color(red: 0.05, green: 0.08, blue: 0.13) : Color(red: 0.95, green: 0.96, blue: 0.98)
    }
    
    public static func bgCard(for colorScheme: ColorScheme) -> Color {
        colorScheme == .dark ? Color(red: 0.08, green: 0.11, blue: 0.18) : Color.white
    }
    
    public static func cardBorder(for colorScheme: ColorScheme) -> Color {
        colorScheme == .dark ? Color(red: 0.12, green: 0.17, blue: 0.27) : Color(red: 0.89, green: 0.91, blue: 0.94)
    }
    
    // Accents Lumineux
    public static let cyanAccent = Color(red: 0.01, green: 0.52, blue: 0.78)     // #0284C7
    public static let emeraldAccent = Color(red: 0.02, green: 0.59, blue: 0.41)  // #059669
    public static let violetAccent = Color(red: 0.49, green: 0.23, blue: 0.93)   // #7C3AED
    public static let amberAccent = Color(red: 0.85, green: 0.47, blue: 0.02)    // #D97706
    public static let roseAccent = Color(red: 0.88, green: 0.11, blue: 0.28)     // #E11D48
    
    // Typographie & Textes
    public static func textPrimary(for colorScheme: ColorScheme) -> Color {
        colorScheme == .dark ? Color.white : Color(red: 0.06, green: 0.09, blue: 0.16)
    }
    
    public static func textSecondary(for colorScheme: ColorScheme) -> Color {
        colorScheme == .dark ? Color(red: 0.58, green: 0.64, blue: 0.72) : Color(red: 0.28, green: 0.33, blue: 0.41)
    }
    
    public static func textMuted(for colorScheme: ColorScheme) -> Color {
        colorScheme == .dark ? Color(red: 0.39, green: 0.45, blue: 0.55) : Color(red: 0.58, green: 0.64, blue: 0.72)
    }
    
    // Dégradés
    public static let vitalityGradient = LinearGradient(
        colors: [cyanAccent, emeraldAccent],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
    
    // Rayons de courbure
    public static let radiusCard: CGFloat = 24
    public static let radiusButton: CGFloat = 16
    public static let radiusPill: CGFloat = 999
    
    // MARK: - Swiss Transit Tokens (Poster Civil / Platform 08)
    public static let swissCanvas = Color(red: 0.89, green: 0.89, blue: 0.87)    // #E3E4DF
    public static let swissInk = Color(red: 0.12, green: 0.13, blue: 0.13)       // #1F2022
    public static let signalOrange = Color(red: 1.0, green: 0.27, blue: 0.0)     // #FF4400
    public static let transitGreen = Color(red: 0.0, green: 0.72, blue: 0.37)    // #00B75F
    public static let petrolTeal = Color(red: 0.0, green: 0.50, blue: 0.50)      // #008080
    public static let swissRadiusBox: CGFloat = 0.0                               // Angles droits 0px
    public static let swissRadiusCircle: CGFloat = 999.0
    public static let swissBorderFine: CGFloat = 1.5
}

// MARK: - Modificateur Bento Card Dynamique
public struct BentoCardModifier: ViewModifier {
    @Environment(\.colorScheme) var colorScheme
    public var customBorderColor: Color?
    
    public func body(content: Content) -> some View {
        let border = customBorderColor ?? AevumTheme.cardBorder(for: colorScheme)
        let bg = AevumTheme.bgCard(for: colorScheme)
        let shadowColor = colorScheme == .dark ? Color.black.opacity(0.35) : Color(red: 0.06, green: 0.09, blue: 0.16).opacity(0.06)
        
        content
            .background(bg)
            .overlay(
                RoundedRectangle(cornerRadius: AevumTheme.radiusCard)
                    .stroke(border, lineWidth: 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: AevumTheme.radiusCard))
            .shadow(color: shadowColor, radius: 16, x: 0, y: 8)
    }
}

public extension View {
    func bentoCardStyle(borderColor: Color? = nil) -> some View {
        self.modifier(BentoCardModifier(customBorderColor: borderColor))
    }
}
