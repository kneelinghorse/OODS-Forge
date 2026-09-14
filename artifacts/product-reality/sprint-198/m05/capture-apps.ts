import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { runAppConsumers, observeFlow, observeCollectionControls, assertWorkflowFlow, type AppInspection } from '../../../../scripts/product-reality/s188-m03-app-consumers.js';
import { packFoundationPackages } from '../../../../scripts/product-reality/s182-m04-consumer-harness.mjs';
const output = path.resolve(process.argv[2] ?? 'artifacts/product-reality/sprint-198/m05');
const objects = process.argv.slice(3).length ? process.argv.slice(3) : ['Organization', 'User', 'Subscription'];
const sourceHead = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const hash = (value: string | Buffer) => `sha256:${createHash('sha256').update(value).digest('hex')}`;
const json = async (file: string, value: unknown) => { await fs.mkdir(path.dirname(file), { recursive: true }); await fs.writeFile(file, JSON.stringify(value, null, 2) + '\n'); };
assert(process.env.OODS_PLAYWRIGHT_WS_ENDPOINT, 'Use the owned pinned Linux browser for native keyboard proof');
await fs.mkdir(output, { recursive: true });
const packed = await packFoundationPackages(output);
const inspect: AppInspection = async ({ page, url, output, framework, artifact, schema, object, requireBillingViews, titleField, requiredFlow, editProbe }) => {
  const observations: Array<Record<string, any>> = [];
  const flows: unknown[] = [];
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  // Advance Date with timers: Vue ignores bubbled events at their listener attachment timestamp.
  await page.clock.install({ time: new Date('2026-09-08T12:00:00.000Z') });
  for (const width of [390, 820, 1440]) {
    await page.clock.setSystemTime(new Date('2026-09-08T12:00:00.000Z'));
    await page.setViewportSize({ width, height: 1000 });
    const checkpoint = async (name: string) => {
      const relative = `craft/${framework}/${name}/${width}`;
      await fs.mkdir(path.dirname(path.join(output, relative)), { recursive: true });
      await page.evaluate(() => document.fonts.ready);
      const proof = await page.locator('[data-oods-workflow]').evaluate(element => ({
        screen: element.getAttribute('data-screen'), selectedId: element.getAttribute('data-selected-id'),
        text: (element as HTMLElement).innerText.replace(/\s+/g, ' ').trim(),
        controls: Array.from(element.querySelectorAll('input,textarea,select')).filter(node => node.getClientRects().length > 0).map(node => {
          const field = node as HTMLInputElement;
          return { name: field.name || field.id, type: field.type, value: field.value, checked: field.type === 'checkbox' ? field.checked : undefined,
            options: node.tagName === 'SELECT' ? Array.from((node as HTMLSelectElement).options).map(option => ({ value: option.value, label: option.label })) : undefined };
        }),
        layout: { viewport: window.innerWidth, document: document.documentElement.scrollWidth,
          overflow: Array.from(element.querySelectorAll('*')).filter(node => node.getClientRects().length > 0 && getComputedStyle(node).visibility !== 'hidden' && (node.getBoundingClientRect().right > window.innerWidth + 1 || node.getBoundingClientRect().left < -1)).map(node => ({ tag: node.tagName, id: node.id, component: node.getAttribute('data-oods-component'), right: node.getBoundingClientRect().right, left: node.getBoundingClientRect().left })) },
      }));
      await page.screenshot({ path: path.join(output, `${relative}.png`), fullPage: true });
      await fs.writeFile(path.join(output, `${relative}.a11y.txt`), await page.locator('[data-oods-workflow]').ariaSnapshot());
      const row = { name, framework, width, file: `${relative}.png`, sha256: hash(await fs.readFile(path.join(output, `${relative}.png`))), artifactHash: artifact.contentHash, sourceHead, ...proof };
      observations.push(row);
      await json(path.join(output, `craft/${framework}/observations.json`), { sourceHead, artifactHash: artifact.contentHash, browser: await page.evaluate(() => navigator.userAgent), errors, observations, flows, builderSelfCertified: false });
      assert.equal(proof.layout.document, width, `${name}/${width}: document overflow`);
      assert.deepEqual(proof.layout.overflow, [], `${name}/${width}: element overflow`);
      assert.deepEqual(errors, []);
    };
    const flow = await observeFlow(page, url, requireBillingViews, object, titleField, editProbe, checkpoint);
    flows.push({ width, flow });
    await json(path.join(output, `craft/${framework}/flow-${width}.json`), flow);
    if (flow.some(row => row.status !== 'passed')) {
      await fs.writeFile(path.join(output, `craft/${framework}/failure-${width}.a11y.txt`), await page.locator('[data-oods-workflow]').ariaSnapshot());
      await json(path.join(output, `craft/${framework}/failure-${width}.json`), await page.locator('input,textarea,select').evaluateAll(nodes => nodes.map(node => { const field = node as HTMLInputElement; return { name: field.name, id: field.id, value: field.value, valid: field.checkValidity(), message: field.validationMessage }; })));
    }
    assertWorkflowFlow(flow, requiredFlow);
    const controls = await observeCollectionControls(page, url, object, schema, checkpoint);
    assert(controls.length > 0 && controls.every(row => row.status === 'passed'));
    flows.push({ width, controls });
    await json(path.join(output, `craft/${framework}/observations.json`), { sourceHead, artifactHash: artifact.contentHash, browser: await page.evaluate(() => navigator.userAgent), errors, observations, flows, builderSelfCertified: false });
  }
};
for (const object of objects) {
  const directory = path.join(output, object.toLowerCase());
  const report = await runAppConsumers(directory, 's198-m05', object, packed, undefined, sourceHead, inspect);
  assert(report.cells.every(cell => (cell.gates as Array<{status: string}>).every(gate => gate.status === 'passed')), `${object}: packed gate failed`);
  const read = async (framework: string) => JSON.parse(await fs.readFile(path.join(directory, `craft/${framework}/observations.json`), 'utf8'));
  const react = await read('react'), vue = await read('vue');
  assert.equal(react.observations.length, vue.observations.length);
  const mismatches = react.observations.flatMap((row: any) => {
    const other = vue.observations.find((candidate: any) => candidate.name === row.name && candidate.width === row.width);
    return ['text', 'controls'].filter(field => JSON.stringify(row[field]) !== JSON.stringify(other?.[field])).map(field => ({ name: row.name, width: row.width, field, react: row[field], vue: other?.[field] }));
  });
  await json(path.join(directory, 'craft/verification.json'), { sourceHead, object, screenshots: react.observations.length + vue.observations.length, widths: [390,820,1440], frameworkTextAndValueMismatches: mismatches, errors: [...react.errors,...vue.errors], builderSelfCertified: false });
  assert.deepEqual(mismatches, [], `${object}: framework text/value parity`);
  console.log(`${object}: ${react.observations.length + vue.observations.length} craft screenshots; all viewport flows and exact text/value parity passed at ${sourceHead}`);
}
