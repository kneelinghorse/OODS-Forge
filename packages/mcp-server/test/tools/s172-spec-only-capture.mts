// s172 §1g byte-compat control — BASELINE CAPTURE.
//
// Dumps artifact.certify's {spec}-only response for all 13 mark traits to
// __fixtures__/s172-certify-spec-only-baseline.json. Run ONCE against pristine HEAD
// (95dd57d, before any s172 source change) with:
//
//   git stash push -- packages/mcp-server/src
//   pnpm --filter @oods/mcp-server exec tsx test/tools/s172-spec-only-capture.mts
//   git stash pop
//
// The committed fixture is therefore the output of code that actually ran BEFORE the
// sprint — not a restatement of what the plan said it would be (rule 15). It is the
// operand of artifact.certify.spec-only-bytes.spec.ts, which asserts the split control:
// cartesian responses byte-identical end-to-sprint; ECharts responses identical except
// for the enumerated notes[] movement.

import { writeFileSync } from 'node:fs';
import { buildVizSpecFromRows, type NormalizedVizSpec } from '@oods/viz-core';
import { handle } from '../../src/tools/artifact.certify.js';
import { SPEC_ONLY_CASES } from './s172-spec-only-cases.js';

const out: Record<string, unknown> = {};
for (const [trait, spec] of Object.entries(SPEC_ONLY_CASES(buildVizSpecFromRows))) {
  out[trait] = await handle({ spec: spec as NormalizedVizSpec });
}

const target = new URL('./__fixtures__/s172-certify-spec-only-baseline.json', import.meta.url);
writeFileSync(target, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
// eslint-disable-next-line no-console
console.log(`wrote ${Object.keys(out).length} trait responses to ${target.pathname}`);
