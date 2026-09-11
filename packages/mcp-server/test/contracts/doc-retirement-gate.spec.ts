import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// Doc-retirement gate (feedback-73 / review #1004 item 4). When an MCP tool is
// retired, its dotted name must not linger anywhere in docs/ — otherwise an agent
// reading the docs is told to call a tool the server no longer registers. This gate
// greps the whole docs/ tree and fails on any surviving reference, so a future
// retirement that forgets a doc fails CI instead of leaking silently.
//
// IMPORTANT — only DOTTED tool names are gated (`purity.audit`, not "purity audit").
// The prose forms are legitimate distinct concepts that must NOT trip the gate:
//   - "purity audit" = the --cmp-* CSS token linter (a CI check, never an MCP tool)
//   - "review kit"   = the surviving `billing.reviewKit` tool + generic prose
//   - "VR" / "visual regression" = the VRT test harness
// (s137 m03 sweep + decision #1007 confirmed these are false positives.)

const ROOT = path.resolve(import.meta.dirname, '../../../../');
const DOCS_DIR = path.join(ROOT, 'docs');

// Retired MCP tools by dotted name. A future retirement appends its dotted name here.
const RETIRED_TOOL_NAMES = ['purity.audit', 'vrt.run', 'reviewKit.create', 'release.verify'];

// Docs permitted to reference a retired name (dated history / changelog snapshots).
const HISTORY_ALLOWLIST: RegExp[] = [/CHANGELOG/i, /(^|\/)history(\/|$)/i];

function walkMarkdown(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkMarkdown(full));
    else if (entry.name.endsWith('.md')) out.push(full);
  }
  return out;
}

describe('doc-retirement gate (feedback-73)', () => {
  it('no doc references a retired MCP tool by its dotted name (outside history/changelog)', () => {
    const offenders: string[] = [];
    for (const file of walkMarkdown(DOCS_DIR)) {
      const rel = path.relative(ROOT, file);
      if (HISTORY_ALLOWLIST.some((re) => re.test(rel))) continue;
      const content = fs.readFileSync(file, 'utf-8');
      for (const name of RETIRED_TOOL_NAMES) {
        const dotted = new RegExp(name.replace(/\./g, '\\.'), 'g');
        if (dotted.test(content)) offenders.push(`${rel} → ${name}`);
      }
    }
    expect(
      offenders,
      `Retired MCP tool names must not appear in docs (dotted form):\n${offenders.join('\n')}`,
    ).toEqual([]);
  });
});

// s194-m04: chart scaffold retirement is repo-wide, including source and SDK.
// Spell the names from parts so the gate itself cannot hide a real occurrence.
describe('Sprint 194 retired public surfaces (CMOS #1922)', () => {
  it('does not reintroduce the chart scaffold outside retained evidence and planning', async () => {
    const { execFileSync } = await import('node:child_process');
    const names = ['.', '_', ''].map((separator) => separator ? ['viz', 'compose'].join(separator) : 'viz' + 'Compose');
    const files = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).split('\0');
    const offenders: string[] = [];
    for (const file of new Set(files)) {
      if (!file || /^(artifacts|cmos)\//.test(file)) continue;
      const full = path.join(ROOT, file);
      if (!fs.existsSync(full) || !fs.statSync(full).isFile()) continue;
      const bytes = fs.readFileSync(full);
      if (bytes.includes(0)) continue;
      let content = bytes.toString('utf8');
      // The required ledger retirement record is historical data, never a live row.
      if (file === 'packages/mcp-server/registry/tool-capability-ledger.v1.json') {
        const ledger = JSON.parse(content);
        expect(ledger.retired).toEqual(JSON.parse(fs.readFileSync(path.join(ROOT, 'artifacts/product-reality/sprint-194/m04/retired-tools.json'), 'utf8')).retired);
        delete ledger.retired;
        content = JSON.stringify(ledger);
      }
      if (names.some(name => content.includes(name))) offenders.push(file);
    }
    expect(offenders).toEqual([]);
  });

  it('removes both retired tools from every registered and advertised surface', () => {
    const read = (file: string) => fs.readFileSync(path.join(ROOT, file), 'utf8');
    const registry = JSON.parse(read('packages/mcp-server/src/tools/registry.json'));
    const adapter = JSON.parse(read('packages/mcp-adapter/tool-descriptions.json'));
    const agentPolicy = JSON.parse(read('configs/agent/policy.json'));
    const serverPolicy = JSON.parse(read('packages/mcp-server/src/security/policy.json'));
    for (const name of [['viz', 'compose'].join('.'), 'review', 'release.verify']) {
      expect([...registry.auto, ...registry.onDemand]).not.toContain(name);
      expect(adapter[name]).toBeUndefined();
      expect(agentPolicy.tools.some((tool: any) => tool.name === name)).toBe(false);
      expect(serverPolicy.rules.some((rule: any) => rule.tool === name)).toBe(false);
      for (const source of ['packages/mcp-server/src/index.ts', 'packages/mcp-server/src/tools/registry.ts', 'packages/mcp-bridge/src/config.ts']) {
        expect(read(source)).not.toContain(`'${name}'`);
      }
      for (const suffix of ['input', 'output']) expect(fs.existsSync(path.join(ROOT, `packages/mcp-server/src/schemas/${name}.${suffix}.json`))).toBe(false);
      expect(fs.existsSync(path.join(ROOT, 'docs/api', name.replaceAll('.', '-') + '.md'))).toBe(false);
    }
    for (const action of ['resolve', 'chain']) {
      for (const direction of ['input', 'output']) expect(fs.existsSync(path.join(ROOT, `packages/mcp-server/src/schemas/review.${action}.${direction}.json`))).toBe(false);
    }
    expect(read('packages/mcp-server/src/schemas/generated.ts')).not.toMatch(/Source: review\.(?:resolve|chain)\./);
    expect(registry.auto).toHaveLength(19);
  });
});
