import crypto from "node:crypto";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

import ts from "typescript";

import {
  loadCommittedRunnableArtifacts,
  runSavedSchemaConsumerProof,
} from "./s183-m05-saved-schema-consumers.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
export const REPOSITORY_ROOT = path.resolve(scriptDirectory, "../..");
export const M05_BASELINE_COMMIT = "4b4c77f0ec06d632e11f910f6124859ac65c7106";
export const DEFAULT_M06_ROOT = path.join(
  REPOSITORY_ROOT,
  "artifacts/product-reality/sprint-183/m06",
);

export const CANONICAL_COMPONENT_IDS = Object.freeze([
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

const M05_CASE_DEFINITIONS = [
  ["react", "tabs-selection-behavior-removed", "src/GeneratedUI.tsx"],
  ["react", "domain-action-handle-edit-inert", "src/main.tsx"],
  ["vue", "tabs-selection-behavior-removed", "src/GeneratedUI.vue"],
  ["vue", "domain-action-handle-edit-inert", "src/main.ts"],
];

export const M05_MUTATION_CASES = Object.freeze(
  M05_CASE_DEFINITIONS.map(([framework, kind, targetFile]) =>
    Object.freeze({
      id: `s183-m05-${framework}-${kind}`,
      sourceMission: "s183-m05",
      framework,
      kind,
      targetFile,
      baselinePath: `artifacts/product-reality/sprint-183/m05/consumers/${framework}/source/${targetFile}`,
      patchPath: `artifacts/product-reality/sprint-183/m05/consumers/${framework}/mutations/${kind}/mutation.patch`,
      transformPath: `artifacts/product-reality/sprint-183/m05/consumers/${framework}/mutations/${kind}/transform.json`,
      expectedGate: "interaction-evidence",
      patchCommittedAtBaseline: true,
    }),
  ),
);

export const S182_M01B_MUTATION_CASE = Object.freeze({
  id: "s182-m01b-brand-b-primary-contrast",
  sourceMission: "s182-m01b",
  framework: "shared-css",
  kind: "brand-b-primary-contrast-override-removed",
  targetFile: "packages/component-styles/src/components.css",
  baselinePath: "packages/component-styles/src/components.css",
  patchPath:
    "artifacts/product-reality/sprint-183/m06/mutation-replay/s182-m01b-brand-b-primary-contrast/mutation.patch",
  expectedGate: "component-styles-selected-test",
  patchCommittedAtBaseline: false,
});

export const MUTATION_CASES = Object.freeze([
  ...M05_MUTATION_CASES,
  S182_M01B_MUTATION_CASE,
]);

const PACKAGE_CASES = Object.freeze([
  Object.freeze({
    target: "react",
    packageName: "@oods/components-react",
    tarballPath:
      "artifacts/product-reality/sprint-183/m05/submitted-packages/tarballs/oods-components-react-0.1.0.tgz",
  }),
  Object.freeze({
    target: "vue",
    packageName: "@oods/components-vue",
    tarballPath:
      "artifacts/product-reality/sprint-183/m05/submitted-packages/tarballs/oods-components-vue-0.1.0.tgz",
  }),
]);

const COMPONENT_STYLE_TEST_SELECTOR =
  "s182-m01b binds the measured Brand B light action foreground to pure white";
const COMPONENT_STYLE_FIXTURE_PATHS = Object.freeze([
  "tsconfig.json",
  "packages/component-styles/package.json",
  "packages/component-styles/vitest.config.ts",
  "packages/component-styles/src/index.ts",
  "packages/component-styles/src/components.css",
  "packages/component-styles/test/styles.spec.ts",
  "packages/tokens/src/tokens/brands/A/base.json",
  "packages/tokens/src/tokens/brands/A/dark.json",
  "packages/tokens/src/tokens/brands/A/hc.json",
  "packages/tokens/src/tokens/brands/B/base.json",
  "packages/tokens/src/tokens/brands/B/dark.json",
  "packages/tokens/src/tokens/brands/B/hc.json",
]);

const compareCodePoint = (left, right) =>
  left < right ? -1 : left > right ? 1 : 0;
export const canonicalJson = (value) => `${JSON.stringify(value, null, 2)}\n`;
const sha256 = (value) =>
  crypto.createHash("sha256").update(value).digest("hex");
const sha256Urn = (value) => `sha256:${sha256(value)}`;

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? REPOSITORY_ROOT,
    encoding: options.binary ? null : "utf8",
    env: {
      ...process.env,
      CI: "1",
      FORCE_COLOR: "0",
      NO_COLOR: "1",
      ...options.env,
    },
    input: options.input,
    maxBuffer: 64 * 1024 * 1024,
    timeout: options.timeout ?? 600_000,
  });
  return {
    command: [command, ...args].join(" "),
    exitCode: result.status ?? 127,
    signal: result.signal ?? null,
    stdout: result.stdout ?? (options.binary ? Buffer.alloc(0) : ""),
    stderr: result.stderr ?? (options.binary ? Buffer.alloc(0) : ""),
    ...(result.error ? { error: result.error.message } : {}),
  };
}

