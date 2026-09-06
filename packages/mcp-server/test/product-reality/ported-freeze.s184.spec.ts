import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

// Sprint 185 m01 converted this spec (#1722: the Sprint 182 promotion freeze
// is void; #1725: the freeze is retired from the live gates, not from
// history). The Sprint 184 m01 freeze inventory is capture-time evidence
// (#1695): it records what the tree looked like when it was captured and is
// never re-asserted against the live tree. The former tests that rehashed
// live surfaces against the inventory, byte-pinned surfaces and id-list files
// against the m04 base 158a34bf, asserted a 14-component / 28-cell nucleus,
// and ran generate-s182-m05-closeout.mjs --check-promotion were removed; each
// removal and its reason is recorded in
// artifacts/product-reality/sprint-185/m01/pin-inventory.json.

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, '../../../..');
const inventoryPath = 'artifacts/product-reality/sprint-184/m01/freeze-inventory.json';

type FreezeRow = {
  rowClass: string;
  path: string;
  recordedSha256: string;
  workingTreeSha256?: string | null;
};

function sha256(value: Buffer | string): string {
  return createHash('sha256').update(value).digest('hex');
}

describe('Sprint 184 m01 freeze inventory — capture-time evidence, read-only history under #1722/#1725', () => {
  it('keeps freeze-inventory.json itself byte-identical to its tracked form', () => {
    const workingTree = readFileSync(path.join(repositoryRoot, inventoryPath));
    const tracked = spawnSync('git', ['show', `HEAD:${inventoryPath}`], {
      cwd: repositoryRoot,
      encoding: null,
      maxBuffer: 32 * 1024 * 1024,
    });
    expect(tracked.status, tracked.stderr?.toString()).toBe(0);
    expect(sha256(workingTree)).toBe(sha256(tracked.stdout));
  });

  it('stays internally consistent as captured', () => {
    const inventory = JSON.parse(readFileSync(path.join(repositoryRoot, inventoryPath), 'utf8')) as {
      rowCount: number;
      uniquePathCount: number;
      countsByRowClass: Record<string, number>;
      rows: FreezeRow[];
    };
    const classCounts = inventory.rows.reduce<Record<string, number>>((counts, row) => {
      counts[row.rowClass] = (counts[row.rowClass] ?? 0) + 1;
      return counts;
    }, {});
    expect(inventory.rows).toHaveLength(inventory.rowCount);
    expect(classCounts).toEqual(inventory.countsByRowClass);
    expect(new Set(inventory.rows.map((row) => row.path)).size).toBe(inventory.uniquePathCount);
  });
});
