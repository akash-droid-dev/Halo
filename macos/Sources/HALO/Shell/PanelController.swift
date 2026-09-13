import AppKit
import SwiftUI

/// Owns one panel per participating screen, and rebuilds the whole set when the
/// screen configuration changes — a display connected, disconnected, resolution
/// or scaling changed. Geometry is re-measured on every rebuild.
@MainActor
final class PanelController {
    private let state: AppState
    private var panels: [CGDirectDisplayID: IslandPanel] = [:]
    private var observers: [NSObjectProtocol] = []

    init(state: AppState) {
        self.state = state
        rebuild()

        observers.append(
            NotificationCenter.default.addObserver(
                forName: NSApplication.didChangeScreenParametersNotification,
                object: nil,
                queue: .main
            ) { [weak self] _ in
                Task { @MainActor in self?.rebuild() }
            }
        )

        // On wake, recompute deadlines from stored absolute dates and re-poll
        // rather than resuming counters that stopped while asleep.
        observers.append(
            NSWorkspace.shared.notificationCenter.addObserver(
                forName: NSWorkspace.didWakeNotification,
                object: nil,
                queue: .main
            ) { [weak self] _ in
                Task { @MainActor in
                    self?.state.batteryService.read()
                    for module in self?.state.modules ?? [] { module.activate() }
                    self?.state.refreshQueue()
                    self?.rebuild()
                }
            }
        )
    }

    deinit {
        for observer in observers { NotificationCenter.default.removeObserver(observer) }
    }

    /// Rebuild the whole panel set, re-measuring every screen.
    ///
    /// Panels are recreated rather than reused: a resolution or scaling change
    /// changes the measured geometry, and a reused panel would keep serving the
    /// geometry captured when it was built.
    func rebuild() {
        for panel in panels.values { panel.orderOut(nil) }
        panels.removeAll()

        for screen in participatingScreens() {
            guard let id = displayID(of: screen) else { continue }
            let measured = NotchGeometry.measure(screen)

            let host = PassthroughView(frame: screen.frame)
            host.autoresizingMask = [.width, .height]

            let island = IslandView(state: state, geometry: measured) { size in
                // Keep the hit-test mask on the drawn silhouette, so the
                // desktop stays clickable around the island.
                let x = (screen.frame.width - size.width) / 2
                host.interactiveRect = CGRect(
                    x: x,
                    y: screen.frame.height - size.height,
                    width: size.width,
                    height: size.height
                )
            }

            // Anchored to the top centre of the screen, under the housing.
            let container = VStack(spacing: 0) {
                island
                Spacer(minLength: 0)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)

            let hosting = NSHostingView(rootView: AnyView(container))
            hosting.frame = host.bounds
            hosting.autoresizingMask = [.width, .height]
            host.addSubview(hosting)

            let panel = IslandPanel(screen: screen, content: host)
            panel.orderFrontRegardless()
            panels[id] = panel
        }
    }

    /// Which screens carry an island. Unnotched screens are included only when
    /// the user has asked for the menu-bar pill.
    private func participatingScreens() -> [NSScreen] {
        let showOnUnnotched = UserDefaults.standard.object(forKey: "halo.showOnUnnotched") as? Bool ?? false
        return NSScreen.screens.filter { screen in
            NotchGeometry.measure(screen).isNotched || showOnUnnotched
        }
    }

    private func displayID(of screen: NSScreen) -> CGDirectDisplayID? {
        screen.deviceDescription[
            NSDeviceDescriptionKey("NSScreenNumber")
        ] as? CGDirectDisplayID
    }
}