function requireGreen(result, label) {
  if (result.exitCode !== 0) {
    const output = Buffer.isBuffer(result.stderr)
      ? result.stderr.toString("utf8")
      : result.stderr || result.stdout || result.error || "no command output";
    throw new Error(`${label} failed (${result.exitCode}): ${output}`);
  }
}

function readCommitted(relativePath) {
  const result = run(
    "git",
    ["show", `${M05_BASELINE_COMMIT}:${relativePath}`],
    { binary: true },
  );
  requireGreen(result, `read committed ${relativePath}`);
  return result.stdout;
}

async function writeFile(root, relativePath, contents) {
  const destination = path.join(root, relativePath);
  await fsp.mkdir(path.dirname(destination), { recursive: true });
  await fsp.writeFile(destination, contents);
}

function publicCommand(result) {
  return {
    command: result.command.split(REPOSITORY_ROOT).join("<repository-root>"),
    exitCode: result.exitCode,
    signal: result.signal,
  };
}

function patchCommand(args, root, patchPath) {
  return run("git", [...args, path.join(REPOSITORY_ROOT, patchPath)], {
    cwd: root,
  });
}

export async function replayStoredPatch(definition) {
  const patch = await fsp.readFile(
    path.join(REPOSITORY_ROOT, definition.patchPath),
  );
  const baseline = readCommitted(definition.baselinePath);
  if (definition.patchCommittedAtBaseline) {
    const committedPatch = readCommitted(definition.patchPath);
    if (!patch.equals(committedPatch)) {
      throw new Error(
        `${definition.id}: stored patch differs from ${M05_BASELINE_COMMIT}.`,
      );
    }
  }
  if (
    !patch.toString("utf8").includes(`--- a/${definition.targetFile}`) ||
    !patch.toString("utf8").includes(`+++ b/${definition.targetFile}`)
  ) {
    throw new Error(
      `${definition.id}: patch headers do not name ${definition.targetFile}.`,
    );
  }
  if (
    definition === S182_M01B_MUTATION_CASE &&
    !patch.toString("utf8").includes("[data-intent='primary']")
  ) {
    throw new Error(
      `${definition.id}: repaired selector is not scoped to primary intent.`,
    );
  }

  const replayRoot = await fsp.mkdtemp(
    path.join(os.tmpdir(), `${definition.id}-`),
  );
  try {
    await writeFile(replayRoot, definition.targetFile, baseline);
    const check = patchCommand(
      ["apply", "--check", "--whitespace=nowarn"],
      replayRoot,
      definition.patchPath,
    );
    requireGreen(check, `${definition.id} patch check`);
    const apply = patchCommand(
      ["apply", "--whitespace=nowarn"],
      replayRoot,
      definition.patchPath,
    );
    requireGreen(apply, `${definition.id} patch apply`);
    const mutated = await fsp.readFile(
      path.join(replayRoot, definition.targetFile),
    );
    const reverseCheck = patchCommand(
      ["apply", "--reverse", "--check", "--whitespace=nowarn"],
      replayRoot,
      definition.patchPath,
    );
    requireGreen(reverseCheck, `${definition.id} reverse patch check`);
    const reverse = patchCommand(
      ["apply", "--reverse", "--whitespace=nowarn"],
      replayRoot,
      definition.patchPath,
    );
    requireGreen(reverse, `${definition.id} reverse patch apply`);
    const restored = await fsp.readFile(
      path.join(replayRoot, definition.targetFile),
    );
    if (!restored.equals(baseline)) {
      throw new Error(
        `${definition.id}: reverse apply did not restore byte-identical baseline.`,
      );
    }

    let transform = null;
    if (definition.transformPath) {
      const transformBytes = await fsp.readFile(
        path.join(REPOSITORY_ROOT, definition.transformPath),
      );
      const committedTransform = readCommitted(definition.transformPath);
      if (!transformBytes.equals(committedTransform)) {
        throw new Error(
          `${definition.id}: transform descriptor differs from committed baseline.`,
        );
      }
      transform = JSON.parse(transformBytes);
      if (
        transform.beforeSha256 !== sha256Urn(baseline) ||
        transform.afterSha256 !== sha256Urn(mutated) ||
        transform.patchSha256 !== sha256Urn(patch)
      ) {
        throw new Error(
          `${definition.id}: replay hashes differ from its stored transform descriptor.`,
        );
      }
    }

    return {
      id: definition.id,
      sourceMission: definition.sourceMission,
      framework: definition.framework,
      kind: definition.kind,
      status: "passed",
      baseline: {
        commit: M05_BASELINE_COMMIT,
        path: definition.baselinePath,
        targetFile: definition.targetFile,
        sha256: sha256Urn(baseline),
      },
      patch: {
        path: definition.patchPath,
        sha256: sha256Urn(patch),
        committedAtBaseline: definition.patchCommittedAtBaseline,
        checkExitCode: check.exitCode,
        applyExitCode: apply.exitCode,
      },
      mutatedSha256: sha256Urn(mutated),
      reverse: {
        checkExitCode: reverseCheck.exitCode,
        applyExitCode: reverse.exitCode,
        restoredSha256: sha256Urn(restored),
        byteIdentical: restored.equals(baseline),
      },
      ...(transform ? { descriptor: transform } : {}),
    };
  } finally {
    await fsp.rm(replayRoot, { recursive: true, force: true });
  }
}

