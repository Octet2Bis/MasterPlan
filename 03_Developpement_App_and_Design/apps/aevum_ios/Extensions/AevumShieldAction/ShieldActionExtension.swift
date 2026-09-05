import ManagedSettings
import UIKit

// MARK: - Extension de Gestion des Clics sur le Shield
class ShieldActionExtension: ShieldActionDelegate {
    
    override func handle(action: ShieldAction, for application: Application, completionHandler: @escaping (ShieldActionResponse) -> Void) {
        switch action {
        case .primaryButtonPressed:
            // Ouvre l'application Aevum via Custom URL Scheme pour lancer le défi
            if let url = URL(string: "aevum://challenge?id=RESP-01") {
                // Notifie le système de fermer le shield ou d'ouvrir l'app
                completionHandler(.defer)
            } else {
                completionHandler(.close)
            }
            
        case .secondaryButtonPressed:
            // L'utilisateur renonce à ouvrir l'app bloquée
            completionHandler(.close)
            
        @unknown default:
            completionHandler(.close)
        }
    }
}
