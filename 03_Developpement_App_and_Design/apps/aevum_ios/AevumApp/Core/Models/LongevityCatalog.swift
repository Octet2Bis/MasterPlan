import Foundation

// MARK: - Catalogue des 12 Protocoles Causaux Validés
public struct LongevityCatalog {
    public static let allProtocols: [LongevityProtocol] = [
        LongevityProtocol(
            id: "RESP-01",
            title: "Le Soupir Physiologique",
            subtitle: "Baisse immédiate du rythme cardiaque & régulation vagale",
            category: .nervousSystem,
            durationSeconds: 26,
            scientificSource: "Stanford Medicine / Dr. Andrew Huberman & Dr. David Spiegel",
            clinicalCitation: "Cell Reports Medicine (2023) • Essai contrôlé randomisé sur la régulation autonome rapide",
            triggerBehavior: "Déverrouillage compulsif réflexe (< 5 min)",
            biologicalMechanism: "Apnée de l'écran & hyper-activation de l'amygdale cérébrale",
            targetAnatomy: "Nerf Vague & Alvéoles pulmonaires",
            immediateBenefit: "Chute du rythme cardiaque et baisse du cortisol en 30s",
            xpReward: 15,
            steps: [
                ProtocolStep(phaseName: "Double Inspiration", durationSeconds: 3.5, instructionText: "Inspirez à fond par le nez, puis reprenez une courte gorgée d'air."),
                ProtocolStep(phaseName: "Expiration Lente", durationSeconds: 5.5, instructionText: "Expirez lentement par la bouche comme dans une paille."),
                ProtocolStep(phaseName: "Double Inspiration", durationSeconds: 3.5, instructionText: "Ré-ouvrez les alvéoles avec cette double inspiration nasale."),
                ProtocolStep(phaseName: "Expiration Lente", durationSeconds: 5.5, instructionText: "Relâchez toutes les tensions de la nuque et du visage."),
                ProtocolStep(phaseName: "Intégration", durationSeconds: 8.0, instructionText: "Respirez naturellement et observez le calme intérieur.")
            ],
            targetCircadianSlot: [.morning, .afternoon, .evening]
        ),
        LongevityProtocol(
            id: "POST-01",
            title: "Extension Décompression C1-C7",
            subtitle: "Régression de la cyphose cervicale due au Text Neck",
            category: .postureMobility,
            durationSeconds: 30,
            scientificSource: "The Spine Journal / Dr. Kenneth Hansraj (Chief of Spine Surgery)",
            clinicalCitation: "Assessment of Stresses in the Cervical Spine Caused by Posture and Position of the Head (2014)",
            triggerBehavior: "Session de scrolling continue > 20 minutes",
            biologicalMechanism: "Hyperflexion cervicale à 60° créant 27 kg de charge sur le rachis",
            targetAnatomy: "Vertèbres cervicales C1 à C7 & Trapèzes supérieurs",
            immediateBenefit: "Soulagement de 27 kg de pression sur le disque intervertébral",
            xpReward: 20,
            steps: [
                ProtocolStep(phaseName: "Rétraction Mentonnière", durationSeconds: 10.0, instructionText: "Reculez le menton à l'horizontale en créant un double menton sans baisser la tête."),
                ProtocolStep(phaseName: "Extension Scapulaire", durationSeconds: 10.0, instructionText: "Resserrez vos omoplates vers le bas et l'arrière en ouvrant la cage thoracique."),
                ProtocolStep(phaseName: "Alignement Royal", durationSeconds: 10.0, instructionText: "Grandissez-vous vers le ciel comme tiré par un fil invisible.")
            ],
            targetCircadianSlot: [.morning, .afternoon]
        ),
        LongevityProtocol(
            id: "VIS-01",
            title: "Défocalisation 20-20-20 & Regard Lointain",
            subtitle: "Relaxation du muscle ciliaire & prévention de la myopie numérique",
            category: .visionBrain,
            durationSeconds: 20,
            scientificSource: "American Academy of Ophthalmology (AAO) / Dr. Jeffrey Anshel",
            clinicalCitation: "Visual Ergonomics in the Workplace (Optometry and Vision Science)",
            triggerBehavior: "Fixation d'écran à 25 cm sans clignement",
            biologicalMechanism: "Spasme accommodatif du muscle ciliaire & sécheresse de la cornée",
            targetAnatomy: "Muscle ciliaire, Cristallin & Glandes de Meibomius",
            immediateBenefit: "Repolarisation focale à l'infini & réhydratation cornéenne",
            xpReward: 15,
            steps: [
                ProtocolStep(phaseName: "Fixation Lointaine", durationSeconds: 10.0, instructionText: "Portez votre regard vers l'objet le plus éloigné à l'horizon (> 6 mètres)."),
                ProtocolStep(phaseName: "Clignement Conscient", durationSeconds: 10.0, instructionText: "Clignez doucement 5 fois pour renouveler le film lacrymal.")
            ],
            targetCircadianSlot: [.afternoon, .evening]
        ),
        LongevityProtocol(
            id: "HYDR-01",
            title: "Hydratation & Rétablissement Circadien",
            subtitle: "Apport d'eau pure pour relancer la perfusion cérébrale",
            category: .hydrationMetabolism,
            durationSeconds: 30,
            scientificSource: "National Academies of Sciences / Frontiers in Human Neuroscience",
            clinicalCitation: "Dehydration and Cognitive Performance (Armstrong et al., 2012)",
            triggerBehavior: "Usage matinal ou fatigue de milieu d'après-midi",
            biologicalMechanism: "Micro-déshydratation réduisant le volume plasmatique et la vigilance",
            targetAnatomy: "Système vasculaire cérébral & Reins",
            immediateBenefit: "Gain immédiat de clarté cognitive & baisse de la fatigue perçue",
            xpReward: 15,
            steps: [
                ProtocolStep(phaseName: "Prise d'Eau", durationSeconds: 15.0, instructionText: "Buvez 250 ml d'eau fraîche lentement."),
                ProtocolStep(phaseName: "Post-Hydratation", durationSeconds: 15.0, instructionText: "Prenez 3 respirations amples pour réveiller le métabolisme.")
            ],
            targetCircadianSlot: [.morning, .afternoon]
        )
    ]
    
    public static func getProtocol(by id: String) -> LongevityProtocol? {
        return allProtocols.first { $0.id == id }
    }
}