function compactBrowserEvidence(browser) {
  return {
    mount: browser.mount,
    hydration: browser.hydration,
    hydrationInvariantEqual: browser.hydrationInvariant?.equal === true,
    runtimeErrors: browser.runtimeErrors,
    interactions: browser.interactions,
  };
}

async function executeM05MutationControls() {
  const proofRoot = await fsp.mkdtemp(
    path.join(os.tmpdir(), "oods-s183-m06-m05-controls-"),
  );
  try {
    const { artifacts, provenance } = await loadCommittedRunnableArtifacts();
    const { frameworkReports } = await runSavedSchemaConsumerProof({
      artifactRoot: proofRoot,
      artifacts,
      provenance,
      runMutations: true,
    });
    return Object.fromEntries(
      await Promise.all(
        M05_MUTATION_CASES.map(async (definition) => {
          const frameworkReport = frameworkReports.find(
            ({ framework }) => framework === definition.framework,
          );
          const control = frameworkReport?.mutationControls.find(
            ({ kind }) => kind === definition.kind,
          );
          if (
            !control ||
            control.status !== "detected" ||
            control.expected?.gate !== definition.expectedGate ||
            control.observed?.gate !== definition.expectedGate
          ) {
            throw new Error(
              `${definition.id}: fresh consumer harness did not detect the expected red gate.`,
            );
          }
          const generatedPatchPath = path.join(
            proofRoot,
            "consumers",
            definition.framework,
            "mutations",
            definition.kind,
            "mutation.patch",
          );
          const [generatedPatch, storedPatch] = await Promise.all([
            fsp.readFile(generatedPatchPath),
            fsp.readFile(path.join(REPOSITORY_ROOT, definition.patchPath)),
          ]);
          if (!generatedPatch.equals(storedPatch)) {
            throw new Error(
              `${definition.id}: executed mutation patch differs from the stored patch.`,
            );
          }
          return [
            definition.id,
            {
              executed: true,
              verifier: "fresh isolated Sprint-183 M05 packed-consumer harness",
              patchByteIdenticalToStoredArtifact: true,
              status: control.status,
              expected: control.expected,
              observed: control.observed,
              reason: control.reason,
              browser: compactBrowserEvidence(control.browser),
            },
          ];
        }),
      ),
    );
  } finally {
    await fsp.rm(proofRoot, { recursive: true, force: true });
  }
}

