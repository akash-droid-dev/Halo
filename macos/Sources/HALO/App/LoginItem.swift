import ServiceManagement

/// Launch at login, via `SMAppService` — the modern route, which works from
/// inside the sandbox and needs no helper bundle and no user-approved
/// privileged install.
///
/// macOS shows the app under Login Items in System Settings, where the user can
/// revoke it independently of this toggle. `isEnabled` reads the real status
/// rather than a preference we wrote, so the UI cannot drift out of step with
/// what the system actually believes.
@MainActor
enum LoginItem {
    static var isEnabled: Bool {
        SMAppService.mainApp.status == .enabled
    }

    /// True when the user has switched it off in System Settings, which we must
    /// not silently override.
    static var isDeniedByUser: Bool {
        SMAppService.mainApp.status == .requiresApproval
    }

    static func setEnabled(_ enabled: Bool) throws {
        if enabled {
            // Registering an already-registered service throws; ignore that.
            guard SMAppService.mainApp.status != .enabled else { return }
            try SMAppService.mainApp.register()
        } else {
            guard SMAppService.mainApp.status == .enabled else { return }
            try SMAppService.mainApp.unregister()
        }
    }

    /// Human-readable status for the menu.
    static var statusDescription: String {
        switch SMAppService.mainApp.status {
        case .enabled: return "Launch at login: on"
        case .requiresApproval: return "Launch at login: needs approval in System Settings"
        case .notRegistered: return "Launch at login: off"
        case .notFound: return "Launch at login: unavailable (run from /Applications)"
        @unknown default: return "Launch at login: unknown"
        }
    }
}
