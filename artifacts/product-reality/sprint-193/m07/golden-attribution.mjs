import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const base = 'artifacts/product-reality/sprint-193/m07';
const beforeHead = 'c098237f1a1d026df4f1ad5c0ca51b15ebab0f4d';
const afterHead = JSON.parse(fs.readFileSync(`${base}/runtime/runtime-cells.v1.json`, 'utf8')).head;
const git = args => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim();
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const rows = git(['diff', '--name-status', '--no-renames', beforeHead, afterHead]).split('\n').map(line => { const [status, file] = line.split('\t'); return { status, file }; }).filter(row => !row.file.startsWith('artifacts/') && (/\/(test|tests|fixtures|__snapshots__)\/|\.(spec|test)\./.test(row.file) || row.file === 'scripts/runtime/e2e.mjs'));
const reasons = {
 'cmos/tests/test_refresh_structured_data.py': 'Preserve the frozen historical schema fixture while asserting four real authoring traits, 109 measured roots, and the explicit current runtime projection at the recorded timestamp.',
 'packages/component-contracts/test/measured-ledger.s192.spec.ts': 'Historical classification approval remains null while the live measured ledger grows to all109 governed roots.',
 'packages/component-contracts/test/trait-recipes.spec.ts': 'All governed non-viz and viz recipes join contract/scenario checks; current root totals and static/interactive semantics are asserted.',
 'packages/components-react/test/scenario-fixtures.tsx': 'Executable seeded fixtures for the new recipes and their real input-change events.',
 'packages/components-react/test/scenarios.spec.tsx': 'New recipe scenarios plus DOM-normalized SVG comparisons; raw SSR equality is asserted separately.',
 'packages/components-vue/test/scenarios.spec.ts': 'New recipe scenarios plus DOM-normalized SVG comparisons; raw SSR equality is asserted separately.',
 'packages/mcp-server/src/codegen/binding-utils.s183.test.ts': 'Decode/validate real trait intent parameters, preserve intent-owned bindings, and pin declared event placement.',
 'packages/mcp-server/test/compose/viz-compose.spec.ts': 'After N015 readiness gaps close, retain the actual legacy data-layout/OODS-V007 failure without changing deprecated behavior.',
 'packages/mcp-server/test/contracts/catalog.list.spec.ts': 'Distinguish all109 governed roots from66 identities actually placed by current public runtime schemas and43 fixture-only/unreached identities.',
 'packages/mcp-server/test/e2e/object-codegen-pipeline.spec.ts': 'Read-only Taggable detail now emits TagSummary; other pipeline expectations stay intact.',
 'packages/mcp-server/test/product-reality/validation-profiles.s183.spec.ts': 'Use the existing dependency seam to inject a named unavailable-target fault after CommunicationDetailPanel becomes implemented; all validation profiles remain tested.',
 'packages/mcp-server/test/product-reality/workflow.s188.spec.ts': 'Workflow reuses the declared list state envelope without nesting duplicate branches.',
 'tests/verification/how-forge-works.contract.test.ts': 'Current narrative follows109 roots,40interactive/69static,66placed/43unreached; old certification history and pending approval stay distinct.',
 'tests/verification/s177-prose-carriers.contract.test.ts': 'Pin corrected chart/certification prose and grouped API links against current renderer/schema truth.',
 'scripts/runtime/e2e.mjs': 'Assert45 authored traits and packaged health runtime154/tools27; preserve status-ok and extraction-boundary requirements.',
};
const files = rows.filter(row => row.status === 'M').map(({ file }) => {
 if (!reasons[file]) throw new Error(`Unattributed modified test/fixture: ${file}`);
 return { file, beforeSha256: hash(execFileSync('git', ['show', `${beforeHead}:${file}`])), afterSha256: hash(execFileSync('git', ['show', `${afterHead}:${file}`])), reason: reasons[file], commits: git(['log', '--format=%H', `${beforeHead}..${afterHead}`, '--', file]).split('\n') };
});
fs.writeFileSync(`${base}/golden-attribution.json`, JSON.stringify({ beforeHead, afterHead, scope: 'Every modified source test, fixture, snapshot and portable E2E pin; added/deleted files separately enumerated. No chart pixel golden was rebaselined.', files, addedOrDeleted: rows.filter(row => row.status !== 'M') }, null, 2) + '\n');
console.log(`${files.length} modified files attributed.`);