function sanitizeLog(value, disposableRoot) {
  return String(value)
    .split(disposableRoot)
    .join("<disposable-baseline>")
    .split(REPOSITORY_ROOT)
    .join("<repository-root>");
}

function commandLog(result, disposableRoot) {
  return (
    [
      `$ ${sanitizeLog(result.command, disposableRoot)}`,
      `exitCode=${result.exitCode}`,
      `signal=${result.signal ?? ""}`,
      "",
      "[stdout]",
      sanitizeLog(result.stdout, disposableRoot),
      "[stderr]",
      sanitizeLog(result.stderr, disposableRoot),
    ]
      .join("\n")
      .trimEnd() + "\n"
  );
}

async function seedComponentStylesFixture(root) {
  for (const relativePath of COMPONENT_STYLE_FIXTURE_PATHS) {
    await writeFile(root, relativePath, readCommitted(relativePath));
  }
  await fsp.symlink(
    path.join(REPOSITORY_ROOT, "node_modules"),
    path.join(root, "node_modules"),
  );
}

function runComponentStylesSelectedTest(disposableRoot) {
  return run(
    "node",
    [
      path.join(REPOSITORY_ROOT, "node_modules/vitest/vitest.mjs"),
      "run",
      "test/styles.spec.ts",
      "--config",
      "vitest.config.ts",
      "-t",
      COMPONENT_STYLE_TEST_SELECTOR,
    ],
    { cwd: path.join(disposableRoot, "packages/component-styles") },
  );
}

async function executeM01bControl() {
  const definition = S182_M01B_MUTATION_CASE;
  const disposableRoot = await fsp.mkdtemp(
    path.join(os.tmpdir(), "oods-s183-m06-m01b-"),
  );
  try {
    await seedComponentStylesFixture(disposableRoot);
    const targetPath = path.join(disposableRoot, definition.targetFile);
    const baseline = await fsp.readFile(targetPath);
    const preGreen = runComponentStylesSelectedTest(disposableRoot);
    requireGreen(preGreen, `${definition.id} pre-mutation selected test`);
    const apply = patchCommand(
      ["apply", "--check", "--whitespace=nowarn"],
      disposableRoot,
      definition.patchPath,
    );
    requireGreen(apply, `${definition.id} selected-test patch check`);
    const applied = patchCommand(
      ["apply", "--whitespace=nowarn"],
      disposableRoot,
      definition.patchPath,
    );
    requireGreen(applied, `${definition.id} selected-test patch apply`);
    const mutated = await fsp.readFile(targetPath);
    const selectedRed = runComponentStylesSelectedTest(disposableRoot);
    if (selectedRed.exitCode === 0) {
      throw new Error(
        `${definition.id}: selected test stayed green after mutation.`,
      );
    }
    const reverse = patchCommand(
      ["apply", "--reverse", "--whitespace=nowarn"],
      disposableRoot,
      definition.patchPath,
    );
    requireGreen(reverse, `${definition.id} selected-test reverse apply`);
    const restored = await fsp.readFile(targetPath);
    if (!restored.equals(baseline)) {
      throw new Error(
        `${definition.id}: selected-test fixture did not restore byte-identically.`,
      );
    }
    const restoredGreen = runComponentStylesSelectedTest(disposableRoot);
    requireGreen(restoredGreen, `${definition.id} restored selected test`);
    return {
      evidence: {
        executed: true,
        verifier: "actual @oods/component-styles selected Vitest carrier",
        selector: COMPONENT_STYLE_TEST_SELECTOR,
        preGreen: publicCommand(preGreen),
        selectedRed: publicCommand(selectedRed),
        restoredGreen: publicCommand(restoredGreen),
        baselineSha256: sha256Urn(baseline),
        mutatedSha256: sha256Urn(mutated),
        restoredSha256: sha256Urn(restored),
        byteIdenticalRestoration: restored.equals(baseline),
      },
      logs: {
        "pre-green.log": commandLog(preGreen, disposableRoot),
        "selected-red.log": commandLog(selectedRed, disposableRoot),
        "restored-green.log": commandLog(restoredGreen, disposableRoot),
      },
    };
  } finally {
    await fsp.rm(disposableRoot, { recursive: true, force: true });
  }
}

