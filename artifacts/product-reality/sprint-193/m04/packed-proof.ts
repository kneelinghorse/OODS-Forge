import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { packFoundationPackages } from '../../../../scripts/product-reality/s182-m04-consumer-harness.mjs';
import { cellProcess } from '../../../../scripts/product-reality/s193-runtime-cells.js';
import { launchProofBrowser } from '../../../../scripts/product-reality/s184-m06-live-consumers.js';
import { BROWSER_IMAGE, summarize, validateRuntimeLedger, type Context, type RuntimeLedger } from '../../../../packages/mcp-server/src/lib/runtime-ledger.js';
import { loadObject, clearObjectCache } from '../../../../packages/mcp-server/src/objects/object-loader.js';

const output = path.resolve(process.argv[2] ?? 'artifacts/product-reality/sprint-193/m04/packed');
const movement = JSON.parse(fs.readFileSync('artifacts/product-reality/sprint-193/m04/movement.json', 'utf8'));
const inputs: Array<{ object: string; context: Context | 'workflow' }> = movement.rows.filter((row: any) => row.changed).map((row: any) => row.input);
const fixtures = [
  { name: 'S193Colorized', traits: [{ name: 'visual/Colorized', parameters: { colorStates: ['neutral', 'success'] } }], contexts: ['form', 'detail'] as const },
  { name: 'S193Geocodable', traits: [{ name: 'viz.spatial/Geocodable' }], contexts: ['form', 'list', 'detail'] as const },
];
fs.mkdirSync(output, { recursive: true });
await packFoundationPackages(output);
const browser = await launchProofBrowser();
try {
  const page = await browser.newPage(); const userAgent = await page.evaluate(() => navigator.userAgent);
  assert.match(userAgent, /Linux/); assert.equal(browser.version(), '141.0.7390.37');
  fs.writeFileSync(path.join(output, 'browser.json'), JSON.stringify({ image: BROWSER_IMAGE, version: browser.version(), userAgent }, null, 2) + '\n');
  await page.close();
} finally { await browser.close(); }
const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const ledger: RuntimeLedger = { schemaVersion: '1.0.0', head, runId: randomUUID(), historicalReceiptsUnioned: false, packCount: 1, browserImage: BROWSER_IMAGE, rows: [], summary: summarize([]) };
const temporary: string[] = [];
try {
  for (const item of fixtures) {
    const fixture = structuredClone(loadObject('Product')); fixture.object.name = item.name; fixture.traits.push(...item.traits);
    const file = path.resolve(`objects/core/__s193-${item.name}.object.yaml`);
    assert(!fs.existsSync(file));
    fs.writeFileSync(path.join(output, `${item.name}.json`), JSON.stringify(fixture, null, 2) + '\n');
    fs.writeFileSync(file, JSON.stringify(fixture, null, 2) + '\n', { flag: 'wx' }); temporary.push(file);
    inputs.push(...item.contexts.map(context => ({ object: item.name, context })));
  }
  clearObjectCache();
  const expected = inputs.flatMap(input => ['react', 'vue'].map(framework => `${input.object}/${input.context}/${framework}`));
  const workers = inputs.flatMap(input => input.context === 'workflow' ? [{ ...input, framework: 'react' as const }] : ['react', 'vue'].map(framework => ({ ...input, framework: framework as 'react' | 'vue' })));
  let cursor = 0;
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (cursor < workers.length) {
      const input = workers[cursor++]!;
      const row = await cellProcess(output, output, input.object, input.context, input.framework, head, ledger.runId);
      ledger.rows.push(row);
      if (input.context === 'workflow') ledger.rows.push(JSON.parse(fs.readFileSync(path.join(output, `cells/${input.object}/workflow/vue/receipt.json`), 'utf8')));
      console.log(`${input.object}/${input.context}/${input.framework}: ${row.status}`);
    }
  }));
  ledger.rows.sort((a, b) => `${a.object}/${a.context}/${a.framework}`.localeCompare(`${b.object}/${b.context}/${b.framework}`));
  ledger.summary = summarize(ledger.rows);
  const issues = validateRuntimeLedger(ledger, true, expected);
  fs.writeFileSync(path.join(output, 'scoped-runtime-cells.v1.json'), JSON.stringify(ledger, null, 2) + '\n');
  fs.writeFileSync(path.join(output, 'validation.json'), JSON.stringify({ scope: 'Every moved public schema plus five bounded real-trait fixture views', expected, issues, builderSelfCertified: false, replaces154CellLedger: false }, null, 2) + '\n');
  assert.deepEqual(issues, []);
} finally {
  temporary.forEach(file => fs.rmSync(file, { force: true })); clearObjectCache();
}
