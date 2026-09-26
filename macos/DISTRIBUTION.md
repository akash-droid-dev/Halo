# Shipping HALO

Notes for selling this, written while the app is still two modules and a
shell. Figures marked ⚠️ change — verify them in App Store Connect rather than
trusting this file.

## The structural blocker, first

**A SwiftPM executable with a hand-assembled bundle cannot be submitted to the
App Store.** App Store Connect accepts an `.xcarchive` produced by
`xcodebuild`, with a provisioning profile and an Apple Distribution signature.
`build.sh` produces a correct app for *your own machine* and nothing more.

So the first real task is not marketing, it is converting `macos/` into an
Xcode project (or an `xcodebuild`-drivable app target). The Swift sources move
across unchanged; it is the packaging that has to change. Budget this before
anything else — it is the gate everything else sits behind.

## The two channels

|  | Mac App Store | Direct (Developer ID + notarised) |
| --- | --- | --- |
| Sandbox | required | optional |
| Window management | **impossible** — Accessibility is barred in the sandbox | possible |
| Your cut of ₹999 | ~₹720 at 15%, ~₹593 at 30% ⚠️ | ~₹900–950 after processor fees ⚠️ |
| Payments, GST, invoicing | Apple is merchant of record | yours to arrange |
| Discovery | search, charts, Mac App Store | none — you drive all of it |
| Updates | automatic | you ship it (Sparkle, or similar) |
| Review | every release | notarisation only, automated |
| Piracy | handled | your problem |

Apple takes 30% by default and 15% under the Small Business Program, which
applies below US$1M proceeds in the prior calendar year — you would qualify.
In India Apple collects GST and remits it, so the ₹999 a customer pays is
inclusive; proceeds are computed on the ex-GST amount.

Costs either way: **Apple Developer Program, US$99/year** ⚠️, billed in INR.
For a paid app you also complete the Paid Applications Agreement plus banking
and tax details (PAN, and GST registration if applicable).

## "Any Mac user, notch or not" — a real work item

Right now unnotched displays are skipped, and the only way to enable them is:

```bash
defaults write local.halo.island halo.showOnUnnotched -bool true
```

A hidden `defaults write` is fine for your own machine and unacceptable in a
paid app. Half your addressable market — every iMac, Mac mini, Mac Studio, Air
and Pro on an external display — currently sees nothing after paying.

Before selling, the unnotched path has to become the first-class one: a
menu-bar pill with all four corners rounded, offset below the menu bar, no
centre gutter, same modules and same motion. The code already takes a path for
it — `Island(notched: false)` and `NotchGeometry.isNotched` — but it is
untested and unreachable from the UI. Treat it as a headline feature, not a
fallback.

## What the sandbox costs you, permanently

The privacy guarantee and the feature set pull against each other. On the App
Store the sandbox is mandatory, so these are settled rather than open:

| Module | On the App Store |
| --- | --- |
| Power, Timers | fine — no permission at all |
| Meetings | fine — EventKit works sandboxed with a usage description |
| Clipboard | fine — pasteboard polling is permitted |
| File Shelf | fine — user-selected files plus scoped bookmarks |
| Quick Actions | partly — opening apps is fine, arbitrary scripting is not |
| System, Devices | partly — some IOKit reads are restricted in the sandbox |
| **Windows** | **never.** Accessibility is unavailable to sandboxed apps |
| **Now Playing** | **doubtful.** Reading another app's playback needs Apple Events, so `temporary-exception.apple-events`, which review scrutinises heavily |
| AI Actions | cut by your own rule, and it needs network we do not have |

Now Playing is worth calling out: the brief already flagged cross-app
now-playing as unverified, and it is the feature people most expect from a
notch app. If it cannot ship, the product story has to stand on Meetings,
Timers, Clipboard and the Shelf. Decide that before you price it.

If window management and now-playing turn out to be the reason people would
pay, that argues for direct distribution and against the App Store — a
decision to make deliberately, not discover at review.

## Review risk, honestly

The app uses only public API and asks for almost no entitlements, which is the
strongest position you can be in. There is no guideline against drawing near
the camera housing, and utilities that draw above the menu bar do exist on the
Mac App Store.

That said, nobody can promise an outcome. The realistic risks are:

- **Guideline 2.5.1, public APIs only.** We comply. Keep it that way — a
  private API to make now-playing work would be rejected and is not worth it.
- **Guideline 4.0, design.** Anything that reads as mimicking or altering
  system UI invites questions. Expect to explain the notch placement.
- **Entitlement justification.** Every entitlement needs a reason. Ours are
  minimal; adding `temporary-exception.*` is where trouble starts.
- **Thin functionality.** Two modules would likely be rejected as not doing
  enough for a paid app. Ship Meetings, Clipboard and the Shelf first.

## Your privacy rule becomes a product claim

Today "no data leaves this Mac" protects you. Sold to others, it is a
marketing asset and a promise you are accountable for.

The App Store privacy label would read **Data Not Collected** — rare for a
paid utility, and worth leading with. Holding that means:

- No analytics, ever. Not "anonymous" analytics either; the label is binary.
- No crash reporting to a third party. Use Apple's, which the user opts into.
- No update check of your own on the App Store — the store handles it.
- If you ever go direct, license validation wants a network call. Use **offline
  license keys**: a key signed by you, verified locally against a public key
  embedded in the app. It keeps the label honest and works on a plane.

The enforcement already in the repo — the absent entitlement, the failing
build if it reappears, the CI check — exists so this claim cannot rot as the
app grows. Do not weaken it for a feature.

## Rough order of work

1. Convert `macos/` to an Xcode project that archives. Nothing else is possible first.
2. Make the unnotched menu-bar pill a real, tested, discoverable mode.
3. Ship Meetings (EventKit), Clipboard, and File Shelf — enough to justify a price.
4. Settle Now Playing: per-app adapters, or drop it and say so plainly.
5. App icon at every size, screenshots on both a notched and unnotched Mac.
6. Developer Program, Paid Applications Agreement, banking and tax.
7. Privacy label: Data Not Collected. Support and privacy-policy URLs.
8. TestFlight for macOS with a handful of real users before submitting.

## If you want the fastest honest path

Direct distribution, notarised, with offline license keys, sold from a single
page. No review, no 15–30%, full capability including window management, and
the privacy claim stays intact. You give up discovery, and you own support.

The App Store is the better choice only if discovery is what you are buying —
and in that case start at step 1 above, because everything else is downstream
of it.
