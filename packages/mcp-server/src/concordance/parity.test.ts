/**
 * T1 — Vendored Concordance contracts byte-parity (sprint-97 F2).
 *
 * Spec: cmos/foundational-docs/technical/concordance-integration.md §"Contract Test Matrix"
 *
 *   T1a — manifest.schema.json byte-equals upstream
 *   T1b — each api/*.schema.json byte-equals upstream
 *   T1c — each recipes/*.json byte-equals upstream
 *   T1d — closed enums (pragmatic-roles / edge-types / task-types) byte-equal upstream
 *   T1e — vendored target paths exist
 *
 * Run mode: `npx vitest run src/concordance/parity.test.ts`
 *
 * Requirements:
 *   - Upstream contracts must be reachable. Default: sibling checkout at
 *     <repo>/../diverge-and-concord/contracts. Override with
 *     CONCORDANCE_CONTRACTS_ROOT env var.
 *   - The sync script (`scripts/sync-concordance-contracts.sh`) is invoked once
 *     in a temp dir to verify the write path is deterministic.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const VENDORED_ROOT = join(HERE, 'contracts');
const PKG_ROOT = resolve(HERE, '..', '..');
const SYNC_SCRIPT = join(PKG_ROOT, 'scripts', 'sync-concordance-contracts.sh');
const DEFAULT_UPSTREAM = resolve(PKG_ROOT, '..', '..', '..', 'diverge-and-concord', 'contracts');
const UPSTREAM_ROOT = process.env.CONCORDANCE_CONTRACTS_ROOT ?? DEFAULT_UPSTREAM;

const VENDORED_FILES = [
  'manifest.schema.json',
  'pragmatic-roles.json',
  'edge-types.json',
  'task-types.json',
  'api/trace-request.schema.json',
  'api/trace-response.schema.json',
  'api/version-response.schema.json',
  'recipes/action-eligibility.json',
  'recipes/debug-or-explain.json',
  'recipes/modify-ui-copy.json',
  'recipes/semantic-location.json',
] as const;

const upstreamAvailable = existsSync(UPSTREAM_ROOT);

describe('T1 — Vendored Concordance contracts byte-parity', () => {
  beforeAll(() => {
    if (!upstreamAvailable) {
      throw new Error(
        `T1 prerequisite: Concordance contracts not reachable at ${UPSTREAM_ROOT}. ` +
          `Set CONCORDANCE_CONTRACTS_ROOT or check out diverge-and-concord as a sibling repo.`,
      );
    }
  });

  describe('T1e — vendored target paths exist', () => {
    for (const rel of VENDORED_FILES) {
      it(`vendored file exists: ${rel}`, () => {
        expect(existsSync(join(VENDORED_ROOT, rel))).toBe(true);
      });
    }
  });

  describe('T1a/T1b/T1c/T1d — vendored byte-equals upstream', () => {
    for (const rel of VENDORED_FILES) {
      it(`${rel} byte-equals upstream`, () => {
        const vendored = readFileSync(join(VENDORED_ROOT, rel));
        const upstream = readFileSync(join(UPSTREAM_ROOT, rel));
        expect(vendored.equals(upstream)).toBe(true);
      });
    }
  });

  describe('Sync-roundtrip — running the sync script reproduces the committed tree', () => {
    it('re-syncing into a temp dir produces files identical to the committed vendored copy', () => {
      const tempDest = mkdtempSync(join(tmpdir(), 'concordance-sync-'));
      try {
        execFileSync('bash', [SYNC_SCRIPT], {
          env: {
            ...process.env,
            CONCORDANCE_CONTRACTS_ROOT: UPSTREAM_ROOT,
            CONCORDANCE_SYNC_DEST: tempDest,
          },
          stdio: 'pipe',
        });
        for (const rel of VENDORED_FILES) {
          const fresh = readFileSync(join(tempDest, rel));
          const committed = readFileSync(join(VENDORED_ROOT, rel));
          expect(fresh.equals(committed), `drift in ${rel}`).toBe(true);
        }
      } finally {
        rmSync(tempDest, { recursive: true, force: true });
      }
    });
  });
});
