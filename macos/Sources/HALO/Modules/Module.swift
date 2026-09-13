import SwiftUI

/// What a module can be doing, and how urgently it wants the primary slot.
///
/// Tier 1 is the interaction the user is performing and can never be
/// displaced; 5 is passive information.
enum ActivityTier: Int, Comparable {
    case interacting = 1
    case urgent = 2
    case ongoing = 3
    case active = 4
    case passive = 5

    static func < (lhs: ActivityTier, rhs: ActivityTier) -> Bool {
        lhs.rawValue < rhs.rawValue
    }
}

struct Activity: Identifiable, Equatable {
    let id: String
    let tier: ActivityTier
    let accent: Color
    /// Left shoulder: what is happening.
    let summary: String
    /// Right shoulder: the live value.
    let value: String
    let startedAt: Date
}

/// Why a capability is unavailable, rendered verbatim by the UI rather than
/// collapsed into a generic error.
enum Availability: Equatable {
    case available
    case unavailable(reason: String)
    case needsPermission(reason: String, action: String)
}

/// Every module conforms to this and nothing else. The island shell knows the
/// protocol; it never knows which modules exist.
@MainActor
protocol Module: AnyObject, Identifiable {
    var id: String { get }
    var title: String { get }
    var accent: Color { get }

    /// Nil when the module has nothing to report.
    var activity: Activity? { get }

    /// What this module can currently do, and why not if it cannot.
    var availability: Availability { get }

    /// The expanded height this module's content needs.
    var preferredHeight: CGFloat { get }

    /// Called when the panel becomes visible / hidden, so a module can start
    /// and stop its own polling instead of running all the time.
    func activate()
    func deactivate()

    /// Called on each scheduler pass. Must be cheap: fold in whatever the
    /// module's own polling has already produced, and do no I/O here.
    func refresh()

    func expandedView() -> AnyView
}

extension Module {
    func activate() {}
    func deactivate() {}
    func refresh() {}
}
