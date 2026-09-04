#!/usr/bin/env node

import crypto from "node:crypto";
import childProcess from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

import { evaluateIndependentReviewApproval } from "./independent-review-approval.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../..");

const BASELINE_COMMIT = "ae560bc22969c1fd81336730be4330c9115fc316";
const PLANNING_COMMIT = "8ce349076e7e3ba3f0b2f3f667d4fbb5c6a4b63b";
const DERIVATION_HEAD = "db302641acad22dc29fd0e2c6b1a0925411d4f34";
const HISTORICAL_CLOSEOUT_COMMIT = "ca8d84bbce165b656fd5cd83cc097c28fa774f19";
const SPRINT_ROOT = "artifacts/product-reality/sprint-182";
const M05_ROOT = `${SPRINT_ROOT}/m05`;
const REVIEW_ROOT = `${SPRINT_ROOT}/review`;

const PATHS = {
  baseline:
    "packages/component-contracts/registry/component-capability-baseline.v1.json",
  reconciliation:
    "packages/component-contracts/registry/component-reconciliation.proposed.v1.json",
  closeout:
    "packages/component-contracts/registry/component-capability-closeout.s182.v1.json",
  reactReadiness: "packages/components-react/evidence/react-readiness.v1.json",
  vueReadiness: "packages/components-vue/evidence/vue-readiness.v1.json",
  m04Ledger: `${SPRINT_ROOT}/m04/codegen-usable-ledger.json`,
  independentReview: `${SPRINT_ROOT}/review/independent-review.v1.json`,
  r02PackageExportResolution:
    "artifacts/product-reality/sprint-183/m06/r02-package-export-resolution.json",
  r01CorrectedMutation:
    "artifacts/product-reality/sprint-183/m06/mutation-replay/s182-m01b-brand-b-primary-contrast/mutation.patch",
  r01ReplayReport:
    "artifacts/product-reality/sprint-183/m06/mutation-replay/s182-m01b-brand-b-primary-contrast/report.json",
  mutationReplayReceipt:
    "artifacts/product-reality/sprint-183/m06/mutation-replay/report.json",
  claimDiff: `${M05_ROOT}/claim-diff.json`,
  promotionCloseout: `${REVIEW_ROOT}/foundation-v1-promotion-projection.v1.json`,
  promotionClaimDiff: `${REVIEW_ROOT}/foundation-v1-claim-diff.v1.json`,
  promotionBinding: `${REVIEW_ROOT}/foundation-v1-promotion-binding.v1.json`,
  canonicalFoundationV1:
    "packages/component-contracts/registry/component-capability-foundation-v1.s182.v1.json",
  evidenceIndex: `${M05_ROOT}/evidence-index.json`,
  maintenanceDisposition: `${M05_ROOT}/maintenance-disposition.json`,
  changedPathInventory: `${M05_ROOT}/changed-path-inventory.json`,
  rehashPaths: `${M05_ROOT}/rehash-paths.txt`,
};

export const S182_PROMOTION_PATHS = deepFreeze({
  closeout: PATHS.promotionCloseout,
  claimDiff: PATHS.promotionClaimDiff,
  binding: PATHS.promotionBinding,
  canonicalFoundationV1: PATHS.canonicalFoundationV1,
});

export const S182_HISTORICAL_INTEGRITY = deepFreeze({
  commit: HISTORICAL_CLOSEOUT_COMMIT,
  artifacts: [
    {
      path: `${SPRINT_ROOT}/m01b/mutation/mutation.patch`,
      bytes: 306,
      sha256:
        "a8ab5fd497ca1efcf7920f72c2afbe063a831133134baaa8288c6c9b2199ccaf",
      role: "frozen-mutation-patch",
    },
    {
      path: PATHS.closeout,
      bytes: 255063,
      sha256:
        "860218936e3e1a7b081e4849ce2abacacea03cb5714642b74e249a918e18202f",
      role: "indexed-truth-plane",
    },
    {
      path: PATHS.claimDiff,
      bytes: 3143,
      sha256:
        "d62ebfdccf731f6a0c74ac1dd4988b8ee302c41330c0c6db7fe274554fe1fa60",
      role: "frozen-claim-diff",
    },
    {
      path: PATHS.evidenceIndex,
      bytes: 189914,
      sha256:
        "f341a33e7544300d7d0a7357b6fab00e9e0515a5778880dac5938e00d2caab47",
      role: "frozen-evidence-index",
    },
    {
      path: `${M05_ROOT}/gate-record.json`,
      bytes: 12590795,
      sha256:
        "c4a14def13d494fdf0b447a4592dbda1ad2d3cc78710502b8934e818063b9202",
      role: "frozen-gate-record",
    },
    {
      path: `${M05_ROOT}/gate-record.md`,
      bytes: 12493042,
      sha256:
        "4da0a450296137f0a5efab55e24f69acff4563cbfbf4c9ee6a4d4f1532d5e8ff",
      role: "frozen-gate-record",
    },
  ],
});

const JSON_OUTPUTS = [
  PATHS.closeout,
  PATHS.claimDiff,
  PATHS.evidenceIndex,
  PATHS.maintenanceDisposition,
  PATHS.changedPathInventory,
];
const ALL_OUTPUTS = [
  "scripts/product-reality/generate-s182-m05-closeout.mjs",
  ...JSON_OUTPUTS,
  PATHS.rehashPaths,
];
const GENERATED_ARTIFACTS = new Set(
  JSON_OUTPUTS.filter((repoPath) => repoPath.startsWith(M05_ROOT)),
);
const CLOSEOUT_CI_HYGIENE_PATHS = new Set([
  "package.json",
  "tests/components/__snapshots__/empty-state.spec.tsx.snap",
  "tests/components/__snapshots__/subscription.render-object.test.tsx.snap",
  "tests/components/__snapshots__/user.render-object.test.tsx.snap",
  "tests/components/empty-state.spec.tsx",
  "tests/components/progress.test.tsx",
  "tests/components/stepper.test.tsx",
  "tests/contexts/__snapshots__/context-templates.test.tsx.snap",
  "tests/tokens/bridged-slot-specificity-census.test.ts",
  "vitest.config.ts",
]);

const FROZEN_NUCLEUS = [
  "Badge",
  "Banner",
  "Button",
  "Card",
  "Checkbox",
  "DatePicker",
  "Grid",
  "Input",
  "Select",
  "Stack",
  "Table",
  "Tabs",
  "Text",
  "Textarea",
];

const FROZEN_FOUNDATION_EVIDENCE_CLASSES = [
  "classificationContract",
  "packageExport",
  "scenarioBehavior",
  "accessibility",
  "visualThemes",
  "responsiveCraft",
  "serverRender",
  "packedImport",
  "codegenConsumer",
];

const S182_REVIEW_VERIFICATION_IDS = [
  "final-head-source-equivalence",
  "package-foundations-4-of-4",
  "root-typecheck",
  "codegen-19-of-19",
  "react-root-export-14",
  "vue-root-export-14",
  "vue-no-react-radix-rjsf-runtime",
  "m01b-mutation-discrimination",
  "claim-ref-existence-654",
  "l06-reconnect",
  "maintenance-carry-1315-1322",
];

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

export const S182_FOUNDATION_REVIEW_EXPECTATION = deepFreeze({
  predicate: "foundation-v1",
  producerSessionId: "PS-2026-09-04-003",
  producerActor: "Codex",
  reviewSessionId: "PS-2026-09-04-004",
  reviewerActor: "assistant",
  authorizationSessionId: "PS-2026-09-04-005",
  authorizerPrincipal: "Derek",
  derivationHead: DERIVATION_HEAD,
  reviewedHead: "ca8d84bbce165b656fd5cd83cc097c28fa774f19",
  reviewDecisionId: 1662,
  reviewedAt: "2026-09-04T16:19:45.117Z",
  authorizationDecisionId: 1663,
  authorizedAt: "2026-09-04T17:03:16.318Z",
  reviewDisposition: "accepted",
  authorizationDisposition: "approved",
  cells: ["react", "vue"].flatMap((target) =>
    FROZEN_NUCLEUS.map((componentId) => ({ target, componentId })),
  ),
  verificationIds: S182_REVIEW_VERIFICATION_IDS,
  residuals: [
    { id: "R-01", disposition: "resolved-before-promotion" },
    { id: "R-02", disposition: "carried-disclosed" },
  ],
});

