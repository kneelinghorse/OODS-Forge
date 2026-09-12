#!/usr/bin/env tsx
/** Capture actual temporal pixels in one timezone, then compare retained bytes. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { VizRenderInput } from '../../packages/mcp-server/src/schemas/generated.js';

const hash = (bytes: string | Buffer): string => createHash('sha256').update(bytes).digest('hex');
const serialize = (value: unknown): string => JSON.stringify(value, null, 2) + '\n';
type RequestCell = { id: string; identity: string; request: VizRenderInput; registrySvgHash: string };
type Requests = { schemaVersion: 1; cells: RequestCell[] };
type Observation = RequestCell & {
  directory: string; svgHash: string;
  echarts: { optionHash: string; status: 'rendered'; svgHash: string } | { optionHash: string; status: 'unavailable'; error: { name: string; code?: string; message: string } };
};
type Capture = { schemaVersion: 1; timezone: string; resolvedTimezone: string; nodeVersion: string; requestsSha256: string; cells: Observation[] };

export function assertTemporalPopulation(cells: Array<Pick<RequestCell, 'id' | 'identity' | 'request'>>): void {
  const expected = ['line', 'area'].flatMap(identity => ['A', 'B'].flatMap(brand => ['light', 'dark', 'hc'].map(theme => `${identity}/${theme}/${brand}`)));
  expected.push(...['A', 'B'].flatMap(brand => ['light', 'dark'].map(theme => `pattern:viz:running-total-area/${theme}/${brand}`)));
  assert.equal(cells.length, 16, 'Exactly 16 temporal registry cells are required');
  assert.deepEqual(cells.map(cell => `${cell.identity}/${cell.request.theme}/${cell.request.brand}`).sort(), expected.sort());
  assert.equal(new Set(cells.map(cell => cell.id)).size, 16, 'Temporal cell IDs must be unique');
  assert(cells.every(cell => /^[a-zA-Z0-9_/-]+$/.test(cell.id) && !cell.id.includes('..')));
}

export async function captureTemporal(requestsFile: string, out: string): Promise<Capture> {
  assert(!fs.existsSync(out), 'Capture output exists; preserve earlier evidence by choosing a new directory');
  const requestsBytes = fs.readFileSync(requestsFile);
  const requests = JSON.parse(requestsBytes.toString()) as Requests;
  assert.equal(requests.schemaVersion, 1); assertTemporalPopulation(requests.cells);
  assert(['America/Chicago', 'UTC'].includes(process.env.TZ ?? ''), 'Set an explicit probe timezone');
  const { handle: render } = await import('../../packages/mcp-server/src/tools/viz.render.js');
  const { getAjv } = await import('../../packages/mcp-server/src/lib/ajv.js');
  const { renderEChartsToSvg, normalizeEChartsSvg, getEChartsRenderWorkerState } = await import('@oods/viz-render');
  const inputSchema = JSON.parse(fs.readFileSync(new URL('../../packages/mcp-server/src/schemas/viz.render.input.json', import.meta.url), 'utf8'));
  const validate = getAjv().getSchema(inputSchema.$id) ?? getAjv().compile(inputSchema);
  const result: Capture = { schemaVersion: 1, timezone: process.env.TZ!, resolvedTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone, nodeVersion: process.version, requestsSha256: hash(requestsBytes), cells: [] };
  fs.mkdirSync(out, { recursive: true });
  for (const cell of requests.cells) {
    const directory = path.join('cells', cell.id);
    const destination = path.join(out, directory);
    fs.mkdirSync(destination, { recursive: true });
    fs.writeFileSync(path.join(destination, 'request.json'), serialize(cell.request));
    const admitted = structuredClone(cell.request);
    assert(validate(admitted), `${cell.id}: request boundary rejected ${JSON.stringify(validate.errors)}`);
    fs.writeFileSync(path.join(destination, 'admitted-request.json'), serialize(admitted));
    // JSON projection captures what crosses the tools/call boundary, including
    // removal of non-transportable tooltip formatter functions.
    const rendered = JSON.parse(JSON.stringify(await render(admitted)));
    fs.writeFileSync(path.join(destination, 'response.json'), serialize(rendered));
    assert.equal(rendered.status, 'ok', `${cell.id}: ${JSON.stringify(rendered.errors)}`);
    assert(rendered.svg && rendered.normalizedSpec && rendered.echartsSpec, `${cell.id}: both declared compiler outputs and real primary SVG are required`);
    assert.equal(hash(rendered.svg), rendered.svgHash);
    fs.writeFileSync(path.join(destination, 'primary.svg'), rendered.svg);
    const optionBytes = serialize(rendered.echartsSpec);
    fs.writeFileSync(path.join(destination, 'echarts-option.json'), optionBytes);
    let echarts: Observation['echarts'];
    try {
      const svg = normalizeEChartsSvg(await renderEChartsToSvg(rendered.echartsSpec, { width: 600, height: 400 }));
      assert(svg.includes('<svg'), `${cell.id}: ECharts returned no SVG`);
      fs.writeFileSync(path.join(destination, 'echarts.svg'), svg);
      echarts = { optionHash: hash(optionBytes), status: 'rendered', svgHash: hash(svg) };
    } catch (error) {
      const typed = error as Error & { code?: string };
      // Availability is secondary to the complete 16-cell public SVG proof;
      // typed renderer limitations remain explicit and must match across zones.
      assert(typed.name === 'EChartsRenderError' && typed.code === 'ECHARTS_UNSUPPORTED_OPTION'
        && typed.message === 'Unsupported ECharts SSR series type: "line".', `${cell.id}: unexpected ECharts failure: ${typed.stack}`);
      echarts = { optionHash: hash(optionBytes), status: 'unavailable', error: { name: typed.name, code: typed.code, message: typed.message } };
      fs.writeFileSync(path.join(destination, 'echarts-error.json'), serialize(echarts.error));
    }
    result.cells.push({ ...cell, directory, svgHash: rendered.svgHash, echarts });
    fs.writeFileSync(path.join(out, 'observations.json'), serialize(result));
  }
  const lifecycle = await getEChartsRenderWorkerState();
  fs.writeFileSync(path.join(out, 'echarts-worker.json'), serialize(lifecycle));
  assert.equal(lifecycle.activeCharts, 0); assert.equal(lifecycle.activeJobs, 0);
  assert.equal(lifecycle.chartsCreated, lifecycle.chartsDisposed);
  console.log(serialize({ status: 'captured', timezone: result.timezone, cells: result.cells.length, echartsRendered: result.cells.filter(cell => cell.echarts.status === 'rendered').length, out }));
  return result;
}

/** A report flag cannot substitute for equality of the actual retained SVG bytes. */
export function compareTemporal(leftFile: string, rightFile: string) {
  const read = (file: string): Capture => JSON.parse(fs.readFileSync(file, 'utf8')) as Capture;
  const left = read(leftFile), right = read(rightFile);
  assertTemporalPopulation(left.cells); assertTemporalPopulation(right.cells);
  assert.equal(left.timezone, 'America/Chicago'); assert.equal(right.timezone, 'UTC');
  assert.equal(left.requestsSha256, right.requestsSha256);
  const content = (file: string, cell: Observation, name: string): string => fs.readFileSync(path.join(path.dirname(file), cell.directory, name), 'utf8');
  const checked = (file: string, cell: Observation) => {
    const response = JSON.parse(content(file, cell, 'response.json'));
    const svg = content(file, cell, 'primary.svg');
    assert.equal(response.status, 'ok'); assert.equal(svg, response.svg); assert.equal(hash(svg), response.svgHash); assert.equal(hash(svg), cell.svgHash);
    assert.deepEqual(JSON.parse(content(file, cell, 'request.json')), cell.request);
    const option = content(file, cell, 'echarts-option.json');
    assert.deepEqual(JSON.parse(option), response.echartsSpec); assert.equal(hash(option), cell.echarts.optionHash);
    const echartsSvg = cell.echarts.status === 'rendered' ? content(file, cell, 'echarts.svg') : undefined;
    if (echartsSvg !== undefined) assert.equal(hash(echartsSvg), (cell.echarts as { svgHash: string }).svgHash);
    else assert.deepEqual(JSON.parse(content(file, cell, 'echarts-error.json')), (cell.echarts as { error: unknown }).error);
    return { svg, option, echartsSvg };
  };
  const rows = left.cells.map(cell => {
    const other = right.cells.find(candidate => candidate.id === cell.id)!;
    assert(other); assert.deepEqual(cell.request, other.request); assert.equal(cell.registrySvgHash, other.registrySvgHash);
    const a = checked(leftFile, cell), b = checked(rightFile, other);
    const errorA = cell.echarts.status === 'unavailable' ? cell.echarts.error : null;
    const errorB = other.echarts.status === 'unavailable' ? other.echarts.error : null;
    return { id: cell.id, identity: cell.identity, theme: cell.request.theme, brand: cell.request.brand,
      chicagoSvgHash: cell.svgHash, utcSvgHash: other.svgHash, registrySvgHash: cell.registrySvgHash,
      primarySvgEqual: a.svg === b.svg, registryEqual: cell.svgHash === cell.registrySvgHash && other.svgHash === cell.registrySvgHash,
      echartsOptionEqual: a.option === b.option, echartsStatusEqual: cell.echarts.status === other.echarts.status,
      echartsRendered: cell.echarts.status === 'rendered' && other.echarts.status === 'rendered',
      echartsSvgEqual: a.echartsSvg !== undefined && b.echartsSvg !== undefined ? a.echartsSvg === b.echartsSvg : null,
      echartsErrorsEqual: JSON.stringify(errorA) === JSON.stringify(errorB) };
  });
  const different = rows.filter(row => !row.primarySvgEqual || !row.echartsOptionEqual || !row.echartsStatusEqual || row.echartsSvgEqual === false || !row.echartsErrorsEqual).map(row => row.id);
  return { schemaVersion: 1, status: different.length ? 'different' : 'equal', left: leftFile, right: rightFile, requestsSha256: left.requestsSha256,
    cells: rows.length, primaryEqual: rows.filter(row => row.primarySvgEqual).length, registryEqual: rows.filter(row => row.registryEqual).length,
    echartsOptionsEqual: rows.filter(row => row.echartsOptionEqual).length, echartsRendered: rows.filter(row => row.echartsRendered).length,
    echartsSvgEqual: rows.filter(row => row.echartsSvgEqual).length, different, rows };
}

async function main() {
  const args = process.argv.slice(2);
  const value = (flag: string): string => { const found = args[args.indexOf(flag) + 1]; assert(args.includes(flag) && found && !found.startsWith('--'), `Missing ${flag}`); return path.resolve(found); };
  if (args.includes('--compare')) {
    const result = compareTemporal(value('--left'), value('--right'));
    const out = value('--out'); fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, serialize(result));
    console.log(serialize(result));
    assert.equal(result.status, 'equal', 'Cross-timezone SVG equality failed');
    if (args.includes('--check-registry')) assert.equal(result.registryEqual, 16, 'Temporal probe differs from the current registry');
  } else await captureTemporal(value('--requests'), value('--out'));
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.stack ?? error); process.exitCode = 1; });
}
