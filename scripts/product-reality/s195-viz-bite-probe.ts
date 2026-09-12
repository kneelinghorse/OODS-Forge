/** Real public contrast proof used by the physical palette-bake bite. */
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { handle as render } from '../../packages/mcp-server/src/tools/viz.render.js';
import { handle as certify } from '../../packages/mcp-server/src/tools/artifact.certify.js';
import type { VizRenderInput } from '../../packages/mcp-server/src/schemas/generated.js';

const failing = process.argv.includes('--expect-fail');
assert(failing || process.argv.includes('--expect-pass'), 'Select the expected physical palette state');
const input: VizRenderInput = { chartType: 'bar', name: 'Six-category palette bite', rows: [{ category: 'a', value: 10 }, ...['b', 'c', 'd', 'e', 'f'].map(category => ({ category, value: 10 }))],
  encodings: { x: { field: 'category', scale: 'band' as const }, y: { field: 'value', aggregate: 'sum' as const }, color: { field: 'category' } },
  theme: 'light' as const, brand: 'A' as const, output: { svg: true, includeNormalizedSpec: true } };
const rendered = await render(input);
assert.equal(rendered.status, 'ok', JSON.stringify(rendered.errors));
assert(rendered.svg && rendered.normalizedSpec, 'The contrast proof must render real pixels');
const grade = await certify({ spec: rendered.normalizedSpec, theme: input.theme, brand: input.brand });
const output = process.env.OODS_VIZ_BITE_PROBE_OUTPUT;
if (output) { mkdirSync(dirname(resolve(output)), { recursive: true }); writeFileSync(resolve(output), JSON.stringify({ input, rendered, grade }, null, 2) + '\n'); }
assert.equal(grade.status, 'ok', JSON.stringify(grade.errors));
assert.equal(grade.determinism?.renderHash, rendered.svgHash, 'Certify must grade the same rendered operand');
assert.equal(grade.pillars?.contrast, failing ? 'fail' : 'pass');
if (failing) assert.equal(grade.conformant, false, 'A missing bake must not remain conformant');
assert.equal(grade.contrastResults?.[0]?.measured, !failing, 'Determinism renders cannot turn a missing palette into a contrast measurement');
assert.equal(grade.contrastResults?.[0]?.evidence, failing ? 'none' : 'render');
assert.equal('contrastMeasured' in grade, false, 'Internal measurement disposition must not leak to the public result');
console.log(JSON.stringify({ contrast: grade.pillars?.contrast, conformant: grade.conformant, svgHash: rendered.svgHash, findings: grade.findings, contrastResults: grade.contrastResults }));
