import AppKit
import SwiftUI

/// The five island states.
enum IslandMode {
    case rest
    case compact
    case preview
    case expanded
}

/// One observable source of truth: island mode, the activity queue, the module
/// registry, and settings. Nothing in the view layer talks to an integration
/// directly.
@MainActor
@Observable
final class AppState {
    // MARK: Island

    var mode: IslandMode = .rest
    var isPinned = false

    /// Reference-counted collapse guard. A drag, a focused field, or an open
    /// child menu each take a hold and release it on exit, so overlapping
    /// interactions cannot leave the panel stuck open.
    private(set) var holdCount = 0

    func acquireHold() { holdCount += 1 }
    func releaseHold() { holdCount = max(0, holdCount - 1) }
    var isHeld: Bool { holdCount > 0 }

    // MARK: Registry

    let scheduler = ActivityScheduler()
    let accessibility = AccessibilityPreferences()

    let batteryService = BatteryService()
    private(set) var modules: [any Module] = []

    /// Hover-intent delay before a hover escalates to the preview state.
    var hoverIntent: TimeInterval {
        get { UserDefaults.standard.object(forKey: "halo.hoverIntent") as? TimeInterval ?? 0.25 }
        set { UserDefaults.standard.set(newValue, forKey: "halo.hoverIntent") }
    }

    init() {
        let timers = TimerModule()
        let battery = BatteryModule(service: batteryService)
        modules = [timers, battery]

        batteryService.start()
        for module in modules { module.activate() }
        refreshQueue()
    }

    /// Recompute the queue from every module's published activity. This is the
    /// only path into the scheduler.
    func refreshQueue() {
        // Cheap pass: let each module fold in whatever its own polling has
        // already produced. No module does I/O here.
        for module in modules { module.refresh() }
        scheduler.update(from: modules.compactMap(\.activity))

        // With nothing happening, the island returns to rest.
        if scheduler.queue.isEmpty, !isPinned, mode == .compact {
            mode = .rest
        } else if !scheduler.queue.isEmpty, mode == .rest {
            mode = .compact
        }
    }

    var currentModule: (any Module)? {
        guard let id = scheduler.currentID else { return modules.first }
        return modules.first { $0.id == id } ?? modules.first
    }

    var isOpen: Bool { mode == .expanded || isPinned }

    // MARK: Commands

    func open(_ id: String? = nil) {
        scheduler.forced = id ?? scheduler.currentID
        mode = .expanded
    }

    /// `esc` and outside clicks are ignored while pinned; only unpinning or the
    /// explicit close button dismisses it.
    func collapse(viaEscape: Bool = false) {
        if viaEscape && isPinned { return }
        isPinned = false
        scheduler.forced = nil
        mode = scheduler.queue.isEmpty ? .rest : .compact
    }

    func togglePin() {
        isPinned.toggle()
        if isPinned { mode = .expanded }
    }
}
