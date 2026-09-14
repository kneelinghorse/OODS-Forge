import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { TERMS_FILES, BRAND_SOURCE_PATH, RUNTIME_ARCHIVE_FILE, RUNTIME_ARCHIVE_SHA256_FILE, RUNTIME_MANIFEST_FILE, RUNTIME_SBOM_FILE } from '../../scripts/runtime/manifest.mjs';
import { buildSbomLite } from '../../scripts/runtime/sbom-lite.mjs';
import { buildThirdPartyNotices, NOTICES_FILE } from '../../scripts/runtime/third-party-notices.mjs';
import { CONFIG_FILES, INSTALL_DOC, RUNTIME_DIR_PLACEHOLDER, SERVER_NAME, renderAll } from '../../scripts/runtime/client-configs.mjs';

const root = path.resolve(import.meta.dirname, '../..');
const read = (relative: string) => fs.readFileSync(path.join(root, relative), 'utf8');
const runbook = read('docs/runtime/portable-runtime.md');
// Prose assertions ignore the runbook's hard wrapping.
const prose = runbook.replace(/\s+/g, ' ');
const install = read(INSTALL_DOC);
const registry = JSON.parse(read('packages/mcp-server/src/tools/registry.json')) as { auto: string[]; onDemand: string[] };

describe('s200 portable runtime contract: a public runbook, generated install steps and the terms in the archive', () => {
  it('describes a source-available release and no private handoff', () => {
    // The words the Sprint 181 runbook was built around; none may survive the rewrite.
    for (const phrase of ['private handoff', 'named consumer', 'gate 1', 'gate 2', 'reconnect', 'ci-15', 'hosted ci', 'github workspace', 'runner_temp']) {
      expect(runbook.toLowerCase(), phrase).not.toContain(phrase);
    }
    expect(runbook).toContain('PolyForm Noncommercial 1.0.0');
    expect(runbook).toContain('[install.md](install.md)');
    expect(prose).toContain('No npm package, `.mcpb` bundle or container image exists for this runtime.');
    for (const asset of [RUNTIME_ARCHIVE_FILE, RUNTIME_ARCHIVE_SHA256_FILE, RUNTIME_MANIFEST_FILE, RUNTIME_SBOM_FILE, NOTICES_FILE, 'install.md']) {
      expect(runbook, asset).toContain(`\`${asset}\``);
    }
  });

  it('keeps the boundary statement: the terms and brand documents ship, planning, fixtures, tests and stories never do', () => {
    expect(runbook).toContain('## What the archive contains');
    expect(runbook).toContain('## What the archive never contains');
    expect(prose).toContain('never contains a `cmos/` directory, planning inputs, consumer fixtures, intake data, `stories/`, tests, or source code beyond the brand documents named above');
    for (const file of TERMS_FILES) expect(runbook, file).toContain(`\`${file}\``);
    expect(runbook).toContain(`\`${BRAND_SOURCE_PATH}/\``);
    expect(prose).toContain('No other token source, palette generator or token build script ships.');
    expect(runbook).toContain('the native code is preserved at `tools/call`');
    expect(runbook).toContain('`OODS-N020` is returned only when the brand-source directory is missing.');
    expect(runbook).toContain('`sourceWritten:false`, `build:null` and `portable:{sourceWrites:"skipped",tokenBuild:"skipped"}`');
  });

  it('lists the advertised tools in registry order and the measured closure size', async () => {
    const block = runbook.split('```text\n')[1]!.split('```')[0]!.trim().split('\n');
    expect(block).toEqual(registry.auto);
    expect(runbook).toContain(`advertises ${registry.auto.length} auto tools`);
    expect(runbook).toContain(`${registry.onDemand.length === 5 ? 'five' : String(registry.onDemand.length)} on-demand tools`);
    const sbom = await buildSbomLite(root);
    expect(prose).toContain(`third-party closure is ${sbom.summary.packageCount} packages`);
  });

  it('carries every runtime environment variable the bridge and server read', () => {
    for (const variable of ['MCP_TOOLSET', 'MCP_EXTRA_TOOLS', 'MCP_BRIDGE_PORT', 'BRIDGE_TOKEN', 'MCP_BRIDGE_CORS_ORIGIN', 'MCP_ROLE', 'MCP_USER', 'MCP_HEALTH_PORT', 'MCP_BRAND', 'MCP_THEME', 'MCP_SCHEMA_STORE_ROOT', 'MCP_SCHEMA_STORE_DIR', 'MCP_MAPPINGS_PATH', 'MCP_BRAND_SOURCE_ROOT', 'OODS_NODE_PATH']) {
      expect(runbook, variable).toContain(`\`${variable}\``);
    }
  });

  it('renders install.md and the three client configs from one template with no drift', () => {
    const rendered = renderAll();
    expect(Object.keys(rendered).sort()).toEqual([INSTALL_DOC, ...Object.values(CONFIG_FILES)].sort());
    for (const [relative, text] of Object.entries(rendered)) expect(read(relative), relative).toBe(text);
    expect(install).toContain(`claude mcp add ${SERVER_NAME} -- node ${RUNTIME_DIR_PLACEHOLDER}/packages/mcp-adapter/index.js`);
    expect(install).toContain(`claude mcp get ${SERVER_NAME}`);
    expect(install).toContain('claude_desktop_config.json');
    expect(install).toContain('%APPDATA%\\Claude\\claude_desktop_config.json');
    expect(install).toContain('`.cursor/mcp.json`');
    expect(install).toContain(`see the same ${registry.auto.length} tools by default`);
    expect(install).toContain(`advertises all ${registry.auto.length + registry.onDemand.length}`);
    expect(install).toContain('PolyForm Noncommercial 1.0.0');
    expect(install).toContain('[docs/mcp/Connections.md](../mcp/Connections.md)');
    expect(install.split(RUNTIME_DIR_PLACEHOLDER).length).toBeGreaterThan(5);
    expect(install).not.toMatch(/\/Users\/|\/home\//);
    for (const relative of Object.values(CONFIG_FILES)) {
      const config = JSON.parse(read(relative)) as { transport: { type: string; command: string; args: string[] } };
      expect(config.transport).toEqual({ type: 'stdio', command: 'node', args: [`${RUNTIME_DIR_PLACEHOLDER}/packages/mcp-adapter/index.js`] });
    }
    const desktop = JSON.parse(read(CONFIG_FILES.claudeDesktop)) as { claudeDesktopConfig: { mcpServers: Record<string, unknown> } };
    const cursor = JSON.parse(read(CONFIG_FILES.cursor)) as { cursorConfig: { mcpServers: Record<string, unknown> } };
    const code = JSON.parse(read(CONFIG_FILES.claudeCode)) as { claudeCodeCommands: { add: string; get: string }; claudeCodeConfig: { mcpServers: Record<string, unknown> } };
    expect(Object.keys(desktop.claudeDesktopConfig.mcpServers)).toEqual([SERVER_NAME]);
    expect(Object.keys(cursor.cursorConfig.mcpServers)).toEqual([SERVER_NAME]);
    expect(Object.keys(code.claudeCodeConfig.mcpServers)).toEqual([SERVER_NAME]);
    expect(code.claudeCodeCommands.add).toBe(`claude mcp add ${SERVER_NAME} -- node ${RUNTIME_DIR_PLACEHOLDER}/packages/mcp-adapter/index.js`);
    expect(read('docs/mcp/Connections.md')).toContain('[docs/runtime/install.md](../runtime/install.md)');
  });

  it('ships the three terms files from the repository root and keeps the notices fresh against the lockfile', async () => {
    for (const file of TERMS_FILES) expect(fs.existsSync(path.join(root, file)), file).toBe(true);
    expect(read('scripts/pkg/build.ts')).toContain(`export const TERMS_FILES = ${JSON.stringify([...TERMS_FILES]).replaceAll('"', "'").replaceAll(',', ', ')} as const;`);
    expect(read('LICENSE').startsWith('# PolyForm Noncommercial License 1.0.0')).toBe(true);
    const notices = read(NOTICES_FILE);
    expect(notices).toBe(await buildThirdPartyNotices(root));
    const sbom = await buildSbomLite(root);
    expect(notices).toContain(`ships ${sbom.summary.packageCount} third-party npm packages`);
    expect(notices.match(/^### /gm)).toHaveLength(sbom.summary.packageCount);
    for (const entry of sbom.packages) expect(notices, entry.id).toContain(`### ${entry.id}\n`);
    expect(notices).not.toMatch(/\/Users\/|\/home\//);
  }, 60_000);

  it('binds the assembler to the same terms roster and brand-source path', () => {
    const assemble = read('scripts/runtime/assemble.mjs');
    expect(assemble).toContain('tokens: ["src/tokens/brands"]');
    expect(assemble).toContain('...TERMS_FILES,');
    expect(assemble).toContain('is stale; run node scripts/runtime/third-party-notices.mjs');
    const manifest = read('scripts/runtime/manifest.mjs');
    expect(manifest).toContain('export const BRAND_SOURCE_PATH = "packages/tokens/src/tokens/brands";');
    expect(manifest).toContain('"THIRD-PARTY-NOTICES.md",\n]);');
    const e2e = read('scripts/runtime/e2e.mjs');
    expect(e2e).toContain('`${entry.path} differs from the repository copy`');
    expect(e2e).toContain('"portable brand.apply changed shipped brand source"');
    expect(e2e).not.toContain('"OODS-N020"');
  });
});