function tarMember(tarballPath, member) {
  const result = run("tar", ["-xOzf", tarballPath, member], { binary: true });
  requireGreen(result, `extract ${member} from ${tarballPath}`);
  return result.stdout;
}

export function declarationValueExports(source) {
  const file = ts.createSourceFile(
    "index.d.ts",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const names = new Set();
  for (const statement of file.statements) {
    if (
      ts.isExportDeclaration(statement) &&
      statement.exportClause &&
      ts.isNamedExports(statement.exportClause) &&
      !statement.isTypeOnly
    ) {
      for (const element of statement.exportClause.elements) {
        if (!element.isTypeOnly) names.add(element.name.text);
      }
      continue;
    }
    const modifiers = ts.canHaveModifiers(statement)
      ? ts.getModifiers(statement)
      : undefined;
    if (
      !modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
      )
    )
      continue;
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) names.add(declaration.name.text);
      }
    } else if (
      (ts.isFunctionDeclaration(statement) ||
        ts.isClassDeclaration(statement)) &&
      statement.name
    ) {
      names.add(statement.name.text);
    }
  }
  return names;
}

export function assertExactCanonicalExports(source, target) {
  const valueExports = declarationValueExports(source);
  const canonical = CANONICAL_COMPONENT_IDS.filter((name) =>
    valueExports.has(name),
  );
  if (
    canonical.length !== CANONICAL_COMPONENT_IDS.length ||
    canonical.some((name, index) => name !== CANONICAL_COMPONENT_IDS[index])
  ) {
    throw new Error(
      `${target}: declaration canonical exports differ; found ${canonical.join(", ") || "none"}.`,
    );
  }
  return canonical;
}

