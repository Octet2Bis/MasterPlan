import DeviceActivity
import ManagedSettings
import Foundation

// MARK: - Extension de Surveillance d'Activité & Planning
class DeviceActivityMonitorExtension: DeviceActivityMonitor {
    
    let store = ManagedSettingsStore()
    
    // Déclenché au début de la plage horaire de surveillance (ex: 08h00 - 22h00)
    override func intervalDidStart(for activity: DeviceActivityName) {
        super.intervalDidStart(for: activity)
        
        let userDefaults = UserDefaults(suiteName: "group.com.aevum.app")
        let isShieldActive = userDefaults?.bool(forKey: "isShieldActive") ?? true
        
        if isShieldActive {
            // Réactive le bouclier automatiquement
        }
    }
    
    // Déclenché à la fin de la plage horaire
    override func intervalDidEnd(for activity: DeviceActivityName) {
        super.intervalDidEnd(for: activity)
        // Levée nocturne éventuelle
    }
}
