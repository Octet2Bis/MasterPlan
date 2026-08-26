// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "AevumApp",
    defaultLocalization: "fr",
    platforms: [
        .iOS(.v16)
    ],
    products: [
        .library(
            name: "AevumAppCore",
            targets: ["AevumAppCore"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "AevumAppCore",
            path: "AevumApp/Core"
        ),
        .testTarget(
            name: "AevumTests",
            dependencies: ["AevumAppCore"],
            path: "Tests"
        )
    ]
)
