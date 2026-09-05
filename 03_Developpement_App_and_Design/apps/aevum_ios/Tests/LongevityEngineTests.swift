import XCTest
@testable import AevumAppCore

final class LongevityEngineTests: XCTestCase {
    
    func testCatalogIntegrity() {
        let protocols = LongevityCatalog.allProtocols
        XCTAssertGreaterThanOrEqual(protocols.count, 6, "Le catalogue doit contenir au moins 6 protocoles de base.")
        
        // Vérification du Soupir Physiologique
        let sigh = LongevityCatalog.getProtocol(by: "RESP-01")
        XCTAssertNotNil(sigh)
        XCTAssertEqual(sigh?.durationSeconds, 26)
        XCTAssertEqual(sigh?.category, .nervousSystem)
    }
    
    func testBiologicalAgeCalculation() {
        var profile = UserProfile(
            chronologicalAge: 30,
            dailyScreenHours: 9.0,         // +2.5 ans
            dailyUnconsciousUnlocks: 70,   // +1.8 ans
            hasJointStiffness: true,       // +1.5 ans
            afternoonBrainFog: true        // +1.0 ans
        )
        
        profile.recalculateBiologicalAge()
        
        // 30 + 2.5 + 1.8 + 1.5 + 1.0 = 36.8 ans
        XCTAssertEqual(profile.estimatedBiologicalAge, 36.8, accuracy: 0.1)
        XCTAssertLessThan(profile.currentVitalityScore, 70)
        
        // Test après complétion de 20 défis
        profile.completedChallengesCount = 20
        profile.recalculateBiologicalAge()
        XCTAssertLessThan(profile.estimatedBiologicalAge, 36.8, "Les défis validés doivent rajeunir l'âge biologique estimé.")
    }
    
    func testCircadianRecommendation() {
        let profile = UserProfile()
        let recommendation = ProtocolRecommendationEngine.recommendProtocol(
            recentSessions: [],
            profile: profile
        )
        XCTAssertFalse(recommendation.id.isEmpty)
    }
}
