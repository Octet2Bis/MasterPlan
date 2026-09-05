import SwiftUI
#if canImport(FamilyControls)
import FamilyControls
#endif

// MARK: - Vue Principale : Dashboard Bento Grid Aevum
public struct DashboardView: View {
    @ObservedObject public var appState: AppState
    public var onLaunchProtocol: (LongevityProtocol) -> Void
    
    @State private var selectedCategory: ProtocolCategory? = nil
    @State private var showAppPicker: Bool = false
    
    public var body: some View {
        ZStack {
            AevumTheme.bgPrimary.ignoresSafeArea()
            
            ScrollView(showsIndicators: false) {
                VStack(spacing: 16) {
                    // Header de l'App
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("AEVUM")
                                .font(.system(size: 14, weight: .heavy, design: .rounded))
                                .foregroundColor(AevumTheme.cyanAccent)
                                .tracking(3)
                            Text("Régénération Quotidienne")
                                .font(.system(size: 20, weight: .bold, design: .rounded))
                                .foregroundColor(.white)
                        }
                        Spacer()
                        
                        // Bouton Profil / Réglages
                        Button {
                            SoundHapticManager.shared.triggerHaptic(style: .light)
                        } label: {
                            Image(systemName: "person.crop.circle.fill")
                                .font(.system(size: 28))
                                .foregroundColor(AevumTheme.textSecondary)
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 10)
                    
                    // 1. Série d'Adhérence 7 Jours (Streak de connexion)
                    StreakCalendarWidget(
                        streakDays: appState.profile.currentStreakDays,
                        completedCount: appState.profile.completedChallengesCount
                    )
                    .padding(.horizontal, 20)
                    
                    // 2. Widget Maître : Mon Agave (Biomarqueurs & Signalétique)
                    AgaveHeroWidget(onTapDetails: {
                        SoundHapticManager.shared.triggerHaptic(style: .light)
                    })
                    .padding(.horizontal, 20)
                    
                    // 3. Actions Rapides Bento (Vidéo ➔ Article & Mini-jeu)
                    BentoActionsRowWidget(
                        onSelectVideoArticle: {
                            SoundHapticManager.shared.triggerHaptic(style: .light)
                        },
                        onSelectMiniGame: {
                            SoundHapticManager.shared.triggerHaptic(style: .medium)
                        }
                    )
                    .padding(.horizontal, 20)
                    
                    // 4. Section Catalogue Complet des Protocoles
                    VStack(alignment: .leading, spacing: 12) {
                        Text("PROTOCOLES DE LONGÉVITÉ")
                            .font(.system(size: 11, weight: .bold, design: .rounded))
                            .foregroundColor(AevumTheme.textMuted)
                            .tracking(1.5)
                            .padding(.horizontal, 20)
                        
                        // Sélecteur horizontal de catégories
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 8) {
                                categoryFilterButton(title: "Tous", isSelected: selectedCategory == nil) {
                                    selectedCategory = nil
                                }
                                
                                ForEach(ProtocolCategory.allCases) { category in
                                    categoryFilterButton(
                                        title: category.rawValue,
                                        isSelected: selectedCategory == category,
                                        icon: category.iconName
                                    ) {
                                        selectedCategory = category
                                    }
                                }
                            }
                            .padding(.horizontal, 20)
                        }
                        
                        // Liste des cartes de protocoles filtrés
                        VStack(spacing: 10) {
                            ForEach(filteredProtocols) { proto in
                                protocolListRow(proto: proto)
                            }
                        }
                        .padding(.horizontal, 20)
                    }
                    .padding(.top, 10)
                    .padding(.bottom, 40)
                }
            }
        }
        #if canImport(FamilyControls)
        .familyActivityPicker(isPresented: $showAppPicker, selection: $appState.screenTimeManager.activitySelection)
        #endif
    }
    
    // MARK: - Données Filtrées
    private var filteredProtocols: [LongevityProtocol] {
        if let category = selectedCategory {
            return LongevityCatalog.allProtocols.filter { $0.category == category }
        }
        return LongevityCatalog.allProtocols
    }
    
    // MARK: - Composants Locaux
    @ViewBuilder
    private func categoryFilterButton(title: String, isSelected: Bool, icon: String? = nil, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 4) {
                if let icon = icon {
                    Image(systemName: icon)
                        .font(.system(size: 11))
                }
                Text(title)
                    .font(.system(size: 12, weight: .semibold, design: .rounded))
            }
            .foregroundColor(isSelected ? AevumTheme.bgPrimary : AevumTheme.textSecondary)
            .padding(.horizontal, 14)
            .padding(.vertical, 8)
            .background(isSelected ? AevumTheme.cyanAccent : AevumTheme.bgCard)
            .clipShape(Capsule())
            .overlay(Capsule().stroke(AevumTheme.cardBorder, lineWidth: isSelected ? 0 : 1))
        }
    }
    
    @ViewBuilder
    private func protocolListRow(proto: LongevityProtocol) -> some View {
        Button {
            SoundHapticManager.shared.triggerHaptic(style: .light)
            onLaunchProtocol(proto)
        } label: {
            BentoCard(accentColor: proto.category.accentColor, padding: 14) {
                HStack(spacing: 12) {
                    Circle()
                        .fill(proto.category.accentColor.opacity(0.15))
                        .frame(width: 40, height: 40)
                        .overlay(
                            Image(systemName: proto.category.iconName)
                                .foregroundColor(proto.category.accentColor)
                                .font(.system(size: 16))
                        )
                    
                    VStack(alignment: .leading, spacing: 2) {
                        Text(proto.title)
                            .font(.system(size: 14, weight: .bold, design: .rounded))
                            .foregroundColor(.white)
                        Text("\(proto.durationSeconds)s • \(proto.scientificSource)")
                            .font(.system(size: 11, weight: .regular, design: .rounded))
                            .foregroundColor(AevumTheme.textMuted)
                    }
                    
                    Spacer()
                    
                    Image(systemName: "chevron.right")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(AevumTheme.textMuted)
                }
            }
        }
    }
}
