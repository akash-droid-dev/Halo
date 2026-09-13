# HALO

A notch-anchored companion surface for MacBooks with a camera housing. It stays
quiet at rest, is glanceable during activity, and expands into focused module
controls on hover or click.

This repository is the web implementation of the `HALO.dc.html` interactive
prototype, built to the token, state, motion, and architecture specification in
the accompanying implementation brief.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production bundle
npm run lint
```

## What this is

The design ships as a design-canvas prototype: one 1,900-line `.dc.html` file
whose markup is driven by a `renderVals()` method returning ~200 flat, stringly
typed bindings. That is the right shape for a canvas you iterate on visually and
the wrong shape for code anyone has to maintain.

This implementation keeps the design exactly and restructures the code
underneath it:

| Prototype | Here |
| --- | --- |
| `renderVals()` returning ~200 flat bindings | Typed selectors per concern (`state/selectors.ts`) |
| `setState` scattered across 60+ closures | One typed action union and reducer (`state/reducer.ts`) |
| Activity tiers recomputed inline | `deriveActivities` — the single place the queue is derived |
| ~1,900 lines of inline `style="…"` | CSS custom properties and component stylesheets |
| `style-hover` / `style-focus` attributes | Real `:hover` / `:focus-visible` rules |
| Geometry literals at the call site | `islandGeometry()` driven by the state table |
| One file | 16 modules behind a registry, 8 primitives, 12 settings panes |

Stack: React 18, TypeScript (strict, `noUncheckedIndexedAccess`), Vite. No UI
framework — the design is specific enough that one would only get in the way.

## Architecture

```
src/
  state/
    types.ts          every state shape
    constants.ts      accents, titles, heights, seed data
    initialState.ts   the demonstration scene
    reducer.ts        one typed action union, one reducer
    activities.ts     the tier queue — section 4 of the brief
    geometry.ts       island size and radius per state
    selectors.ts      derived copy and status, per surface
    context.ts        snapshot + api contexts and their hooks
    HaloContext.tsx   the provider: timers, hotkeys, runners
  components/
    primitives/       Toggle, Segment, ProgressBar, Scrubber, ListRow,
                      PermissionCard, EmptyState, KeyCombo, Icon
    island/           IslandShell, ShoulderRow, ModuleHeader, ModuleSwitcher,
                      CompactContent, PreviewRow, SecondaryChip, IslandControls
    scene/            Desktop, MenuBar, Dock, DesktopWindows, Toasts, DemoPanel
    settings/         window, declarative pane definitions, one row renderer
    onboarding/       four-step setup
  modules/            16 surfaces behind MODULE_REGISTRY
  styles/             tokens.css, global.css
  lib/                formatting, hotkeys, reduced-motion
