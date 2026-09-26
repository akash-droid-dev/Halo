// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "HALO",
    platforms: [
        // macOS 14 is the floor: @Observable, and the Observation framework the
        // module stores are built on.
        .macOS(.v14)
    ],
    targets: [
        .executableTarget(
            name: "HALO",
            path: "Sources/HALO"
        )
    ]
)
