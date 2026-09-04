#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  L09_COUNTING_METHOD,
  SPRINT_BASE_SHA,
  buildExpectedCommandMap,
  countL09ReferenceOccurrences,
  expectedExecutionCommands,
  parseVitestCounts,
} from "./generate-s183-m06-gate-record.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const defaultRepositoryRoot = path.resolve(scriptDirectory, "../..");

const SPRINT_ID = "sprint-183";
const MISSION_ID = "s183-m06";
const BUILDER_SESSION_ID = "PS-2026-09-04-007";
const OUTPUT_ROOT = "artifacts/product-reality/sprint-183/m06";
const SPRINT_MISSION_IDS = Object.freeze(
  Array.from({ length: 6 }, (_, index) => `s183-m0${index + 1}`),
);
const S182_L01_ATTRIBUTION_PATH =
  "artifacts/product-reality/sprint-182/m05/l01-suite-attribution.json";
const S182_L01_ATTRIBUTION_SHA256 =
  "e84bc2f8701618386040296ec8e55fb6dc557772e8e6acedfdb5685506e8e70a";
const GATE_ROW_ALIASES = Object.freeze({
  ...Object.fromEntries(
    Array.from({ length: 15 }, (_, index) => {
      const id = `CI-${String(index + 1).padStart(2, "0")}`;
      return [id, [id]];
    }),
  ),
  "CI-12": ["CI-12-setup", "L-07-scale"],
  "CI-14": ["CI-14-setup", "L-07-soak"],
  "L-01": ["L-01-viz-core", "L-01-mcp-server", "L-01-root-core"],
  "L-02": ["L-02"],
  "L-03": ["L-03"],
  "L-04": ["L-04"],
  "L-05": ["L-05"],
  "L-06": ["L-06-diff"],
  "L-07": [
    "L-01-viz-core",
    "L-01-mcp-server",
    "L-01-root-core",
    "L-07-scale",
    "L-07-soak",
  ],
  "L-08": ["L-08-after-governance", "L-08-final"],
  "L-09": ["L-09"],
});

export const OUTPUT_PATHS = Object.freeze({
  missionContracts: `${OUTPUT_ROOT}/mission-contracts.json`,
  claimLedger: `${OUTPUT_ROOT}/claim-ledger.json`,
  claimAudit: `${OUTPUT_ROOT}/claim-audit.json`,
  reviewHandoff: `${OUTPUT_ROOT}/review-handoff.json`,
  evidenceIndex: `${OUTPUT_ROOT}/evidence-index.json`,
});

export const INPUT_PATHS = Object.freeze({
  cmosMissionContractSource: `${OUTPUT_ROOT}/cmos-mission-contract-source.json`,
  focusedReceipt: `${OUTPUT_ROOT}/focused-suite-receipt.json`,
  gateRecord: `${OUTPUT_ROOT}/gate-record.json`,
  mutationReplay: `${OUTPUT_ROOT}/mutation-replay/report.json`,
  r02Resolution: `${OUTPUT_ROOT}/r02-package-export-resolution.json`,
  maintenanceDisposition: `${OUTPUT_ROOT}/maintenance-disposition.json`,
  approvalSource: "scripts/product-reality/independent-review-approval.mjs",
  approvalTest:
    "packages/mcp-server/test/product-reality/independent-review-approval.s183.spec.ts",
  sprint182Approval:
    "artifacts/product-reality/sprint-182/review/independent-review.v1.json",
  sprint182PromotionProjection:
    "artifacts/product-reality/sprint-182/review/foundation-v1-promotion-projection.v1.json",
  sprint182PromotionClaimDiff:
    "artifacts/product-reality/sprint-182/review/foundation-v1-claim-diff.v1.json",
  sprint182PromotionBinding:
    "artifacts/product-reality/sprint-182/review/foundation-v1-promotion-binding.v1.json",
  sprint182CanonicalFoundationV1:
    "packages/component-contracts/registry/component-capability-foundation-v1.s182.v1.json",
  planningMemo: "cmos/planning/forge-s183-runnable-generation-decision-memo.md",
});

export const MISSION_CONTRACTS = Object.freeze([
  {
    missionId: "s183-m01",
    name: "Versioned file-set artifact and exact dependency manifest",
    successCriteria: [
      "The envelope carries schemaVersion, files[], dependency manifest, and content hash, and the JSON Schema for code.generate output is regenerated to match",
      "Every dependency entry names an exact version and its kind; a mutation that emits a versionless or workspace-aliased dependency fails a gate",
      "Re-emitting identical input twice produces byte-identical artifact and per-file hashes; a mutation introducing nondeterministic ordering or a timestamp makes the determinism gate red",
      "Existing consumers are not silently broken: the compatibility disposition is implemented and stated, and pipeline's output path is updated rather than left flattening a multi-file artifact to one string",
      "All 12 public option cells (react/vue x typescript on/off x inline/tailwind/tokens) emit a well-formed artifact",
      "No emitted import resolves to a fictional package, workspace alias, or repository source path",
    ],
  },
  {
    missionId: "s183-m02",
    name: "Typed action protocol — end the blank handler stub",
    successCriteria: [
      "No generated output in any of the 12 option cells contains an empty or TODO-only handler body",
      "Forge-owned bindings produce working behavior provable by interaction in a real consumer, not merely by source inspection",
      "Every domain action appears in the artifact's typed action contract with parameter types, and a consumer that fails to supply one gets a typed failure rather than a silent no-op",
      "React and Vue express the same action contract idiomatically without one framework's gate being lowered",
      "A mutation restoring an empty handler body makes a gate red, and a mutation removing an action from the typed contract while leaving its binding also makes a gate red",
      "The behavior split is documented so a reviewer can tell why a given binding was generated rather than declared",
    ],
  },
  {
    missionId: "s183-m03",
    name: "Draft, build, and release validation profiles",
    successCriteria: [
      "The same input under draft, build, and release produces materially different enforcement, proven by an input that passes draft and is blocked by build",
      "An unresolved import or silent target fallback cannot pass build or release under any option combination",
      "Release cannot pass while any required evidence class is missing, and the response names the missing class",
      "Every response states the profile that ran and what it did not check; a response that omits the disclosure fails a gate",
      "A mutation weakening one profile's enforcement to another's is caught by a discriminating test rather than passing silently",
      "The three profiles are described in the artifact contract so a consumer can tell what a given artifact was actually certified for",
    ],
  },
  {
    missionId: "s183-m04",
    name: "Generalized saved-schema compiler",
    successCriteria: [
      "The genuine compose-7d860337 record, created 2026-03-05, compiles to a complete artifact in both React and Vue",
      "The exit-gate schema is demonstrably pre-existing: its recorded schemaRef and creation date predate this sprint, and the s182-authored same-named fixture is not the subject",
      "All 16 saved schemas are vendored as tracked evidence and reproducible from the repository by a reviewer with no access to the gitignored store",
      "Each of the 16 has a recorded disposition; the roughly 15 typed-gap outcomes are reported as results and are never averaged with compiled outcomes into a single number",
      "A schema node outside the foundation-v1 nucleus produces a typed gap rather than a fallback, placeholder, or silent omission",
      "A mutation that makes an out-of-nucleus node emit a fallback instead of a typed gap turns a gate red",
      "Compilation is deterministic: the same saved schema re-compiled produces byte-identical artifact hashes",
    ],
  },
  {
    missionId: "s183-m05",
    name: "Greenfield consumer proof — the exit gate",
    successCriteria: [
      "The real compose-7d860337 saved schema installs, builds, renders, hydrates, and passes interactions in both a clean React consumer and a clean Vue consumer",
      "The Tabs interaction is proven to work as generated Forge-owned behavior, and the onEdit/onDelete domain actions are proven to reach consumer-supplied implementations",
      "The consumers resolve every dependency from the artifact's declared manifest alone; a missing or versionless manifest entry makes the install fail rather than silently resolving from the workspace",
      "Interaction assertions are shown to be discriminating: removing the generated Tabs behavior, or the injected domain action, makes them red",
      "Isolation holds — no workspace symlink, repository source import, inherited node_modules, or user npm configuration participates",
      "React and Vue meet the same gate; neither framework's bar is lowered to let the sprint close",
      "Any check that could not run is named explicitly rather than omitted from the success statement",
    ],
  },
  {
    missionId: "s183-m06",
    name: "Closeout, review handoff, and named hygiene",
    successCriteria: [
      "Every Sprint-183 claim resolves to evidence that exists and was executed, provable by a mechanical audit of the cited paths",
      "Every archived mutation patch applies cleanly and has been replayed from the artifact, not merely written down",
      "The review approval mechanism is reusable and still prevents self-promotion, proven by a discrimination test in both directions",
      "#1316 and #1317 are fixed and verified; the other six maintenance items are explicitly carried with named status rather than quietly dropped",
      "The s182 R-02 carry is resolved or has a recorded decision explaining why it stands",
      "Sprint 183 is left for a separate reviewer to decide genuine close; the build session records evidence and does not self-certify",
    ],
  },
]);

const EXPECTED_CLAIM_COUNTS = Object.freeze({
  "s183-m01": 6,
  "s183-m02": 6,
  "s183-m03": 6,
  "s183-m04": 7,
  "s183-m05": 7,
  "s183-m06": 6,
});

export const CANONICAL_GATE_ROW_IDS = Object.freeze([
  ...Array.from(
    { length: 15 },
    (_, index) => `CI-${String(index + 1).padStart(2, "0")}`,
  ),
  ...Array.from(
    { length: 9 },
    (_, index) => `L-${String(index + 1).padStart(2, "0")}`,
  ),
]);

export const REQUIRED_FOCUSED_TEST_FILES = Object.freeze([
  "packages/mcp-server/test/product-reality/runnable-artifact.s183.spec.ts",
  "packages/mcp-server/test/product-reality/typed-action-protocol.s183.spec.ts",
  "packages/mcp-server/test/product-reality/validation-profiles.s183.spec.ts",
  "packages/mcp-server/test/product-reality/saved-schema-compiler.s183.spec.ts",
  "packages/mcp-server/test/product-reality/saved-schema-consumers.s183.spec.ts",
  "packages/mcp-server/test/product-reality/independent-review-approval.s183.spec.ts",
  "packages/mcp-server/test/product-reality/s183-m06-replay-r02.spec.ts",
  "packages/mcp-server/test/product-reality/closeout.s183.spec.ts",
  "packages/mcp-server/test/contracts/dtcg-intake.s180.spec.ts",
  "tests/verification/how-forge-works.contract.test.ts",
  "tests/verification/s177-prose-carriers.contract.test.ts",
]);

