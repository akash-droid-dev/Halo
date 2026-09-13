import Foundation
import IOKit.ps

/// Battery and power, read from IOKit.
///
/// This integration needs no entitlement and no user permission, and the
/// values it reads are not personal data — which is why it is the first one
/// wired up.
@MainActor
@Observable
final class BatteryService {
    struct Snapshot: Equatable {
        var level: Double          // 0...1
        var isCharging: Bool
        var isPresent: Bool
        /// Minutes remaining, or nil while the estimate is unavailable.
        var minutesRemaining: Int?
    }

    private(set) var snapshot = Snapshot(
        level: 1, isCharging: false, isPresent: false, minutesRemaining: nil
    )

    private var timer: Timer?

    func start() {
        read()
        // Power state changes slowly; a 30s poll is plenty and keeps the app
        // close to idle.
        timer = Timer.scheduledTimer(withTimeInterval: 30, repeats: true) { [weak self] _ in
            Task { @MainActor in self?.read() }
        }
    }

    func stop() {
        timer?.invalidate()
        timer = nil
    }

    func read() {
        guard
            let blob = IOPSCopyPowerSourcesInfo()?.takeRetainedValue(),
            let sources = IOPSCopyPowerSourcesList(blob)?.takeRetainedValue() as? [CFTypeRef]
        else {
            snapshot.isPresent = false
            return
        }

        for source in sources {
            guard
                let description = IOPSGetPowerSourceDescription(blob, source)?
                    .takeUnretainedValue() as? [String: Any],
                let type = description[kIOPSTypeKey] as? String,
                type == kIOPSInternalBatteryType
            else { continue }

            let current = description[kIOPSCurrentCapacityKey] as? Int ?? 0
            let maximum = description[kIOPSMaxCapacityKey] as? Int ?? 100
            let charging = description[kIOPSIsChargingKey] as? Bool ?? false
            let remaining = description[kIOPSTimeToEmptyKey] as? Int

            snapshot = Snapshot(
                level: maximum > 0 ? Double(current) / Double(maximum) : 0,
                isCharging: charging,
                isPresent: true,
                // IOKit reports -1 while it is still working the estimate out.
                minutesRemaining: (remaining ?? -1) > 0 ? remaining : nil
            )
            return
        }

        snapshot.isPresent = false
    }
}
