import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { CONFIG_FILES, INSTALL_DOC, SERVER_NAME, renderAll } from '../../scripts/runtime/client-configs.mjs';

const root = path.resolve(import.meta.dirname, '../..');
const read = (relative: string) => fs.readFileSync(path.join(root, relative), 'utf8');

type Snippet = { notes: string[]; env: Record<string, string> };

// s202-m05: the install path into the hosts that render design.preview inside the conversation (memo decision 7).
describe('s202 install path: the design preview inside the conversation', () => {
  it('install.md names Developer Mode, Reload MCP Configuration, Cursor, the Claude Code text result and the direct registration beside a hub', () => {
    const install = read(INSTALL_DOC);
    expect(install).toBe(renderAll()[INSTALL_DOC]);
    const section = install.split('### The design preview inside the conversation\n')[1]!.split('\n## 5. First call')[0]!;
    expect(section).toContain('**Claude Desktop** renders the app from a local server only with Developer Mode on.');
    expect(section).toContain('choose Reload MCP Configuration');
    expect(section).toContain('**Cursor** renders MCP Apps from version 2.6.');
    expect(section).toContain('**Claude Code** does not render MCP Apps; it shows the text result.');
    expect(section).toContain(`Register \`${SERVER_NAME}\` directly, beside any other entry such as an MCP hub, not behind it.`);
    expect(section).toContain('`io.modelcontextprotocol/ui`');
    expect(section).toContain('the adapter writes one line to its standard error naming the client and whether it negotiated the extension');
    expect(install).toContain('| `OODS_MCP_APPS_UI` | (unset) |');
  });

  it('each client snippet carries its in-conversation notes and still registers exactly one server, forge', () => {
    const desktop = JSON.parse(read(CONFIG_FILES.claudeDesktop)) as Snippet & { claudeDesktopConfig: { mcpServers: Record<string, unknown> } };
    const code = JSON.parse(read(CONFIG_FILES.claudeCode)) as Snippet & { claudeCodeConfig: { mcpServers: Record<string, unknown> } };
    const cursor = JSON.parse(read(CONFIG_FILES.cursor)) as Snippet & { cursorConfig: { mcpServers: Record<string, unknown> } };
    const direct = expect.stringContaining(`Register ${SERVER_NAME} directly, beside any other entry such as an MCP hub, not behind it`);
    expect(desktop.notes).toEqual(expect.arrayContaining([expect.stringContaining('Turn on Developer Mode'), expect.stringContaining('choose Reload MCP Configuration'), direct]));
    expect(cursor.notes).toEqual(expect.arrayContaining([expect.stringContaining('Cursor 2.6 and later render MCP Apps'), expect.stringContaining('after replacing the runtime'), direct]));
    expect(code.notes).toEqual(expect.arrayContaining([expect.stringContaining('Claude Code does not render MCP Apps')]));
    expect(code.notes.join('\n')).not.toContain('Developer Mode');
    for (const snippet of [desktop, code, cursor]) expect(snippet.env.OODS_MCP_APPS_UI).toMatch(/^1 offers the design preview app/);
    expect(Object.keys(desktop.claudeDesktopConfig.mcpServers)).toEqual([SERVER_NAME]);
    expect(Object.keys(cursor.cursorConfig.mcpServers)).toEqual([SERVER_NAME]);
    expect(Object.keys(code.claudeCodeConfig.mcpServers)).toEqual([SERVER_NAME]);
  });
});
