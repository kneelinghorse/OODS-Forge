import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const S177_M07_SUCCESS_CRITERIA = [
  "Gate table generated from cmos/foundational-docs/closeout-checklist.md — one row per ci.yml job (16) plus every standing local row, each a LITERAL invocation with env vars, run at the named tree (post-commit HEAD or the tree named per standing rule A), results pasted not restated",
  "test:scale row present and green (4 files / 62 tests expected unless a scale spec moved, then reconciled) and verify:brand-cascade row present and green — the two historically-dropped rows are structural now",
  "Census against a correctly-labelled zero: every suite-count delta reconciled per mission; snapshot census + re-hash rows run; git status porcelain accounted for including diagnostics.json per its m02-recorded disposition",
  "The rebased s172 clause controls GREEN with an EMPTY declared-mover set (BASELINE_COMMIT '86d50ed', declarations null/[]) — the sprint's zero-advertised-movement invariant proven, not asserted; the ONLY declared behavioral mover is Fork-R's enumerated text-level pin list",
  "decisionCount >= 1 per mission verified by the sqlite query at closeout",
  "Ledger updated (arcs closed: CI/repo/closeout hygiene, CMOS hygiene; Forge-Demos residue row discharged; how-forge-works untracked-rows corrected) and the memo's §7-form closeout record written",
  "NO R-d reconnect expected; if any advertised byte moved, the closeout names the invariant as BROKEN rather than papering it",
  "Not self-certified: review is a separate session (rule 10); Sprint-COMPLETE and the commit boundary are Derek's",
] as const;

function block(contents: string, start: string, end: string): string {
  const startIndex = contents.indexOf(start);
  const endIndex = contents.indexOf(end);

  expect(startIndex, `missing marker ${start}`).toBeGreaterThanOrEqual(0);
  expect(endIndex, `missing marker ${end}`).toBeGreaterThan(startIndex);
  expect(contents.indexOf(start, startIndex + start.length)).toBe(-1);
  expect(contents.indexOf(end, endIndex + end.length)).toBe(-1);

  return contents.slice(startIndex + start.length, endIndex);
}

