#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "../..");
const runnerRelativePath =
  "scripts/product-reality/capture-s182-final-gates.mjs";
const manifestRelativePath =
  "cmos/planning/forge-s182-foundation-gate-manifest.md";
const gateRootRelative = "artifacts/product-reality/sprint-182/gates";
const gateRoot = path.join(repositoryRoot, gateRootRelative);
const lockfileRelativePath = "pnpm-lock.yaml";
const packedCarrier =
  "packages/mcp-server/test/product-reality/packed-consumers.s182.spec.ts";
const packageVerifier =
  "scripts/product-reality/verify-package-foundations.mjs";
const canonicalFiles = [
  "mutation.patch",
  "pre-green.log",
  "receipt.json",
  "restored-green.log",
  "selected-red.log",
];
const managedGates = Array.from(
  { length: 15 },
  (_, index) => `B-${String(index + 1).padStart(2, "0")}`,
);
const setupCommands = [
  "pnpm install --frozen-lockfile --ignore-scripts",
  "pnpm --filter @oods/tokens run build",
  "pnpm --filter @oods/component-contracts run build",
  "pnpm --filter @oods/component-styles run build",
  "pnpm --filter @oods/components-react run build",
  "pnpm --filter @oods/components-vue run build",
  "pnpm --filter @oods/a11y-tools run build",
  "pnpm --filter @oods/artifacts run build",
  "pnpm --filter @oods/release-utils run build",
  "pnpm --filter @oods/viz-core run build",
  "pnpm --filter @oods/viz-render run build",
  "pnpm --filter @oods/mcp-server run build",
];
const setupCommand = setupCommands.join(" && ");

const selectors = {
  b01: "derives the controlling 109-row denominator from unique sorted membership",
  b02: "B-02 derives the catalog count from unique row IDs instead of stale stats",
  b03Foundation:
    "B-03 blocks foundation-v1 independently for each of the nine evidence classes",
  b03Emission:
    "B-03 blocks emission eligibility independently for incomplete target evidence",
  b04: "cmos.tests.test_refresh_structured_data.RefreshStructuredDataTest.test_code_connect_requires_explicit_oods_component_id",
  b05: "B-05 exports the exact React nucleus with public declarations",
  b06: "B-06 preserves React field label and error associations",
  b07: "B-07 moves React Tabs selection and focus with ArrowRight",
  b08: "B-08 exports the exact Vue nucleus with public declarations",
  b09: "B-09 emits Vue update:modelValue and change for controlled fields",
  b10: "B-10 moves Vue Tabs selection and focus with ArrowRight",
  b11: "B-11 returns exact OODS-N015 with no source for a known target that is not emission-eligible",
  b12: "B-12 installs and imports every required tarball and root export in isolation",
  b13: "B-13 resolves declared dependencies and shared CSS in a clean production build",
  b14: "B-14 emits byte-identical governed source and evidence on repeated runs",
  b15: "B-15 propagates OODS-N015 as a codegen-stage error without a successful payload",
};

const sha256 = (value) =>
  crypto.createHash("sha256").update(value).digest("hex");
const canonicalJson = (value) => `${JSON.stringify(value, null, 2)}\n`;
const toPosix = (value) => value.split(path.sep).join("/");
const compareText = (left, right) => (left < right ? -1 : left > right ? 1 : 0);

function selectorCommand(packageName, file, selector) {
  return `pnpm --filter ${packageName} exec vitest run ${file} -t '${selector}'`;
}

const commands = {
  b01: selectorCommand(
    "@oods/component-contracts",
    "test/contracts.spec.ts",
    selectors.b01,
  ),
  b02: selectorCommand(
    "@oods/mcp-server",
    "test/contracts/catalog.list.spec.ts",
    selectors.b02,
  ),
  b03Foundation: selectorCommand(
    "@oods/component-contracts",
    "test/contracts.spec.ts",
    selectors.b03Foundation,
  ),
  b03Emission: selectorCommand(
    "@oods/component-contracts",
    "test/contracts.spec.ts",
    selectors.b03Emission,
  ),
  b04: `python3 -m unittest ${selectors.b04}`,
  b05: selectorCommand(
    "@oods/components-react",
    "test/package-contract.spec.ts",
    selectors.b05,
  ),
  b06: selectorCommand(
    "@oods/components-react",
    "test/accessibility.spec.tsx",
    selectors.b06,
  ),
  b07: selectorCommand(
    "@oods/components-react",
    "test/interactions.spec.tsx",
    selectors.b07,
  ),
  b08: selectorCommand(
    "@oods/components-vue",
    "test/package-contract.spec.ts",
    selectors.b08,
  ),
  b09: selectorCommand(
    "@oods/components-vue",
    "test/interactions.spec.ts",
    selectors.b09,
  ),
  b10: selectorCommand(
    "@oods/components-vue",
    "test/interactions.spec.ts",
    selectors.b10,
  ),
  b11: selectorCommand(
    "@oods/mcp-server",
    "src/tools/__tests__/code.generate.test.ts",
    selectors.b11,
  ),
  b12: selectorCommand(
    "@oods/mcp-server",
    "test/product-reality/packed-consumers.s182.spec.ts",
    selectors.b12,
  ),
  b13: selectorCommand(
    "@oods/mcp-server",
    "test/product-reality/packed-consumers.s182.spec.ts",
    selectors.b13,
  ),
  b14: selectorCommand(
    "@oods/mcp-server",
    "src/tools/__tests__/code.generate.test.ts",
    selectors.b14,
  ),
  b15: selectorCommand(
    "@oods/mcp-server",
    "src/tools/__tests__/pipeline.test.ts",
    selectors.b15,
  ),
};

const restoreCommands = {
  b01: `node scripts/product-reality/generate-s182-foundation.mjs --write && node scripts/product-reality/generate-s182-foundation.mjs --check && pnpm --filter @oods/component-contracts run build && ${commands.b01}`,
  b02: `node scripts/product-reality/generate-s182-foundation.mjs --check && pnpm --filter @oods/mcp-server run build && ${commands.b02}`,
  b03: "pnpm --filter @oods/component-contracts run build && pnpm --filter @oods/component-contracts exec vitest run test/contracts.spec.ts -t 'B-03 blocks foundation-v1 independently for each of the nine evidence classes|B-03 blocks emission eligibility independently for incomplete target evidence'",
  b04: `python3 -m compileall -q cmos/scripts/refresh_structured_data.py && ${commands.b04}`,
  b05: `pnpm --filter @oods/components-react run build && ${commands.b05}`,
  b06: `pnpm --filter @oods/components-react run build && ${commands.b06}`,
  b07: `pnpm --filter @oods/components-react run build && ${commands.b07}`,
  b08: `pnpm --filter @oods/components-vue run build && ${commands.b08}`,
  b09: `pnpm --filter @oods/components-vue run build && ${commands.b09}`,
  b10: `pnpm --filter @oods/components-vue run build && ${commands.b10}`,
  b11: `pnpm --filter @oods/mcp-server run build && ${commands.b11}`,
  b12: `node ${packageVerifier} --artifact-root ${gateRootRelative}/B-12/verifier-green && ${commands.b12}`,
  b13: `node ${packageVerifier} --artifact-root ${gateRootRelative}/B-13/verifier-green && ${commands.b13}`,
  b14: `pnpm --filter @oods/mcp-server run build && ${commands.b14}`,
  b15: `pnpm --filter @oods/mcp-server run build && ${commands.b15}`,
};

function mutateOnce(contents, before, after, label) {
  const first = contents.indexOf(before);
  if (first < 0 || contents.indexOf(before, first + before.length) >= 0) {
    throw new Error(
      `${label}: expected exactly one byte-for-byte mutation target.`,
    );
  }
  return `${contents.slice(0, first)}${after}${contents.slice(first + before.length)}`;
}

