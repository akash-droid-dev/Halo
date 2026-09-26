import AppKit
import SwiftUI

/// Motion for the island.
///
/// Width, height, and corner radius animate together on one curve so the
/// silhouette never breaks mid-transition.
enum Motion {
    /// Expansion: 280ms in the web reference, expressed here as the spring the
    /// brief specifies. Range to tune on device: 200–320ms.
    static let expansion = Animation.spring(response: 0.28, dampingFraction: 0.86)

    /// Control fills, chips, toggles, and toast entry.
    static let feedback = Animation.easeOut(duration: 0.14)

    /// Content cross-fade, started after the geometry change so text never
    /// appears to stretch.
    static let content = Animation.easeOut(duration: 0.12)

    /// Under reduced motion, geometry snaps and content does a short fade.
    static func expansion(reduceMotion: Bool) -> Animation {
        reduceMotion ? .linear(duration: 0.001) : expansion
    }

    static func content(reduceMotion: Bool) -> Animation {
        reduceMotion ? .easeOut(duration: 0.06) : content
    }
}

/// Tracks the system reduce-motion setting and its change notification, rather
/// than relying on an in-app toggle alone.
@Observable
final class AccessibilityPreferences {
    private(set) var reduceMotion: Bool
    private(set) var reduceTransparency: Bool
    private(set) var increaseContrast: Bool

    private var observers: [NSObjectProtocol] = []

    init() {
        let workspace = NSWorkspace.shared
        reduceMotion = workspace.accessibilityDisplayShouldReduceMotion
        reduceTransparency = workspace.accessibilityDisplayShouldReduceTransparency
        increaseContrast = workspace.accessibilityDisplayShouldIncreaseContrast

        let observer = NSWorkspace.shared.notificationCenter.addObserver(
            forName: NSWorkspace.accessibilityDisplayOptionsDidChangeNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            guard let self else { return }
            let workspace = NSWorkspace.shared
            self.reduceMotion = workspace.accessibilityDisplayShouldReduceMotion
            self.reduceTransparency = workspace.accessibilityDisplayShouldReduceTransparency
            self.increaseContrast = workspace.accessibilityDisplayShouldIncreaseContrast
        }
        observers.append(observer)
    }

    deinit {
        for observer in observers {
            NSWorkspace.shared.notificationCenter.removeObserver(observer)
        }
    }
}
