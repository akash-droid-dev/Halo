#!/usr/bin/env bash
#
# Independent check that a built HALO.app cannot talk to the network.
#
# Run this yourself rather than taking the README's word for it. It inspects the
# signed entitlements, then looks for any networking symbol linked into the
# binary.
set -euo pipefail

cd "$(dirname "$0")"
APP="${1:-build/HALO.app}"
BIN="$APP/Contents/MacOS/HALO"

[ -x "$BIN" ] || { echo "No binary at $BIN — run ./build.sh first" >&2; exit 1; }

echo "==> Signed entitlements"
codesign -d --entitlements :- "$APP" 2>/dev/null | sed 's/^/    /'

echo
echo "==> Sandbox status"
if codesign -d --entitlements :- "$APP" 2>/dev/null | grep -q app-sandbox; then
  echo "    sandbox: ON"
else
  echo "    sandbox: OFF  <-- the offline guarantee is NOT enforced"
fi

echo
echo "==> Network entitlements (expect none)"
if codesign -d --entitlements :- "$APP" 2>/dev/null | grep -i network; then
  echo "    ^^ present. This build can open sockets."
else
  echo "    none"
fi

echo
echo "==> Linked libraries"
otool -L "$BIN" | tail -n +2 | sed 's/^/    /'

echo
echo "==> Networking symbols referenced by the binary (expect none)"
if nm -u "$BIN" 2>/dev/null | grep -iE "CFURL(Session|Connection)|NSURLSession|_socket|_connect\$|CFSocket|CFStream|getaddrinfo" ; then
  echo "    ^^ found. Investigate before trusting this build."
else
  echo "    none"
fi

echo
echo "To watch it at runtime, run HALO and confirm it never appears in:"
echo "    sudo lsof -i -a -c HALO"