const CANONICAL_MUTATION_RECEIPT_PATHS = [
  `${SPRINT_ROOT}/gates/B-01/drop/receipt.json`,
  `${SPRINT_ROOT}/gates/B-01/duplicate/receipt.json`,
  `${SPRINT_ROOT}/gates/B-02/receipt.json`,
  `${SPRINT_ROOT}/gates/B-03/foundation/receipt.json`,
  `${SPRINT_ROOT}/gates/B-03/emission/receipt.json`,
  `${SPRINT_ROOT}/gates/B-04/receipt.json`,
  `${SPRINT_ROOT}/gates/B-05/receipt.json`,
  `${SPRINT_ROOT}/gates/B-06/receipt.json`,
  `${SPRINT_ROOT}/gates/B-07/receipt.json`,
  `${SPRINT_ROOT}/gates/B-08/receipt.json`,
  `${SPRINT_ROOT}/gates/B-09/receipt.json`,
  `${SPRINT_ROOT}/gates/B-10/receipt.json`,
  `${SPRINT_ROOT}/gates/B-11/receipt.json`,
  `${SPRINT_ROOT}/gates/B-12/missing-tarball/receipt.json`,
  `${SPRINT_ROOT}/gates/B-12/missing-root-export/receipt.json`,
  `${SPRINT_ROOT}/gates/B-13/missing-dependency/receipt.json`,
  `${SPRINT_ROOT}/gates/B-13/missing-css-export/receipt.json`,
  `${SPRINT_ROOT}/gates/B-14/receipt.json`,
  `${SPRINT_ROOT}/gates/B-15/receipt.json`,
];

const FINAL_GATE_RECORD_PATHS = [
  `${M05_ROOT}/gate-record.json`,
  `${M05_ROOT}/gate-record.md`,
];

