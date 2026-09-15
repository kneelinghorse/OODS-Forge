#!/bin/zsh
# s202-m06 pre-freeze pass, part B1: the chart gate, run alone because it rebuilds viz-core and viz-render.
# Its receipts land under the unsealed sprint-202 boundary and are committed before part B2 assembles with --final.
set -u
cd /Users/systemsystems/.codex/worktrees/s202/OODS-Forge
OUT=artifacts/product-reality/sprint-202/m06/pre-freeze
HEAD_SHA=$(git rev-parse HEAD)
: > "$OUT/part-b-status.txt"
run() {
  local id=$1; shift
  local started=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  "$@" > "$OUT/$id.log" 2>&1
  local code=$?
  echo "$id exit=$code started=$started ended=$(date -u +%Y-%m-%dT%H:%M:%SZ) head=$HEAD_SHA" >> "$OUT/part-b-status.txt"
}
run viz-gate pnpm viz:gate artifacts/product-reality/sprint-202/m06/pre-freeze/viz-gate
echo "part-b1 done head=$HEAD_SHA" >> "$OUT/part-b-status.txt"
