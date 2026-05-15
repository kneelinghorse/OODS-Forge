/**
 * Auth-hygiene audit (sprint-97 m04).
 *
 * Scans packages/mcp-server/src/concordance/ for leakage patterns that would
 * violate the v1 Bearer-key hygiene rule:
 *
 *   - No hardcoded literal key value in any source file (sampling a current
 *     prefix would brittle the check; instead we forbid any obvious literal
 *     CONCORDANCE_API_KEY= assignment patterns).
 *   - No logger or console call that ever includes the Authorization header
 *     value in its arguments.
 *   - No error message that interpolates the key value.
 *
 * This is a static-scan test, not a runtime test. It complements the runtime
 * test in client.test.ts ("never includes the API key in error messages")
 * which exercises the live code path.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const CONCORDANCE_SRC = join(HERE, '..', '..', 'src', 'concordance');

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) out.push(...walk(full));
    else if (stat.isFile()) out.push(full);
  }
  return out;
}

const SOURCE_FILES = walk(CONCORDANCE_SRC).filter(
  (p) => (p.endsWith('.ts') && !p.endsWith('.test.ts')) || p.endsWith('.json'),
);

describe('Auth hygiene — concordance source tree audit', () => {
  it('no source file hardcodes a CONCORDANCE_API_KEY value', () => {
    const offenders: string[] = [];
    const re = /CONCORDANCE_API_KEY\s*=\s*['"][^'"]+['"]/;
    for (const path of SOURCE_FILES) {
      const text = readFileSync(path, 'utf8');
      if (re.test(text)) offenders.push(path);
    }
    expect(offenders).toEqual([]);
  });

  it('no source file logs the Authorization header value', () => {
    // Forbid patterns that pass an Authorization header value into a log call.
    // The safe pattern is to log only the request id + status; this test catches
    // any future console.* or logger.* line that includes the raw header.
    const offenders: Array<{ path: string; line: string }> = [];
    const logRe = /(console\.(log|info|warn|error|debug)|logger\.[a-z]+)\s*\(/i;
    const authValRe = /Authorization|Bearer\s/i;
    for (const path of SOURCE_FILES) {
      const text = readFileSync(path, 'utf8');
      const lines = text.split('\n');
      for (const line of lines) {
        if (logRe.test(line) && authValRe.test(line)) {
          offenders.push({ path, line: line.trim() });
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it('no source file interpolates apiKey/bearer/key into Error or throw strings', () => {
    // Catches patterns like `new Error(\`bad key ${key}\`)` or `throw \`Bearer ${apiKey}\``.
    const offenders: Array<{ path: string; line: string }> = [];
    const errRe = /(new\s+Error|throw\s+(new\s+)?Error|throw\s+`)/;
    const tplRe = /\$\{[^}]*(apiKey|api_key|bearer|authorization|secret|token)[^}]*\}/i;
    for (const path of SOURCE_FILES) {
      const text = readFileSync(path, 'utf8');
      const lines = text.split('\n');
      for (const line of lines) {
        if (errRe.test(line) && tplRe.test(line)) {
          offenders.push({ path, line: line.trim() });
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