function mutateCanonicalJson(contents, label, update) {
  let document;
  try {
    document = JSON.parse(contents);
  } catch (error) {
    throw new Error(
      `${label}: mutation target is not JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  if (canonicalJson(document) !== contents) {
    throw new Error(
      `${label}: mutation target is not canonical two-space JSON.`,
    );
  }
  update(document);
  const mutated = canonicalJson(document);
  if (mutated === contents)
    throw new Error(`${label}: JSON mutation made no byte change.`);
  return mutated;
}

const contractsDeclaration = ["packages/component-contracts/dist/index.d.ts"];
const reactDeclaration = ["packages/components-react/dist/index.d.ts"];
const vueDeclaration = ["packages/components-vue/dist/index.d.ts"];
const catalogArtifacts = [
  "packages/mcp-server/dist/tools/catalog.shared.js",
  "packages/mcp-server/dist/tools/catalog.shared.js.map",
  "packages/mcp-server/dist/tools/catalog.shared.d.ts",
  "packages/mcp-server/dist/tools/catalog.shared.d.ts.map",
];
const codegenArtifacts = [
  "packages/mcp-server/dist/tools/code.generate.js",
  "packages/mcp-server/dist/tools/code.generate.js.map",
  "packages/mcp-server/dist/tools/code.generate.d.ts",
  "packages/mcp-server/dist/tools/code.generate.d.ts.map",
];
const pipelineArtifacts = [
  "packages/mcp-server/dist/tools/pipeline.js",
  "packages/mcp-server/dist/tools/pipeline.js.map",
  "packages/mcp-server/dist/tools/pipeline.d.ts",
  "packages/mcp-server/dist/tools/pipeline.d.ts.map",
];

const legs = [
  {
    gate: "B-01",
    leg: "drop",
    slug: "b01-drop",
    bundleRelative: `${gateRootRelative}/B-01/drop`,
    carrier: "packages/component-contracts/test/contracts.spec.ts",
    selector: selectors.b01,
    command: commands.b01,
    mutationTarget:
      "packages/component-contracts/registry/component-intake.v1.json",
    mutation:
      "Delete the AddressCollectionPanel intake row while retaining the controlling denominator 109.",
    requiredAndObservedRedFinding:
      "The exact 109-row membership assertion receives 108 rows.",
    restoredArtifactPaths: contractsDeclaration,
    mutate(contents) {
      return mutateCanonicalJson(contents, "B-01 drop", (document) => {
        if (!Array.isArray(document.rows))
          throw new Error("B-01 drop: intake rows are absent.");
        const matches = document.rows.filter(
          (row) => row?.id === "AddressCollectionPanel",
        );
        if (matches.length !== 1 || document.rows.length !== 109) {
          throw new Error(
            `B-01 drop: expected one AddressCollectionPanel in 109 rows, received ${matches.length}/${document.rows.length}.`,
          );
        }
        document.rows = document.rows.filter(
          (row) => row?.id !== "AddressCollectionPanel",
        );
      });
    },
    restoreCommand: restoreCommands.b01,
  },
  {
    gate: "B-01",
    leg: "duplicate",
    slug: "b01-duplicate",
    bundleRelative: `${gateRootRelative}/B-01/duplicate`,
    carrier: "packages/component-contracts/test/contracts.spec.ts",
    selector: selectors.b01,
    command: commands.b01,
    mutationTarget:
      "packages/component-contracts/registry/component-intake.v1.json",
    mutation:
      "Change AddressEditor.id to AddressCollectionPanel while retaining all 109 intake rows.",
    requiredAndObservedRedFinding:
      "The unique derived membership falls to 108 while the row count remains 109.",
    restoredArtifactPaths: contractsDeclaration,
    mutate(contents) {
      return mutateCanonicalJson(contents, "B-01 duplicate", (document) => {
        if (!Array.isArray(document.rows) || document.rows.length !== 109) {
          throw new Error(
            "B-01 duplicate: expected the controlling 109-row intake.",
          );
        }
        const matches = document.rows.filter(
          (row) => row?.id === "AddressEditor",
        );
        if (matches.length !== 1)
          throw new Error(
            `B-01 duplicate: expected one AddressEditor, received ${matches.length}.`,
          );
        matches[0].id = "AddressCollectionPanel";
      });
    },
    restoreCommand: restoreCommands.b01,
  },
  {
    gate: "B-02",
    slug: "b02-stale-count",
    bundleRelative: `${gateRootRelative}/B-02`,
    carrier: "packages/mcp-server/test/contracts/catalog.list.spec.ts",
    selector: selectors.b02,
    command: commands.b02,
    mutationTarget: "packages/mcp-server/src/tools/catalog.shared.ts",
    mutation:
      "Move the finite stats.componentCount branch ahead of unique component row-ID derivation.",
    requiredAndObservedRedFinding:
      "The live resolver returns stale count 101 instead of derived count 109.",
    restoredArtifactPaths: catalogArtifacts,
    mutate(contents) {
      return mutateOnce(
        contents,
        `export function resolveComponentCount(dataset: ComponentsDatasetLike): number {\n  if (Array.isArray(dataset?.components)) {\n    const componentIds = new Set<string>();\n    for (const row of dataset.components) {\n      if (!row || typeof row !== 'object' || Array.isArray(row)) continue;\n      const id = (row as { id?: unknown }).id;\n      if (typeof id === 'string' && id.length > 0) {\n        componentIds.add(id);\n      }\n    }\n    return componentIds.size;\n  }\n\n  const count = dataset?.stats?.componentCount;\n  if (typeof count === 'number' && Number.isFinite(count)) {\n    return count;\n  }\n  return 0;\n}`,
        `export function resolveComponentCount(dataset: ComponentsDatasetLike): number {\n  const count = dataset?.stats?.componentCount;\n  if (typeof count === 'number' && Number.isFinite(count)) {\n    return count;\n  }\n\n  if (Array.isArray(dataset?.components)) {\n    const componentIds = new Set<string>();\n    for (const row of dataset.components) {\n      if (!row || typeof row !== 'object' || Array.isArray(row)) continue;\n      const id = (row as { id?: unknown }).id;\n      if (typeof id === 'string' && id.length > 0) {\n        componentIds.add(id);\n      }\n    }\n    return componentIds.size;\n  }\n  return 0;\n}`,
        "B-02 stale count",
      );
    },
    restoreCommand: restoreCommands.b02,
  },
  {
    gate: "B-03",
    leg: "foundation",
    slug: "b03-foundation",
    bundleRelative: `${gateRootRelative}/B-03/foundation`,
    carrier: "packages/component-contracts/test/contracts.spec.ts",
    selector: selectors.b03Foundation,
    command: commands.b03Foundation,
    mutationTarget: "packages/component-contracts/src/foundation-v1.ts",
    mutation:
      "Weaken evaluateFoundationV1 so packedImport evidence is no longer required.",
    requiredAndObservedRedFinding:
      "The frozen nine-class carrier observes a false promotion when packedImport is absent.",
    restoredArtifactPaths: contractsDeclaration,
    mutate(contents) {
      return mutateOnce(
        contents,
        `  const incomplete = FOUNDATION_V1_EVIDENCE_CLASSES.filter((name) => evidence[name]?.status !== 'passed');`,
        `  const incomplete = FOUNDATION_V1_EVIDENCE_CLASSES.filter(\n    (name) => name !== 'packedImport' && evidence[name]?.status !== 'passed',\n  );`,
        "B-03 foundation predicate",
      );
    },
    restoreCommand: restoreCommands.b03,
    restorationExpected: { selected: 2, passed: 2, failed: 0, exitCode: 0 },
  },
  {
    gate: "B-03",
    leg: "emission",
    slug: "b03-emission",
    bundleRelative: `${gateRootRelative}/B-03/emission`,
    carrier: "packages/component-contracts/test/contracts.spec.ts",
    selector: selectors.b03Emission,
    command: commands.b03Emission,
    mutationTarget: "packages/component-contracts/src/foundation-v1.ts",
    mutation:
      "Weaken evaluateEmissionEligibility so publicDeclaration evidence is no longer required.",
    requiredAndObservedRedFinding:
      "The frozen six-class carrier observes a false target promotion when publicDeclaration is absent.",
    restoredArtifactPaths: contractsDeclaration,
    mutate(contents) {
      return mutateOnce(
        contents,
        `  const incomplete = EMISSION_ELIGIBILITY_EVIDENCE_CLASSES.filter(\n    (name) => evidence[name]?.status !== 'passed',\n  );`,
        `  const incomplete = EMISSION_ELIGIBILITY_EVIDENCE_CLASSES.filter(\n    (name) => name !== 'publicDeclaration' && evidence[name]?.status !== 'passed',\n  );`,
        "B-03 emission predicate",
      );
    },
    restoreCommand: restoreCommands.b03,
    restorationExpected: { selected: 2, passed: 2, failed: 0, exitCode: 0 },
  },
  {
    gate: "B-04",
    slug: "b04-story-identity",
    bundleRelative: `${gateRootRelative}/B-04`,
    carrier: "cmos/tests/test_refresh_structured_data.py",
    selector: selectors.b04,
    command: commands.b04,
    testKind: "unittest",
    mutationTarget: "cmos/tests/test_refresh_structured_data.py",
    mutation:
      "Remove only the positive story fixture default-meta oodsComponentId while retaining its import, title, prose, comment, JSX, and story export.",
    requiredAndObservedRedFinding:
      "The positive components.TagInput reference becomes empty and prose does not reconnect it.",
    mutate(contents) {
      return mutateOnce(
        contents,
        `                        "const meta = {",\n                        "  title: 'Components/TagInput',",\n                        "  parameters: { oodsComponentId: 'TagInput' },",\n                        "};",`,
        `                        "const meta = {",\n                        "  title: 'Components/TagInput',",\n                        "};",`,
        "B-04 explicit story identity",
      );
    },
    restoreCommand: restoreCommands.b04,
  },
  {
    gate: "B-05",
    slug: "b05-react-exports",
    bundleRelative: `${gateRootRelative}/B-05`,
    carrier: "packages/components-react/test/package-contract.spec.ts",
    selector: selectors.b05,
    command: commands.b05,
    mutationTarget: "packages/components-react/src/index.ts",
    mutation:
      "Remove only the Text runtime re-export while retaining its implementation and the other 13 canonical exports.",
    requiredAndObservedRedFinding:
      "Text is absent from the exact React runtime/declaration nucleus.",
    restoredArtifactPaths: reactDeclaration,
    mutate(contents) {
      return mutateOnce(
        contents,
        `export { Badge, Banner, Button, Card, Text } from './presentational.js';`,
        `export { Badge, Banner, Button, Card } from './presentational.js';`,
        "B-05 React Text export",
      );
    },
    restoreCommand: restoreCommands.b05,
  },
  {
    gate: "B-06",
    slug: "b06-react-field-association",
    bundleRelative: `${gateRootRelative}/B-06`,
    carrier: "packages/components-react/test/accessibility.spec.tsx",
    selector: selectors.b06,
    command: commands.b06,
    mutationTarget: "packages/components-react/src/fields.tsx",
    mutation:
      "Remove only the invalid Input control's validation-message ID from aria-describedby.",
    requiredAndObservedRedFinding:
      "The accessible description no longer contains the visible validation message.",
    restoredArtifactPaths: reactDeclaration,
    mutate(contents) {
      return mutateOnce(
        contents,
        `    help ? \`${"${id}"}-description\` : undefined,\n    validation?.message ? validation.id ?? \`${"${id}"}-validation\` : undefined,`,
        `    help ? \`${"${id}"}-description\` : undefined,`,
        "B-06 React aria-describedby",
      );
    },
    restoreCommand: restoreCommands.b06,
  },
  {
    gate: "B-07",
    slug: "b07-react-tabs",
    bundleRelative: `${gateRootRelative}/B-07`,
    carrier: "packages/components-react/test/interactions.spec.tsx",
    selector: selectors.b07,
    command: commands.b07,
    mutationTarget: "packages/components-react/src/tabs.tsx",
    mutation:
      "Remove only the ArrowRight branch from the React Tabs key handler.",
    requiredAndObservedRedFinding:
      "Selection and DOM focus remain on the first enabled React tab.",
    restoredArtifactPaths: reactDeclaration,
    mutate(contents) {
      return mutateOnce(
        contents,
        `      if (key === 'ArrowRight') nextIndex = enabled[(Math.max(0, position) + 1) % enabled.length];\n`,
        "",
        "B-07 React ArrowRight",
      );
    },
    restoreCommand: restoreCommands.b07,
  },
  {
    gate: "B-08",
    slug: "b08-vue-exports",
    bundleRelative: `${gateRootRelative}/B-08`,
    carrier: "packages/components-vue/test/package-contract.spec.ts",
    selector: selectors.b08,
    command: commands.b08,
    mutationTarget: "packages/components-vue/src/index.ts",
    mutation:
      "Remove only the Text runtime re-export while retaining its implementation and the other 13 canonical exports.",
    requiredAndObservedRedFinding:
      "Text is absent from the exact Vue runtime/declaration nucleus.",
    restoredArtifactPaths: vueDeclaration,
    mutate(contents) {
      return mutateOnce(
        contents,
        `export { Badge, Banner, Button, Card, Grid, Stack, Text } from './primitives.js';`,
        `export { Badge, Banner, Button, Card, Grid, Stack } from './primitives.js';`,
        "B-08 Vue Text export",
      );
    },
    restoreCommand: restoreCommands.b08,
  },
  {
    gate: "B-09",
    slug: "b09-vue-model",
    bundleRelative: `${gateRootRelative}/B-09`,
    carrier: "packages/components-vue/test/interactions.spec.ts",
    selector: selectors.b09,
    command: commands.b09,
    mutationTarget: "packages/components-vue/src/fields.ts",
    mutation:
      "Remove only Input's update:modelValue emission while retaining its DOM update and input/change paths.",
    requiredAndObservedRedFinding:
      "The Input wrapper records no update:modelValue payload while its other event still fires.",
    restoredArtifactPaths: vueDeclaration,
    mutate(contents) {
      return mutateOnce(
        contents,
        `    const metadata = useFieldMetadata('Input', props, slots);\n    const updateValue = (nextValue: string) => {\n      if (props.modelValue === undefined && props.value === undefined) internalValue.value = nextValue;\n      emit('update:modelValue', nextValue);\n      emit('input', nextValue);\n    };`,
        `    const metadata = useFieldMetadata('Input', props, slots);\n    const updateValue = (nextValue: string) => {\n      if (props.modelValue === undefined && props.value === undefined) internalValue.value = nextValue;\n      emit('input', nextValue);\n    };`,
        "B-09 Vue update:modelValue",
      );
    },
    restoreCommand: restoreCommands.b09,
  },
  {
    gate: "B-10",
    slug: "b10-vue-tabs",
    bundleRelative: `${gateRootRelative}/B-10`,
    carrier: "packages/components-vue/test/interactions.spec.ts",
    selector: selectors.b10,
    command: commands.b10,
    mutationTarget: "packages/components-vue/src/tabs.ts",
    mutation:
      "Remove only the ArrowRight branch from the Vue Tabs key handler.",
    requiredAndObservedRedFinding:
      "Selection and DOM focus remain on the first enabled Vue tab.",
    restoredArtifactPaths: vueDeclaration,
    mutate(contents) {
      return mutateOnce(
        contents,
        `      if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % available.length;\n`,
        "",
        "B-10 Vue ArrowRight",
      );
    },
    restoreCommand: restoreCommands.b10,
  },
  {
    gate: "B-11",
    slug: "b11-capability-preflight",
    bundleRelative: `${gateRootRelative}/B-11`,
    carrier: "packages/mcp-server/src/tools/__tests__/code.generate.test.ts",
    selector: selectors.b11,
    command: commands.b11,
    mutationTarget: "packages/mcp-server/src/tools/code.generate.ts",
    mutation:
      "Replace the OODS-N015 target-capability early error with the former warning-only fallback and allow emitter execution.",
    requiredAndObservedRedFinding:
      "The carrier receives emitted source and warnings instead of the exact error-only response.",
    restoredArtifactPaths: codegenArtifacts,
    mutate(contents) {
      return mutateOnce(
        contents,
        `    if (readinessErrors.length > 0) {\n      return {\n        status: 'error',\n        framework,\n        code: '',\n        fileExtension: '',\n        imports: [],\n        warnings: [],\n        errors: readinessErrors,\n        meta: {\n          nodeCount: meta.nodeCount,\n          componentCount: meta.componentCount,\n        },\n      };\n    }`,
        `    if (readinessErrors.length > 0) {\n      warnings.push(...readinessErrors);\n    }`,
        "B-11 capability preflight",
      );
    },
    restoreCommand: restoreCommands.b11,
  },
  {
    gate: "B-12",
    leg: "missing-tarball",
    slug: "b12-missing-tarball",
    bundleRelative: `${gateRootRelative}/B-12/missing-tarball`,
    carrier: packedCarrier,
    selector: selectors.b12,
    command: commands.b12,
    mutationTarget: "scripts/product-reality/s182-m04-consumer-harness.mjs",
    mutation:
      "Omit the @oods/components-react tarball from the isolated npm install operand after recording the submitted tarball set.",
    requiredAndObservedRedFinding:
      "The isolated install/import carrier cannot resolve @oods/components-react.",
    redNeedles: ["@oods/components-react"],
    mutate(contents) {
      return mutateOnce(
        contents,
        "const installOperands = tarballs.map((record) => record.tarballPath);",
        "const installOperands = tarballs.filter((record) => record.name !== '@oods/components-react').map((record) => record.tarballPath);",
        "B-12 missing tarball",
      );
    },
    restoreVerifierRelative: `${gateRootRelative}/B-12/verifier-green`,
    restoreCommand: restoreCommands.b12,
  },
  {
    gate: "B-12",
    leg: "missing-root-export",
    slug: "b12-missing-root-export",
    bundleRelative: `${gateRootRelative}/B-12/missing-root-export`,
    carrier: packedCarrier,
    selector: selectors.b12,
    command: commands.b12,
    mutationTarget: "packages/components-react/package.json",
    mutation:
      'Delete exports["."] from the React package before packing while retaining every other export and implementation.',
    requiredAndObservedRedFinding:
      "The isolated root import of @oods/components-react fails because the packed manifest has no root export.",
    redNeedles: ["@oods/components-react"],
    mutate(contents) {
      return mutateOnce(
        contents,
        `    ".": {\n      "types": "./dist/index.d.ts",\n      "import": "./dist/index.js",\n      "require": "./dist/index.cjs"\n    },\n`,
        "",
        "B-12 missing root export",
      );
    },
    supportingVerifierRelative: `${gateRootRelative}/B-12/missing-root-export/verifier-red`,
    verifierFinding: {
      packageName: "@oods/components-react",
      checks: [{ name: "missingRequiredExports", findings: [{ export: "." }] }],
    },
    restoreVerifierRelative: `${gateRootRelative}/B-12/verifier-green`,
    restoreCommand: restoreCommands.b12,
  },
  {
    gate: "B-13",
    leg: "missing-dependency",
    slug: "b13-missing-dependency",
    bundleRelative: `${gateRootRelative}/B-13/missing-dependency`,
    carrier: packedCarrier,
    selector: selectors.b13,
    command: commands.b13,
    mutationTarget: "packages/components-react/package.json",
    mutation:
      'Delete dependencies["@oods/component-styles"] before packing while retaining generated bare CSS imports.',
    requiredAndObservedRedFinding:
      "The packed React manifest omits its required @oods/component-styles dependency.",
    redNeedles: [
      "packed manifest omits declared dependencies: @oods/component-styles",
    ],
    mutate(contents) {
      return mutateOnce(
        contents,
        `    "@oods/component-contracts": "0.1.0",\n    "@oods/component-styles": "0.1.0"\n`,
        `    "@oods/component-contracts": "0.1.0"\n`,
        "B-13 missing dependency",
      );
    },
    supportingVerifierRelative: `${gateRootRelative}/B-13/missing-dependency/verifier-red`,
    verifierFinding: {
      packageName: "@oods/components-react",
      checks: [
        {
          name: "missingRequiredDependencies",
          findings: [
            { section: "dependencies", packageName: "@oods/component-styles" },
          ],
        },
      ],
    },
    restoreVerifierRelative: `${gateRootRelative}/B-13/verifier-green`,
    restoreCommand: restoreCommands.b13,
  },
  {
    gate: "B-13",
    leg: "missing-css-export",
    slug: "b13-missing-css-export",
    bundleRelative: `${gateRootRelative}/B-13/missing-css-export`,
    carrier: packedCarrier,
    selector: selectors.b13,
    command: commands.b13,
    mutationTarget: "packages/component-styles/package.json",
    mutation:
      'Delete exports["./css"] before packing while retaining the generated consumer CSS import.',
    requiredAndObservedRedFinding:
      "The fresh production consumer cannot resolve @oods/component-styles/css.",
    redNeedles: ["@oods/component-styles"],
    mutate(contents) {
      return mutateOnce(
        contents,
        `    "./css": {\n      "default": "./dist/components.css"\n    },\n`,
        "",
        "B-13 missing CSS export",
      );
    },
    supportingVerifierRelative: `${gateRootRelative}/B-13/missing-css-export/verifier-red`,
    verifierFinding: {
      packageName: "@oods/component-styles",
      checks: [
        { name: "missingRequiredExports", findings: [{ export: "./css" }] },
      ],
    },
    restoreVerifierRelative: `${gateRootRelative}/B-13/verifier-green`,
    restoreCommand: restoreCommands.b13,
  },
  {
    gate: "B-14",
    slug: "b14-determinism",
    bundleRelative: `${gateRootRelative}/B-14`,
    carrier: "packages/mcp-server/src/tools/__tests__/code.generate.test.ts",
    selector: selectors.b14,
    command: commands.b14,
    mutationTarget: "packages/mcp-server/src/tools/code.generate.ts",
    mutation:
      "Append a Math.random() invocation marker only to governed React source so identical inputs emit different bytes.",
    requiredAndObservedRedFinding:
      "The selected carrier observes unequal repeated React source buffers for identical governed inputs.",
    restoredArtifactPaths: codegenArtifacts,
    mutate(contents) {
      return mutateOnce(
        contents,
        "    code: result.code,",
        "    code: framework === 'react' ? `${result.code}\\n// B-14 mutation ${Math.random()}` : result.code,",
        "B-14 nondeterministic source",
      );
    },
    restoreCommand: restoreCommands.b14,
  },
  {
    gate: "B-15",
    slug: "b15-pipeline-propagation",
    bundleRelative: `${gateRootRelative}/B-15`,
    carrier: "packages/mcp-server/src/tools/__tests__/pipeline.test.ts",
    selector: selectors.b15,
    command: commands.b15,
    mutationTarget: "packages/mcp-server/src/tools/pipeline.ts",
    mutation:
      "Exclude a first-issue OODS-N015 result from the pipeline error branch so execution continues through the successful code-payload path.",
    requiredAndObservedRedFinding:
      "The selected carrier receives no codegen-stage OODS-N015 failure because the result continues to a code payload.",
    restoredArtifactPaths: pipelineArtifacts,
    mutate(contents) {
      return mutateOnce(
        contents,
        "  if (codegenResult.status !== 'ok') {",
        "  if (codegenResult.status !== 'ok' && codegenResult.errors?.[0]?.code !== 'OODS-N015') {",
        "B-15 swallowed typed error",
      );
    },
    restoreCommand: restoreCommands.b15,
  },
];

