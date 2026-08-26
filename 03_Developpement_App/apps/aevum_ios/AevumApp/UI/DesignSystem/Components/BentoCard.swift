import SwiftUI

// MARK: - Composant Conteneur BentoCard
public struct BentoCard<Content: View>: View {
    public let content: Content
    public var accentColor: Color?
    public var padding: CGFloat
    
    public init(
        accentColor: Color? = nil,
        padding: CGFloat = 20,
        @ViewBuilder content: () -> Content
    ) {
        self.accentColor = accentColor
        self.padding = padding
        self.content = content()
    }
    
    public var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            content
        }
        .padding(padding)
        .frame(maxWidth: .infinity, alignment: .leading)
        .bentoCardStyle(borderColor: accentColor?.opacity(0.3) ?? AevumTheme.cardBorder)
    }
}
