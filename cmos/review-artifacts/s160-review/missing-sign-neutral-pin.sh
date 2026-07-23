#!/bin/sh
# Repro: SSOT memo §6-m3 records "NO deviation ... incl. vacuous-pass + sign-neutral pins",
# but NO test anywhere pins the sign-neutral branch (pooledSign === 0 -> narrate,
# data-analysis.ts:1216) or the flat-groups branch (common group sign 0 + directional
# pooled -> suppress). The only "sign-neutral" hit in the whole package is the SUT comment.
REPO=/Users/systemsystems/portfolio/Design-Tools/OODS-Forge
echo '--- all sign-neutral mentions in viz-core (expect: ONLY the SUT comment, no spec file):'
rg -n "sign-neutral" "$REPO/packages/viz-core" --type ts
echo '--- spec/test files containing any correlation fixture engineered to pooled r == 0.000 with sign-consistent groups (expect: none):'
rg -ln "0\.000|pooled.*rounds to 0|sign.?neutral" "$REPO/packages/viz-core/test" "$REPO/packages/viz-core/src" --type ts | grep -i spec || echo 'NONE — the pinned policy has zero test coverage'
echo '--- the m3 harness test list (7 its, none is a sign-neutral pin):'
rg -n "^\s*it\(" "$REPO/packages/viz-core/test/a11y-drawn-value-invariant-properties-s158.spec.ts" | sed -n '10,20p'
echo '--- the m3 guard-arm test list (4 its, none is a sign-neutral pin):'
rg -n "^\s*it\(" "$REPO/packages/viz-core/src/a11y/drawn-value-guard.spec.ts"