function help() {
  return (
    `Usage:\n` +
    `  node ${runnerRelativePath} --review-head <40-hex-commit>\n` +
    `  node ${runnerRelativePath} --self-check\n` +
    `  node ${runnerRelativePath} --help\n\n` +
    "Captures all 19 B-01 through B-15 mutation legs sequentially in fresh detached worktrees.\n" +
    "The primary checkout must be clean and exactly at the supplied review commit. Existing gate\n" +
    "evidence is left untouched until every leg, receipt, and supporting verifier tree has passed.\n" +
    "--self-check validates the locked configuration and mutation seams without builds or tests.\n"
  );
}

function parseArguments(argv) {
  if (argv.length === 1 && (argv[0] === "--help" || argv[0] === "-h"))
    return { mode: "help" };
  if (argv.length === 1 && argv[0] === "--self-check")
    return { mode: "self-check" };
  if (argv.length !== 2 || argv[0] !== "--review-head") {
    throw new Error(
      `A single --review-head <40-hex-commit> or --self-check argument is required.\n${help()}`,
    );
  }
  if (!/^[0-9a-f]{40}$/.test(argv[1])) {
    throw new Error(
      "--review-head must be a full lowercase 40-hex commit SHA.",
    );
  }
  return { mode: "capture", reviewHead: argv[1] };
}

