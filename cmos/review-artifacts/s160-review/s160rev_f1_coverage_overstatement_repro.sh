#!/bin/sh
# s160 review F1 repro — the §7/§3.2 correlation-harness coverage overstatement.
# CLAIM (memo forge-viz-s160-narrated-value-corrective-decision-memo.md):
#   §3.2: "The correlation axis (m3): facet {none,row,column} x grouping {none,color,detail,quant-size}"
#   §7:   "the correlation partition axis (facet x {none, color, detail} grouping + ...)"
# FACT: the shipped m3 harness (test/a11y-drawn-value-invariant-properties-s158.spec.ts,
# 's160 m3 — Shape B correlation sign-consistency gate') builds fixtures via scatterSpec whose ONLY
# facet knob is `facetRowField` and whose grouping knobs are colorField/sizeField — there is NO
# correlation x facet=COLUMN test and NO correlation x DETAIL-grouping test anywhere in the suite.
REPO=/Users/systemsystems/portfolio/Design-Tools/OODS-Forge
HARNESS=$REPO/packages/viz-core/test/a11y-drawn-value-invariant-properties-s158.spec.ts
echo '--- 1. the harness fixture builder only supports facetRowField (no column arm):'
rg -n "facetRowField|facetColumnField" "$HARNESS"
echo '--- 2. zero "detail" tokens in the whole harness file (no detail-grouping correlation arm):'
rg -c "detail" "$HARNESS" || echo 'rg exit=1 -> ZERO matches'
echo '--- 3. no correlation-x-columns-facet fixture anywhere in viz-core tests:'
rg -ln "columns" $REPO/packages/viz-core/test/*.spec.ts $REPO/packages/viz-core/src/a11y/*.spec.ts | while read -r f; do
  echo "  $f:"; rg -n "columns: \{ field" "$f" | sed 's/^/    /'
done
echo '(the hits above are the s159-m1 EXTREMA bar harness, the spine drawnCellKeyFields probes, and'
echo ' the adapter heatmap spec — none is a CORRELATION fixture; correlationPartitionFields is a'
echo ' SEPARATE derivation from drawnCellKeyFields, so those probes do not cover the partition.)'
echo '--- 4. both claimed-but-untested arms nevertheless WORK live (no phantom; claim/coverage divergence only):'
SCRATCH=$(dirname "$0")
node "$SCRATCH/s160rev_crossaxis_dist_probe.mjs" | rg "COLUMN-facet Simpson"
node "$SCRATCH/s160rev_crossaxis_detail_arm_probe.mjs"
