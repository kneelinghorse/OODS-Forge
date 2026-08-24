// {spec}-only byte-compat control — BASELINE CAPTURE. (s172 §1g; rebased in s173 m01;
// REBASED again in s176 m01.)
//
// Dumps artifact.certify's {spec}-only response for all 13 mark traits to
// __fixtures__/s172-certify-spec-only-baseline.json.
//
// The committed fixture is the output of code that actually ran at pristine HEAD
// `4f64bcf` — s175's final commit, and s176's starting tree — BEFORE any s176 source
// change. It was captured in a detached WORKTREE rather than by stashing, so the tree
// it measured is named by a commit and the capture is reproducible by anyone:
//
//   git worktree add --detach /tmp/wt-4f64bcf 4f64bcf
//   cd /tmp/wt-4f64bcf
//   pnpm install --frozen-lockfile
//   pnpm run build:packages   # @oods/tokens + @oods/viz-core dist — the resolution target
//   pnpm --filter @oods/mcp-server exec tsx test/tools/s172-spec-only-capture.mts
//   # then copy the fixture back into the working tree and commit it
//
// (s172 captured at `95dd57d` with `git stash push -- packages/mcp-server/src`; s173
// recaptured at `e5bf2f6` with the worktree protocol above. Both baselines are
// superseded. Re-baselining is not a weakening of the control: each old baseline's own
// declared movements are exactly the diff between consecutive captures — the 4f64bcf
// capture differs from e5bf2f6's in precisely the 11 strings s173–s175 declared (the
// reworded echartsA11yNote in all 8 ECharts traits + the reworded geo contrastNote in
// the 3 geo traits, cartesian byte-identical) — so the old control's claim is re-proven
// by the re-capture itself before the new one starts.)
//
// The fixture is therefore never a restatement of what a plan said it would be (rule 15).
// It is the operand of artifact.certify.spec-only-bytes.spec.ts, which asserts the split
// control: each half moves only where a mission declared it in writing — byte-identical
// wherever nothing is declared.

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
