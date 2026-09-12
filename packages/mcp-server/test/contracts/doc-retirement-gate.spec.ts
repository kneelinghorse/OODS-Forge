import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// Doc-retirement gate (feedback-73 / review #1004 item 4). When an MCP tool is
// retired, its public name must not linger in live source or documentation —
// otherwise an agent is told to call a tool the server no longer registers.
// Sprint 195 extends the original docs gate to every retired name repo-wide.
//
// Dot, adapter underscore and SDK camel spellings are gated, but prose forms
// and unrelated identifiers are legitimate concepts that must NOT trip it:
//   - "purity audit" = the --cmp-* CSS token linter (a CI check, never an MCP tool)
//   - "review kit"   = the surviving `billing.reviewKit` tool + generic prose
//   - "VR" / "visual regression" = the VRT test harness
// (s137 m03 sweep + decision #1007 confirmed these are false positives.)

const ROOT = path.resolve(import.meta.dirname, '../../../../');
const DOCS_DIR = path.join(ROOT, 'docs');

// Assemble the retirement vocabulary so the gate can scan its own source.
// A future retirement appends its name parts here.
const RETIRED_TOOL_NAMES = [
  ['purity', 'audit'], ['vrt', 'run'], ['reviewKit', 'create'], ['release', 'verify'],
].map(parts => parts.join('.'));
const RETIRED_PUBLIC_NAMES = [...RETIRED_TOOL_NAMES, ['viz', 'compose'].join('.')];
const RETIRED_REVIEW_NAME = ['re', 'view'].join('');

function spellings(name: string): string[] {
  const parts = name.split('.');
  return [name, parts.join('_'), parts.map((part, index) => index ? part[0].toUpperCase() + part.slice(1) : part).join('')];
}

function retiredReferences(content: string): string[] {
  const names = RETIRED_PUBLIC_NAMES.filter(name => spellings(name).some(spelling => {
    const escaped = spelling.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // MCP-prefixed wire names are still tool references; runUrl-style properties
    // and longer SDK identifiers are not the retired name.
    return new RegExp(`(?<![A-Za-z0-9_$])(?:mcp__[A-Za-z0-9_]+__)?${escaped}(?![A-Za-z0-9_$])`).test(content);
  }));
  // The single-word retirement needs tool context: a callable, a wire/registry
  // name, a tool-list entry, or an explicit instruction. Fidelity enums, panel
  // phases, human reviews and the retained internal policy evaluators are valid.
  const name = RETIRED_REVIEW_NAME;
  const quoted = '["\'`]' + name + '["\'`]';
  const reviewPatterns = [
    `(?<![A-Za-z0-9_$])(?:mcp__[A-Za-z0-9_]+__)?${name}\\(`,
    `(?<![A-Za-z0-9_$])${name}\\s+\\(\\s*(?:[{}]|action\\s*:|resolve\\b|chain\\b)`,
    `\\bmcp__[A-Za-z0-9_]+__${name}\\b`,
    `\\b(?:callTool|runTool|invokeTool|registerTool|tool)\\s*\\(\\s*${quoted}`,
    `["'\\x60]?\\b(?:tool|toolName|rpc\\.method)["'\\x60]?\\s*(?::|={1,3})\\s*${quoted}`,
    // MCP tools/call uses params.name; tool descriptors use name + inputSchema.
    `\\b(?:params|arguments)["']?\\s*:\\s*\\{[^}]*["']?name["']?\\s*:\\s*${quoted}`,
    `["']?name["']?\\s*:\\s*${quoted}\\s*,[^}]*\\binputSchema\\b`,
    `(?:^|[{,])\\s*${quoted}\\s*:\\s*\\{`,
    `\\b(?:tools|auto|onDemand|allowed|families)["']?\\s*[:=]\\s*(?:new\\s+Set(?:<[^>]*>)?\\s*\\(\\s*)?\\[[^\\]]*${quoted}`,
    `\\bToolName\\s*=\\s*[^;]*${quoted}`,
    `\\b(?:MCP tool|[Tt]ool|[Cc]all|[Ii]nvoke|[Rr]un)\\s+${quoted}`,
    `${quoted}\\s+(?:MCP\\s+)?tool\\b`,
    `${quoted}\\s*\\(\\s*action\\s*:`,
  ];
  if (reviewPatterns.some(pattern => new RegExp(pattern, 'm').test(content))) names.push(name);
  return names;
}

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

