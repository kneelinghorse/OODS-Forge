/** Read retained m06/m07 proof only; never render, rebuild, or write artifacts. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BROWSER_IMAGE, validateRuntimeLedger, type RuntimeCell, type RuntimeLedger } from '../../../../packages/mcp-server/src/lib/runtime-ledger.js';
const read = <T = any>(file: string): T => JSON.parse(readFileSync(file, 'utf8'));
const sha256 = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex');
const identity = (row: RuntimeCell) => `${row.object}/${row.context}/${row.framework}`;
const objects = ['Invoice', 'Usage'] as const;
const frameworks = ['react', 'vue'] as const;
const scopes = ['A-light', 'A-dark', 'A-hc', 'B-light', 'B-dark', 'B-hc'];
const title = (object: string) => object === 'Invoice' ? 'Invoice line item amounts' : 'Example API-call usage';
const nodes = (value: any): any[] => !value || typeof value !== 'object' ? []
  : [...(typeof value.component === 'string' ? [value] : []), ...Object.values(value).flatMap(nodes)];
export function verifyRuntime(directory: string) {
  const output = path.resolve(directory);
  const main = read<RuntimeLedger>(path.join(output, 'runtime-cells.v1.json'));
  assert.deepEqual(validateRuntimeLedger(main, true), [], 'Canonical runtime ledger must validate');
  assert.deepEqual(main.summary, { cells: 154, pass: 154, typedGap: 0, fail: 0 });
  const browser = read(path.join(output, 'browser.json'));
  assert.equal(browser.image, BROWSER_IMAGE);
  assert.equal(browser.version, '141.0.7390.37');
  assert.match(browser.userAgent, /Linux/);
  const layoutRoot = path.join(output, 'layouts/dashboard');
  const dashboard = read<RuntimeLedger & { scope: { layout: string; objects: string[] } }>(path.join(layoutRoot, 'runtime-cells.v1.json'));
  const expected = objects.flatMap(object => frameworks.map(framework => `${object}/detail/${framework}`));
  assert.deepEqual(validateRuntimeLedger(dashboard, false, expected), [], 'Dashboard cells must validate as their own population');
  assert.deepEqual(dashboard.summary, { cells: 4, pass: 4, typedGap: 0, fail: 0 });
  assert.equal(dashboard.scope.layout, 'dashboard');
  assert.deepEqual([...dashboard.scope.objects].sort(), [...objects]);
  for (const key of ['head', 'runId', 'browserImage', 'packCount'] as const) assert.equal(dashboard[key], main[key], `Dashboard must share ${key}`);
  const layoutValidation = read(path.join(layoutRoot, 'validation.json'));
  assert.deepEqual(layoutValidation.issues, []);
  assert.equal(layoutValidation.reusedSweepTarballs, true);
  const packages = read<Array<{ name: string; sha256: string; artifactPath: string }>>(path.join(output, 'submitted-packages/inventory.json'));
  assert.equal(new Set(packages.map(item => item.name)).size, packages.length);
  assert(packages.length > 0);
  for (const item of packages) assert.equal(sha256(readFileSync(path.join(output, item.artifactPath))), item.sha256, `${item.name}: submitted tarball differs`);
  const proof: any[] = [];
  for (const [population, root, ledger] of [['canonical', output, main], ['dashboard', layoutRoot, dashboard]] as const) {
    for (const object of objects) for (const framework of frameworks) {
      const row = ledger.rows.find(item => item.object === object && item.context === 'detail' && item.framework === framework)!;
      assert(row, `${population}/${object}/${framework}: missing cell`);
      const cellRoot = path.join(root, path.dirname(row.report));
      assert.deepEqual(read(path.join(root, row.report)), row, 'Ledger must reference the actual cell receipt');
      assert.deepEqual(read(path.join(cellRoot, 'composition-request.json')), population === 'dashboard' ? { object, layout: 'dashboard' } : { object, context: 'detail' });
      const chartNodes = nodes(read(path.join(cellRoot, 'composition.json')).schema).filter(node => node.chart);
      assert.equal(chartNodes.length, 1);
      assert.equal(chartNodes[0].chart.chartType, object === 'Invoice' ? 'bar' : 'line');
      assert.equal(chartNodes[0].props.title, title(object));
      const installed = row.gates.find(item => item.name === 'fresh-exact-tarball-install')!.detail as { tarballs: Array<{ name: string; sha256: string }> };
      assert(installed.tarballs.length > 0);
      for (const item of installed.tarballs) assert.equal(item.sha256, `sha256:${packages.find(pkg => pkg.name === item.name)?.sha256}`, 'Installed tarball must come from this sweep');
      const gate = row.gates.filter(item => item.name === 'chart-theme-scopes');
      assert.equal(gate.length, 1);
      assert.equal(gate[0]!.status, 'pass');
      const detail = gate[0]!.detail as { cells: number; failed: number; skipped: number; report: string; reusedSweepTarballs: boolean };
      assert.equal(detail.cells, 6); assert.equal(detail.failed, 0); assert.equal(detail.skipped, 0);
      assert.equal(detail.reusedSweepTarballs, true);
      const reportFile = path.join(root, detail.report);
      assert.equal(reportFile, path.join(cellRoot, 'chart-themes/report.json'));
      const report = read(reportFile), themedRoot = path.dirname(reportFile);
      assert.equal(report.status, 'passed'); assert.equal(report.selected, 6);
      assert.equal(report.failed, 0); assert.equal(report.skipped, 0); assert.deepEqual(report.failures, []);
      assert.equal(report.browser.name, 'chromium'); assert.equal(report.browser.version, browser.version);
      assert.deepEqual(report.cells.map((cell: any) => cell.id).sort(), [...scopes].sort());
      for (const cell of report.cells) {
        const [brand, theme] = cell.id.split('-');
        assert.equal(cell.status, 'passed'); assert.deepEqual(cell.failures, []); assert.deepEqual(cell.errors, []);
        assert.equal(cell.brand, brand); assert.equal(cell.theme, theme); assert.equal(cell.forcedColours, theme === 'hc');
        assert.equal(cell.placeholders, 0); assert.equal(cell.charts.length, 1);
        const chart = cell.charts[0];
        assert.equal(chart.matchesPublicSvg, true); assert(chart.width > 0 && chart.height > 0);
        const treeFile = path.join(themedRoot, `${cell.id}-accessibility-tree.txt`);
        assert(readFileSync(treeFile, 'utf8').includes(`img "${title(object)}"`), `${population}/${identity(row)}/${cell.id}: named image missing from accessible tree`);
        assert.equal(sha256(readFileSync(path.join(themedRoot, cell.screenshot))), cell.screenshotSha256);
        const { renderRequest, rendered, certification } = read(path.join(themedRoot, `${cell.id}-certification.json`));
        const generated = read(path.join(themedRoot, `${cell.id}-generation.json`));
        assert.equal(renderRequest.brand, brand); assert.equal(renderRequest.theme, theme);
        assert.equal(renderRequest.name, title(object)); assert.equal(renderRequest.chartType, chartNodes[0].chart.chartType);
        assert.equal(rendered.status, 'ok'); assert.equal(certification.status, 'ok');
        assert.equal(certification.coverage, 'certified'); assert.equal(certification.conformant, true);
        assert.equal(certification.determinism.stable, true); assert.match(certification.determinism.renderHash, /^(?:sha256:)?[a-f0-9]{64}$/);
        assert.equal(sha256(rendered.svg), rendered.svgHash.replace(/^sha256:/, ''));
        assert.equal(generated.request.options.brand, brand); assert.equal(generated.request.options.theme, theme);
        assert.equal(generated.response.status, 'ok');
        assert.equal(generated.response.artifact.files.find((file: any) => file.path.endsWith('.svg'))?.contents, rendered.svg);
        proof.push({ population, object, context: row.context, layout: population === 'dashboard' ? 'dashboard' : null, framework,
          brand, theme, conformant: true, svgHash: rendered.svgHash, matchesPublicSvg: true, namedImage: title(object),
          actualSvgCount: cell.charts.length, visibleBounds: { width: chart.width, height: chart.height },
          computedCanvas: chart.canvas, forcedColours: cell.forcedColours, failures: 0, skipped: 0,
          report: path.relative(output, reportFile), accessibleTree: path.relative(output, treeFile), screenshotSha256: cell.screenshotSha256 });
      }
    }
  }
  assert.equal(proof.length, 48);
  const legacy = frameworks.map(framework => {
    const row = main.rows.find(item => item.object === 'Subscription' && item.context === 'detail' && item.framework === framework)!;
    const root = path.join(output, path.dirname(row.report));
    const chart = nodes(read(path.join(root, 'composition.json')).schema).find(node => node.chart);
    assert.equal(chart?.component, 'VizAreaPreview'); assert.equal(chart.chart.source, 'payment-events'); assert.equal(chart.chart.chartType, 'area');
    const generation = read(path.join(root, 'generation.json'));
    assert.equal(generation.status, 'ok'); assert.equal(generation.artifact.contentHash, row.artifactHash);
    const assets = generation.artifact.files.filter((file: any) => file.path.endsWith('.svg'));
    assert(assets.length > 0 && assets.every((file: any) => file.contents.includes('<svg')));
    return { object: 'Subscription', context: 'detail', framework, chartType: 'area', chartSource: 'payment-events', artifactHash: row.artifactHash, svgAssets: assets.length };
  });
  return { head: main.head, runId: main.runId, browserImage: main.browserImage, browserVersion: browser.version,
    packCount: main.packCount, canonical: main.summary, dashboard: dashboard.summary,
    chartThemeScopes: proof.length, chartThemeScopesPassed: proof.length, legacyAreaGeneration: legacy,
    htmlFullApplicationProof: 'not-claimed; this runtime population contains React and Vue only', proof };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert(process.argv.length === 3, 'Usage: tsx verify-runtime.ts <runtime-output-directory>');
  console.log(JSON.stringify(verifyRuntime(process.argv[2]!), null, 2));
}
