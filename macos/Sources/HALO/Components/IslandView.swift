import SwiftUI

/// Island geometry per state. Width, height, and radius are returned together
/// because they animate on one curve, so the silhouette never breaks.
struct IslandGeometry {
    var width: CGFloat
    var height: CGFloat
    var radius: CGFloat

    static func resolve(
        mode: IslandMode,
        isOpen: Bool,
        moduleHeight: CGFloat,
        gutter: CGFloat,
        shoulderHeight: CGFloat
    ) -> IslandGeometry {
        // Every state that puts content beside the housing must clear the
        // gutter; these widths are the web reference's, which were derived
        // against a 188pt gutter.
        if isOpen {
            return IslandGeometry(width: 496, height: moduleHeight, radius: Tokens.radiusExpanded)
        }
        switch mode {
        case .preview:
            return IslandGeometry(width: 452, height: 92, radius: Tokens.radiusPreview)
        case .compact:
            return IslandGeometry(
                width: max(436, gutter + 248), height: shoulderHeight,
                radius: Tokens.radiusCompact
            )
        case .rest, .expanded:
            return IslandGeometry(
                width: max(212, gutter + 24), height: shoulderHeight,
                radius: Tokens.radiusRest
            )
        }
    }
}

/// The island shell: geometry, radius, shadow, and the shoulder layout that
/// keeps content clear of the camera housing.
struct IslandView: View {
    let state: AppState
    let geometry: NotchGeometry

    /// Reports the drawn silhouette back so the panel's hit-test mask can
    /// follow it.
    let onSilhouetteChange: (CGSize) -> Void

    @State private var hoverTask: Task<Void, Never>?

    private var reduceMotion: Bool { state.accessibility.reduceMotion }

    private var resolved: IslandGeometry {
        IslandGeometry.resolve(
            mode: state.mode,
            isOpen: state.isOpen,
            moduleHeight: state.currentModule?.preferredHeight ?? 256,
            gutter: geometry.gutter,
            shoulderHeight: geometry.shoulderHeight
        )
    }

    var body: some View {
        let size = resolved

        VStack(spacing: 0) {
            shoulder(size)
            if state.mode == .preview { previewRow }
            if state.isOpen { panel }
            Spacer(minLength: 0)
        }
        .frame(width: size.width, height: size.height, alignment: .top)
        .background(Tokens.islandBody)
        .clipShape(
            // Bottom corners only on a notched display: the top edge is
            // continuous with the bezel.
            UnevenRoundedRectangle(
                topLeadingRadius: geometry.isNotched ? 0 : size.radius,
                bottomLeadingRadius: size.radius,
                bottomTrailingRadius: size.radius,
                topTrailingRadius: geometry.isNotched ? 0 : size.radius,
                style: .continuous
            )
        )
        .modifier(IslandElevation(isRaised: state.isOpen || state.mode == .preview))
        .animation(Motion.expansion(reduceMotion: reduceMotion), value: size.width)
        .animation(Motion.expansion(reduceMotion: reduceMotion), value: size.height)
        .onChange(of: size.width) { _, _ in report(size) }
        .onChange(of: size.height) { _, _ in report(size) }
        .onAppear { report(size) }
        .onHover { inside in
            hoverTask?.cancel()
            guard !state.isOpen else { return }
            hoverTask = Task { @MainActor in
                if inside {
                    // Hover intent: a pointer passing through must not open it.
                    try? await Task.sleep(for: .seconds(state.hoverIntent))
                    guard !Task.isCancelled, !state.isOpen else { return }
                    state.mode = .preview
                } else {
                    // A short grace period, then the collapse guards decide.
                    try? await Task.sleep(for: .milliseconds(140))
                    guard !Task.isCancelled else { return }
                    guard !state.isPinned, !state.isHeld else { return }
                    state.collapse()
                }
            }
        }
    }

    private func report(_ size: IslandGeometry) {
        onSilhouetteChange(CGSize(width: size.width, height: size.height))
    }

    // MARK: Shoulders

