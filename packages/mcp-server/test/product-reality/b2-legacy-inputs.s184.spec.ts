import { promises as fs } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { handle as pipelineHandle } from "../../src/tools/pipeline.js";
import { deriveRepoints, type Repoint } from "../../../../scripts/product-reality/s185-review-carries.js";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../../..");
const dispositionPath = path.join(
  repositoryRoot,
  "artifacts/product-reality/sprint-184/m07/b2-repoint-disposition.json",
);
const remeasurementRoot = path.join(repositoryRoot, "artifacts/product-reality/sprint-185/m04/b2");
// Each wave remeasures the unchanged operands at its own head; the Sprint 184
// disposition and the Sprint 185 base replay stay immutable above.
const currentRemeasurementRoot = path.join(repositoryRoot, "artifacts/product-reality/sprint-186/m01/b2");

type TypedOutcome = {
  id: string;
  input: {
    object: string;
    context?: "detail" | "card";
    framework: "react" | "vue" | "html";
    profile?: "release";
    save?: string;
  };
  profile: "build" | "release";
  step: "codegen";
  code: "OODS-V007" | "OODS-N015" | "OODS-V162";
  message: string;
};

// Frozen v1 history retains its scalar shape. The current additive record uses
// Repoint.changedField: string[] and supplies the comparison field list below.
type HistoricalV1CallSiteDisposition = {
  id: string;
  file: string;
  selector: string;
  invocation: "pipelineHandle";
  pipelineInvocationOrdinal: number;
  changedField: string;
  historicalValue: string | null;
  currentValue: string;
  disposition: "retained-repoint";
  reason: string;
};

type B2Disposition = {
  reviewedSourceHead: string;
  repointCommit: string;
  repointParent: string;
  countBasis: string;
  advertisedBehaviorMovement: {
    intended: boolean;
    scope: string;
    reason: string;
    replacementTest: string;
  };
  summary: {
    reviewCallSites: number;
    restored: number;
    retainedWithReason: number;
  };
  fileCounts: Record<string, number>;
  typedOutcomes: TypedOutcome[];
  callSites: HistoricalV1CallSiteDisposition[];
  excludedNeighboringChanges: Array<{
    invocation: string;
    selector: string;
    reason: string;
  }>;
  status: string;
};

type B2Measurement = {
  historicalDisposition: { path: string; sha256: string };
  inputsUnchanged: boolean;
  savedStoreEntries: string[];
  rows: Array<{
    id: string;
    input: TypedOutcome["input"];
    profile: TypedOutcome["profile"];
    error: { step: string; code: string; message: string } | null;
    codePresent: boolean;
    savedPresent: boolean;
  }>;
};

async function readDisposition(): Promise<B2Disposition> {
  return JSON.parse(
    await fs.readFile(dispositionPath, "utf8"),
  ) as B2Disposition;
}

function testCaseBody(source: string, selector: string): string {
  const selectorOffset = source.indexOf(`'${selector}'`);
  expect(selectorOffset, selector).toBeGreaterThanOrEqual(0);
  const nextCaseOffset = source.indexOf(
    "\n  it",
    selectorOffset + selector.length + 2,
  );
  return source.slice(
    selectorOffset,
    nextCaseOffset >= 0 ? nextCaseOffset : source.length,
  );
}

