# HALO for macOS

The native island: one panel per notched display, anchored to the measured
camera housing, above the menu bar, on every Space.

This is the app you actually run. The React project at the repository root is
the design reference it was built from.

Selling it later: [DISTRIBUTION.md](DISTRIBUTION.md) — read the structural
blocker at the top before spending anything.

## Requirements

- macOS 14 or later
- Xcode 15 or later (for the Swift 5.9 toolchain)
- A MacBook with a camera housing. On an unnotched display the island is
  hidden unless you opt in — see *Displays* below.

## Build and run

```bash
cd macos
./build.sh
open build/HALO.app
```

To install:

```bash
./install.sh          # builds, installs to /Applications, verifies the signature
```

Launch at login only works from `/Applications` — `SMAppService` registers the
app by its installed location — so use `install.sh` rather than running the
build in place. Turn it on from the menu-bar item.

To remove the app and everything it stored:

```bash
./uninstall.sh
```

HALO has no Dock icon. It appears as a small item in the menu bar, which is
where you quit it from.

`build.sh` always code-signs, because App Sandbox is only enforced on a signed
binary — an unsigned build would silently lose the offline guarantee. It signs
ad-hoc by default, which is fine on your own machine; set `IDENTITY` to a
Developer ID to sign for anyone else.

The script fails the build if a network entitlement ever appears in the
signature. See [PRIVACY.md](PRIVACY.md).

## What works today

| | |
| --- | --- |
| Shell | NSPanel per notched screen, above the menu bar, all Spaces, full-screen auxiliary |
| Geometry | measured from `NSScreen.safeAreaInsets` and the auxiliary top areas — never hard-coded |
| Hit testing | clicks outside the drawn silhouette pass through to the desktop |
| States | rest, compact, hover preview (with hover intent), expanded, pinned |
| Motion | one spring carries width, height and radius; honours system reduce-motion |
| Modules | **Power** (IOKit) and **Timers** (local) |
| Shortcuts | `⌥Space` open · `⌥⇥` next activity · `⌘P` pin (global, via `RegisterEventHotKey`) · `esc` dismiss (panel-local only) |
| Multi-display | panel set rebuilt on `didChangeScreenParametersNotification` |
| Sleep | deadlines recomputed from absolute dates on wake, not resumed |

Power and Timers were chosen first deliberately: neither needs a permission
prompt, and neither touches personal data. They prove the shell end to end
without asking you for anything.

## Architecture

```
Sources/HALO/
  App/
    HALOApp.swift          @main, NSApplicationDelegate, menu-bar item, shortcuts
    AppState.swift         one @Observable source of truth; collapse guards
    ActivityScheduler.swift the tier queue — the only writer of priority
  Shell/
    NotchGeometry.swift    per-screen measurement
    IslandPanel.swift      the NSPanel and its window behaviour
    PanelController.swift  one panel per screen; rebuild on screen change
    PassthroughView.swift  hit-test mask following the animated silhouette
  Design/
    Tokens.swift           the token layer, ported from tokens.css
    Motion.swift           springs, plus system reduce-motion tracking
  Components/
    IslandView.swift       the shell: geometry, shoulders, header, panel
    Primitives.swift       button styles, PermissionCard, EmptyState
  Modules/
    Module.swift           the protocol every module conforms to
    BatteryModule.swift
    TimerModule.swift
  Integrations/
    BatteryService.swift   IOKit power source
```

Two rules hold the design together, same as the web reference:

**The scheduler is the only writer of priority.** Modules publish an `Activity`
with a tier; `ActivityScheduler` sorts them and decides what the island shows.
No module can promote itself.

**Nothing in the view layer talks to an integration.** Modules own their
stores; views read the module. An integration behind `Availability` reports
`.unavailable(reason:)` with a string the UI renders verbatim, so a missing
capability explains itself instead of failing silently.

## Adding a module

1. Conform to `Module` — `id`, `title`, `accent`, `activity`, `availability`,
   `preferredHeight`, `expandedView()`.
2. Add it to the `modules` array in `AppState.init`.
3. If it needs an OS capability, put that behind a service in `Integrations/`
   that returns `Availability`, and request access at the point of use.

Nothing in `Shell/` or `Components/` needs to change.

Three lifecycle hooks, all optional, all with no-op defaults:

| | |
| --- | --- |
| `activate()` | the panel became visible — start your own polling |
| `deactivate()` | it was dismissed — stop polling |
| `refresh()` | one scheduler pass (1s). **Must be cheap and do no I/O**: fold in what your own polling already produced. |

Keep `activity` *equal* between passes when nothing changed — including its
`startedAt`. An activity that differs every tick reassigns the queue and
re-renders the island for nothing.

## Displays

Unnotched displays are skipped by default. To show the menu-bar pill there:

```bash
defaults write local.halo.island halo.showOnUnnotched -bool true
```

Reconnecting or rescaling a display rebuilds the panel set and re-measures
every screen.

## Shortcuts

`⌥Space`, `⌥⇥` and `⌘P` are registered with Carbon's `RegisterEventHotKey`,
which works system-wide and needs no Accessibility permission. A local
`NSEvent` monitor would not do: HALO is an accessory app that is almost never
frontmost, and local monitors only fire while it is.

Deliberately *not* a global hotkey: `esc`. Swallowing Escape system-wide would
be hostile, so it is handled only while the panel itself has focus — the one
moment it means "dismiss this".

A shortcut already claimed by another app simply fails to bind; clicking the
island still works.

## Known limits

- **Window management is not possible** under the sandbox. The Accessibility
  API is unavailable to sandboxed apps, and the offline guarantee took
  priority. See PRIVACY.md.
- **Layering above some full-screen contexts is not guaranteed** by
  `.fullScreenAuxiliary`. Validate on your own machine before relying on it;
  the fallback is the compact state plus notifications.
- **Cross-app now-playing has no single documented API**, which the brief flags
  for investigation. It will land as per-app adapters, each declaring its own
  availability.
