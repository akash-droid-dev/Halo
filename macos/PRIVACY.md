# Privacy

HALO is built so that "your data does not leave this Mac" is a property macOS
enforces, not a promise this file makes.

## The guarantee

`HALO.entitlements` grants `com.apple.security.app-sandbox` and **does not**
grant `com.apple.security.network.client`. Inside the App Sandbox, a process
without that entitlement cannot open an outbound socket — the kernel refuses
it. There is no configuration, bug, or dependency that can turn that back on at
runtime.

That entitlement is absent rather than set to `false` on purpose. Absent means
"never granted". Anything that appears to need it does not belong in this app.

Also deliberately absent: `network.server`, `device.camera`,
`device.microphone`, `device.usb`, `personal-information.addressbook`,
`personal-information.location`, and photo library access.

## Verify it yourself

Do not take the above on trust:

```bash
./build.sh            # always signs; refuses to produce an unsigned build
./verify-offline.sh   # prints the signed entitlements and linked libraries
```

`verify-offline.sh` reports the sandbox state, greps the signature for any
network entitlement, lists linked libraries, and scans the binary for
networking symbols. At runtime:

```bash
sudo lsof -i -a -c HALO      # expect no output, ever
```

If you want belt and braces, add a deny-all rule for HALO in Little Snitch or
LuLu. It will never fire, which is the point.

## What is stored, and where

| Data | Where | Leaves the Mac |
| --- | --- | --- |
| Timer definitions | `UserDefaults` (app container) | No |
| Hover intent, display preferences | `UserDefaults` (app container) | No |
| Battery level, charge state | Read from IOKit, never written | No |

Everything lives in the sandbox container at
`~/Library/Containers/local.halo.island/`. Deleting the app's container erases
all of it.

There is no analytics, no crash reporting, no update check, no license check,
and no remote configuration. The app makes no requests at launch or ever,
because it cannot.

## Modules and the rule

Permissions are requested per module, at the moment the feature needs them —
never at launch, and never for a module you have not enabled.

| Module | Access needed | Data involved | Status |
| --- | --- | --- | --- |
| Power | none | battery level — not personal | shipping |
| Timers | none | names you type, stored locally | shipping |
| Meetings | Calendar (EventKit) | event titles, times, attendees | not yet wired |
| Now Playing | per-app integration | what you are listening to | not yet wired |
| File Shelf | user-selected files only | filenames you drag in | not yet wired |
| Clipboard | none, but sensitive | whatever you copy | not yet wired |
| Windows | Accessibility | window titles | blocked by the sandbox — see below |
| AI Actions | a provider over the network | **your selected text** | **cut** |

**AI Actions is cut, not deferred.** Its entire purpose is sending text you
selected to a provider. That is the one feature in the original design that
cannot coexist with this rule. If it ever returns, it does so against an
on-device model, and it still cannot open a socket.

**Window management is blocked by the choice above.** Driving other apps'
windows needs the Accessibility API, which a sandboxed app cannot use. That is
a real cost of the enforced guarantee: airtight offline, or window management,
not both. The guarantee won.

**Clipboard history**, when it lands, stays opt-in and off by default, skips
fields marked secure by the originating app, and stores nothing until you turn
it on.

## Your repository is public

This code lives in a public GitHub repository. Nothing personal is in it today
— no addresses, keys, or captured data. Keep it that way:

- `~/Library/Containers/local.halo.island/` is outside the repo. Never copy it in.
- Never commit a crash log, a screen recording of the island with real data in
  it, or a `UserDefaults` export.
- If you add a module that caches anything, put its cache in the container and
  add the path to `.gitignore` in the same commit.
