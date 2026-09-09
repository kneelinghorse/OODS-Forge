import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { digest, validateReceipt, writeJson } from '../../../../scripts/design-loop/common.js';
import { compareReceipts } from '../../../../scripts/design-loop/diff.js';
const root = path.dirname(fileURLToPath(import.meta.url));
const read = async (file: string) => JSON.parse(await fs.readFile(path.join(root, file), 'utf8'));
const mapping: any[] = [];
const errors: any[] = [];
let screenshots = 0;
for (const name of ['standalone-list', 'standalone-detail', 'standalone-form', 'standalone-timeline', 'workflow', 'review-list', 'review-detail', 'review-form', 'review-timeline']) {
  for (const framework of ['react', 'vue']) {
    const file = `before/${name}/${framework}/receipt.json`, receipt = await read(file);
    await validateReceipt(receipt);
    assert.equal(receipt.sourceHead, '36a3a31e4790de21103c166e0ba93cf504a2e354');
    assert.deepEqual(receipt.views.map((view: any) => view.width), [390, 820, 1440]);
    for (const view of receipt.views) {
      assert.equal(digest(await fs.readFile(path.join(root, path.dirname(file), view.screenshot))), view.screenshotHash); screenshots++;
      assert.equal(await fs.readFile(path.join(root, path.dirname(file), view.dump), 'utf8'), view.accessibility + '\n');
      const text = view.accessibility;
      if (name === 'review-list') {
        assert(text.includes(framework === 'react' ? 'No items' : '1 / 0'));
        assert.equal((text.match(/searchbox /g) ?? []).length, 2);
        for (const label of ['Filter', 'Open row', 'Sort']) assert(text.includes(`button "${label}"`));
      } else if (name === 'review-timeline') {
        assert.equal(view.regions.filter((row: any) => row.component === 'Card' && row.text === '').length, 4);
        assert(text.includes('- text: "1999"'));
      } else if (name === 'review-form') {
        const generic = view.values.filter((value: any) => value.element.startsWith('form-slot-field-'));
        assert.equal(generic.length, 9);
        assert(generic.every((value: any) => /\.\*?$/.test(value.name)));
        assert(text.includes('button "Save"') && text.includes('button "Submit"'));
      } else if (name === 'review-detail') {
        assert(text.includes('No events') && text.includes('- definition: "false"'));
        const timeline = view.regions.find((row: any) => row.component === 'StatusTimeline');
        assert(timeline.text.includes('Sample record created') && timeline.text.includes('Budget changed for next year'));
      }
    }
    if (name.startsWith('review-')) mapping.push({ context: name.slice(7), framework, receipt: file, widths: [390, 820, 1440], reproduced: true });
    if (receipt.errors.length) errors.push({ receipt: file, errors: receipt.errors });
  }
}
const repeats: any[] = [];
for (const framework of ['react', 'vue']) {
  const before = await read(`before/standalone-list/${framework}/receipt.json`);
  for (const name of ['warm', 'restored']) {
    const after = await read(`${name}/${framework}/receipt.json`);
    assert.equal(compareReceipts(before, after).differenceCount, 0);
    assert(Object.values(after.timings).reduce((sum: number, value: any) => sum + value, 0) < 15_000);
    repeats.push({ framework, run: name, observationDifferences: 0, timings: after.timings });
  }
  const mutant = await read(`mutation/${framework}/receipt.json`);
  assert.notEqual(mutant.schemaHash, before.schemaHash); assert.notEqual(mutant.artifactContentHash, before.artifactContentHash);
  for (let index = 0; index < before.views.length; index++) {
    const a = before.views[index], b = mutant.views[index];
    assert.notEqual(a.accessibility, b.accessibility);
    assert.equal(a.accessibility.split('- time:', 2)[1], b.accessibility.split('- time:', 2)[1]);
    const untouched = (view: any) => view.regions.filter((row: any) => row.id.startsWith('list-items') || row.id.startsWith('list-pagination'));
    assert.deepEqual(untouched(a), untouched(b));
    assert(!b.regions.some((row: any) => row.component === 'BillingSummaryBadge'));
  }
  assert(JSON.stringify(compareReceipts(before, mutant)).includes('list-toolbar'));
}
const served = await read('serve-status.json'); assert(served.running && served.startupMs < 180_000);
const beforeStore = JSON.parse(await fs.readFile(path.join(root, '../m01/before.json'), 'utf8')).store;
const storePath = '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/mcp-server/.oods/schemas';
const store = Object.fromEntries(await Promise.all((await fs.readdir(storePath)).sort().map(async file => [file, digest(await fs.readFile(path.join(storePath, file))).slice(7)])));
assert.deepEqual(store, beforeStore);
await writeJson(path.join(root, 'verification.json'), { status: 'passed', beforeReceipts: 18, screenshots, reviewDefectMapping: mapping, repeats, mutation: { slot: 'toolbar-actions', replacement: 'Stack', removed: 'BillingSummaryBadge', unaffectedItemsAndPagination: true, note: 'Generic toolbar field reassignment and sequential node IDs are also recomputed by the public composer; no schema is hand-edited.' }, baselineConsoleErrors: errors, storeFilesUnchanged: 17, coldServeMs: served.startupMs });
console.log(`Verified ${screenshots} screenshots, 18 BEFORE receipts, all targeted defects, warm/restore equality, toolbar mutation and unchanged store.`);
