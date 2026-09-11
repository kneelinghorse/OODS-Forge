import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, expect } from 'vitest';
import { loadPolicyDoc } from '../../src/security/policy.js';

// Redirect only the operator artifact policy; handlers and fixture reads remain real.
export function dryRunBoundary() {
  let directory: string;
  let original: string;
  beforeEach(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), 'oods-on-demand-s194-'));
    const policy = loadPolicyDoc();
    original = policy.artifactsBase;
    policy.artifactsBase = directory;
  });
  afterEach(() => {
    loadPolicyDoc().artifactsBase = original;
    fs.rmSync(directory, { recursive: true, force: true });
  });
  return (tool: string, output: any) => {
    const paths = [...output.artifacts.map((entry: any) => typeof entry === 'string' ? entry : entry.path), output.transcriptPath, output.bundleIndexPath];
    const files = paths.map(file => {
      expect(path.relative(directory, file)).not.toMatch(/^\.\./);
      expect(fs.existsSync(file)).toBe(true);
      return { name: path.basename(file), content: fs.readFileSync(file, 'utf8') };
    });
    const transcript = JSON.parse(fs.readFileSync(output.transcriptPath, 'utf8'));
    expect(transcript.args.apply).toBe(false);
    if (process.env.S194_TOOL_RECEIPTS) {
      fs.mkdirSync(process.env.S194_TOOL_RECEIPTS, { recursive: true });
      fs.writeFileSync(path.join(process.env.S194_TOOL_RECEIPTS, `${tool}.json`), JSON.stringify({ tool, mode: 'dry-run', output, files }, null, 2) + '\n');
    }
  };
}
