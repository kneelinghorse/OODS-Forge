import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { collectPackageFacts } from '../../scripts/product-reality/s196-release-readiness.js';

const root = resolve(import.meta.dirname, '../..');
const fields = ['private', 'publishConfig', 'license'] as const;
type Shape = Partial<Record<typeof fields[number], unknown>>;
type Row = { path: string; name: string; shape: Shape; manifestSha256?: string };
type Presence = { present: false } | { present: true; value: unknown };
type Approval = { path: string; field: typeof fields[number]; before: Presence; after: Presence; decisionId: number; status: string };
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');
const baseline = JSON.parse(read('artifacts/product-reality/sprint-196/m06/package-shapes-baseline.json')) as { sourceHead: string; packages: Row[] };
const packet = read('cmos/planning/forge-gate2-decision-packet.md');
const shape = (manifest: Record<string, unknown>): Shape => Object.fromEntries(fields.filter(field => Object.hasOwn(manifest, field)).map(field => [field, manifest[field]]));
const presence = (value: Shape, field: typeof fields[number]): Presence => Object.hasOwn(value, field) ? { present: true, value: value[field] } : { present: false };
const canonical = (value: unknown): string => JSON.stringify(value, (_key, item) => item && typeof item === 'object' && !Array.isArray(item)
  ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b))) : item);

function approvalsFrom(document: string): Approval[] {
  const start = '<!-- publish-shape-approvals:start -->';
  const end = '<!-- publish-shape-approvals:end -->';
  assert.equal(document.split(start).length, 2, 'Exactly one approval block is required');
  assert.equal(document.split(end).length, 2, 'Exactly one approval block is required');
  const section = document.split(start)[1]!.split(end)[0]!;
  const match = /^\s*```json\s*\n([\s\S]*?)\n```\s*$/.exec(section);
  assert(match, 'Approval block must contain only a JSON array');
  const approvals = JSON.parse(match[1]) as Approval[];
  assert(Array.isArray(approvals), 'Approval records must be an array');
  return approvals;
}

function verifyShapes(before: Row[], after: Row[], approvals: Approval[], document: string): void {
  assert.deepEqual(after.map(row => row.path).sort(), before.map(row => row.path).sort(), 'Package membership needs a reviewed baseline and decision');
  const used = new Set<Approval>();
  for (const prior of before) {
    const current = after.find(row => row.path === prior.path)!;
    assert.equal(current.name, prior.name, 'Package identity needs a reviewed baseline and decision');
    for (const field of fields) {
      const left = presence(prior.shape, field), right = presence(current.shape, field);
      if (canonical(left) === canonical(right)) continue;
      const matching = approvals.filter(row => row.path === prior.path && row.field === field && canonical(row.before) === canonical(left) && canonical(row.after) === canonical(right));
      assert.equal(matching.length, 1, `${prior.path}#${field}: exact transition requires one packet decision`);
      const approval = matching[0]!;
      assert.equal(approval.status, 'approved', 'A proposed decision cannot authorize a publish-shape change');
      assert(Number.isSafeInteger(approval.decisionId) && approval.decisionId > 0 && document.includes(`#${approval.decisionId}`), 'Approval must name a referenced CMOS decision ID');
      used.add(approval);
    }
  }
  assert.equal(used.size, approvals.length, 'Unused or duplicate approvals must not grant broader authority');
}

const MIT_MANIFESTS = ["package.json", "packages/a11y-tools/package.json", "packages/tokens/package.json", "packages/tw-variants/package.json", "packages/viz-core/package.json", "packages/viz-render/package.json", "packages/component-contracts/package.json", "packages/component-styles/package.json", "packages/components-react/package.json", "packages/components-vue/package.json"];
const UNLICENSED_MANIFESTS = ["packages/artifacts/package.json", "packages/mcp-adapter/package.json", "packages/mcp-bridge/package.json", "packages/mcp-server/package.json", "packages/release-utils/package.json", "packages/schemas-tools/package.json", "packages/sdk/package.json", "tools/agents-smoke/package.json", "tools/design-lab-shell/package.json", "tools/oods-agent-cli/package.json", "tools/soak-runner/package.json", "apps/playground/package.json"];
const currentRows = (): Row[] => collectPackageFacts(root).map(row => ({ path: row.path, name: row.name, shape: shape(JSON.parse(read(row.path))) }));

