import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../../');

function read(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

describe('s90 registration audit', () => {
  const requiredMentions: Array<{ label: string; file: string; patterns: string[] }> = [
    // s107-m01b: the per-action tool names (map.apply, …) were consolidated into
    // grouped action-parameter tools and their standalone registrations removed.
    // Track the grouped `map` tool here; registry.snapshot stays as a standalone control.
    { label: 'registry.json', file: 'packages/mcp-server/src/tools/registry.json', patterns: ['"map"', '"registry.snapshot"'] },
    { label: 'registry.ts', file: 'packages/mcp-server/src/tools/registry.ts', patterns: ["'map'", "'registry.snapshot'"] },
    { label: 'policy.json', file: 'packages/mcp-server/src/security/policy.json', patterns: ['"tool": "map"', '"tool": "registry.snapshot"'] },
    { label: 'generated.ts', file: 'packages/mcp-server/src/schemas/generated.ts', patterns: ['// Source: map.input.json', '// Source: registry.snapshot.input.json'] },
    { label: 'tool-descriptions.json', file: 'packages/mcp-adapter/tool-descriptions.json', patterns: ['"map"', '"registry.snapshot"'] },
    { label: 'mcp-bridge config', file: 'packages/mcp-bridge/src/config.ts', patterns: ["name: 'map'", "name: 'registry.snapshot'"] },
    { label: 'server index', file: 'packages/mcp-server/src/index.ts', patterns: ["'map': {", "'registry.snapshot': {"] },
    { label: 'error registry', file: 'packages/mcp-server/src/errors/registry.ts', patterns: ['OODS-V201', 'OODS-N014'] },
  ];

  for (const entry of requiredMentions) {
    it(`wires both tools into ${entry.label}`, () => {
      const source = read(entry.file);
      for (const pattern of entry.patterns) {
        expect(source).toContain(pattern);
      }
    });
  }
});

// sprint-109 m05: viz.render must be wired into EVERY registration + policy
// surface so the aquex adapter and the :4466 bridge expose/authorize it
// identically (the two-policy-layer convention, #622). A single-layer gap here
// is the exact failure this guard exists to catch.
describe('viz.render registration audit (sprint-109 m05)', () => {
  const vizRenderMentions: Array<{ label: string; file: string; pattern: string }> = [
    { label: 'server dispatch (index.ts)', file: 'packages/mcp-server/src/index.ts', pattern: "'viz.render': {" },
    { label: 'registry.json (enablement)', file: 'packages/mcp-server/src/tools/registry.json', pattern: '"viz.render"' },
    { label: 'registry.ts FALLBACK', file: 'packages/mcp-server/src/tools/registry.ts', pattern: "'viz.render'" },
    { label: 'server-layer policy.json', file: 'packages/mcp-server/src/security/policy.json', pattern: '"tool": "viz.render"' },
    { label: 'agent-layer configs/agent/policy.json', file: 'configs/agent/policy.json', pattern: '"name": "viz.render"' },
    { label: 'mcp-bridge FALLBACK config', file: 'packages/mcp-bridge/src/config.ts', pattern: "name: 'viz.render'" },
    { label: 'mcp-adapter tool-descriptions.json', file: 'packages/mcp-adapter/tool-descriptions.json', pattern: '"viz.render"' },
    { label: 'generated.ts (typed contract)', file: 'packages/mcp-server/src/schemas/generated.ts', pattern: '// Source: viz.render.input.json' },
  ];

  for (const entry of vizRenderMentions) {
    it(`registers viz.render in ${entry.label}`, () => {
      expect(read(entry.file)).toContain(entry.pattern);
    });
  }

  it('exposes viz.render on BOTH policy layers (two-layer convention #622)', () => {
    expect(read('packages/mcp-server/src/security/policy.json')).toContain('"tool": "viz.render"');
    expect(read('configs/agent/policy.json')).toContain('"name": "viz.render"');
  });
});
