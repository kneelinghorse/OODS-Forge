import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

import {
  INPUT_PATHS,
  MAINTENANCE_CARRIES,
  MISSION_CRITERIA,
  OUTPUT_PATHS,
  buildCloseoutArtifacts,
  canonicalJson,
  sha256,
  writeOrCheckArtifacts,
} from "../../../../scripts/product-reality/s184-m07-closeout.mjs";
import {
  AUDIT_HEAD as RECONNECT_AUDIT_HEAD,
  DESTINATIONS as RECONNECT_DESTINATIONS,
  DISPOSITION_PATH as RECONNECT_DISPOSITION_PATH,
  PLAN_PATH as RECONNECT_PLAN_PATH,
  buildReconnectRequests,
} from "../../../../scripts/product-reality/s184-m07-reconnect.mjs";

interface Fixture {
  repositoryRoot: string;
  sprintBaseSha: string;
  implementationHead: string;
  reviewHead: string;
  paths: {
    baselineReceipt: string;
    currentReceipt: string;
    patchReport: string;
    remediationReport: string;
    reconnectDisposition: string;
    reconnectPlan: string;
    focusedReceipt: string;
    sprintStatus: string;
  };
}

const temporaryRoots: string[] = [];
const sourceRepositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);

function git(repositoryRoot: string, args: string[]) {
  return execFileSync("git", args, {
    cwd: repositoryRoot,
    encoding: "utf8",
  }).trim();
}

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

function commit(repositoryRoot: string, message: string) {
  git(repositoryRoot, ["add", "."]);
  git(repositoryRoot, ["commit", "-q", "-m", message]);
  return git(repositoryRoot, ["rev-parse", "HEAD"]);
}

function suiteReceipt({
  suite,
  measuredHead,
  files,
  skippedTests = 0,
}: {
  suite: string;
  measuredHead: string;
  files: string[];
  skippedTests?: number;
}) {
  return {
    schemaVersion: "1.0.0",
    kind: "s184-suite-receipt-fixture",
    suite,
    measuredHead,
    status: "passed",
    vitest: {
      success: true,
      files: {
        total: files.length,
        passed: files.length,
        failed: 0,
        skipped: 0,
      },
      tests: {
        total: files.length + skippedTests,
        passed: files.length,
        failed: 0,
        skipped: skippedTests,
        todo: 0,
      },
      fileResults: files.map((repositoryPath) => ({
        path: repositoryPath,
        status: "passed",
        tests: {
          total:
            1 + (repositoryPath === "tests/kept.spec.ts" ? skippedTests : 0),
          passed: 1,
          failed: 0,
          skipped: repositoryPath === "tests/kept.spec.ts" ? skippedTests : 0,
          todo: 0,
        },
      })),
    },
  };
}

function reconnectPlanFixture() {
  return {
    schemaVersion: "1.0.0",
    missionId: "s184-m07",
    kind: "reconnect-derivation-plan",
    status: "ready-for-send",
    auditHead: RECONNECT_AUDIT_HEAD,
    sprint183: {
      derivedCount: 2,
      movers: ["tests/added.spec.ts", "tests/removed.spec.ts"],
    },
    sprint184: {
      union: {
        sourceCount: 1,
        count: 1,
        duplicatesRemoved: 0,
        movers: ["tests/added.spec.ts"],
      },
    },
    combinedUnique: {
      count: 2,
      crossSprintOverlap: 1,
      movers: ["tests/added.spec.ts", "tests/removed.spec.ts"],
    },
    destinations: RECONNECT_DESTINATIONS.map((destination) => ({
      ...destination,
    })),
    finalization: {
      noticeRecordPath:
        "artifacts/product-reality/sprint-184/m07/reconnect-notices.json",
      requiresImplementationHeadCommit: true,
      requiredMessageIds: 3,
      messageIdsMustBeNonEmptyAndUnique: true,
    },
    unrunChecks: [
      "The implementation head has not been committed.",
      "The three CMOS info_push requests have not been sent.",
      "The three unique non-empty message IDs have not been recorded.",
    ],
  };
}