function run(command, args, cwd = repositoryRoot) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    env: {
      ...process.env,
      CI: "1",
      FORCE_COLOR: "0",
      NO_COLOR: "1",
    },
    maxBuffer: 256 * 1024 * 1024,
    timeout: 1_200_000,
  });
  return {
    command: [command, ...args].join(" "),
    exitCode: result.status ?? 127,
    signal: result.signal ?? null,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    ...(result.error ? { error: result.error.message } : {}),
  };
}

function runLiteral(command, cwd = repositoryRoot) {
  const result = run("/bin/sh", ["-c", command], cwd);
  return { ...result, command };
}

function output(result) {
  return `${result.stdout}${result.stderr}`;
}

function requireExit(result, exitCode, label) {
  if (result.exitCode !== exitCode) {
    const transcript = output(result).slice(-12_000);
    throw new Error(
      `${label} exited ${result.exitCode}, expected ${exitCode}.\n${transcript}`,
    );
  }
}

function redact(value, replacements) {
  let result = value;
  for (const [literal, replacement] of replacements) {
    result = result.split(literal).join(replacement);
  }
  return result;
}

function commandLog(result, replacements) {
  return (
    [
      `$ ${result.command}`,
      `exitCode=${result.exitCode}`,
      `signal=${result.signal ?? ""}`,
      "",
      "[stdout]",
      redact(result.stdout, replacements),
      "[stderr]",
      redact(result.stderr, replacements),
      ...(result.error
        ? ["[spawn-error]", redact(result.error, replacements)]
        : []),
    ]
      .join("\n")
      .trimEnd() + "\n"
  );
}

