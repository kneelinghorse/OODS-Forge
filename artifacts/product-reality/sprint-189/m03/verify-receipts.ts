import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { digest, validateReceipt } from '../../../../scripts/design-loop/common.js';
const root = path.dirname(fileURLToPath(import.meta.url));
const expectedHead = 'a818a61e';
const screens = ['workflow', 'review-list', 'review-timeline', 'list', 'timeline', 'populated-list', 'populated-timeline'];
const rows = [];
for (const screen of screens) for (const framework of ['react', 'vue']) {
  const directory = path.join(root, 'after', screen, framework);
  const receipt = JSON.parse(await fs.readFile(path.join(directory, 'receipt.json'), 'utf8'));
  await validateReceipt(receipt); assert.ok(receipt.sourceHead.startsWith(expectedHead));
  assert.deepEqual(receipt.views.map((view: any) => view.width), [390, 820, 1440]);
  const knownFormCarry = framework === 'react' && screen.startsWith('review-');
  assert.equal(receipt.errors.length, knownFormCarry ? 2 : 0, JSON.stringify(receipt.errors));
  if (knownFormCarry) assert.ok(receipt.errors.every((error: any) => error.type === 'console' && /form/.test(error.text)));
  for (const view of receipt.views) {
    assert.equal(digest(await fs.readFile(path.join(directory, view.screenshot))), view.screenshotHash);
    assert.equal(view.measurements.documentWidth, view.width, `${screen}/${framework}/${view.width} overflow`);
    if (['workflow', 'review-list', 'populated-list'].includes(screen)) {
      assert.equal((view.accessibility.match(/searchbox "Search"/g) ?? []).length, 1);
      assert.equal((view.accessibility.match(/combobox "Status"/g) ?? []).length, 1);
      assert.equal((view.accessibility.match(/navigation "Pagination"/g) ?? []).length, 1);
      assert.match(view.accessibility, /9 records/); assert.match(view.accessibility, /Page 1 of 1/);
      assert.doesNotMatch(view.accessibility, /No items|1 \/ 0|button "(?:Filter|Open row|Sort)"/);
      for (const component of ['StatusBadge', 'RelativeTimestamp', 'BillingSummaryBadge']) assert.equal(view.regions.filter((region: any) => region.component === component).length, 9, `${component} per record`);
      assert.match(view.accessibility, /tab "Active" \[selected\]/); assert.match(view.accessibility, /tab "Archived"/);
    }
    if (['review-timeline', 'populated-timeline'].includes(screen)) {
      assert.doesNotMatch(view.accessibility, /\d{4}-\d{2}-\d{2}T/);
      const cards = view.regions.filter((region: any) => region.component === 'Card');
      assert.equal(cards.length, screen === 'review-timeline' ? 4 : 3);
      assert.ok(cards.every((card: any) => card.text.length > 0));
      assert.equal(view.regions.filter((region: any) => region.component === 'PaymentEventTimeline').length, 2);
      assert.match(view.accessibility, screen === 'review-timeline' ? /Team annual \$19\.99 · yearly/ : /Subscription 03 \$57\.00 · monthly/);
    }
    if (screen === 'list' || screen === 'timeline') assert.match(view.accessibility, screen === 'list' ? /No records found/ : /No events yet/);
  }
  rows.push({ screen, framework, views: receipt.views.length, sourceHead: receipt.sourceHead, artifactHash: receipt.artifactContentHash, knownFormConsoleCarry: knownFormCarry ? 2 : 0 });
}
await fs.writeFile(path.join(root, 'receipt-verification.json'), JSON.stringify({ status: 'passed', receipts: rows.length, screenshots: rows.length * 3, rows }, null, 2) + '\n');
console.log(JSON.stringify({ status: 'passed', receipts: rows.length, screenshots: rows.length * 3 }));
