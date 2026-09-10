import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync(new URL('../../scripts/runtime/assemble.mjs', import.meta.url), 'utf8');
const line = source.split('\n').find(line => line.includes('^packages') && line.includes('.test(entry.relative)'));
if (!line) throw new Error('The assembler executable-path gate was not found.');
const expression = line.trim().split('.test(entry.relative)')[0]!;
const executable = new RegExp(expression.slice(1, -1));

describe('s191 runtime executable boundary', () => {
  // Actual packaged paths, independently enumerated from the adapter runtime list.
  it.each([
    ['packages/mcp-adapter/index.js', true],
    ['packages/mcp-adapter/sanitize-schema.js', true],
    ['packages/mcp-server/dist/index.js', true],
    ['packages/mcp-server/dist/tools/repl.render.js', true],
    ['packages/mcp-adapter/tool-descriptions.json', false],
    ['packages/mcp-adapter/test/example.js', false],
    ['docs/example.js', false],
  ] as const)('classifies %s for the quoted-cmos executable gate', (file, expected) => {
    expect(executable.test(file)).toBe(expected);
  });
});