function stripAnsi(value) {
  return value.replace(/\u001b\[[0-?]*[ -/]*[@-~]/g, "");
}

function parseVitestCounts(result, label) {
  const lines = stripAnsi(output(result)).split(/\r?\n/);
  const candidates = lines.filter((line) => /^\s*Tests\s+/.test(line));
  if (candidates.length !== 1) {
    throw new Error(
      `${label}: expected one Vitest Tests summary, found ${candidates.length}.`,
    );
  }
  const line = candidates[0];
  const totalMatch = line.match(/\((\d+)\)\s*$/);
  if (!totalMatch)
    throw new Error(
      `${label}: cannot parse Vitest total from ${JSON.stringify(line)}.`,
    );
  const count = (word) =>
    Number(line.match(new RegExp(`(\\d+)\\s+${word}`))?.[1] ?? 0);
  const passed = count("passed");
  const failed = count("failed");
  const runnerReportedSkipped = count("skipped");
  const todo = count("todo");
  const total = Number(totalMatch[1]);
  if (passed + failed + runnerReportedSkipped + todo !== total) {
    throw new Error(
      `${label}: Vitest summary counts do not add to ${total}: ${JSON.stringify(line)}.`,
    );
  }
  return {
    selected: passed + failed,
    passed,
    failed,
    selectedSkipped: 0,
    runnerFiltered: runnerReportedSkipped,
    runnerReportedSkipped,
    todo,
    total,
    exitCode: result.exitCode,
  };
}

function parseUnittestCounts(result, label) {
  const transcript = stripAnsi(output(result));
  const matches = [...transcript.matchAll(/^Ran (\d+) tests? in /gm)];
  if (matches.length !== 1) {
    throw new Error(
      `${label}: expected one unittest Ran summary, found ${matches.length}.`,
    );
  }
  const total = Number(matches[0][1]);
  const summary = transcript.slice(matches[0].index + matches[0][0].length);
  const failed =
    Number(summary.match(/failures=(\d+)/)?.[1] ?? 0) +
    Number(summary.match(/errors=(\d+)/)?.[1] ?? 0);
  const runnerReportedSkipped = Number(
    summary.match(/skipped=(\d+)/)?.[1] ?? 0,
  );
  const passed = total - failed - runnerReportedSkipped;
  const endedOk = /(?:^|\n)OK(?:\s|$)/m.test(summary);
  const endedFailed = /(?:^|\n)FAILED\s*\(/m.test(summary);
  if (
    (result.exitCode === 0 && (!endedOk || failed !== 0)) ||
    (result.exitCode !== 0 && (!endedFailed || failed === 0)) ||
    passed < 0
  ) {
    throw new Error(
      `${label}: inconsistent unittest summary/exit code.\n${transcript.slice(-4_000)}`,
    );
  }
  return {
    selected: total - runnerReportedSkipped,
    passed,
    failed,
    selectedSkipped: runnerReportedSkipped,
    runnerFiltered: 0,
    runnerReportedSkipped,
    todo: 0,
    total,
    exitCode: result.exitCode,
  };
}

function assertTestPhase(
  result,
  expected,
  label,
  testKind = "vitest",
  redNeedles = [],
) {
  const counts =
    testKind === "unittest"
      ? parseUnittestCounts(result, label)
      : parseVitestCounts(result, label);
  if (
    counts.selected !== expected.selected ||
    counts.passed !== expected.passed ||
    counts.failed !== expected.failed ||
    counts.selectedSkipped !== 0 ||
    counts.todo !== 0 ||
    counts.runnerReportedSkipped !== counts.total - expected.selected ||
    result.exitCode !== expected.exitCode
  ) {
    throw new Error(
      `${label}: wrong selected/failed/skipped sequence: ${JSON.stringify(counts)}.`,
    );
  }
  for (const needle of redNeedles) {
    if (!output(result).includes(needle)) {
      throw new Error(`${label}: RED output lacks ${JSON.stringify(needle)}.`);
    }
  }
  return counts;
}

function unifiedPatch(relativePath, before, after) {
  const temporary = fs.mkdtempSync(
    path.join(os.tmpdir(), "oods-s182-final-patch-"),
  );
  try {
    const beforePath = path.join(temporary, "before");
    const afterPath = path.join(temporary, "after");
    fs.writeFileSync(beforePath, before);
    fs.writeFileSync(afterPath, after);
    const result = spawnSync("diff", ["-u", beforePath, afterPath], {
      encoding: "utf8",
    });
    if (result.status !== 1)
      throw new Error(`Unable to create mutation patch for ${relativePath}.`);
    const hunkOffset = result.stdout.indexOf("@@");
    if (hunkOffset < 0)
      throw new Error(`Mutation patch for ${relativePath} has no hunk.`);
    return (
      `diff --git a/${relativePath} b/${relativePath}\n` +
      `--- a/${relativePath}\n+++ b/${relativePath}\n${result.stdout.slice(hunkOffset)}`
    );
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}

async function readSha(filePath) {
  return sha256(await fsp.readFile(filePath));
}

async function pathExists(filePath) {
  try {
    await fsp.access(filePath);
    return true;
  } catch (error) {
    if (error && typeof error === "object" && error.code === "ENOENT")
      return false;
    throw error;
  }
}

async function assertAbsent(filePath, label) {
  if (await pathExists(filePath))
    throw new Error(`${label} already exists: ${filePath}`);
}

async function assertRegularFile(relativePath, label) {
  const absolutePath = path.join(repositoryRoot, relativePath);
  const stat = await fsp.lstat(absolutePath);
  if (!stat.isFile())
    throw new Error(`${label} is not a regular file: ${relativePath}`);
}

function assertRepositoryRelativePath(relativePath, label) {
  const normalized = path.posix.normalize(relativePath);
  if (
    path.isAbsolute(relativePath) ||
    normalized === ".." ||
    normalized.startsWith("../") ||
    normalized !== relativePath
  ) {
    throw new Error(
      `${label} is not a normalized repository-relative path: ${relativePath}`,
    );
  }
}

function assertSequentialCommand(command, label) {
  if (
    command.replaceAll("&&", "").includes("&") ||
    /(?:^|\s)--parallel(?:\s|$)/.test(command)
  ) {
    throw new Error(
      `${label} contains concurrent/background execution: ${command}`,
    );
  }
}

async function staticSelfCheck() {
  const expectedLegCounts = {
    "B-01": 2,
    "B-02": 1,
    "B-03": 2,
    "B-04": 1,
    "B-05": 1,
    "B-06": 1,
    "B-07": 1,
    "B-08": 1,
    "B-09": 1,
    "B-10": 1,
    "B-11": 1,
    "B-12": 2,
    "B-13": 2,
    "B-14": 1,
    "B-15": 1,
  };
  if (legs.length !== 19)
    throw new Error(`Expected 19 mutation legs, received ${legs.length}.`);
  if (
    canonicalJson(canonicalFiles) !==
    canonicalJson([
      "mutation.patch",
      "pre-green.log",
      "receipt.json",
      "restored-green.log",
      "selected-red.log",
    ])
  ) {
    throw new Error("The exact five-file primary bundle contract drifted.");
  }
  if (
    canonicalJson(Object.keys(expectedLegCounts)) !==
    canonicalJson(managedGates)
  ) {
    throw new Error("Managed gate IDs are not exactly B-01 through B-15.");
  }
  const slugs = new Set();
  const bundles = new Set();
  const manifest = await fsp.readFile(
    path.join(repositoryRoot, manifestRelativePath),
    "utf8",
  );
  for (const setup of setupCommands)
    assertSequentialCommand(setup, "setup command");
  for (const gate of managedGates) {
    const count = legs.filter((config) => config.gate === gate).length;
    if (count !== expectedLegCounts[gate]) {
      throw new Error(
        `${gate}: expected ${expectedLegCounts[gate]} legs, received ${count}.`,
      );
    }
  }
  for (const config of legs) {
    if (slugs.has(config.slug))
      throw new Error(`Duplicate leg slug: ${config.slug}.`);
    if (bundles.has(config.bundleRelative))
      throw new Error(
        `Duplicate bundle destination: ${config.bundleRelative}.`,
      );
    slugs.add(config.slug);
    bundles.add(config.bundleRelative);
    if (
      !config.bundleRelative.startsWith(`${gateRootRelative}/${config.gate}`)
    ) {
      throw new Error(`${config.slug}: bundle is outside its canonical gate.`);
    }
    assertRepositoryRelativePath(
      config.bundleRelative,
      `${config.slug} bundle`,
    );
    assertRepositoryRelativePath(config.carrier, `${config.slug} carrier`);
    assertRepositoryRelativePath(
      config.mutationTarget,
      `${config.slug} mutation target`,
    );
    if (!manifest.includes(`\`${config.command}\``)) {
      throw new Error(
        `${config.slug}: literal selector command is absent from ${manifestRelativePath}.`,
      );
    }
    if (!manifest.includes(`\`${config.restoreCommand}\``)) {
      throw new Error(
        `${config.slug}: literal restore command is absent from ${manifestRelativePath}.`,
      );
    }
    assertSequentialCommand(config.command, `${config.slug} selector command`);
    assertSequentialCommand(
      config.restoreCommand,
      `${config.slug} restore command`,
    );
    await assertRegularFile(config.carrier, `${config.slug} carrier`);
    await assertRegularFile(
      config.mutationTarget,
      `${config.slug} mutation target`,
    );
    const original = await fsp.readFile(
      path.join(repositoryRoot, config.mutationTarget),
      "utf8",
    );
    const mutated = config.mutate(original);
    if (mutated === original)
      throw new Error(`${config.slug}: static mutation made no byte change.`);
    const patch = unifiedPatch(config.mutationTarget, original, mutated);
    if (
      !patch.startsWith(
        `diff --git a/${config.mutationTarget} b/${config.mutationTarget}\n`,
      )
    ) {
      throw new Error(`${config.slug}: mutation patch header drifted.`);
    }
    for (const artifact of config.restoredArtifactPaths ?? []) {
      assertRepositoryRelativePath(
        artifact,
        `${config.slug} restored artifact`,
      );
    }
  }
  const supporting = legs
    .filter((config) => config.supportingVerifierRelative)
    .map((config) => config.slug);
  if (
    canonicalJson(supporting) !==
    canonicalJson([
      "b12-missing-root-export",
      "b13-missing-dependency",
      "b13-missing-css-export",
    ])
  ) {
    throw new Error(
      `Supporting verifier legs drifted: ${JSON.stringify(supporting)}.`,
    );
  }
  const restoredVerifiers = legs
    .filter((config) => config.restoreVerifierRelative)
    .map((config) => config.slug);
  if (
    canonicalJson(restoredVerifiers) !==
    canonicalJson([
      "b12-missing-tarball",
      "b12-missing-root-export",
      "b13-missing-dependency",
      "b13-missing-css-export",
    ])
  ) {
    throw new Error(
      `Restored verifier legs drifted: ${JSON.stringify(restoredVerifiers)}.`,
    );
  }
  return {
    status: "passed",
    runner: runnerRelativePath,
    gates: managedGates.length,
    mutationLegs: legs.length,
    primaryBundleFiles: canonicalFiles,
    supportingVerifierRedTrees: supporting.length,
    restoredVerifierGreenTrees: 2,
    captureOrder: "strictly sequential",
    concurrentPackageBuilds: false,
  };
}

function assertVerifierSummary(report, expected, label) {
  for (const [key, value] of Object.entries(expected)) {
    if (report.summary?.[key] !== value) {
      throw new Error(
        `${label}: verifier summary ${key}=${JSON.stringify(report.summary?.[key])}, expected ${JSON.stringify(value)}.`,
      );
    }
  }
  if (!Array.isArray(report.packages) || report.packages.length !== 4) {
    throw new Error(
      `${label}: verifier did not select exactly four package records.`,
    );
  }
}

async function inspectVerifierRed(checkoutRoot, config) {
  const reportPath = path.join(
    checkoutRoot,
    config.supportingVerifierRelative,
    "package-foundations/report.json",
  );
  const report = JSON.parse(await fsp.readFile(reportPath, "utf8"));
  assertVerifierSummary(
    report,
    {
      selected: 4,
      passed: 3,
      failed: 1,
      skipped: 0,
      status: "failed",
    },
    `${config.gate}/${config.leg} supporting RED`,
  );
  for (const record of report.packages) {
    if (!Array.isArray(record.packs) || record.packs.length !== 2) {
      throw new Error(
        `${config.gate}/${config.leg}: ${record.expectedName} lacks two pack runs.`,
      );
    }
    for (const packed of record.packs) {
      const nonempty = Object.entries(packed.checks ?? {})
        .filter(
          ([, findings]) => Array.isArray(findings) && findings.length > 0,
        )
        .map(([name, findings]) => ({ name, findings }));
      const expected =
        record.expectedName === config.verifierFinding.packageName
          ? config.verifierFinding.checks
          : [];
      if (canonicalJson(nonempty) !== canonicalJson(expected)) {
        throw new Error(
          `${config.gate}/${config.leg}: wrong verifier findings for ${record.expectedName} run ${packed.run}: ${JSON.stringify(nonempty)}.`,
        );
      }
    }
  }
  return {
    path: toPosix(path.relative(checkoutRoot, reportPath)),
    sha256: await readSha(reportPath),
    summary: report.summary,
    packageName: config.verifierFinding.packageName,
    checks: config.verifierFinding.checks,
  };
}

async function inspectVerifierGreen(checkoutRoot, relativeRoot, label) {
  const reportPath = path.join(
    checkoutRoot,
    relativeRoot,
    "package-foundations/report.json",
  );
  const report = JSON.parse(await fsp.readFile(reportPath, "utf8"));
  assertVerifierSummary(
    report,
    {
      selected: 4,
      passed: 4,
      failed: 0,
      skipped: 0,
      status: "passed",
    },
    label,
  );
  for (const record of report.packages) {
    if (
      record.passed !== true ||
      record.deterministic !== true ||
      record.packs?.length !== 2
    ) {
      throw new Error(
        `${label}: ${record.expectedName} is not a deterministic two-pack pass.`,
      );
    }
    for (const packed of record.packs) {
      const findings = Object.values(packed.checks ?? {}).flat();
      if (findings.length !== 0) {
        throw new Error(
          `${label}: ${record.expectedName} run ${packed.run} retains findings.`,
        );
      }
    }
  }
  return {
    path: toPosix(path.relative(checkoutRoot, reportPath)),
    sha256: await readSha(reportPath),
    summary: report.summary,
  };
}

async function inventoryDirectory(root, relativeDirectory) {
  const absoluteDirectory = path.resolve(root, relativeDirectory);
  const expectedPrefix = `${path.resolve(root)}${path.sep}`;
  if (
    absoluteDirectory !== path.resolve(root) &&
    !absoluteDirectory.startsWith(expectedPrefix)
  ) {
    throw new Error(`Inventory path escapes its root: ${relativeDirectory}.`);
  }
  const files = [];
  async function walk(directory) {
    const entries = await fsp.readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => compareText(left.name, right.name));
    for (const entry of entries) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(absolute);
      else if (entry.isFile()) {
        files.push({
          path: toPosix(path.relative(root, absolute)),
          sha256: await readSha(absolute),
        });
      } else {
        throw new Error(
          `Evidence contains a non-file/non-directory entry: ${absolute}`,
        );
      }
    }
  }
  await walk(absoluteDirectory);
  return files;
}

async function treeDigest(directory) {
  const inventory = await inventoryDirectory(directory, ".");
  return { sha256: sha256(canonicalJson(inventory)), inventory };
}

async function verifierDigests(directory) {
  const complete = await treeDigest(directory);
  const deterministicInventory = complete.inventory.filter(
    (record) => !record.path.startsWith("package-foundations/logs/"),
  );
  return {
    complete,
    deterministicInventory,
    deterministicSha256: sha256(canonicalJson(deterministicInventory)),
  };
}

async function ensureCheckoutClean(
  checkoutRoot,
  label,
  includeUntracked = false,
) {
  const status = run(
    "git",
    [
      "status",
      "--porcelain=v1",
      includeUntracked ? "--untracked-files=all" : "--untracked-files=no",
    ],
    checkoutRoot,
  );
  requireExit(status, 0, `${label} status`);
  if (status.stdout.trim())
    throw new Error(`${label} has disallowed changes:\n${status.stdout}`);
}

async function existingGateSnapshot() {
  if (!(await pathExists(gateRoot)))
    return { existed: false, files: 0, sha256: null };
  const stat = await fsp.lstat(gateRoot);
  if (!stat.isDirectory())
    throw new Error(`${gateRootRelative} is not a directory.`);
  const entries = await fsp.readdir(gateRoot, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory() || !managedGates.includes(entry.name)) {
      throw new Error(
        `Refusing to supersede unexpected gate-root entry: ${entry.name}`,
      );
    }
  }
  const digest = await treeDigest(gateRoot);
  return {
    existed: true,
    files: digest.inventory.length,
    sha256: digest.sha256,
  };
}

async function validatePrimary(reviewHead) {
  const resolved = run("git", [
    "rev-parse",
    "--verify",
    `${reviewHead}^{commit}`,
  ]);
  requireExit(resolved, 0, "review HEAD resolution");
  if (resolved.stdout.trim() !== reviewHead) {
    throw new Error(
      `--review-head resolved to ${resolved.stdout.trim()}, not ${reviewHead}.`,
    );
  }
  const primaryHead = run("git", ["rev-parse", "HEAD"]);
  requireExit(primaryHead, 0, "primary HEAD");
  if (primaryHead.stdout.trim() !== reviewHead) {
    throw new Error(
      `Primary checkout HEAD ${primaryHead.stdout.trim()} does not equal review HEAD ${reviewHead}.`,
    );
  }
  await ensureCheckoutClean(repositoryRoot, "Primary checkout", true);
  const committedRunner = run("git", [
    "show",
    `${reviewHead}:${runnerRelativePath}`,
  ]);
  requireExit(committedRunner, 0, "committed capture runner lookup");
  const liveRunner = await fsp.readFile(
    path.join(repositoryRoot, runnerRelativePath),
    "utf8",
  );
  if (committedRunner.stdout !== liveRunner) {
    throw new Error(
      "Running capture script bytes do not match the supplied review HEAD.",
    );
  }
  const selfCheck = await staticSelfCheck();
  const priorEvidence = await existingGateSnapshot();
  return { selfCheck, priorEvidence };
}

