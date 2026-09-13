import SwiftUI

/// Power: charge level, state, and estimate. Reads IOKit only — no permission,
/// no personal data.
@MainActor
@Observable
final class BatteryModule: Module {
    let id = "battery"
    let title = "Power"
    let accent = Tokens.accentPower

    private let service: BatteryService

    /// When the current power state began. Held stable so the activity stays
    /// equal between reads — otherwise the queue churns every tick.
    private var stateSince: Date = .now
    private var lastCharging: Bool?

    init(service: BatteryService) {
        self.service = service
    }

    var availability: Availability {
        service.snapshot.isPresent
            ? .available
            : .unavailable(reason: "No internal battery on this Mac.")
    }

    var preferredHeight: CGFloat { 230 }

    var activity: Activity? {
        let snapshot = service.snapshot
        guard snapshot.isPresent else { return nil }

        // Power is passive information unless it needs attention.
        let low = snapshot.level <= 0.2 && !snapshot.isCharging
        guard snapshot.isCharging || low else { return nil }

        return Activity(
            id: id,
            tier: .passive,
            accent: low ? Tokens.accentUrgent : accent,
            summary: snapshot.isCharging ? "Charging" : "Low battery",
            value: "\(Int((snapshot.level * 100).rounded()))%",
            startedAt: stateSince
        )
    }

    func activate() { service.read() }

    func refresh() {
        // Restamp only when the charge state actually flips, so the activity
        // stays equal between passes and the queue does not churn.
        guard lastCharging != service.snapshot.isCharging else { return }
        lastCharging = service.snapshot.isCharging
        stateSince = .now
    }

    func expandedView() -> AnyView {
        AnyView(BatteryModuleView(service: service))
    }
}

private struct BatteryModuleView: View {
    let service: BatteryService

    private var level: Int { Int((service.snapshot.level * 100).rounded()) }
    private var isLow: Bool { service.snapshot.level <= 0.2 && !service.snapshot.isCharging }

    private var fillColor: Color {
        if service.snapshot.isCharging { return Tokens.accentPower }
        return isLow ? Tokens.accentUrgent : Color.white.opacity(0.85)
    }

    private var statusText: String {
        if service.snapshot.isCharging { return "Charging" }
        return isLow ? "Low battery" : "On battery power"
    }

    private var estimateText: String {
        if service.snapshot.isCharging {
            return "Time estimate unavailable while charging stabilises"
        }
        guard let minutes = service.snapshot.minutesRemaining else {
            return "Estimating time remaining…"
        }
        let hours = minutes / 60
        let rest = minutes % 60
        return hours > 0
            ? "About \(hours) hr \(rest) min remaining"
            : "About \(rest) min remaining"
    }

    var body: some View {
        VStack(alignment: .leading, spacing: Tokens.space3) {
            HStack(spacing: Tokens.space3 + 2) {
                gauge
                VStack(alignment: .leading, spacing: 3) {
                    Text("\(level)%")
                        .font(Tokens.readout(20))
                        .foregroundStyle(Tokens.inkPrimary)
                    Text(statusText)
                        .font(Tokens.body)
                        .foregroundStyle(
                            service.snapshot.isCharging
                                ? Tokens.accentPower
                                : (isLow ? Tokens.accentUrgent : Tokens.inkSecondary)
                        )
                    Text(estimateText)
                        .font(Tokens.meta)
                        .foregroundStyle(Tokens.inkTertiary)
                }
                Spacer(minLength: 0)
            }
            Spacer(minLength: 0)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var gauge: some View {
        ZStack {
            RoundedRectangle(cornerRadius: Tokens.radiusControl, style: .continuous)
                .stroke(Color.white.opacity(0.5), lineWidth: 1.6)
                .frame(width: 58, height: 28)

            HStack(spacing: 0) {
                RoundedRectangle(cornerRadius: 4, style: .continuous)
                    .fill(fillColor)
                    // Never let the fill vanish entirely — it still reads as a gauge.
                    .frame(width: max(6, 52 * service.snapshot.level))
                Spacer(minLength: 0)
            }
            .frame(width: 52, height: 22)

            if service.snapshot.isCharging {
                Image(systemName: "bolt.fill")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundStyle(.black)
            }
        }
        .overlay(alignment: .trailing) {
            UnevenRoundedRectangle(
                topLeadingRadius: 0, bottomLeadingRadius: 0,
                bottomTrailingRadius: 2, topTrailingRadius: 2
            )
            .fill(Color.white.opacity(0.5))
            .frame(width: 3, height: 11)
            .offset(x: 5)
        }
        .animation(Motion.feedback, value: service.snapshot.level)
    }
}