describe('Gate-2 preparation changes no publish shape without a named decision (s196 m06)', () => {
  it('pins every root/workspace baseline to clean Git bytes and permits only the approved root hygiene, s200 package safety and s200 license changes', () => {
    expect(baseline.sourceHead).toBe('8fd3d04ddf9af7d17863308ab579e3023ef4f491');
    expect(baseline.packages).toHaveLength(22);
    for (const row of baseline.packages) {
      const bytes = execFileSync('git', ['show', `${baseline.sourceHead}:${row.path}`], { cwd: root });
      const digest = createHash('sha256').update(bytes).digest('hex');
      expect(row.manifestSha256?.replace(/^sha256:/, '')).toBe(digest);
      expect(shape(JSON.parse(bytes.toString()))).toEqual(row.shape);
    }
    const approvals = approvalsFrom(packet);
    expect(approvals).toEqual([
      { path: 'package.json', field: 'private', before: { present: false }, after: { present: true, value: true }, decisionId: 1952, status: 'approved' },
      ...['a11y-tools', 'tw-variants', 'tokens', 'viz-render', 'viz-core'].flatMap(name => [
        { path: `packages/${name}/package.json`, field: 'private', before: { present: false }, after: { present: true, value: true }, decisionId: 2061, status: 'approved' },
        { path: `packages/${name}/package.json`, field: 'publishConfig', before: { present: true, value: { access: 'public', provenance: true } }, after: { present: false }, decisionId: 2061, status: 'approved' },
      ]),
      // s200-m03: every guarded manifest takes the PolyForm Noncommercial id under #2061 (ten from MIT, twelve from absent).
      ...MIT_MANIFESTS.map(path => ({ path, field: 'license', before: { present: true, value: 'MIT' }, after: { present: true, value: 'PolyForm-Noncommercial-1.0.0' }, decisionId: 2061, status: 'approved' })),
      ...UNLICENSED_MANIFESTS.map(path => ({ path, field: 'license', before: { present: false }, after: { present: true, value: 'PolyForm-Noncommercial-1.0.0' }, decisionId: 2061, status: 'approved' })),
    ]);
    expect(JSON.parse(read('package.json')).private).toBe(true);
    verifyShapes(baseline.packages, currentRows(), approvals, packet);
  });

  it.each(fields)('refuses an unapproved workspace %s transition', field => {
    const rows = currentRows();
    const selected = rows.find(row => row.path === 'packages/viz-core/package.json')!;
    selected.shape[field] = field === 'private' ? false : field === 'license' ? 'UNLICENSED' : { access: 'restricted', provenance: true };
    expect(() => verifyShapes(baseline.packages, rows, approvalsFrom(packet), packet)).toThrow('exact transition requires one packet decision');
  });

  it.each(['proposed', 'missing-id', 'wrong-before', 'wrong-after', 'duplicate', 'unused'])('does not treat a %s approval as release permission', mutation => {
    const approvals = approvalsFrom(packet);
    if (mutation === 'proposed') approvals[0].status = 'proposed';
    if (mutation === 'missing-id') approvals[0].decisionId = 0;
    if (mutation === 'wrong-before') approvals[0].before = { present: true, value: false };
    if (mutation === 'wrong-after') approvals[0].after = { present: true, value: false };
    if (mutation === 'duplicate') approvals.push(structuredClone(approvals[0]));
    if (mutation === 'unused') approvals.push({ ...structuredClone(approvals[0]), path: 'packages/viz-core/package.json' });
    expect(() => verifyShapes(baseline.packages, currentRows(), approvals, packet)).toThrow();
  });

  it('requires explicit baseline review when a package is added or removed', () => {
    const rows = currentRows();
    expect(() => verifyShapes(baseline.packages, rows.slice(1), approvalsFrom(packet), packet)).toThrow('Package membership');
    expect(() => verifyShapes(baseline.packages, [...rows, { path: 'packages/new/package.json', name: '@oods/new', shape: { private: true } }], approvalsFrom(packet), packet)).toThrow('Package membership');
  });
});