async function acquireCaptureLock(reviewHead) {
  const commonDirectory = run("git", ["rev-parse", "--git-common-dir"]);
  requireExit(commonDirectory, 0, "git common-directory lookup");
  const commonRoot = path.resolve(
    repositoryRoot,
    commonDirectory.stdout.trim(),
  );
  const lockName = `oods-s182-final-gates-${sha256(commonRoot).slice(0, 16)}.lock`;
  const lockRoot = path.join(os.tmpdir(), lockName);
  try {
    await fsp.mkdir(lockRoot);
  } catch (error) {
    if (error && typeof error === "object" && error.code === "EEXIST") {
      throw new Error(
        `Another final-gate capture owns ${lockRoot}; package builds will not run concurrently.`,
      );
    }
    throw error;
  }
  await fsp.writeFile(
    path.join(lockRoot, "owner.json"),
    canonicalJson({
      pid: process.pid,
      repositoryRoot,
      reviewHead,
    }),
  );
  return {
    path: lockRoot,
    async release() {
      await fsp.rm(lockRoot, { recursive: true, force: true });
    },
  };
}

async function clearGateEvidence(checkoutRoot, gate) {
  if (!managedGates.includes(gate))
    throw new Error(`Refusing to clear unmanaged gate ${gate}.`);
  const target = path.join(checkoutRoot, gateRootRelative, gate);
  await fsp.rm(target, { recursive: true, force: true });
}

async function restoreGateEvidence(checkoutRoot, gate) {
  if (!managedGates.includes(gate))
    throw new Error(`Refusing to restore unmanaged gate ${gate}.`);
  const relative = `${gateRootRelative}/${gate}`;
  await fsp.rm(path.join(checkoutRoot, relative), {
    recursive: true,
    force: true,
  });
  const tracked = run(
    "git",
    ["ls-tree", "-r", "--name-only", "HEAD", "--", relative],
    checkoutRoot,
  );
  requireExit(tracked, 0, `${gate} committed evidence lookup`);
  if (tracked.stdout.trim()) {
    const restored = run(
      "git",
      ["restore", "--source=HEAD", "--worktree", "--", relative],
      checkoutRoot,
    );
    requireExit(restored, 0, `${gate} committed evidence restoration`);
  }
}

function changedOutsideEvidence(checkoutRoot) {
  const changed = run("git", ["diff", "--name-only"], checkoutRoot);
  requireExit(changed, 0, "mutation diff");
  return changed.stdout
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((relativePath) => !relativePath.startsWith(`${gateRootRelative}/`));
}

function toolVersion(command, args, cwd, label) {
  const result = run(command, args, cwd);
  requireExit(result, 0, `${label} version`);
  return output(result).trim();
}

async function captureInCheckout(
  config,
  checkoutRoot,
  sessionRoot,
  reviewHead,
) {
  const checkoutHead = run("git", ["rev-parse", "HEAD"], checkoutRoot);
  requireExit(checkoutHead, 0, `${config.slug} checkout HEAD`);
  if (checkoutHead.stdout.trim() !== reviewHead) {
    throw new Error(
      `${config.slug}: disposable checkout is not at review HEAD.`,
    );
  }
  const branch = run("git", ["symbolic-ref", "-q", "HEAD"], checkoutRoot);
  if (branch.exitCode === 0)
    throw new Error(`${config.slug}: disposable checkout is not detached.`);
  if (branch.exitCode !== 1)
    requireExit(branch, 1, `${config.slug} detached HEAD check`);
  await ensureCheckoutClean(
    checkoutRoot,
    `${config.slug} fresh checkout`,
    true,
  );

  const setup = runLiteral(setupCommand, checkoutRoot);
  requireExit(setup, 0, `${config.slug} dependency/build setup`);
  await ensureCheckoutClean(
    checkoutRoot,
    `${config.slug} post-setup checkout`,
    true,
  );

  await clearGateEvidence(checkoutRoot, config.gate);
  const bundleRoot = path.join(checkoutRoot, config.bundleRelative);
  await assertAbsent(bundleRoot, `${config.slug} evidence bundle`);
  await fsp.mkdir(bundleRoot, { recursive: true });
  if (config.restoreVerifierRelative) {
    await assertAbsent(
      path.join(checkoutRoot, config.restoreVerifierRelative),
      `${config.slug} restored verifier destination`,
    );
  }

  const carrierPath = path.join(checkoutRoot, config.carrier);
  const targetPath = path.join(checkoutRoot, config.mutationTarget);
  const lockfilePath = path.join(checkoutRoot, lockfileRelativePath);
  const carrierOriginal = await fsp.readFile(carrierPath);
  const targetOriginal = await fsp.readFile(targetPath, "utf8");
  const carrierSha256 = sha256(carrierOriginal);
  const targetOriginalSha256 = sha256(targetOriginal);
  const lockfileSha256 = await readSha(lockfilePath);
  const replacements = [
    [checkoutRoot, "<disposable-checkout>"],
    [sessionRoot, "<capture-session>"],
  ];
  const defaultGreen = { selected: 1, passed: 1, failed: 0, exitCode: 0 };
  const expectedRed = { selected: 1, passed: 0, failed: 1, exitCode: 1 };

  const pre = runLiteral(config.command, checkoutRoot);
  const preCounts = assertTestPhase(
    pre,
    defaultGreen,
    `${config.slug} pre-mutation`,
    config.testKind,
  );
  await fsp.writeFile(
    path.join(bundleRoot, "pre-green.log"),
    commandLog(pre, replacements),
  );

  const mutated = config.mutate(targetOriginal);
  if (mutated === targetOriginal)
    throw new Error(`${config.slug}: mutation made no byte change.`);
  const targetMutatedSha256 = sha256(mutated);
  await fsp.writeFile(
    path.join(bundleRoot, "mutation.patch"),
    unifiedPatch(config.mutationTarget, targetOriginal, mutated),
  );

  let supportingVerifier = null;
  let supportingVerifierRun = null;
  let red;
  let redCounts;
  try {
    await fsp.writeFile(targetPath, mutated);
    const changed = changedOutsideEvidence(checkoutRoot);
    if (canonicalJson(changed) !== canonicalJson([config.mutationTarget])) {
      throw new Error(
        `${config.slug}: mutation changed unexpected tracked paths: ${JSON.stringify(changed)}.`,
      );
    }
    if (config.supportingVerifierRelative) {
      const supportingCommand = `node ${packageVerifier} --artifact-root ${config.supportingVerifierRelative}`;
      supportingVerifierRun = runLiteral(supportingCommand, checkoutRoot);
      requireExit(
        supportingVerifierRun,
        1,
        `${config.slug} supporting verifier RED`,
      );
      supportingVerifier = await inspectVerifierRed(checkoutRoot, config);
    }
    red = runLiteral(config.command, checkoutRoot);
    redCounts = assertTestPhase(
      red,
      expectedRed,
      `${config.slug} selected RED`,
      config.testKind,
      config.redNeedles ?? [],
    );
    const redLog = [
      ...(supportingVerifierRun
        ? [commandLog(supportingVerifierRun, replacements).trimEnd(), ""]
        : []),
      commandLog(red, replacements),
    ].join("\n");
    await fsp.writeFile(path.join(bundleRoot, "selected-red.log"), redLog);
  } finally {
    await fsp.writeFile(targetPath, targetOriginal);
  }

  if ((await readSha(targetPath)) !== targetOriginalSha256) {
    throw new Error(
      `${config.slug}: mutation target was not restored byte-identically before rebuild.`,
    );
  }

  const restored = runLiteral(config.restoreCommand, checkoutRoot);
  requireExit(restored, 0, `${config.slug} literal restoration command`);
  const restoredCounts = assertTestPhase(
    restored,
    config.restorationExpected ?? defaultGreen,
    `${config.slug} restored GREEN`,
    config.testKind,
  );
  await fsp.writeFile(
    path.join(bundleRoot, "restored-green.log"),
    commandLog(restored, replacements),
  );

  let restoredVerifier = null;
  if (config.restoreVerifierRelative) {
    restoredVerifier = await inspectVerifierGreen(
      checkoutRoot,
      config.restoreVerifierRelative,
      `${config.slug} restored package verifier`,
    );
  }
  if ((await readSha(targetPath)) !== targetOriginalSha256) {
    throw new Error(
      `${config.slug}: mutation target differs after restoration command.`,
    );
  }
  if ((await readSha(carrierPath)) !== carrierSha256) {
    throw new Error(
      `${config.slug}: locked carrier differs after restoration command.`,
    );
  }
  if ((await readSha(lockfilePath)) !== lockfileSha256) {
    throw new Error(`${config.slug}: pnpm-lock.yaml changed.`);
  }
  const postRestoreChanges = changedOutsideEvidence(checkoutRoot);
  if (postRestoreChanges.length !== 0) {
    throw new Error(
      `${config.slug}: tracked paths remain changed after restoration: ${JSON.stringify(postRestoreChanges)}.`,
    );
  }

  const restoredBuildArtifacts = [];
  for (const relativePath of config.restoredArtifactPaths ?? []) {
    restoredBuildArtifacts.push({
      path: relativePath,
      sha256: await readSha(path.join(checkoutRoot, relativePath)),
    });
  }
  const generatedArtifacts = await inventoryDirectory(
    checkoutRoot,
    config.bundleRelative,
  );
  generatedArtifacts.push(...restoredBuildArtifacts);
  generatedArtifacts.sort((left, right) => compareText(left.path, right.path));

  const stagedBundle = path.join(sessionRoot, "staged", config.bundleRelative);
  await fsp.mkdir(path.dirname(stagedBundle), { recursive: true });
  await fsp.cp(bundleRoot, stagedBundle, {
    recursive: true,
    errorOnExist: true,
    force: false,
  });

  let greenCandidate = null;
  if (config.restoreVerifierRelative) {
    greenCandidate = path.join(sessionRoot, "green-candidates", config.slug);
    await fsp.mkdir(path.dirname(greenCandidate), { recursive: true });
    await fsp.cp(
      path.join(checkoutRoot, config.restoreVerifierRelative),
      greenCandidate,
      {
        recursive: true,
        errorOnExist: true,
        force: false,
      },
    );
  }

  const toolchain = {
    node: process.version,
    npm: toolVersion("npm", ["--version"], checkoutRoot, "npm"),
    pnpm: toolVersion("pnpm", ["--version"], checkoutRoot, "pnpm"),
    python: toolVersion("python3", ["--version"], checkoutRoot, "python"),
    vitest: toolVersion(
      "pnpm",
      ["exec", "vitest", "--version"],
      checkoutRoot,
      "vitest",
    ),
  };
  const receipt = {
    schemaVersion: "1.0.0",
    mission: "s182-m05",
    bite: config.gate,
    ...(config.leg ? { leg: config.leg } : {}),
    reviewHead,
    carrier: {
      path: config.carrier,
      sha256: carrierSha256,
      selector: config.selector,
    },
    mutationTarget: {
      path: config.mutationTarget,
      originalSha256: targetOriginalSha256,
      mutatedSha256: targetMutatedSha256,
      restoredSha256: await readSha(targetPath),
    },
    command: config.command,
    mutation: config.mutation,
    requiredAndObservedRedFinding: config.requiredAndObservedRedFinding,
    mutationPatchSha256: await readSha(path.join(bundleRoot, "mutation.patch")),
    sequence: {
      preMutation: preCounts,
      mutation: redCounts,
      restoration: restoredCounts,
    },
    supportingVerifier,
    restoreCommand: config.restoreCommand,
    restoredVerifier,
    restoration: {
      byteIdentical: true,
      mutationTargetSha256: await readSha(targetPath),
      carrierByteIdentical: true,
      carrierSha256: await readSha(carrierPath),
      lockfileUnchanged: true,
      lockfileSha256,
    },
    execution: {
      checkoutKind: "fresh detached git worktree",
      setupCommand,
      setupCommandsSequential: true,
      concurrentPackageBuilds: false,
      setupExitCode: setup.exitCode,
      checkoutHead: reviewHead,
      detached: true,
      freshCheckoutCleanBeforeSetup: true,
      postSetupCheckoutClean: true,
      trackedMutationStateRestored: true,
      trackedCleanAfterEvidenceTreeRestoration: true,
      worktreeRemovedBeforePublication: true,
    },
    publication: {
      mode: "whole B-01 through B-15 tree staged before swap",
      priorEvidenceUntouchedUntilAllLegsPassed: true,
      allOrNothing: true,
    },
    toolchain,
    generatedArtifacts,
    canonicalGateDestination: `${config.bundleRelative}/`,
  };

  await restoreGateEvidence(checkoutRoot, config.gate);
  await ensureCheckoutClean(
    checkoutRoot,
    `${config.slug} restored checkout`,
    true,
  );
  return { config, stagedBundle, greenCandidate, receipt };
}

