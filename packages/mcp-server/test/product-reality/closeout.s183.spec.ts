import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

import {
  CANONICAL_GATE_ROW_IDS,
  EVIDENCE_PATHS,
  EXPECTED_REPLAY_CASES,
  INPUT_PATHS,
  MISSION_CONTRACTS,
  OUTPUT_PATHS,
  REQUIRED_FOCUSED_TEST_FILES,
  R02_CANONICAL_COMPONENT_IDS,
  R02_PACKAGE_EVIDENCE,
  buildCloseoutArtifacts,
  canonicalJson,
  sha256,
  verifyEvidenceReference,
  writeOrCheckArtifacts,
} from "../../../../scripts/product-reality/generate-s183-m06-closeout.mjs";
import {
  L09_COUNTING_METHOD,
  SPRINT_BASE_SHA,
  buildExpectedCommandMap,
  buildRecord as buildGateRecord,
  countL09ReferenceOccurrences,
  expectedExecutionCommands,
  parseVitestCounts,
} from "../../../../scripts/product-reality/generate-s183-m06-gate-record.mjs";

const sourceRepositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);

interface Fixture {
  repositoryRoot: string;
  reviewHead: string;
  gateLogPath: string;
}

const temporaryRoots: string[] = [];

function writeFile(
  repositoryRoot: string,
  repositoryPath: string,
  contents = "fixture\n",
) {
  const absolutePath = path.join(repositoryRoot, repositoryPath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, contents);
}

function writeJson(
  repositoryRoot: string,
  repositoryPath: string,
  value: unknown,
) {
  writeFile(repositoryRoot, repositoryPath, canonicalJson(value));
}

function reference(repositoryRoot: string, repositoryPath: string) {
  const contents = fs.readFileSync(path.join(repositoryRoot, repositoryPath));
  return {
    path: repositoryPath,
    bytes: contents.byteLength,
    sha256: sha256(contents),
  };
}

