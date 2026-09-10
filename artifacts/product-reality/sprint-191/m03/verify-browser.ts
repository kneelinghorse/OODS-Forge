import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { validateReceipt, verifyTheme } from '../../../../scripts/design-loop/common.js';
const base = 'artifacts/product-reality/sprint-191/m03';
const scenarios = ['list', 'detail', 'form', 'timeline', 'workflow', 'archived', 'review-detail', 'review-form', 'review-timeline'];
const read = (file: string) => JSON.parse(fs.readFileSync(file, 'utf8'));
const hash = (file: string) => 'sha256:' + createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const receipts = [], parity = [], beforeFacts = [];
const packages = read(`${base}/packed-linux/submitted-packages/inventory.json`);
let maxGeometryDeltaCssPx = 0;
function measuredDifferences(a: any, b: any, at = ''): string[] {
  if (typeof a === 'number' && typeof b === 'number') {
    const geometry = /\.(left|right|top|bottom|width|height|centerY)$/.test(at);
    if (geometry) maxGeometryDeltaCssPx = Math.max(maxGeometryDeltaCssPx, Math.abs(a - b));
    return Math.abs(a - b) <= (geometry ? 1 : 0) ? [] : [`${at}: ${a} != ${b}`];
  }
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length ? a.flatMap((value, index) => measuredDifferences(value, b[index], `${at}[${index}]`)) : [`${at}: array length mismatch`];
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    assert.deepEqual(Object.keys(a).sort(), Object.keys(b).sort());
    return Object.keys(a).flatMap(key => measuredDifferences(a[key], b[key], `${at}.${key}`));
  }
  return a === b ? [] : [`${at}: ${JSON.stringify(a)} != ${JSON.stringify(b)}`];
}
for (const phase of ['before', 'after']) for (const scenario of scenarios) {
  const projections = [];
  for (const framework of ['react', 'vue']) {
    const directory = `${base}/${phase}/${scenario}/${framework}`;
    const receipt = read(`${directory}/receipt.json`), craft = read(`${directory}/craft.json`);
    await validateReceipt(receipt); verifyTheme(receipt);
    if (phase === 'after') for (const pkg of receipt.packages) assert.equal(pkg.sha256, 'sha256:' + packages.find((entry: any) => entry.name === pkg.name)?.sha256, `${pkg.name}: design loop and packed proof must use the same tarball`);
    assert.equal(craft.artifactHash, receipt.artifactContentHash);
    assert.equal(craft.sourceHead, receipt.sourceHead);
    assert(receipt.sourceHead.startsWith(phase === 'before' ? '0babe4f5' : 'ea1c66ce'));
    assert.deepEqual(receipt.views.map((view: any) => view.width), [390, 820, 1440]);
    assert.deepEqual(receipt.errors, []);
    const projected = [];
    for (const [index, view] of receipt.views.entries()) {
      const geometry = craft.views[index];
      assert.equal(geometry.width, view.width);
      assert.equal(hash(path.join(directory, view.screenshot)), view.screenshotHash);
      const searchWraps = view.measurements.glyphWraps.filter((entry: any) => /^Search$/.test(entry.text));
      if (phase === 'after') {
        assert.deepEqual(view.measurements.overflow, []);
        assert.equal(view.measurements.documentWidth, view.width);
        assert.deepEqual(searchWraps, []);
        assert(geometry.pagination.every((entry: any) => entry.listStyle === 'none'));
        assert(geometry.archive.every((entry: any) => entry.badgeInside && entry.cardBorderWidths.every((width: number) => width > 0)), 'badge must be inside the visible card border');
        if (['workflow', 'archived'].includes(scenario)) {
          assert(geometry.rows.length > 0); assert(geometry.pagination.length > 0);
          assert(view.values.some((entry: any) => entry.name === 'Search'));
          if (view.width === 1440) for (const row of geometry.rows) {
            assert(Math.max(...row.children.map((child: any) => child.centerY)) - Math.min(...row.children.map((child: any) => child.centerY)) <= 1, 'wide collection row must not wrap');
          }
        }
        if (scenario === 'archived') assert.equal(geometry.archive.length, 1);
        if (['detail', 'review-detail'].includes(scenario)) {
          assert.equal(geometry.histories.length, 1);
          assert.equal(geometry.histories[0].component, 'StatusTimeline');
          assert.equal(geometry.charts.length, 1);
          assert.equal(geometry.charts[0].points.length, 4);
          assert(geometry.charts[0].distinctUpperY >= 3);
          assert.deepEqual(geometry.charts[0].captions, []);
          assert.deepEqual(geometry.charts[0].svgTitles, ['Payment amounts']);
        }
        if (scenario === 'review-detail') {
          assert.deepEqual(geometry.histories[0].labels, ['Billing Cycle Started', 'Pending Cancellation']);
          assert(!/billing_cycle_started|pending_cancellation/.test(geometry.histories[0].text));
        }
        if (['form', 'review-form'].includes(scenario)) assert.deepEqual(geometry.amountHelp, ['Amount in USD']);
      }
      if (phase === 'before') beforeFacts.push({ scenario, framework, width: view.width, searchWraps, pagination: geometry.pagination, historyCount: geometry.histories.length, historyText: geometry.histories.map((entry: any) => entry.text), charts: geometry.charts, amountHelp: geometry.amountHelp, rowAligned: geometry.rows.every((row: any) => Math.max(...row.children.map((child: any) => child.centerY)) - Math.min(...row.children.map((child: any) => child.centerY)) <= 1), badgesInsideVisibleButtonCard: geometry.archive.every((entry: any, index: number) => entry.badge && geometry.rows[index] && entry.badge.left >= geometry.rows[index].box.left && entry.badge.right <= geometry.rows[index].box.right && entry.badge.top >= geometry.rows[index].box.top && entry.badge.bottom <= geometry.rows[index].box.bottom) });
      projected.push({ width: view.width, bodyBackground: view.measurements.bodyBackground, canvas: view.measurements.chartCanvasFills, overflow: view.measurements.overflow,
        // The shared observer includes textarea child text in React's label fallback.
        // Compare actual values here; packed accessible-role interaction proves the names.
        values: view.values.map(({ value, checked }: any) => ({ value, checked })),
        searchWraps, paginationReset: geometry.pagination.every((entry: any) => entry.listStyle === 'none'),
        rows: geometry.rows.map((row: any) => ({ ...row, className: row.className.split(' ').sort().join(' ') })),
        archive: geometry.archive, charts: geometry.charts, histories: geometry.histories, amountHelp: geometry.amountHelp });
    }
    projections.push(projected);
    receipts.push({ phase, scenario, framework, receipt: `${directory}/receipt.json`, sha256: hash(`${directory}/receipt.json`), craftSha256: hash(`${directory}/craft.json`), sourceHead: receipt.sourceHead, artifactHash: receipt.artifactContentHash });
  }
  if (phase === 'after') {
    const differences = measuredDifferences(projections[0], projections[1]);
    assert.deepEqual(differences, [], `${scenario}: measured craft parity (1 CSS px geometry tolerance)`);
    parity.push({ scenario, differences });
  }
}
assert(beforeFacts.some(row => row.scenario === 'archived' && !row.badgesInsideVisibleButtonCard));
assert(beforeFacts.some(row => row.searchWraps.length));
assert(beforeFacts.some(row => row.pagination.some((entry: any) => entry.listStyle === 'disc')));
assert(beforeFacts.some(row => row.historyCount === 2 && row.historyText.every((text: string) => text.includes('billing_cycle_started'))));
assert(beforeFacts.some(row => row.charts.some((chart: any) => chart.distinctUpperY === 1 && chart.captions.length + chart.svgTitles.length === 2)));
assert(beforeFacts.some(row => row.amountHelp.some((help: string) => help.includes('minor units'))));
fs.writeFileSync(`${base}/browser-proof.json`, JSON.stringify({ status: 'passed', sourceHead: 'ea1c66ce', beforeReceipts: 18, afterReceipts: 18, screenshots: 108, afterErrors: 0, afterOverflow: 0, geometryToleranceCssPx: 1, maxGeometryDeltaCssPx, allowlist: [], parity, scope: 'Measured craft: row geometry/classes, archive geometry, chart upper points/title, history labels/text/count, help, search wrapping, pagination reset, control values and canvas. Not a whole-page pixel-equality claim. Standard receipt fallback control names and unrelated glyph-node segmentation are not compared.', beforeFacts, receipts }, null, 2) + '\n');
console.log('18 BEFORE + 18 AFTER receipts / 108 screenshots; measured craft parity empty.');
