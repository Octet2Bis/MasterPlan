//
//  Preview_MiniApp_Template.swift
//  Master Plan — Architecture & Core Templates (03_Developpement_App_and_Design)
//  Inspiration : Point-Free Preview Apps / Isolated Feature Sandboxes
//  Plafond strict : < 70 lignes
//

import SwiftUI

/// Mini-application exécutable pour tester une feature ou un écran en isolation complète
/// sans compiler ni lancer le reste de l'application.
@main
struct PreviewMiniApp: App {
    @StateObject private var store = FeatureStore(
        initialState: FeatureState(title: "Sandbox Isolation Preview", counter: 5),
        reducer: FeatureReducer()
    )

    var body: some Scene {
        WindowGroup {
            ZStack {
                Color(red: 0.04, green: 0.06, blue: 0.09).ignoresSafeArea() // Canvas Surface-0

                VStack(spacing: 20) {
                    BentoCard(
                        title: "Isolation Sandbox",
                        subtitle: store.state.title,
                        statusColor: .green
                    ) {
                        VStack(alignment: .leading, spacing: 14) {
                            Text("Valeur actuelle : \(store.state.counter)")
                                .font(.system(size: 24, weight: .bold, design: .rounded))
                                .foregroundColor(.white)

                            HStack(spacing: 12) {
                                Button("Décrémenter") {
                                    store.send(.decrementButtonTapped)
                                }
                                .buttonStyle(.bordered)

                                Button("Incrémenter") {
                                    store.send(.incrementButtonTapped)
                                }
                                .buttonStyle(.borderedProminent)
                            }
                        }
                    }
                }
                .padding(20)
            }
        }
    }
}