function createGateRecord(repositoryRoot: string, reviewHead: string) {
  const outputRoot = "artifacts/product-reality/sprint-183/m06";
  const rehashPath = `${outputRoot}/rehash-paths.txt`;
  writeFile(repositoryRoot, rehashPath, "fixture-source.txt\n");
  const expectedCommands = buildExpectedCommandMap({
    baseSha: SPRINT_BASE_SHA,
    reviewHead,
    rehashPaths: ["fixture-source.txt"],
  });
  const aliasesByRow: Record<string, string[]> = {
    ...Object.fromEntries(CANONICAL_GATE_ROW_IDS.map((id) => [id, [id]])),
    "CI-12": ["CI-12-setup", "L-07-scale"],
    "CI-14": ["CI-14-setup", "L-07-soak"],
    "L-01": ["L-01-viz-core", "L-01-mcp-server", "L-01-root-core"],
    "L-06": ["L-06-diff"],
    "L-07": [
      "L-01-viz-core",
      "L-01-mcp-server",
      "L-01-root-core",
      "L-07-scale",
      "L-07-soak",
    ],
    "L-08": ["L-08-after-governance", "L-08-final"],
  };
  const baselinePath =
    "artifacts/product-reality/sprint-182/m05/l01-suite-attribution.json";
  const baselineTarget = path.join(repositoryRoot, baselinePath);
  fs.mkdirSync(path.dirname(baselineTarget), { recursive: true });
  fs.copyFileSync(
    path.join(sourceRepositoryRoot, baselinePath),
    baselineTarget,
  );
  const frozen = JSON.parse(fs.readFileSync(baselineTarget, "utf8"));
  const baselineCounts = Object.fromEntries(
    frozen.suiteComparisons.map(({ suite, current }: any) => [suite, current]),
  );
  const suiteByAlias: Record<string, string> = {
    "L-01-viz-core": "viz-core",
    "L-01-mcp-server": "mcp-server",
    "L-01-root-core": "root-core",
  };
  const executions = new Map<string, any>();
  const allAliases = [...new Set(Object.values(aliasesByRow).flat())];
  for (const alias of allAliases) {
    const resultPath = `${outputRoot}/gate-results/${alias.toLowerCase()}.json`;
    const logPath = `${outputRoot}/logs/s183-m06-${alias.toLowerCase()}.log`;
    let log = `${alias} passed\n`;
    if (suiteByAlias[alias]) {
      const counts = baselineCounts[suiteByAlias[alias]];
      const summary = (label: string, value: any) =>
        `${label}  ${value.passed} passed${value.skipped ? ` | ${value.skipped} skipped` : ""} (${value.total})`;
      log = `${summary("Test Files", counts.files)}\n${summary("Tests", counts.tests)}\n`;
    } else if (alias === "L-07-soak") {
      log = [
        "echarts-render-soak.s179.spec.ts:283:1",
        "positiveTrendLower99",
        "Test Files  1 failed (1)",
        "Tests  1 failed | 2 passed (3)",
      ].join("\n");
    } else if (alias === "L-09") {
      log = "+Sprint-183 closeout reference\n";
    }
    writeFile(repositoryRoot, resultPath, `${alias} result\n`);
    writeFile(repositoryRoot, logPath, log);
    const literalCommands = expectedCommands.get(alias)!;
    const executionCommands = expectedExecutionCommands(alias, literalCommands);
    const minute =
      alias === "L-03"
        ? 3
        : alias === "L-09"
          ? 4
          : alias === "L-08-final"
            ? 5
            : 1;
    const parked = alias === "L-07-soak";
    executions.set(alias, {
      alias,
      evidenceId: `s183-m06-${alias.toLowerCase()}`,
      result: reference(repositoryRoot, resultPath),
      log: reference(repositoryRoot, logPath),
      cwd: repositoryRoot,
      measuredHead: reviewHead,
      startedAt: `2026-09-04T00:0${minute}:00.000Z`,
      endedAt: `2026-09-04T00:0${minute}:01.000Z`,
      status: parked ? "parked-failure" : "pass",
      exitCode: parked ? 1 : 0,
      literalCommands,
      literalCommand: literalCommands.join(" && "),
      executionCommands,
      executedCommand: executionCommands.join(" && "),
      sideEffects: [],
      gitStatusBefore: [],
      gitStatusAfter: [],
    });
  }
  const rows: any[] = CANONICAL_GATE_ROW_IDS.map((id) => {
    const status =
      id === "CI-10"
        ? "structurally-non-local"
        : id === "CI-14"
          ? "parked-disclosed"
          : "pass";
    return {
      id,
      status,
      evidenceAliases: aliasesByRow[id],
      executions: aliasesByRow[id].map((alias) => executions.get(alias)),
      disclosures: status === "pass" ? [] : [`${status} is explicit`],
      ...(id === "L-06"
        ? { observations: { advertisedMovers: [], reconnect: null } }
        : {}),
    };
  });
  const suiteAliases = ["L-01-viz-core", "L-01-mcp-server", "L-01-root-core"];
  const suiteNames = ["viz-core", "mcp-server", "root-core"];
  const missionIds = Array.from(
    { length: 6 },
    (_, index) => `s183-m0${index + 1}`,
  );
  const sourceExecutions = suiteAliases.map((alias, index) => ({
    evidenceId: executions.get(alias).evidenceId,
    result: executions.get(alias).result,
    log: executions.get(alias).log,
    counts: baselineCounts[suiteNames[index]],
  }));
  const attributionPayload = {
    schemaVersion: "1.0.0",
    missionId: "s183-m06",
    rowId: "L-01",
    baseSha: SPRINT_BASE_SHA,
    reviewHead,
    reviewedAt: "2026-09-04T00:02:00.000Z",
    sourceExecutions,
    baselineSource: reference(repositoryRoot, baselinePath),
    suiteComparisons: suiteNames.map((suite, index) => ({
      suite,
      current: baselineCounts[suite],
      baseline: baselineCounts[suite],
      delta: {
        files: { passed: 0, failed: 0, skipped: 0, todo: 0, total: 0 },
        tests: { passed: 0, failed: 0, skipped: 0, todo: 0, total: 0 },
      },
      ownerMissionIds: missionIds.slice(index * 2, index * 2 + 2),
      disposition: "no skip/todo delta",
    })),
    missionAttributions: missionIds.map((missionId) => ({
      missionId,
      disposition: "covered by the canonical suite capture",
      evidence: [executions.get("L-01-viz-core").result],
    })),
    unattributedDeltas: [],
    status: "pass",
  };
  const suiteAttributionPath = `${outputRoot}/l01-suite-attribution.json`;
  writeJson(repositoryRoot, suiteAttributionPath, attributionPayload);
  const attributionReference = reference(repositoryRoot, suiteAttributionPath);
  const attributionObservation = {
    ...attributionPayload,
    ...attributionReference,
    payload: attributionPayload,
    baseline: reference(repositoryRoot, baselinePath),
  };
  Object.assign(rows.find(({ id }) => id === "L-01")!, {
    observations: { attribution: attributionObservation },
  });
  const l09 = executions.get("L-09");
  const builderInspectionPath = `${outputRoot}/l09-review.json`;
  const inspectionPayload = {
    schemaVersion: "1.0.0",
    missionId: "s183-m06",
    rowId: "L-09",
    baseSha: SPRINT_BASE_SHA,
    reviewHead,
    reviewedAt: "2026-09-04T00:04:02.000Z",
    sourceExecution: {
      evidenceId: l09.evidenceId,
      result: l09.result,
      log: l09.log,
    },
    reviewerKind: "builder-closeout-inspection",
    builderSelfCertified: false,
    separateReviewRequired: true,
    countingMethod: L09_COUNTING_METHOD,
    referenceClassifications: {
      historical: 0,
      measuredAt: 1,
      retainedConstraint: 0,
      sr22Violations: 0,
      testLabel: 0,
      total: 1,
    },
    unclassifiedReferences: [],
    forwardSprintNumberedPromises: [],
    suiteAttribution: attributionReference,
    status: "pass",
  };
  writeJson(repositoryRoot, builderInspectionPath, inspectionPayload);
  const inspectionReference = reference(repositoryRoot, builderInspectionPath);
  Object.assign(rows.find(({ id }) => id === "L-09")!, {
    observations: {
      builderInspection: {
        ...inspectionPayload,
        ...inspectionReference,
        payload: inspectionPayload,
      },
    },
  });
  const resultSummary = rows.reduce<Record<string, number>>((counts, row) => {
    counts[row.status] = (counts[row.status] ?? 0) + 1;
    return counts;
  }, {});
  writeJson(repositoryRoot, INPUT_PATHS.gateRecord, {
    schemaVersion: "1.0.0",
    kind: "sprint-closeout-gate-record",
    sprintId: "sprint-183",
    missionId: "s183-m06",
    baseSha: SPRINT_BASE_SHA,
    reviewHead,
    builderSelfCertified: false,
    separateReviewRequired: true,
    canonicalRowCount: 24,
    canonicalRowIds: CANONICAL_GATE_ROW_IDS,
    resultSummary,
    rows,
  });
  return `${outputRoot}/logs/s183-m06-ci-01.log`;
}