function createFixture(
  implementationMessage = "s184-m07: add and remove accounting fixtures",
  removeBySuiteConfiguration = false,
): Fixture {
  const repositoryRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "oods-s184-m07-closeout-"),
  );
  temporaryRoots.push(repositoryRoot);
  git(repositoryRoot, ["init", "-q"]);
  git(repositoryRoot, ["config", "user.email", "m07@example.invalid"]);
  git(repositoryRoot, ["config", "user.name", "M07 Fixture"]);

  writeFile(repositoryRoot, "tests/kept.spec.ts");
  writeFile(repositoryRoot, "tests/removed.spec.ts");
  writeFile(
    repositoryRoot,
    "vitest.config.ts",
    "export default { exclude: [] };\n",
  );
  const sprintBaseSha = commit(repositoryRoot, "s184-m01: suite baseline");
  const outputRoot = "artifacts/product-reality/sprint-184/m07";
  const paths = {
    baselineReceipt: `${outputRoot}/suite/baseline-root-core.json`,
    currentReceipt: `${outputRoot}/suite/current-root-core.json`,
    patchReport: `${outputRoot}/patch-disposition.json`,
    remediationReport: `${outputRoot}/b2-remediation.json`,
    reconnectDisposition: RECONNECT_DISPOSITION_PATH,
    reconnectPlan: RECONNECT_PLAN_PATH,
    focusedReceipt: `${outputRoot}/focused-suite.json`,
    sprintStatus: `${outputRoot}/sprint-status.json`,
  };

  if (removeBySuiteConfiguration) {
    writeFile(
      repositoryRoot,
      "vitest.config.ts",
      "export default { exclude: ['tests/removed.spec.ts'] };\n",
    );
  } else {
    fs.rmSync(path.join(repositoryRoot, "tests/removed.spec.ts"));
  }
  writeFile(repositoryRoot, "tests/added.spec.ts");
  const reconnectPlan = reconnectPlanFixture();
  writeJson(repositoryRoot, paths.reconnectPlan, reconnectPlan);
  const implementationHead = commit(repositoryRoot, implementationMessage);
  writeJson(
    repositoryRoot,
    paths.baselineReceipt,
    suiteReceipt({
      suite: "root-core",
      measuredHead: sprintBaseSha,
      files: ["tests/kept.spec.ts", "tests/removed.spec.ts"],
    }),
  );
  writeJson(
    repositoryRoot,
    paths.currentReceipt,
    suiteReceipt({
      suite: "root-core",
      measuredHead: implementationHead,
      files: ["tests/added.spec.ts", "tests/kept.spec.ts"],
      skippedTests: 16,
    }),
  );
  writeJson(repositoryRoot, paths.patchReport, {
    kind: "patch-population-proof",
    status: "passed",
  });
  writeJson(repositoryRoot, paths.remediationReport, {
    kind: "b2-remediation-proof",
    status: "passed",
  });
  writeJson(repositoryRoot, paths.focusedReceipt, {
    kind: "focused-closeout-controls",
    status: "passed",
  });
  writeJson(repositoryRoot, paths.sprintStatus, {
    kind: "cmos-sprint-status-source",
    sprintId: "sprint-184",
    status: "Active",
  });
  writeJson(repositoryRoot, INPUT_PATHS.cmosMissionContract, {
    schemaVersion: "1.0.0",
    kind: "cmos-mission-contract-source",
    missionId: "s184-m07",
    successCriteria: MISSION_CRITERIA,
  });

  const requests = buildReconnectRequests(reconnectPlan, implementationHead);
  const requestSha256 = (index: number) =>
    sha256(Buffer.from(canonicalJson(requests[index]), "utf8"));
  const reconnectPlanBytes = fs.readFileSync(
    path.join(repositoryRoot, paths.reconnectPlan),
  );
  writeJson(repositoryRoot, paths.reconnectDisposition, {
    schemaVersion: "1.0.0",
    missionId: "s184-m07",
    kind: "three-consumer-reconnect-disposition",
    status: "passed",
    recordingStatus: "passed",
    deliveryStatus: "completed-with-retired-consumer",
    criterionStatus: "passed",
    statusMeaning:
      "Passed means both active consumers received the exact Git-derived notice and the archived consumer has an explicit, machine-readable retirement disposition; no message id is fabricated.",
    auditHead: RECONNECT_AUDIT_HEAD,
    implementationHead,
    plan: {
      path: paths.reconnectPlan,
      revision: implementationHead,
      bytes: reconnectPlanBytes.byteLength,
      sha256: sha256(reconnectPlanBytes),
    },
    planFinalizationDisposition: {
      historicalFinalization: { ...reconnectPlan.finalization },
      unrunCheckDispositions: [
        {
          check: reconnectPlan.unrunChecks[0],
          resolution: "satisfied",
          evidence: "implementation-head-and-plan-byte-binding",
        },
        {
          check: reconnectPlan.unrunChecks[1],
          resolution: "two-active-sends-satisfied-one-retired",
          preservedRequiredSuccessfulDeliveries: 2,
          supersededRetiredDeliveryRequirements: 1,
        },
        {
          check: reconnectPlan.unrunChecks[2],
          resolution: "two-active-message-ids-satisfied-one-retired",
          preservedRequiredMessageIds: 2,
          supersededRetiredMessageIdRequirements: 1,
        },
      ],
      supersession: {
        authority: "product-owner",
        scope: "retired-destination-only",
        effectiveDispositionRecordPath: paths.reconnectDisposition,
        strictThreeSuccessNoticeContractPreserved: true,
        retiredDestination: {
          ...RECONNECT_DESTINATIONS[1],
          projectId: "0dc6bde8-2c52-4ffb-8a90-7cbe35eb031c",
        },
        preservedActiveDestinations: [
          { ...RECONNECT_DESTINATIONS[0] },
          { ...RECONNECT_DESTINATIONS[2] },
        ],
        supersededRequirements: {
          successfulDeliveryForRetiredDestination: true,
          messageIdForRetiredDestination: true,
        },
        preservedRequirements: {
          implementationHeadCommit: true,
          successfulActiveDeliveries: 2,
          uniqueNonEmptyActiveMessageIds: 2,
          activeMessageIdsMustBeNonEmptyAndUnique: true,
          activeRequestsMustRemainGitDerived: true,
        },
      },
    },
    derivation: {
      sprint183Movers: 2,
      sprint184TrancheMovers: 1,
      sprint184UniqueMovers: 1,
      sprint184DuplicatesRemoved: 0,
      crossSprintOverlap: 1,
      combinedUniqueMovers: 2,
    },
    attempts: [
      {
        ...RECONNECT_DESTINATIONS[0],
        status: "sent",
        attemptCount: 1,
        requestSha256: requestSha256(0),
        result: { success: true, messageId: "message-1" },
      },
      {
        ...RECONNECT_DESTINATIONS[1],
        status: "retired",
        attemptCount: 2,
        result: { success: false, errorCode: "DASHBOARD_ERROR" },
        failure: {
          classification: "archived-project",
          projectId: "0dc6bde8-2c52-4ffb-8a90-7cbe35eb031c",
          message:
            "Dashboard error: Project 'dashboard-demos' is archived and no longer accepts messages.",
          terminalDisposition:
            "Retired from the delivery requirement by explicit product-owner direction; no message id exists or is fabricated.",
        },
      },
      {
        ...RECONNECT_DESTINATIONS[2],
        status: "sent",
        attemptCount: 1,
        requestSha256: requestSha256(2),
        result: { success: true, messageId: "message-2" },
      },
    ],
    successfulMessageIds: ["message-1", "message-2"],
    summary: {
      requiredDestinations: 3,
      attemptedDestinations: 3,
      dispositionedDestinations: 3,
      deliveryAttempts: 4,
      successfulDeliveries: 2,
      retiredDestinations: 1,
      failedDeliveryAttempts: 2,
      unresolvedDestinations: 0,
      recordedMessageIds: 2,
      allActiveDeliveriesProven: true,
      allRequiredConsumerObligationsDispositioned: true,
    },
    retirementDecision: {
      authority: "product-owner",
      targetAddress: RECONNECT_DESTINATIONS[1].targetAddress,
      projectId: "0dc6bde8-2c52-4ffb-8a90-7cbe35eb031c",
      reason:
        "The destination is archived, refuses messages, and is no longer an active project.",
      policy:
        "A retired destination is closed by machine-readable disposition, not by a fabricated successful delivery or message id.",
    },
  });

  const executionRows = [
    {
      rowId: "patch-population",
      executions: [
        {
          executionId: "m07-patch-population",
          kind: "focused-test",
          status: "passed",
          evidencePaths: [paths.patchReport],
        },
      ],
    },
    {
      rowId: "typed-gap-remediation",
      executions: [
        {
          executionId: "m07-typed-gap-remediation",
          kind: "focused-test",
          status: "passed",
          evidencePaths: [paths.remediationReport],
        },
      ],
    },
    {
      rowId: "suite-accounting",
      executions: [
        {
          executionId: "m07-suite-accounting",
          kind: "four-suite-capture",
          status: "passed",
          evidencePaths: [paths.currentReceipt],
        },
      ],
    },
    {
      rowId: "reconnect",
      executions: [
        {
          executionId: "m07-reconnect",
          kind: "cmos-message-send",
          status: "passed",
          evidencePaths: [paths.reconnectDisposition, paths.reconnectPlan],
        },
      ],
    },
    {
      rowId: "ledger-controls",
      executions: [
        {
          executionId: "m07-ledger-controls",
          kind: "focused-test",
          status: "passed",
          evidencePaths: [paths.focusedReceipt],
        },
      ],
    },
    {
      rowId: "review-handoff",
      executions: [
        {
          executionId: "m07-review-handoff",
          kind: "cmos-status-capture",
          status: "passed",
          evidencePaths: [paths.sprintStatus],
        },
      ],
    },
  ];
  const binding = (
    criterionIndex: number,
    executionId: string,
    evidencePath: string,
  ) => ({
    criterionIndex,
    status: "passed",
    executionIds: [executionId],
    evidencePaths: [evidencePath],
  });
  writeJson(repositoryRoot, INPUT_PATHS.manifest, {
    schemaVersion: "1.0.0",
    kind: "s184-m07-closeout-input-manifest",
    sprintStatusSourcePath: paths.sprintStatus,
    suiteReceipts: {
      baseline: { "root-core": paths.baselineReceipt },
      current: { "root-core": paths.currentReceipt },
    },
    ...(removeBySuiteConfiguration
      ? {
          suiteAccountingScopes: [
            {
              scopeId: "fixture",
              purpose: "exercise suite-membership removal attribution",
              baselineHead: sprintBaseSha,
              baselineReceiptPaths: {
                "root-core": paths.baselineReceipt,
              },
              currentReceiptPaths: { "root-core": paths.currentReceipt },
              membershipChangeEvidencePaths: {
                "root-core": ["vitest.config.ts"],
              },
            },
          ],
        }
      : {}),
    executionRows,
    claimBindings: [
      binding(1, "m07-patch-population", paths.patchReport),
      binding(2, "m07-patch-population", paths.patchReport),
      binding(3, "m07-patch-population", paths.patchReport),
      binding(4, "m07-typed-gap-remediation", paths.remediationReport),
      binding(5, "m07-typed-gap-remediation", paths.remediationReport),
      binding(6, "m07-suite-accounting", paths.currentReceipt),
      {
        ...binding(7, "m07-reconnect", paths.reconnectDisposition),
        evidencePaths: [paths.reconnectDisposition, paths.reconnectPlan],
      },
      binding(8, "m07-ledger-controls", paths.focusedReceipt),
      binding(9, "m07-review-handoff", paths.sprintStatus),
    ],
  });
  const reviewHead = commit(repositoryRoot, "s184-m07: freeze closeout inputs");
  return {
    repositoryRoot,
    sprintBaseSha,
    implementationHead,
    reviewHead,
    paths,
  };
}

