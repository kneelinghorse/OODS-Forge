/**
 * s201-m01 residue receipts: the three Sprint 200 preview items fixed at the producer.
 *   1. The rendered document is titled after the screen and shows one placeholder for unbound fields.
 *   2. The detail header slot reports the record title (DetailHeader) as its leader and lists what is placed after it.
 *   3. Slot confidence and candidate score are named apart.
 *
 *   pnpm exec tsx scripts/product-reality/s201-m01-residue.ts [--out artifacts/product-reality/sprint-201/m01/residue]
 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { handle as compose } from '../../packages/mcp-server/src/tools/design.compose.js';
import { handle as render } from '../../packages/mcp-server/src/tools/repl.render.js';

const root = path.resolve(import.meta.dirname, '../..');
const outIndex = process.argv.indexOf('--out');
const out = path.resolve(root, outIndex >= 0 ? process.argv[outIndex + 1]! : 'artifacts/product-reality/sprint-201/m01/residue');
fs.mkdirSync(out, { recursive: true });
const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
const write = (name: string, value: unknown) => fs.writeFileSync(path.join(out, name), JSON.stringify(value, null, 2) + '\n');

const composed = await compose({ object: 'Subscription', context: 'detail' });
assert.equal(composed.status, 'ok');
const header = composed.selections!.find(selection => selection.slotName === 'header')!;
const metadata = composed.selections!.find(selection => selection.slotName === 'metadata')!;

// 2. The header slot: DetailHeader leads, the view extensions follow, candidates are not alternatives.
assert.equal(header.selectedComponent, 'DetailHeader');
assert.deepEqual(header.placedComponents, ['DetailHeader', 'VizAreaPreview', 'StatusTimeline', 'CancellationSummary', 'ArchiveSummary']);
assert.equal(header.candidates[0]!.name, 'DetailHeader');
assert.match(header.explanation, /DetailHeader leads slot "header"/);
assert.match(header.explanation, /also renders VizAreaPreview, StatusTimeline, CancellationSummary, ArchiveSummary after it/);
write('header-slot.json', { head, item: 'Subscription detail header slot resolving to VizAreaPreview', fixed: 'reportLayoutLeaders in design.compose.ts: the record title the detail layout places leads the slot; view-extension components are reported as placedComponents, not candidates', selection: header });

// 3. Confidence vs score: the slot's confidence and each candidate's score are different fields, and can differ.
assert.equal(typeof metadata.confidence, 'number');
for (const candidate of metadata.candidates) { assert.equal(typeof (candidate as { score: number }).score, 'number'); assert.equal('confidence' in candidate, false); }
assert.notEqual(metadata.confidence, (metadata.candidates[0] as { score: number }).score, 'the two numbers must be allowed to differ');
write('confidence-vs-score.json', { head, item: 'slot confidence and candidate score sharing one name', fixed: 'candidates[].score and alternativeCandidates[].score in design.compose output; slot.confidence keeps its name and its description says the two differ', selection: metadata });

// 1. The document title and the placeholder convention.
const document = await render({ action: 'render', schemaRef: composed.schemaRef!, apply: true, output: { compact: true } } as never) as { html?: string; status: string };
assert.equal(document.status, 'ok');
const html = document.html!;
const title = /<title>([^<]*)<\/title>/.exec(html)![1];
assert.equal(title, 'Subscription detail');
const rawKeys = [...html.matchAll(/<dd>([a-z]+_[a-z_]+)<\/dd>/g)].map(match => match[1]);
assert.deepEqual(rawKeys, [], `field keys rendered as values: ${rawKeys.join(', ')}`);
const placeholders = [...html.matchAll(/data-oods-placeholder="unbound-field" data-field="([^"]+)"/g)].map(match => match[1]);
assert(placeholders.length > 0, 'unbound fields render the shared placeholder');
const inline = await render({ action: 'render', schema: composed.schema, apply: true, output: { compact: true } } as never) as { html?: string };
assert.equal(/<title>([^<]*)<\/title>/.exec(inline.html!)![1], 'OODS Preview', 'an untitled inline schema keeps the generic title');
write('document-title-and-placeholders.json', { head, item: 'preview document placeholder convention and OODS Preview title', fixed: 'repl.render titles the document from the schemaRef label (object + context); renderSummarySection and renderMetaInline never print a *Field binding as a value and render the shared unbound-field placeholder (U+2014) with data-oods-placeholder', title, inlineTitle: 'OODS Preview', unboundFields: placeholders, rawFieldKeysRenderedAsValues: rawKeys, htmlBytes: Buffer.byteLength(html) });
console.log(`residue receipts: ${out}`);
