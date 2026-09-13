import AppKit

/// Measured geometry for one screen. Never hard-code a notch size: it is read
/// per screen, and re-read on every screen-parameter change.
struct NotchGeometry: Equatable {
    /// Width of the camera housing in points, or nil on an unnotched screen.
    let housingWidth: CGFloat?

    /// Height the island's shoulder must fill to meet the hardware.
    let shoulderHeight: CGFloat

    /// The gutter the island reserves for the housing: measured width plus 8pt.
    var gutter: CGFloat { housingWidth.map { $0 + 8 } ?? 0 }

    var isNotched: Bool { housingWidth != nil }

    /// Measure a screen's camera housing.
    ///
    /// `safeAreaInsets.top` is documented as the distance from the screen edge
    /// at which content is not obscured. The housing's *width* is derived from
    /// the gap between the two unobscured top-corner regions — the housing is
    /// what sits between them.
    static func measure(_ screen: NSScreen) -> NotchGeometry {
        let inset = screen.safeAreaInsets.top
        let menuBarThickness = NSStatusBar.system.thickness

        // On a notched built-in display the measured inset already includes the
        // menu bar, and the menu bar can be taller than the housing — so the
        // shoulder takes whichever is greater.
        let shoulder = max(inset, menuBarThickness)

        guard
            inset > 0,
            let left = screen.auxiliaryTopLeftArea,
            let right = screen.auxiliaryTopRightArea
        else {
            // No inset, or no auxiliary areas: treat the screen as unnotched.
            return NotchGeometry(housingWidth: nil, shoulderHeight: shoulder)
        }

        // The housing spans from the right edge of the left auxiliary area to
        // the left edge of the right one.
        let width = right.minX - left.maxX
        guard width > 0 else {
            return NotchGeometry(housingWidth: nil, shoulderHeight: shoulder)
        }

        return NotchGeometry(housingWidth: width, shoulderHeight: shoulder)
    }
}
