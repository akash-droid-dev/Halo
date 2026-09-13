import SwiftUI

/// Timers. Entirely local: definitions live in UserDefaults, deadlines are
/// absolute dates, and nothing leaves the machine.
@MainActor
@Observable
final class TimerModule: Module {
    struct Countdown: Identifiable, Codable, Equatable {
        let id: String
        var name: String
        var duration: TimeInterval
        /// Absolute deadline, so waking from sleep recomputes rather than
        /// resuming a counter that stopped ticking.
        var endsAt: Date
        var isRunning: Bool
        var isDone: Bool
        /// Captured at the moment a timer is paused.
        var remaining: TimeInterval?

        func timeLeft(now: Date) -> TimeInterval {
            if isDone { return 0 }
            if isRunning { return max(0, endsAt.timeIntervalSince(now)) }
            return remaining ?? duration
        }
    }

    let id = "timer"
    let title = "Timers"
    let accent = Tokens.accentTimer

    private(set) var timers: [Countdown] = []
    private(set) var now: Date = .now

    var draftName: String = ""
    var draftMinutes: String = "10"

    private var ticker: Timer?
    private let storageKey = "halo.timers"

    init() { load() }

    var availability: Availability { .available }
    var preferredHeight: CGFloat { 300 }

    var activity: Activity? {
        // A finished timer is urgent and persists until acknowledged.
        if let done = timers.first(where: { $0.isDone }) {
            return Activity(
                id: id, tier: .urgent, accent: Tokens.accentShelf,
                summary: done.name, value: "Done", startedAt: .now
            )
        }
        guard let running = timers.first(where: { $0.isRunning }) else { return nil }
        return Activity(
            id: id, tier: .active, accent: accent,
            summary: running.name,
            value: Self.format(running.timeLeft(now: now)),
            startedAt: running.endsAt.addingTimeInterval(-running.duration)
        )
    }

    // MARK: Ticking

    func activate() {
        now = .now
        guard ticker == nil else { return }
        ticker = Timer.scheduledTimer(withTimeInterval: 0.25, repeats: true) { [weak self] _ in
            guard let self else { return }
            Task { @MainActor in self.tick() }
        }
    }

    func deactivate() {
        ticker?.invalidate()
        ticker = nil
    }

    private func tick() {
        now = .now
        var changed = false
        for index in timers.indices where timers[index].isRunning {
            if timers[index].endsAt <= now {
                timers[index].isRunning = false
                timers[index].isDone = true
                changed = true
            }
        }
        if changed { save() }
    }

    // MARK: Commands

    func add(name: String, minutes: Double) {
        let duration = minutes * 60
        timers.removeAll { $0.isDone }
        timers.append(
            Countdown(
                id: UUID().uuidString,
                name: name.isEmpty ? "Timer" : name,
                duration: duration,
                endsAt: .now.addingTimeInterval(duration),
                isRunning: true,
                isDone: false,
                remaining: nil
            )
        )
        draftName = ""
        save()
    }

    func toggle(_ timer: Countdown) {
        guard let index = timers.firstIndex(where: { $0.id == timer.id }) else { return }
        if timers[index].isRunning {
            timers[index].remaining = max(0, timers[index].endsAt.timeIntervalSince(.now))
            timers[index].isRunning = false
        } else {
            let left = timers[index].remaining ?? timers[index].duration
            timers[index].endsAt = .now.addingTimeInterval(left)
            timers[index].isRunning = true
            timers[index].isDone = false
            timers[index].remaining = nil
        }
        save()
    }

    func reset(_ timer: Countdown) {
        guard let index = timers.firstIndex(where: { $0.id == timer.id }) else { return }
        timers[index].endsAt = .now.addingTimeInterval(timers[index].duration)
        timers[index].isRunning = true
        timers[index].isDone = false
        timers[index].remaining = nil
        save()
    }

    func remove(_ timer: Countdown) {
        timers.removeAll { $0.id == timer.id }
        save()
    }

    // MARK: Local storage

    private func load() {
        guard
            let data = UserDefaults.standard.data(forKey: storageKey),
            let stored = try? JSONDecoder().decode([Countdown].self, from: data)
        else { return }
        // Recompute state from absolute deadlines rather than trusting flags
        // written before the machine slept.
        timers = stored.map { timer in
            var timer = timer
            if timer.isRunning && timer.endsAt <= .now {
                timer.isRunning = false
                timer.isDone = true
            }
            return timer
        }
    }

    private func save() {
        guard let data = try? JSONEncoder().encode(timers) else { return }
        UserDefaults.standard.set(data, forKey: storageKey)
    }

