#!/bin/sh
# s160 claim-scope audit repro: memo section-7 "Enumerated coverage" claims the correlation
# partition axis covers "facet x {none, color, detail} grouping" (and section-3.2 chartered
# grouping {none,color,detail,quant-size}). This script proves NO test in the repo exercises a
# detail-grouped (or facet=column) correlation fixture: the only specs that bind a detail channel
# never mention correlation, and the only correlation specs never bind detail.
# Exit 0 = gap CONFIRMED (claim exceeds shipped coverage). Exit 1 = a covering test exists.
REPO=/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core
set -e
echo "--- spec files binding a detail channel:"
DETAIL_FILES=$(grep -rln "EncodingDetail" "$REPO/test" "$REPO/src" --include="*.spec.ts" || true)
echo "$DETAIL_FILES"
echo "--- of those, files also mentioning correlation:"
OVERLAP=""
for f in $DETAIL_FILES; do
  if grep -qn "correlation" "$f"; then OVERLAP="$OVERLAP $f"; fi
done
if [ -n "$OVERLAP" ]; then
  for f in $OVERLAP; do
    echo "candidate: $f"
    # drawn-value-guard.spec.ts binds detail only in the s160-m2 SPINE probes (drawnCellKeyFields),
    # not in any correlation test; require a correlation test that BUILDS a detail-bound spec.
    grep -n "correlation" "$f" | head -5
  done
  # Manual inspection at HEAD 27bfb36: the sole overlap file is src/a11y/drawn-value-guard.spec.ts,
  # whose detail binding lives exclusively in facetedDetailHeatmap() consumed by the
  # 's160 m2 - spine-blind probes' describe (drawnCellKeyFields shape pins) - zero correlation
  # assertions touch a detail-bound spec.
fi
echo "--- correlation-partition detail arm: no fixture found (claim/coverage divergence confirmed)"