// s196-m04 requires a generated historical retirement list in Tool-Specs.
// Exempt exactly that ledger-derived table, never arbitrary surrounding prose
// or callable instructions. The live registration assertions below stay strict.
function withoutDocumentedRetirements(file: string, content: string): string {
  if (file !== 'docs/mcp/Tool-Specs.md') return content;
  const start = '<!-- tool-retirements:start -->';
  const end = '<!-- tool-retirements:end -->';
  expect(content.split(start)).toHaveLength(2);
  expect(content.split(end)).toHaveLength(2);
  const first = content.indexOf(start);
  const last = content.indexOf(end);
  expect(last).toBeGreaterThan(first);
  const block = content.slice(first + start.length, last).trim();
  const ledger = JSON.parse(fs.readFileSync(path.join(ROOT, 'packages/mcp-server/registry/tool-capability-ledger.v1.json'), 'utf8'));
  const cell = (value: string) => value.replaceAll('|', '\\|').replace(/\r?\n/g, '<br>');
  expect(block.split('\n')).toEqual([
    '| Tool | Reason | Decision IDs |',
    '|---|---|---|',
    ...ledger.retired.map((row: { name: string; reason: string; decisionIds: number[] }) =>
      `| \`${JSON.stringify(row.name)}\` | ${cell(row.reason)} | ${row.decisionIds.join(', ')} |`),
  ]);
  return content.slice(0, first) + content.slice(last + end.length);
}

