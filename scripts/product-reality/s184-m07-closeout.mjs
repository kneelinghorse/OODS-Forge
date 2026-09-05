#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const defaultRepositoryRoot = path.resolve(scriptDirectory, "../..");

export const SPRINT_ID = "sprint-184";
export const MISSION_ID = "s184-m07";
export const SPRINT_BASE_SHA = "2f94e31384949f3030600d18542be20615332b6e";
export const HISTORICAL_ACCOUNTING_BASE_SHA =
  "179a94f18a5fa557c5461543d851b08b05b81c4a";
export const SPRINT_183_REVIEW_HEAD =
  "9a4202fe3ff8560a791cc92c114ef364739a1c45";

export const MISSION_CRITERIA = Object.freeze([
  "EVERY tracked *.patch under artifacts/ is dispositioned by class, and a spec asserts each Class 1 and Class 2 patch either applies at its DECLARED baseline commit or carries a machine-readable unappliable annotation naming why. Baseline: 12 of 29 fail from the repo root; 5 are unparseable at any commit",
  "The m01b entry states in the artifact itself that the patch does not apply and that the case labelled its replay used a patch Sprint 183 authored (committedAtBaseline:false). Its bytes are unchanged and its sha256 still matches the promotion binding",
  "s183-m06-sc02's replacement claim is asserted true by execution over the FULL tracked population at the review head, not the subset the sprint touched, and the word 'every' is measured rather than written",
  "A test at the OLD detail input asserts the typed gap for each of the three codes (OODS-V007 html, OODS-N015 react/vue, OODS-V162 card/html at release), and a spec asserts the no-context default path returns a typed error rather than silently returning undefined",
  "Each of the 13 repointed call sites in pipeline.compact.spec.ts, action-mappings.e2e.spec.ts, contract-alignment.spec.ts and tier1-acceptance.e2e.spec.ts is either restored to its original input or carries a stated reason in the closeout record",
  "The closeout accounting reconciles: suite deltas attribute every added AND removed file with unattributedDeltas genuinely empty, no execution is rolled up under two rows, and the headline pass count equals proven rows only",
  "All three reconnect notices are sent with message ids recorded, covering Sprint 183's ten movers plus Sprint 184's own, computed by git diff rather than hand-written",
  "A claim ledger where every claim binds an execution, every cited path exists at the frozen head with a matching hash, and each criterion text matches CMOS character for character — verified by re-derivation, not by the generator that produced it",
  "The sprint is left Active with a review handoff recording builderSelfCertified:false. Sprint-COMPLETE is not the builder's to take",
]);

export const MAINTENANCE_CARRIES = Object.freeze([
  "#1315",
  "#1318",
  "#1319",
  "#1320",
  "#1321",
  "#1322",
]);

export const OUTPUT_ROOT = "artifacts/product-reality/sprint-184/m07/closeout";
export const INPUT_ROOT =
  "artifacts/product-reality/sprint-184/m07/closeout-inputs";

export const INPUT_PATHS = Object.freeze({
  manifest: `${INPUT_ROOT}/closeout-input-manifest.json`,
  cmosMissionContract: `${INPUT_ROOT}/cmos-mission-contract-source.json`,
  c15HistoricalDisclosure:
    "artifacts/product-reality/sprint-184/m04/closeout-report.json",
});

export const OUTPUT_PATHS = Object.freeze({
  missionContract: `${OUTPUT_ROOT}/mission-contract.json`,
  suiteAccounting: `${OUTPUT_ROOT}/suite-accounting.json`,
  executionRollup: `${OUTPUT_ROOT}/execution-rollup.json`,
  reviewCarries: `${OUTPUT_ROOT}/review-carries.json`,
  maintenanceDisposition: `${OUTPUT_ROOT}/maintenance-disposition.json`,
  claimLedger: `${OUTPUT_ROOT}/claim-ledger.json`,
  claimAudit: `${OUTPUT_ROOT}/claim-audit.json`,
  reviewHandoff: `${OUTPUT_ROOT}/review-handoff.json`,
  closeoutReport: `${OUTPUT_ROOT}/closeout-report.json`,
  evidenceIndex: `${OUTPUT_ROOT}/evidence-index.json`,
});

