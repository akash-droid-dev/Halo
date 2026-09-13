#!/usr/bin/env bash
#
# Builds HALO and installs it to /Applications.
#
# Launch-at-login only works from /Applications: SMAppService registers the app
# by its installed location, so a build run from this folder reports
# "unavailable" in the menu. That is why this script exists rather than just
# telling you to double-click the build.
set -euo pipefail

cd "$(dirname "$0")"

DEST="${DEST:-/Applications}"
APP="$DEST/HALO.app"

./build.sh

if [ -d "$APP" ]; then
  echo "==> Replacing the existing install"
  # Quit the running copy first, or the replace leaves a half-updated bundle.
  osascript -e 'quit app "HALO"' 2>/dev/null || true
  sleep 1
  rm -rf "$APP"
fi

echo "==> Installing to $DEST"
cp -R build/HALO.app "$APP"

echo "==> Verifying the installed copy"
codesign --verify --deep --strict "$APP" && echo "    signature: valid"
codesign -d --entitlements :- "$APP" 2>/dev/null | grep -q app-sandbox \
  && echo "    sandbox:   on" \
  || { echo "    sandbox:   OFF — stopping" >&2; exit 1; }

echo
echo "Installed $APP"
echo
echo "Next:"
echo "  open \"$APP\""
echo "  then use the menu-bar item to turn on Launch at Login"
echo
echo "To remove it completely, including its stored timers and preferences:"
echo "  ./uninstall.sh"