function build(fixture: Fixture) {
  return buildCloseoutArtifacts({
    repositoryRoot: fixture.repositoryRoot,
    reviewHead: fixture.reviewHead,
    sprintBaseSha: fixture.sprintBaseSha,
    requireCanonicalScopePlan: false,
  });
}

function updateJsonAtHead(
  fixture: Fixture,
  repositoryPath: string,
  update: (value: any) => void,
) {
  const absolutePath = path.join(fixture.repositoryRoot, repositoryPath);
  const value = JSON.parse(fs.readFileSync(absolutePath, "utf8"));
  update(value);
  writeJson(fixture.repositoryRoot, repositoryPath, value);
  fixture.reviewHead = commit(
    fixture.repositoryRoot,
    "s184-m07: mutate closeout fixture",
  );
}

function frozenBytes(
  repositoryRoot: string,
  reviewHead: string,
  repositoryPath: string,
) {
  return execFileSync("git", ["show", `${reviewHead}:${repositoryPath}`], {
    cwd: repositoryRoot,
  });
}

function frozenJson(
  repositoryRoot: string,
  reviewHead: string,
  repositoryPath: string,
) {
  return JSON.parse(
    frozenBytes(repositoryRoot, reviewHead, repositoryPath).toString("utf8"),
  );
}

