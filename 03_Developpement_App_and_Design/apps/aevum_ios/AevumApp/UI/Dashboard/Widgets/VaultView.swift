//
//  VaultView.swift
//  AevumApp
//
//  Vue SwiftUI du Coffre aux Pépites (Archives des 50 Vannes et Mèmes de Longévité débloqués).
//

import SwiftUI

public struct VaultView: View {
    @State private var selectedFilter: HappeningCategory? = nil
    let items: [VaultItem]
    let onDismiss: () -> Void
    
    public init(items: [VaultItem], onDismiss: @escaping () -> Void) {
        self.items = items
        self.onDismiss = onDismiss
    }
    
    public var body: some View {
        ZStack {
            Color(hex: "#0B0B0C").ignoresSafeArea()
            
            VStack(spacing: 16) {
                // Header
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("LE COFFRE AUX PÉPITES")
                            .font(.system(size: 18, weight: .black, design: .monospaced))
                            .foregroundColor(Color(hex: "#F4EFE6"))
                        Text("\(items.count) Récompenses d'esprit débloquées")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(Color(hex: "#F4EFE6").opacity(0.6))
                    }
                    
                    Spacer()
                    
                    Button(action: onDismiss) {
                        Image(systemName: "xmark")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(Color(hex: "#F4EFE6"))
                            .padding(8)
                            .background(Color.white.opacity(0.1))
                            .clipShape(Circle())
                    }
                }
                .padding(.horizontal, 20)
                .padding(.top, 16)
                
                // Filtres de catégories
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        FilterPill(title: "Toutes", isSelected: selectedFilter == nil) {
                            selectedFilter = nil
                        }
                        
                        ForEach(HappeningCategory.allCases, id: \.self) { cat in
                            FilterPill(title: cat.rawValue, isSelected: selectedFilter == cat) {
                                selectedFilter = cat
                            }
                        }
                    }
                    .padding(.horizontal, 20)
                }
                
                // Liste des items
                ScrollView {
                    LazyVStack(spacing: 12) {
                        let filtered = items.filter { selectedFilter == nil || $0.category == selectedFilter }
                        
                        if filtered.isEmpty {
                            VStack(spacing: 8) {
                                Text("🔒")
                                    .font(.system(size: 40))
                                Text("Coffre verrouillé pour cette ligne")
                                    .font(.system(size: 14, weight: .bold))
                                    .foregroundColor(Color(hex: "#F4EFE6").opacity(0.7))
                                Text("Réalisez vos arrêts de longévité pour révéler les pépites cachées.")
                                    .font(.system(size: 12, weight: .medium))
                                    .foregroundColor(Color(hex: "#F4EFE6").opacity(0.4))
                                    .multilineTextAlignment(.center)
                            }
                            .padding(.top, 40)
                        } else {
                            ForEach(filtered) { item in
                                VaultCardView(item: item)
                            }
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 30)
                }
            }
        }
    }
}

struct FilterPill: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 11, weight: .bold))
                .foregroundColor(isSelected ? Color(hex: "#0B0B0C") : Color(hex: "#F4EFE6").opacity(0.8))
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(isSelected ? Color(hex: "#F4EFE6") : Color(hex: "#141619"))
                .cornerRadius(14)
                .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color.white.opacity(0.1), lineWidth: 1))
        }
    }
}

struct VaultCardView: View {
    let item: VaultItem
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(item.category.rawValue.uppercased())
                    .font(.system(size: 9, weight: .black, design: .monospaced))
                    .foregroundColor(Color(hex: item.category.accentColorHex))
                Spacer()
                Text(item.unlockedAt.formatted(date: .abbreviated, time: .omitted))
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(.white.opacity(0.4))
            }
            
            Text("« \(item.punchline) »")
                .font(.system(size: 13, weight: .medium, design: .serif))
                .foregroundColor(Color(hex: "#F4EFE6"))
                .lineSpacing(3)
            
            HStack {
                Text("🏷️ \(item.title)")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(.white.opacity(0.6))
                Spacer()
                Image(systemName: "square.and.arrow.up")
                    .font(.system(size: 11))
                    .foregroundColor(Color(hex: "#F4EFE6").opacity(0.7))
            }
            .padding(.top, 4)
        }
        .padding(14)
        .background(Color(hex: "#141619"))
        .cornerRadius(14)
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color.white.opacity(0.08), lineWidth: 1))
    }
}
