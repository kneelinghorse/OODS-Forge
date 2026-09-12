import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { assertTemporalPopulation, compareTemporal } from '../../../../scripts/product-reality/s196-temporal-probe.js';

const root = path.resolve(import.meta.dirname, '../../../..');
const reportPath = process.env.OODS_TEMPORAL_BITE_REPORT
  ?? path.join(root, 'artifacts/product-reality/sprint-196/m05/timezone-bite/bite.json');
const directory = path.dirname(reportPath);
const read = (relative: string) => fs.readFileSync(path.join(directory, relative), 'utf8');
const json = (relative: string) => JSON.parse(read(relative));
const hash = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex');
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const temporary: string[] = [];
afterEach(() => { for (const entry of temporary.splice(0)) fs.rmSync(entry, { recursive: true, force: true }); });
function comparison(phase: string) {
  return compareTemporal(path.join(directory, phase, 'chicago/observations.json'), path.join(directory, phase, 'utc/observations.json'));
}
const facts = ({ left: _left, right: _right, ...value }: ReturnType<typeof compareTemporal>) => value;

describe('s196 actual temporal UTC mutation restores every registered cell', () => {
  it('retains the complete 16-cell requests and exact source/dist restoration without changing registry inputs', () => {
    expect(report.status).toBe('passed'); expect(report.restoredByteIdentically).toBe(true);
    const requests = json('requests.json'); assertTemporalPopulation(requests.cells);
    expect(hash(read('requests.json'))).toBe(report.requestsSha256);
    expect(requests.cells.filter((cell: any) => cell.identity === 'line')).toHaveLength(6);
    expect(requests.cells.filter((cell: any) => cell.identity === 'area')).toHaveLength(6);
    expect(requests.cells.filter((cell: any) => cell.identity === 'pattern:viz:running-total-area')).toHaveLength(4);
    expect(report.distRestored).toEqual(report.distBefore);
    expect(report.distMutated.sha256).not.toBe(report.distBefore.sha256);
    for (const source of report.sources) {
      expect(hash(read(`source-before/${source.file}`))).toBe(source.beforeSha256);
      expect(hash(read(`source-mutated/${source.file}`))).toBe(source.mutatedSha256);
      expect(hash(read(`source-restored/${source.file}`))).toBe(source.beforeSha256);
      expect(source.restoredSha256).toBe(source.beforeSha256);
      expect(source.mutatedSha256).not.toBe(source.beforeSha256);
    }
    for (const input of report.inputs) expect(hash(read(input.path))).toBe(input.sha256);
  });

  it('recomputes all original/restored SVG and option bytes in both timezones against the retained current registry', () => {
    for (const phase of ['baseline', 'restored']) {
      const result = comparison(phase);
      expect(result).toMatchObject({ status: 'equal', cells: 16, primaryEqual: 16, registryEqual: 16, echartsOptionsEqual: 16, different: [] });
      expect(facts(result)).toEqual(facts(report[phase]));
      expect(report.commands.find((command: any) => command.name === `${phase}-compare`).exitCode).toBe(0);
    }
    expect(report.restored.rows.map((row: any) => row.chicagoSvgHash)).toEqual(report.baseline.rows.map((row: any) => row.chicagoSvgHash));
  });

  it('requires real cross-timezone SVG divergence and an actual failing assertion after physical UTC removal', () => {
    const result = comparison('mutated');
    expect(result.status).toBe('different'); expect(result.primaryEqual).toBeLessThan(16);
    expect(result.cells).toBe(16); expect(result.different.length).toBeGreaterThan(0);
    expect(facts(result)).toEqual(facts(report.mutated));
    const command = report.commands.find((row: any) => row.name === 'mutated-compare');
    expect(command.exitCode).toBe(1);
    expect(read(command.stderr)).toContain('Cross-timezone SVG equality failed');
    for (const phase of ['baseline', 'mutated', 'restored']) expect(report.commands.find((row: any) => row.name === `${phase}-build`).exitCode).toBe(0);
  });

  it('records ECharts temporal options while retaining its precise unsupported-line SSR limitation', () => {
    for (const phase of ['baseline', 'mutated', 'restored']) for (const zone of ['chicago', 'utc']) {
      const capture = json(`${phase}/${zone}/observations.json`);
      expect(capture.timezone).toBe(zone === 'chicago' ? 'America/Chicago' : 'UTC');
      for (const cell of capture.cells) {
        expect(json(`${phase}/${zone}/${cell.directory}/echarts-option.json`).useUTC).toBe(phase !== 'mutated');
        expect(cell.echarts).toMatchObject({ status: 'unavailable', error: { name: 'EChartsRenderError', code: 'ECHARTS_UNSUPPORTED_OPTION', message: 'Unsupported ECharts SSR series type: "line".' } });
        const caller = json(`${phase}/${zone}/${cell.directory}/request.json`);
        const admitted = json(`${phase}/${zone}/${cell.directory}/admitted-request.json`);
        expect(caller).toEqual(cell.request);
        expect(admitted).toMatchObject(caller);
      }
      expect(json(`${phase}/${zone}/echarts-worker.json`)).toMatchObject({ activeCharts: 0, activeJobs: 0, chartsCreated: 0, chartsDisposed: 0 });
    }
  });

  it('cannot accept dropped cells, duplicate identities or forged retained SVG bytes', () => {
    const cells = json('requests.json').cells;
    expect(() => assertTemporalPopulation(cells.slice(1))).toThrow('Exactly 16');
    const duplicate = structuredClone(cells); duplicate[0] = duplicate[1];
    expect(() => assertTemporalPopulation(duplicate)).toThrow();
    const copy = fs.mkdtempSync(path.join(os.tmpdir(), 'oods-temporal-proof-')); temporary.push(copy);
    fs.cpSync(path.join(directory, 'restored'), copy, { recursive: true });
    const capture = JSON.parse(fs.readFileSync(path.join(copy, 'chicago/observations.json'), 'utf8'));
    const svg = path.join(copy, 'chicago', capture.cells[0].directory, 'primary.svg');
    fs.appendFileSync(svg, '<!-- changed pixels receipt -->');
    expect(() => compareTemporal(path.join(copy, 'chicago/observations.json'), path.join(copy, 'utc/observations.json'))).toThrow();
  });

  it('retains raw commands with explicit independent timezones and successful capture exits', () => {
    for (const command of report.commands) {
      expect(hash(read(command.stdout))).toBe(command.stdoutSha256);
      expect(hash(read(command.stderr))).toBe(command.stderrSha256);
      expect(command.error).toBeUndefined(); expect(command.signal).toBeNull();
      expect(command.exitCode).toBe(command.name === 'mutated-compare' ? 1 : 0);
      if (command.name.endsWith('-chicago')) expect(command.environment.TZ).toBe('America/Chicago');
      if (command.name.endsWith('-utc')) expect(command.environment.TZ).toBe('UTC');
    }
  });
});
