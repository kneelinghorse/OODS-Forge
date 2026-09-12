import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '../../../..');
const directory = 'artifacts/product-reality/sprint-196/m05/doc-bites';
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');
const report = JSON.parse(read(`${directory}/bites.json`));
const sha = (value: string) => `sha256:${createHash('sha256').update(value).digest('hex')}`;
const historical = (path: string) => execFileSync('git', ['show', `${report.sourceHead}:${path}`], { cwd: root, encoding: 'utf8' });
const changes = [
  ['component-page', 'Proposed classification: `native`', 'Proposed classification: `alias`'],
  ['component-index', '109 component pages', '108 component pages'],
  ['tool-specs', 'The 24 live tools', 'The 25 live tools'],
  ['html-claim', 'The trait inventory (45)</h2>', 'The trait inventory (46)</h2>'],
  ['connections', '`default` = 19 auto tools', '`default` = 20 auto tools'],
  ['api-page', 'default TTL: 30 minutes', 'default TTL: 31 minutes'],
  ['server-readme', '19 tools by default', '20 tools by default'],
  ['bridge-readme', '19 tools by default', '20 tools by default'],
  ['docs-readme', 'composes 6 traits', 'composes 7 traits'],
  ['root-readme', '## MCP tool surface (24 tools)', '## MCP tool surface (25 tools)'],
];

describe('physical documentation bites retain actual stale-check refusals (s196 m05)', () => {
  it('mutated ten real generated surfaces, each rejected and restored to its immutable source bytes', () => {
    expect(report.sourceHead).toBe('944f4dda5f784e266310978b31f65b3d452e6387');
    expect(report.summary).toMatchObject({ bites: 11, passed: 11, failed: 0 });
    expect(report.allRestoredByteIdentically).toBe(true);
    for (const [id, beforeText, mutantText] of changes) {
      const row = report.records.find((item: any) => item.id === id);
      const before = historical(row.path);
      expect(before.split(beforeText)).toHaveLength(2);
      expect(sha(before)).toBe(row.beforeSha256);
      expect(sha(before.replace(beforeText, mutantText))).toBe(row.mutatedSha256);
      expect(row.mutatedSha256).not.toBe(row.beforeSha256);
      expect(row.restoredSha256).toBe(row.beforeSha256);
      expect(row.restoredByteIdentically).toBe(true);
      expect(row.commands.map((command: any) => command.exitCode)).toEqual([1, 0]);
      expect(read(`${directory}/${row.commands[0].log}`)).toMatch(/stale|differs|out of date/i);
      expect(row.commands.every((command: any) => command.signal === null && command.command.includes('--check'))).toBe(true);
    }
  });

  it('changes one valid ledger classification and counts, regenerates three dependent outputs, then restores them', () => {
    const row = report.records.find((item: any) => item.id === 'ledger-classification-counts');
    const bytes = historical(row.path);
    const ledger = JSON.parse(bytes);
    const selected = ledger.rows.find((item: any) => item.id === row.componentId);
    expect(selected.proposedClassification).toBe('recipe');
    selected.proposedClassification = 'native';
    expect(sha(bytes)).toBe(row.beforeSha256);
    expect(sha(JSON.stringify(ledger, null, 2) + '\n')).toBe(row.mutatedSha256);
    expect(row.sourceChange).toMatchObject({ from: 'recipe', to: 'native', membership: 109, approvedRuntimeCensus: null,
      beforeCounts: { native: 24, recipe: 84, alias: 1 }, afterCounts: { native: 25, recipe: 83, alias: 1 } });
    expect(row.changedOutputs.map((item: any) => item.path)).toEqual([
      'docs/components/AddressCollectionPanel.md', 'docs/components/README.md', 'docs/how-forge-works.html',
    ]);
    for (const output of row.changedOutputs) {
      expect(sha(historical(output.path))).toBe(output.beforeSha256);
      expect(output.regeneratedSha256).not.toBe(output.beforeSha256);
    }
    expect(row.commands.map((command: any) => command.exitCode)).toEqual([1, 0, 0, 1, 0, 0, 0, 0]);
    expect(row.restoredSha256).toBe(row.beforeSha256);
    expect(row.restoredByteIdentically).toBe(true);
  });

  it('pins archived inputs and target-local first-party resolution rather than current production docs', () => {
    const snapshot = JSON.parse(read(`${directory}/snapshot.json`));
    expect(snapshot.sourceHead).toBe(report.sourceHead);
    expect(snapshot.tracked).toHaveLength(report.summary.checkedTrackedFiles);
    expect(snapshot.built).toHaveLength(report.summary.checkedBuiltFiles);
    expect(sha(historical('pnpm-lock.yaml'))).toBe(snapshot.dependencyLockSha256);
    expect(snapshot.firstPartyLinks.length).toBeGreaterThan(0);
    expect(snapshot.resolutions).toHaveLength(4);
    expect(report.sourceIsolation).toBe('archived-source-and-copied-build-inputs');
    expect(read(`${directory}/isolation-guard.log`)).toMatch(/archive|snapshot|source/i);
  });
});
