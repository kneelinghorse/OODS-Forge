import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = path.resolve(import.meta.dirname, '../..');
const packetPath = path.join(root, 'cmos/planning/forge-gate2-decision-packet.md');
const packet = fs.readFileSync(packetPath, 'utf8');
const read = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');
const sections = [...packet.matchAll(/^## Decision (\d+) — ([^\n]+)\n([\s\S]*?)(?=^## |$(?![\s\S]))/gm)];

describe('the Gate 2 packet separates measured readiness from unapproved delivery choices', () => {
  it('keeps all seven decision items reviewable, with consequences and an explicit door status', () => {
    expect(packet).toContain('PREPARED FOR DEREK — NOT APPROVED');
    expect(sections.map(section => Number(section[1]))).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(sections.map(section => section[2])).toEqual([
      'License and first-party notice scope',
      'Public npm distribution and MCP Registry metadata',
      '`.mcpb` candidate mapping',
      'OCI distribution',
      'Actual Node 20.11.1 CI evidence',
      'Disambiguate “manifest on health”',
      'Historical “constraint #5 amendment”: installer clarification belongs to active #7',
    ]);
    for (const section of sections) {
      expect(section[3], section[2]).toContain('**Measured facts.**');
      expect(section[3], section[2]).toContain('**Options and consequences.**');
      expect(section[3], section[2]).toContain('**One-way-door status.**');
      expect(section[3], section[2]).toContain('**Proposed ');
    }
    expect(sections[4][3]).toContain('historical, before the UTC source migration');
    expect(sections[4][3]).toContain('Require fresh frozen-head evidence');
    expect(packet).toContain('PK2 / #1300 re-ratification remains Derek');
  });

  it('targets the current constraint and never silently revives the archived consumer model', () => {
    const receipt = JSON.parse(read('artifacts/product-reality/sprint-196/m06/constraints-before.json'));
    const active = receipt.active.find((row: { id: number }) => row.id === 7);
    const archived = receipt.archivedHistoricalConstraint5.find((row: { id: number }) => row.id === 5);
    expect(active).toMatchObject({ status: 'active', evergreen: true });
    expect(active.content).toContain('supersedes constraint #5');
    expect(archived.status).toBe('archived');
    expect(sections[6][3]).toContain(active.lastReviewedAt);
    expect(sections[6][3]).toContain(archived.archivedAt);
    expect(sections[6][3]).toContain('append this paragraph to active constraint #7; preserve its current content verbatim and leave #5 archived');
    const proposal = sections[6][3].split('> External installer clarification:')[1];
    expect(proposal).toBeTruthy();
    for (const boundary of ['explicitly authorize named external evaluators', 'artifact commit and digest', 'update and rollback owner', 'does not approve external production wiring', 'public publication', 'Forge-hosted service', 'paid or metered writes', 'Do not infer consumer pull', 'Derek and agent use first', 'build/release-profile requirements remain in force']) {
      expect(proposal, boundary).toContain(boundary);
    }
  });

  it('maps a candidate installer to real entry points and consumed settings without claiming host proof', () => {
    const candidate = sections[2][3];
    const adapter = read('packages/mcp-adapter/index.js');
    expect(candidate).toContain('packages/mcp-adapter/index.js');
    expect(candidate).toContain('packages/mcp-server/dist/index.js');
    expect(candidate).toContain('`compatibility.runtimes.node` = `>=20.11.1`');
    expect(adapter).toContain("process.env.OODS_NODE_PATH || process.execPath");
    expect(adapter).toContain('cwd: this.cwd');
    for (const variable of ['MCP_SCHEMA_STORE_ROOT', 'MCP_SCHEMA_STORE_DIR', 'MCP_BRAND', 'MCP_THEME', 'MCP_EXTRA_TOOLS', 'MCP_MAPPINGS_PATH', 'MCP_BRIDGE_PORT', 'BRIDGE_TOKEN', 'MCP_BRIDGE_CORS_ORIGIN']) {
      expect(candidate, variable).toContain(variable);
      expect(read('docs/runtime/portable-runtime.md'), variable).toContain(variable);
    }
    expect(candidate).toContain('does not start an HTTP listener');
    expect(candidate).toContain('no environment override');
    expect(candidate).toContain('No manifest, packed `.mcpb`, host compatibility declaration, signing identity or public listing is approved');
  });

  it('keeps the proposed health projection distinct from existing assembly and historical release identities', () => {
    const section = sections[5][3];
    const schema = JSON.parse(read('packages/mcp-server/src/schemas/health.output.json'));
    expect(schema.properties).not.toHaveProperty('releaseManifest');
    expect(schema.properties.productReality.properties.release.properties).toHaveProperty('archiveSha256');
    expect(read('packages/mcp-bridge/src/health.ts')).toContain('structuredDataManifestHash: string');
    for (const boundary of ['not currently a native health field', 'need not identify its containing archive', 'A successful health call alone does not reverify every shipped file', 'Never substitute live Git HEAD', 'Keep detached archive verification separate']) {
      expect(section, boundary).toContain(boundary);
    }
    const manifest = JSON.parse(read('artifacts/product-reality/sprint-196/m05/ci-followthrough/release/archive/forge-runtime.manifest.json'));
    for (const [target, source] of [['registrySha256', 'registry'], ['tokensShippedTreeSha256', 'tokensShippedTree'], ['structuredDataManifestHash', 'structuredDataManifest']]) {
      expect(section).toContain(`\`${target}\` from \`${source}.sha256\``);
      expect(manifest[source].sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(manifest).not.toHaveProperty(target);
    }
    expect(section).toContain("Preserve each source hash's representation as supplied");
  });

  it('resolves every local evidence link and uses the cited official specification pages', () => {
    const links = [...packet.matchAll(/\]\(([^)]+)\)/g)].map(match => match[1]);
    expect(links.length).toBeGreaterThan(8);
    for (const target of links.filter(link => !link.startsWith('https://'))) {
      expect(fs.existsSync(path.resolve(path.dirname(packetPath), target.split('#')[0])), target).toBe(true);
    }
    expect(links).toContain('https://github.com/modelcontextprotocol/mcpb/blob/main/MANIFEST.md');
    expect(links).toContain('https://modelcontextprotocol.io/registry/about');
    expect(links).toContain('https://opensource.org/license/mit');
    expect(links).toContain('https://docs.npmjs.com/policies/unpublish/');
  });
});