```

Three decisions worth knowing about:

**The scheduler is the only writer of priority.** `deriveActivities` builds the
tier queue and the provider publishes one immutable snapshot per change. Views
read the snapshot; no module can promote itself. Adding a module is one registry
entry plus a file.

**Settings panes are data.** Each pane returns a list of typed `SettingRow`
values and `SettingRowView` renders all of them. A new row type is added once
rather than in twelve places.

**Collapse guards are reference-counted.** A drag, a focused field, or an open
child menu each acquire a hold and release it on exit, so overlapping
interactions cannot leave the panel stuck open.

## Island dimensions

The brief's state table sizes the island generously. It was revised to a
tighter, more restrained footprint — the island should read as part of the
hardware, not as a slab hanging off the menu bar:

| State | Brief | Here | Δ |
| --- | --- | --- | --- |
| Compact activity | 480 × 34, r15 | 436 × 30, r13 | −9% w, −12% h |
| Hover preview | 520 × 112, r24 | 452 × 92, r19 | −13% w, −18% h |
| Expanded | 560 wide, r30 | 496 wide, r24 | −11% w |
| Expanded (palette) | 620 × 392 | 548 × 336 | −12% w, −14% h |
| Centre gutter | notch + 8pt | 188 | hardware floor |

Three things made that possible without crowding the content:

**The gutter sets the floor.** A 14-inch camera housing is ~180 pt, so the
reserved centre is 188 and every state that puts content beside the housing
must clear it. At 436 wide the compact shoulders are 124 pt each, and the
left lane measures 132 against a 132 track — tight to the pixel, verified in
the browser rather than guessed.

**Internal density came down with the box.** Shoulder insets 13/16 → 12/14,
module inset 16 → 14, header 30 → 28, stack rhythm one step tighter
throughout, and the oversized readouts trimmed (battery 22 → 20, timer
19 → 17, meeting countdown 18 → 16, artwork 84 → 72). The play button stays
at exactly 44 pt — the brief's floor for a primary action, and no larger.

**Radii and elevation were retuned to the new widths.** A 30 pt radius on a
496 pt panel reads bulbous, so the ramp is 10/13/19/24; the shadow lost its
spread and gained a little density (`0 22 52 /.58` from `0 30 70 /.62`) so the
island sits close to the glass instead of floating above it.

**Each module is only as tall as its content.** Heights were re-derived from
measured content rather than scaled: media 256, timer 300, battery 230,
shelf 288, clipboard 324, apps 284, stats 286 all fit with zero overflow. The
seven that still scroll are genuine lists — the agenda, transfers, workflows,
window actions, devices, plugins, and the module grid — and the body's bottom
edge now fades over the depth of its own padding, so a list that continues
past the panel reads as continuing rather than severed, and a module that fits
loses nothing to it.

## Conformance to the brief

Verified in Chromium: all 16 module surfaces render at their heights; all 12
settings panes render; onboarding runs its four steps and closes; `⌘K`,
`⌥Space`, `⌥⇥`, `⌘P`, and `esc` all work; a pinned panel survives both `esc`
and an outside click while the close button still dismisses it; reduce-motion
collapses the expansion transition to 1 ms; reduce-transparency removes the
backdrop filters. Zero console errors across the suite.

Motion, tokens, and hit targets follow section 1 and section 3 directly: one
280 ms `cubic-bezier(.32,.72,0,1)` curve carries width, height, and radius
together; small feedback is 140 ms; accents are only ever small signals; hit
targets are 28 pt minimum and 44 pt for primary transport and join actions.

## Where this deviates, and why

**Three gaps in the prototype, fixed here.**

1. The secondary activity chip binds an `onSwitchToSecondary` handler that
   `renderVals()` never provides, so the chip is inert in the prototype. Section 4
   of the brief requires simultaneous activities to stay "reachable in one
   click", so the chip now promotes its activity to the primary slot.
2. Only `⌘K` and `esc` were wired. The Shortcuts pane documents five shortcuts,
   so `⌥Space`, `⌥⇥`, and `⌘P` are now implemented too.
3. The prototype's `collapse(fromEsc)` accepts a flag it never reads and unpins
   on `esc`. The brief says a pinned panel is left by "unpin only — outside
   clicks and esc are ignored", so `esc` is now a no-op while pinned and the
   explicit close button remains the way out.

**The geometry table is a deliberate departure.** The sizes above are smaller
than section 3 specifies. Everything that table governs structurally — five
states, one curve carrying width/height/radius together, bottom-corner-only
radii, the reserved gutter, the fixed header — is unchanged; only the
magnitudes are tighter. See *Island dimensions*.

**Two places the brief and the prototype disagree; the prototype wins.**

- The brief specifies a 44 pt module header. The prototype's is 30 pt and this
  build's is 28 pt, with every module height derived against it — a 44 pt
  header would cost each body 16 pt of content for no gain. The header is a
  fixed height either way, so the intent (content does not shift when
  switching modules) holds.
- The brief lists a Stepper primitive. Nothing in the prototype uses one, so it
  is not implemented rather than shipped as dead code.

**Scope.** The brief maps the prototype onto SwiftUI and AppKit: `NSPanel` per
notched display, `NSScreen.safeAreaInsets` geometry, `ExtensionKit` plugins,
SwiftData storage. None of that is reachable from a browser. What is implemented
here is everything above that line — the full interaction model, state machine,
scheduler, module set, and design system — as a running, inspectable reference
for the native build.

Accordingly, `NOTCH_GUTTER` is a constant rather than a measurement. On a real
display it must come from the gap between `auxiliaryTopLeftArea` and
`auxiliaryTopRightArea`; the brief is emphatic that notch size is never
hard-coded, and `ShoulderRow` already takes the gutter as a prop so a measured
value drops straight in. Passing `notched={false}` to `Island` renders the
unnotched menu-bar pill.

## Data provenance

Every module is driven by the prototype's seed data, and the interface says so:
modules reading simulated system state carry a "Demo data" chip, and each toast
names what performed the action — `Executed by prototype`, `Simulated system
action`, `Simulated permission change`. Playback, scrubbing, timers, search,
filtering, drag-and-drop onto the shelf, and every setting are genuinely
executed. The Presentation panel fires the nine OS events a browser cannot
observe.

Permission states are modelled as first-class paths rather than error cases. A
denied calendar, missing Accessibility access, a restricted screen recording, a
disconnected now-playing source, and a suspended plugin each render inline in
the module they block, with one sentence of reason and one recovery action —
never as a modal, and never taking the rest of the app down with them.