const REQUIRED_FOCUSED_EXECUTIONS = Object.freeze([
  {
    id: "s183-product-reality",
    testFiles: REQUIRED_FOCUSED_TEST_FILES.slice(0, 8),
  },
  {
    id: "s183-maintenance-wire",
    testFiles: [REQUIRED_FOCUSED_TEST_FILES[8]],
  },
  {
    id: "s183-maintenance-docs",
    testFiles: REQUIRED_FOCUSED_TEST_FILES.slice(9),
  },
]);

export const EXPECTED_REPLAY_CASES = Object.freeze([
  {
    id: "s183-m05-react-tabs-selection-behavior-removed",
    sourceMission: "s183-m05",
    framework: "react",
    kind: "tabs-selection-behavior-removed",
    patchPath:
      "artifacts/product-reality/sprint-183/m05/consumers/react/mutations/tabs-selection-behavior-removed/mutation.patch",
  },
  {
    id: "s183-m05-react-domain-action-handle-edit-inert",
    sourceMission: "s183-m05",
    framework: "react",
    kind: "domain-action-handle-edit-inert",
    patchPath:
      "artifacts/product-reality/sprint-183/m05/consumers/react/mutations/domain-action-handle-edit-inert/mutation.patch",
  },
  {
    id: "s183-m05-vue-tabs-selection-behavior-removed",
    sourceMission: "s183-m05",
    framework: "vue",
    kind: "tabs-selection-behavior-removed",
    patchPath:
      "artifacts/product-reality/sprint-183/m05/consumers/vue/mutations/tabs-selection-behavior-removed/mutation.patch",
  },
  {
    id: "s183-m05-vue-domain-action-handle-edit-inert",
    sourceMission: "s183-m05",
    framework: "vue",
    kind: "domain-action-handle-edit-inert",
    patchPath:
      "artifacts/product-reality/sprint-183/m05/consumers/vue/mutations/domain-action-handle-edit-inert/mutation.patch",
  },
  {
    id: "s182-m01b-brand-b-primary-contrast",
    sourceMission: "s182-m01b",
    framework: "shared-css",
    kind: "brand-b-primary-contrast-override-removed",
    patchPath:
      "artifacts/product-reality/sprint-183/m06/mutation-replay/s182-m01b-brand-b-primary-contrast/mutation.patch",
  },
]);

export const R02_CANONICAL_COMPONENT_IDS = Object.freeze([
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
]);

export const R02_PACKAGE_EVIDENCE = Object.freeze([
  {
    target: "react",
    packageName: "@oods/components-react",
    version: "0.1.0",
    tarballPath:
      "artifacts/product-reality/sprint-183/m05/submitted-packages/tarballs/oods-components-react-0.1.0.tgz",
    tarballSha256:
      "06ff5920586cdaab2719ae98878f616570031edcb67656515c3bca68ddb543ad",
    tarballBytes: 28749,
    declarationSha256:
      "672ff53eeba027cb16c0e618f938096944cf757a86dad16867380cc169c0a594",
    declarationBytes: 2288,
  },
  {
    target: "vue",
    packageName: "@oods/components-vue",
    version: "0.1.0",
    tarballPath:
      "artifacts/product-reality/sprint-183/m05/submitted-packages/tarballs/oods-components-vue-0.1.0.tgz",
    tarballSha256:
      "3600f4ff82b3ac5adafe6384f4b9339e9da4a17beaed799a539982bc9fdcdbf3",
    tarballBytes: 17672,
    declarationSha256:
      "3305b40ba2bf04f2190fb9d4f24c0ea98e0704c976e3a12426020cc19713699a",
    declarationBytes: 24554,
  },
]);

export const EVIDENCE_PATHS = Object.freeze({
  runnableTest:
    "packages/mcp-server/test/product-reality/runnable-artifact.s183.spec.ts",
  envelopeSource: "packages/mcp-server/src/codegen/artifact-envelope.ts",
  envelopeTest: "packages/mcp-server/src/codegen/artifact-envelope.test.ts",
  outputSchema: "packages/mcp-server/src/schemas/code.generate.output.json",
  pipelineTest: "packages/mcp-server/src/tools/__tests__/pipeline.test.ts",
  pipelineSchema: "packages/mcp-server/src/schemas/pipeline.output.json",
  actionTest:
    "packages/mcp-server/test/product-reality/typed-action-protocol.s183.spec.ts",
  actionSource: "packages/mcp-server/src/codegen/action-protocol.ts",
  actionDocs: "docs/mcp/Typed-Action-Protocol.md",
  profileTest:
    "packages/mcp-server/test/product-reality/validation-profiles.s183.spec.ts",
  profileSource: "packages/mcp-server/src/codegen/validation-profile.ts",
  profileDocs: "docs/api/code-generate.md",
  compilerTest:
    "packages/mcp-server/test/product-reality/saved-schema-compiler.s183.spec.ts",
  compilerSource: "scripts/product-reality/s183-m04-saved-schema-corpus.ts",
  compilationReport:
    "artifacts/product-reality/sprint-183/m04/compilation-report.json",
  corpusManifest:
    "artifacts/product-reality/sprint-183/m04/corpus-manifest.json",
  corpusIndex:
    "artifacts/product-reality/sprint-183/m04/saved-schema-store/_index.json",
  savedSubject:
    "artifacts/product-reality/sprint-183/m04/saved-schema-store/tier1-acceptance-sub-detail.json",
  reactArtifact:
    "artifacts/product-reality/sprint-183/m04/compiled/tier1-acceptance-sub-detail/react.artifact.json",
  vueArtifact:
    "artifacts/product-reality/sprint-183/m04/compiled/tier1-acceptance-sub-detail/vue.artifact.json",
  breadthRanking:
    "artifacts/product-reality/sprint-183/m04/breadth-unblock-ranking.json",
  consumerTest:
    "packages/mcp-server/test/product-reality/saved-schema-consumers.s183.spec.ts",
  consumerHarness:
    "scripts/product-reality/s183-m05-saved-schema-consumers.mjs",
  consumerReport: "artifacts/product-reality/sprint-183/m05/report.json",
  reactConsumerReport:
    "artifacts/product-reality/sprint-183/m05/consumers/react/report.json",
  vueConsumerReport:
    "artifacts/product-reality/sprint-183/m05/consumers/vue/report.json",
  reactDependencyPlan:
    "artifacts/product-reality/sprint-183/m05/consumers/react/dependency-plan.json",
  vueDependencyPlan:
    "artifacts/product-reality/sprint-183/m05/consumers/vue/dependency-plan.json",
  reactTabsMutation:
    "artifacts/product-reality/sprint-183/m05/consumers/react/mutations/tabs-selection-behavior-removed/report.json",
  reactActionMutation:
    "artifacts/product-reality/sprint-183/m05/consumers/react/mutations/domain-action-handle-edit-inert/report.json",
  vueTabsMutation:
    "artifacts/product-reality/sprint-183/m05/consumers/vue/mutations/tabs-selection-behavior-removed/report.json",
  vueActionMutation:
    "artifacts/product-reality/sprint-183/m05/consumers/vue/mutations/domain-action-handle-edit-inert/report.json",
  packageInventory:
    "artifacts/product-reality/sprint-183/m05/submitted-packages/inventory.json",
  replayTest:
    "packages/mcp-server/test/product-reality/s183-m06-replay-r02.spec.ts",
  componentContractsPackage: "packages/component-contracts/package.json",
  maintenanceSource: "packages/mcp-server/src/lib/dtcg-intake/index.ts",
  maintenanceTest:
    "packages/mcp-server/test/contracts/dtcg-intake.s180.spec.ts",
  rosterDoc: "docs/how-forge-works.html",
  rosterTest: "tests/verification/how-forge-works.contract.test.ts",
  proseTest: "tests/verification/s177-prose-carriers.contract.test.ts",
  closeoutGenerator: "scripts/product-reality/generate-s183-m06-closeout.mjs",
  gateGenerator: "scripts/product-reality/generate-s183-m06-gate-record.mjs",
  closeoutTest:
    "packages/mcp-server/test/product-reality/closeout.s183.spec.ts",
});

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export function canonicalJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function sha256(contents) {
  return crypto.createHash("sha256").update(contents).digest("hex");
}

function stripShaPrefix(value) {
  return value.startsWith("sha256:") ? value.slice("sha256:".length) : value;
}

