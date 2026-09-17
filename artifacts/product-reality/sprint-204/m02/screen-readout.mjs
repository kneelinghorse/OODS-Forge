/**
 * s204-m02 — the screen readout, recomputed before and after.
 *
 * Sprint 203 m04 certified its screens with a readout of this shape
 * (artifacts/product-reality/sprint-203/m04/certification.json) but did not retain the script that
 * produced it. This is that script, retained beside its output, and it reads BOTH arms in one run:
 * `dist/` is the build at this sprint's base (the producer before m02) and `src/` is the producer
 * after it, so every number below is a measured difference rather than a remembered one.
 *
 *   node artifacts/product-reality/sprint-204/m02/screen-readout.mjs [outfile]
 *
 * The four metrics, each derived from the composed schema and nothing else:
 *   emptyCardBody  a slot placeholder that paints a surface and that nothing filled — s203-m04's
 *                  "empty bordered box", defect (a).
 *   internalRow    a labelled read-only row printing an internal field a reader has no use for: today
 *                  Stateful's `allowed_transitions`, surfaced as "Allowed transitions: None recorded",
 *                  defect (c). A CONTROL that reads the same field is excluded on purpose — see below.
 *   showsSubstance the screen places at least one field that says what the record IS — not an
 *                  identifier, not a lifecycle status, not a bare timestamp. Decision/card failed
 *                  this in Sprint 203, which is why it could not be certified, defect (d).
 *   fieldsPlaced   how many distinct object fields the screen binds at all.
 */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const arm = async (kind) => (await import(path.join(root, 'packages/mcp-server', kind, 'tools/design.compose.js'))).handle;
const objectsOf = async () => (await import(path.join(root, 'packages/mcp-server/src/objects/object-loader.js'))).listObjects();

const walk = (el, visit) => { visit(el); (el.children ?? []).forEach(child => walk(child, visit)); };
const SURFACE = new Set(['Card']);

function readout(out) {
  const objectSchema = out?.schema?.objectSchema ?? {};
  let emptyCardBody = false, internalRow = false;
  const fields = new Set();
  for (const screen of out?.schema?.screens ?? []) walk(screen, el => {
    const isSlot = typeof el.meta?.intent === 'string' && el.meta.intent.startsWith('slot:');
    const bare = !el.children?.length && Object.keys(el.props ?? {}).length === 0;
    if (isSlot && bare && SURFACE.has(el.component)) emptyCardBody = true;
    // The defect is a labelled READ-ONLY ROW printing an internal field — s203-m04's signature was
    // Text{as:'strong',content:'Allowed transitions'} beside a "None recorded" value. A control that
    // READS the same field is not the defect: StatusSelector's `allowedTransitionsField` is how it
    // knows which transitions to offer, and all 30 surviving uses below are that. Measured, not assumed.
    if (el.component === 'Text' && /^allowed transitions$/i.test(String(el.props?.content ?? ''))) internalRow = true;
    if (typeof el.props?.field === 'string') fields.add(el.props.field);
  });
  // Substance is the record's own words: a bound field that is not an id, not an enum'd lifecycle
  // status and not a bare timestamp.
  const showsSubstance = [...fields].some(name => {
    const entry = objectSchema[name];
    if (!entry) return false;
    const type = String(entry.type).replace(/\?$/, '');
    const semantic = entry.semanticType ?? '';
    if (type === 'date' || type === 'datetime') return false;
    if (entry.enum?.length) return false;
    if (/(^|_)id$/i.test(name) || /\.id$/.test(semantic)) return false;
    if (/\.(state|status)$/.test(semantic)) return false;
    return true;
  });
  return { showsSubstance, emptyCardBody, internalRow, fieldsPlaced: fields.size };
}

/**
 * `dist` is only the BEFORE arm while it holds the build from this sprint's base. Once the tree is
 * rebuilt — which m02 must do to measure the after arm in a browser — `dist` carries the m02 producer
 * too, and this script would then compare the after arm against itself and report a tidy zero
 * difference that means nothing.
 *
 * That is the same shape of defect this mission was sent to fix, so it refuses instead. To re-run this
 * after a rebuild, rebuild the base first:
 *   git stash push -u -m readout && pnpm run build:packages && git stash apply <sha>
 */
const distFiller = fs.readFileSync(path.join(root, 'packages/mcp-server/dist/compose/object-slot-filler.js'), 'utf8');
if (distFiller.includes('neutralizeUnfilledSurfaceSlots')) {
  console.error('refusing: packages/mcp-server/dist already carries the m02 producer, so "before" and "after" would be the same arm.');
  console.error('The retained result in screen-readout.json was measured when dist held the base build (8ef91bd13 + m01).');
  process.exit(2);
}

const before = await arm('dist');
const after = await arm('src');
const CONTEXTS = ['card', 'detail', 'form', 'inline', 'list', 'timeline', 'workflow', 'dashboard'];
const report = { kind: 's204-m02 screen readout, before and after the producer changes', objects: {}, totals: {} };
const totals = { before: { emptyCardBody: 0, internalRow: 0, showsSubstance: 0 }, after: { emptyCardBody: 0, internalRow: 0, showsSubstance: 0 }, screens: 0 };

for (const object of (await objectsOf()).map(o => o.name ?? o).sort()) {
  const declared = [];
  for (const context of CONTEXTS) {
    let b, a;
    try { b = readout(await before({ object, context })); } catch { continue; }
    try { a = readout(await after({ object, context })); } catch { continue; }
    declared.push({ context, before: b, after: a });
    totals.screens += 1;
    for (const key of ['emptyCardBody', 'internalRow', 'showsSubstance']) {
      if (b[key]) totals.before[key] += 1;
      if (a[key]) totals.after[key] += 1;
    }
  }
  if (declared.length) report.objects[object] = { contexts: declared.length, declared };
}
report.totals = totals;
const outfile = process.argv[2] ?? path.join(root, 'artifacts/product-reality/sprint-204/m02/screen-readout.json');
fs.writeFileSync(outfile, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(totals, null, 2));
