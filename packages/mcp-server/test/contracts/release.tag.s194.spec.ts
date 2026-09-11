import { describe, expect, it } from 'vitest';
import { handle } from '../../src/tools/release.tag.js';
import { wire } from '../helpers/wire-boundary.js';
import { dryRunBoundary } from '../helpers/dry-run-boundary.js';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { repositoryRoot } from '../helpers/wire-boundary.js';
const tags = () => execFileSync('git', ['tag', '--list'], { cwd: repositoryRoot, encoding: 'utf8' });

const retain = dryRunBoundary();
describe('release.tag actual dry-run wire (s194-m04)', () => {
  it('performs its documented read/preview and confines receipts to the temporary artifact root', async () => {
    const before = tags();
    const input = wire('release.tag', 'input', { apply: false, tag: 'v0.0.0-internal.20991231' });
    const output = wire('release.tag', 'output', await handle(input));
    expect(output.created).toBe(false);
    expect(output.tag).toBe(input.tag);
    expect(tags()).toBe(before);
    const receipt = JSON.parse(fs.readFileSync(output.artifacts[0], 'utf8'));
    expect(receipt.head).toMatch(/^[a-f0-9]{40}$/);
    expect(receipt.created).toBe(false);
    retain('release.tag', output);
  }, 120_000);
});
