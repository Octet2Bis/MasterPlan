import Foundation
import Combine
#if canImport(FamilyControls)
import FamilyControls
#endif
#if canImport(ManagedSettings)
import ManagedSettings
#endif
#if canImport(DeviceActivity)
import DeviceActivity
#endif

// MARK: - Gestionnaire Screen Time & Bouclier de Friction
@MainActor
public class ScreenTimeManager: ObservableObject {
    public static let shared = ScreenTimeManager()
    
    public static let appGroupId = "group.com.aevum.app"
    private let userDefaults = UserDefaults(suiteName: appGroupId) ?? UserDefaults.standard
    
    @Published public var isAuthorized: Bool = false
    @Published public var isShieldActive: Bool = false
    @Published public var gracePeriodRemainingSeconds: Int = 0
    @Published public var selectedAppCount: Int = 0
    
    private var graceTimer: Timer?
    
    #if canImport(ManagedSettings)
    private let managedSettingsStore = ManagedSettingsStore()
    #endif
    
    #if canImport(FamilyControls)
    @Published public var activitySelection = FamilyActivitySelection() {
        didSet {
            saveSelection()
        }
    }
    #endif
    
    private init() {
        loadSelection()
        checkAuthorizationStatus()
    }
    
    // MARK: - Vérification & Demande d'Autorisation
    public func checkAuthorizationStatus() {
        #if canImport(FamilyControls)
        if #available(iOS 16.0, *) {
            self.isAuthorized = (AuthorizationCenter.shared.authorizationStatus == .approved)
        }
        #else
        self.isAuthorized = false
        #endif
    }
    
    public func requestAuthorization() async -> Bool {
        #if canImport(FamilyControls)
        if #available(iOS 16.0, *) {
            do {
                try await AuthorizationCenter.shared.requestAuthorization(for: .individual)
                self.isAuthorized = true
                return true
            } catch {
                print("⚠️ Erreur FamilyControls Authorization: \(error.localizedDescription)")
                self.isAuthorized = false
                return false
            }
        }
        #endif
        return false
    }
    
    // MARK: - Activation du Bouclier (Shield)
    public func enableShield() {
        #if canImport(ManagedSettings)
        #if canImport(FamilyControls)
        if !activitySelection.applicationTokens.isEmpty {
            managedSettingsStore.shield.applications = activitySelection.applicationTokens
        }
        if !activitySelection.categoryTokens.isEmpty {
            managedSettingsStore.shield.applicationCategories = .specific(activitySelection.categoryTokens)
        }
        #endif
        #endif
        self.isShieldActive = true
        userDefaults.set(true, forKey: "isShieldActive")
    }
    
    // MARK: - Désactivation Temporaire (Fenêtre de Grâce post Micro-Défi)
    public func grantGracePeriod(minutes: Int) {
        #if canImport(ManagedSettings)
        managedSettingsStore.shield.applications = nil
        managedSettingsStore.shield.applicationCategories = nil
        #endif
        
        self.isShieldActive = false
        self.gracePeriodRemainingSeconds = minutes * 60
        userDefaults.set(false, forKey: "isShieldActive")
        
        graceTimer?.invalidate()
        graceTimer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] timer in
            guard let self = self else { return }
            Task { @MainActor in
                if self.gracePeriodRemainingSeconds > 0 {
                    self.gracePeriodRemainingSeconds -= 1
                } else {
                    timer.invalidate()
                    self.enableShield()
                }
            }
        }
    }
    
    // MARK: - Sauvegarde & Chargement
    private func saveSelection() {
        #if canImport(FamilyControls)
        if let encoded = try? PropertyListEncoder().encode(activitySelection) {
            userDefaults.set(encoded, forKey: "activitySelection")
            self.selectedAppCount = activitySelection.applicationTokens.count + activitySelection.categoryTokens.count
        }
        #endif
    }
    
    private func loadSelection() {
        #if canImport(FamilyControls)
        if let data = userDefaults.data(forKey: "activitySelection"),
           let decoded = try? PropertyListDecoder().decode(FamilyActivitySelection.self, from: data) {
            self.activitySelection = decoded
            self.selectedAppCount = decoded.applicationTokens.count + decoded.categoryTokens.count
        }
        #endif
        self.isShieldActive = userDefaults.bool(forKey: "isShieldActive")
    }
}
