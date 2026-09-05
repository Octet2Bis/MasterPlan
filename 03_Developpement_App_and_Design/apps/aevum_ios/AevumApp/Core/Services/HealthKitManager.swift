import Foundation
import Combine
#if canImport(HealthKit)
import HealthKit
#endif

// MARK: - Service de Synchronisation HealthKit
@MainActor
public class HealthKitManager: ObservableObject {
    public static let shared = HealthKitManager()
    
    #if canImport(HealthKit)
    private let healthStore = HKHealthStore()
    #endif
    
    @Published public var isHealthKitAvailable: Bool = false
    @Published public var isAuthorized: Bool = false
    @Published public var todayMindfulMinutes: Double = 0.0
    @Published public var latestHrvSDNN: Double = 52.0  // Valeur par défaut / moyenne (ms)
    @Published public var todayStepCount: Int = 4500
    
    private init() {
        #if canImport(HealthKit)
        self.isHealthKitAvailable = HKHealthStore.isHealthDataAvailable()
        #else
        self.isHealthKitAvailable = false
        #endif
    }
    
    // MARK: - Demande d'Autorisation
    public func requestPermissions() async -> Bool {
        #if canImport(HealthKit)
        guard HKHealthStore.isHealthDataAvailable() else { return false }
        
        let readTypes: Set<HKObjectType> = [
            HKObjectType.quantityType(forIdentifier: .heartRateVariabilitySDNN)!,
            HKObjectType.quantityType(forIdentifier: .stepCount)!,
            HKObjectType.categoryType(forIdentifier: .sleepAnalysis)!
        ]
        
        let writeTypes: Set<HKSampleType> = [
            HKObjectType.categoryType(forIdentifier: .mindfulSession)!,
            HKObjectType.quantityType(forIdentifier: .dietaryWater)!
        ]
        
        do {
            try await healthStore.requestAuthorization(toShare: writeTypes, read: readTypes)
            self.isAuthorized = true
            await fetchTodayMetrics()
            return true
        } catch {
            print("⚠️ Erreur HealthKit Authorization: \(error.localizedDescription)")
            self.isAuthorized = false
            return false
        }
        #else
        return false
        #endif
    }
    
    // MARK: - Enregistrement d'une Session de Respiration / Pleine Conscience
    public func recordMindfulSession(durationSeconds: Double) async {
        #if canImport(HealthKit)
        guard isAuthorized, let mindfulType = HKObjectType.categoryType(forIdentifier: .mindfulSession) else { return }
        
        let now = Date()
        let start = now.addingTimeInterval(-durationSeconds)
        let sample = HKCategorySample(type: mindfulType, value: 0, start: start, end: now)
        
        do {
            try await healthStore.save(sample)
            self.todayMindfulMinutes += (durationSeconds / 60.0)
        } catch {
            print("⚠️ Erreur enregistrement Mindful Session: \(error.localizedDescription)")
        }
        #else
        self.todayMindfulMinutes += (durationSeconds / 60.0)
        #endif
    }
    
    // MARK: - Récupération des Métriques
    public func fetchTodayMetrics() async {
        #if canImport(HealthKit)
        guard isAuthorized else { return }
        // Fetch HRV, Steps, Sleep
        #endif
    }
}