const MAINTENANCE_ITEMS = [
  {
    id: 1315,
    content:
      "Postcommit reissue (Forge-owned, §7.7 item 2, now unblocked): rebuild the gate-1 bundle at ae560bc so manifest.commit equals the commit and dirty:false, then send the four dated exact-SHA re-vendor/re-pin follow-ups to aquex, Dashboard-demos, Forge-Demos and Shopify-Forge citing remote CI-15 run 33632959999. The delivered bundle currently records 85004fe/dirty:true and nothing has been sent since the commit.",
    status: "pending",
    sessionId: "PS-2026-09-02-002",
    sprintId: "sprint-181",
    missionId: null,
    createdAt: "2026-09-02T14:38:25.411Z",
    resolvedAt: null,
    carriedToSprint: null,
    contentHash:
      "57f05adf24bea3c249887134f7a17a0a38347ee1c0db388b5380fa6a4366ce43",
    projectId: "forge",
    stableEventId: "01M1H8X444TP4P0EQWGDE2GRPY",
    occurredAt: 1788359905412,
    originSeq: 1315,
    eventType: "next_step_created",
    schemaVersion: 1,
    authorUserId: null,
  },
  {
    id: 1316,
    content:
      "Reword the stale receipt note at packages/mcp-server/src/lib/dtcg-intake/index.ts:777 — it ships on brand.intake's wire calling brand.intake 'deferred'. One line; the only consumer-visible defect the review found.",
    status: "pending",
    sessionId: "PS-2026-09-02-002",
    sprintId: "sprint-181",
    missionId: null,
    createdAt: "2026-09-02T14:38:25.411Z",
    resolvedAt: null,
    carriedToSprint: null,
    contentHash:
      "12e430bfce88c2000d2855eea3d6a528f36943eb9cf53d5f5bbe9892084d59f3",
    projectId: "forge",
    stableEventId: "01M1H8X44B71ADN0YKK7QK46WG",
    occurredAt: 1788359905419,
    originSeq: 1316,
    eventType: "next_step_created",
    schemaVersion: 1,
    authorUserId: null,
  },
  {
    id: 1317,
    content:
      "Fix the last stale advertised-count site: docs/how-forge-works.html:379 still says '25-tool roster' (should be 26). Rule 15 membership missed it; every other named 19→20 and 25→26 site moved correctly.",
    status: "pending",
    sessionId: "PS-2026-09-02-002",
    sprintId: "sprint-181",
    missionId: null,
    createdAt: "2026-09-02T14:38:25.411Z",
    resolvedAt: null,
    carriedToSprint: null,
    contentHash:
      "b0058ac6fb41f6c0b7391f73e426b5eed3a61a51cf01299b8b3e5517bd4ae319",
    projectId: "forge",
    stableEventId: "01M1H8X44CBWQNVG3WK1EZ4JVM",
    occurredAt: 1788359905420,
    originSeq: 1317,
    eventType: "next_step_created",
    schemaVersion: 1,
    authorUserId: null,
  },
  {
    id: 1318,
    content:
      "Adopt the §0 discipline the review's mismatches point at: regenerate the declared-mover path list FROM the final diff at closeout instead of carrying the planning-time list forward. Five real movers were disclosed in §1c/§7.2 but absent from §0, and §0 is what a reviewer diffs the commit against.",
    status: "pending",
    sessionId: "PS-2026-09-02-002",
    sprintId: "sprint-181",
    missionId: null,
    createdAt: "2026-09-02T14:38:25.411Z",
    resolvedAt: null,
    carriedToSprint: null,
    contentHash:
      "9845275830892a95914dc16ed7995017edfef6ae4390a8a828db2559062d176f",
    projectId: "forge",
    stableEventId: "01M1H8X44CWCDH3KK839R9ZBKN",
    occurredAt: 1788359905420,
    originSeq: 1318,
    eventType: "next_step_created",
    schemaVersion: 1,
    authorUserId: null,
  },
  {
    id: 1319,
    content:
      "Correct the B-15 recipe in the record: as written ('remove dist/schemas/component-schema.json from the extracted tarball') the payload-tree digest check at e2e.mjs:504 fires before the MCP client is built at :541, so a reviewer re-running it verbatim sees a digest mismatch and never observes the list-succeeds/call-fails discrimination the row exists to prove. The builder measured it correctly with the embedded manifest re-pinned; the recipe needs that step.",
    status: "pending",
    sessionId: "PS-2026-09-02-002",
    sprintId: "sprint-181",
    missionId: null,
    createdAt: "2026-09-02T14:38:25.411Z",
    resolvedAt: null,
    carriedToSprint: null,
    contentHash:
      "5266ae96449787b38e8861b3de57ee1e23238e04598e73804c4761c7ae62cdc5",
    projectId: "forge",
    stableEventId: "01M1H8X44CC6PGXNKW4855506D",
    occurredAt: 1788359905420,
    originSeq: 1319,
    eventType: "next_step_created",
    schemaVersion: 1,
    authorUserId: null,
  },
  {
    id: 1320,
    content:
      "Widen boundary gate 3 (the quoted-'cmos' executable check at assemble.mjs:512) beyond /^packages/[^/]+/dist/.*\\.js$/ so it covers the adapter's four flat runtime files at packages/mcp-adapter/*.js. Latent and currently clean — gates 1 and 2 do cover those files.",
    status: "pending",
    sessionId: "PS-2026-09-02-002",
    sprintId: "sprint-181",
    missionId: null,
    createdAt: "2026-09-02T14:38:25.411Z",
    resolvedAt: null,
    carriedToSprint: null,
    contentHash:
      "11fd8ea1a3ccdb57cb0fbe2b1a7a0666b0d52cc476f4a5a104cc7e395036fb7f",
    projectId: "forge",
    stableEventId: "01M1H8X44CBD6680KVB6RGYBZE",
    occurredAt: 1788359905420,
    originSeq: 1320,
    eventType: "next_step_created",
    schemaVersion: 1,
    authorUserId: null,
  },
  {
    id: 1321,
    content:
      "Re-take the s180 memo §7.4 C7 cells: they were anchored to the pre-C5 tree and no longer reproduce at ae560bc (C5 added a test to dtcg-intake.s180.spec.ts, moving the denominator), so the pasted counts are stale a second time.",
    status: "pending",
    sessionId: "PS-2026-09-02-002",
    sprintId: "sprint-181",
    missionId: null,
    createdAt: "2026-09-02T14:38:25.411Z",
    resolvedAt: null,
    carriedToSprint: null,
    contentHash:
      "b7cdae9db9b938855519daf852c2fd38284a49a74c8e92408266ea1400434ad7",
    projectId: "forge",
    stableEventId: "01M1H8X44DFGEB614495W6YZ0A",
    occurredAt: 1788359905421,
    originSeq: 1321,
    eventType: "next_step_created",
    schemaVersion: 1,
    authorUserId: null,
  },
  {
    id: 1322,
    content:
      "Add --final to the CI-15 local twin in the closeout checklist cell — the clean-tree guard is in the real job but omitted from the canonical local invocation, and OODS-N013 is now unreachable dead code in the error registry after the fallback removal.",
    status: "pending",
    sessionId: "PS-2026-09-02-002",
    sprintId: "sprint-181",
    missionId: null,
    createdAt: "2026-09-02T14:38:25.411Z",
    resolvedAt: null,
    carriedToSprint: null,
    contentHash:
      "b79d9690a2e5c8c140c2f7d8cc1714827302284f52e5b9448437d338cb8679e1",
    projectId: "forge",
    stableEventId: "01M1H8X44D76KKC65K29V2FX01",
    occurredAt: 1788359905421,
    originSeq: 1322,
    eventType: "next_step_created",
    schemaVersion: 1,
    authorUserId: null,
  },
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function compareCodePoint(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function uniqueSorted(values) {
  return [...new Set(values)].sort(compareCodePoint);
}

function canonicalJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function sha256(contents) {
  return crypto.createHash("sha256").update(contents).digest("hex");
}

function fullPath(repoPath) {
  return path.join(repoRoot, repoPath);
}

function toRepoPath(filePath) {
  return path.relative(repoRoot, filePath).split(path.sep).join("/");
}

function readJson(repoPath) {
  return JSON.parse(fs.readFileSync(fullPath(repoPath), "utf8"));
}

function contentAddress(repoPath, contents) {
  return {
    path: repoPath,
    bytes: contents.byteLength,
    sha256: sha256(contents),
  };
}

function readHistoricalArtifact(repoPath) {
  return childProcess.execFileSync(
    "git",
    ["show", `${HISTORICAL_CLOSEOUT_COMMIT}:${repoPath}`],
    { cwd: repoRoot, maxBuffer: 32 * 1024 * 1024 },
  );
}

export function checkHistoricalIntegrity() {
  for (const expected of S182_HISTORICAL_INTEGRITY.artifacts) {
    const contents = fs.readFileSync(fullPath(expected.path));
    assert(
      contents.byteLength === expected.bytes &&
        sha256(contents) === expected.sha256,
      `Historical Sprint 182 artifact drifted from ${HISTORICAL_CLOSEOUT_COMMIT}: ${expected.path}`,
    );
  }
  return true;
}

export function restoreHistoricalIntegrity() {
  for (const expected of S182_HISTORICAL_INTEGRITY.artifacts) {
    const contents = readHistoricalArtifact(expected.path);
    assert(
      contents.byteLength === expected.bytes &&
        sha256(contents) === expected.sha256,
      `Git object does not match the pinned historical address: ${expected.path}`,
    );
    fs.writeFileSync(fullPath(expected.path), contents);
  }
  checkHistoricalIntegrity();
}

function readOptionalJson(repoPath) {
  if (!fs.existsSync(fullPath(repoPath))) return null;
  return readJson(repoPath);
}

function git(args) {
  return childProcess
    .execFileSync("git", args, { cwd: repoRoot, encoding: "utf8" })
    .trim();
}

const contractsDistPath = fullPath(
  "packages/component-contracts/dist/index.js",
);
assert(
  fs.existsSync(contractsDistPath),
  "Build @oods/component-contracts before generating M05 closeout evidence (dist/index.js is missing)",
);
const contractsRuntime = await import(pathToFileURL(contractsDistPath).href);
const {
  FOUNDATION_V1_EVIDENCE_CLASSES,
  NUCLEUS_COMPONENT_IDS,
  evaluateFoundationV1,
} = contractsRuntime;

function countStates(rows, surface) {
  const counts = {};
  for (const row of rows) {
    const state = row.surfaces[surface].state;
    counts[state] = (counts[state] ?? 0) + 1;
  }
  return Object.fromEntries(
    Object.entries(counts).sort(([a], [b]) => compareCodePoint(a, b)),
  );
}

function targetInputs(target) {
  if (target === "react") {
    return {
      readinessPath: PATHS.reactReadiness,
      missionReport: "cmos/reports/s182-m02-verification.md",
      visualReport: `${SPRINT_ROOT}/m02/visual-regression/report.json`,
      packedReport: `${SPRINT_ROOT}/m02/final-verified/packed-import/report.json`,
      consumerReport: `${SPRINT_ROOT}/m04/generated-consumers/consumers/react/report.json`,
    };
  }
  return {
    readinessPath: PATHS.vueReadiness,
    missionReport: "cmos/reports/s182-m03-parity.md",
    visualReport: `${SPRINT_ROOT}/m03/visual-regression/report.json`,
    packedReport: `${SPRINT_ROOT}/m03/package-verification/report.json`,
    consumerReport: `${SPRINT_ROOT}/m04/generated-consumers/consumers/vue/report.json`,
  };
}

function passingFoundationEvidence(target, readinessRow, r02Cell) {
  const inputs = targetInputs(target);
  const readinessEvidence = readinessRow.evidence;
  return {
    classificationContract: {
      status: "passed",
      refs: uniqueSorted([
        PATHS.reconciliation,
        "packages/component-contracts/src/contracts.ts",
        "packages/component-contracts/src/scenarios.ts",
        ...readinessEvidence.versionedContract.refs,
      ]),
    },
    packageExport: {
      status: "passed",
      refs: uniqueSorted([
        inputs.readinessPath,
        `${SPRINT_ROOT}/gates/B-12/verifier-green/package-foundations/report.json`,
        ...readinessEvidence.packageExport.refs,
        ...readinessEvidence.dependencyClosure.refs,
        r02Cell.packageExport.tarballPath,
        `${PATHS.r02PackageExportResolution}#${target}:${readinessRow.componentId}`,
      ]),
    },
    scenarioBehavior: {
      status: "passed",
      refs: uniqueSorted([
        inputs.readinessPath,
        inputs.missionReport,
        ...readinessEvidence.frameworkScenario.refs,
      ]),
    },
    accessibility: {
      status: "passed",
      refs: uniqueSorted([
        inputs.missionReport,
        target === "react"
          ? "packages/components-react/test/accessibility.spec.tsx"
          : "packages/components-vue/test/accessibility.spec.ts",
      ]),
    },
    visualThemes: {
      status: "passed",
      refs: [inputs.visualReport],
    },
    responsiveCraft: {
      status: "passed",
      refs: [inputs.consumerReport, inputs.visualReport].sort(compareCodePoint),
    },
    serverRender: {
      status: "passed",
      refs: [inputs.consumerReport],
    },
    packedImport: {
      status: "passed",
      refs: [
        `${SPRINT_ROOT}/gates/B-12/verifier-green/package-foundations/report.json`,
        inputs.packedReport,
      ].sort(compareCodePoint),
    },
    codegenConsumer: {
      status: "passed",
      refs: [
        `${SPRINT_ROOT}/m04/codegen-matrix/report.json`,
        inputs.consumerReport,
        PATHS.m04Ledger,
      ].sort(compareCodePoint),
    },
  };
}

function surfaceEvidence(target, readinessRow) {
  const inputs = targetInputs(target);
  return uniqueSorted([
    inputs.readinessPath,
    inputs.missionReport,
    ...Object.values(readinessRow.evidence).flatMap((item) => item.refs),
  ]);
}

export function buildCapabilityCloseout(options = {}) {
  const baseline = readJson(PATHS.baseline);
  const reconciliation = readJson(PATHS.reconciliation);
  const codegenLedger = readJson(PATHS.m04Ledger);
  const r02Resolution = readJson(PATHS.r02PackageExportResolution);
  const readinessDocuments = {
    react: readJson(PATHS.reactReadiness),
    vue: readJson(PATHS.vueReadiness),
  };
  const nucleus = [...NUCLEUS_COMPONENT_IDS];
  const nucleusSet = new Set(nucleus);
  const baselineIds = baseline.rows.map((row) => row.id);
  const reconciliationIds = reconciliation.rows.map((row) => row.id);
  const r02Cells = new Map(
    (Array.isArray(r02Resolution.cells) ? r02Resolution.cells : []).map(
      (cell) => [`${cell.target}:${cell.componentId}`, cell],
    ),
  );
  const approvalRecord = Object.prototype.hasOwnProperty.call(
    options,
    "approvalRecord",
  )
    ? options.approvalRecord
    : readOptionalJson(PATHS.independentReview);
  const reviewGate = evaluateIndependentReviewApproval({
    record: approvalRecord,
    expectation: S182_FOUNDATION_REVIEW_EXPECTATION,
  });
  assert(
    reviewGate.outcome !== "invalid",
    `Independent-review approval record is invalid: ${reviewGate.reasons
      .map((reason) => `${reason.code}: ${reason.message}`)
      .join("; ")}`,
  );
  const independentReviewApproved = reviewGate.outcome === "approved";

  assert(
    JSON.stringify(nucleus) === JSON.stringify(FROZEN_NUCLEUS),
    "Public nucleus differs from the locked 14 IDs",
  );
  assert(
    JSON.stringify([...FOUNDATION_V1_EVIDENCE_CLASSES]) ===
      JSON.stringify(FROZEN_FOUNDATION_EVIDENCE_CLASSES),
    "Public foundation-v1 evidence classes differ from the locked nine classes",
  );
  assert(
    baseline.rows.length === 109 && new Set(baselineIds).size === 109,
    "Capability baseline must contain 109 unique rows",
  );
  assert(
    JSON.stringify(baselineIds) ===
      JSON.stringify([...baselineIds].sort(compareCodePoint)),
    "Capability baseline rows are not sorted",
  );
  assert(
    JSON.stringify(baselineIds) === JSON.stringify(reconciliationIds),
    "Reconciliation membership differs from capability baseline",
  );
  assert(
    reconciliation.approvedRuntimeCensus === null,
    "Runtime census approval must remain null",
  );
  assert(
    reconciliation.proposedRuntimeCensus.runtimeRows === 98,
    "Proposed runtime census must remain 98",
  );
  assert(
    reconciliation.proposedRuntimeCensus.nonRuntimeRows === 11,
    "Proposed non-runtime census must remain 11",
  );
  assert(
    r02Resolution.risk === "R-02" &&
      r02Resolution.status === "resolved" &&
      r02Resolution.selected === 28 &&
      r02Resolution.passed === 28 &&
      r02Resolution.failed === 0 &&
      r02Resolution.skipped === 0 &&
      r02Resolution.workspaceBuildOutputRequired === false &&
      r02Cells.size === 28,
    "R-02 package-export resolution must prove all 28 cells from tracked tarballs",
  );

  const codegenCells = new Set(
    codegenLedger.rows
      .filter((row) => row.codegenUsable === true)
      .map((row) => `${row.target}:${row.componentId}`),
  );
  assert(
    codegenCells.size === 28,
    "M04 ledger must contain 28 codegenUsable target cells",
  );

  const readinessMaps = {};
  for (const target of ["react", "vue"]) {
    const document = readinessDocuments[target];
    assert(
      document.target === target,
      `${target} readiness document has the wrong target`,
    );
    assert(
      document.rows.length === 14,
      `${target} readiness document must contain 14 rows`,
    );
    readinessMaps[target] = new Map(
      document.rows.map((row) => [row.componentId, row]),
    );
    assert(
      JSON.stringify(
        [...readinessMaps[target].keys()].sort(compareCodePoint),
      ) === JSON.stringify([...nucleus].sort(compareCodePoint)),
      `${target} readiness membership differs from the locked nucleus`,
    );
  }

  const foundationCells = [];
  for (const target of ["react", "vue"]) {
    for (const componentId of nucleus) {
      const readinessRow = readinessMaps[target].get(componentId);
      assert(
        readinessRow.state === "implemented-evidence-complete",
        `${target}:${componentId} is not implementation-complete`,
      );
      assert(
        readinessRow.emissionEligible === true,
        `${target}:${componentId} is not emission eligible`,
      );
      assert(
        codegenCells.has(`${target}:${componentId}`),
        `${target}:${componentId} is not codegenUsable`,
      );
      const r02Cell = r02Cells.get(`${target}:${componentId}`);
      assert(
        r02Cell?.packageExport?.status === "passed" &&
          typeof r02Cell.packageExport.tarballPath === "string" &&
          fs.existsSync(fullPath(r02Cell.packageExport.tarballPath)),
        `${target}:${componentId} lacks tracked R-02 package-export evidence`,
      );
      const evidence = passingFoundationEvidence(target, readinessRow, r02Cell);
      const evaluation = evaluateFoundationV1(evidence, {
        independentReviewApproved,
      });
      foundationCells.push({
        componentId,
        target,
        implementationState: readinessRow.state,
        emissionEligible: true,
        codegenUsable: true,
        evidence,
        independentReviewApproved,
        evaluation,
      });
    }
  }

  const rows = baseline.rows.map((row) => {
    if (!nucleusSet.has(row.id)) return structuredClone(row);
    const reactReadiness = readinessMaps.react.get(row.id);
    const vueReadiness = readinessMaps.vue.get(row.id);
    return {
      ...structuredClone(row),
      surfaces: {
        ...structuredClone(row.surfaces),
        react: {
          state: "implemented-evidence-complete",
          evidence: surfaceEvidence("react", reactReadiness),
        },
        vue: {
          state: "implemented-evidence-complete",
          evidence: surfaceEvidence("vue", vueReadiness),
        },
        generatedConsumer: {
          state: "implemented-evidence-complete",
          evidence: [
            `${SPRINT_ROOT}/m04/generated-consumers/consumers/react/report.json`,
            `${SPRINT_ROOT}/m04/generated-consumers/consumers/vue/report.json`,
            PATHS.m04Ledger,
          ],
        },
        accessibility: {
          state: "verified",
          evidence: [
            "cmos/reports/s182-m02-verification.md",
            "cmos/reports/s182-m03-parity.md",
          ],
        },
        theme: {
          state: "verified",
          evidence: [
            `${SPRINT_ROOT}/m02/visual-regression/report.json`,
            `${SPRINT_ROOT}/m03/visual-regression/report.json`,
          ],
        },
        interaction: {
          state: "verified",
          evidence: [
            `${SPRINT_ROOT}/m04/generated-consumers/consumers/react/report.json`,
            `${SPRINT_ROOT}/m04/generated-consumers/consumers/vue/report.json`,
          ],
        },
      },
    };
  });

  return {
    schemaVersion: "1.0.0",
    kind: "component-capability-closeout",
    mission: "s182-m05",
    baselineCommit: BASELINE_COMMIT,
    planningCommit: PLANNING_COMMIT,
    derivationHead: DERIVATION_HEAD,
    sourceCapabilityBaseline: PATHS.baseline,
    sourceReconciliation: PATHS.reconciliation,
    controllingObligationDenominator: 109,
    approvedRuntimeCensus: null,
    proposedRuntimeCensus: structuredClone(
      reconciliation.proposedRuntimeCensus,
    ),
    independentReviewApproved,
    independentReviewOutcome: reviewGate.outcome,
    independentReviewRecord: PATHS.independentReview,
    riskResolutions: {
      "R-02": PATHS.r02PackageExportResolution,
    },
    foundationEvidenceClasses: [...FOUNDATION_V1_EVIDENCE_CLASSES],
    summary: {
      rows: rows.length,
      classifiedRows: reconciliation.rows.length,
      selectedComponents: nucleus.length,
      selectedTargets: 2,
      selectedCells: foundationCells.length,
      foundationV1CandidateCells: foundationCells.filter(
        (cell) => cell.evaluation.candidate,
      ).length,
      foundationV1Cells: foundationCells.filter(
        (cell) => cell.evaluation.foundationV1,
      ).length,
    },
    rows,
    foundationCells,
  };
}

export function buildClaimDiff(closeout) {
  const baseline = readJson(PATHS.baseline);
  const baselineSurfaceStates = {};
  const closeoutSurfaceStates = {};
  for (const surface of [
    "contract",
    "metadata",
    "html",
    "react",
    "vue",
    "generatedConsumer",
    "accessibility",
    "theme",
    "interaction",
  ]) {
    baselineSurfaceStates[surface] = countStates(baseline.rows, surface);
    closeoutSurfaceStates[surface] = countStates(closeout.rows, surface);
  }
  return {
    schemaVersion: "1.0.0",
    mission: "s182-m05",
    kind: "component-claim-diff",
    baselineCommit: BASELINE_COMMIT,
    planningCommit: PLANNING_COMMIT,
    derivationHead: closeout.derivationHead,
    boundary:
      closeout.independentReviewOutcome === "approved"
        ? "Foundation-v1 is promoted only by the validated independent-review approval record; runtime-census approval remains outside this scope."
        : "Evidence-derived closeout claims only; independent review remains required for foundation-v1.",
    claims: [
      {
        id: "controlling-component-denominator",
        baseline: 109,
        closeout: 109,
        disposition: "unchanged",
      },
      {
        id: "proposed-runtime-census",
        baseline: { runtimeRows: 98, nonRuntimeRows: 11 },
        closeout: { runtimeRows: 98, nonRuntimeRows: 11 },
        disposition: "unchanged-proposal",
      },
      {
        id: "approved-runtime-census",
        baseline: null,
        closeout: null,
        disposition: "withheld-pending-derek-approval",
      },
      {
        id: "html-runtime",
        baseline: baselineSurfaceStates.html,
        closeout: closeoutSurfaceStates.html,
        disposition: "unchanged-98-mapped-11-fallback",
      },
      {
        id: "react-foundation-v1-candidate",
        baseline: 0,
        closeout: closeout.foundationCells.filter(
          (cell) => cell.target === "react" && cell.evaluation.candidate,
        ).length,
        disposition: "derived-from-nine-evidence-classes",
      },
      {
        id: "vue-foundation-v1-candidate",
        baseline: 0,
        closeout: closeout.foundationCells.filter(
          (cell) => cell.target === "vue" && cell.evaluation.candidate,
        ).length,
        disposition: "derived-from-nine-evidence-classes",
      },
      {
        id: "foundation-v1",
        baseline: 0,
        closeout: closeout.summary.foundationV1Cells,
        disposition:
          closeout.independentReviewOutcome === "approved"
            ? "promoted-by-validated-independent-review-record"
            : "withheld-pending-independent-review",
      },
    ],
    surfaceStateDiff: {
      baseline: baselineSurfaceStates,
      closeout: closeoutSurfaceStates,
    },
  };
}

function walkFiles(repoPath) {
  const start = fullPath(repoPath);
  if (!fs.existsSync(start)) return [];
  const result = [];
  function visit(current) {
    for (const entry of fs
      .readdirSync(current, { withFileTypes: true })
      .sort((a, b) => compareCodePoint(a.name, b.name))) {
      const next = path.join(current, entry.name);
      if (entry.isDirectory()) visit(next);
      else if (entry.isFile()) result.push(toRepoPath(next));
    }
  }
  visit(start);
  return result;
}

function evidenceClassesForPath(repoPath, foundationClassesByPath) {
  const classes = [];
  classes.push(...(foundationClassesByPath.get(repoPath) ?? []));
  if (repoPath.endsWith(".tgz")) classes.push("tarball");
  if (
    /\/inventor(?:y|ies)\//.test(repoPath) ||
    /inventory\.json$/.test(repoPath)
  )
    classes.push("package-inventory");
  if (/generated-consumers\/consumers\/[^/]+\/logs\//.test(repoPath))
    classes.push("clean-consumer-log");
  if (
    /codegen-matrix\/sources\//.test(repoPath) ||
    /generated-consumers\/consumers\/[^/]+\/(?:source|build)\//.test(repoPath)
  )
    classes.push("generated-output");
  if (
    /visual-regression\//.test(repoPath) ||
    /\/screenshots\//.test(repoPath) ||
    repoPath.endsWith(".png")
  )
    classes.push("visual-responsive");
  if (/\/gates\/B-\d\d\//.test(repoPath) || /\/mutation\//.test(repoPath))
    classes.push("mutation-bite");
  if (/accessibility/.test(repoPath) || /\/B-06\//.test(repoPath))
    classes.push("accessibility");
  if (/interactions/.test(repoPath) || /\/B-(?:07|09|10)\//.test(repoPath))
    classes.push("interaction");
  if (repoPath.endsWith("report.json") || repoPath.startsWith("cmos/reports/"))
    classes.push("report");
  if (/readiness\.v1\.json$/.test(repoPath)) classes.push("target-readiness");
  if (
    /component-(?:intake|reconciliation|capability-(?:baseline|closeout))/.test(
      repoPath,
    )
  )
    classes.push("truth-plane");
  if (
    repoPath.startsWith(`${M05_ROOT}/gate-`) ||
    repoPath.startsWith(`${M05_ROOT}/logs/`) ||
    repoPath === `${M05_ROOT}/l06-reconnect.json`
  )
    classes.push("closeout-gate");
  if (classes.length === 0) classes.push("supporting-artifact");
  return uniqueSorted(classes);
}

function buildEvidenceIndex(closeout) {
  const optionalStaticPaths = [
    "MEMORY.md",
    "cmos/reports/s182-m05-closeout.md",
  ].filter((repoPath) => fs.existsSync(fullPath(repoPath)));
  const staticPaths = [
    ...optionalStaticPaths,
    "cmos/foundational-docs/closeout-checklist.md",
    "cmos/foundational-docs/roadmap/near.md",
    "cmos/planning/forge-s182-foundation-gate-manifest.md",
    "cmos/planning/forge-s182-product-reality-foundation-decision-memo.md",
    "cmos/planning/oods-components.json",
    "cmos/planning/structured-data-delta-2026-09-04.md",
    "cmos/scripts/refresh_structured_data.py",
    "docs/how-forge-works.html",
    "artifacts/structured-data/manifest.json",
    "artifacts/structured-data/oods-components-2026-09-04.json",
    "cmos/reports/s182-m01-mutation-evidence.md",
    "cmos/reports/s182-m02-mutation-evidence.md",
    "cmos/reports/s182-m02-parity.md",
    "cmos/reports/s182-m02-verification.md",
    "cmos/reports/s182-m03-mutation-evidence.md",
    "cmos/reports/s182-m03-parity.md",
    "cmos/reports/s182-m04-caller-migration.md",
    "cmos/reports/s182-m04-mutation-evidence.md",
    "cmos/reports/s182-m04-verification.md",
    "packages/component-contracts/src/contracts.ts",
    "packages/component-contracts/src/foundation-v1.ts",
    "packages/component-contracts/src/scenarios.ts",
    "packages/component-contracts/registry/component-intake.v1.json",
    PATHS.baseline,
    PATHS.closeout,
    PATHS.reconciliation,
    PATHS.reactReadiness,
    PATHS.vueReadiness,
  ];
  const foundationReferencePaths = closeout.foundationCells.flatMap((cell) =>
    Object.values(cell.evidence).flatMap((result) =>
      result.refs.map((ref) => ref.split("#", 1)[0]),
    ),
  );
  const foundationClassesByPath = new Map();
  for (const cell of closeout.foundationCells) {
    for (const [evidenceClass, result] of Object.entries(cell.evidence)) {
      for (const ref of result.refs) {
        const repoPath = ref.split("#", 1)[0];
        const classes = foundationClassesByPath.get(repoPath) ?? [];
        classes.push(evidenceClass);
        foundationClassesByPath.set(repoPath, uniqueSorted(classes));
      }
    }
  }
  const missingFoundationReferences = uniqueSorted(
    foundationReferencePaths,
  ).filter((repoPath) => !fs.existsSync(fullPath(repoPath)));
  assert(
    missingFoundationReferences.length === 0,
    `Foundation evidence references missing files: ${missingFoundationReferences.join(", ")}`,
  );
  const m05SupplementalFiles = walkFiles(M05_ROOT).filter(
    (repoPath) =>
      !GENERATED_ARTIFACTS.has(repoPath) && repoPath !== PATHS.rehashPaths,
  );
  const candidatePaths = uniqueSorted([
    ...staticPaths,
    ...foundationReferencePaths,
    ...walkFiles(`${SPRINT_ROOT}/m01`),
    ...walkFiles(`${SPRINT_ROOT}/m01a`),
    ...walkFiles(`${SPRINT_ROOT}/m01b`),
    ...walkFiles(`${SPRINT_ROOT}/m02`),
    ...walkFiles(`${SPRINT_ROOT}/m03`),
    ...walkFiles(`${SPRINT_ROOT}/m04`),
    ...walkFiles(`${SPRINT_ROOT}/gates`),
    ...m05SupplementalFiles,
  ]);
  const files = candidatePaths.map((repoPath) => {
    const contents =
      repoPath === PATHS.closeout
        ? Buffer.from(canonicalJson(closeout))
        : fs.readFileSync(fullPath(repoPath));
    return {
      path: repoPath,
      bytes: contents.byteLength,
      sha256: sha256(contents),
      evidenceClasses: evidenceClassesForPath(
        repoPath,
        foundationClassesByPath,
      ),
    };
  });
  const canonicalGateReceipts = files.filter(
    (file) =>
      file.path.startsWith(`${SPRINT_ROOT}/gates/`) &&
      file.path.endsWith("/receipt.json"),
  );
  const presentReceiptPaths = new Set(
    canonicalGateReceipts.map((file) => file.path),
  );
  const presentGateIds = uniqueSorted(
    canonicalGateReceipts
      .map((file) => file.path.match(/\/gates\/(B-\d\d)(?:\/|$)/)?.[1])
      .filter(Boolean),
  );
  const expectedGateIds = Array.from(
    { length: 15 },
    (_, index) => `B-${String(index + 1).padStart(2, "0")}`,
  );
  const pendingGateIds = expectedGateIds.filter(
    (gateId) => !presentGateIds.includes(gateId),
  );
  const pendingMutationReceipts = CANONICAL_MUTATION_RECEIPT_PATHS.filter(
    (repoPath) => !presentReceiptPaths.has(repoPath),
  );
  const unexpectedMutationReceipts = canonicalGateReceipts
    .map((file) => file.path)
    .filter((repoPath) => !CANONICAL_MUTATION_RECEIPT_PATHS.includes(repoPath));
  const presentFinalGateRecords = FINAL_GATE_RECORD_PATHS.filter((repoPath) =>
    candidatePaths.includes(repoPath),
  );
  const canonicalMutationGateStatus =
    pendingMutationReceipts.length === 0 &&
    unexpectedMutationReceipts.length === 0
      ? "complete"
      : "pending-capture";
  const finalGateRecordStatus =
    presentFinalGateRecords.length === FINAL_GATE_RECORD_PATHS.length
      ? "complete"
      : "pending-capture";
  const countsByClass = {};
  for (const file of files) {
    for (const evidenceClass of file.evidenceClasses) {
      countsByClass[evidenceClass] = (countsByClass[evidenceClass] ?? 0) + 1;
    }
  }
  return {
    schemaVersion: "1.0.0",
    mission: "s182-m05",
    kind: "reproducible-evidence-index",
    measuredTree: {
      baselineCommit: BASELINE_COMMIT,
      planningCommit: PLANNING_COMMIT,
      derivationHead: closeout.derivationHead,
      operand: "DERIVATION_HEAD plus the explicitly inventoried working tree",
    },
    summary: {
      indexedFiles: files.length,
      indexedBytes: files.reduce((sum, file) => sum + file.bytes, 0),
      countsByClass: Object.fromEntries(
        Object.entries(countsByClass).sort(([a], [b]) =>
          compareCodePoint(a, b),
        ),
      ),
      canonicalMutationReceipts: canonicalGateReceipts.length,
      expectedCanonicalMutationReceipts:
        CANONICAL_MUTATION_RECEIPT_PATHS.length,
      pendingMutationReceipts,
      unexpectedMutationReceipts,
      presentGateIds,
      pendingGateIds,
      canonicalMutationGateStatus,
      presentFinalGateRecords,
      pendingFinalGateRecords: FINAL_GATE_RECORD_PATHS.filter(
        (repoPath) => !presentFinalGateRecords.includes(repoPath),
      ),
      finalGateRecordStatus,
    },
    finalGateRecords: {
      status: finalGateRecordStatus,
      files: presentFinalGateRecords,
      note:
        presentFinalGateRecords.length === FINAL_GATE_RECORD_PATHS.length
          ? "Both final gate-record files are hashed in this index."
          : "Final closeout gate-record files have not been captured yet; rerun --write after capture.",
    },
    files,
  };
}

function classifyScope(repoPath) {
  const rules = [
    [
      "product-reality-evidence",
      (value) => value.startsWith(`${SPRINT_ROOT}/`),
    ],
    [
      "structured-data-regeneration",
      (value) =>
        value.startsWith("artifacts/structured-data/") ||
        value.startsWith("cmos/planning/oods-") ||
        value === "cmos/planning/structured-data-delta-2026-09-04.md",
    ],
    [
      "component-contracts",
      (value) => value.startsWith("packages/component-contracts/"),
    ],
    [
      "shared-component-styles",
      (value) => value.startsWith("packages/component-styles/"),
    ],
    [
      "react-component-foundation",
      (value) =>
        value.startsWith("packages/components-react/") ||
        value.startsWith("src/components/") ||
        value === "stories/components/ReactNucleus.stories.tsx" ||
        value === "tests/components/tabs.spec.tsx",
    ],
    [
      "vue-component-foundation",
      (value) => value.startsWith("packages/components-vue/"),
    ],
    [
      "target-aware-codegen",
      (value) =>
        value.startsWith("packages/mcp-server/") ||
        value.startsWith("tests/codegen/") ||
        value.startsWith("tests/e2e/"),
    ],
    [
      "product-reality-automation",
      (value) => value.startsWith("scripts/product-reality/"),
    ],
    [
      "portable-runtime-repair",
      (value) => value.startsWith("scripts/runtime/"),
    ],
    [
      "closeout-governance",
      (value) =>
        value.startsWith("cmos/foundational-docs/") ||
        value.startsWith("cmos/planning/forge-s182-") ||
        value.startsWith("cmos/reports/") ||
        value.startsWith("cmos/scripts/") ||
        value.startsWith("cmos/tests/") ||
        value.startsWith("docs/") ||
        value.startsWith("tests/verification/") ||
        value === "MEMORY.md" ||
        value === "README.md" ||
        value === "agents.md",
    ],
    ["closeout-ci-hygiene", (value) => CLOSEOUT_CI_HYGIENE_PATHS.has(value)],
    [
      "package-graph-and-repository-hygiene",
      (value) =>
        value === "pnpm-lock.yaml" ||
        value === ".gitignore" ||
        value === ".npmrc",
    ],
    [
      "compatibility-carriers",
      (value) => value.startsWith("packages/mcp-adapter/"),
    ],
  ];
  return rules.find(([, matches]) => matches(repoPath))?.[0] ?? "unreconciled";
}

function parseNameStatus(output) {
  const rows = [];
  for (const line of output.split(/\r?\n/).filter(Boolean)) {
    const [status, ...paths] = line.split("\t");
    const repoPath = paths.at(-1);
    rows.push({
      path: repoPath,
      status,
      ...(paths.length > 1 ? { previousPath: paths[0] } : {}),
    });
  }
  return rows;
}

function buildChangedPathInventory(closeout) {
  const changed = new Map();
  const tracked = parseNameStatus(
    git([
      "diff",
      "--name-status",
      "--find-renames",
      PLANNING_COMMIT,
      "--",
      ".",
    ]),
  );
  for (const row of tracked) changed.set(row.path, row);
  const untracked = childProcess
    .execFileSync("git", ["ls-files", "--others", "--exclude-standard", "-z"], {
      cwd: repoRoot,
      encoding: "utf8",
    })
    .split("\0")
    .filter(Boolean);
  for (const repoPath of untracked) {
    if (!changed.has(repoPath))
      changed.set(repoPath, { path: repoPath, status: "A" });
  }
  for (const repoPath of ALL_OUTPUTS) {
    if (!changed.has(repoPath))
      changed.set(repoPath, { path: repoPath, status: "A" });
  }
  const rows = [...changed.values()]
    .map((row) => ({ ...row, declaredScope: classifyScope(row.path) }))
    .sort((a, b) => compareCodePoint(a.path, b.path));
  const countsByStatus = {};
  const countsByScope = {};
  for (const row of rows) {
    const status = row.status[0];
    countsByStatus[status] = (countsByStatus[status] ?? 0) + 1;
    countsByScope[row.declaredScope] =
      (countsByScope[row.declaredScope] ?? 0) + 1;
  }
  const unreconciledPaths = rows
    .filter((row) => row.declaredScope === "unreconciled")
    .map((row) => row.path);
  const lockfile = rows.find((row) => row.path === "pnpm-lock.yaml");
  return {
    schemaVersion: "1.0.0",
    mission: "s182-m05",
    kind: "changed-path-inventory",
    measuredTree: {
      planningCommit: PLANNING_COMMIT,
      derivationHead: closeout.derivationHead,
      operand: "DERIVATION_HEAD plus the explicitly inventoried working tree",
    },
    summary: {
      changedPaths: rows.length,
      countsByStatus: Object.fromEntries(
        Object.entries(countsByStatus).sort(([a], [b]) =>
          compareCodePoint(a, b),
        ),
      ),
      countsByScope: Object.fromEntries(
        Object.entries(countsByScope).sort(([a], [b]) =>
          compareCodePoint(a, b),
        ),
      ),
      unreconciledPaths,
      expectedLockfileMovement: {
        path: "pnpm-lock.yaml",
        present: Boolean(lockfile),
        status: lockfile?.status ?? null,
      },
      preExistingUserChangesAdmitted: false,
    },
    declaredScopeRules: [
      "Sprint-182 product-reality evidence and derived closeout artifacts",
      "M01 truth plane, structured-data regeneration, contracts, and shared styles",
      "M02 React and M03 Vue package foundations plus compatibility carriers",
      "M04 target-aware code generation, callers, tests, package graph, and evidence automation",
      "M05 portable-runtime repair, documentation, refresh integration, closeout automation, and reports",
      "M05 final-gate expectation refreshes and isolated CI runner hygiene",
    ],
    rows,
  };
}

function buildMaintenanceDisposition(closeout) {
  return {
    schemaVersion: "1.0.0",
    mission: "s182-m05",
    kind: "maintenance-disposition",
    derivationHead: closeout.derivationHead,
    source: {
      projectId: "forge",
      table: "next_steps",
      predicate: "id BETWEEN 1315 AND 1322 ORDER BY id",
      governingDecision: 1651,
    },
    summary: {
      selected: MAINTENANCE_ITEMS.length,
      pending: MAINTENANCE_ITEMS.filter((item) => item.status === "pending")
        .length,
      owner: "Forge",
      disposition: "carried-unchanged-not-absorbed",
      absorbedIntoSprint182: 0,
    },
    rows: MAINTENANCE_ITEMS.map((item) => ({
      ...item,
      owner: "Forge",
      disposition: "carried-unchanged-not-absorbed",
    })),
  };
}

function buildRehashPaths(evidenceIndex) {
  const critical = [
    "cmos/foundational-docs/closeout-checklist.md",
    "cmos/planning/forge-s182-foundation-gate-manifest.md",
    "cmos/planning/forge-s182-product-reality-foundation-decision-memo.md",
    "packages/component-contracts/package.json",
    "packages/component-contracts/registry/component-intake.v1.json",
    PATHS.baseline,
    PATHS.reconciliation,
    PATHS.closeout,
    "packages/component-styles/package.json",
    "packages/components-react/package.json",
    PATHS.reactReadiness,
    "packages/components-vue/package.json",
    PATHS.vueReadiness,
    "packages/mcp-server/package.json",
    ".npmrc",
    "pnpm-lock.yaml",
    "pnpm-workspace.yaml",
    "docs/runtime/portable-runtime.md",
    "scripts/runtime/assemble.mjs",
    "scripts/runtime/e2e.mjs",
    "scripts/runtime/manifest.mjs",
    "scripts/runtime/sbom-lite.mjs",
    "scripts/product-reality/generate-s182-m05-closeout.mjs",
    "scripts/product-reality/capture-s182-final-gates.mjs",
    "scripts/product-reality/capture-s182-m05-closeout-row.mjs",
    "scripts/product-reality/generate-s182-m05-gate-record.mjs",
    `${SPRINT_ROOT}/m01/foundation-digests.json`,
    `${SPRINT_ROOT}/m02/final-verified/package-foundations/report.json`,
    `${SPRINT_ROOT}/m02/visual-regression/report.json`,
    `${SPRINT_ROOT}/m03/package-verification/report.json`,
    `${SPRINT_ROOT}/m03/visual-regression/report.json`,
    `${SPRINT_ROOT}/m04/codegen-matrix/report.json`,
    PATHS.m04Ledger,
    `${SPRINT_ROOT}/m04/generated-consumers/report.json`,
    `${SPRINT_ROOT}/m04/generated-consumers/consumers/react/report.json`,
    `${SPRINT_ROOT}/m04/generated-consumers/consumers/vue/report.json`,
    `${SPRINT_ROOT}/m04/report.json`,
    PATHS.claimDiff,
    PATHS.maintenanceDisposition,
  ];
  const receiptsAndStableFinalEvidence = evidenceIndex.files
    .map((file) => file.path)
    .filter(
      (repoPath) =>
        repoPath.endsWith("/receipt.json") ||
        repoPath ===
          `${M05_ROOT}/final-package-verification/package-foundations/report.json`,
    );
  return `${uniqueSorted([...critical, ...receiptsAndStableFinalEvidence]).join("\n")}\n`;
}

function validatePromotionProjection({ closeout, claimDiff }) {
  const baseline = readJson(PATHS.baseline);
  const nucleus = new Set(FROZEN_NUCLEUS);
  const expectedFoundationCells =
    closeout.independentReviewOutcome === "approved" ? 28 : 0;
  assert(
    closeout.rows.length === 109,
    "Closeout capability ledger must preserve all 109 rows",
  );
  assert(
    closeout.approvedRuntimeCensus === null,
    "Closeout may not approve the proposed runtime census",
  );
  assert(
    closeout.proposedRuntimeCensus.runtimeRows === 98 &&
      closeout.proposedRuntimeCensus.nonRuntimeRows === 11,
    "Closeout proposal must remain 98 runtime / 11 non-runtime",
  );
  assert(
    closeout.foundationCells.length === 28,
    "Closeout must contain exactly 14 x 2 target cells",
  );
  assert(
    closeout.summary.foundationV1CandidateCells === 28,
    "Exactly 28 cells must be foundation-v1 candidates",
  );
  assert(
    closeout.summary.foundationV1Cells === expectedFoundationCells,
    `Expected ${expectedFoundationCells} independently reviewed foundation-v1 cells`,
  );
  for (const cell of closeout.foundationCells) {
    assert(
      cell.independentReviewApproved ===
        (closeout.independentReviewOutcome === "approved"),
      `${cell.target}:${cell.componentId} review projection differs from the validated record`,
    );
    assert(
      JSON.stringify(Object.keys(cell.evidence)) ===
        JSON.stringify(FROZEN_FOUNDATION_EVIDENCE_CLASSES),
      `${cell.target}:${cell.componentId} does not carry the exact nine evidence classes`,
    );
    assert(
      cell.evaluation.evidenceComplete === true &&
        cell.evaluation.candidate === true,
      `${cell.target}:${cell.componentId} is not a complete candidate`,
    );
    assert(
      cell.evaluation.foundationV1 ===
        (closeout.independentReviewOutcome === "approved") &&
        cell.evaluation.incomplete.length === 0,
      `${cell.target}:${cell.componentId} differs from the independent-review boundary`,
    );
  }
  for (let index = 0; index < baseline.rows.length; index += 1) {
    if (!nucleus.has(baseline.rows[index].id)) {
      assert(
        JSON.stringify(closeout.rows[index]) ===
          JSON.stringify(baseline.rows[index]),
        `Non-nucleus row ${baseline.rows[index].id} changed from its actual baseline state`,
      );
    }
  }
  assert(
    claimDiff.claims.find(
      (claim) => claim.id === "react-foundation-v1-candidate",
    ).closeout === 14,
    "Claim diff must report 14 React candidates",
  );
  assert(
    claimDiff.claims.find((claim) => claim.id === "vue-foundation-v1-candidate")
      .closeout === 14,
    "Claim diff must report 14 Vue candidates",
  );
  assert(
    claimDiff.claims.find((claim) => claim.id === "foundation-v1").closeout ===
      expectedFoundationCells,
    "Claim diff foundation-v1 total differs from the validated review projection",
  );
}

function validateDocuments(documents) {
  const {
    closeout,
    claimDiff,
    evidenceIndex,
    maintenanceDisposition,
    changedPathInventory,
    rehashPaths,
  } = documents;
  validatePromotionProjection({ closeout, claimDiff });
  assert(
    maintenanceDisposition.rows.length === 8,
    "Maintenance disposition must contain #1315-#1322",
  );
  assert(
    maintenanceDisposition.rows.every(
      (row) =>
        row.status === "pending" &&
        row.schemaVersion === 1 &&
        row.owner === "Forge" &&
        row.disposition === "carried-unchanged-not-absorbed",
    ),
    "Maintenance items must remain pending, Forge-owned, and unabsorbed",
  );
  assert(
    changedPathInventory.summary.unreconciledPaths.length === 0,
    `Unreconciled changed paths: ${changedPathInventory.summary.unreconciledPaths.join(", ")}`,
  );
  assert(
    changedPathInventory.summary.expectedLockfileMovement.present,
    "Expected pnpm-lock.yaml movement is missing from the actual diff",
  );
  const paths = evidenceIndex.files.map((file) => file.path);
  assert(
    paths.length === new Set(paths).size,
    "Evidence index contains duplicate paths",
  );
  assert(
    JSON.stringify(paths) === JSON.stringify([...paths].sort(compareCodePoint)),
    "Evidence index is not deterministically sorted",
  );
  for (const file of evidenceIndex.files) {
    const contents =
      file.path === PATHS.closeout
        ? Buffer.from(canonicalJson(closeout))
        : fs.readFileSync(fullPath(file.path));
    assert(
      contents.byteLength === file.bytes,
      `Evidence byte count mismatch for ${file.path}`,
    );
    assert(
      sha256(contents) === file.sha256,
      `Evidence digest mismatch for ${file.path}`,
    );
  }
  const rehashRows = rehashPaths.trim().split("\n");
  assert(
    rehashRows.length === new Set(rehashRows).size,
    "Rehash path list contains duplicates",
  );
  assert(
    JSON.stringify(rehashRows) ===
      JSON.stringify([...rehashRows].sort(compareCodePoint)),
    "Rehash path list is not sorted",
  );
}

export function buildPromotionProjection(options = {}) {
  const closeout = buildCapabilityCloseout(options);
  const claimDiff = buildClaimDiff(closeout);
  const projection = { closeout, claimDiff };
  validatePromotionProjection(projection);
  return projection;
}

function buildDocuments() {
  const { closeout, claimDiff } = buildPromotionProjection();
  const evidenceIndex = buildEvidenceIndex(closeout);
  const maintenanceDisposition = buildMaintenanceDisposition(closeout);
  const changedPathInventory = buildChangedPathInventory(closeout);
  const rehashPaths = buildRehashPaths(evidenceIndex);
  const documents = {
    closeout,
    claimDiff,
    evidenceIndex,
    maintenanceDisposition,
    changedPathInventory,
    rehashPaths,
  };
  validateDocuments(documents);
  return documents;
}

export function buildPromotionBinding(projection) {
  validatePromotionProjection(projection);
  const approvalRecord = fs.readFileSync(fullPath(PATHS.independentReview));
  const r01CorrectedMutation = fs.readFileSync(
    fullPath(PATHS.r01CorrectedMutation),
  );
  const r01ReplayReport = fs.readFileSync(fullPath(PATHS.r01ReplayReport));
  const mutationReplayReceipt = fs.readFileSync(
    fullPath(PATHS.mutationReplayReceipt),
  );
  const r02Resolution = fs.readFileSync(
    fullPath(PATHS.r02PackageExportResolution),
  );
  const closeout = Buffer.from(canonicalJson(projection.closeout));
  const claimDiff = Buffer.from(canonicalJson(projection.claimDiff));
  assert(
    projection.closeout.independentReviewApproved === true &&
      projection.closeout.summary.foundationV1Cells === 28,
    "Only the approved 28-cell projection can be published as the promotion supersession",
  );
  return {
    schemaVersion: "1.0.0",
    mission: "s183-m06",
    kind: "content-addressed-promotion-supersession",
    status: "bound",
    predicate: "foundation-v1",
    historicalSnapshot: {
      commit: HISTORICAL_CLOSEOUT_COMMIT,
      preservedInPlace: true,
      artifacts: S182_HISTORICAL_INTEGRITY.artifacts.map((artifact) => ({
        ...artifact,
        gitObject: `${HISTORICAL_CLOSEOUT_COMMIT}:${artifact.path}`,
      })),
    },
    promotion: {
      outcome: projection.closeout.independentReviewOutcome,
      foundationV1Cells: projection.closeout.summary.foundationV1Cells,
      inputs: [
        contentAddress(PATHS.independentReview, approvalRecord),
        contentAddress(PATHS.r01CorrectedMutation, r01CorrectedMutation),
        contentAddress(PATHS.r01ReplayReport, r01ReplayReport),
        contentAddress(PATHS.mutationReplayReceipt, mutationReplayReceipt),
        contentAddress(PATHS.r02PackageExportResolution, r02Resolution),
      ],
      projections: [
        {
          ...contentAddress(PATHS.promotionCloseout, closeout),
          supersedesInterpretationOf: PATHS.closeout,
          historicalArtifactRewritten: false,
        },
        {
          ...contentAddress(PATHS.promotionClaimDiff, claimDiff),
          supersedesInterpretationOf: PATHS.claimDiff,
          historicalArtifactRewritten: false,
        },
        {
          ...contentAddress(PATHS.canonicalFoundationV1, closeout),
          mirrors: PATHS.promotionCloseout,
          packageExport:
            "@oods/component-contracts/registry/capabilities/foundation-v1",
          historicalArtifactRewritten: false,
        },
      ],
    },
    discovery: {
      approvedCapabilityProjection: PATHS.promotionCloseout,
      canonicalFoundationV1: PATHS.canonicalFoundationV1,
      packageExport:
        "@oods/component-contracts/registry/capabilities/foundation-v1",
      approvedClaimDiff: PATHS.promotionClaimDiff,
      approvalRecord: PATHS.independentReview,
      r01CorrectedMutation: PATHS.r01CorrectedMutation,
      r01ReplayReport: PATHS.r01ReplayReport,
      mutationReplayReceipt: PATHS.mutationReplayReceipt,
      r02Resolution: PATHS.r02PackageExportResolution,
    },
    integrityRule:
      "The ca8d84bb Sprint 182 snapshot remains byte-exact at its indexed paths; later approval is a separately addressed projection, never an in-place rewrite.",
  };
}

function writePromotionProjection(projection) {
  checkHistoricalIntegrity();
  const binding = buildPromotionBinding(projection);
  const outputValues = {
    [PATHS.promotionCloseout]: canonicalJson(projection.closeout),
    [PATHS.promotionClaimDiff]: canonicalJson(projection.claimDiff),
    [PATHS.canonicalFoundationV1]: canonicalJson(projection.closeout),
    [PATHS.promotionBinding]: canonicalJson(binding),
  };
  for (const [repoPath, contents] of Object.entries(outputValues)) {
    fs.mkdirSync(path.dirname(fullPath(repoPath)), { recursive: true });
    fs.writeFileSync(fullPath(repoPath), contents);
  }
}

function checkPromotionProjection(projection) {
  checkHistoricalIntegrity();
  const binding = buildPromotionBinding(projection);
  const outputValues = {
    [PATHS.promotionCloseout]: canonicalJson(projection.closeout),
    [PATHS.promotionClaimDiff]: canonicalJson(projection.claimDiff),
    [PATHS.canonicalFoundationV1]: canonicalJson(projection.closeout),
    [PATHS.promotionBinding]: canonicalJson(binding),
  };
  for (const [repoPath, expected] of Object.entries(outputValues)) {
    assert(
      fs.existsSync(fullPath(repoPath)),
      `Missing generated promotion projection: ${repoPath}`,
    );
    assert(
      fs.readFileSync(fullPath(repoPath), "utf8") === expected,
      `Generated promotion projection is stale: ${repoPath}`,
    );
  }
}

function writeDocuments(documents) {
  fs.mkdirSync(fullPath(M05_ROOT), { recursive: true });
  const outputValues = {
    [PATHS.closeout]: canonicalJson(documents.closeout),
    [PATHS.claimDiff]: canonicalJson(documents.claimDiff),
    [PATHS.evidenceIndex]: canonicalJson(documents.evidenceIndex),
    [PATHS.maintenanceDisposition]: canonicalJson(
      documents.maintenanceDisposition,
    ),
    [PATHS.changedPathInventory]: canonicalJson(documents.changedPathInventory),
    [PATHS.rehashPaths]: documents.rehashPaths,
  };
  for (const [repoPath, contents] of Object.entries(outputValues)) {
    fs.mkdirSync(path.dirname(fullPath(repoPath)), { recursive: true });
    fs.writeFileSync(fullPath(repoPath), contents);
  }
}

function checkDocuments(documents) {
  const outputValues = {
    [PATHS.closeout]: canonicalJson(documents.closeout),
    [PATHS.claimDiff]: canonicalJson(documents.claimDiff),
    [PATHS.evidenceIndex]: canonicalJson(documents.evidenceIndex),
    [PATHS.maintenanceDisposition]: canonicalJson(
      documents.maintenanceDisposition,
    ),
    [PATHS.changedPathInventory]: canonicalJson(documents.changedPathInventory),
    [PATHS.rehashPaths]: documents.rehashPaths,
  };
  for (const [repoPath, expected] of Object.entries(outputValues)) {
    assert(
      fs.existsSync(fullPath(repoPath)),
      `Missing generated closeout file: ${repoPath}`,
    );
    const actual = fs.readFileSync(fullPath(repoPath), "utf8");
    assert(
      actual === expected,
      `Generated closeout file is stale: ${repoPath}`,
    );
  }
}

export function run(command = "--check") {
  if (command === "--write-promotion") {
    const projection = buildPromotionProjection();
    writePromotionProjection(projection);
    console.log(
      `Wrote separately addressed Sprint 182 independent-review projection: ${projection.closeout.summary.foundationV1Cells} foundation-v1 cells (${projection.closeout.independentReviewOutcome}). The ca8d84bb historical paths remain byte-exact.`,
    );
  } else if (command === "--check-promotion") {
    const projection = buildPromotionProjection();
    checkPromotionProjection(projection);
    console.log(
      `Verified Sprint 182 independent-review projection: ${projection.closeout.summary.foundationV1Cells} foundation-v1 cells (${projection.closeout.independentReviewOutcome}).`,
    );
  } else if (command === "--restore-historical") {
    restoreHistoricalIntegrity();
    console.log(
      `Restored all pinned Sprint 182 historical artifacts to their exact ${HISTORICAL_CLOSEOUT_COMMIT} bytes.`,
    );
  } else if (command === "--write") {
    throw new Error(
      "Sprint 182 closeout history is frozen; use --write-promotion for the separately addressed approval projection.",
    );
  } else if (command === "--check") {
    checkHistoricalIntegrity();
    console.log(
      `Verified the byte-exact ${HISTORICAL_CLOSEOUT_COMMIT} Sprint 182 closeout, claim diff, evidence index, and gate records.`,
    );
  } else {
    throw new Error(
      `Unknown command: ${command}; expected --check-promotion, --write-promotion, --restore-historical, --check, or --write`,
    );
  }
}

const invokedPath = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href
  : null;
if (invokedPath === import.meta.url) run(process.argv[2] ?? "--check");
