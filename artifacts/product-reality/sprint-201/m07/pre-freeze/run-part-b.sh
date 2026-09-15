#!/bin/zsh
# s201-m07 pre-freeze pass, part B: the gates that rebuild package dists, run alone and in order:
# the chart gate (rebuilds viz-core/viz-render), then the portable bundle assembled with --final at the
# frozen head and the E2E against its extraction.
set -u
cd /Users/systemsystems/.codex/worktrees/s201/OODS-Forge
OUT=artifacts/product-reality/sprint-201/m07/pre-freeze
S=/private/tmp/claude-501/-Users-systemsystems-portfolio-Design-Tools-OODS-Forge/41598b2d-52aa-49c8-ac19-610fc0e20a65/scratchpad
HEAD_SHA=$(git rev-parse HEAD)
: > "$OUT/part-b-status.txt"
run() {
  local id=$1; shift
  local started=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  "$@" > "$OUT/$id.log" 2>&1
  local code=$?
  echo "$id exit=$code started=$started ended=$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$OUT/part-b-status.txt"
}
run viz-gate pnpm viz:gate artifacts/product-reality/sprint-201/m07/pre-freeze/viz-gate
F="$S/bundle-m07"; rm -rf "$F"; mkdir -p "$F"
run portable-assemble node scripts/runtime/assemble.mjs --out-dir "$F/out" --work-dir "$F/work" --final
mkdir -p "$F/extract" && tar -xzf "$F/out/forge-runtime.tar.gz" -C "$F/extract"
run portable-e2e node scripts/runtime/e2e.mjs --extract-dir "$F/extract" --repo-root "$PWD"
cp "$F/out/forge-runtime.manifest.json" "$OUT/portable-manifest.json" 2>/dev/null
cp "$F/out/forge-runtime.tar.gz.sha256" "$OUT/portable-archive.sha256" 2>/dev/null
echo "part-b done head=$HEAD_SHA" >> "$OUT/part-b-status.txt"
