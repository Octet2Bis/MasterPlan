import ManagedSettingsUI
import ManagedSettings
import UIKit

// MARK: - Extension de Configuration du Shield Natif Apple
// Cette extension injecte la vue de blocage personnalisée sur les applications restreintes
class ShieldConfigurationExtension: ShieldConfigurationDataSource {
    
    override func configuration(shielding application: Application) -> ShieldConfiguration {
        return ShieldConfiguration(
            backgroundBlurStyle: .systemUltraThinMaterialDark,
            backgroundColor: UIColor(red: 0.03, green: 0.04, blue: 0.07, alpha: 0.96),
            icon: UIImage(systemName: "bolt.heart.fill")?.withTintColor(UIColor(red: 0.22, green: 0.74, blue: 0.97, alpha: 1.0), renderingMode: .alwaysOriginal),
            title: ShieldConfiguration.Label(
                text: "AEVUM • Micro-Pause Santé",
                color: .white
            ),
            subtitle: ShieldConfiguration.Label(
                text: "Votre corps a besoin d'un micro-stimulus. Prenez 30 secondes pour valider votre protocole de longévité.",
                color: UIColor(red: 0.58, green: 0.64, blue: 0.72, alpha: 1.0)
            ),
            primaryButtonLabel: ShieldConfiguration.Label(
                text: "Lancer le Micro-Défi (30s)",
                color: UIColor(red: 0.03, green: 0.04, blue: 0.07, alpha: 1.0)
            ),
            primaryButtonBackgroundColor: UIColor(red: 0.20, green: 0.83, blue: 0.60, alpha: 1.0),
            secondaryButtonLabel: ShieldConfiguration.Label(
                text: "Quitter vers l'Accueil",
                color: UIColor(red: 0.39, green: 0.45, blue: 0.55, alpha: 1.0)
            )
        )
    }
    
    override func configuration(shielding webDomain: WebDomain) -> ShieldConfiguration {
        return configuration(shielding: Application(bundleIdentifier: "com.apple.mobilesafari")!)
    }
}
