import AppKit
import SwiftUI

/// One floating panel per participating screen.
///
/// It never becomes key until a control inside it needs typing, so the user's
/// frontmost app keeps focus while the island is used.
final class IslandPanel: NSPanel {
    init(screen: NSScreen, content: NSView) {
        super.init(
            contentRect: screen.frame,
            // A non-activating panel: clicking it does not switch apps.
            styleMask: [.borderless, .nonactivatingPanel],
            backing: .buffered,
            defer: false,
            screen: screen
        )

        isFloatingPanel = true
        // Above the menu bar, so the island can meet the hardware.
        level = NSWindow.Level(rawValue: Int(CGWindowLevelForKey(.statusWindow)) + 1)
        collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary, .stationary]

        isOpaque = false
        backgroundColor = .clear
        // The content draws its own shadow, matched to the animated geometry.
        hasShadow = false

        hidesOnDeactivate = false
        isMovable = false
        isMovableByWindowBackground = false
        ignoresMouseEvents = false

        // Keep it out of Mission Control, the window list, and screenshots of
        // "all windows".
        isExcludedFromWindowsMenu = true

        contentView = content
        setFrame(screen.frame, display: true)
    }

    /// Only becomes key when something inside actually needs the keyboard.
    override var canBecomeKey: Bool { true }
    override var canBecomeMain: Bool { false }

    /// `esc` must reach the island's own dismiss handling rather than closing
    /// the panel out from under it.
    override func cancelOperation(_ sender: Any?) {}
}
