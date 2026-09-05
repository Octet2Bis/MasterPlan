import SwiftUI

// MARK: - Widget Maître : Mon Agave (Biomarqueurs & Signalétique Suisse)
public struct AgaveHeroWidget: View {
    public var onTapDetails: () -> Void = {}
    
    // Couleurs Signalétiques Inspirées de Civil & Platform 08
    private let signalOrange = Color(red: 1.0, green: 0.27, blue: 0.0)
    private let transitGreen = Color(red: 0.0, green: 0.78, blue: 0.33)
    private let petrolTeal   = Color(red: 0.0, green: 0.50, blue: 0.50)
    private let amberWarm    = Color(red: 1.0, green: 0.55, blue: 0.0)
    
    public var body: some View {
        Button(action: onTapDetails) {
            VStack(alignment: .leading, spacing: 14) {
                // Header du Widget
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Mon agave")
                            .font(.system(size: 20, weight: .heavy, design: .rounded))
                            .foregroundColor(.white)
                        Text("Ton équilibre, chaque jour")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(Color(white: 0.6))
                    }
                    Spacer()
                    Image(systemName: "info.circle")
                        .font(.system(size: 18))
                        .foregroundColor(Color(white: 0.5))
                }
                
                // Représentation Vectorielle Agave et Chips Satellites
                ZStack {
                    // Tracé stylisé des 5 feuilles d'Agave
                    AgaveVectorShape()
                        .stroke(transitGreen.opacity(0.8), lineWidth: 2)
                        .background(AgaveVectorShape().fill(transitGreen.opacity(0.12)))
                        .frame(height: 180)
                    
                    // Chip Haut : Temps d'écran (Signal Orange)
                    VStack(spacing: 2) {
                        metricChip(title: "TEMPS D'ÉCRAN", value: "72%", color: signalOrange)
                    }
                    .offset(y: -85)
                    
                    // Chip Haut Gauche : Posture
                    metricChip(title: "POSTURE", value: "58%", color: amberWarm)
                        .offset(x: -110, y: -40)
                    
                    // Chip Haut Droite : Sommeil
                    metricChip(title: "SOMMEIL", value: "65%", color: petrolTeal)
                        .offset(x: 110, y: -40)
                    
                    // Chip Bas Gauche : Respiration
                    metricChip(title: "RESPIRATION", value: "80%", color: transitGreen)
                        .offset(x: -100, y: 55)
                    
                    // Chip Bas Droite : Activité
                    metricChip(title: "ACTIVITÉ", value: "40%", color: transitGreen)
                        .offset(x: 100, y: 55)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
            }
            .padding(18)
            .background(Color(red: 0.10, green: 0.10, blue: 0.13))
            .cornerRadius(AevumTheme.swissRadiusBox)
            .overlay(
                Rectangle()
                    .stroke(AevumTheme.swissInk, lineWidth: AevumTheme.swissBorderFine)
            )
        }
        .buttonStyle(.plain)
    }
    
    // Pastille de Métrique Satellite (Format Cartouche Suisse)
    private func metricChip(title: String, value: String, color: Color) -> some View {
        VStack(spacing: 1) {
            Text(title)
                .font(.system(size: 8, weight: .bold))
                .foregroundColor(Color(white: 0.7))
            Text(value)
                .font(.system(size: 12, weight: .heavy, design: .monospaced))
                .foregroundColor(color)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(Color(red: 0.07, green: 0.07, blue: 0.09))
        .cornerRadius(AevumTheme.swissRadiusBox)
        .overlay(
            Rectangle()
                .stroke(color.opacity(0.8), lineWidth: AevumTheme.swissBorderFine)
        )
    }
}

// MARK: - Tracé Vectoriel de l'Agave (Shape SwiftUI)
struct AgaveVectorShape: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let center = CGPoint(x: rect.midX, y: rect.maxY - 10)
        
        // Feuille Centrale (Temps d'écran)
        path.move(to: center)
        path.addQuadCurve(to: CGPoint(x: rect.midX, y: rect.minY + 20), control: CGPoint(x: rect.midX - 15, y: rect.midY))
        path.addQuadCurve(to: center, control: CGPoint(x: rect.midX + 15, y: rect.midY))
        
        // Feuille Gauche Haute (Posture)
        path.move(to: center)
        path.addQuadCurve(to: CGPoint(x: rect.minX + 30, y: rect.minY + 45), control: CGPoint(x: rect.midX - 30, y: rect.midY - 10))
        path.addQuadCurve(to: center, control: CGPoint(x: rect.midX - 10, y: rect.midY + 20))
        
        // Feuille Droite Haute (Sommeil)
        path.move(to: center)
        path.addQuadCurve(to: CGPoint(x: rect.maxX - 30, y: rect.minY + 45), control: CGPoint(x: rect.midX + 30, y: rect.midY - 10))
        path.addQuadCurve(to: center, control: CGPoint(x: rect.midX + 10, y: rect.midY + 20))
        
        // Feuille Gauche Basse (Respiration)
        path.move(to: center)
        path.addQuadCurve(to: CGPoint(x: rect.minX + 10, y: rect.midY + 35), control: CGPoint(x: rect.midX - 50, y: rect.midY + 30))
        path.addQuadCurve(to: center, control: CGPoint(x: rect.midX - 20, y: rect.maxY - 5))
        
        // Feuille Droite Basse (Activité)
        path.move(to: center)
        path.addQuadCurve(to: CGPoint(x: rect.maxX - 10, y: rect.midY + 35), control: CGPoint(x: rect.midX + 50, y: rect.midY + 30))
        path.addQuadCurve(to: center, control: CGPoint(x: rect.midX + 20, y: rect.maxY - 5))
        
        return path
    }
}
