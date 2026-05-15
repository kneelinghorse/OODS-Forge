#!/usr/bin/env bash
# Sync vendored Concordance contracts from a checkout of diverge-and-concord.
#
# Vendoring list is authoritative per cmos/foundational-docs/technical/concordance-integration.md §"Vendoring Plan":
#   1. manifest.schema.json
#   2. api/*.schema.json (3 files today)
#   3. recipes/*.json (4 recipes)
#   4. pragmatic-roles.json
#   5. edge-types.json
#   6. task-types.json
#
# Upstream files outside this list (relational-traversal.json, task-role-affinity.json,
# fixtures/, README.md) are NOT vendored. Adding any of them requires a follow-on
# decision per the spec.
#
# Source location:
#   $CONCORDANCE_CONTRACTS_ROOT (override)
#   ../../../../diverge-and-concord/contracts (default, sibling checkout)
#
# Destination: packages/mcp-server/src/concordance/contracts/
#
# After sync, the T1 byte-parity test asserts every vendored file is byte-identical
# to its upstream source. Drift = CI failure.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PKG_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DEFAULT_SRC="$(cd "$PKG_ROOT/../.." && pwd)/../diverge-and-concord/contracts"
SRC_ROOT="${CONCORDANCE_CONTRACTS_ROOT:-$DEFAULT_SRC}"
# CONCORDANCE_SYNC_DEST lets T1 (byte-parity test) sync into a temp dir for a
# round-trip diff against the committed vendored copy. Default is the canonical
# committed location.
DEST_ROOT="${CONCORDANCE_SYNC_DEST:-$PKG_ROOT/src/concordance/contracts}"

if [[ ! -d "$SRC_ROOT" ]]; then
  echo "fatal: Concordance contracts source not found at $SRC_ROOT" >&2
  echo "  set CONCORDANCE_CONTRACTS_ROOT or check out diverge-and-concord as a sibling repo" >&2
  exit 1
fi

echo "syncing Concordance contracts:"
echo "  source: $SRC_ROOT"
echo "  dest:   $DEST_ROOT"

rm -rf "$DEST_ROOT"
mkdir -p "$DEST_ROOT/api" "$DEST_ROOT/recipes"

cp -p "$SRC_ROOT/manifest.schema.json"  "$DEST_ROOT/"
cp -p "$SRC_ROOT/pragmatic-roles.json"  "$DEST_ROOT/"
cp -p "$SRC_ROOT/edge-types.json"       "$DEST_ROOT/"
cp -p "$SRC_ROOT/task-types.json"       "$DEST_ROOT/"

for f in "$SRC_ROOT"/api/*.schema.json; do
  cp -p "$f" "$DEST_ROOT/api/"
done

for f in "$SRC_ROOT"/recipes/*.json; do
  cp -p "$f" "$DEST_ROOT/recipes/"
done

echo "done."
echo "vendored files:"
(cd "$DEST_ROOT" && find . -type f | sort)