function compareCodePoint(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

export function resolveRepositoryPath(repositoryRoot, repositoryPath) {
  assert(
    typeof repositoryPath === "string" && repositoryPath.length > 0,
    "Evidence path must be a non-empty string.",
  );
  assert(
    !path.isAbsolute(repositoryPath),
    `Evidence path is absolute: ${repositoryPath}`,
  );
  const normalized = repositoryPath.split(path.sep).join("/");
  assert(
    normalized === path.posix.normalize(normalized) &&
      normalized !== ".." &&
      !normalized.startsWith("../"),
    `Evidence path escapes the repository: ${repositoryPath}`,
  );
  const absolutePath = path.resolve(repositoryRoot, normalized);
  const relative = path.relative(repositoryRoot, absolutePath);
  assert(
    relative !== ".." && !relative.startsWith(`..${path.sep}`),
    `Evidence path escapes the repository: ${repositoryPath}`,
  );
  return absolutePath;
}

export function verifyEvidenceReference({
  repositoryRoot,
  reference,
  virtualFiles = new Map(),
}) {
  assert(
    reference && typeof reference === "object",
    "Evidence reference is required.",
  );
  assert(
    /^[0-9a-f]{64}$/.test(reference.sha256 ?? ""),
    `Evidence reference has no exact sha256: ${reference.path ?? "<unknown>"}`,
  );
  const virtual = virtualFiles.get(reference.path);
  let contents;
  if (virtual !== undefined) {
    contents = Buffer.from(virtual);
  } else {
    const absolutePath = resolveRepositoryPath(repositoryRoot, reference.path);
    assert(
      fs.existsSync(absolutePath),
      `Cited evidence path is missing: ${reference.path}`,
    );
    assert(
      fs.statSync(absolutePath).isFile(),
      `Cited evidence path is not a file: ${reference.path}`,
    );
    contents = fs.readFileSync(absolutePath);
  }
  const actual = sha256(contents);
  assert(
    actual === reference.sha256,
    `Cited evidence hash mismatch for ${reference.path}: expected ${reference.sha256}, received ${actual}`,
  );
  return { path: reference.path, bytes: contents.byteLength, sha256: actual };
}

function readRepositoryFile(repositoryRoot, repositoryPath) {
  const absolutePath = resolveRepositoryPath(repositoryRoot, repositoryPath);
  assert(
    fs.existsSync(absolutePath),
    `Required evidence path is missing: ${repositoryPath}`,
  );
  assert(
    fs.statSync(absolutePath).isFile(),
    `Required evidence path is not a file: ${repositoryPath}`,
  );
  return fs.readFileSync(absolutePath);
}

function readJson(repositoryRoot, repositoryPath) {
  const contents = readRepositoryFile(repositoryRoot, repositoryPath);
  try {
    return JSON.parse(contents.toString("utf8"));
  } catch (error) {
    throw new Error(`Required evidence is not valid JSON: ${repositoryPath}`, {
      cause: error,
    });
  }
}

function makeReference(
  repositoryRoot,
  repositoryPath,
  virtualFiles = new Map(),
) {
  const contents = virtualFiles.has(repositoryPath)
    ? Buffer.from(virtualFiles.get(repositoryPath))
    : readRepositoryFile(repositoryRoot, repositoryPath);
  return {
    path: repositoryPath,
    bytes: contents.byteLength,
    sha256: sha256(contents),
  };
}

function validateCountedPass(record, label, expectedSelected) {
  assert(record.status === "passed", `${label} status must be passed.`);
  assert(
    record.selected === expectedSelected,
    `${label} selected must be ${expectedSelected}.`,
  );
  assert(
    record.passed === expectedSelected,
    `${label} passed must be ${expectedSelected}.`,
  );
  assert(record.failed === 0, `${label} failed must be zero.`);
  assert(record.skipped === 0, `${label} skipped must be zero.`);
}

function validateCmosMissionContractSource(record) {
  assert(
    record.kind === "cmos-mission-contract-export",
    "CMOS mission contract export kind drifted.",
  );
  assert(
    record.sprintId === SPRINT_ID,
    "CMOS mission contract sprint drifted.",
  );
  assert(
    record.source?.tool === "cmos_mission" &&
      record.source?.action === "show" &&
      record.source?.projectId === "forge",
    "CMOS mission contract source provenance drifted.",
  );
  assert(
    record.missionCount === 6,
    "CMOS mission export must contain six missions.",
  );
  assert(
    record.successCriterionCount === 38,
    "CMOS mission export must contain 38 success criteria.",
  );
  assert(
    Array.isArray(record.missions) && record.missions.length === 6,
    "CMOS mission export mission array drifted.",
  );
  const normalized = record.missions.map((mission) => {
    assert(mission.sprintId === SPRINT_ID, `${mission.id} sprint drifted.`);
    assert(mission.projectId === "forge", `${mission.id} project drifted.`);
    return {
      missionId: mission.id,
      name: mission.name,
      successCriteria: mission.successCriteria,
    };
  });
  assert(
    JSON.stringify(normalized) === JSON.stringify(MISSION_CONTRACTS),
    "Embedded mission IDs, names, or success criteria drifted from the independent CMOS export.",
  );
  assert(
    record.missions
      .slice(0, 5)
      .every((mission) => mission.statusAtCapture === "Completed") &&
      record.missions[5]?.statusAtCapture === "In Progress",
    "CMOS mission statuses do not describe the M06 build-session handoff point.",
  );
}

function validateFocusedReceipt(receipt, reviewHead, repositoryRoot) {
  assert(
    ["sprint-focused-suite-receipt", "focused-test-suite-receipt"].includes(
      receipt.kind,
    ),
    "Focused receipt kind is not recognized.",
  );
  assert(
    receipt.missionId === MISSION_ID,
    `Focused receipt missionId must be ${MISSION_ID}.`,
  );
  assert(
    receipt.reviewHead === reviewHead,
    "Focused receipt reviewHead drifted.",
  );
  assert(receipt.status === "passed", "Focused receipt must pass.");
  assert(receipt.exitCode === 0, "Focused receipt exitCode must be zero.");
  assert(
    Number.isInteger(receipt.selected) && receipt.selected > 0,
    "Focused receipt selected must be positive.",
  );
  assert(
    receipt.passed === receipt.selected,
    "Focused receipt must pass every selected test.",
  );
  assert(receipt.failed === 0, "Focused receipt failed must be zero.");
  assert(receipt.skipped === 0, "Focused receipt skipped must be zero.");
  assert(
    typeof receipt.command === "string" && receipt.command.length > 0,
    "Focused receipt must name its command.",
  );
  assert(
    JSON.stringify(receipt.testFiles) ===
      JSON.stringify(REQUIRED_FOCUSED_TEST_FILES),
    "Focused receipt testFiles must match the exact 11-file scope.",
  );
  assert(
    receipt.measuredHead === reviewHead,
    "Focused receipt measuredHead drifted.",
  );
  assert(
    receipt.operand?.detachedHead === true &&
      receipt.operand?.cleanBefore === true &&
      receipt.operand?.cleanAfter === true,
    "Focused receipt was not captured from one clean detached review operand.",
  );
  assert(
    receipt.selectedExecutionCount === 3 && receipt.executedCount === 3,
    "Focused receipt must execute all three named groups.",
  );
  assert(
    receipt.failedCount === 0 && receipt.skippedExecutionCount === 0,
    "Focused receipt has a failed or skipped execution group.",
  );
  assert(
    Array.isArray(receipt.executions) && receipt.executions.length === 3,
    "Focused receipt must retain three execution records.",
  );
  for (const [index, expected] of REQUIRED_FOCUSED_EXECUTIONS.entries()) {
    const execution = receipt.executions[index];
    assert(
      execution.id === expected.id,
      `Focused execution ${index} ID drifted.`,
    );
    assert(
      JSON.stringify(execution.testFiles) ===
        JSON.stringify(expected.testFiles),
      `Focused execution ${execution.id} testFiles drifted.`,
    );
    assert(
      typeof execution.literalCommand === "string" &&
        execution.literalCommand.length > 0,
      `Focused execution ${execution.id} has no literal command.`,
    );
    assert(
      Number.isInteger(execution.selected) &&
        execution.selected > 0 &&
        execution.exitCode === 0 &&
        execution.failed === 0 &&
        execution.skipped === 0 &&
        execution.passed === execution.selected,
      `Focused execution ${execution.id} did not pass exactly.`,
    );
  }
  const executionCounts = receipt.executions.reduce(
    (totals, execution) => ({
      selected: totals.selected + execution.selected,
      passed: totals.passed + execution.passed,
      failed: totals.failed + execution.failed,
      skipped: totals.skipped + execution.skipped,
    }),
    { selected: 0, passed: 0, failed: 0, skipped: 0 },
  );
  assert(
    JSON.stringify(executionCounts) ===
      JSON.stringify({
        selected: receipt.selected,
        passed: receipt.passed,
        failed: receipt.failed,
        skipped: receipt.skipped,
      }),
    "Focused receipt aggregate counts do not equal its execution records.",
  );
  verifyGateEvidenceReference(repositoryRoot, receipt.log, "Focused suite log");
  return [receipt.log];
}

function verifyGateEvidenceReference(repositoryRoot, reference, label) {
  assert(
    reference && typeof reference === "object",
    `${label} reference is missing.`,
  );
  const verified = verifyEvidenceReference({
    repositoryRoot,
    reference: { path: reference.path, sha256: reference.sha256 },
  });
  if (reference.bytes !== undefined) {
    assert(reference.bytes === verified.bytes, `${label} byte count drifted.`);
  }
}

function validateCanonicalTimestamp(value, label) {
  assert(typeof value === "string", `${label} must be an ISO timestamp.`);
  const date = new Date(value);
  assert(
    !Number.isNaN(date.valueOf()) && date.toISOString() === value,
    `${label} must use canonical UTC ISO form.`,
  );
  return date.valueOf();
}

function isNamedParkedSoakFailure(contents) {
  const text = contents
    .toString("utf8")
    .replace(/\u001b\[[0-?]*[ -/]*[@-~]/g, "");
  return (
    /echarts-render-soak\.s179\.spec\.ts:283(?::\d+)?/.test(text) &&
    /positiveTrendLower99/.test(text) &&
    /Test Files\s+1 failed/.test(text) &&
    /Tests\s+1 failed\s*\|\s*2 passed\s*\(3\)/.test(text)
  );
}

function validateSuiteCounts(counts, label, allowNegative = false) {
  assert(
    counts &&
      typeof counts === "object" &&
      JSON.stringify(Object.keys(counts).sort(compareCodePoint)) ===
        JSON.stringify(["files", "tests"]),
    `${label} must contain exactly files and tests.`,
  );
  for (const group of ["files", "tests"]) {
    const values = counts[group];
    assert(
      values &&
        typeof values === "object" &&
        JSON.stringify(Object.keys(values).sort(compareCodePoint)) ===
          JSON.stringify(["failed", "passed", "skipped", "todo", "total"]),
      `${label}.${group} field set drifted.`,
    );
    for (const field of ["failed", "passed", "skipped", "todo", "total"]) {
      assert(
        Number.isInteger(values[field]) &&
          (allowNegative || values[field] >= 0),
        `${label}.${group}.${field} is invalid.`,
      );
    }
    if (!allowNegative) {
      assert(
        values.passed + values.failed + values.skipped + values.todo ===
          values.total,
        `${label}.${group} counts do not reconcile.`,
      );
    }
  }
}

function readVerifiedJsonReference(repositoryRoot, reference, label) {
  verifyGateEvidenceReference(repositoryRoot, reference, label);
  return readJson(repositoryRoot, reference.path);
}

function validateL01Attribution(
  repositoryRoot,
  attributionReference,
  record,
  captures,
) {
  assert(
    attributionReference?.path === `${OUTPUT_ROOT}/l01-suite-attribution.json`,
    "L-01 attribution path is not canonical.",
  );
  const payload = readVerifiedJsonReference(
    repositoryRoot,
    attributionReference,
    "L-01 suite attribution",
  );
  assert(
    payload.schemaVersion === "1.0.0" &&
      payload.missionId === MISSION_ID &&
      payload.rowId === "L-01" &&
      payload.baseSha === SPRINT_BASE_SHA &&
      payload.reviewHead === record.reviewHead &&
      payload.status === "pass",
    "L-01 attribution provenance or status drifted.",
  );
  const aliases = ["L-01-viz-core", "L-01-mcp-server", "L-01-root-core"];
  const reviewedAt = validateCanonicalTimestamp(
    payload.reviewedAt,
    "L-01 attribution reviewedAt",
  );
  assert(
    reviewedAt >=
      Math.max(...aliases.map((alias) => captures.get(alias).endedMs)),
    "L-01 attribution predates a source suite.",
  );
  const suiteCounts = Object.fromEntries(
    aliases.map((alias) => [
      alias,
      parseVitestCounts(
        readRepositoryFile(repositoryRoot, captures.get(alias).log.path),
        alias,
      ),
    ]),
  );
  const expectedSources = aliases.map((alias) => {
    const capture = captures.get(alias);
    return {
      evidenceId: capture.evidenceId,
      result: capture.result,
      log: capture.log,
      counts: suiteCounts[alias],
    };
  });
  assert(
    JSON.stringify(payload.sourceExecutions) ===
      JSON.stringify(expectedSources),
    "L-01 attribution source executions are not exact.",
  );
  assert(
    payload.baselineSource?.path === S182_L01_ATTRIBUTION_PATH &&
      payload.baselineSource?.sha256 === S182_L01_ATTRIBUTION_SHA256,
    "L-01 frozen baseline reference drifted.",
  );
  verifyGateEvidenceReference(
    repositoryRoot,
    payload.baselineSource,
    "L-01 frozen baseline",
  );
  const frozen = readJson(repositoryRoot, S182_L01_ATTRIBUTION_PATH);
  const frozenCounts = Object.fromEntries(
    frozen.suiteComparisons.map((comparison) => [
      comparison.suite,
      comparison.current,
    ]),
  );
  const suites = ["viz-core", "mcp-server", "root-core"];
  assert(
    JSON.stringify(payload.suiteComparisons?.map(({ suite }) => suite)) ===
      JSON.stringify(suites),
    "L-01 suite comparison set drifted.",
  );
  payload.suiteComparisons.forEach((comparison, index) => {
    const current = suiteCounts[aliases[index]];
    const baseline = frozenCounts[comparison.suite];
    assert(
      JSON.stringify(comparison.current) === JSON.stringify(current) &&
        JSON.stringify(comparison.baseline) === JSON.stringify(baseline),
      `L-01 ${comparison.suite} current or baseline counts drifted.`,
    );
    validateSuiteCounts(current, `L-01 ${comparison.suite} current`);
    validateSuiteCounts(baseline, `L-01 ${comparison.suite} baseline`);
    const delta = Object.fromEntries(
      ["files", "tests"].map((group) => [
        group,
        Object.fromEntries(
          ["passed", "failed", "skipped", "todo", "total"].map((field) => [
            field,
            current[group][field] - baseline[group][field],
          ]),
        ),
      ]),
    );
    validateSuiteCounts(
      comparison.delta,
      `L-01 ${comparison.suite} delta`,
      true,
    );
    assert(
      JSON.stringify(comparison.delta) === JSON.stringify(delta),
      `L-01 ${comparison.suite} delta arithmetic drifted.`,
    );
    assert(
      delta.files.skipped === 0 &&
        delta.files.todo === 0 &&
        delta.tests.skipped === 0 &&
        delta.tests.todo === 0,
      `L-01 ${comparison.suite} introduced skip/todo work.`,
    );
    assert(
      Array.isArray(comparison.ownerMissionIds) &&
        comparison.ownerMissionIds.length > 0 &&
        new Set(comparison.ownerMissionIds).size ===
          comparison.ownerMissionIds.length &&
        comparison.ownerMissionIds.every((missionId) =>
          SPRINT_MISSION_IDS.includes(missionId),
        ) &&
        typeof comparison.disposition === "string" &&
        comparison.disposition.length > 0,
      `L-01 ${comparison.suite} ownership attribution drifted.`,
    );
  });
  assert(
    JSON.stringify(
      [
        ...new Set(
          payload.suiteComparisons.flatMap(
            (comparison) => comparison.ownerMissionIds,
          ),
        ),
      ].sort(compareCodePoint),
    ) === JSON.stringify(SPRINT_MISSION_IDS),
    "L-01 suite ownership does not cover all six missions.",
  );
  assert(
    JSON.stringify(
      payload.missionAttributions?.map(({ missionId }) => missionId),
    ) === JSON.stringify(SPRINT_MISSION_IDS) &&
      payload.missionAttributions.every(
        ({ disposition, evidence }) =>
          typeof disposition === "string" &&
          disposition.length > 0 &&
          Array.isArray(evidence) &&
          evidence.length > 0,
      ),
    "L-01 mission attribution set is incomplete.",
  );
  payload.missionAttributions.forEach(({ missionId, evidence }) =>
    evidence.forEach((reference, index) =>
      verifyGateEvidenceReference(
        repositoryRoot,
        reference,
        `L-01 ${missionId} evidence ${index}`,
      ),
    ),
  );
  assert(
    Array.isArray(payload.unattributedDeltas) &&
      payload.unattributedDeltas.length === 0,
    "L-01 retains unattributed deltas.",
  );
  return { payload, reviewedAt };
}

function validateL09Inspection(
  repositoryRoot,
  inspectionReference,
  record,
  capture,
  attributionReference,
) {
  assert(
    inspectionReference?.path === `${OUTPUT_ROOT}/l09-review.json`,
    "L-09 review path is not canonical.",
  );
  const payload = readVerifiedJsonReference(
    repositoryRoot,
    inspectionReference,
    "L-09 builder inspection",
  );
  assert(
    payload.schemaVersion === "1.0.0" &&
      payload.missionId === MISSION_ID &&
      payload.rowId === "L-09" &&
      payload.baseSha === SPRINT_BASE_SHA &&
      payload.reviewHead === record.reviewHead &&
      payload.status === "pass",
    "L-09 review provenance or status drifted.",
  );
  assert(
    payload.builderSelfCertified === false &&
      payload.separateReviewRequired === true &&
      payload.reviewerKind === "builder-closeout-inspection",
    "L-09 review independence disclosure drifted.",
  );
  assert(
    validateCanonicalTimestamp(payload.reviewedAt, "L-09 reviewedAt") >=
      capture.endedMs,
    "L-09 review predates its scan.",
  );
  assert(
    JSON.stringify(payload.sourceExecution) ===
      JSON.stringify({
        evidenceId: capture.evidenceId,
        result: capture.result,
        log: capture.log,
      }),
    "L-09 review source execution drifted.",
  );
  assert(
    JSON.stringify(payload.countingMethod) ===
      JSON.stringify(L09_COUNTING_METHOD),
    "L-09 counting method drifted.",
  );
  const classifications = payload.referenceClassifications;
  const categories = [
    "historical",
    "measuredAt",
    "retainedConstraint",
    "sr22Violations",
    "testLabel",
  ];
  assert(
    classifications &&
      categories.every(
        (category) =>
          Number.isInteger(classifications[category]) &&
          classifications[category] >= 0,
      ) &&
      classifications.sr22Violations === 0 &&
      classifications.total ===
        categories.reduce(
          (total, category) => total + classifications[category],
          0,
        ),
    "L-09 classification totals drifted.",
  );
  assert(
    classifications.total ===
      countL09ReferenceOccurrences(
        readRepositoryFile(repositoryRoot, capture.log.path),
      ),
    "L-09 classified population differs from its exact diff.",
  );
  assert(
    Array.isArray(payload.unclassifiedReferences) &&
      payload.unclassifiedReferences.length === 0 &&
      Array.isArray(payload.forwardSprintNumberedPromises) &&
      payload.forwardSprintNumberedPromises.length === 0,
    "L-09 retains unclassified or forward references.",
  );
  assert(
    JSON.stringify(payload.suiteAttribution) ===
      JSON.stringify({
        path: attributionReference.path,
        bytes: attributionReference.bytes,
        sha256: attributionReference.sha256,
      }),
    "L-09 suite attribution binding drifted.",
  );
  return payload;
}

function validateGateRecord(record, reviewHead, repositoryRoot) {
  const citedReferences = [];
  assert(
    record.kind === "sprint-closeout-gate-record",
    "Gate record kind drifted.",
  );
  assert(
    record.missionId === MISSION_ID,
    `Gate record missionId must be ${MISSION_ID}.`,
  );
  assert(record.reviewHead === reviewHead, "Gate record reviewHead drifted.");
  assert(
    record.baseSha === SPRINT_BASE_SHA,
    `Gate record baseSha must be ${SPRINT_BASE_SHA}.`,
  );
  assert(
    record.builderSelfCertified === false,
    "Gate record cannot self-certify the builder.",
  );
  assert(
    record.separateReviewRequired === true,
    "Gate record must require separate review.",
  );
  assert(
    record.canonicalRowCount === 24,
    "Gate record must contain 24 canonical rows.",
  );
  assert(Array.isArray(record.rows), "Gate record rows are required.");
  const ids = record.rows.map((row) => row.id);
  assert(
    new Set(ids).size === ids.length,
    "Gate record row IDs are not unique.",
  );
  assert(
    JSON.stringify(ids) === JSON.stringify(CANONICAL_GATE_ROW_IDS),
    "Gate record row IDs or order drifted from CI-01..CI-15 + L-01..L-09.",
  );
  assert(
    JSON.stringify(record.canonicalRowIds) ===
      JSON.stringify(CANONICAL_GATE_ROW_IDS),
    "Gate record canonicalRowIds drifted.",
  );
  const rehashPaths = readRepositoryFile(
    repositoryRoot,
    `${OUTPUT_ROOT}/rehash-paths.txt`,
  )
    .toString("utf8")
    .trimEnd()
    .split("\n")
    .filter(Boolean);
  const expectedCommands = buildExpectedCommandMap({
    baseSha: SPRINT_BASE_SHA,
    reviewHead,
    rehashPaths,
  });
  const aliasesByRow = Object.fromEntries(
    Object.entries(GATE_ROW_ALIASES).map(([rowId, aliases]) => [
      rowId,
      [...aliases],
    ]),
  );
  const advertisedMovers =
    record.rows.find(({ id }) => id === "L-06")?.observations
      ?.advertisedMovers ?? [];
  assert(Array.isArray(advertisedMovers), "L-06 advertisedMovers is invalid.");
  if (advertisedMovers.length > 0) {
    aliasesByRow["L-06"] = ["L-06-diff", "L-06-rebuild"];
  }
  const captures = new Map();
  for (const row of record.rows) {
    assert(
      typeof row.status === "string" && row.status.length > 0,
      `${row.id} has no explicit status.`,
    );
    if (row.id === "CI-10") {
      assert(
        row.status === "structurally-non-local",
        "CI-10 must be disclosed as structurally non-local.",
      );
      assert(
        Array.isArray(row.disclosures) && row.disclosures.length > 0,
        "CI-10 requires a disclosure.",
      );
    } else if (row.id === "CI-14") {
      assert(
        row.status === "parked-disclosed",
        `${row.id} must retain the named parked disclosure.`,
      );
      assert(
        Array.isArray(row.disclosures) && row.disclosures.length > 0,
        `${row.id} requires a disclosure.`,
      );
    } else {
      assert(row.status === "pass", `${row.id} status must be pass.`);
    }
    assert(
      Array.isArray(row.executions) && row.executions.length > 0,
      `${row.id} has no captured execution.`,
    );
    assert(
      JSON.stringify(row.evidenceAliases) ===
        JSON.stringify(aliasesByRow[row.id]) &&
        JSON.stringify(row.executions.map(({ alias }) => alias)) ===
          JSON.stringify(aliasesByRow[row.id]),
      `${row.id} execution aliases drifted.`,
    );
    for (const execution of row.executions) {
      const parked =
        execution.alias === "L-07-soak" &&
        execution.status === "parked-failure";
      assert(
        execution.status === "pass" || parked,
        `${row.id}/${execution.alias} has invalid status ${execution.status}.`,
      );
      assert(
        execution.exitCode === 0 || parked,
        `${row.id}/${execution.alias} has an undisclosed non-zero exit.`,
      );
      assert(
        Number.isInteger(execution.exitCode) &&
          (!parked || execution.exitCode !== 0),
        `${row.id}/${execution.alias} exit code is invalid.`,
      );
      if (execution.alias !== "L-04") {
        assert(
          execution.measuredHead === reviewHead,
          `${row.id}/${execution.alias} was not measured at reviewHead.`,
        );
      }
      assert(
        JSON.stringify(execution.literalCommands) ===
          JSON.stringify(expectedCommands.get(execution.alias)),
        `${row.id}/${execution.alias} commands differ from the locked carrier.`,
      );
      const expectedExecution = expectedExecutionCommands(
        execution.alias,
        execution.literalCommands,
      );
      assert(
        execution.literalCommand === execution.literalCommands.join(" && ") &&
          JSON.stringify(execution.executionCommands) ===
            JSON.stringify(expectedExecution) &&
          execution.executedCommand ===
            execution.executionCommands.join(" && "),
        `${row.id}/${execution.alias} command attestation drifted.`,
      );
      const startedMs = validateCanonicalTimestamp(
        execution.startedAt,
        `${row.id}/${execution.alias} startedAt`,
      );
      const endedMs = validateCanonicalTimestamp(
        execution.endedAt,
        `${row.id}/${execution.alias} endedAt`,
      );
      assert(endedMs >= startedMs, `${row.id}/${execution.alias} ended early.`);
      assert(
        execution.evidenceId === `s183-m06-${execution.alias.toLowerCase()}` &&
          execution.result?.path ===
            `${OUTPUT_ROOT}/gate-results/${execution.alias.toLowerCase()}.json` &&
          execution.log?.path ===
            `${OUTPUT_ROOT}/logs/s183-m06-${execution.alias.toLowerCase()}.log`,
        `${row.id}/${execution.alias} evidence paths are not canonical.`,
      );
      verifyGateEvidenceReference(
        repositoryRoot,
        execution.result,
        `${row.id}/${execution.alias} result`,
      );
      verifyGateEvidenceReference(
        repositoryRoot,
        execution.log,
        `${row.id}/${execution.alias} log`,
      );
      citedReferences.push(execution.result, execution.log);
      if (parked) {
        assert(
          isNamedParkedSoakFailure(
            readRepositoryFile(repositoryRoot, execution.log.path),
          ),
          "L-07-soak parked result is not the named statistical-floor failure.",
        );
      }
      for (const [index, sideEffect] of (
        execution.sideEffects ?? []
      ).entries()) {
        const sideEffectReference = {
          path: sideEffect.capturedPath,
          sha256: sideEffect.sha256,
          bytes: sideEffect.bytes,
        };
        verifyGateEvidenceReference(
          repositoryRoot,
          sideEffectReference,
          `${row.id}/${execution.alias} side effect ${index}`,
        );
        citedReferences.push(sideEffectReference);
      }
      const normalizedExecution = { ...execution, startedMs, endedMs };
      if (captures.has(execution.alias)) {
        const prior = captures.get(execution.alias);
        assert(
          JSON.stringify({
            ...prior,
            startedMs: undefined,
            endedMs: undefined,
          }) ===
            JSON.stringify({
              ...normalizedExecution,
              startedMs: undefined,
              endedMs: undefined,
            }),
          `${execution.alias} reused execution differs across rows.`,
        );
      } else {
        captures.set(execution.alias, normalizedExecution);
      }
    }
  }
  const statuses = record.rows.reduce((counts, row) => {
    counts[row.status] = (counts[row.status] ?? 0) + 1;
    return counts;
  }, {});
  assert(
    JSON.stringify(statuses) === JSON.stringify(record.resultSummary),
    "Gate resultSummary does not match its rows.",
  );
  const reconnect = record.rows.find((row) => row.id === "L-06")?.observations
    ?.reconnect;
  if (reconnect) {
    verifyGateEvidenceReference(repositoryRoot, reconnect, "L-06 reconnect");
    citedReferences.push(reconnect);
  }
  const suiteAttribution = record.rows.find((row) => row.id === "L-01")
    ?.observations?.attribution;
  const suiteAttributionReview = validateL01Attribution(
    repositoryRoot,
    suiteAttribution,
    record,
    captures,
  );
  citedReferences.push(suiteAttribution);
  if (suiteAttribution?.baseline) {
    verifyGateEvidenceReference(
      repositoryRoot,
      suiteAttribution.baseline,
      "L-01 frozen baseline",
    );
    citedReferences.push(suiteAttribution.baseline);
  }
  const builderInspection = record.rows.find((row) => row.id === "L-09")
    ?.observations?.builderInspection;
  const l09Payload = validateL09Inspection(
    repositoryRoot,
    builderInspection,
    record,
    captures.get("L-09"),
    suiteAttribution,
  );
  citedReferences.push(builderInspection);
  assert(
    l09Payload.builderSelfCertified === false,
    "L-09 builder inspection self-certified.",
  );
  assert(
    l09Payload.separateReviewRequired === true,
    "L-09 builder inspection omitted separate review.",
  );
  assert(
    captures.get("L-09").startedMs >= suiteAttributionReview.reviewedAt &&
      captures.get("L-09").startedMs >= captures.get("L-03").endedMs &&
      captures.get("L-08-final").startedMs >= captures.get("L-09").endedMs,
    "Gate final integrity execution order drifted.",
  );
  return citedReferences;
}

function validateMutationReplay(record) {
  assert(
    record.kind === "archived-mutation-patch-replay",
    "Mutation replay kind drifted.",
  );
  assert(
    record.mission === MISSION_ID,
    `Mutation replay mission must be ${MISSION_ID}.`,
  );
  validateCountedPass(record, "Mutation replay", 5);
  assert(
    Array.isArray(record.unrunChecks) && record.unrunChecks.length === 0,
    "Mutation replay has unrun checks.",
  );
  assert(
    Array.isArray(record.cases) && record.cases.length === 5,
    "Mutation replay must enumerate five cases.",
  );
  assert(
    record.baselineCommit === "4b4c77f0ec06d632e11f910f6124859ac65c7106",
    "Mutation replay baseline commit drifted.",
  );
  for (const [index, replayCase] of record.cases.entries()) {
    const expected = EXPECTED_REPLAY_CASES[index];
    for (const field of [
      "id",
      "sourceMission",
      "framework",
      "kind",
      "patchPath",
    ]) {
      assert(
        replayCase[field] === expected[field],
        `Mutation replay case ${index} ${field} drifted.`,
      );
    }
    assert(
      replayCase.report === `${expected.id}/report.json`,
      `Mutation replay case ${expected.id} report path drifted.`,
    );
    assert(
      replayCase.status === "passed",
      `Mutation replay case ${replayCase.id} did not pass.`,
    );
    assert(
      typeof replayCase.patchPath === "string",
      `Mutation replay case ${replayCase.id} has no patchPath.`,
    );
    assert(
      /^[0-9a-f]{64}$/.test(stripShaPrefix(replayCase.patchSha256 ?? "")),
      `Mutation replay case ${replayCase.id} has no patch hash.`,
    );
    for (const field of ["baselineSha256", "mutatedSha256", "restoredSha256"]) {
      assert(
        /^[0-9a-f]{64}$/.test(stripShaPrefix(replayCase[field] ?? "")),
        `Mutation replay case ${replayCase.id} has invalid ${field}.`,
      );
    }
    assert(
      replayCase.baselineSha256 === replayCase.restoredSha256,
      `Mutation replay case ${replayCase.id} did not restore its baseline.`,
    );
    assert(
      replayCase.baselineSha256 !== replayCase.mutatedSha256,
      `Mutation replay case ${replayCase.id} did not mutate bytes.`,
    );
    assert(
      replayCase.redGate ===
        (replayCase.sourceMission === "s182-m01b"
          ? "component-styles-selected-test"
          : "interaction-evidence"),
      `Mutation replay case ${replayCase.id} red gate drifted.`,
    );
  }
}

function validateReplayCaseReport(replayCase, report) {
  for (const field of ["id", "sourceMission", "framework", "kind", "status"]) {
    assert(
      report[field] === replayCase[field],
      `Mutation replay report ${replayCase.id} ${field} drifted.`,
    );
  }
  assert(
    report.baseline?.commit === "4b4c77f0ec06d632e11f910f6124859ac65c7106",
    `Mutation replay report ${replayCase.id} baseline commit drifted.`,
  );
  assert(
    report.patch?.path === replayCase.patchPath &&
      stripShaPrefix(report.patch?.sha256 ?? "") ===
        stripShaPrefix(replayCase.patchSha256),
    `Mutation replay report ${replayCase.id} patch provenance drifted.`,
  );
  assert(
    report.patch.checkExitCode === 0 && report.patch.applyExitCode === 0,
    `Mutation replay report ${replayCase.id} patch did not apply cleanly.`,
  );
  assert(
    report.reverse?.checkExitCode === 0 &&
      report.reverse?.applyExitCode === 0 &&
      report.reverse?.byteIdentical === true,
    `Mutation replay report ${replayCase.id} did not reverse cleanly.`,
  );
  assert(
    stripShaPrefix(report.baseline.sha256) ===
      stripShaPrefix(replayCase.baselineSha256) &&
      stripShaPrefix(report.mutatedSha256) ===
        stripShaPrefix(replayCase.mutatedSha256) &&
      stripShaPrefix(report.reverse.restoredSha256) ===
        stripShaPrefix(replayCase.restoredSha256),
    `Mutation replay report ${replayCase.id} byte-state hashes drifted.`,
  );
  assert(
    report.redControl?.executed === true,
    `Mutation replay report ${replayCase.id} did not execute its red control.`,
  );
  if (replayCase.sourceMission === "s182-m01b") {
    assert(
      report.redControl.preGreen?.exitCode === 0 &&
        report.redControl.selectedRed?.exitCode !== 0 &&
        report.redControl.restoredGreen?.exitCode === 0 &&
        report.redControl.byteIdenticalRestoration === true,
      `Mutation replay report ${replayCase.id} green/red/green control drifted.`,
    );
  } else {
    assert(
      report.redControl.patchByteIdenticalToStoredArtifact === true &&
        report.redControl.status === "detected" &&
        report.redControl.expected?.status === "failed" &&
        report.redControl.observed?.status === "failed" &&
        report.redControl.expected?.gate === replayCase.redGate &&
        report.redControl.observed?.gate === replayCase.redGate,
      `Mutation replay report ${replayCase.id} discrimination evidence drifted.`,
    );
  }
}

function validateR02Resolution(record, repositoryRoot) {
  assert(
    record.kind === "package-export-evidence-resolution",
    "R-02 record kind drifted.",
  );
  assert(
    record.mission === MISSION_ID,
    `R-02 record mission must be ${MISSION_ID}.`,
  );
  assert(record.risk === "R-02", "R-02 record risk drifted.");
  assert(record.status === "resolved", "R-02 must be resolved.");
  assert(
    record.selected === 28 && record.passed === 28,
    "R-02 must pass all 28 cells.",
  );
  assert(
    record.failed === 0 && record.skipped === 0,
    "R-02 contains failed or skipped cells.",
  );
  assert(
    record.workspaceBuildOutputRequired === false,
    "R-02 still requires workspace build output.",
  );
  assert(
    record.freshCloneAvailable === true,
    "R-02 is not fresh-clone available.",
  );
  assert(
    JSON.stringify(record.canonicalComponentIds) ===
      JSON.stringify(R02_CANONICAL_COMPONENT_IDS),
    "R-02 canonical component IDs drifted from the locked 14-component nucleus.",
  );
  assert(
    JSON.stringify(record.selectedTargets) === JSON.stringify(["react", "vue"]),
    "R-02 target equality drifted.",
  );
  assert(record.selectedCells === 28, "R-02 selectedCells must be 28.");
  assert(
    Array.isArray(record.packages) && record.packages.length === 2,
    "R-02 must bind two packed framework packages.",
  );
  assert(
    Array.isArray(record.cells) && record.cells.length === 28,
    "R-02 must enumerate 28 cells.",
  );
  const packageByTarget = new Map();
  const references = [];
  assert(
    record.baselineCommit === "4b4c77f0ec06d632e11f910f6124859ac65c7106",
    "R-02 baseline commit drifted.",
  );
  for (const [index, packageRecord] of record.packages.entries()) {
    const expectedPackage = R02_PACKAGE_EVIDENCE[index];
    assert(
      packageRecord.target === expectedPackage.target,
      `R-02 package ${index} target drifted.`,
    );
    assert(
      packageRecord.packageName === expectedPackage.packageName,
      `R-02 ${packageRecord.target} package name drifted.`,
    );
    assert(
      packageRecord.version === expectedPackage.version,
      `R-02 ${packageRecord.target} version drifted.`,
    );
    assert(
      !packageByTarget.has(packageRecord.target),
      `R-02 duplicates target ${packageRecord.target}.`,
    );
    packageByTarget.set(packageRecord.target, packageRecord);
    assert(
      packageRecord.tarball?.tracked === true,
      `${packageRecord.target} tarball is not tracked evidence.`,
    );
    const tarballReference = {
      path: packageRecord.tarball?.path,
      bytes: packageRecord.tarball?.bytes,
      sha256: stripShaPrefix(packageRecord.tarball?.sha256 ?? ""),
    };
    assert(
      tarballReference.path === expectedPackage.tarballPath,
      `${packageRecord.target} tarball path drifted.`,
    );
    assert(
      tarballReference.sha256 === expectedPackage.tarballSha256,
      `${packageRecord.target} tarball digest drifted from committed evidence.`,
    );
    assert(
      tarballReference.bytes === expectedPackage.tarballBytes,
      `${packageRecord.target} tarball size drifted from committed evidence.`,
    );
    const verifiedTarball = verifyEvidenceReference({
      repositoryRoot,
      reference: tarballReference,
    });
    assert(
      verifiedTarball.bytes === tarballReference.bytes,
      `${packageRecord.target} tarball byte count drifted.`,
    );
    const declaration = packageRecord.declaration;
    assert(
      declaration?.archiveEntry === "package/dist/index.d.ts",
      `${packageRecord.target} declaration entry drifted.`,
    );
    assert(
      declaration.extractedFromCommittedTarball === true,
      `${packageRecord.target} declaration was not extracted from its tarball.`,
    );
    const declarationContents = execFileSync(
      "tar",
      [
        "-xOf",
        resolveRepositoryPath(repositoryRoot, tarballReference.path),
        declaration.archiveEntry,
      ],
      { encoding: null, maxBuffer: 16 * 1024 * 1024 },
    );
    assert(
      declarationContents.byteLength === declaration.bytes,
      `${packageRecord.target} declaration byte count drifted.`,
    );
    assert(
      declaration.bytes === expectedPackage.declarationBytes,
      `${packageRecord.target} declaration size drifted from committed evidence.`,
    );
    assert(
      stripShaPrefix(declaration.sha256) === expectedPackage.declarationSha256,
      `${packageRecord.target} declaration digest drifted from committed evidence.`,
    );
    assert(
      sha256(declarationContents) === stripShaPrefix(declaration.sha256),
      `${packageRecord.target} declaration digest drifted.`,
    );
    assert(
      JSON.stringify(packageRecord.canonicalNucleusExports) ===
        JSON.stringify(record.canonicalComponentIds),
      `${packageRecord.target} canonical export list drifted.`,
    );
    assert(
      packageRecord.canonicalNucleusExportCount === 14,
      `${packageRecord.target} canonical export count drifted.`,
    );
    references.push(tarballReference);
  }
  const expectedCells = record.selectedTargets.flatMap((target) =>
    record.canonicalComponentIds.map(
      (componentId) => `${target}:${componentId}`,
    ),
  );
  const observedCells = record.cells.map((cell) => {
    const packageRecord = packageByTarget.get(cell.target);
    assert(packageRecord, `R-02 cell has unknown target ${cell.target}.`);
    assert(
      cell.packageExport?.status === "passed",
      `R-02 ${cell.target}/${cell.componentId} did not pass.`,
    );
    assert(
      cell.packageExport.packageName === packageRecord.packageName,
      `R-02 ${cell.target}/${cell.componentId} package drifted.`,
    );
    assert(
      cell.packageExport.tarballPath === packageRecord.tarball.path,
      `R-02 ${cell.target}/${cell.componentId} tarball path drifted.`,
    );
    assert(
      stripShaPrefix(cell.packageExport.tarballSha256) ===
        stripShaPrefix(packageRecord.tarball.sha256),
      `R-02 ${cell.target}/${cell.componentId} tarball hash drifted.`,
    );
    assert(
      cell.packageExport.declarationArchiveEntry ===
        packageRecord.declaration.archiveEntry,
      `R-02 ${cell.target}/${cell.componentId} declaration path drifted.`,
    );
    assert(
      stripShaPrefix(cell.packageExport.declarationSha256) ===
        stripShaPrefix(packageRecord.declaration.sha256),
      `R-02 ${cell.target}/${cell.componentId} declaration hash drifted.`,
    );
    return `${cell.target}:${cell.componentId}`;
  });
  assert(
    new Set(observedCells).size === 28,
    "R-02 target/component cells are not unique.",
  );
  assert(
    JSON.stringify(observedCells) === JSON.stringify(expectedCells),
    "R-02 cell matrix drifted.",
  );
  const sourceInventoryReference = {
    path: record.sourceInventory?.path,
    sha256: stripShaPrefix(record.sourceInventory?.sha256 ?? ""),
  };
  assert(
    sourceInventoryReference.path ===
      "artifacts/product-reality/sprint-183/m05/submitted-packages/inventory.json" &&
      sourceInventoryReference.sha256 ===
        "45e42dcf019d95b9bb6727b63457d56240bfac7835df160f06b55095472be824",
    "R-02 source package inventory drifted.",
  );
  verifyEvidenceReference({
    repositoryRoot,
    reference: sourceInventoryReference,
  });
  references.push(sourceInventoryReference);
  return references;
}

function validateMaintenanceDisposition(record) {
  assert(
    record.kind === "maintenance-disposition",
    "Maintenance disposition kind drifted.",
  );
  assert(
    record.mission === MISSION_ID,
    `Maintenance disposition mission must be ${MISSION_ID}.`,
  );
  assert(
    Array.isArray(record.resolved) && record.resolved.length === 2,
    "Maintenance disposition must resolve two items.",
  );
  assert(
    JSON.stringify(record.resolved.map((item) => item.nextStep)) ===
      JSON.stringify(["#1316", "#1317"]),
    "Maintenance resolved set drifted.",
  );
  assert(
    record.resolved.every((item) => item.status === "resolved"),
    "Maintenance resolved items are not resolved.",
  );
  assert(
    Array.isArray(record.carried) && record.carried.length === 6,
    "Maintenance disposition must carry six items.",
  );
  assert(
    JSON.stringify(record.carried.map((item) => item.nextStep)) ===
      JSON.stringify(["#1315", "#1318", "#1319", "#1320", "#1321", "#1322"]),
    "Maintenance carried set drifted.",
  );
  assert(
    record.carried.every((item) => item.status === "carried-unchanged"),
    "Maintenance carry is not explicit.",
  );
}

function validateCompilationReport(record) {
  assert(
    record.kind === "saved-schema-compilation-report",
    "Compilation report kind drifted.",
  );
  assert(record.mission === "s183-m04", "Compilation report mission drifted.");
  assert(
    record.corpus?.schemaCount === 16,
    "Compilation report must cover 16 saved schemas.",
  );
  assert(
    record.summary?.schemaDispositions?.compiledBothTargets?.length === 1,
    "Compilation report must retain one two-target compile.",
  );
  assert(
    record.summary?.schemaDispositions?.typedGap?.length === 15,
    "Compilation report must retain 15 typed gaps.",
  );
  assert(
    record.summary?.determinism?.schemaTargetCases === 32,
    "Compilation determinism must cover 32 cells.",
  );
  assert(
    record.summary?.determinism?.mismatches?.length === 0,
    "Compilation determinism has mismatches.",
  );
}

function validateConsumerReport(record) {
  assert(
    record.kind === "genuine-saved-schema-clean-consumer-proof",
    "Consumer report kind drifted.",
  );
  assert(record.mission === "s183-m05", "Consumer report mission drifted.");
  validateCountedPass(record, "Consumer report", 16);
  assert(
    Array.isArray(record.frameworks) && record.frameworks.length === 2,
    "Consumer report must contain two frameworks.",
  );
  assert(
    record.frameworks.every(
      (item) =>
        item.selected === 8 && item.passed === 8 && item.status === "passed",
    ),
    "Framework gates are not equal 8/8 passes.",
  );
  assert(
    Array.isArray(record.mutationControls) &&
      record.mutationControls.length === 4,
    "Consumer report must contain four mutation controls.",
  );
  assert(
    record.mutationControls.every((item) => item.status === "detected"),
    "A consumer mutation was not detected.",
  );
}

function resolveExactCommit(repositoryRoot, reviewHead) {
  assert(
    /^[0-9a-f]{40}$/.test(reviewHead),
    "reviewHead must be a full lowercase 40-hex commit SHA.",
  );
  let resolved;
  try {
    resolved = execFileSync(
      "git",
      ["rev-parse", "--verify", `${reviewHead}^{commit}`],
      {
        cwd: repositoryRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      },
    ).trim();
  } catch (error) {
    throw new Error(`reviewHead is not an available commit: ${reviewHead}`, {
      cause: error,
    });
  }
  assert(
    resolved === reviewHead,
    `reviewHead resolved to ${resolved}, not ${reviewHead}.`,
  );
}

function pathsForClaim(missionId, criterionIndex, dynamicEvidence) {
  const focused = INPUT_PATHS.focusedReceipt;
  const byMission = {
    "s183-m01": [
      [focused, EVIDENCE_PATHS.runnableTest, EVIDENCE_PATHS.outputSchema],
      [focused, EVIDENCE_PATHS.runnableTest, EVIDENCE_PATHS.envelopeSource],
      [focused, EVIDENCE_PATHS.runnableTest, EVIDENCE_PATHS.envelopeTest],
      [focused, EVIDENCE_PATHS.pipelineTest, EVIDENCE_PATHS.pipelineSchema],
      [focused, EVIDENCE_PATHS.runnableTest],
      [focused, EVIDENCE_PATHS.runnableTest, EVIDENCE_PATHS.envelopeSource],
    ],
    "s183-m02": [
      [focused, EVIDENCE_PATHS.actionTest],
      [focused, EVIDENCE_PATHS.actionTest, EVIDENCE_PATHS.consumerReport],
      [focused, EVIDENCE_PATHS.actionTest, EVIDENCE_PATHS.actionSource],
      [focused, EVIDENCE_PATHS.actionTest],
      [focused, EVIDENCE_PATHS.actionTest],
      [focused, EVIDENCE_PATHS.actionDocs],
    ],
    "s183-m03": [
      [focused, EVIDENCE_PATHS.profileTest, EVIDENCE_PATHS.profileSource],
      [focused, EVIDENCE_PATHS.profileTest],
      [focused, EVIDENCE_PATHS.profileTest],
      [focused, EVIDENCE_PATHS.profileTest, EVIDENCE_PATHS.profileSource],
      [focused, EVIDENCE_PATHS.profileTest],
      [focused, EVIDENCE_PATHS.profileDocs],
    ],
    "s183-m04": [
      [
        focused,
        EVIDENCE_PATHS.compilationReport,
        EVIDENCE_PATHS.reactArtifact,
        EVIDENCE_PATHS.vueArtifact,
      ],
      [focused, EVIDENCE_PATHS.compilationReport, EVIDENCE_PATHS.savedSubject],
      [focused, EVIDENCE_PATHS.corpusManifest, EVIDENCE_PATHS.corpusIndex],
      [focused, EVIDENCE_PATHS.compilationReport],
      [focused, EVIDENCE_PATHS.compilerTest, EVIDENCE_PATHS.compilationReport],
      [focused, EVIDENCE_PATHS.compilerTest],
      [focused, EVIDENCE_PATHS.compilationReport],
    ],
    "s183-m05": [
      [
        focused,
        EVIDENCE_PATHS.consumerReport,
        EVIDENCE_PATHS.reactConsumerReport,
        EVIDENCE_PATHS.vueConsumerReport,
      ],
      [focused, EVIDENCE_PATHS.consumerReport, EVIDENCE_PATHS.consumerTest],
      [
        focused,
        EVIDENCE_PATHS.consumerReport,
        EVIDENCE_PATHS.reactDependencyPlan,
        EVIDENCE_PATHS.vueDependencyPlan,
      ],
      [
        focused,
        EVIDENCE_PATHS.consumerReport,
        EVIDENCE_PATHS.reactTabsMutation,
        EVIDENCE_PATHS.reactActionMutation,
        EVIDENCE_PATHS.vueTabsMutation,
        EVIDENCE_PATHS.vueActionMutation,
      ],
      [focused, EVIDENCE_PATHS.consumerReport, EVIDENCE_PATHS.consumerHarness],
      [
        focused,
        EVIDENCE_PATHS.consumerReport,
        EVIDENCE_PATHS.reactConsumerReport,
        EVIDENCE_PATHS.vueConsumerReport,
      ],
      [focused, EVIDENCE_PATHS.consumerReport],
    ],
    "s183-m06": [
      [
        focused,
        INPUT_PATHS.gateRecord,
        INPUT_PATHS.cmosMissionContractSource,
        EVIDENCE_PATHS.closeoutGenerator,
        EVIDENCE_PATHS.gateGenerator,
        EVIDENCE_PATHS.closeoutTest,
        OUTPUT_PATHS.missionContracts,
      ],
      [INPUT_PATHS.mutationReplay, EVIDENCE_PATHS.replayTest],
      [
        focused,
        INPUT_PATHS.approvalSource,
        INPUT_PATHS.approvalTest,
        INPUT_PATHS.sprint182Approval,
        INPUT_PATHS.sprint182PromotionProjection,
        INPUT_PATHS.sprint182PromotionClaimDiff,
        INPUT_PATHS.sprint182PromotionBinding,
        INPUT_PATHS.sprint182CanonicalFoundationV1,
        EVIDENCE_PATHS.componentContractsPackage,
      ],
      [
        focused,
        INPUT_PATHS.maintenanceDisposition,
        EVIDENCE_PATHS.maintenanceSource,
        EVIDENCE_PATHS.maintenanceTest,
        EVIDENCE_PATHS.rosterDoc,
        EVIDENCE_PATHS.rosterTest,
        EVIDENCE_PATHS.proseTest,
      ],
      [
        INPUT_PATHS.r02Resolution,
        EVIDENCE_PATHS.replayTest,
        INPUT_PATHS.sprint182PromotionBinding,
        INPUT_PATHS.sprint182CanonicalFoundationV1,
      ],
      [OUTPUT_PATHS.reviewHandoff, INPUT_PATHS.planningMemo],
    ],
  };
  const paths = byMission[missionId][criterionIndex];
  if (missionId === "s183-m06" && criterionIndex === 1) {
    return [...paths, ...dynamicEvidence.mutationReplay];
  }
  if (missionId === "s183-m06" && criterionIndex === 4) {
    return [...paths, ...dynamicEvidence.r02];
  }
  return paths;
}

function executionIdsForClaim(missionId, criterionIndex) {
  if (missionId === "s183-m04")
    return ["s183-focused-suite", "s183-m04-compilation"];
  if (missionId === "s183-m05")
    return ["s183-focused-suite", "s183-m05-consumers"];
  if (missionId === "s183-m06" && criterionIndex === 1)
    return ["s183-m06-mutation-replay"];
  if (missionId === "s183-m06" && criterionIndex === 4)
    return ["s183-m06-r02-resolution"];
  if (missionId === "s183-m06" && criterionIndex === 5)
    return ["s183-m06-builder-handoff"];
  if (missionId === "s183-m06" && criterionIndex === 0) {
    return ["s183-focused-suite", "s183-canonical-closeout-gates"];
  }
  return ["s183-focused-suite"];
}

function auditLedger({ repositoryRoot, ledger, virtualFiles }) {
  assert(
    ledger.expectedClaimCount === 38,
    "Ledger expectedClaimCount must be 38.",
  );
  assert(
    Array.isArray(ledger.claims) && ledger.claims.length === 38,
    "Ledger must contain exactly 38 claims.",
  );
  const claimIds = ledger.claims.map((claim) => claim.claimId);
  assert(new Set(claimIds).size === 38, "Ledger claim IDs are not unique.");
  const executionIds = new Set(
    ledger.executions.map((execution) => execution.executionId),
  );
  assert(
    executionIds.size === ledger.executions.length,
    "Ledger execution IDs are not unique.",
  );
  for (const execution of ledger.executions) {
    assert(
      !["failed", "skipped", "not-run"].includes(execution.status),
      `Ledger execution ${execution.executionId} is not usable evidence.`,
    );
    verifyEvidenceReference({
      repositoryRoot,
      reference: execution.evidence,
      virtualFiles,
    });
  }
  const missionCounts = {};
  const verifiedReferences = [];
  for (const claim of ledger.claims) {
    missionCounts[claim.missionId] = (missionCounts[claim.missionId] ?? 0) + 1;
    const contract = MISSION_CONTRACTS.find(
      (item) => item.missionId === claim.missionId,
    );
    assert(contract, `Unknown claim mission: ${claim.missionId}`);
    assert(
      contract.successCriteria[claim.criterionIndex - 1] === claim.criterion,
      `${claim.claimId} criterion text drifted from CMOS.`,
    );
    assert(claim.status === "passed", `${claim.claimId} is not passed.`);
    assert(
      Array.isArray(claim.executionIds) && claim.executionIds.length > 0,
      `${claim.claimId} has no execution binding.`,
    );
    for (const executionId of claim.executionIds) {
      assert(
        executionIds.has(executionId),
        `${claim.claimId} cites unknown execution ${executionId}.`,
      );
    }
    assert(
      Array.isArray(claim.evidence) && claim.evidence.length > 0,
      `${claim.claimId} has no evidence.`,
    );
    for (const reference of claim.evidence) {
      verifiedReferences.push(
        verifyEvidenceReference({ repositoryRoot, reference, virtualFiles }),
      );
    }
  }
  assert(
    JSON.stringify(missionCounts) === JSON.stringify(EXPECTED_CLAIM_COUNTS),
    `Ledger mission claim counts drifted: ${JSON.stringify(missionCounts)}`,
  );
  return {
    missionCounts,
    referenceCount: verifiedReferences.length,
    uniqueEvidencePathCount: new Set(
      verifiedReferences.map((item) => item.path),
    ).size,
  };
}

export function buildCloseoutArtifacts({ repositoryRoot, reviewHead }) {
  resolveExactCommit(repositoryRoot, reviewHead);

  const cmosMissionContractSource = readJson(
    repositoryRoot,
    INPUT_PATHS.cmosMissionContractSource,
  );
  const focusedReceipt = readJson(repositoryRoot, INPUT_PATHS.focusedReceipt);
  const gateRecord = readJson(repositoryRoot, INPUT_PATHS.gateRecord);
  const mutationReplay = readJson(repositoryRoot, INPUT_PATHS.mutationReplay);
  const r02Resolution = readJson(repositoryRoot, INPUT_PATHS.r02Resolution);
  const maintenanceDisposition = readJson(
    repositoryRoot,
    INPUT_PATHS.maintenanceDisposition,
  );
  const compilationReport = readJson(
    repositoryRoot,
    EVIDENCE_PATHS.compilationReport,
  );
  const consumerReport = readJson(
    repositoryRoot,
    EVIDENCE_PATHS.consumerReport,
  );

  validateCmosMissionContractSource(cmosMissionContractSource);
  const focusedEvidenceReferences = validateFocusedReceipt(
    focusedReceipt,
    reviewHead,
    repositoryRoot,
  );
  const gateEvidenceReferences = validateGateRecord(
    gateRecord,
    reviewHead,
    repositoryRoot,
  );
  validateMutationReplay(mutationReplay);
  const r02EvidenceReferences = validateR02Resolution(
    r02Resolution,
    repositoryRoot,
  );
  validateMaintenanceDisposition(maintenanceDisposition);
  validateCompilationReport(compilationReport);
  validateConsumerReport(consumerReport);

  for (const replayCase of mutationReplay.cases) {
    verifyEvidenceReference({
      repositoryRoot,
      reference: {
        path: replayCase.patchPath,
        sha256: stripShaPrefix(replayCase.patchSha256),
      },
    });
  }

  const mutationReplayPaths = mutationReplay.cases.flatMap((replayCase) => {
    assert(
      typeof replayCase.report === "string" && replayCase.report.length > 0,
      `Mutation replay case ${replayCase.id} has no report path.`,
    );
    const reportPath = path.posix.join(
      path.posix.dirname(INPUT_PATHS.mutationReplay),
      replayCase.report,
    );
    const report = readJson(repositoryRoot, reportPath);
    validateReplayCaseReport(replayCase, report);
    return [replayCase.patchPath, reportPath];
  });
  const dynamicEvidence = {
    mutationReplay: mutationReplayPaths,
    r02: r02EvidenceReferences.map((reference) => reference.path),
  };

  const missionContracts = {
    schemaVersion: "1.0.0",
    kind: "cmos-mission-contract-snapshot",
    sprintId: SPRINT_ID,
    source: {
      tool: "cmos_mission",
      action: "show",
      export: makeReference(
        repositoryRoot,
        INPUT_PATHS.cmosMissionContractSource,
      ),
    },
    expectedClaimCount: 38,
    expectedClaimCountsByMission: EXPECTED_CLAIM_COUNTS,
    missions: MISSION_CONTRACTS,
  };

  const reviewHandoff = {
    schemaVersion: "1.0.0",
    kind: "independent-review-handoff",
    sprintId: SPRINT_ID,
    missionId: MISSION_ID,
    reviewHead,
    builder: {
      sessionId: BUILDER_SESSION_ID,
      role: "builder",
      builderSelfCertified: false,
    },
    approval: {
      status: "not-requested-in-build-session",
      sprint183ApprovalRecord: null,
      separateReviewRequired: true,
      requiredReviewerIndependence:
        "review session and actor must be independent of the builder",
    },
    sprintDisposition:
      "Active — evidence assembled; genuine close is reserved for a separate reviewer",
  };

  const virtualFiles = new Map([
    [OUTPUT_PATHS.missionContracts, canonicalJson(missionContracts)],
    [OUTPUT_PATHS.reviewHandoff, canonicalJson(reviewHandoff)],
  ]);

  const executions = [
    {
      executionId: "s183-focused-suite",
      kind: "test-suite",
      status: "passed",
      selected: focusedReceipt.selected,
      passed: focusedReceipt.passed,
      failed: focusedReceipt.failed,
      skipped: focusedReceipt.skipped,
      evidence: makeReference(repositoryRoot, INPUT_PATHS.focusedReceipt),
    },
    {
      executionId: "s183-canonical-closeout-gates",
      kind: "canonical-gate-record",
      status: "complete-with-explicit-non-local-and-parked-disclosures",
      selected: 24,
      resultSummary: gateRecord.resultSummary,
      evidence: makeReference(repositoryRoot, INPUT_PATHS.gateRecord),
    },
    {
      executionId: "s183-m04-compilation",
      kind: "saved-schema-compilation",
      status: "passed",
      selected: 32,
      passed: 32,
      failed: 0,
      skipped: 0,
      evidence: makeReference(repositoryRoot, EVIDENCE_PATHS.compilationReport),
    },
    {
      executionId: "s183-m05-consumers",
      kind: "clean-consumer-proof",
      status: "passed",
      selected: 16,
      passed: 16,
      failed: 0,
      skipped: 0,
      evidence: makeReference(repositoryRoot, EVIDENCE_PATHS.consumerReport),
    },
    {
      executionId: "s183-m06-mutation-replay",
      kind: "mutation-replay",
      status: "passed",
      selected: 5,
      passed: 5,
      failed: 0,
      skipped: 0,
      evidence: makeReference(repositoryRoot, INPUT_PATHS.mutationReplay),
    },
    {
      executionId: "s183-m06-r02-resolution",
      kind: "package-export-evidence-resolution",
      status: "passed",
      selected: 28,
      passed: 28,
      failed: 0,
      skipped: 0,
      evidence: makeReference(repositoryRoot, INPUT_PATHS.r02Resolution),
    },
    {
      executionId: "s183-m06-builder-handoff",
      kind: "review-handoff",
      status: "awaiting-independent-review",
      builderSelfCertified: false,
      separateReviewRequired: true,
      evidence: makeReference(
        repositoryRoot,
        OUTPUT_PATHS.reviewHandoff,
        virtualFiles,
      ),
    },
  ];

  const claims = [];
  for (const mission of MISSION_CONTRACTS) {
    mission.successCriteria.forEach((criterion, criterionOffset) => {
      const criterionIndex = criterionOffset + 1;
      const claimId = `${mission.missionId}-sc${String(criterionIndex).padStart(2, "0")}`;
      const evidence = pathsForClaim(
        mission.missionId,
        criterionOffset,
        dynamicEvidence,
      ).map((repositoryPath) =>
        makeReference(repositoryRoot, repositoryPath, virtualFiles),
      );
      claims.push({
        claimId,
        missionId: mission.missionId,
        criterionIndex,
        criterion,
        status: "passed",
        executionIds: executionIdsForClaim(mission.missionId, criterionOffset),
        evidence,
      });
    });
  }

  const claimLedger = {
    schemaVersion: "1.0.0",
    kind: "sprint-claim-ledger",
    sprintId: SPRINT_ID,
    reviewHead,
    expectedClaimCount: 38,
    executionPolicy:
      "Every passed claim binds at least one validated execution and one or more content-addressed repository evidence files.",
    executions,
    claims,
    summary: {
      selected: 38,
      passed: 38,
      failed: 0,
      skipped: 0,
      missionCounts: EXPECTED_CLAIM_COUNTS,
    },
  };
  virtualFiles.set(OUTPUT_PATHS.claimLedger, canonicalJson(claimLedger));

  const audit = auditLedger({
    repositoryRoot,
    ledger: claimLedger,
    virtualFiles,
  });
  const claimAudit = {
    schemaVersion: "1.0.0",
    kind: "sprint-claim-ledger-audit",
    sprintId: SPRINT_ID,
    reviewHead,
    status: "passed",
    selected: 38,
    passed: 38,
    failed: 0,
    skipped: 0,
    ledger: makeReference(
      repositoryRoot,
      OUTPUT_PATHS.claimLedger,
      virtualFiles,
    ),
    missionContracts: makeReference(
      repositoryRoot,
      OUTPUT_PATHS.missionContracts,
      virtualFiles,
    ),
    checks: {
      exactClaimCount: true,
      uniqueClaimIds: true,
      exactCmosCriterionText: true,
      exactMissionCounts: audit.missionCounts,
      everyClaimHasExecution: true,
      everyCitedPathExists: true,
      everyCitedHashMatches: true,
      evidenceReferenceCount: audit.referenceCount,
      uniqueEvidencePathCount: audit.uniqueEvidencePathCount,
    },
  };
  virtualFiles.set(OUTPUT_PATHS.claimAudit, canonicalJson(claimAudit));

  const indexedPaths = new Set([
    ...claims.flatMap((claim) => claim.evidence.map((item) => item.path)),
    ...executions.map((execution) => execution.evidence.path),
    OUTPUT_PATHS.missionContracts,
    OUTPUT_PATHS.reviewHandoff,
    OUTPUT_PATHS.claimLedger,
    OUTPUT_PATHS.claimAudit,
    INPUT_PATHS.gateRecord,
    ...gateEvidenceReferences.map((reference) => reference.path),
    ...focusedEvidenceReferences.map((reference) => reference.path),
  ]);
  const evidenceIndex = {
    schemaVersion: "1.0.0",
    kind: "sprint-evidence-index",
    sprintId: SPRINT_ID,
    reviewHead,
    selfExcluded: true,
    selfExclusionReason:
      "The evidence index omits its own digest so the hash graph remains acyclic.",
    entryCount: indexedPaths.size,
    entries: [...indexedPaths]
      .sort(compareCodePoint)
      .map((repositoryPath) =>
        makeReference(repositoryRoot, repositoryPath, virtualFiles),
      ),
  };
  virtualFiles.set(OUTPUT_PATHS.evidenceIndex, canonicalJson(evidenceIndex));

  return {
    [OUTPUT_PATHS.missionContracts]: missionContracts,
    [OUTPUT_PATHS.reviewHandoff]: reviewHandoff,
    [OUTPUT_PATHS.claimLedger]: claimLedger,
    [OUTPUT_PATHS.claimAudit]: claimAudit,
    [OUTPUT_PATHS.evidenceIndex]: evidenceIndex,
  };
}

function parseArguments(argv) {
  let mode = null;
  let reviewHead = null;
  let repositoryRoot = defaultRepositoryRoot;
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--write" || argument === "--check") {
      assert(mode === null, "Supply exactly one of --write or --check.");
      mode = argument.slice(2);
      continue;
    }
    assert(
      argument === "--review-head" || argument === "--repo-root",
      `Unexpected argument: ${argument}`,
    );
    const value = argv[index + 1];
    assert(value && !value.startsWith("--"), `Missing value for ${argument}`);
    if (argument === "--review-head") reviewHead = value;
    else repositoryRoot = path.resolve(value);
    index += 1;
  }
  assert(mode !== null, "Supply exactly one of --write or --check.");
  assert(reviewHead !== null, "--review-head is required.");
  return { mode, reviewHead, repositoryRoot };
}

export function writeOrCheckArtifacts({ repositoryRoot, artifacts, mode }) {
  for (const [repositoryPath, value] of Object.entries(artifacts)) {
    const expected = canonicalJson(value);
    const absolutePath = resolveRepositoryPath(repositoryRoot, repositoryPath);
    if (mode === "write") {
      fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
      fs.writeFileSync(absolutePath, expected);
      continue;
    }
    assert(
      fs.existsSync(absolutePath),
      `Generated closeout artifact is missing: ${repositoryPath}`,
    );
    const actual = fs.readFileSync(absolutePath, "utf8");
    assert(
      actual === expected,
      `Generated closeout artifact is stale: ${repositoryPath}`,
    );
  }
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const artifacts = buildCloseoutArtifacts(options);
  writeOrCheckArtifacts({ ...options, artifacts });
  process.stdout.write(
    `${canonicalJson({
      status: options.mode === "write" ? "written" : "current",
      reviewHead: options.reviewHead,
      outputs: Object.keys(artifacts),
      claims: artifacts[OUTPUT_PATHS.claimLedger].claims.length,
    })}`,
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  main().catch((error) => {
    process.stderr.write(`${error.stack ?? error.message}\n`);
    process.exitCode = 1;
  });
}