async function captureDisposable(config, sessionRoot, reviewHead) {
  const checkoutRoot = path.join(sessionRoot, "checkouts", config.slug);
  await fsp.mkdir(path.dirname(checkoutRoot), { recursive: true });
  const add = run("git", [
    "worktree",
    "add",
    "--detach",
    checkoutRoot,
    reviewHead,
  ]);
  requireExit(add, 0, `${config.slug} worktree creation`);

  let captured;
  let captureError;
  try {
    captured = await captureInCheckout(
      config,
      checkoutRoot,
      sessionRoot,
      reviewHead,
    );
  } catch (error) {
    captureError = error;
  }

  const remove = run("git", ["worktree", "remove", "--force", checkoutRoot]);
  const prune = run("git", ["worktree", "prune"]);
  let cleanupError = null;
  if (remove.exitCode !== 0)
    cleanupError = new Error(
      `${config.slug}: worktree removal failed.\n${output(remove)}`,
    );
  else if (prune.exitCode !== 0)
    cleanupError = new Error(
      `${config.slug}: worktree prune failed.\n${output(prune)}`,
    );
  else if (fs.existsSync(checkoutRoot))
    cleanupError = new Error(
      `${config.slug}: worktree path remains after removal.`,
    );

  if (captureError) {
    if (cleanupError && captureError instanceof Error)
      captureError.message += `\nCleanup also failed: ${cleanupError.message}`;
    throw captureError;
  }
  if (cleanupError) throw cleanupError;
  if (!captured) throw new Error(`${config.slug}: capture returned no result.`);

  await assertDirectBundle(captured, false);
  return captured;
}

async function assertExactEntries(
  directory,
  expectedFiles,
  expectedDirectories,
  label,
) {
  const entries = await fsp.readdir(directory, { withFileTypes: true });
  const directFiles = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort(compareText);
  const directDirectories = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort(compareText);
  const other = entries
    .filter((entry) => !entry.isFile() && !entry.isDirectory())
    .map((entry) => entry.name);
  if (
    canonicalJson(directFiles) !==
      canonicalJson([...expectedFiles].sort(compareText)) ||
    canonicalJson(directDirectories) !==
      canonicalJson([...expectedDirectories].sort(compareText)) ||
    other.length > 0
  ) {
    throw new Error(
      `${label}: entries differ: files=${JSON.stringify(directFiles)}, directories=${JSON.stringify(directDirectories)}, other=${JSON.stringify(other)}.`,
    );
  }
}

async function assertDirectBundle(captured, includeReceipt) {
  const expectedFiles = includeReceipt
    ? canonicalFiles
    : canonicalFiles.filter((fileName) => fileName !== "receipt.json");
  const expectedDirectories = captured.config.supportingVerifierRelative
    ? ["verifier-red"]
    : [];
  await assertExactEntries(
    captured.stagedBundle,
    expectedFiles,
    expectedDirectories,
    `${captured.config.slug} primary bundle`,
  );
}

function assertVerifierInventory(inventory, prefix, label) {
  if (inventory.some((record) => !record.path.startsWith(prefix))) {
    throw new Error(
      `${label}: verifier inventory contains a path outside ${prefix}.`,
    );
  }
  const relative = inventory.map((record) => record.path.slice(prefix.length));
  const counts = {
    reports: relative.filter(
      (filePath) => filePath === "package-foundations/report.json",
    ).length,
    logs: relative.filter((filePath) =>
      filePath.startsWith("package-foundations/logs/"),
    ).length,
    inventories: relative.filter((filePath) =>
      filePath.startsWith("package-foundations/inventories/"),
    ).length,
    tarballs: relative.filter(
      (filePath) =>
        filePath.startsWith("package-foundations/tarballs/") &&
        filePath.endsWith(".tgz"),
    ).length,
  };
  if (
    inventory.length !== 29 ||
    counts.reports !== 1 ||
    counts.logs !== 12 ||
    counts.inventories !== 8 ||
    counts.tarballs !== 8
  ) {
    throw new Error(
      `${label}: verifier inventory is incomplete: ${JSON.stringify({ files: inventory.length, ...counts })}.`,
    );
  }
}

function assertCanonicalVerifierInventory(inventory, gate) {
  assertVerifierInventory(
    inventory,
    `${gateRootRelative}/${gate}/verifier-green/`,
    `${gate} canonical verifier-green`,
  );
}

async function stageCanonicalGreen(captures, gate, sessionRoot) {
  const candidates = captures
    .filter((capture) => capture.config.gate === gate)
    .map((capture) => capture.greenCandidate);
  if (candidates.length !== 2 || candidates.some((candidate) => !candidate)) {
    throw new Error(
      `${gate}: expected exactly two restored verifier candidates.`,
    );
  }
  const first = await verifierDigests(candidates[0]);
  const second = await verifierDigests(candidates[1]);
  if (
    canonicalJson(first.deterministicInventory) !==
    canonicalJson(second.deterministicInventory)
  ) {
    throw new Error(
      `${gate}: deterministic restored verifier outputs differ across clean mutation legs.`,
    );
  }
  const destination = path.join(
    sessionRoot,
    "staged",
    gateRootRelative,
    gate,
    "verifier-green",
  );
  await fsp.cp(candidates[0], destination, {
    recursive: true,
    errorOnExist: true,
    force: false,
  });
  const canonicalPrefix = `${gateRootRelative}/${gate}/verifier-green`;
  const canonicalInventory = first.complete.inventory.map((record) => ({
    path: `${canonicalPrefix}/${record.path}`,
    sha256: record.sha256,
  }));
  assertCanonicalVerifierInventory(canonicalInventory, gate);
  for (const capture of captures.filter(
    (candidate) => candidate.config.gate === gate,
  )) {
    capture.receipt.generatedArtifacts.push(...canonicalInventory);
    capture.receipt.generatedArtifacts.sort((left, right) =>
      compareText(left.path, right.path),
    );
    capture.receipt.restoredVerifier.canonicalVerifierGreen = {
      selectedAfterCrossLegComparison: true,
      completeTreeSha256: first.complete.sha256,
      deterministicTreeSha256: first.deterministicSha256,
      files: canonicalInventory.length,
    };
  }
  return {
    gate,
    deterministicSha256: first.deterministicSha256,
    canonicalTreeSha256: first.complete.sha256,
    files: first.complete.inventory.length,
    excludedFromDeterministicDigest: "package-foundations/logs/**",
  };
}

async function finalizeReceipts(captures) {
  for (const captured of captures) {
    if (captured.config.restoreVerifierRelative) {
      const greenPrefix = `${captured.config.restoreVerifierRelative}/package-foundations/`;
      const greenArtifacts = captured.receipt.generatedArtifacts.filter(
        (record) => record.path.startsWith(greenPrefix),
      );
      assertCanonicalVerifierInventory(greenArtifacts, captured.config.gate);
    }
    if (captured.config.supportingVerifierRelative) {
      const redPrefix = `${captured.config.supportingVerifierRelative}/`;
      const redArtifacts = captured.receipt.generatedArtifacts.filter(
        (record) => record.path.startsWith(redPrefix),
      );
      assertVerifierInventory(
        redArtifacts,
        redPrefix,
        `${captured.config.slug} supporting verifier-red`,
      );
    }
    await fsp.writeFile(
      path.join(captured.stagedBundle, "receipt.json"),
      canonicalJson(captured.receipt),
    );
    await assertDirectBundle(captured, true);
  }
}

