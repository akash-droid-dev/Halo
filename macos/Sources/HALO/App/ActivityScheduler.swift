import Foundation

/// Owns the tier queue, and is the only thing that decides what the island
/// shows. Modules publish activities; none of them can promote itself.
///
/// Ties break by most recent start.
@MainActor
@Observable
final class ActivityScheduler {
    /// The resolved queue, highest tier first.
    private(set) var queue: [Activity] = []

    /// A user override of which activity owns the primary slot.
    var override: String?

    /// A module the user opened explicitly, which outranks the queue.
    var forced: String?

    func update(from activities: [Activity]) {
        queue = activities.sorted { lhs, rhs in
            if lhs.tier != rhs.tier { return lhs.tier < rhs.tier }
            return lhs.startedAt > rhs.startedAt
        }
    }

    /// The activity in the primary slot.
    var primary: Activity? {
        if let override, let match = queue.first(where: { $0.id == override }) {
            return match
        }
        return queue.first
    }

    /// The next-highest activity, shown as the secondary chip.
    var secondary: Activity? {
        guard let primary else { return nil }
        return queue.first { $0.id != primary.id }
    }

    /// The surface currently rendered.
    var currentID: String? { forced ?? primary?.id }

    /// Advance to the next live activity — the target of ⌥⇥.
    func cycle() {
        guard !queue.isEmpty else { return }
        let index = queue.firstIndex { $0.id == currentID } ?? -1
        let next = queue[(index + 1) % queue.count]
        forced = next.id
        override = next.id
    }
}
