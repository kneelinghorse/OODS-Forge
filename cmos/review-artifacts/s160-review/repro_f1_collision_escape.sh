#!/bin/zsh
# s160 review — F1 repro: the provenance sweep does NOT catch an untagged raw numeric whose token
# collides with ANY tagged emission's token (undisclosed false-negative class; disclosure names only
# "label-numeral collision"). Seeds an untagged restatement of the already-narrated max into
# buildKeyFindings, proves it is LIVE in emitted text, and shows the SHIPPED 43-test sweep stays GREEN.
# Contrast: the shipped bite-proof seeded ${analysis.mean} (non-colliding) and fired — collision is the
# natural restatement-bug case and it escapes.
# Self-contained: backs up, mutates, runs, restores. Run from anywhere.
set -e
PKG=/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/viz-core
SRC=$PKG/src/a11y/narrative-generator.ts
BAK=$(mktemp /tmp/narrative-generator.XXXX.ts)
cp "$SRC" "$BAK"
cleanup() { cp "$BAK" "$SRC"; rm -f "$PKG/src/a11y/__s160rev_f1_liveness.spec.ts"; echo "[restored]"; }
trap cleanup EXIT

python3 - "$SRC" <<'EOF'
import sys
p = sys.argv[1]
s = open(p).read()
s = s.replace(
  "import { formatPercent, humanize, narrateNumber } from './format.js';",
  "import { formatNumeric, formatPercent, humanize, narrateNumber } from './format.js';")
anchor = "  if (analysis.colorCategories.length > 0 && labels.colorLabel) {"
seed = ("  // F1 SEED: UNTAGGED raw restatement of the already-narrated max (colliding token).\n"
        "  if (analysis.max) {\n"
        "    findings.push(`Peak reading ${formatNumeric(analysis.max.value)}`);\n"
        "  }\n")
assert anchor in s and seed not in s
s = s.replace(anchor, seed + anchor, 1)
open(p, 'w').write(s)
print("[seeded]")
EOF

cat > "$PKG/src/a11y/__s160rev_f1_liveness.spec.ts" <<'EOF'
import { describe, expect, it } from 'vitest';
import { generateNarrativeSummary } from './narrative-generator.js';
import type { NormalizedVizSpec } from '../spec/normalized-viz-spec.js';
describe('F1 liveness', () => {
  it('untagged "Peak reading 30" ships in keyFindings', () => {
    const spec = {
      $schema: 'https://oods.dev/viz-spec/v1', id: 'live', name: 'live',
      data: { name: 'd', values: [{ cat: 'a', v: 10 }, { cat: 'a', v: 20 }, { cat: 'b', v: 5 }] },
      marks: [{ trait: 'MarkBar', encodings: { x: { field: 'cat', trait: 'EncodingX', scale: 'band' }, y: { field: 'v', trait: 'EncodingY', aggregate: 'sum' } } }],
      encoding: { x: { field: 'cat', trait: 'EncodingX', scale: 'band' }, y: { field: 'v', trait: 'EncodingY', aggregate: 'sum' } },
      a11y: { description: 'live' },
    } as unknown as NormalizedVizSpec;
    const result = generateNarrativeSummary(spec);
    console.log('keyFindings:', JSON.stringify(result.keyFindings));
    expect(result.keyFindings.some((f) => f === 'Peak reading 30')).toBe(true);
  });
});
EOF

cd "$PKG"
echo "=== liveness (untagged numeric IS in emitted text) ==="
pnpm exec vitest run src/a11y/__s160rev_f1_liveness.spec.ts 2>&1 | grep -E "keyFindings:|Tests "
echo "=== shipped provenance sweep with the untagged numeric live (EXPECT 43 passed = ESCAPE) ==="
pnpm exec vitest run test/narrated-value-provenance-sweep-s160.spec.ts 2>&1 | grep -E "Tests |FAIL|×" | head -5