function sourceCriteria(source: any) {
  if (source.missionId === "s184-m07") return source.successCriteria;
  if (source.mission?.id === "s184-m07") {
    return source.mission.successCriteria;
  }
  return source.missions.find(
    ({ id, missionId }: any) => id === "s184-m07" || missionId === "s184-m07",
  ).successCriteria;
}

function independentlyVerifyArtifacts({
  repositoryRoot,
  reviewHead,
  artifacts,
}: {
  repositoryRoot: string;
  reviewHead: string;
  artifacts: Record<string, any>;
}) {
  const ledger = artifacts[OUTPUT_PATHS.claimLedger];
  const cmosSource = frozenJson(
    repositoryRoot,
    reviewHead,
    INPUT_PATHS.cmosMissionContract,
  );
  const criteria = sourceCriteria(cmosSource);
  expect(criteria).toEqual(MISSION_CRITERIA);
  expect(ledger.claims.map(({ criterion }: any) => criterion)).toEqual(
    criteria,
  );

  const executionIds = ledger.executions.map(
    ({ executionId }: any) => executionId,
  );
  expect(new Set(executionIds).size).toBe(executionIds.length);
  for (const claim of ledger.claims) {
    expect(claim.executionIds.length).toBeGreaterThan(0);
    expect(
      claim.executionIds.every((executionId: string) =>
        executionIds.includes(executionId),
      ),
    ).toBe(true);
    for (const reference of claim.evidence) {
      const bytes = frozenBytes(repositoryRoot, reviewHead, reference.path);
      expect(bytes.byteLength).toBe(reference.bytes);
      expect(crypto.createHash("sha256").update(bytes).digest("hex")).toBe(
        reference.sha256,
      );
    }
  }
  expect(ledger.headline.passed).toBe(
    ledger.claims.filter(({ status }: any) => status === "passed").length,
  );

  const manifest = frozenJson(repositoryRoot, reviewHead, INPUT_PATHS.manifest);
  const scopes = Array.isArray(manifest.suiteAccountingScopes)
    ? manifest.suiteAccountingScopes
    : [
        {
          scopeId: "sprint-184",
          baselineReceiptPaths: manifest.suiteReceipts.baseline,
          currentReceiptPaths: manifest.suiteReceipts.current,
        },
      ];
  const accounting = artifacts[OUTPUT_PATHS.suiteAccounting];
  expect(accounting.unattributedDeltas).toEqual([]);
  for (const scope of scopes) {
    const emitted = accounting.scopes.find(
      ({ scopeId }: any) => scopeId === scope.scopeId,
    ).accounting;
    for (const [suite, baselinePath] of Object.entries(
      scope.baselineReceiptPaths,
    )) {
      const baseline = frozenJson(
        repositoryRoot,
        reviewHead,
        baselinePath as string,
      );
      const current = frozenJson(
        repositoryRoot,
        reviewHead,
        scope.currentReceiptPaths[suite],
      );
      const baselineFiles = new Set(
        baseline.vitest.fileResults.map(({ path: rowPath }: any) => rowPath),
      );
      const currentFiles = new Set(
        current.vitest.fileResults.map(({ path: rowPath }: any) => rowPath),
      );
      const baselineRows = new Map(
        baseline.vitest.fileResults.map((row: any) => [row.path, row]),
      );
      const currentRows = new Map(
        current.vitest.fileResults.map((row: any) => [row.path, row]),
      );
      const measuredCount = (row: any) =>
        Number.isInteger(row.tests.total)
          ? row.tests.total
          : row.tests.collectedRunnable + (row.tests.skipped ?? 0);
      const expected = [
        ...[...currentFiles]
          .filter((rowPath) => !baselineFiles.has(rowPath))
          .map((rowPath) => ({
            change: "added",
            path: rowPath,
            measuredTestCount: measuredCount(currentRows.get(rowPath)),
          })),
        ...[...baselineFiles]
          .filter((rowPath) => !currentFiles.has(rowPath))
          .map((rowPath) => ({
            change: "removed",
            path: rowPath,
            measuredTestCount: measuredCount(baselineRows.get(rowPath)),
          })),
      ].sort((left, right) =>
        `${left.change}:${left.path}`.localeCompare(
          `${right.change}:${right.path}`,
          "en",
        ),
      );
      const actual = emitted.suites
        .find(({ suite: rowSuite }: any) => rowSuite === suite)
        .fileDelta.rows.map(
          ({ change, path: rowPath, measuredTests }: any) => ({
            change,
            path: rowPath,
            measuredTestCount: measuredTests.count,
          }),
        )
        .sort((left: any, right: any) =>
          `${left.change}:${left.path}`.localeCompare(
            `${right.change}:${right.path}`,
            "en",
          ),
        );
      expect(actual).toEqual(expected);
      const addedTests = expected
        .filter(({ change }) => change === "added")
        .reduce((total, row) => total + row.measuredTestCount, 0);
      const removedTests = expected
        .filter(({ change }) => change === "removed")
        .reduce((total, row) => total + row.measuredTestCount, 0);
      const population = emitted.suites.find(
        ({ suite: rowSuite }: any) => rowSuite === suite,
      ).populationTestDelta;
      expect(population).toEqual(
        expect.objectContaining({
          addedTests,
          removedTests,
          netPopulationTestDelta: addedTests - removedTests,
          wholeSuiteTestDelta:
            current.vitest.tests.total - baseline.vitest.tests.total,
          retainedFileTestDelta:
            current.vitest.tests.total -
            baseline.vitest.tests.total -
            (addedTests - removedTests),
        }),
      );
    }
  }

  const handoff = artifacts[OUTPUT_PATHS.reviewHandoff];
  const sprintStatusSource = frozenJson(
    repositoryRoot,
    reviewHead,
    manifest.sprintStatusSourcePath,
  );
  expect(sprintStatusSource).toEqual(
    expect.objectContaining({ sprintId: "sprint-184", status: "Active" }),
  );
  expect(handoff.sprintStatus).toBe("Active");
  expect(handoff.sprintStatusSource.sha256).toBe(
    crypto
      .createHash("sha256")
      .update(
        frozenBytes(
          repositoryRoot,
          reviewHead,
          manifest.sprintStatusSourcePath,
        ),
      )
      .digest("hex"),
  );
  expect(handoff.builder.builderSelfCertified).toBe(false);
  expect(handoff.approval.separateReviewRequired).toBe(true);
  const c15 = artifacts[OUTPUT_PATHS.reviewCarries].carries.find(
    ({ id }: any) => id === "C15",
  );
  if (c15.evidence) {
    expect(c15.evidence.skippedRows).toEqual([
      {
        path: "packages/mcp-server/test/e2e/action-mappings.e2e.spec.ts",
        skipped: 9,
      },
      {
        path: "packages/mcp-server/test/e2e/stage1-rollups.e2e.spec.ts",
        skipped: 7,
      },
    ]);
    for (const reference of [
      c15.evidence.currentSuiteReceipt,
      c15.evidence.historicalDisclosure,
    ]) {
      const bytes = frozenBytes(repositoryRoot, reviewHead, reference.path);
      expect(reference.sha256).toBe(
        crypto.createHash("sha256").update(bytes).digest("hex"),
      );
    }
  }
}

