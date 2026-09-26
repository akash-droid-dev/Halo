#!/usr/bin/env bash
#
# Builds HALO.app: compiles the executable, assembles the bundle, and signs it
# with the sandbox entitlements.
#
# The signature is what makes the privacy guarantee real. App Sandbox is only
# enforced on a signed binary, so an unsigned build would silently lose the
# "cannot reach the network" property. This script always signs.
set -euo pipefail

cd "$(dirname "$0")"

CONFIG="${CONFIG:-release}"
APP="build/HALO.app"

echo "==> Compiling ($CONFIG)"
swift build -c "$CONFIG"
BIN="$(swift build -c "$CONFIG" --show-bin-path)/HALO"

echo "==> Assembling bundle"
rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"
cp "$BIN" "$APP/Contents/MacOS/HALO"
cp Info.plist "$APP/Contents/Info.plist"
printf 'APPL????' > "$APP/Contents/PkgInfo"

echo "==> Signing with sandbox entitlements"
# An ad-hoc signature is enough for personal use on this machine. For anything
# you hand to someone else, replace "-" with your Developer ID identity.
IDENTITY="${IDENTITY:--}"
codesign --force --sign "$IDENTITY" \
  --entitlements HALO.entitlements \
  --options runtime \
  --timestamp=none \
  "$APP"

echo "==> Verifying the sandbox is on and the network is not"
codesign -d --entitlements :- "$APP" 2>/dev/null > build/entitlements.actual.xml || true

if ! grep -q "com.apple.security.app-sandbox" build/entitlements.actual.xml; then
  echo "FAIL: sandbox entitlement missing from the signature" >&2
  exit 1
fi
if grep -q "com.apple.security.network" build/entitlements.actual.xml; then
  echo "FAIL: a network entitlement is present — refusing to ship this build" >&2
  grep "network" build/entitlements.actual.xml >&2
  exit 1
fi

echo
echo "Built $APP"
echo "  sandbox : on"
echo "  network : no entitlement — outbound connections refused by the kernel"
echo
echo "Run it:   open $APP"
echo "Install:  cp -R $APP /Applications/"