    static func format(_ interval: TimeInterval) -> String {
        let total = Int(interval.rounded())
        let hours = total / 3600
        let minutes = (total % 3600) / 60
        let seconds = total % 60
        return hours > 0
            ? String(format: "%d:%02d:%02d", hours, minutes, seconds)
            : String(format: "%d:%02d", minutes, seconds)
    }

    func expandedView() -> AnyView { AnyView(TimerModuleView(module: self)) }
}

@MainActor
private struct TimerModuleView: View {
    let module: TimerModule
    private let presets: [Double] = [5, 10, 25, 50]

    var body: some View {
        VStack(alignment: .leading, spacing: Tokens.space3 - 2) {
            ForEach(module.timers) { timer in
                row(timer)
            }

            VStack(alignment: .leading, spacing: 7) {
                Text("PRESETS")
                    .font(Tokens.label)
                    .tracking(0.4)
                    .foregroundStyle(Tokens.inkTertiary)
                HStack(spacing: 6) {
                    ForEach(presets, id: \.self) { minutes in
                        Button("\(Int(minutes)) min") {
                            module.add(name: "\(Int(minutes)) min focus", minutes: minutes)
                        }
                        .buttonStyle(QuietButtonStyle())
                    }
                }
            }

            HStack(spacing: 6) {
                TextField("Timer name", text: Binding(
                    get: { module.draftName },
                    set: { module.draftName = $0 }
                ))
                .textFieldStyle(.plain)
                .padding(.horizontal, 10).padding(.vertical, 7)
                .background(Tokens.raised, in: RoundedRectangle(cornerRadius: 8, style: .continuous))

                TextField("10", text: Binding(
                    get: { module.draftMinutes },
                    set: { module.draftMinutes = $0 }
                ))
                .textFieldStyle(.plain)
                .frame(width: 52)
                .padding(.horizontal, 10).padding(.vertical, 7)
                .background(Tokens.raised, in: RoundedRectangle(cornerRadius: 8, style: .continuous))

                Button("Start") {
                    module.add(
                        name: module.draftName,
                        minutes: Double(module.draftMinutes) ?? 10
                    )
                }
                .buttonStyle(PrimaryButtonStyle())
            }
            Spacer(minLength: 0)
        }
        .font(Tokens.body)
        .foregroundStyle(Tokens.inkBody)
    }

    private func row(_ timer: TimerModule.Countdown) -> some View {
        let left = timer.timeLeft(now: module.now)
        let fraction = timer.isDone ? 1 : 1 - (left / max(1, timer.duration))
        let ink: Color = timer.isDone
            ? Tokens.accentShelf
            : (timer.isRunning ? Tokens.accentTimer : Color.white.opacity(0.55))

        return HStack(spacing: 11) {
            ZStack {
                Circle()
                    .stroke(Color.white.opacity(0.14), lineWidth: 3.4)
                Circle()
                    .trim(from: 0, to: fraction)
                    .stroke(ink, style: StrokeStyle(lineWidth: 3.4, lineCap: .round))
                    .rotationEffect(.degrees(-90))
            }
            .frame(width: 38, height: 38)

            VStack(alignment: .leading, spacing: 2) {
                Text(timer.name)
                    .font(.system(size: 12.5, weight: .semibold))
                    .foregroundStyle(Tokens.inkPrimary)
                    .lineLimit(1)
                Text(timer.isDone
                     ? "Completed — reset to run again"
                     : (timer.isRunning ? "\(Int(timer.duration / 60)) min timer" : "Paused"))
                    .font(.system(size: 11.5))
                    .foregroundStyle(timer.isDone ? Tokens.accentShelf : Tokens.inkMeta)
            }

            Spacer(minLength: 0)

            Text(timer.isDone ? "Done" : TimerModule.format(left))
                .font(Tokens.readout(17))
                .foregroundStyle(ink)

            HStack(spacing: 4) {
                Button {
                    module.toggle(timer)
                } label: {
                    Image(systemName: timer.isRunning && !timer.isDone ? "pause.fill" : "play.fill")
                }
                .buttonStyle(IconButtonStyle())
                .help(timer.isRunning ? "Pause timer" : "Resume timer")

                Button {
                    module.reset(timer)
                } label: {
                    Image(systemName: "arrow.counterclockwise")
                }
                .buttonStyle(IconButtonStyle())
                .help("Reset timer")
            }
        }
        .padding(.horizontal, 11).padding(.vertical, 10)
        .background(
            RoundedRectangle(cornerRadius: Tokens.radiusCardLarge, style: .continuous)
                .fill(timer.isDone ? Tokens.accentShelf.opacity(0.12) : Tokens.raised)
        )
        .overlay(
            RoundedRectangle(cornerRadius: Tokens.radiusCardLarge, style: .continuous)
                .stroke(timer.isDone ? Tokens.accentShelf.opacity(0.3) : Tokens.hairlineSoft,
                        lineWidth: 0.5)
        )
    }
}