async function assertCompleteStagedGateTree(
  stagedGateRoot,
  captures,
  reviewHead,
) {
  await assertExactEntries(
    stagedGateRoot,
    [],
    managedGates,
    "staged final gate root",
  );
  for (const captured of captures) {
    await assertDirectBundle(captured, true);
    const receiptPath = path.join(captured.stagedBundle, "receipt.json");
    const receipt = JSON.parse(await fsp.readFile(receiptPath, "utf8"));
    const expectedRestorationSelected =
      captured.config.restorationExpected?.selected ?? 1;
    if (
      receipt.mission !== "s182-m05" ||
      receipt.reviewHead !== reviewHead ||
      receipt.bite !== captured.config.gate ||
      receipt.command !== captured.config.command ||
      receipt.restoreCommand !== captured.config.restoreCommand ||
      receipt.sequence?.preMutation?.selected !== 1 ||
      receipt.sequence?.preMutation?.failed !== 0 ||
      receipt.sequence?.preMutation?.selectedSkipped !== 0 ||
      receipt.sequence?.mutation?.selected !== 1 ||
      receipt.sequence?.mutation?.failed !== 1 ||
      receipt.sequence?.mutation?.selectedSkipped !== 0 ||
      receipt.sequence?.restoration?.selected !== expectedRestorationSelected ||
      receipt.sequence?.restoration?.failed !== 0 ||
      receipt.sequence?.restoration?.selectedSkipped !== 0 ||
      receipt.restoration?.byteIdentical !== true ||
      receipt.restoration?.lockfileUnchanged !== true ||
      receipt.execution?.checkoutHead !== reviewHead ||
      receipt.execution?.detached !== true ||
      receipt.execution?.concurrentPackageBuilds !== false ||
      receipt.execution?.worktreeRemovedBeforePublication !== true ||
      receipt.publication?.allOrNothing !== true
    ) {
      throw new Error(
        `${captured.config.slug}: finalized receipt violates the recapture contract.`,
      );
    }
    const patchSha = await readSha(
      path.join(captured.stagedBundle, "mutation.patch"),
    );
    if (receipt.mutationPatchSha256 !== patchSha) {
      throw new Error(
        `${captured.config.slug}: receipt mutation-patch digest is stale.`,
      );
    }
    const gateArtifactPrefix = `${gateRootRelative}/`;
    const gateArtifacts = receipt.generatedArtifacts.filter((record) =>
      record.path.startsWith(gateArtifactPrefix),
    );
    if (
      new Set(gateArtifacts.map((record) => record.path)).size !==
      gateArtifacts.length
    ) {
      throw new Error(
        `${captured.config.slug}: receipt contains duplicate gate-artifact paths.`,
      );
    }
    for (const artifact of gateArtifacts) {
      const relativePath = artifact.path.slice(gateArtifactPrefix.length);
      assertRepositoryRelativePath(
        relativePath,
        `${captured.config.slug} generated artifact`,
      );
      const actualSha = await readSha(path.join(stagedGateRoot, relativePath));
      if (actualSha !== artifact.sha256) {
        throw new Error(
          `${captured.config.slug}: generated-artifact digest is stale for ${artifact.path}.`,
        );
      }
    }
  }
  const simpleGates = managedGates.filter(
    (gate) => !["B-01", "B-03", "B-12", "B-13"].includes(gate),
  );
  for (const gate of simpleGates) {
    await assertExactEntries(
      path.join(stagedGateRoot, gate),
      canonicalFiles,
      [],
      `${gate} final bundle`,
    );
  }
  await assertExactEntries(
    path.join(stagedGateRoot, "B-01"),
    [],
    ["drop", "duplicate"],
    "B-01 final gate",
  );
  await assertExactEntries(
    path.join(stagedGateRoot, "B-03"),
    [],
    ["emission", "foundation"],
    "B-03 final gate",
  );
  await assertExactEntries(
    path.join(stagedGateRoot, "B-12"),
    [],
    ["missing-root-export", "missing-tarball", "verifier-green"],
    "B-12 final gate",
  );
  await assertExactEntries(
    path.join(stagedGateRoot, "B-13"),
    [],
    ["missing-css-export", "missing-dependency", "verifier-green"],
    "B-13 final gate",
  );
  for (const gate of ["B-12", "B-13"]) {
    const inventory = await inventoryDirectory(
      stagedGateRoot,
      `${gate}/verifier-green`,
    );
    const canonicalInventory = inventory.map((record) => ({
      path: `${gateRootRelative}/${record.path}`,
      sha256: record.sha256,
    }));
    assertCanonicalVerifierInventory(canonicalInventory, gate);
  }
}

async function publishStaged(
  sessionRoot,
  captures,
  reviewHead,
  expectedPriorEvidence,
) {
  const stagedGateRoot = path.join(sessionRoot, "staged", gateRootRelative);
  await assertCompleteStagedGateTree(stagedGateRoot, captures, reviewHead);

  const gateParent = path.dirname(gateRoot);
  const suffix = `${process.pid}-${path.basename(sessionRoot)}`;
  const candidate = path.join(
    gateParent,
    `.s182-final-gates-candidate-${suffix}`,
  );
  const backup = path.join(gateParent, `.s182-final-gates-backup-${suffix}`);
  await assertAbsent(candidate, "Final-gate publication candidate");
  await assertAbsent(backup, "Final-gate publication backup");
  try {
    await fsp.cp(stagedGateRoot, candidate, {
      recursive: true,
      errorOnExist: true,
      force: false,
    });
    await assertCompleteStagedGateTree(
      candidate,
      captures.map((capture) => ({
        ...capture,
        stagedBundle: path.join(
          candidate,
          path.relative(stagedGateRoot, capture.stagedBundle),
        ),
      })),
      reviewHead,
    );
    const currentPriorEvidence = await existingGateSnapshot();
    if (!sameSnapshot(currentPriorEvidence, expectedPriorEvidence)) {
      throw new Error(
        `Canonical gate evidence changed while preparing publication; refusing to supersede it. ` +
          `expected=${JSON.stringify(expectedPriorEvidence)} actual=${JSON.stringify(currentPriorEvidence)}`,
      );
    }
  } catch (error) {
    await fsp.rm(candidate, { recursive: true, force: true });
    throw error;
  }

  const hadPriorEvidence = await pathExists(gateRoot);
  let priorMoved = false;
  let candidateInstalled = false;
  try {
    if (hadPriorEvidence) {
      await fsp.rename(gateRoot, backup);
      priorMoved = true;
    }
    await fsp.rename(candidate, gateRoot);
    candidateInstalled = true;
    const publishedCaptures = captures.map((capture) => ({
      ...capture,
      stagedBundle: path.join(
        gateRoot,
        path.relative(stagedGateRoot, capture.stagedBundle),
      ),
    }));
    await assertCompleteStagedGateTree(gateRoot, publishedCaptures, reviewHead);
  } catch (error) {
    const recoveryErrors = [];
    if (candidateInstalled && (await pathExists(gateRoot))) {
      try {
        await fsp.rename(gateRoot, candidate);
        candidateInstalled = false;
      } catch (recoveryError) {
        recoveryErrors.push(
          `new-tree removal failed: ${recoveryError instanceof Error ? recoveryError.message : String(recoveryError)}`,
        );
      }
    }
    if (
      priorMoved &&
      (await pathExists(backup)) &&
      !(await pathExists(gateRoot))
    ) {
      try {
        await fsp.rename(backup, gateRoot);
        priorMoved = false;
      } catch (recoveryError) {
        recoveryErrors.push(
          `prior-tree restoration failed: ${recoveryError instanceof Error ? recoveryError.message : String(recoveryError)}`,
        );
      }
    }
    if (recoveryErrors.length === 0 && (await pathExists(candidate))) {
      try {
        await fsp.rm(candidate, { recursive: true, force: true });
      } catch (recoveryError) {
        recoveryErrors.push(
          `candidate cleanup failed: ${recoveryError instanceof Error ? recoveryError.message : String(recoveryError)}`,
        );
      }
    }
    if (recoveryErrors.length > 0 && error instanceof Error) {
      error.message += `\nPublication recovery errors: ${recoveryErrors.join("; ")}`;
    }
    throw error;
  }

  let retainedBackup = null;
  if (priorMoved) {
    try {
      await fsp.rm(backup, { recursive: true, force: true });
    } catch {
      retainedBackup = backup;
    }
  }
  return { hadPriorEvidence, retainedBackup };
}

function sameSnapshot(left, right) {
  return (
    left.existed === right.existed &&
    left.files === right.files &&
    left.sha256 === right.sha256
  );
}

async function main() {
  const args = parseArguments(process.argv.slice(2));
  if (args.mode === "help") {
    process.stdout.write(help());
    return;
  }
  if (args.mode === "self-check") {
    process.stdout.write(canonicalJson(await staticSelfCheck()));
    process.stdout.write(
      "PASS: static final-gate runner self-check completed without builds or tests.\n",
    );
    return;
  }

  const validated = await validatePrimary(args.reviewHead);
  const captureLock = await acquireCaptureLock(args.reviewHead);
  let sessionRoot = null;
  let published = false;
  try {
    sessionRoot = await fsp.mkdtemp(
      path.join(os.tmpdir(), "oods-s182-final-gates-"),
    );
    const captures = [];
    for (const config of legs) {
      captures.push(
        await captureDisposable(config, sessionRoot, args.reviewHead),
      );
    }
    const green = [
      await stageCanonicalGreen(captures, "B-12", sessionRoot),
      await stageCanonicalGreen(captures, "B-13", sessionRoot),
    ];
    await finalizeReceipts(captures);
    const stagedGateRoot = path.join(sessionRoot, "staged", gateRootRelative);
    await assertCompleteStagedGateTree(
      stagedGateRoot,
      captures,
      args.reviewHead,
    );

    const receiptDigests = [];
    for (const config of legs) {
      receiptDigests.push({
        gate: config.gate,
        ...(config.leg ? { leg: config.leg } : {}),
        sha256: await readSha(
          path.join(
            sessionRoot,
            "staged",
            config.bundleRelative,
            "receipt.json",
          ),
        ),
      });
    }
    await ensureCheckoutClean(
      repositoryRoot,
      "Primary checkout before publication",
      true,
    );
    const currentPriorEvidence = await existingGateSnapshot();
    if (!sameSnapshot(currentPriorEvidence, validated.priorEvidence)) {
      throw new Error(
        `Canonical gate evidence changed during capture; refusing to supersede it. ` +
          `before=${JSON.stringify(validated.priorEvidence)} after=${JSON.stringify(currentPriorEvidence)}`,
      );
    }
    const publication = await publishStaged(
      sessionRoot,
      captures,
      args.reviewHead,
      validated.priorEvidence,
    );
    published = true;
    process.stdout.write(
      `${canonicalJson({
        status: "passed",
        reviewHead: args.reviewHead,
        gates: managedGates.length,
        disposableWorktrees: legs.length,
        capturesSequential: true,
        concurrentPackageBuilds: false,
        priorEvidence: validated.priorEvidence,
        publication,
        receiptDigests,
        restoredVerifierTrees: green,
      })}\n`,
    );
    process.stdout.write(
      "PASS: B-01 through B-15 recaptured in 19 removed clean detached worktrees.\n",
    );
    process.stdout.write(
      "All prior gate evidence was left untouched until the complete replacement tree passed validation.\n",
    );
    process.stdout.write(
      "The canonical *.log files are ignored by Git; stage them explicitly with git add -f.\n",
    );
    if (publication.retainedBackup) {
      process.stdout.write(
        `WARNING: prior evidence backup could not be removed and remains at ${publication.retainedBackup}.\n`,
      );
    }
  } finally {
    await captureLock.release();
    if (published && sessionRoot)
      await fsp.rm(sessionRoot, { recursive: true, force: true });
    else if (sessionRoot)
      process.stderr.write(
        `Capture failed before publication; disposable diagnostics remain at ${sessionRoot}\n`,
      );
  }
}

main().catch((error) => {
  process.stderr.write(
    `capture-s182-final-gates: ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
});
