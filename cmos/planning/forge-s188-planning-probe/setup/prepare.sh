#!/bin/zsh
W=/Users/systemsystems/.codex/worktrees/s188/OODS-Forge
S=$W/cmos/planning/forge-s188-planning-probe/setup
cd "$W" || exit 1
echo "start $(date -u +%FT%TZ) head=$(git rev-parse HEAD)" > "$S/status.txt"
pnpm install --frozen-lockfile > "$S/install.log" 2>&1 || { echo "install FAILED $(date -u +%FT%TZ)" >> "$S/status.txt"; exit 1; }
echo "install ok $(date -u +%FT%TZ)" >> "$S/status.txt"
pnpm run build:tokens > "$S/tokens-build.log" 2>&1 || { echo "tokens FAILED" >> "$S/status.txt"; exit 1; }
echo "tokens ok $(date -u +%FT%TZ)" >> "$S/status.txt"
pnpm run build:packages > "$S/packages-build.log" 2>&1 || { echo "packages FAILED" >> "$S/status.txt"; exit 1; }
echo "packages ok $(date -u +%FT%TZ)" >> "$S/status.txt"
pnpm run pkg:build > "$S/pkg-build.log" 2>&1 || { echo "pkg FAILED" >> "$S/status.txt"; exit 1; }
echo "pkg ok $(date -u +%FT%TZ)" >> "$S/status.txt"
node "$W/cmos/planning/forge-s188-planning-probe/fresh-composition-census.mjs" "$W" "$W/cmos/planning/forge-s188-planning-probe/fresh-composition-census.json" > "$S/census.log" 2>&1
echo "census exit=$? $(date -u +%FT%TZ)" >> "$S/status.txt"
echo "done $(date -u +%FT%TZ)" >> "$S/status.txt"
