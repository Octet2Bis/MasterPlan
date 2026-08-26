# ⚡ Performance & Données Locales : GRDB.swift & Nuke

Ce guide documente les standards de persistance locale haute performance et de mise en cache d'images pour garantir un affichage fluide à **120 Hz constant** (ProMotion).

---

## 🗄️ 1. Persistance Réactive & Thread-Safe avec GRDB.swift

**[groue/GRDB.swift](https://github.com/groue/GRDB.swift)** est la boîte à outils SQLite de référence en Swift, offrant une concurrence sans verrou (*WAL mode*) et une réactivité native bien plus prévisible que Core Data / SwiftData.

### Modèle d'Implémentation Typique

```swift
import GRDB
import Foundation

// 1. Définition de l'Entité Record
struct ChallengeRecord: Codable, FetchableRecord, PersistableRecord {
    static let databaseTableName = "challenge_sessions"
    
    var id: String
    var protocolId: String
    var timestamp: Date
    var durationSeconds: Int
    var xpEarned: Int
}

// 2. Gestionnaire de Base de Données Thread-Safe
class DatabaseService {
    static let shared = DatabaseService()
    let dbQueue: DatabaseQueue
    
    init() {
        let path = NSSearchPathForDirectoriesInDomains(.documentDirectory, .userDomainMask, true)[0] + "/aevum.sqlite"
        dbQueue = try! DatabaseQueue(path: path)
        try! setupSchema()
    }
    
    private func setupSchema() throws {
        try dbQueue.write { db in
            try db.create(table: "challenge_sessions", ifNotExists: true) { t in
                t.column("id", .text).primaryKey()
                t.column("protocolId", .text).notNull()
                t.column("timestamp", .datetime).notNull()
                t.column("durationSeconds", .integer).notNull()
                t.column("xpEarned", .integer).notNull()
            }
        }
    }
    
    // Écriture Asynchrone isolée
    func saveSession(_ session: ChallengeRecord) async throws {
        try await dbQueue.write { db in
            try session.save(db)
        }
    }
    
    // Observation Réactive (ValueObservation)
    func observeTotalXp() -> ValueObservation<ValueReducers.Fetch<Int>> {
        ValueObservation.tracking { db in
            try ChallengeRecord.select(sum(Column("xpEarned"))).fetchOne(db) ?? 0
        }
    }
}
```

---

## 🖼️ 2. Chargement & Cache d'Images 120Hz avec Nuke

**[kean/Nuke](https://github.com/kean/Nuke)** garantit le chargement asynchrone sans saccade (*jank*) dans les flux denses et listes défilantes :

* **Décodage en Tâche de Fond :** Décompression des images hors du Main Thread.
* **Cache à 2 Niveaux :** Mémoire vive (RAM LRU) + Disque compressé.
* **Intégration SwiftUI :** `LazyImage(url: url) { state in ... }` avec transitions fondues automatiques.
