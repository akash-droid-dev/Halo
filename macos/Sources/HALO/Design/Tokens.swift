import SwiftUI

/// The design tokens, ported from the web reference's `tokens.css`.
///
/// Colour is expressed so that every accent is a small signal and never a
/// surface fill. The island body is pure black so it reads as continuous with
/// the hardware.
enum Tokens {
    // MARK: Surfaces

    static let islandBody = Color.black
    static let raised = Color.white.opacity(0.05)
    static let raisedStrong = Color.white.opacity(0.055)
    static let controlFill = Color.white.opacity(0.07)
    static let controlFillHover = Color.white.opacity(0.16)
    static let controlFillQuiet = Color.white.opacity(0.08)
    static let hairline = Color.white.opacity(0.08)
    static let hairlineStrong = Color.white.opacity(0.12)
    static let hairlineSoft = Color.white.opacity(0.09)

    // MARK: Ink
    //
    // Secondary ink never carries the only copy of a state; a glyph or shape
    // repeats it.

    static let inkPrimary = Color.white.opacity(0.96)
    static let inkSecondary = Color.white.opacity(0.60)
    static let inkTertiary = Color.white.opacity(0.38)
    static let inkQuaternary = Color.white.opacity(0.32)
    static let inkBody = Color.white.opacity(0.86)
    static let inkMeta = Color.white.opacity(0.42)

    // MARK: Accents

    static let accentMedia = Color(red: 1.00, green: 0.60, blue: 0.42)      // #FF9A6B
    static let accentTimer = Color(red: 0.04, green: 0.52, blue: 1.00)      // #0A84FF
    static let accentPower = Color(red: 0.19, green: 0.82, blue: 0.35)      // #30D158
    static let accentMeeting = Color(red: 0.37, green: 0.36, blue: 0.90)    // #5E5CE6
    static let accentTransfer = Color(red: 0.39, green: 0.82, blue: 1.00)   // #64D2FF
    static let accentShelf = Color(red: 1.00, green: 0.83, blue: 0.15)      // #FFD426
    static let accentUrgent = Color(red: 1.00, green: 0.27, blue: 0.23)     // #FF453A
    static let accentWarning = Color(red: 1.00, green: 0.62, blue: 0.04)    // #FF9F0A
    static let accentPurple = Color(red: 0.75, green: 0.35, blue: 0.95)     // #BF5AF2
    static var accentSystem: Color { accentTimer }

    // MARK: Spacing — a 4pt scale

    static let space1: CGFloat = 4
    static let space2: CGFloat = 8
    static let space3: CGFloat = 12
    static let space4: CGFloat = 16

    static let shoulderInsetCollapsed: CGFloat = 12
    static let shoulderInsetExpanded: CGFloat = 14
    static let moduleInset: CGFloat = 14
    static let moduleHeaderHeight: CGFloat = 28

    // MARK: Radii — each tuned to its own state's width

    static let radiusRest: CGFloat = 10
    static let radiusCompact: CGFloat = 13
    static let radiusPreview: CGFloat = 19
    static let radiusExpanded: CGFloat = 24
    static let radiusCard: CGFloat = 9
    static let radiusCardLarge: CGFloat = 11
    static let radiusControl: CGFloat = 7

    // MARK: Hit targets

    /// Minimum target inside the island.
    static let hitMinimum: CGFloat = 28
    /// Primary transport and answer/join actions.
    static let hitPrimary: CGFloat = 44

    // MARK: Type
    //
    // Numeric readouts use monospaced digits so timers do not jitter.

    static let islandTitle = Font.system(size: 12.5, weight: .semibold)
    static let moduleTitle = Font.system(size: 14, weight: .semibold)
    static let body = Font.system(size: 12)
    static let meta = Font.system(size: 11)
    static let label = Font.system(size: 10.5, weight: .semibold)

    static func readout(_ size: CGFloat) -> Font {
        .system(size: size, weight: .semibold).monospacedDigit()
    }
}

extension View {
    /// Collapsed elevation.
    func islandShadowCollapsed() -> some View {
        shadow(color: .black.opacity(0.46), radius: 6, x: 0, y: 3)
    }

    /// Expanded elevation: less spread than a floating panel, so the island
    /// sits close to the glass rather than hovering above it.
    func islandShadowExpanded() -> some View {
        shadow(color: .black.opacity(0.58), radius: 26, x: 0, y: 22)
            .shadow(color: .black.opacity(0.48), radius: 4, x: 0, y: 2)
    }
}