    private func shoulder(_ size: IslandGeometry) -> some View {
        HStack(spacing: 0) {
            HStack(spacing: Tokens.space2) {
                if state.mode == .rest {
                    Circle()
                        .fill(state.scheduler.primary?.accent ?? Tokens.accentSystem)
                        .frame(width: 6, height: 6)
                        .opacity(0.85)
                } else if let primary = state.scheduler.primary {
                    Text(primary.summary)
                        .font(.system(size: 11, weight: .medium))
                        .foregroundStyle(Tokens.inkPrimary)
                        .lineLimit(1)
                        .truncationMode(.tail)
                }
                Spacer(minLength: 0)
            }
            .padding(.leading, state.isOpen
                     ? Tokens.shoulderInsetExpanded : Tokens.shoulderInsetCollapsed)
            .frame(maxWidth: .infinity, alignment: .leading)

            // The reserved centre gutter: measured housing width plus 8pt.
            Spacer().frame(width: geometry.gutter)

            HStack(spacing: Tokens.space2) {
                Spacer(minLength: 0)
                if state.isOpen {
                    islandControls
                } else if let primary = state.scheduler.primary {
                    if let secondary = state.scheduler.secondary {
                        secondaryChip(secondary)
                    }
                    Text(primary.value)
                        .font(.system(size: 11, weight: .medium).monospacedDigit())
                        .foregroundStyle(Color.white.opacity(0.72))
                }
            }
            .padding(.trailing, state.isOpen
                     ? Tokens.shoulderInsetExpanded : Tokens.shoulderInsetCollapsed)
            .frame(maxWidth: .infinity, alignment: .trailing)
        }
        .frame(height: geometry.shoulderHeight)
        .contentShape(Rectangle())
        .onTapGesture { state.open() }
    }

    /// Clicking the secondary chip promotes that activity to the primary slot,
    /// so every simultaneous activity stays one click away.
    private func secondaryChip(_ activity: Activity) -> some View {
        Button {
            state.scheduler.override = activity.id
            state.scheduler.forced = activity.id
            state.mode = .expanded
        } label: {
            HStack(spacing: 4) {
                Circle().fill(activity.accent).frame(width: 5, height: 5)
                Text(activity.value)
                    .font(.system(size: 10, weight: .semibold).monospacedDigit())
                    .foregroundStyle(Color.white.opacity(0.7))
            }
            .padding(.leading, 5).padding(.trailing, 6).padding(.vertical, 2)
            .background(Capsule().fill(Color.white.opacity(0.1)))
        }
        .buttonStyle(.plain)
        .help("Switch to \(activity.summary)")
    }

    private var islandControls: some View {
        HStack(spacing: Tokens.space1) {
            Button {
                state.togglePin()
            } label: {
                Image(systemName: state.isPinned ? "pin.fill" : "pin")
                    .font(.system(size: 10, weight: .medium))
            }
            .buttonStyle(IconButtonStyle(size: 22))
            .help(state.isPinned ? "Unpin panel (⌘P)" : "Keep panel open (⌘P)")

            Button {
                state.collapse()
            } label: {
                Image(systemName: "xmark").font(.system(size: 9, weight: .semibold))
            }
            .buttonStyle(IconButtonStyle(size: 22))
            .help("Close (Escape)")
        }
    }

    // MARK: Preview and panel

    private var previewRow: some View {
        HStack(spacing: Tokens.space3) {
            VStack(alignment: .leading, spacing: 3) {
                Text(state.scheduler.primary?.summary ?? state.currentModule?.title ?? "HALO")
                    .font(.system(size: 12.5, weight: .semibold))
                    .foregroundStyle(Color.white.opacity(0.95))
                    .lineLimit(1)
                Text(state.currentModule?.title ?? "")
                    .font(.system(size: 11))
                    .foregroundStyle(Color.white.opacity(0.52))
                    .lineLimit(1)
            }
            Spacer(minLength: 0)
            Text("Click to open")
                .font(.system(size: 10.5))
                .foregroundStyle(Color.white.opacity(0.34))
        }
        .padding(.horizontal, Tokens.shoulderInsetExpanded)
        .padding(.top, 5).padding(.bottom, Tokens.space3)
        .transition(.opacity)
    }

    private var panel: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(spacing: Tokens.space2) {
                Text((state.currentModule?.title ?? "HALO").uppercased())
                    .font(Tokens.label)
                    .tracking(0.6)
                    .foregroundStyle(Tokens.inkTertiary)
                Spacer(minLength: 0)
            }
            .frame(height: Tokens.moduleHeaderHeight)
            .padding(.horizontal, Tokens.moduleInset)

            Group {
                if let module = state.currentModule {
                    switch module.availability {
                    case .available:
                        module.expandedView()
                    case .unavailable(let reason):
                        EmptyStateView(line: reason, glyph: "minus.circle")
                    case .needsPermission(let reason, let actionLabel):
                        // Access is requested at the point of use, never at launch.
                        PermissionCard(
                            title: "Access needed",
                            reason: reason,
                            actionLabel: actionLabel,
                            action: { state.currentModule?.activate() }
                        )
                    }
                }
            }
            .padding(.horizontal, Tokens.moduleInset)
            .padding(.bottom, Tokens.moduleInset)
            .frame(maxWidth: .infinity, alignment: .topLeading)
        }
        .transition(.opacity)
    }
}

/// Elevation switches with state, so the collapsed bar sits close to the glass.
private struct IslandElevation: ViewModifier {
    let isRaised: Bool

    func body(content: Content) -> some View {
        if isRaised {
            content.islandShadowExpanded()
        } else {
            content.islandShadowCollapsed()
        }
    }
}