export async function buildR02Resolution() {
  const inventoryPath = path.join(
    REPOSITORY_ROOT,
    "artifacts/product-reality/sprint-183/m05/submitted-packages/inventory.json",
  );
  const inventoryBytes = await fsp.readFile(inventoryPath);
  const inventory = JSON.parse(inventoryBytes);
  const packages = [];
  const cells = [];
  for (const definition of PACKAGE_CASES) {
    const absoluteTarball = path.join(REPOSITORY_ROOT, definition.tarballPath);
    const tarballBytes = await fsp.readFile(absoluteTarball);
    const committedTarball = readCommitted(definition.tarballPath);
    if (!tarballBytes.equals(committedTarball)) {
      throw new Error(
        `${definition.packageName}: M05 tarball differs from its committed bytes.`,
      );
    }
    const inventoryRecord = inventory.find(
      ({ name }) => name === definition.packageName,
    );
    if (!inventoryRecord || inventoryRecord.sha256 !== sha256(tarballBytes)) {
      throw new Error(
        `${definition.packageName}: M05 package inventory digest is stale.`,
      );
    }
    const declarationEntry = "package/dist/index.d.ts";
    const declarationBytes = tarMember(absoluteTarball, declarationEntry);
    const declaration = declarationBytes.toString("utf8");
    const canonicalExports = assertExactCanonicalExports(
      declaration,
      definition.target,
    );
    const manifest = JSON.parse(
      tarMember(absoluteTarball, "package/package.json").toString("utf8"),
    );
    if (
      manifest.name !== definition.packageName ||
      manifest.version !== "0.1.0"
    ) {
      throw new Error(
        `${definition.packageName}: packed manifest identity differs.`,
      );
    }
    const packageEvidence = {
      target: definition.target,
      packageName: definition.packageName,
      version: manifest.version,
      tarball: {
        path: definition.tarballPath,
        sha256: sha256Urn(tarballBytes),
        bytes: tarballBytes.byteLength,
        committedAt: M05_BASELINE_COMMIT,
        tracked: true,
      },
      declaration: {
        archiveEntry: declarationEntry,
        sha256: sha256Urn(declarationBytes),
        bytes: declarationBytes.byteLength,
        extractedFromCommittedTarball: true,
      },
      canonicalNucleusExports: canonicalExports,
      canonicalNucleusExportCount: canonicalExports.length,
    };
    packages.push(packageEvidence);
    for (const componentId of CANONICAL_COMPONENT_IDS) {
      cells.push({
        componentId,
        target: definition.target,
        packageExport: {
          status: "passed",
          packageName: definition.packageName,
          tarballPath: definition.tarballPath,
          tarballSha256: packageEvidence.tarball.sha256,
          declarationArchiveEntry: declarationEntry,
          declarationSha256: packageEvidence.declaration.sha256,
        },
      });
    }
  }
  return {
    schemaVersion: "1.0.0",
    mission: "s183-m06",
    risk: "R-02",
    kind: "package-export-evidence-resolution",
    status: "resolved",
    selected: cells.length,
    passed: cells.length,
    failed: 0,
    skipped: 0,
    resolution:
      "Each packageExport cell is now bound to a declaration extracted from a tracked Sprint-183 M05 tarball and to both immutable hashes.",
    priorFragility:
      "The prior evidence class depended on untracked workspace build output absent from a fresh clone.",
    workspaceBuildOutputRequired: false,
    freshCloneAvailable: true,
    baselineCommit: M05_BASELINE_COMMIT,
    canonicalComponentIds: [...CANONICAL_COMPONENT_IDS],
    selectedTargets: ["react", "vue"],
    selectedCells: cells.length,
    packages,
    cells,
    sourceInventory: {
      path: "artifacts/product-reality/sprint-183/m05/submitted-packages/inventory.json",
      sha256: sha256Urn(inventoryBytes),
    },
  };
}

async function writeJson(filePath, value) {
  await fsp.mkdir(path.dirname(filePath), { recursive: true });
  await fsp.writeFile(filePath, canonicalJson(value));
}

export async function generateM06ReplayAndR02Evidence({
  outputRoot = DEFAULT_M06_ROOT,
} = {}) {
  const mutationReplayRoot = path.join(outputRoot, "mutation-replay");
  const r02Path = path.join(outputRoot, "r02-package-export-resolution.json");
  if (fs.existsSync(mutationReplayRoot) || fs.existsSync(r02Path)) {
    throw new Error(
      `Refusing to overwrite existing Sprint-183 M06 replay evidence under ${outputRoot}.`,
    );
  }

  const replayed = [];
  for (const definition of MUTATION_CASES)
    replayed.push(await replayStoredPatch(definition));
  const m05Controls = await executeM05MutationControls();
  const m01bControl = await executeM01bControl();
  const reports = replayed.map((replay) => ({
    ...replay,
    expectedGate: MUTATION_CASES.find(({ id }) => id === replay.id)
      .expectedGate,
    redControl:
      replay.id === S182_M01B_MUTATION_CASE.id
        ? m01bControl.evidence
        : m05Controls[replay.id],
  }));
  const report = {
    schemaVersion: "1.0.0",
    mission: "s183-m06",
    kind: "archived-mutation-patch-replay",
    status: reports.every(
      ({ status, redControl }) => status === "passed" && redControl?.executed,
    )
      ? "passed"
      : "failed",
    baselineCommit: M05_BASELINE_COMMIT,
    selected: reports.length,
    passed: reports.filter(
      ({ status, redControl }) => status === "passed" && redControl?.executed,
    ).length,
    failed: reports.filter(
      ({ status, redControl }) => status !== "passed" || !redControl?.executed,
    ).length,
    skipped: 0,
    unrunChecks: [],
    cases: reports.map((entry) => ({
      id: entry.id,
      sourceMission: entry.sourceMission,
      framework: entry.framework,
      kind: entry.kind,
      status: entry.status,
      report: `${entry.id}/report.json`,
      patchPath: entry.patch.path,
      patchSha256: entry.patch.sha256,
      baselineSha256: entry.baseline.sha256,
      mutatedSha256: entry.mutatedSha256,
      restoredSha256: entry.reverse.restoredSha256,
      redGate: entry.expectedGate,
    })),
  };
  if (report.status !== "passed" || report.passed !== MUTATION_CASES.length) {
    throw new Error(
      `Mutation replay is not green (${report.passed}/${report.selected}).`,
    );
  }
  const r02 = await buildR02Resolution();

  await fsp.mkdir(mutationReplayRoot, { recursive: true });
  for (const entry of reports) {
    await writeJson(
      path.join(mutationReplayRoot, entry.id, "report.json"),
      entry,
    );
  }
  for (const [name, contents] of Object.entries(m01bControl.logs)) {
    await fsp.writeFile(
      path.join(mutationReplayRoot, S182_M01B_MUTATION_CASE.id, name),
      contents,
    );
  }
  await writeJson(path.join(mutationReplayRoot, "report.json"), report);
  await writeJson(r02Path, r02);
  return { report, reports, r02 };
}

