// {spec}-only byte-compat control — BASELINE CAPTURE. (s172 §1g; rebased in s173 m01,
// s176 m01, and s177 m02.)
//
// Dumps artifact.certify's {spec}-only response for all 13 mark traits to
// __fixtures__/s172-certify-spec-only-baseline.json.
//
// The committed fixture is the output of code that actually ran at pristine HEAD
// `86d50ed` — s176's final commit, and s177's starting tree — BEFORE any s177 source
// change. It was captured in a detached worktree rather than by stashing, so the tree
// it measured is named by a commit and the capture is reproducible by anyone:
//
//   git worktree add --detach /tmp/wt-86d50ed 86d50ed
//   git -C /tmp/wt-86d50ed rev-parse HEAD  # must equal 86d50ed before the probe
//   cd /tmp/wt-86d50ed
//   pnpm install --frozen-lockfile
//   pnpm run build:packages   # @oods/tokens + @oods/viz-core dist — the resolution target
//   pnpm --filter @oods/mcp-server exec tsx test/tools/s172-spec-only-capture.mts
//   # then copy the fixture back into the working tree and commit it
//
// (s172 captured at `95dd57d` with `git stash push -- packages/mcp-server/src`; s173
// recaptured at `e5bf2f6` and s176 at `4f64bcf` with the worktree protocol above. Those
// baselines are superseded. Re-baselining is not a weakening of the control: each old
// baseline's declared movements are exactly the diff between consecutive captures. The
// 86d50ed capture differs from 4f64bcf in exactly the ten cells s176 declared — five
// cartesian contrastNote rewords and five renderHash additions — while every ECharts
// response is byte-identical. The old control is re-proven before the new one starts.)
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