function createFixture(): Fixture {
  const repositoryRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "oods-s183-closeout-"),
  );
  temporaryRoots.push(repositoryRoot);
  execFileSync("git", ["init", "-q"], { cwd: repositoryRoot });
  execFileSync(
    "git",
    ["config", "user.email", "closeout-fixture@example.invalid"],
    {
      cwd: repositoryRoot,
    },
  );
  execFileSync("git", ["config", "user.name", "Closeout Fixture"], {
    cwd: repositoryRoot,
  });
  execFileSync(
    "git",
    ["commit", "--allow-empty", "-q", "-m", "fixture review head"],
    {
      cwd: repositoryRoot,
    },
  );
  const reviewHead = execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  }).trim();

  const staticPaths = new Set([
    ...Object.values(EVIDENCE_PATHS),
    INPUT_PATHS.approvalSource,
    INPUT_PATHS.approvalTest,
    INPUT_PATHS.sprint182Approval,
    INPUT_PATHS.sprint182PromotionProjection,
    INPUT_PATHS.sprint182PromotionClaimDiff,
    INPUT_PATHS.sprint182PromotionBinding,
    INPUT_PATHS.sprint182CanonicalFoundationV1,
    INPUT_PATHS.planningMemo,
    ...REQUIRED_FOCUSED_TEST_FILES,
  ]);
  for (const repositoryPath of staticPaths)
    writeFile(repositoryRoot, repositoryPath);

  writeJson(repositoryRoot, INPUT_PATHS.cmosMissionContractSource, {
    schemaVersion: "1.0.0",
    kind: "cmos-mission-contract-export",
    capturedAt: "2026-09-04T22:04:32.846Z",
    source: {
      tool: "cmos_mission",
      action: "show",
      projectAddress: "cmos://derek/forge",
      projectId: "forge",
    },
    sprintId: "sprint-183",
    missionCount: 6,
    successCriterionCount: 38,
    missions: MISSION_CONTRACTS.map((mission, index) => ({
      id: mission.missionId,
      name: mission.name,
      statusAtCapture: index < 5 ? "Completed" : "In Progress",
      sprintId: "sprint-183",
      projectId: "forge",
      successCriteria: mission.successCriteria,
    })),
  });

  const focusedLogPath = "evidence/focused-suite.log";
  writeFile(repositoryRoot, focusedLogPath, "three focused groups passed\n");
  writeJson(repositoryRoot, INPUT_PATHS.focusedReceipt, {
    schemaVersion: "1.0.0",
    kind: "sprint-focused-suite-receipt",
    missionId: "s183-m06",
    reviewHead,
    measuredHead: reviewHead,
    operand: {
      cwd: repositoryRoot,
      detachedHead: true,
      cleanBefore: true,
      cleanAfter: true,
    },
    status: "passed",
    exitCode: 0,
    selected: 75,
    passed: 75,
    failed: 0,
    skipped: 0,
    command: "pnpm exec vitest run <eleven explicit files>",
    testFiles: REQUIRED_FOCUSED_TEST_FILES,
    selectedExecutionCount: 3,
    executedCount: 3,
    failedCount: 0,
    skippedExecutionCount: 0,
    executions: [
      {
        id: "s183-product-reality",
        literalCommand: "pnpm test product-reality",
        testFiles: REQUIRED_FOCUSED_TEST_FILES.slice(0, 8),
        exitCode: 0,
        selected: 50,
        passed: 50,
        failed: 0,
        skipped: 0,
      },
      {
        id: "s183-maintenance-wire",
        literalCommand: "pnpm test maintenance-wire",
        testFiles: [REQUIRED_FOCUSED_TEST_FILES[8]],
        exitCode: 0,
        selected: 15,
        passed: 15,
        failed: 0,
        skipped: 0,
      },
      {
        id: "s183-maintenance-docs",
        literalCommand: "pnpm test maintenance-docs",
        testFiles: REQUIRED_FOCUSED_TEST_FILES.slice(9),
        exitCode: 0,
        selected: 10,
        passed: 10,
        failed: 0,
        skipped: 0,
      },
    ],
    log: reference(repositoryRoot, focusedLogPath),
  });

  const gateLogPath = createGateRecord(repositoryRoot, reviewHead);

  const replayCases = EXPECTED_REPLAY_CASES.map((expected, index) => {
    writeFile(repositoryRoot, expected.patchPath, `case ${index + 1} patch\n`);
    const baselineSha256 = `sha256:${"a".repeat(64)}`;
    const mutatedSha256 = `sha256:${"b".repeat(64)}`;
    const patchSha256 = `sha256:${sha256(
      fs.readFileSync(path.join(repositoryRoot, expected.patchPath)),
    )}`;
    const redGate =
      expected.sourceMission === "s182-m01b"
        ? "component-styles-selected-test"
        : "interaction-evidence";
    const replayCase = {
      ...expected,
      status: "passed",
      report: `${expected.id}/report.json`,
      patchSha256,
      baselineSha256,
      mutatedSha256,
      restoredSha256: baselineSha256,
      redGate,
    };
    writeJson(
      repositoryRoot,
      path.posix.join(
        path.posix.dirname(INPUT_PATHS.mutationReplay),
        replayCase.report,
      ),
      {
        id: expected.id,
        sourceMission: expected.sourceMission,
        framework: expected.framework,
        kind: expected.kind,
        status: "passed",
        baseline: {
          commit: "4b4c77f0ec06d632e11f910f6124859ac65c7106",
          sha256: baselineSha256,
        },
        patch: {
          path: expected.patchPath,
          sha256: patchSha256,
          checkExitCode: 0,
          applyExitCode: 0,
        },
        mutatedSha256,
        reverse: {
          checkExitCode: 0,
          applyExitCode: 0,
          restoredSha256: baselineSha256,
          byteIdentical: true,
        },
        expectedGate: redGate,
        redControl:
          expected.sourceMission === "s182-m01b"
            ? {
                executed: true,
                preGreen: { exitCode: 0 },
                selectedRed: { exitCode: 1 },
                restoredGreen: { exitCode: 0 },
                byteIdenticalRestoration: true,
              }
            : {
                executed: true,
                patchByteIdenticalToStoredArtifact: true,
                status: "detected",
                expected: { gate: redGate, status: "failed" },
                observed: { gate: redGate, status: "failed" },
              },
      },
    );
    return replayCase;
  });
  writeJson(repositoryRoot, INPUT_PATHS.mutationReplay, {
    schemaVersion: "1.0.0",
    mission: "s183-m06",
    kind: "archived-mutation-patch-replay",
    status: "passed",
    baselineCommit: "4b4c77f0ec06d632e11f910f6124859ac65c7106",
    selected: 5,
    passed: 5,
    failed: 0,
    skipped: 0,
    unrunChecks: [],
    cases: replayCases,
  });

  const canonicalComponentIds = R02_CANONICAL_COMPONENT_IDS;
  const selectedTargets = ["react", "vue"];
  const packageRecords = R02_PACKAGE_EVIDENCE.map((expectedPackage) => {
    const sourceTarball = path.join(
      sourceRepositoryRoot,
      expectedPackage.tarballPath,
    );
    const targetTarball = path.join(
      repositoryRoot,
      expectedPackage.tarballPath,
    );
    fs.mkdirSync(path.dirname(targetTarball), { recursive: true });
    fs.copyFileSync(sourceTarball, targetTarball);
    return {
      target: expectedPackage.target,
      packageName: expectedPackage.packageName,
      version: expectedPackage.version,
      tarball: {
        path: expectedPackage.tarballPath,
        sha256: `sha256:${expectedPackage.tarballSha256}`,
        bytes: expectedPackage.tarballBytes,
        committedAt: "4b4c77f0ec06d632e11f910f6124859ac65c7106",
        tracked: true,
      },
      declaration: {
        archiveEntry: "package/dist/index.d.ts",
        sha256: `sha256:${expectedPackage.declarationSha256}`,
        bytes: expectedPackage.declarationBytes,
        extractedFromCommittedTarball: true,
      },
      canonicalNucleusExports: canonicalComponentIds,
      canonicalNucleusExportCount: 14,
    };
  });
  const cells = packageRecords.flatMap((packageRecord) =>
    canonicalComponentIds.map((componentId) => ({
      componentId,
      target: packageRecord.target,
      packageExport: {
        status: "passed",
        packageName: packageRecord.packageName,
        tarballPath: packageRecord.tarball.path,
        tarballSha256: packageRecord.tarball.sha256,
        declarationArchiveEntry: packageRecord.declaration.archiveEntry,
        declarationSha256: packageRecord.declaration.sha256,
      },
    })),
  );
  fs.copyFileSync(
    path.join(sourceRepositoryRoot, EVIDENCE_PATHS.packageInventory),
    path.join(repositoryRoot, EVIDENCE_PATHS.packageInventory),
  );
  writeJson(repositoryRoot, INPUT_PATHS.r02Resolution, {
    schemaVersion: "1.0.0",
    mission: "s183-m06",
    risk: "R-02",
    kind: "package-export-evidence-resolution",
    status: "resolved",
    selected: 28,
    passed: 28,
    failed: 0,
    skipped: 0,
    baselineCommit: "4b4c77f0ec06d632e11f910f6124859ac65c7106",
    workspaceBuildOutputRequired: false,
    freshCloneAvailable: true,
    canonicalComponentIds,
    selectedTargets,
    selectedCells: 28,
    packages: packageRecords,
    cells,
    sourceInventory: {
      path: EVIDENCE_PATHS.packageInventory,
      sha256:
        "sha256:45e42dcf019d95b9bb6727b63457d56240bfac7835df160f06b55095472be824",
    },
  });

  writeJson(repositoryRoot, INPUT_PATHS.maintenanceDisposition, {
    schemaVersion: "1.0.0",
    kind: "maintenance-disposition",
    mission: "s183-m06",
    resolved: ["#1316", "#1317"].map((nextStep) => ({
      nextStep,
      status: "resolved",
    })),
    carried: ["#1315", "#1318", "#1319", "#1320", "#1321", "#1322"].map(
      (nextStep) => ({ nextStep, status: "carried-unchanged" }),
    ),
  });

  writeJson(repositoryRoot, EVIDENCE_PATHS.compilationReport, {
    schemaVersion: "1.0.0",
    mission: "s183-m04",
    kind: "saved-schema-compilation-report",
    corpus: { schemaCount: 16 },
    summary: {
      schemaDispositions: {
        compiledBothTargets: ["saved-subject"],
        typedGap: Array.from({ length: 15 }, (_, index) => `gap-${index + 1}`),
      },
      determinism: { schemaTargetCases: 32, mismatches: [] },
    },
  });

  writeJson(repositoryRoot, EVIDENCE_PATHS.consumerReport, {
    schemaVersion: "1.0.0",
    mission: "s183-m05",
    kind: "genuine-saved-schema-clean-consumer-proof",
    status: "passed",
    selected: 16,
    passed: 16,
    failed: 0,
    skipped: 0,
    frameworks: ["react", "vue"].map((framework) => ({
      framework,
      status: "passed",
      selected: 8,
      passed: 8,
    })),
    mutationControls: Array.from({ length: 4 }, (_, index) => ({
      index,
      status: "detected",
    })),
  });

  return { repositoryRoot, reviewHead, gateLogPath };
}

