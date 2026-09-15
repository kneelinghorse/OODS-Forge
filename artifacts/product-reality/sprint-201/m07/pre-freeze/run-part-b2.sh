#!/bin/zsh
# s201-m07 pre-freeze pass, part B (continued): the final bundle and its E2E. --final refuses a dirty tree, so the logs are
# written outside the worktree and copied in afterwards; the chart gate receipts were committed first (part-b-status.txt).
set -u
cd /Users/systemsystems/.codex/worktrees/s201/OODS-Forge
OUT=artifacts/product-reality/sprint-201/m07/pre-freeze
S=/private/tmp/claude-501/-Users-systemsystems-portfolio-Design-Tools-OODS-Forge/41598b2d-52aa-49c8-ac19-610fc0e20a65/scratchpad
HEAD_SHA=$(git rev-parse HEAD)
F="$S/bundle-m07"; rm -rf "$F"; mkdir -p "$F/logs"
run() {
  local id=$1; shift
  local started=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  "$@" > "$F/logs/$id.log" 2>&1
  local code=$?
  echo "$id exit=$code started=$started ended=$(date -u +%Y-%m-%dT%H:%M:%SZ) head=$HEAD_SHA" >> "$F/logs/status.txt"
}
run portable-assemble node scripts/runtime/assemble.mjs --out-dir "$F/out" --work-dir "$F/work" --final
mkdir -p "$F/extract" && tar -xzf "$F/out/forge-runtime.tar.gz" -C "$F/extract"
run portable-e2e node scripts/runtime/e2e.mjs --extract-dir "$F/extract" --repo-root "$PWD"
cp "$F/logs/portable-assemble.log" "$OUT/portable-assemble.log"; cp "$F/logs/portable-e2e.log" "$OUT/portable-e2e.log"
cp "$F/out/forge-runtime.manifest.json" "$OUT/portable-manifest.json" 2>/dev/null
cp "$F/out/forge-runtime.tar.gz.sha256" "$OUT/portable-archive.sha256" 2>/dev/null
cat "$F/logs/status.txt" >> "$OUT/part-b-status.txt"
echo "part-b2 done head=$HEAD_SHA" >> "$OUT/part-b-status.txt"
