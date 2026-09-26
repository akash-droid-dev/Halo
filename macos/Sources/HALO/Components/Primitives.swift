import SwiftUI

struct PrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 12, weight: .semibold))
            .foregroundStyle(.white)
            .padding(.horizontal, 14).padding(.vertical, 7)
            .background(
                RoundedRectangle(cornerRadius: 8, style: .continuous)
                    .fill(Tokens.accentSystem.opacity(configuration.isPressed ? 1 : 0.9))
            )
            .contentShape(Rectangle())
    }
}

struct QuietButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 12, weight: .medium))
            .foregroundStyle(Tokens.inkBody)
            .padding(.horizontal, 12).padding(.vertical, 6)
            .background(
                RoundedRectangle(cornerRadius: 8, style: .continuous)
                    .fill(configuration.isPressed ? Tokens.controlFillHover : Tokens.controlFill)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 8, style: .continuous)
                    .stroke(Tokens.hairlineStrong, lineWidth: 0.5)
            )
            .contentShape(Rectangle())
    }
}

/// Square icon button at the 28pt minimum target inside the island.
struct IconButtonStyle: ButtonStyle {
    var size: CGFloat = 30

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 12, weight: .medium))
            .foregroundStyle(Tokens.inkBody)
            .frame(width: size, height: size)
            .background(
                RoundedRectangle(cornerRadius: Tokens.radiusControl + 2, style: .continuous)
                    .fill(configuration.isPressed ? Tokens.controlFillHover : Tokens.controlFillQuiet)
            )
            .contentShape(Rectangle())
    }
}

/// State, one sentence of plain reason, and one recovery action. Rendered
/// inline in the module it blocks, never as a modal.
struct PermissionCard: View {
    let title: String
    let reason: String
    let actionLabel: String?
    let action: (() -> Void)?

    var body: some View {
        VStack(alignment: .leading, spacing: 9) {
            HStack(spacing: 8) {
                Image(systemName: "exclamationmark.triangle")
                    .font(.system(size: 13, weight: .medium))
                Text(title).font(.system(size: 12.5, weight: .semibold))
            }
            .foregroundStyle(Tokens.accentWarning)

            Text(reason)
                .font(.system(size: 11.5))
                .foregroundStyle(Tokens.inkSecondary)
                .fixedSize(horizontal: false, vertical: true)

            if let actionLabel, let action {
                Button(actionLabel, action: action)
                    .buttonStyle(PrimaryButtonStyle())
            }
        }
        .padding(11)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: Tokens.radiusCardLarge, style: .continuous)
                .fill(Tokens.accentWarning.opacity(0.1))
        )
        .overlay(
            RoundedRectangle(cornerRadius: Tokens.radiusCardLarge, style: .continuous)
                .stroke(Tokens.accentWarning.opacity(0.26), lineWidth: 0.5)
        )
    }
}

/// Glyph, one line of what will appear here, and an optional enabling action.
struct EmptyStateView: View {
    let line: String
    var glyph: String?
    var actionLabel: String?
    var action: (() -> Void)?

    var body: some View {
        VStack(spacing: 8) {
            if let glyph {
                Image(systemName: glyph)
                    .font(.system(size: 18, weight: .light))
                    .foregroundStyle(Tokens.inkTertiary)
            }
            Text(line)
                .font(.system(size: 11.5))
                .foregroundStyle(Tokens.inkTertiary)
                .multilineTextAlignment(.center)
                .fixedSize(horizontal: false, vertical: true)
            if let actionLabel, let action {
                Button(actionLabel, action: action).buttonStyle(QuietButtonStyle())
            }
        }
        .padding(.vertical, 20).padding(.horizontal, Tokens.space4)
        .frame(maxWidth: .infinity)
        .background(
            RoundedRectangle(cornerRadius: Tokens.radiusCard, style: .continuous)
                .fill(Color.white.opacity(0.04))
        )
    }
}
