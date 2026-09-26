#!/usr/bin/env bash
#
# Removes HALO and everything it stored. Nothing it holds lives outside these
# paths, and nothing was ever sent anywhere, so this is a complete erase.
set -euo pipefail

APP="${1:-/Applications/HALO.app}"
CONTAINER="$HOME/Library/Containers/local.halo.island"

echo "==> Quitting HALO"
osascript -e 'quit app "HALO"' 2>/dev/null || true
sleep 1

echo "==> Deregistering the login item"
# Safe if it was never registered.
osascript -e 'tell application "System Events" to delete login item "HALO"' 2>/dev/null || true

if [ -d "$APP" ]; then
  echo "==> Removing $APP"
  rm -rf "$APP"
fi

if [ -d "$CONTAINER" ]; then
  echo "==> Removing stored data at $CONTAINER"
  echo "    (timer definitions and preferences — this is everything HALO kept)"
  rm -rf "$CONTAINER"
fi

# Pre-sandbox preference file, in case an unsandboxed build ever ran.
rm -f "$HOME/Library/Preferences/local.halo.island.plist" 2>/dev/null || true

echo
echo "Done. HALO and all of its data are gone."