function gitShow(commit: string, file: string): string {
  const result = spawnSync("git", ["show", `${commit}:${file}`], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  expect(result.status, `${commit}:${file}\n${result.stderr}`).toBe(0);
  return result.stdout;
}

function gitCommand(args: string[], label: string): string {
  const result = spawnSync("git", args, {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  expect(result.status, `${label}\n${result.stderr}`).toBe(0);
  return result.stdout.trim();
}

describe("Sprint 184 m07 B2 legacy-input compatibility disclosure", () => {
  it.each([
    {
      framework: "html" as const,
      code: "OODS-V007",
      message:
        'HTML target cannot preserve binding Stack.onDelete to handleDelete; static output would discard executable behavior.',
    },
    {
      framework: "react" as const,
      code: undefined,
      message: undefined,
    },
    {
      framework: "vue" as const,
      code: undefined,
      message: undefined,
    },
  ])(
    // Sprint 185 ported DetailHeader and Sprint 186 m01 ports PriceSummary,
    // ClassificationPanel and FilterPanel; the unchanged Product/detail operand
    // reached the unsupported StatusTimeline.label prop. Sprint 187 repairs
    // that producer; React/Vue now succeed with the identical operand. The
    // Sprint 184 observation remains immutable and is replayed against base below.
    "remeasures the unchanged Product/detail $framework operand after the producer repair",
    async ({ framework, code, message }) => {
      const result = await pipelineHandle({
        object: "Product",
        context: "detail",
        framework,
      });

      if (framework === "html") {
        expect(result.error).toEqual({ step: "codegen", code, message });
        expect(result.code).toBeUndefined();
      } else {
        expect(result.error).toBeUndefined();
        expect(result.code).toBeDefined();
      }
      expect(result.saved).toBeUndefined();
      expect(result.validationReceipt.profile).toBe("build");
      expect(result.pipeline.steps).toEqual([
        "compose",
        "validate",
        "render",
        "codegen",
      ]);
    },
  );

  it("retains OODS-V162 for Product/card/HTML at release without evidence", async () => {
    const result = await pipelineHandle({
      object: "Product",
      context: "card",
      framework: "html",
      profile: "release",
    });

    expect(result.error).toEqual({
      step: "codegen",
      code: "OODS-V162",
      message:
        "Release profile is missing required evidence: rendered, interaction, accessibility, theme, determinism, performance. References are format-checked and hash-bound, not re-executed.",
    });
    expect(result.code).toBeUndefined();
    expect(result.saved).toBeUndefined();
    expect(result.validationReceipt.profile).toBe("release");
    expect(result.pipeline.steps).toEqual([
      "compose",
      "validate",
      "render",
      "codegen",
    ]);
  });

  it("returns a typed OODS-V007 error on the no-context Product/HTML save path", async () => {
    const tempRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "oods-s184-b2-default-"),
    );
    const previousRoot = process.env.MCP_SCHEMA_STORE_ROOT;
    const previousDirectory = process.env.MCP_SCHEMA_STORE_DIR;
    process.env.MCP_SCHEMA_STORE_ROOT = tempRoot;
    delete process.env.MCP_SCHEMA_STORE_DIR;

    try {
      const result = await pipelineHandle({
        object: "Product",
        framework: "html",
        save: "s184-b2-no-context",
      });

      expect(result).toHaveProperty("error");
      expect(result.error).toEqual({
        step: "codegen",
        code: "OODS-V007",
        message:
          'HTML target cannot preserve binding SearchInput.onUpdate to handleUpdate_searchQuery; static output would discard executable behavior.',
      });
      expect(result.code).toBeUndefined();
      expect(result.saved).toBeUndefined();
      expect(result.validationReceipt.profile).toBe("build");
      expect(result.pipeline.steps).toEqual([
        "compose",
        "validate",
        "render",
        "codegen",
      ]);
      expect(await fs.readdir(tempRoot)).toEqual([]);
    } finally {
      if (previousRoot === undefined) delete process.env.MCP_SCHEMA_STORE_ROOT;
      else process.env.MCP_SCHEMA_STORE_ROOT = previousRoot;
      if (previousDirectory === undefined)
        delete process.env.MCP_SCHEMA_STORE_DIR;
      else process.env.MCP_SCHEMA_STORE_DIR = previousDirectory;
      await fs.rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("binds all 13 retained repoints to a source selector and a non-empty reason", async () => {
    const disposition = await readDisposition();
    expect(disposition).toMatchObject({
      reviewedSourceHead: "9a4202fe3ff8560a791cc92c114ef364739a1c45",
      repointCommit: "3993c2b6dbe875ec8ea202c803b5e52bfda59be6",
      repointParent: "ed1568407fa3e1894d1b40fc4cca05f51e46f89b",
      status: "passed",
      advertisedBehaviorMovement: {
        intended: true,
        replacementTest:
          "packages/mcp-server/test/product-reality/b2-legacy-inputs.s184.spec.ts",
      },
      summary: {
        reviewCallSites: 13,
        restored: 0,
        retainedWithReason: 13,
      },
    });
    expect(
      gitCommand(
        ["rev-parse", `${disposition.repointCommit}^`],
        "resolve the repoint commit parent",
      ),
    ).toBe(disposition.repointParent);
    gitCommand(
      [
        "merge-base",
        "--is-ancestor",
        disposition.repointCommit,
        disposition.reviewedSourceHead,
      ],
      "prove the repoint commit is an ancestor of the reviewed source head",
    );
    expect(disposition.countBasis).toContain(
      "pipelineHandle invocation operands",
    );
    expect(disposition.advertisedBehaviorMovement.scope).toContain("OODS-V007");
    expect(disposition.advertisedBehaviorMovement.scope).toContain("OODS-N015");
    expect(disposition.advertisedBehaviorMovement.scope).toContain("OODS-V162");
    expect(disposition.advertisedBehaviorMovement.reason).toContain(
      "Decisions 1673 and 1678",
    );

    expect(disposition.callSites.map(({ id }) => id)).toEqual([
      "pipeline-compact-default",
      "pipeline-summary",
      "pipeline-compact-opt-out",
      "pipeline-object-fields",
      "actions-synthetic-lifecycle",
      "actions-empty-mappings",
      "actions-absent-mappings",
      "actions-stage1-aliases",
      "actions-stage1-slot-actions",
      "actions-stripe-vocabulary",
      "contract-save-name-tags",
      "contract-save-tags-roundtrip",
      "tier1-html-save-load-health",
    ]);
    expect(new Set(disposition.callSites.map(({ id }) => id)).size).toBe(13);
    expect(
      disposition.callSites.every(({ reason }) => reason.trim().length >= 80),
    ).toBe(true);
    expect(
      disposition.callSites.every(
        ({ disposition: state }) => state === "retained-repoint",
      ),
    ).toBe(true);

    const derivedFileCounts = Object.fromEntries(
      Object.entries(
        Object.groupBy(disposition.callSites, ({ file }) => file),
      ).map(([file, rows]) => [file, rows?.length ?? 0]),
    );
    expect(derivedFileCounts).toEqual(disposition.fileCounts);
    expect(disposition.fileCounts).toEqual({
      "packages/mcp-server/test/tools/pipeline.compact.spec.ts": 4,
      "packages/mcp-server/test/e2e/action-mappings.e2e.spec.ts": 6,
      "packages/mcp-server/test/contracts/contract-alignment.spec.ts": 2,
      "packages/mcp-server/test/e2e/tier1-acceptance.e2e.spec.ts": 1,
    });

    const sourceByFile = new Map<string, string>();
    for (const callSite of disposition.callSites) {
      let source = sourceByFile.get(callSite.file);
      if (source === undefined) {
        source = await fs.readFile(
          path.join(repositoryRoot, callSite.file),
          "utf8",
        );
        sourceByFile.set(callSite.file, source);
      }
      const body = testCaseBody(source, callSite.selector);
      expect(body, callSite.id).toContain(`${callSite.invocation}({`);
      expect(body, callSite.id).toContain(
        `${callSite.changedField}: '${callSite.currentValue}'`,
      );
      if (callSite.historicalValue !== null) {
        expect(body, callSite.id).not.toContain(
          `${callSite.changedField}: '${callSite.historicalValue}'`,
        );
      }
    }

    // The immutable v1 record only named intent/context. The additive current
    // record supplies the actual field list and exposes multi-axis repoints.
    const current = JSON.parse(await fs.readFile(path.join(
      repositoryRoot, "artifacts/product-reality/sprint-185/m05/review-carries/b2-repoint-disposition.v2.json",
    ), "utf8")) as { comparisonFields: string[]; callSites: Repoint[] };
    const rederivedRepoints = Object.keys(disposition.fileCounts).flatMap((file) => deriveRepoints(
      file,
      gitShow(disposition.repointParent, file),
      gitShow(disposition.repointCommit, file),
      current.comparisonFields,
    ));
    expect(rederivedRepoints).toEqual(current.callSites.map(({
      file, pipelineInvocationOrdinal, changedField, historicalValue, currentValue,
    }) => ({ file, pipelineInvocationOrdinal, changedField, historicalValue, currentValue })));
    // Retain agreement with every historical axis, without hiding the newly
    // disclosed absent -> html framework axis on actions-stripe-vocabulary.
    for (const old of disposition.callSites) {
      const row = rederivedRepoints.find((candidate) => candidate.file === old.file &&
        candidate.pipelineInvocationOrdinal === old.pipelineInvocationOrdinal)!;
      expect(row.changedField).toContain(old.changedField);
      expect(row.historicalValue[old.changedField]).toEqual(old.historicalValue === null
        ? { kind: "absent" } : { kind: "literal", value: old.historicalValue });
      expect(row.currentValue[old.changedField]).toEqual({ kind: "literal", value: old.currentValue });
    }

    expect(disposition.excludedNeighboringChanges).toEqual([
      expect.objectContaining({
        invocation: "composeHandle",
        selector:
          "meta.unresolvedEntity is stamped on composed nodes matching an unresolved sourceComponent",
      }),
    ]);
  });

  it("binds historical B2 outcomes to their base replay and current remeasurement without changing operands", async () => {
    const disposition = await readDisposition();
    expect(
      disposition.typedOutcomes.map(({ id, code }) => ({ id, code })),
    ).toEqual([
      { id: "product-detail-html-build", code: "OODS-V007" },
      { id: "product-detail-react-build", code: "OODS-N015" },
      { id: "product-detail-vue-build", code: "OODS-N015" },
      { id: "product-card-html-release", code: "OODS-V162" },
      { id: "product-no-context-html-build-save", code: "OODS-V007" },
    ]);

    const base = JSON.parse(await fs.readFile(path.join(remeasurementRoot, "base/measurement.json"), "utf8")) as B2Measurement;
    const current = JSON.parse(await fs.readFile(path.join(currentRemeasurementRoot, "final/measurement.json"), "utf8")) as B2Measurement;
    const historicalSha256 = createHash("sha256").update(await fs.readFile(dispositionPath)).digest("hex");
    for (const measurement of [base, current]) {
      expect(measurement.historicalDisposition.sha256).toBe(historicalSha256);
      expect(measurement.inputsUnchanged).toBe(true);
      expect(measurement.savedStoreEntries).toEqual([]);
      expect(measurement.rows.map(({ id, input }) => ({ id, input })))
        .toEqual(disposition.typedOutcomes.map(({ id, input }) => ({ id, input })));
    }
    for (const outcome of disposition.typedOutcomes) {
      expect(base.rows.find(({ id }) => id === outcome.id)?.error).toEqual({
        step: outcome.step, code: outcome.code, message: outcome.message,
      });
    }

    const tempRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "oods-s184-b2-bindings-"),
    );
    const previousRoot = process.env.MCP_SCHEMA_STORE_ROOT;
    const previousDirectory = process.env.MCP_SCHEMA_STORE_DIR;
    process.env.MCP_SCHEMA_STORE_ROOT = tempRoot;
    delete process.env.MCP_SCHEMA_STORE_DIR;

    try {
      for (const outcome of disposition.typedOutcomes) {
        const expected = current.rows.find(({ id }) => id === outcome.id)!;
        const result = await pipelineHandle(outcome.input);
        const repaired = ['product-detail-react-build', 'product-detail-vue-build'].includes(outcome.id);
        // Frozen s186 measurements remain negative. The same operands now reach
        // generated code after s187 fixes the default composer's timeline prop.
        if (repaired) {
          expect(result.error, outcome.id).toBeUndefined();
          expect(result.code, outcome.id).toBeDefined();
        } else {
          // Historical receipts stay immutable; Sprint194 adds the explicit
          // hash-only disclosure without changing the refusal code or operand.
          const expectedNow = expected.error?.code === "OODS-V162"
            ? { ...expected.error, message: expected.error.message + " References are format-checked and hash-bound, not re-executed." }
            : expected.error?.code === "OODS-V007"
              // s198 preserves HTML tab trees. The same operands now reach the
              // explicit static-action refusal; historical receipts remain intact.
              ? { ...expected.error, message: outcome.id === "product-detail-html-build"
                ? "HTML target cannot preserve binding Stack.onDelete to handleDelete; static output would discard executable behavior."
                : "HTML target cannot preserve binding SearchInput.onUpdate to handleUpdate_searchQuery; static output would discard executable behavior." }
              : expected.error;
          expect(result.error, outcome.id).toEqual(expectedNow);
          expect(result.code, outcome.id).toBeUndefined();
        }
        expect(result.validationReceipt.profile, outcome.id).toBe(
          outcome.profile,
        );
        expect(result.saved, outcome.id).toBeUndefined();
        expect(expected.codePresent, outcome.id).toBe(false);
        expect(expected.savedPresent, outcome.id).toBe(false);
      }
      expect(await fs.readdir(tempRoot)).toEqual([]);
    } finally {
      if (previousRoot === undefined) delete process.env.MCP_SCHEMA_STORE_ROOT;
      else process.env.MCP_SCHEMA_STORE_ROOT = previousRoot;
      if (previousDirectory === undefined)
        delete process.env.MCP_SCHEMA_STORE_DIR;
      else process.env.MCP_SCHEMA_STORE_DIR = previousDirectory;
      await fs.rm(tempRoot, { recursive: true, force: true });
    }
  });
});