describe("Sprint 177 closeout carrier", () => {
  const projectRoot = fileURLToPath(new URL("../../", import.meta.url));
  const checklist = readFileSync(
    resolve(projectRoot, "cmos/foundational-docs/closeout-checklist.md"),
    "utf8",
  );
  const qualityBars = readFileSync(
    resolve(projectRoot, "cmos/foundational-docs/quality-bars.md"),
    "utf8",
  );
  const workflow = readFileSync(
    resolve(projectRoot, ".github/workflows/ci.yml"),
    "utf8",
  );
  const rootVitestConfig = readFileSync(
    resolve(projectRoot, "vitest.config.ts"),
    "utf8",
  );
  const mcpVitestConfig = readFileSync(
    resolve(projectRoot, "packages/mcp-server/vitest.config.ts"),
    "utf8",
  );
  const packageManifest = JSON.parse(
    readFileSync(resolve(projectRoot, "package.json"), "utf8"),
  ) as { scripts?: Record<string, string> };
  const ciRows = block(
    checklist,
    "<!-- closeout-ci-rows:start -->",
    "<!-- closeout-ci-rows:end -->",
  );
  const localRows = block(
    checklist,
    "<!-- closeout-local-rows:start -->",
    "<!-- closeout-local-rows:end -->",
  );

  it("covers the exact current set of 16 CI job keys once", () => {
    const jobsSection = workflow.slice(workflow.indexOf("\njobs:\n") + 7);
    const workflowJobs = [
      ...jobsSection.matchAll(/^  ([a-z][a-z0-9-]+):\s*$/gm),
    ].map((match) => match[1]);
    const carrierRows = [
      ...ciRows.matchAll(/^\| CI-\d{2} \| `([a-z][a-z0-9-]+)` \|/gm),
    ].map((match) => match[1]);

    expect([...carrierRows].sort()).toEqual([...workflowJobs].sort());
    expect(workflowJobs).toHaveLength(16);
    expect(new Set(carrierRows).size).toBe(16);
    expect(checklist).toContain("Repeat through `CI-16` and `L-01` through `L-09`.");
    expect(checklist).not.toContain("Repeat through `CI-14`");
  });

  it("keeps the historically dropped and commonly misstated CI operands visible", () => {
    const typecheckRow = ciRows
      .split("\n")
      .find((line) => line.startsWith("| CI-03 |"));
    const a11yRow = ciRows
      .split("\n")
      .find((line) => line.startsWith("| CI-09 |"));
    const scaleRow = ciRows
      .split("\n")
      .find((line) => line.startsWith("| CI-12 |"));
    const coverageRow = ciRows
      .split("\n")
      .find((line) => line.startsWith("| CI-11 |"));
    const vrRow = ciRows
      .split("\n")
      .find((line) => line.startsWith("| CI-10 |"));
    const soakRow = ciRows
      .split("\n")
      .find((line) => line.startsWith("| CI-14 |"));
    const portableRow = ciRows
      .split("\n")
      .find((line) => line.startsWith("| CI-15 |"));
    const soakJob = workflow.slice(
      workflow.indexOf("\n  echarts-render-soak:"),
      workflow.indexOf("\n  portable-runtime:"),
    );
    const portableJob = workflow.slice(
      workflow.indexOf("\n  portable-runtime:"),
    );
    const vizJob = workflow.slice(
      workflow.indexOf("\n  viz-determinism:"),
      workflow.indexOf("\n  echarts-render-soak:"),
    );

    expect(typecheckRow).toContain("pnpm exec tsc --noEmit");
    expect(typecheckRow).toContain(
      "pnpm --filter @oods/viz-core run typecheck",
    );
    expect(typecheckRow).toContain(
      "node scripts/quality/build-stories-ratchet.mjs",
    );
    expect(a11yRow).toContain("pnpm run verify:brand-cascade");
    expect(scaleRow).toContain("pnpm --filter @oods/mcp-server run test:scale");
    expect(coverageRow).toContain("pretest:coverage");
    expect(coverageRow).toContain("pnpm vitest run tests/contracts tests/viz");
    expect(vrRow).toContain("structurally non-local");
    expect(vrRow).toContain("CHROMATIC_PROJECT_TOKEN");
    expect(soakRow).toContain(
      "pnpm --filter @oods/mcp-server run test:echarts-soak",
    );
    expect(soakRow).toContain(
      "PK2 power floor PARKED until Linux-leg evidence",
    );
    expect(soakRow).toContain(
      "three of four quiet-host runs failed the one-sided 99% Student-t bound at `echarts-render-soak.s179.spec.ts:283`",
    );
    expect(soakRow).toContain(
      "positiveTrendLower99 = +364.93/+1457.88/+4367.02 B/window",
    );
    expect(soakRow).toContain("while every hard ceiling passed");
    expect(soakJob).toContain("timeout-minutes: 15");
    expect(soakJob).toContain(
      "run: pnpm --filter @oods/mcp-server run test:echarts-soak",
    );
    expect(portableRow).toContain("pnpm install --frozen-lockfile");
    expect(portableRow).toContain(
      "node --test packages/mcp-adapter/test-s181-lifecycle.js",
    );
    expect(portableRow).toContain("scripts/runtime/assemble.mjs");
    expect(portableRow?.match(/assemble\.mjs[^`]*--final/g)).toHaveLength(2);
    expect(portableRow).toContain("clean checkout or detached worktree");
    expect(portableRow).toContain("forge-runtime.tar.gz.sha256");
    expect(portableRow).toContain("scripts/runtime/e2e.mjs");
    expect(portableRow).toContain("mktemp -d");
    expect(portableJob).toContain("timeout-minutes: 15");
    expect(portableJob).toContain("version: 9.12.2");
    expect(portableJob).toContain("node-version: '24'");
    expect(portableJob).toContain("pnpm install --frozen-lockfile");
    expect(portableJob).toContain(
      "node --test packages/mcp-adapter/test-s181-lifecycle.js",
    );
    expect(portableJob).toContain("sha256sum --check");
    expect(portableJob).toContain("if: always()");
    expect(portableJob).toContain('$RUNNER_TEMP/forge-e2e-$RANDOM');
    expect(portableJob.split("node scripts/runtime/assemble.mjs")).toHaveLength(3);
    expect(portableJob).toContain("scripts/runtime/e2e.mjs");
    const runtimeProbe =
      "node -e 'console.log(JSON.stringify({node:process.version,v8:process.versions.v8,platform:process.platform,arch:process.arch}))'";
    expect(ciRows.split(runtimeProbe)).toHaveLength(3);
    expect(vizJob).toContain(`run: ${runtimeProbe}`);
    expect(soakJob).toContain(`run: ${runtimeProbe}`);
    expect(rootVitestConfig).toContain("'packages/mcp-server/test/soak/**'");
    expect(mcpVitestConfig).toContain("'test/soak/**'");
    expect(ciRows).not.toContain("CI does not run");
  });

  it("builds public-package declarations before the coverage contract reads them", () => {
    const pretestCoverage = packageManifest.scripts?.["pretest:coverage"];
    const coverageRow = ciRows
      .split("\n")
      .find((line) => line.startsWith("| CI-11 |"));

    expect(pretestCoverage).toBe(
      "pnpm run build && pnpm run build:packages && pnpm run pkg:build",
    );
    expect(coverageRow).toContain(
      `\`pretest:coverage\`, which is \`${pretestCoverage}\``,
    );
    expect(coverageRow).toContain(
      "pkg:build` creates the public `dist/pkg` declarations the contract inspects",
    );
  });

  it("serializes compiler and packaging proofs that can starve parallel readers", () => {
    const coverageCommand = packageManifest.scripts?.["test:coverage"] ?? "";
    const serializedProofs = [
      {
        rootPath:
          "packages/mcp-server/test/codegen/cross-framework-parity.spec.ts",
        packagePath: "test/codegen/cross-framework-parity.spec.ts",
      },
      {
        rootPath:
          "packages/mcp-server/test/product-reality/typed-action-protocol.s183.spec.ts",
        packagePath: "test/product-reality/typed-action-protocol.s183.spec.ts",
      },
      {
        rootPath:
          "packages/mcp-server/test/product-reality/saved-schema-consumers.s183.spec.ts",
        packagePath:
          "test/product-reality/saved-schema-consumers.s183.spec.ts",
      },
      {
        rootPath:
          "packages/mcp-server/test/product-reality/independent-review-approval.s183.spec.ts",
        packagePath:
          "test/product-reality/independent-review-approval.s183.spec.ts",
      },
    ];

    for (const proof of serializedProofs) {
      expect(rootVitestConfig).toContain(`'${proof.rootPath}'`);
      expect(coverageCommand).toContain(proof.packagePath);
    }
    expect(
      coverageCommand.indexOf(serializedProofs[0].packagePath),
    ).toBeGreaterThan(
      coverageCommand.indexOf("vitest --coverage"),
    );
    expect(mcpVitestConfig).toContain("fileParallelism: false");
  });

  it("carries every closeout-only control and preserves the build-input run-last semantics", () => {
    const rows = localRows
      .split("\n")
      .filter((line) => /^\| L-\d{2} \|/.test(line));
    const ids = rows.map((line) => line.match(/^\| (L-\d{2}) \|/)?.[1]);

    expect(ids).toEqual([
      "L-01",
      "L-02",
      "L-03",
      "L-04",
      "L-05",
      "L-06",
      "L-07",
      "L-08",
      "L-09",
    ]);
    for (const row of rows) {
      expect(row).toContain("| CI does not run |");
    }

    expect(localRows).toContain("correctly labelled zero");
    expect(localRows).toContain("Snapshot census");
    expect(localRows).toContain("shasum -a 256 {DECLARED_REHASH_PATHS}");
    expect(localRows).toContain("decisionCount >= 1");
    expect(localRows).toContain("http://127.0.0.1:4466/health");
    expect(localRows).toContain("after **any** advertised");
    const rebuildRow = rows.find((row) => row.startsWith("| L-06 |"));
    expect(rebuildRow).toContain("for attempt in $(seq 1 30)");
    expect(rebuildRow).toContain(
      "curl --fail --silent http://127.0.0.1:4466/health >/dev/null",
    );
    expect(rebuildRow).toContain(
      "done; curl --fail --silent --show-error http://127.0.0.1:4466/health",
    );
    expect(localRows).toContain("Sequential-only heavy-suite protocol");
    expect(rows.at(-2)).toContain(
      "| L-08 | Gitignored build-input survival — run last and again after governance |",
    );
    expect(rows.at(-2)).toContain(
      "packages/tokens/dist/tailwind/tokens.json",
    );
    expect(rows.at(-2)).toContain("import('@oods/tokens')");
    expect(rows.at(-1)).toContain(
      "Whole-sprint SR-22 scan and per-mission suite attribution",
    );
    expect(rows.at(-1)).toContain("git diff --unified=0 {BASE_SHA} -- .");
    expect(rows.at(-1)).toContain("every untracked sprint file");
    expect(localRows).not.toContain("build-stories-ratchet.mjs");
  });

  it("uses stable source blocks without prose shorthand", () => {
    const canonicalRows = `${ciRows}\n${localRows}`;
    const allowedTokens = new Set([
      "{BASE_SHA}",
      "{HEAD_SHA}",
      "{PR_LABELS_CSV}",
      "{SPRINT_ID}",
      "{DECLARED_REHASH_PATHS}",
      "{AQUEX_ADDRESS}",
      "{ADVERTISED_MOVERS}",
    ]);
    const observedTokens = canonicalRows.match(/\{[A-Z][A-Z_]+\}/g) ?? [];

    expect(canonicalRows).not.toContain("...");
    expect(new Set(observedTokens)).toEqual(allowedTokens);
  });

  it("matches the eight lock-seeded s177-m07 success criteria byte for byte", () => {
    const criteriaBlock = block(
      checklist,
      "<!-- cmos-success-criteria:start mission=s177-m07 -->",
      "<!-- cmos-success-criteria:end -->",
    );
    const criteria = criteriaBlock
      .split("\n")
      .filter((line) => line.startsWith("- "))
      .map((line) => line.slice(2));

    expect(criteria).toEqual(S177_M07_SUCCESS_CRITERIA);
  });

  it("wires all six quality-bar Application carriers to this checklist", () => {
    const linkedApplications = qualityBars
      .split("\n")
      .filter(
        (line) =>
          line.startsWith("- **Application:**") &&
          line.includes("[closeout checklist](closeout-checklist.md)"),
      );
    const combined = linkedApplications.join("\n");

    expect(linkedApplications).toHaveLength(6);
    for (const label of [
      "(a)",
      "(b)",
      "(c)",
      "(d)",
      "(e)",
      "(f)",
      "(g)",
      "(h)",
      "(i)",
    ]) {
      expect(combined).toContain(label);
    }
  });
});