afterEach(async () => {
  const roots = temporaryRoots.splice(0);
  await Promise.all(
    roots.map((root) => fs.promises.rm(root, { recursive: true, force: true })),
  );
});

describe("Sprint 184 M07 closeout accounting", () => {
  it("accounts for added and removed suite files and independently audits every claim", () => {
    const fixture = createFixture();
    const artifacts = build(fixture);
    writeOrCheckArtifacts({
      repositoryRoot: fixture.repositoryRoot,
      artifacts,
      mode: "write",
    });
    expect(() =>
      writeOrCheckArtifacts({
        repositoryRoot: fixture.repositoryRoot,
        artifacts,
        mode: "check",
      }),
    ).not.toThrow();

    const accounting = artifacts[OUTPUT_PATHS.suiteAccounting];
    expect(accounting.scopes[0].accounting.totals).toEqual({
      addedFiles: 1,
      removedFiles: 1,
    });
    expect(accounting.unattributedDeltas).toEqual([]);
    expect(accounting.scopes[0].accounting.suites[0].fileDelta.rows).toEqual([
      expect.objectContaining({
        change: "added",
        path: "tests/added.spec.ts",
        measuredTests: expect.objectContaining({
          count: 1,
          basis: "executed-tests.total",
        }),
        provenance: expect.objectContaining({ missionId: "s184-m07" }),
      }),
      expect.objectContaining({
        change: "removed",
        path: "tests/removed.spec.ts",
        measuredTests: expect.objectContaining({
          count: 1,
          basis: "executed-tests.total",
        }),
        provenance: expect.objectContaining({ missionId: "s184-m07" }),
      }),
    ]);
    expect(
      accounting.scopes[0].accounting.suites[0].populationTestDelta,
    ).toEqual(
      expect.objectContaining({
        addedTests: 1,
        removedTests: 1,
        netPopulationTestDelta: 0,
        wholeSuiteTestDelta: 16,
        retainedFileTestDelta: 16,
        equalsWholeSuiteTestDelta: false,
      }),
    );

    // Independent consumer-side re-derivation: do not call the generator's
    // producer-side claim audit when proving the ledger.
    const ledger = artifacts[OUTPUT_PATHS.claimLedger];
    independentlyVerifyArtifacts({
      repositoryRoot: fixture.repositoryRoot,
      reviewHead: fixture.reviewHead,
      artifacts,
    });
    expect(ledger.headline).toEqual(
      expect.objectContaining({ selected: 9, passed: 9, unproven: 0 }),
    );

    const handoff = artifacts[OUTPUT_PATHS.reviewHandoff];
    expect(handoff).toEqual(
      expect.objectContaining({ sprintStatus: "Active" }),
    );
    expect(handoff.builder.builderSelfCertified).toBe(false);
    expect(handoff.approval.separateReviewRequired).toBe(true);
    expect(
      artifacts[OUTPUT_PATHS.maintenanceDisposition].carried.map(
        ({ nextStep }: any) => nextStep,
      ),
    ).toEqual(MAINTENANCE_CARRIES);
    expect(
      artifacts[OUTPUT_PATHS.reviewCarries].carries.map(({ id }: any) => id),
    ).toEqual(["C7", "C8", "C9", "C15"]);

    const requestedReviewHead = process.env.S184_M07_REVIEW_HEAD;
    if (requestedReviewHead) {
      const retainedArtifacts = buildCloseoutArtifacts({
        repositoryRoot: sourceRepositoryRoot,
        reviewHead: requestedReviewHead,
      });
      writeOrCheckArtifacts({
        repositoryRoot: sourceRepositoryRoot,
        artifacts: retainedArtifacts,
        mode: "check",
      });
      independentlyVerifyArtifacts({
        repositoryRoot: sourceRepositoryRoot,
        reviewHead: requestedReviewHead,
        artifacts: retainedArtifacts,
      });
    }
  });

  it("rejects CMOS text drift and any frozen evidence path that is missing", () => {
    const drift = createFixture();
    updateJsonAtHead(drift, INPUT_PATHS.cmosMissionContract, (source) => {
      source.successCriteria[0] = "plausible paraphrase";
    });
    expect(() => build(drift)).toThrow(/criterion text drifted/);

    const missing = createFixture();
    updateJsonAtHead(missing, INPUT_PATHS.manifest, (manifest) => {
      manifest.claimBindings[0].evidencePaths = ["missing.json"];
    });
    expect(() => build(missing)).toThrow(/Frozen evidence path is missing/);
  });

  it("rejects a handoff whose frozen CMOS source does not leave the sprint Active", () => {
    const fixture = createFixture();
    updateJsonAtHead(fixture, fixture.paths.sprintStatus, (source) => {
      source.status = "Completed";
    });
    expect(() => build(fixture)).toThrow(/must leave Sprint 184 Active/);
  });

  it("rejects an execution rolled up under two rows", () => {
    const fixture = createFixture();
    updateJsonAtHead(fixture, INPUT_PATHS.manifest, (manifest) => {
      manifest.executionRows[1].executions[0].executionId =
        "m07-patch-population";
      manifest.claimBindings[3].executionIds = ["m07-patch-population"];
      manifest.claimBindings[4].executionIds = ["m07-patch-population"];
    });
    expect(() => build(fixture)).toThrow(/rolled up under more than one row/);
  });

  it("rejects malformed frozen reconnect evidence despite a passed criterion 7 manifest status", () => {
    const fixture = createFixture();
    updateJsonAtHead(
      fixture,
      fixture.paths.reconnectDisposition,
      (disposition) => {
        disposition.attempts[0].result.messageId = "";
      },
    );
    expect(() => build(fixture)).toThrow(
      /Frozen reconnect disposition is invalid:.*DELIVERED_MESSAGE_ID/,
    );

    const disposition = JSON.parse(
      fs.readFileSync(
        path.join(fixture.repositoryRoot, fixture.paths.reconnectDisposition),
        "utf8",
      ),
    );
    disposition.attempts[0].result.messageId = "message-1";
    writeJson(
      fixture.repositoryRoot,
      fixture.paths.reconnectDisposition,
      disposition,
    );
    updateJsonAtHead(fixture, fixture.paths.reconnectPlan, (plan) => {
      plan.sprint183.derivedCount += 1;
    });
    expect(() => build(fixture)).toThrow(
      /plan binding does not match reviewHead bytes/,
    );
  });

  it("rejects criterion 7 when its execution does not bind the frozen reconnect inputs", () => {
    const fixture = createFixture();
    updateJsonAtHead(fixture, INPUT_PATHS.manifest, (manifest) => {
      manifest.claimBindings[6].executionIds = ["m07-patch-population"];
    });
    expect(() => build(fixture)).toThrow(
      /Criterion 7 execution does not bind both frozen reconnect disposition inputs/,
    );
  });

  it("counts only proven claim rows in the headline", () => {
    const fixture = createFixture();
    updateJsonAtHead(fixture, INPUT_PATHS.manifest, (manifest) => {
      manifest.claimBindings[6].status = "unproven";
    });
    const ledger = build(fixture)[OUTPUT_PATHS.claimLedger];
    expect(ledger.status).toBe("incomplete");
    expect(ledger.headline).toEqual(
      expect.objectContaining({ selected: 9, passed: 8, unproven: 1 }),
    );
    expect(ledger.headline.passed).toBe(
      ledger.claims.filter(({ status }: any) => status === "passed").length,
    );
  });

  it("accepts collection-only populations only when they reconcile to executed historical totals", () => {
    const fixture = createFixture();
    for (const repositoryPath of [
      fixture.paths.baselineReceipt,
      fixture.paths.currentReceipt,
    ]) {
      updateJsonAtHead(fixture, repositoryPath, (receipt) => {
        receipt.status = "collected";
        receipt.vitest.collectionOnly = true;
        for (const row of receipt.vitest.fileResults) {
          row.tests.collectedRunnable = row.tests.total - row.tests.skipped;
          delete row.tests.total;
        }
        receipt.populationValidation = {
          expectedFiles: receipt.vitest.files.total,
          expectedTests: receipt.vitest.tests.total,
          status: "passed",
        };
      });
    }
    expect(build(fixture)[OUTPUT_PATHS.suiteAccounting].status).toBe("passed");

    updateJsonAtHead(fixture, fixture.paths.currentReceipt, (receipt) => {
      receipt.populationValidation.expectedTests += 1;
    });
    expect(() => build(fixture)).toThrow(
      /collection-only population was not reconciled/,
    );

    const unmeasured = createFixture();
    updateJsonAtHead(unmeasured, unmeasured.paths.currentReceipt, (receipt) => {
      delete receipt.vitest.fileResults[0].tests.total;
    });
    expect(() => build(unmeasured)).toThrow(
      /neither executed tests\.total nor collection-only tests\.collectedRunnable/,
    );
  });

  it("attributes historical added and removed rows to Sprint 183 missions", () => {
    const fixture = createFixture(
      "s183-m06: add and remove historical accounting fixtures",
      true,
    );
    const rows =
      build(fixture)[OUTPUT_PATHS.suiteAccounting].scopes[0].accounting
        .suites[0].fileDelta.rows;
    expect(rows).toHaveLength(2);
    expect(
      rows.every(({ provenance }: any) => provenance.missionId === "s183-m06"),
    ).toBe(true);
    expect(
      rows.find(({ change }: any) => change === "removed").provenance,
    ).toEqual(
      expect.objectContaining({
        gitStatus: "suite-membership-removed",
        membershipConfiguration: expect.objectContaining({
          path: "vitest.config.ts",
        }),
      }),
    );
  });

  it("uses frozen commit bytes rather than mutable working-tree bytes", () => {
    const fixture = createFixture();
    const before =
      build(fixture)[OUTPUT_PATHS.claimLedger].claims[0].evidence[0];
    fs.appendFileSync(
      path.join(fixture.repositoryRoot, fixture.paths.patchReport),
      "working-tree-only tamper\n",
    );
    fs.writeFileSync(
      path.join(fixture.repositoryRoot, fixture.paths.reconnectDisposition),
      "not valid JSON\n",
    );
    const after =
      build(fixture)[OUTPUT_PATHS.claimLedger].claims[0].evidence[0];
    expect(after).toEqual(before);
    expect(after.sha256).toBe(
      sha256(
        frozenBytes(
          fixture.repositoryRoot,
          fixture.reviewHead,
          fixture.paths.patchReport,
        ),
      ),
    );
  });
});
