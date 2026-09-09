import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { digest, validateReceipt } from '../../../../scripts/design-loop/common.js';
const root = path.dirname(fileURLToPath(import.meta.url));
const head = '30f925f7158f2e12d959e1601945beb1b8abfe4c';
const rows = [];
for (const screen of ['review-form', 'review-detail', 'standalone-form', 'standalone-detail', 'on-demand']) for (const framework of ['react', 'vue']) {
  const directory = path.join(root, 'after', screen, framework);
  const receipt = JSON.parse(await fs.readFile(path.join(directory, 'receipt.json'), 'utf8'));
  await validateReceipt(receipt); assert.equal(receipt.sourceHead, head);
  assert.deepEqual(receipt.errors, []);
  assert.deepEqual(receipt.views.map((view: any) => view.width), [390, 820, 1440]);
  for (const view of receipt.views) {
    assert.equal(digest(await fs.readFile(path.join(directory, view.screenshot))), view.screenshotHash);
    assert.equal(view.measurements.documentWidth, view.width, `${screen}/${framework} overflow`);
    assert.deepEqual(view.measurements.glyphWraps.filter((node: any) => node.text.length < 24 && node.lines.length > 6), [], 'short text cannot wrap per character');
    const a11y: string = view.accessibility;
    if (screen === 'review-form') {
      for (const [role, label] of [['textbox', 'Reason Code'], ['textbox', 'Reason'], ['textbox', 'Billing amount'], ['combobox', 'Billing interval'], ['combobox', 'Status'], ['checkbox', 'Cancel at period end']]) {
        assert.equal((a11y.match(new RegExp(`${role} "${label}"`, 'g')) ?? []).length, 1, `${role} ${label} must occur once`);
      }
      assert.equal((a11y.match(/button "Save"/g) ?? []).length, 1);
      assert.doesNotMatch(a11y, /button "(?:Submit|Change|Cancel subscription)"/);
      for (const match of a11y.matchAll(/(?:textbox|combobox|checkbox|spinbutton) "([^"\n]+)"/g)) {
        assert.ok(match[1].length <= 40); assert.doesNotMatch(match[1], /[.!?]$/);
      }
      assert.equal(view.values.find((value: any) => value.name === 'Cancellation requested at')?.value, '2026-09-08T12:00');
      assert.equal(view.values.find((value: any) => value.name === 'Reason Code')?.value, 'customer_request');
      for (const component of ['BillingAmountInput', 'BillingIntervalSelector', 'StatusSelector', 'CancellationForm']) assert.equal(view.regions.filter((region: any) => region.component === component).length, 1);
    }
    if (screen === 'review-detail') {
      assert.doesNotMatch(a11y, /textbox |checkbox |No events|\bfalse\b|\d{4}-\d{2}-\d{2}T/);
      assert.match(a11y, /tablist "Record details"/);
      const labels = [...a11y.matchAll(/- tab "([^"\n]+)"/g)].map(match => match[1]);
      assert.deepEqual(labels, ['Billing', 'Details']);
      const audit = view.regions.find((region: any) => region.component === 'AuditTimeline');
      assert.ok(audit?.text.includes('Jan 1, 2026, 12:00 AM') && audit.text.includes('Sep 8, 2026, 12:00 PM'));
      assert.match(view.regions.find((region: any) => region.component === 'ArchiveSummary').text, /Archived\s+No/);
    }
    if (screen === 'on-demand') {
      assert.equal(view.regions.filter((region: any) => region.component === 'CancellationForm').length, 1);
      assert.match(a11y, /button "Confirm cancellation"/); assert.match(a11y, /textbox "Reason Code"/);
    }
  }
  rows.push({ screen, framework, sourceHead: receipt.sourceHead, artifactHash: receipt.artifactContentHash, views: receipt.views.length });
}
await fs.writeFile(path.join(root, 'receipt-verification.json'), JSON.stringify({ status: 'passed', receipts: rows.length, screenshots: rows.length * 3, rows }, null, 2) + '\n');
console.log(JSON.stringify({ status: 'passed', receipts: rows.length, screenshots: rows.length * 3 }));