export async function verifyPublishedEvidence({
  outputRoot = DEFAULT_M06_ROOT,
} = {}) {
  const publishedReplay = JSON.parse(
    await fsp.readFile(
      path.join(outputRoot, "mutation-replay/report.json"),
      "utf8",
    ),
  );
  if (
    publishedReplay.status !== "passed" ||
    publishedReplay.selected !== MUTATION_CASES.length ||
    publishedReplay.passed !== MUTATION_CASES.length ||
    publishedReplay.failed !== 0 ||
    publishedReplay.skipped !== 0 ||
    publishedReplay.unrunChecks?.length !== 0
  ) {
    throw new Error(
      "Published mutation replay summary is not complete and green.",
    );
  }
  for (const definition of MUTATION_CASES) {
    const fresh = await replayStoredPatch(definition);
    const published = JSON.parse(
      await fsp.readFile(
        path.join(outputRoot, "mutation-replay", definition.id, "report.json"),
        "utf8",
      ),
    );
    for (const field of ["mutatedSha256"]) {
      if (published[field] !== fresh[field])
        throw new Error(`${definition.id}: published ${field} is stale.`);
    }
    if (
      published.baseline?.sha256 !== fresh.baseline.sha256 ||
      published.patch?.sha256 !== fresh.patch.sha256 ||
      published.reverse?.restoredSha256 !== fresh.reverse.restoredSha256 ||
      published.reverse?.byteIdentical !== true ||
      published.redControl?.executed !== true
    ) {
      throw new Error(
        `${definition.id}: published replay or red-control evidence is stale.`,
      );
    }
  }
  const freshR02 = await buildR02Resolution();
  const publishedR02 = JSON.parse(
    await fsp.readFile(
      path.join(outputRoot, "r02-package-export-resolution.json"),
      "utf8",
    ),
  );
  if (canonicalJson(publishedR02) !== canonicalJson(freshR02)) {
    throw new Error("Published R-02 package-export resolution is stale.");
  }
  return { mutationReplay: publishedReplay, r02: publishedR02 };
}

async function main() {
  const outputFlag = process.argv.indexOf("--output");
  const outputRoot =
    outputFlag >= 0
      ? path.resolve(process.argv[outputFlag + 1] ?? "")
      : DEFAULT_M06_ROOT;
  if (!outputRoot) throw new Error("--output requires a directory.");
  const result = process.argv.includes("--check")
    ? await verifyPublishedEvidence({ outputRoot })
    : await generateM06ReplayAndR02Evidence({ outputRoot });
  const replay = result.report ?? result.mutationReplay;
  process.stdout.write(
    `${JSON.stringify({
      status: replay.status,
      replayed: replay.passed,
      r02: result.r02.status,
      output: path
        .relative(REPOSITORY_ROOT, outputRoot)
        .split(path.sep)
        .join("/"),
    })}\n`,
  );
}

if (
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
  main().catch((error) => {
    process.stderr.write(
      `${error instanceof Error ? (error.stack ?? error.message) : String(error)}\n`,
    );
    process.exitCode = 1;
  });
}