afterEach(() => {
  while (temporaryRoots.length > 0) {
    fs.rmSync(temporaryRoots.pop()!, { recursive: true, force: true });
  }
});

describe("Sprint 183 M06 deterministic closeout", () => {
  it("rejects a vacuous sprint base and preserves the exact L-09 safety transform", () => {
    const currentHead = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: sourceRepositoryRoot,
      encoding: "utf8",
    }).trim();
    expect(() =>
      buildGateRecord({
        baseSha: currentHead,
        reviewHead: currentHead,
        outputRoot: path.join(sourceRepositoryRoot, "does-not-exist"),
      }),
    ).toThrow(/base SHA must be the Sprint-183 start commit/);
    expect(() =>
      buildGateRecord({
        baseSha: SPRINT_BASE_SHA,
        reviewHead: SPRINT_BASE_SHA,
        outputRoot: path.join(sourceRepositoryRoot, "does-not-exist"),
      }),
    ).toThrow(/must be distinct/);

    const literals = [
      "git diff --unified=0 base -- .",
      'while read file; do git diff --no-index --unified=0 -- /dev/null "$file"; diff_status=$?; done',
    ];
    expect(expectedExecutionCommands("L-09", literals)).toEqual([
      literals[0],
      "git ls-files --others --exclude-standard >/dev/null",
      'while read file; do set +e; git diff --no-index --unified=0 -- /dev/null "$file"; diff_status=$?; set -e; done',
    ]);
  });

  it("parses exactly one internally reconciled Vitest summary and retains disclosed baseline skips", () => {
    const counts = parseVitestCounts(
      Buffer.from(
        [
          " Test Files  2 passed | 1 skipped (3)",
          " Tests  40 passed | 16 skipped (56)",
        ].join("\n"),
      ),
      "control",
    );
    expect(counts).toEqual({
      files: { passed: 2, failed: 0, skipped: 1, todo: 0, total: 3 },
      tests: { passed: 40, failed: 0, skipped: 16, todo: 0, total: 56 },
    });
    expect(() =>
      parseVitestCounts(
        Buffer.from(
          "Test Files 1 passed (1)\nTest Files 1 passed (1)\nTests 1 passed (1)",
        ),
        "duplicated",
      ),
    ).toThrow(/2 Test Files summaries/);
    expect(() =>
      parseVitestCounts(
        Buffer.from("Test Files 1 passed (2)\nTests 1 passed (1)"),
        "bad-arithmetic",
      ),
    ).toThrow(/counts do not add/);
  });

  it("counts the exact L-09 added-line reference population", () => {
    const diff = Buffer.from(
      [
        "+++ b/ignored-sprint-999.md",
        "+Sprint-183 and s183-m06 are qualifying references.",
        "+OODS-S999 is a diagnostic identifier.",
        "++++nested patch retains Sprint 182 as an outer addition",
        "-Sprint 184 is removed, not added.",
      ].join("\n"),
    );
    expect(countL09ReferenceOccurrences(diff)).toBe(3);
  });

  it("reconciles the exact 38 CMOS criteria and writes an acyclic review handoff", () => {
    const fixture = createFixture();
    const artifacts = buildCloseoutArtifacts(fixture);
    writeOrCheckArtifacts({ ...fixture, artifacts, mode: "write" });
    expect(() =>
      writeOrCheckArtifacts({
        ...fixture,
        artifacts: buildCloseoutArtifacts(fixture),
        mode: "check",
      }),
    ).not.toThrow();

    const contracts = artifacts[OUTPUT_PATHS.missionContracts];
    const ledger = artifacts[OUTPUT_PATHS.claimLedger];
    const audit = artifacts[OUTPUT_PATHS.claimAudit];
    const handoff = artifacts[OUTPUT_PATHS.reviewHandoff];
    const evidenceIndex = artifacts[OUTPUT_PATHS.evidenceIndex];
    expect(
      MISSION_CONTRACTS.map(({ successCriteria }) => successCriteria.length),
    ).toEqual([6, 6, 6, 7, 7, 6]);
    expect(contracts.expectedClaimCount).toBe(38);
    expect(ledger.claims).toHaveLength(38);
    expect(new Set(ledger.claims.map(({ claimId }) => claimId))).toHaveLength(
      38,
    );
    expect(ledger.summary).toEqual(
      expect.objectContaining({
        selected: 38,
        passed: 38,
        failed: 0,
        skipped: 0,
      }),
    );
    expect(audit).toEqual(
      expect.objectContaining({
        status: "passed",
        selected: 38,
        passed: 38,
        failed: 0,
        skipped: 0,
      }),
    );
    expect(handoff.builder.builderSelfCertified).toBe(false);
    expect(handoff.approval.separateReviewRequired).toBe(true);
    expect(handoff.approval.sprint183ApprovalRecord).toBeNull();
    expect(evidenceIndex.selfExcluded).toBe(true);
    expect(
      evidenceIndex.entries.some(
        ({ path: repositoryPath }) =>
          repositoryPath === OUTPUT_PATHS.evidenceIndex,
      ),
    ).toBe(false);
  });

  it("turns a missing gate result and a tampered gate log red", () => {
    const missing = createFixture();
    const gateRecord = JSON.parse(
      fs.readFileSync(
        path.join(missing.repositoryRoot, INPUT_PATHS.gateRecord),
        "utf8",
      ),
    ) as { rows: Array<{ executions: Array<{ result: { path: string } }> }> };
    fs.rmSync(
      path.join(
        missing.repositoryRoot,
        gateRecord.rows[0]!.executions[0]!.result.path,
      ),
    );
    expect(() => buildCloseoutArtifacts(missing)).toThrow(
      /Cited evidence path is missing/,
    );

    const tampered = createFixture();
    fs.appendFileSync(
      path.join(tampered.repositoryRoot, tampered.gateLogPath),
      "tampered\n",
    );
    expect(() => buildCloseoutArtifacts(tampered)).toThrow(
      /Cited evidence hash mismatch/,
    );
  });

  it("rejects a direct content-addressed evidence mismatch", () => {
    const fixture = createFixture();
    const repositoryPath = "evidence/content-addressed.txt";
    writeFile(fixture.repositoryRoot, repositoryPath, "before\n");
    const cited = reference(fixture.repositoryRoot, repositoryPath);
    writeFile(fixture.repositoryRoot, repositoryPath, "after\n");
    expect(() =>
      verifyEvidenceReference({
        repositoryRoot: fixture.repositoryRoot,
        reference: cited,
      }),
    ).toThrow(/hash mismatch/);
  });

  it("rejects CMOS contract drift and a duplicated R-02 target/component cell", () => {
    const cmosDrift = createFixture();
    const cmosPath = path.join(
      cmosDrift.repositoryRoot,
      INPUT_PATHS.cmosMissionContractSource,
    );
    const cmos = JSON.parse(fs.readFileSync(cmosPath, "utf8")) as {
      missions: Array<{ successCriteria: string[] }>;
    };
    cmos.missions[0]!.successCriteria[0] =
      "plausible but not the CMOS criterion";
    writeJson(
      cmosDrift.repositoryRoot,
      INPUT_PATHS.cmosMissionContractSource,
      cmos,
    );
    expect(() => buildCloseoutArtifacts(cmosDrift)).toThrow(
      /drifted from the independent CMOS export/,
    );

    const duplicateCell = createFixture();
    const r02Path = path.join(
      duplicateCell.repositoryRoot,
      INPUT_PATHS.r02Resolution,
    );
    const r02 = JSON.parse(fs.readFileSync(r02Path, "utf8")) as {
      cells: Array<Record<string, unknown>>;
    };
    r02.cells[1] = structuredClone(r02.cells[0]!);
    writeJson(duplicateCell.repositoryRoot, INPUT_PATHS.r02Resolution, r02);
    expect(() => buildCloseoutArtifacts(duplicateCell)).toThrow(
      /cells are not unique/,
    );
  });
});
