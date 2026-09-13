import AppKit
import Carbon.HIToolbox

/// Global shortcuts via `RegisterEventHotKey`.
///
/// This is the documented route and it needs no Accessibility permission and no
/// event tap — which matters here, because a `CGEvent` tap would see every
/// keystroke on the machine and this app is built not to be able to do that.
///
/// A local `NSEvent` monitor is not sufficient: HALO is an accessory app that
/// is almost never frontmost, and local monitors only fire when it is.
@MainActor
final class GlobalHotkeys {
    struct Shortcut {
        let keyCode: UInt32
        let modifiers: UInt32
        let handler: () -> Void
    }

    private var registered: [EventHotKeyRef?] = []
    private var handlers: [UInt32: () -> Void] = [:]
    private var eventHandler: EventHandlerRef?
    private var nextID: UInt32 = 1

    /// Carbon modifier masks.
    static let command = UInt32(cmdKey)
    static let option = UInt32(optionKey)

    init() {
        installHandler()
    }

    /// Explicit teardown: `deinit` is not main-actor isolated, so it cannot
    /// touch this class's state. Called from `applicationWillTerminate`.
    func stop() {
        for hotkey in registered.compactMap({ $0 }) {
            UnregisterEventHotKey(hotkey)
        }
        registered.removeAll()
        handlers.removeAll()
        if let eventHandler {
            RemoveEventHandler(eventHandler)
            self.eventHandler = nil
        }
    }

    func register(keyCode: UInt32, modifiers: UInt32, handler: @escaping () -> Void) {
        let id = nextID
        nextID += 1
        handlers[id] = handler

        var reference: EventHotKeyRef?
        let hotKeyID = EventHotKeyID(signature: OSType(0x48414C4F), id: id) // 'HALO'
        let status = RegisterEventHotKey(
            keyCode,
            modifiers,
            hotKeyID,
            GetApplicationEventTarget(),
            0,
            &reference
        )
        if status == noErr {
            registered.append(reference)
        } else {
            // A shortcut already claimed by another app simply does not bind;
            // clicking the island still works.
            handlers.removeValue(forKey: id)
        }
    }

    private func installHandler() {
        var spec = EventTypeSpec(
            eventClass: OSType(kEventClassKeyboard),
            eventKind: UInt32(kEventHotKeyPressed)
        )

        let callback: EventHandlerUPP = { _, event, userData in
            guard let event, let userData else { return OSStatus(eventNotHandledErr) }

            var hotKeyID = EventHotKeyID()
            let status = GetEventParameter(
                event,
                EventParamName(kEventParamDirectObject),
                EventParamType(typeEventHotKeyID),
                nil,
                MemoryLayout<EventHotKeyID>.size,
                nil,
                &hotKeyID
            )
            guard status == noErr else { return OSStatus(eventNotHandledErr) }

            let manager = Unmanaged<GlobalHotkeys>.fromOpaque(userData).takeUnretainedValue()
            MainActor.assumeIsolated {
                manager.handlers[hotKeyID.id]?()
            }
            return noErr
        }

        InstallEventHandler(
            GetApplicationEventTarget(),
            callback,
            1,
            &spec,
            Unmanaged.passUnretained(self).toOpaque(),
            &eventHandler
        )
    }
}
