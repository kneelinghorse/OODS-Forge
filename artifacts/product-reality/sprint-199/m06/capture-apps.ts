import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { runAppConsumers, observeFlow, assertWorkflowFlow, type AppInspection } from '../../../../scripts/product-reality/s188-m03-app-consumers.js';
import type { PackedPackageRecord } from '../../../../scripts/product-reality/s184-m06-live-consumers.js';
import { packFoundationPackages } from '../../../../scripts/product-reality/s182-m04-consumer-harness.mjs';

const output = path.resolve('artifacts/product-reality/sprint-199/m06/apps');
const sourceHead = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
await fs.mkdir(output, { recursive: true });
const packed = await packFoundationPackages(output) as PackedPackageRecord[];
const inspect: AppInspection = async ({ page, url, output, framework, artifact, object, requireBillingViews, titleField, requiredFlow, editProbe }) => {
  const rows: unknown[] = [];
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.clock.install({ time: new Date('2026-09-14T12:00:00Z') });
  for (const width of [390, 820, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    const flow = await observeFlow(page, url, requireBillingViews, object, titleField, editProbe, async name => {
      if (!['detail-navigation', 'save-record-title', 'save-record-field'].includes(name)) return;
      const root = page.locator('[data-oods-component="VizGraphPreview"]');
      assert.equal(await root.count(), 1);
      assert(await page.getByRole('img', { name: 'Example connected relationships', exact: true }).isVisible());
      const expected = artifact.files.find(file => file.path === 'src/charts/force_graph-003.svg')!;
      assert(expected);
      const proof = await root.evaluate((element, svg) => {
        const expected = document.createElement('div'); expected.innerHTML = svg;
        return { exactPublicSvg: element.querySelector('svg')?.outerHTML === expected.querySelector('svg')?.outerHTML,
          accessibleName: element.getAttribute('aria-label'), description: element.textContent,
          visible: element.getBoundingClientRect().width > 0,
          overflow: document.documentElement.scrollWidth > window.innerWidth + 1 };
      }, expected.contents);
      assert(proof.exactPublicSvg && proof.visible && !proof.overflow, JSON.stringify(proof));
      assert(proof.description?.includes('Synthetic'));
      const file = `graph-${framework}-${name}-${width}`;
      await page.screenshot({ path: path.join(output, `${file}.png`), fullPage: true });
      await fs.writeFile(path.join(output, `${file}.a11y.txt`), await page.locator('[data-oods-workflow]').ariaSnapshot());
      rows.push({ name, width, framework, ...proof, artifactHash: artifact.contentHash,
        svgHash: expected.contentHash, screenshot: `${file}.png`, screenshotSha256: createHash('sha256').update(await fs.readFile(path.join(output, `${file}.png`))).digest('hex') });
    });
    assertWorkflowFlow(flow, requiredFlow);
    rows.push({ width, flow });
  }
  assert.deepEqual(errors, []);
  await fs.writeFile(path.join(output, `graph-${framework}.json`), JSON.stringify({ sourceHead, artifactHash: artifact.contentHash, rows, errors, builderSelfCertified: false }, null, 2) + '\n');
};
const report = await runAppConsumers(path.join(output, 'relationship'), 's199-m06', 'Relationship', packed, undefined, sourceHead, inspect);
assert(report.cells.every(cell => (cell.gates as Array<{ status: string }>).every(gate => gate.status === 'passed')));
console.log('Relationship packed React/Vue workflows and graph bytes passed at all three widths.');