describe('doc-retirement gate (feedback-73)', () => {
  it('allows only the exact ledger retirement table and still rejects callable guidance', () => {
    const file = 'docs/mcp/Tool-Specs.md';
    const content = fs.readFileSync(path.join(ROOT, file), 'utf8');
    const retired = RETIRED_PUBLIC_NAMES.at(-1)!;
    const instruction = `Call \`${retired}\`({}).`;
    expect(retiredReferences(withoutDocumentedRetirements(file, `${content}\n${instruction}`))).toContain(retired);
    expect(() => withoutDocumentedRetirements(file, content.replace('<!-- tool-retirements:end -->', `${instruction}\n<!-- tool-retirements:end -->`))).toThrow();
    expect(() => withoutDocumentedRetirements(file, `${content}\n<!-- tool-retirements:start -->`)).toThrow();
    // The same table pasted into any other live document gets no exemption.
    expect(retiredReferences(withoutDocumentedRetirements('docs/other.md', content))).toContain(retired);
  });

  it('no doc references a retired MCP tool by its dotted name (outside history/changelog)', () => {
    const offenders: string[] = [];
    for (const file of walkMarkdown(DOCS_DIR)) {
      const rel = path.relative(ROOT, file);
      if (HISTORY_ALLOWLIST.some((re) => re.test(rel))) continue;
      const content = withoutDocumentedRetirements(rel, fs.readFileSync(file, 'utf-8'));
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

describe('retired tool reference matcher (s195-m01)', () => {
  it.each(RETIRED_PUBLIC_NAMES)('rejects every public spelling of %s, including MCP-prefixed calls', name => {
    for (const spelling of spellings(name)) {
      for (const content of [spelling, `Call \`${spelling}\`.`, `{"tool":"${spelling}"}`, `client.${spelling}({})`, `mcp__forge__${spelling}({})`]) {
        expect(retiredReferences(content), content).toContain(name);
      }
    }
  });

  it('rejects the retired single-word tool only in callable, wire, registry or instruction contexts', () => {
    const name = RETIRED_REVIEW_NAME;
    for (const content of [
      `${name}({ action: 'resolve' })`, `${name}(input)`, `${name} ({})`, `client.${name}({})`, `mcp__forge__${name}({})`,
      `callTool('${name}', {})`, `runTool("${name}", {})`, `invokeTool('${name}', {})`, `server.registerTool('${name}', {})`, `server.tool('${name}', {})`,
      `{"method":"tools/call","params":{"name":"${name}","arguments":{}}}`, `{ name: '${name}', inputSchema: {} }`,
      `{"tool":"${name}"}`, `toolName: '${name}'`, `tool === '${name}'`, `"rpc.method": "${name}"`,
      `"${name}": { inputSchema: {} }`, `tools: ['health', '${name}']`, `"auto": [\n  "health",\n  "${name}"\n]`, `type ToolName =\n  | 'health'\n  | '${name}';`,
      `const families = new Set(['map', '${name}']);`,
      `${name} (resolve, chain)`,
      `Call \`${name}\``, `Use the \`${name}\` MCP tool`, `MCP tool \`${name}\``, `\`${name}\` (action: resolve)`,
    ]) expect(retiredReferences(content), content).toContain(name);
  });

  it('allows distinct prose, longer identifiers and current fidelity/panel/internal APIs', () => {
    for (const content of [
      'purity audit', 'review kit', 'visual regression', 'Please review the tool changes.',
      'billing.reviewKit', 'design.preview', "fidelityKind: 'review'", "phase = 'review'",
      "reasonPrefix: 'review'", "framework: 'review'", "{ name: 'review' }", '`review` – warnings only',
      "case 'review': { emitReview(); }", 'independent review (PS-2026-09-08-011)',
      'review.resolve', 'review.chain',
      ...RETIRED_PUBLIC_NAMES.flatMap(name => spellings(name).flatMap(spelling => [`${spelling}Url`, `previous${spelling}`, `${spelling}_result`])),
    ]) expect(retiredReferences(content), content).toEqual([]);
  });
});

describe('Sprint 194 retired public surfaces (CMOS #1922)', () => {
  it('does not reintroduce any retired tool outside retained evidence and planning', async () => {
    const { execFileSync } = await import('node:child_process');
    const files = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).split('\0');
    const offenders: string[] = [];
    for (const file of new Set(files)) {
      if (!file || /^(artifacts|cmos)\//.test(file)) continue;
      const full = path.join(ROOT, file);
      if (!fs.existsSync(full) || !fs.statSync(full).isFile()) continue;
      const bytes = fs.readFileSync(full);
      if (bytes.includes(0)) continue;
      let content = withoutDocumentedRetirements(file, bytes.toString('utf8'));
      // The required ledger retirement record is historical data, never a live row.
      if (file === 'packages/mcp-server/registry/tool-capability-ledger.v1.json') {
        const ledger = JSON.parse(content);
        expect(ledger.retired).toEqual(JSON.parse(fs.readFileSync(path.join(ROOT, 'artifacts/product-reality/sprint-194/m04/retired-tools.json'), 'utf8')).retired);
        delete ledger.retired;
        content = JSON.stringify(ledger);
      }
      for (const name of retiredReferences(content)) offenders.push(`${file} → ${name}`);
    }
    expect(offenders).toEqual([]);
  });

  it('removes all retired tools from every registered and advertised surface', () => {
    const read = (file: string) => fs.readFileSync(path.join(ROOT, file), 'utf8');
    const registry = JSON.parse(read('packages/mcp-server/src/tools/registry.json'));
    const adapter = JSON.parse(read('packages/mcp-adapter/tool-descriptions.json'));
    const agentPolicy = JSON.parse(read('configs/agent/policy.json'));
    const serverPolicy = JSON.parse(read('packages/mcp-server/src/security/policy.json'));
    for (const name of [...RETIRED_PUBLIC_NAMES, RETIRED_REVIEW_NAME]) {
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
