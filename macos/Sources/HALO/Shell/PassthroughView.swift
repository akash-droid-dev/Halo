import AppKit

/// The panel is sized to the island's maximum footprint so its geometry can
/// animate without resizing the window. That leaves transparent area around
/// the drawn silhouette, and this view makes that area click-through: the
/// desktop and the apps beneath stay usable right up to the island's edge.
final class PassthroughView: NSView {
    /// The drawn silhouette, in this view's coordinates. Updated as the island
    /// animates; one frame behind at worst, which is imperceptible.
    var interactiveRect: CGRect = .zero

    override func hitTest(_ point: NSPoint) -> NSView? {
        // Outside the silhouette the panel declines the event entirely, so it
        // travels to whatever is behind the window.
        guard interactiveRect.contains(convert(point, from: superview)) else { return nil }
        return super.hitTest(point)
    }

    override var isOpaque: Bool { false }
}
