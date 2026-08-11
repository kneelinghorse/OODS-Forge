// {spec}-only byte-compat control — BASELINE CAPTURE. (s172 §1g; REBASED in s173 m01.)
//
// Dumps artifact.certify's {spec}-only response for all 13 mark traits to
// __fixtures__/s172-certify-spec-only-baseline.json.
//
// The committed fixture is the output of code that actually ran at pristine HEAD
// `e5bf2f6` — s172's final commit, and s173's starting tree — BEFORE any s173 source
// change. It was captured in a detached WORKTREE rather than by stashing, so the tree
// it measured is named by a commit and the capture is reproducible by anyone:
//
//   git worktree add --detach /tmp/wt-e5bf2f6 e5bf2f6
//   cd /tmp/wt-e5bf2f6
//   pnpm install --frozen-lockfile
//   pnpm run build:packages   # @oods/tokens + @oods/viz-core dist — the resolution target
//   pnpm --filter @oods/mcp-server exec tsx test/tools/s172-spec-only-capture.mts
//   # then copy the fixture back into the working tree and commit it
//
// (s172 captured at `95dd57d` with `git stash push -- packages/mcp-server/src`; that
// baseline is superseded. Re-baselining is not a weakening of the control: the s172
// baseline's own declared movements — the two operand-absent notes, the a11y reword and
// the geo contrastNote reword — are exactly the diff between the two captures, so the
// old control's claim is re-proven by the re-capture itself before the new one starts.)
//
// The fixture is therefore never a restatement of what a plan said it would be (rule 15).
// It is the operand of artifact.certify.spec-only-bytes.spec.ts, which asserts the split
// control: cartesian responses byte-identical end-to-sprint; ECharts responses identical
// except for the enumerated notes[]/contrastNote movement.

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