export function canonicalJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function sha256(bytes) {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

function compareCodePoint(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function git(repositoryRoot, args, options = {}) {
  const result = spawnSync("git", args, {
    cwd: repositoryRoot,
    encoding: options.encoding ?? "utf8",
    maxBuffer: 128 * 1024 * 1024,
  });
  if (result.status !== 0) {
    const stderr = Buffer.isBuffer(result.stderr)
      ? result.stderr.toString("utf8")
      : result.stderr;
    throw new Error(
      `git ${args.join(" ")} failed (${result.status ?? 127}): ${stderr.trim()}`,
    );
  }
  return result.stdout;
}

function resolveCommit(repositoryRoot, revision) {
  return git(repositoryRoot, ["rev-parse", `${revision}^{commit}`]).trim();
}

function gitFileBytes(repositoryRoot, revision, repositoryPath) {
  const result = spawnSync("git", ["show", `${revision}:${repositoryPath}`], {
    cwd: repositoryRoot,
    encoding: null,
    maxBuffer: 128 * 1024 * 1024,
  });
  if (result.status !== 0 || !Buffer.isBuffer(result.stdout)) {
    throw new Error(
      `Frozen evidence path is missing at ${revision}: ${repositoryPath}`,
    );
  }
  return result.stdout;
}

export function frozenReference(repositoryRoot, revision, repositoryPath) {
  const bytes = gitFileBytes(repositoryRoot, revision, repositoryPath);
  return {
    path: repositoryPath,
    bytes: bytes.byteLength,
    sha256: sha256(bytes),
  };
}

function readJsonAt(repositoryRoot, revision, repositoryPath) {
  const contents = gitFileBytes(repositoryRoot, revision, repositoryPath);
  try {
    return JSON.parse(contents.toString("utf8"));
  } catch (error) {
    throw new Error(
      `Frozen JSON is invalid at ${revision}:${repositoryPath}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

function extractMissionCriteria(source) {
  if (
    source?.missionId === MISSION_ID &&
    Array.isArray(source.successCriteria)
  ) {
    return source.successCriteria;
  }
  if (source?.mission?.id === MISSION_ID) {
    return source.mission.successCriteria;
  }
  const mission = source?.missions?.find?.(({ id, missionId }) =>
    [id, missionId].includes(MISSION_ID),
  );
  return mission?.successCriteria;
}

function receiptFileResults(receipt, label) {
  assert(
    ["passed", "collected"].includes(receipt?.status),
    `${label} is neither a passed execution nor a validated collection receipt.`,
  );
  if (receipt.status === "passed") {
    assert(
      receipt?.vitest?.success === true,
      `${label} has no successful Vitest result.`,
    );
  } else {
    assert(
      receipt?.vitest?.collectionOnly === true &&
        receipt?.populationValidation?.status === "passed" &&
        receipt.populationValidation.expectedFiles ===
          receipt.vitest.files?.total &&
        receipt.populationValidation.expectedTests ===
          receipt.vitest.tests?.total,
      `${label} collection-only population was not reconciled to its historical executed counts.`,
    );
  }
  assert(
    Array.isArray(receipt.vitest.fileResults),
    `${label} has no Vitest fileResults population.`,
  );
  const paths = receipt.vitest.fileResults.map((row) => row.path);
  assert(
    paths.every((repositoryPath) => typeof repositoryPath === "string"),
    `${label} contains a non-string test path.`,
  );
  assert(
    new Set(paths).size === paths.length,
    `${label} contains duplicate test-file rows.`,
  );
  assert(
    receipt.vitest.files?.total === paths.length,
    `${label} file total does not equal its measured population.`,
  );
  return paths;
}

function measuredFileTests(fileResult, label) {
  const executedTotal = fileResult?.tests?.total;
  const skipped = fileResult?.tests?.skipped;
  if (Number.isInteger(executedTotal) && executedTotal >= 0) {
    assert(
      skipped === undefined ||
        skipped === null ||
        (Number.isInteger(skipped) && skipped >= 0 && skipped <= executedTotal),
      `${label} has an invalid skipped-test count.`,
    );
    return {
      count: executedTotal,
      basis: "executed-tests.total",
      skipped: skipped ?? null,
      skippedIncluded: true,
    };
  }
  const collectedRunnable = fileResult?.tests?.collectedRunnable;
  assert(
    Number.isInteger(collectedRunnable) && collectedRunnable >= 0,
    `${label} has neither executed tests.total nor collection-only tests.collectedRunnable.`,
  );
  assert(
    skipped === undefined ||
      skipped === null ||
      (Number.isInteger(skipped) && skipped >= 0),
    `${label} has an invalid collection-only skipped-test count.`,
  );
  return {
    count: collectedRunnable + (skipped ?? 0),
    basis:
      skipped === undefined || skipped === null
        ? "collection-tests.collectedRunnable"
        : "collection-tests.collectedRunnable-plus-skipped",
    collectedRunnable,
    skipped: skipped ?? null,
    skippedIncluded: Number.isInteger(skipped),
  };
}

function commitMissionMarker(repositoryRoot, commit) {
  const subject = git(repositoryRoot, [
    "show",
    "-s",
    "--format=%s",
    commit,
  ]).trim();
  const subjectMatch = subject.match(/\bs(183|184)[- ]m(0[1-9])\b/i);
  if (subjectMatch) return `s${subjectMatch[1]}-m${subjectMatch[2]}`;

  const paths = git(repositoryRoot, [
    "diff-tree",
    "--no-commit-id",
    "--name-only",
    "-r",
    commit,
  ])
    .split(/\r?\n/)
    .filter(Boolean);
  const pathMarkers = [
    ...new Set(
      paths
        .map((repositoryPath) =>
          repositoryPath.match(
            /^artifacts\/product-reality\/sprint-(183|184)\/m(0[1-9])\//,
          ),
        )
        .filter(Boolean)
        .map((match) => `s${match[1]}-m${match[2]}`),
    ),
  ];
  return pathMarkers.length === 1 ? pathMarkers[0] : null;
}

function inferMissionOwner(repositoryRoot, baselineHead, commit, reviewHead) {
  const direct = commitMissionMarker(repositoryRoot, commit);
  if (direct) return { missionId: direct, method: "commit-marker" };

  const descendants = git(repositoryRoot, [
    "rev-list",
    "--ancestry-path",
    "--reverse",
    `${commit}..${reviewHead}`,
  ])
    .split(/\r?\n/)
    .filter(Boolean);
  for (const descendant of descendants) {
    const missionId = commitMissionMarker(repositoryRoot, descendant);
    if (missionId) {
      return {
        missionId,
        method: "nearest-subsequent-mission-marker",
        markerCommit: descendant,
      };
    }
  }
  const ancestors = git(repositoryRoot, [
    "rev-list",
    "--ancestry-path",
    `${baselineHead}..${commit}`,
  ])
    .split(/\r?\n/)
    .filter(Boolean);
  for (const ancestor of ancestors) {
    const missionId = commitMissionMarker(repositoryRoot, ancestor);
    if (missionId) {
      return {
        missionId,
        method: "nearest-preceding-mission-marker",
        markerCommit: ancestor,
      };
    }
  }
  return null;
}

function parseNameStatus(output) {
  return output
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const [status, firstPath, secondPath] = line.split("\t");
      return {
        status,
        oldPath: secondPath ? firstPath : null,
        path: secondPath ?? firstPath,
      };
    });
}

function fileDeltaProvenance({
  repositoryRoot,
  baselineHead,
  reviewHead,
  repositoryPath,
  change,
  membershipChangeEvidencePaths = [],
}) {
  const diffRows = parseNameStatus(
    git(repositoryRoot, [
      "diff",
      "--name-status",
      "-M",
      baselineHead,
      reviewHead,
      "--",
      repositoryPath,
    ]),
  );
  const matching = diffRows.find(
    (row) => row.path === repositoryPath || row.oldPath === repositoryPath,
  );
  const identityChanged =
    matching &&
    (change === "added"
      ? /^[ACR]/.test(matching.status)
      : /^[DR]/.test(matching.status));
  if (!identityChanged) {
    for (const configurationPath of membershipChangeEvidencePaths) {
      const baselineConfiguration = gitFileBytes(
        repositoryRoot,
        baselineHead,
        configurationPath,
      ).toString("utf8");
      const currentConfiguration = gitFileBytes(
        repositoryRoot,
        reviewHead,
        configurationPath,
      ).toString("utf8");
      const baselineNamesPath = baselineConfiguration.includes(repositoryPath);
      const currentNamesPath = currentConfiguration.includes(repositoryPath);
      const provesMembershipChange =
        (change === "removed" && !baselineNamesPath && currentNamesPath) ||
        (change === "added" && baselineNamesPath && !currentNamesPath);
      if (!provesMembershipChange) continue;
      const commits = git(repositoryRoot, [
        "log",
        "--format=%H",
        `-S${repositoryPath}`,
        `${baselineHead}..${reviewHead}`,
        "--",
        configurationPath,
      ])
        .split(/\r?\n/)
        .filter(Boolean);
      const commit = commits[0] ?? null;
      if (!commit) continue;
      const owner = inferMissionOwner(
        repositoryRoot,
        baselineHead,
        commit,
        reviewHead,
      );
      if (!owner) continue;
      const configurationBytes = gitFileBytes(
        repositoryRoot,
        reviewHead,
        configurationPath,
      );
      return {
        gitStatus:
          change === "removed"
            ? "suite-membership-removed"
            : "suite-membership-added",
        commit,
        commitSubject: git(repositoryRoot, [
          "show",
          "-s",
          "--format=%s",
          commit,
        ]).trim(),
        membershipConfiguration: {
          path: configurationPath,
          revision: reviewHead,
          bytes: configurationBytes.byteLength,
          sha256: sha256(configurationBytes),
          literalPathTransition: {
            baseline: baselineNamesPath,
            current: currentNamesPath,
          },
        },
        ...owner,
      };
    }
    return null;
  }

  const filter = change === "added" ? "ACR" : "DR";
  const logPath =
    change === "added" ? matching.path : (matching.oldPath ?? matching.path);
  const commits = git(repositoryRoot, [
    "log",
    "--format=%H",
    `--diff-filter=${filter}`,
    `${baselineHead}..${reviewHead}`,
    "--",
    logPath,
  ])
    .split(/\r?\n/)
    .filter(Boolean);
  const commit = commits[0] ?? null;
  if (!commit) return null;
  const owner = inferMissionOwner(
    repositoryRoot,
    baselineHead,
    commit,
    reviewHead,
  );
  if (!owner) return null;
  return {
    gitStatus: matching.status,
    commit,
    commitSubject: git(repositoryRoot, [
      "show",
      "-s",
      "--format=%s",
      commit,
    ]).trim(),
    ...owner,
  };
}

export function buildSuiteAccounting({
  repositoryRoot,
  reviewHead,
  sprintBaseSha = SPRINT_BASE_SHA,
  baselineReceiptPaths,
  currentReceiptPaths,
  membershipChangeEvidencePaths = {},
}) {
  assert(
    baselineReceiptPaths && currentReceiptPaths,
    "Suite accounting requires baseline and current receipt maps.",
  );
  const suiteIds = Object.keys(baselineReceiptPaths).sort(compareCodePoint);
  assert(
    JSON.stringify(suiteIds) ===
      JSON.stringify(Object.keys(currentReceiptPaths).sort(compareCodePoint)),
    "Baseline and current suite receipt sets differ.",
  );
  const suites = [];
  const unattributedDeltas = [];
  const measuredBaselineHeads = new Set();
  for (const suite of suiteIds) {
    const baseline = readJsonAt(
      repositoryRoot,
      reviewHead,
      baselineReceiptPaths[suite],
    );
    const current = readJsonAt(
      repositoryRoot,
      reviewHead,
      currentReceiptPaths[suite],
    );
    const baselineHead = resolveCommit(repositoryRoot, baseline.measuredHead);
    const currentMeasuredHead = resolveCommit(
      repositoryRoot,
      current.measuredHead,
    );
    const currentAncestry = spawnSync(
      "git",
      ["merge-base", "--is-ancestor", currentMeasuredHead, reviewHead],
      { cwd: repositoryRoot },
    );
    assert(
      currentAncestry.status === 0,
      `${suite} current receipt was not measured at reviewHead or an ancestor.`,
    );
    measuredBaselineHeads.add(baselineHead);
    const baselineFiles = receiptFileResults(baseline, `${suite} baseline`);
    const currentFiles = receiptFileResults(current, `${suite} current`);
    const baselineFileResults = new Map(
      baseline.vitest.fileResults.map((row) => [row.path, row]),
    );
    const currentFileResults = new Map(
      current.vitest.fileResults.map((row) => [row.path, row]),
    );
    const baselineSet = new Set(baselineFiles);
    const currentSet = new Set(currentFiles);
    const addedFiles = currentFiles
      .filter((repositoryPath) => !baselineSet.has(repositoryPath))
      .sort(compareCodePoint);
    const removedFiles = baselineFiles
      .filter((repositoryPath) => !currentSet.has(repositoryPath))
      .sort(compareCodePoint);
    const deltas = [
      ...addedFiles.map((repositoryPath) => ({
        change: "added",
        path: repositoryPath,
      })),
      ...removedFiles.map((repositoryPath) => ({
        change: "removed",
        path: repositoryPath,
      })),
    ].map((delta) => {
      const sourceFileResult =
        delta.change === "added"
          ? currentFileResults.get(delta.path)
          : baselineFileResults.get(delta.path);
      const measuredTests = measuredFileTests(
        sourceFileResult,
        `${suite} ${delta.change} ${delta.path}`,
      );
      const provenance = fileDeltaProvenance({
        repositoryRoot,
        baselineHead,
        reviewHead: currentMeasuredHead,
        repositoryPath: delta.path,
        change: delta.change,
        membershipChangeEvidencePaths:
          membershipChangeEvidencePaths[suite] ?? [],
      });
      if (!provenance) unattributedDeltas.push({ suite, ...delta });
      return { ...delta, measuredTests, provenance };
    });
    assert(
      current.vitest.files.total - baseline.vitest.files.total ===
        addedFiles.length - removedFiles.length,
      `${suite} file-count arithmetic does not reconcile with added and removed populations.`,
    );
    const addedTests = deltas
      .filter(({ change }) => change === "added")
      .reduce((total, row) => total + row.measuredTests.count, 0);
    const removedTests = deltas
      .filter(({ change }) => change === "removed")
      .reduce((total, row) => total + row.measuredTests.count, 0);
    const netPopulationTestDelta = addedTests - removedTests;
    const wholeSuiteTestDelta =
      (current.vitest.tests.total ?? 0) - (baseline.vitest.tests.total ?? 0);
    suites.push({
      suite,
      baseline: {
        measuredHead: baselineHead,
        receipt: frozenReference(
          repositoryRoot,
          reviewHead,
          baselineReceiptPaths[suite],
        ),
        files: baseline.vitest.files,
        tests: baseline.vitest.tests,
      },
      current: {
        measuredHead: currentMeasuredHead,
        receipt: frozenReference(
          repositoryRoot,
          reviewHead,
          currentReceiptPaths[suite],
        ),
        files: current.vitest.files,
        tests: current.vitest.tests,
      },
      fileDelta: {
        total: current.vitest.files.total - baseline.vitest.files.total,
        added: addedFiles.length,
        removed: removedFiles.length,
        rows: deltas,
      },
      populationTestDelta: {
        addedTests,
        removedTests,
        netPopulationTestDelta,
        wholeSuiteTestDelta,
        retainedFileTestDelta: wholeSuiteTestDelta - netPopulationTestDelta,
        equalsWholeSuiteTestDelta:
          netPopulationTestDelta === wholeSuiteTestDelta,
        distinction:
          "The whole-suite delta may also include test-count changes inside retained files; equality is reported only when measured true.",
      },
      testDelta: Object.fromEntries(
        ["total", "passed", "failed", "skipped", "todo"].map((key) => [
          key,
          (current.vitest.tests[key] ?? 0) - (baseline.vitest.tests[key] ?? 0),
        ]),
      ),
    });
  }
  assert(
    unattributedDeltas.length === 0,
    `Suite accounting retains ${unattributedDeltas.length} unattributed delta(s).`,
  );
  assert(
    measuredBaselineHeads.size === 1 &&
      measuredBaselineHeads.has(resolveCommit(repositoryRoot, sprintBaseSha)),
    "Suite receipts do not share the declared Sprint 184 accounting baseline.",
  );
  return {
    schemaVersion: "1.0.0",
    kind: "s184-m07-suite-accounting",
    sprintId: SPRINT_ID,
    missionId: MISSION_ID,
    baselineHead: resolveCommit(repositoryRoot, sprintBaseSha),
    reviewHead,
    attributionMethod:
      "Set-difference each frozen Vitest fileResults population, intersect every added or removed path with git diff --name-status, then bind the introducing/removing commit to its sprint mission marker.",
    suites,
    totals: {
      addedFiles: suites.reduce((total, row) => total + row.fileDelta.added, 0),
      removedFiles: suites.reduce(
        (total, row) => total + row.fileDelta.removed,
        0,
      ),
    },
    unattributedDeltas,
    status: "passed",
  };
}

function validateExecutionRows(manifest, reviewHead, repositoryRoot) {
  assert(
    Array.isArray(manifest.executionRows) && manifest.executionRows.length > 0,
    "Closeout input manifest has no execution rows.",
  );
  const executionIds = [];
  const rows = manifest.executionRows.map((row) => {
    assert(
      typeof row.rowId === "string" && row.rowId.length > 0,
      "Execution rollup row lacks rowId.",
    );
    assert(
      Array.isArray(row.executions) && row.executions.length > 0,
      `Execution rollup row ${row.rowId} is empty.`,
    );
    return {
      rowId: row.rowId,
      executions: row.executions.map((execution) => {
        assert(
          typeof execution.executionId === "string" &&
            execution.executionId.length > 0,
          `Execution in ${row.rowId} lacks executionId.`,
        );
        assert(
          execution.status === "passed",
          `${execution.executionId} is not passed.`,
        );
        assert(
          Array.isArray(execution.evidencePaths) &&
            execution.evidencePaths.length > 0,
          `${execution.executionId} has no frozen evidence.`,
        );
        executionIds.push(execution.executionId);
        return {
          executionId: execution.executionId,
          kind: execution.kind,
          status: execution.status,
          evidence: execution.evidencePaths.map((repositoryPath) =>
            frozenReference(repositoryRoot, reviewHead, repositoryPath),
          ),
        };
      }),
    };
  });
  const duplicateExecutionIds = executionIds.filter(
    (executionId, index) => executionIds.indexOf(executionId) !== index,
  );
  assert(
    duplicateExecutionIds.length === 0,
    `Execution(s) rolled up under more than one row: ${[...new Set(duplicateExecutionIds)].join(", ")}`,
  );
  return {
    rows,
    executionIds,
    duplicateExecutionIds,
  };
}

function buildClaims({
  manifest,
  cmosCriteria,
  executionIds,
  repositoryRoot,
  reviewHead,
}) {
  assert(
    Array.isArray(manifest.claimBindings),
    "Closeout input manifest has no claim bindings.",
  );
  assert(
    manifest.claimBindings.length === cmosCriteria.length,
    "Claim binding count differs from the CMOS criterion count.",
  );
  return cmosCriteria.map((criterion, criterionOffset) => {
    const criterionIndex = criterionOffset + 1;
    const binding = manifest.claimBindings.find(
      (row) => row.criterionIndex === criterionIndex,
    );
    assert(binding, `Criterion ${criterionIndex} has no claim binding.`);
    assert(
      ["passed", "unproven"].includes(binding.status),
      `Criterion ${criterionIndex} has invalid status.`,
    );
    assert(
      Array.isArray(binding.executionIds) && binding.executionIds.length > 0,
      `Criterion ${criterionIndex} has no execution binding.`,
    );
    assert(
      binding.executionIds.every((executionId) =>
        executionIds.includes(executionId),
      ),
      `Criterion ${criterionIndex} cites an unknown execution.`,
    );
    assert(
      Array.isArray(binding.evidencePaths) && binding.evidencePaths.length > 0,
      `Criterion ${criterionIndex} has no evidence paths.`,
    );
    return {
      claimId: `${MISSION_ID}-sc${String(criterionIndex).padStart(2, "0")}`,
      missionId: MISSION_ID,
      criterionIndex,
      criterion,
      status: binding.status,
      executionIds: [...binding.executionIds],
      evidence: binding.evidencePaths.map((repositoryPath) =>
        frozenReference(repositoryRoot, reviewHead, repositoryPath),
      ),
    };
  });
}

function virtualReference(repositoryPath, artifacts) {
  const bytes = Buffer.from(canonicalJson(artifacts[repositoryPath]), "utf8");
  return {
    path: repositoryPath,
    bytes: bytes.byteLength,
    sha256: sha256(bytes),
  };
}

export function buildCloseoutArtifacts({
  repositoryRoot = defaultRepositoryRoot,
  reviewHead,
  sprintBaseSha = SPRINT_BASE_SHA,
  requireCanonicalScopePlan = true,
  manifestPath = INPUT_PATHS.manifest,
  cmosMissionContractPath = INPUT_PATHS.cmosMissionContract,
}) {
  const frozenHead = resolveCommit(repositoryRoot, reviewHead);
  assert(
    frozenHead === reviewHead,
    "reviewHead must be a full, resolved commit SHA.",
  );
  assert(
    frozenHead !== resolveCommit(repositoryRoot, sprintBaseSha),
    "reviewHead must be newer than the Sprint 184 suite baseline.",
  );
  const ancestry = spawnSync(
    "git",
    ["merge-base", "--is-ancestor", sprintBaseSha, frozenHead],
    { cwd: repositoryRoot },
  );
  assert(
    ancestry.status === 0,
    "Sprint 184 suite baseline is not an ancestor of reviewHead.",
  );

  const manifest = readJsonAt(repositoryRoot, frozenHead, manifestPath);
  const cmosSource = readJsonAt(
    repositoryRoot,
    frozenHead,
    cmosMissionContractPath,
  );
  const cmosCriteria = extractMissionCriteria(cmosSource);
  assert(
    JSON.stringify(cmosCriteria) === JSON.stringify(MISSION_CRITERIA),
    "M07 criterion text drifted from the exact CMOS contract.",
  );
  assert(
    typeof manifest.sprintStatusSourcePath === "string" &&
      manifest.sprintStatusSourcePath.length > 0,
    "Closeout input manifest has no frozen sprint status source.",
  );
  const sprintStatusSource = readJsonAt(
    repositoryRoot,
    frozenHead,
    manifest.sprintStatusSourcePath,
  );
  assert(
    sprintStatusSource.sprintId === SPRINT_ID &&
      sprintStatusSource.status === "Active",
    "Frozen CMOS sprint status source must leave Sprint 184 Active.",
  );

  const accountingScopes = Array.isArray(manifest.suiteAccountingScopes)
    ? manifest.suiteAccountingScopes
    : [
        {
          scopeId: "sprint-184",
          purpose: "Sprint 184 baseline to frozen review head",
          baselineHead: sprintBaseSha,
          baselineReceiptPaths: manifest.suiteReceipts?.baseline,
          currentReceiptPaths: manifest.suiteReceipts?.current,
          membershipChangeEvidencePaths: {},
        },
      ];
  assert(
    accountingScopes.length > 0,
    "Closeout input manifest has no suite accounting scopes.",
  );
  if (requireCanonicalScopePlan) {
    const scopeIds = accountingScopes.map(({ scopeId }) => scopeId);
    assert(
      JSON.stringify(scopeIds) ===
        JSON.stringify(["sprint-183-c7", "sprint-184"]),
      "Closeout requires separate sprint-183-c7 and sprint-184 accounting scopes in that order.",
    );
    const historicalScope = accountingScopes[0];
    const sprintScope = accountingScopes[1];
    assert(
      resolveCommit(repositoryRoot, historicalScope.baselineHead) ===
        HISTORICAL_ACCOUNTING_BASE_SHA &&
        JSON.stringify(Object.keys(historicalScope.baselineReceiptPaths)) ===
          JSON.stringify(["root-core"]) &&
        JSON.stringify(Object.keys(historicalScope.currentReceiptPaths)) ===
          JSON.stringify(["root-core"]),
      "sprint-183-c7 must compare root-core only from the exact 179a94f baseline.",
    );
    assert(
      resolveCommit(repositoryRoot, sprintScope.baselineHead) ===
        SPRINT_BASE_SHA &&
        JSON.stringify(Object.keys(sprintScope.baselineReceiptPaths).sort()) ===
          JSON.stringify([
            "mcp-server",
            "root-core",
            "viz-core",
            "viz-render",
          ]) &&
        JSON.stringify(Object.keys(sprintScope.currentReceiptPaths).sort()) ===
          JSON.stringify(["mcp-server", "root-core", "viz-core", "viz-render"]),
      "sprint-184 must compare all four suites from the exact 2f94e313 baseline.",
    );
  }
  const suiteAccountingRows = accountingScopes.map((scope) => ({
    scopeId: scope.scopeId,
    purpose: scope.purpose,
    accounting: buildSuiteAccounting({
      repositoryRoot,
      reviewHead: frozenHead,
      sprintBaseSha: scope.baselineHead,
      baselineReceiptPaths: scope.baselineReceiptPaths,
      currentReceiptPaths: scope.currentReceiptPaths,
      membershipChangeEvidencePaths: scope.membershipChangeEvidencePaths ?? {},
    }),
  }));
  const suiteAccounting = {
    schemaVersion: "1.0.0",
    kind: "s184-m07-multi-baseline-suite-accounting",
    sprintId: SPRINT_ID,
    missionId: MISSION_ID,
    reviewHead: frozenHead,
    scopes: suiteAccountingRows,
    unattributedDeltas: suiteAccountingRows.flatMap(({ scopeId, accounting }) =>
      accounting.unattributedDeltas.map((delta) => ({
        scopeId,
        ...delta,
      })),
    ),
    status: suiteAccountingRows.every(
      ({ accounting }) => accounting.status === "passed",
    )
      ? "passed"
      : "failed",
  };
  if (requireCanonicalScopePlan) {
    const historicalCurrentHeads = new Set(
      suiteAccounting.scopes[0].accounting.suites.map(
        ({ current }) => current.measuredHead,
      ),
    );
    assert(
      historicalCurrentHeads.size === 1 &&
        historicalCurrentHeads.has(SPRINT_183_REVIEW_HEAD),
      "sprint-183-c7 must end at the exact 9a4202fe review head.",
    );
  }
  let c15Evidence = null;
  if (requireCanonicalScopePlan) {
    const historicalDisclosure = readJsonAt(
      repositoryRoot,
      frozenHead,
      INPUT_PATHS.c15HistoricalDisclosure,
    );
    const disclosedSuite =
      historicalDisclosure.verification?.fullMcpServerSuite;
    assert(
      disclosedSuite?.testsSkipped === 16 &&
        disclosedSuite.skipDisposition?.includes(
          "7 Stage1 rollup tests and 9 Stage1 action-mapping tests",
        ) &&
        disclosedSuite.skipDisposition.includes("absent on this machine"),
      "C15 historical structured skip disclosure drifted.",
    );
    const sprintScope = accountingScopes[1];
    const currentMcpReceipt = readJsonAt(
      repositoryRoot,
      frozenHead,
      sprintScope.currentReceiptPaths["mcp-server"],
    );
    const skippedRows = currentMcpReceipt.vitest.fileResults
      .filter(({ tests }) => tests.skipped > 0)
      .map(({ path: repositoryPath, tests }) => ({
        path: repositoryPath,
        skipped: tests.skipped,
      }))
      .sort((left, right) => compareCodePoint(left.path, right.path));
    assert(
      currentMcpReceipt.vitest.tests.skipped === 16 &&
        JSON.stringify(skippedRows) ===
          JSON.stringify([
            {
              path: "packages/mcp-server/test/e2e/action-mappings.e2e.spec.ts",
              skipped: 9,
            },
            {
              path: "packages/mcp-server/test/e2e/stage1-rollups.e2e.spec.ts",
              skipped: 7,
            },
          ]),
      "C15 frozen current receipt does not retain the exact 9+7 Stage1 skip population.",
    );
    c15Evidence = {
      currentSuiteReceipt: frozenReference(
        repositoryRoot,
        frozenHead,
        sprintScope.currentReceiptPaths["mcp-server"],
      ),
      historicalDisclosure: frozenReference(
        repositoryRoot,
        frozenHead,
        INPUT_PATHS.c15HistoricalDisclosure,
      ),
      skippedRows,
    };
  }
  const validatedExecutions = validateExecutionRows(
    manifest,
    frozenHead,
    repositoryRoot,
  );
  const claims = buildClaims({
    manifest,
    cmosCriteria,
    executionIds: validatedExecutions.executionIds,
    repositoryRoot,
    reviewHead: frozenHead,
  });
  const provenClaims = claims.filter(({ status }) => status === "passed");

  const missionContract = {
    schemaVersion: "1.0.0",
    kind: "cmos-mission-contract-snapshot",
    sprintId: SPRINT_ID,
    missionId: MISSION_ID,
    source: {
      tool: "cmos_mission",
      action: "show",
      evidence: frozenReference(
        repositoryRoot,
        frozenHead,
        cmosMissionContractPath,
      ),
    },
    successCriteria: cmosCriteria,
  };
  const executionRollup = {
    schemaVersion: "1.0.0",
    kind: "s184-m07-execution-rollup",
    sprintId: SPRINT_ID,
    missionId: MISSION_ID,
    reviewHead: frozenHead,
    policy: "Each executionId belongs to exactly one rollup row.",
    rows: validatedExecutions.rows,
    executionCount: validatedExecutions.executionIds.length,
    duplicateExecutionIds: validatedExecutions.duplicateExecutionIds,
    status: "passed",
  };
  const reviewCarries = {
    schemaVersion: "1.0.0",
    kind: "sprint-183-review-carry-disposition",
    sprintId: SPRINT_ID,
    missionId: MISSION_ID,
    reviewHead: frozenHead,
    carries: [
      {
        id: "C7",
        status: "remediated",
        concern:
          "Four files left root-core carrying 106 tests while the Sprint 183 artifact reported +66 with unattributedDeltas:[]; a Vitest exclude is invisible to the skip counter.",
        disposition:
          "Re-derived from frozen baseline/current fileResults populations; both added and removed files are enumerated and attributed. Execution, not either prior prose count, decides the population.",
        sourceConflict: {
          cmosM07: "four files left root-core carrying 106 tests",
          independentReview:
            "five files added carrying 114 tests and one 50-test file newly excluded",
          authority:
            "Neither count is accepted as an input assertion; the historical accounting scope computes exact set differences from the 179a94f and frozen-current receipts.",
        },
        suiteAccounting: OUTPUT_PATHS.suiteAccounting,
      },
      {
        id: "C8",
        status: "disclosed-historical-evidence-not-reused",
        concern:
          "Sprint 183 L-04 was measured at 8ce34907 in a dirty tree against an untracked database.",
        disposition:
          "That row remains historical disclosure and is not cited as Sprint 184 frozen-head proof.",
      },
      {
        id: "C9",
        status: "remediated",
        concern:
          "The parked soak failure was rolled up twice, as CI-14 parked-disclosed and L-07 pass, inflating the headline by one.",
        disposition:
          "Every executionId appears in one rollup row, and the headline is counted from passed claim rows only.",
        executionRollup: OUTPUT_PATHS.executionRollup,
      },
      {
        id: "C15",
        status: "carried-structured-disclosure",
        concern:
          "Sixteen skipped tests gate on an adjacent Stage1 checkout that is absent machine-wide.",
        disposition:
          "The skip cause remains named; relocating the build would not make the absent Stage1 checkout present and would not un-skip these tests.",
        skippedTests: 16,
        evidence: c15Evidence,
        relocationInference:
          "The cited disclosure establishes machine-wide absence; changing the build directory cannot manufacture either missing Stage1 artifact set.",
      },
    ],
  };
  const maintenanceDisposition = {
    schemaVersion: "1.0.0",
    kind: "s184-maintenance-carry-disposition",
    sprintId: SPRINT_ID,
    missionId: MISSION_ID,
    absorbed: [],
    carried: MAINTENANCE_CARRIES.map((nextStep) => ({
      nextStep,
      status: "carried-unchanged-unabsorbed",
      ...(nextStep === "#1315"
        ? {
            scope:
              "Gate-1 bundle rebuild and four exact-SHA re-vendor follow-ups remain explicitly open.",
          }
        : {}),
    })),
  };
  const reviewHandoff = {
    schemaVersion: "1.0.0",
    kind: "independent-review-handoff",
    sprintId: SPRINT_ID,
    missionId: MISSION_ID,
    reviewHead: frozenHead,
    sprintStatus: "Active",
    sprintStatusSource: frozenReference(
      repositoryRoot,
      frozenHead,
      manifest.sprintStatusSourcePath,
    ),
    builder: {
      role: "builder",
      builderSelfCertified: false,
    },
    approval: {
      status: "not-requested-in-build-session",
      separateReviewRequired: true,
      requiredReviewerIndependence:
        "Sprint-COMPLETE is reserved for a separate review session and reviewer.",
    },
  };
  const claimLedger = {
    schemaVersion: "1.0.0",
    kind: "s184-m07-claim-ledger",
    sprintId: SPRINT_ID,
    missionId: MISSION_ID,
    reviewHead: frozenHead,
    criterionSource: missionContract.source.evidence,
    executionPolicy:
      "Every claim binds at least one execution from the single-row execution rollup and one or more repository paths content-addressed at reviewHead.",
    executions: validatedExecutions.rows.flatMap(({ rowId, executions }) =>
      executions.map((execution) => ({ ...execution, rollupRowId: rowId })),
    ),
    claims,
    headline: {
      selected: claims.length,
      passed: provenClaims.length,
      unproven: claims.length - provenClaims.length,
      countingMethod:
        "passed = claims.filter(status === 'passed').length; execution and test counts are never added to this number",
    },
    status: provenClaims.length === claims.length ? "passed" : "incomplete",
  };
  const artifacts = {
    [OUTPUT_PATHS.missionContract]: missionContract,
    [OUTPUT_PATHS.suiteAccounting]: suiteAccounting,
    [OUTPUT_PATHS.executionRollup]: executionRollup,
    [OUTPUT_PATHS.reviewCarries]: reviewCarries,
    [OUTPUT_PATHS.maintenanceDisposition]: maintenanceDisposition,
    [OUTPUT_PATHS.claimLedger]: claimLedger,
    [OUTPUT_PATHS.reviewHandoff]: reviewHandoff,
  };
  const claimAudit = {
    schemaVersion: "1.0.0",
    kind: "s184-m07-claim-audit-generator-check",
    sprintId: SPRINT_ID,
    missionId: MISSION_ID,
    reviewHead: frozenHead,
    generatorBoundary:
      "This is a producer-side consistency check only. The retained closeout spec independently re-derives every criterion, execution binding, frozen path, and hash.",
    selected: claims.length,
    passed: provenClaims.length,
    failed: 0,
    unproven: claims.length - provenClaims.length,
    checks: {
      exactCmosCriterionText: true,
      everyClaimHasExecution: true,
      everyClaimHasFrozenEvidence: true,
      duplicateExecutionIds: [],
      unattributedDeltas: [],
      headlineEqualsProvenRows:
        claimLedger.headline.passed === provenClaims.length,
    },
    status: claimLedger.status,
  };
  artifacts[OUTPUT_PATHS.claimAudit] = claimAudit;
  const closeoutReport = {
    schemaVersion: "1.0.0",
    kind: "s184-m07-builder-closeout-report",
    sprintId: SPRINT_ID,
    missionId: MISSION_ID,
    reviewHead: frozenHead,
    headline: claimLedger.headline,
    criterionStatus: claims.map(({ claimId, criterionIndex, status }) => ({
      claimId,
      criterionIndex,
      status,
    })),
    suiteAccounting: virtualReference(OUTPUT_PATHS.suiteAccounting, artifacts),
    executionRollup: virtualReference(OUTPUT_PATHS.executionRollup, artifacts),
    reviewCarries: virtualReference(OUTPUT_PATHS.reviewCarries, artifacts),
    maintenanceDisposition: virtualReference(
      OUTPUT_PATHS.maintenanceDisposition,
      artifacts,
    ),
    claimLedger: virtualReference(OUTPUT_PATHS.claimLedger, artifacts),
    reviewHandoff: virtualReference(OUTPUT_PATHS.reviewHandoff, artifacts),
    scope:
      "Builder evidence for independent review; Sprint 184 remains Active and is not self-certified.",
    status: claimLedger.status,
  };
  artifacts[OUTPUT_PATHS.closeoutReport] = closeoutReport;
  const suiteReceiptPaths = accountingScopes.flatMap((scope) => [
    ...Object.values(scope.baselineReceiptPaths),
    ...Object.values(scope.currentReceiptPaths),
    ...Object.values(scope.membershipChangeEvidencePaths ?? {}).flat(),
  ]);
  const indexedPaths = [
    manifestPath,
    cmosMissionContractPath,
    manifest.sprintStatusSourcePath,
    ...(requireCanonicalScopePlan ? [INPUT_PATHS.c15HistoricalDisclosure] : []),
    ...suiteReceiptPaths,
    ...manifest.executionRows.flatMap(({ executions }) =>
      executions.flatMap(({ evidencePaths }) => evidencePaths),
    ),
    ...manifest.claimBindings.flatMap(({ evidencePaths }) => evidencePaths),
  ];
  const uniqueFrozenPaths = [...new Set(indexedPaths)].sort(compareCodePoint);
  const generatedPaths = Object.keys(artifacts).sort(compareCodePoint);
  const evidenceIndex = {
    schemaVersion: "1.0.0",
    kind: "s184-m07-evidence-index",
    sprintId: SPRINT_ID,
    missionId: MISSION_ID,
    reviewHead: frozenHead,
    frozenInputs: uniqueFrozenPaths.map((repositoryPath) =>
      frozenReference(repositoryRoot, frozenHead, repositoryPath),
    ),
    generatedOutputs: generatedPaths.map((repositoryPath) =>
      virtualReference(repositoryPath, artifacts),
    ),
    selfExcluded: true,
    selfExclusionReason:
      "The index omits its own digest to keep the generated hash graph acyclic.",
  };
  artifacts[OUTPUT_PATHS.evidenceIndex] = evidenceIndex;
  return artifacts;
}

export function writeOrCheckArtifacts({
  repositoryRoot = defaultRepositoryRoot,
  artifacts,
  mode = "write",
}) {
  assert(["write", "check"].includes(mode), `Unsupported mode: ${mode}`);
  for (const [repositoryPath, value] of Object.entries(artifacts)) {
    const absolutePath = path.join(repositoryRoot, repositoryPath);
    const expected = canonicalJson(value);
    if (mode === "check") {
      assert(
        fs.existsSync(absolutePath),
        `Generated artifact missing: ${repositoryPath}`,
      );
      assert(
        fs.readFileSync(absolutePath, "utf8") === expected,
        `Generated artifact is stale: ${repositoryPath}`,
      );
      continue;
    }
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, expected);
  }
}

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const invokedPath = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href
  : null;

if (invokedPath === import.meta.url) {
  const repositoryRoot = path.resolve(
    argument("--repository-root") ?? defaultRepositoryRoot,
  );
  const reviewHead =
    argument("--review-head") ??
    execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: repositoryRoot,
      encoding: "utf8",
    }).trim();
  const mode = process.argv.includes("--check") ? "check" : "write";
  const artifacts = buildCloseoutArtifacts({ repositoryRoot, reviewHead });
  writeOrCheckArtifacts({ repositoryRoot, artifacts, mode });
  const report = artifacts[OUTPUT_PATHS.closeoutReport];
  process.stdout.write(
    `Sprint 184 M07 closeout: ${report.status} (${report.headline.passed}/${report.headline.selected} proven claims; sprint remains Active)\n`,
  );
  if (report.status !== "passed") process.exitCode = 1;
}
