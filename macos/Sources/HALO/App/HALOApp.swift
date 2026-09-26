import AppKit
import Carbon.HIToolbox
import SwiftUI

@main
@MainActor
final class HALOApp: NSObject, NSApplicationDelegate, NSMenuDelegate {
    private var state: AppState!
    private var panels: PanelController!
    private var hotkeys: GlobalHotkeys!
    private var queueTimer: Timer?
    private var statusItem: NSStatusItem?
    private var loginItemMenuItem: NSMenuItem?

    /// `NSApplication.delegate` is a weak reference, so the delegate has to be
    /// owned by something that outlives `main()`.
    private static var shared: HALOApp?

    static func main() {
        let app = NSApplication.shared
        let delegate = HALOApp()
        shared = delegate
        app.delegate = delegate
        // An accessory app: the island is the interface, so there is no Dock
        // icon and no window to activate.
        app.setActivationPolicy(.accessory)
        app.run()
    }

    func applicationDidFinishLaunching(_ notification: Notification) {
        state = AppState()
        panels = PanelController(state: state)
        installMenuBarItem()
        installShortcuts()

        // One cheap pass to keep the queue in step with the modules.
        queueTimer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
            guard let self else { return }
            Task { @MainActor in self.state.refreshQueue() }
        }
    }

    func applicationWillTerminate(_ notification: Notification) {
        queueTimer?.invalidate()
        hotkeys?.stop()
        for module in state.modules { module.deactivate() }
        state.batteryService.stop()
    }

    /// A small menu-bar item, so there is always a way to quit an app that has
    /// no Dock icon.
    private func installMenuBarItem() {
        let item = NSStatusBar.system.statusItem(withLength: NSStatusItem.squareLength)
        item.button?.image = NSImage(
            systemSymbolName: "rectangle.topthird.inset.filled",
            accessibilityDescription: "HALO"
        )

        let menu = NSMenu()
        menu.delegate = self
        menu.addItem(
            withTitle: "Open Island",
            action: #selector(openIsland),
            keyEquivalent: ""
        ).target = self

        menu.addItem(.separator())

        let login = NSMenuItem(
            title: "Launch at Login",
            action: #selector(toggleLoginItem),
            keyEquivalent: ""
        )
        login.target = self
        menu.addItem(login)
        loginItemMenuItem = login

        menu.addItem(.separator())

        let offline = NSMenuItem(
            title: "Offline by design — no network access",
            action: nil,
            keyEquivalent: ""
        )
        offline.isEnabled = false
        menu.addItem(offline)

        menu.addItem(.separator())
        menu.addItem(
            withTitle: "Quit HALO",
            action: #selector(NSApplication.terminate(_:)),
            keyEquivalent: "q"
        )
        item.menu = menu
        statusItem = item
    }

    @objc private func openIsland() {
        state.open()
    }

    @objc private func toggleLoginItem() {
        do {
            try LoginItem.setEnabled(!LoginItem.isEnabled)
        } catch {
            // The user can also revoke this in System Settings; surfacing the
            // real status is more useful than insisting on ours.
            NSLog("HALO: login item change failed — %@", error.localizedDescription)
        }
        refreshLoginItemMenu()
    }

    private func refreshLoginItemMenu() {
        loginItemMenuItem?.state = LoginItem.isEnabled ? .on : .off
        loginItemMenuItem?.toolTip = LoginItem.statusDescription
        // Not installed in /Applications: registration cannot succeed, so do
        // not offer a control that will silently fail.
        loginItemMenuItem?.isEnabled = !LoginItem.statusDescription.contains("unavailable")
    }

    // MARK: NSMenuDelegate

    func menuNeedsUpdate(_ menu: NSMenu) {
        refreshLoginItemMenu()
    }

    /// Registered hotkeys, not an event tap: HALO never needs Accessibility
    /// access to read its own shortcuts, and cannot see any other keystroke.
    private func installShortcuts() {
        hotkeys = GlobalHotkeys()

        // ⌥Space — open the active module.
        hotkeys.register(keyCode: UInt32(kVK_Space), modifiers: GlobalHotkeys.option) {
            [weak self] in self?.state.open()
        }
        // ⌥⇥ — switch to the next live activity.
        hotkeys.register(keyCode: UInt32(kVK_Tab), modifiers: GlobalHotkeys.option) {
            [weak self] in
            guard let self else { return }
            self.state.scheduler.cycle()
            self.state.mode = .expanded
        }
        // ⌘P — pin or unpin the panel.
        hotkeys.register(keyCode: UInt32(kVK_ANSI_P), modifiers: GlobalHotkeys.command) {
            [weak self] in self?.state.togglePin()
        }

        // `esc` is deliberately NOT a global hotkey — swallowing Escape
        // system-wide would be hostile. It is handled while the panel has
        // focus, which is the only time it means "dismiss this".
        NSEvent.addLocalMonitorForEvents(matching: .keyDown) { [weak self] event in
            guard event.keyCode == UInt16(kVK_Escape) else { return event }
            self?.state.collapse(viaEscape: true)
            return nil
        }
    }
}
