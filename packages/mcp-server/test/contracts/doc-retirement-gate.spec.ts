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
const RETIRED_TOOL_NAMES = ['purity.audit', 'vrt.run', 'reviewKit.create'];

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
