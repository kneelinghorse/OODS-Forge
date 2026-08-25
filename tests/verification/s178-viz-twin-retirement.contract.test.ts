import { existsSync, readFileSync } from "node:fs";
import { dirname, extname, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const projectRoot = fileURLToPath(new URL("../../", import.meta.url));

const LEGACY_SHIM_PATHS = [
  "src/viz/a11y/data-analysis.ts",
  "src/viz/a11y/equivalence-rules.ts",
  "src/viz/a11y/facet-table-generator.ts",
  "src/viz/a11y/format.ts",
  "src/viz/a11y/index.ts",
  "src/viz/a11y/narrative-generator.ts",
  "src/viz/a11y/table-generator.ts",
  "src/viz/adapters/echarts-adapter.ts",
  "src/viz/adapters/echarts-interactions.ts",
  "src/viz/adapters/echarts-layout-mapper.ts",
  "src/viz/adapters/interaction-propagator.ts",
  "src/viz/adapters/renderer-selector.ts",
  "src/viz/adapters/scale-resolver.ts",
  "src/viz/adapters/vega-lite-adapter.ts",
  "src/viz/adapters/vega-lite-layout-mapper.ts",
  "src/viz/encoding/color-intensity-mapper.ts",
  "src/viz/patterns/chart-patterns-v2.ts",
  "src/viz/patterns/index.ts",
  "src/viz/patterns/interaction-scorer.ts",
  "src/viz/patterns/layout-scorer.ts",
  "src/viz/patterns/pattern-field-helpers.ts",
  "src/viz/patterns/responsive-scorer.ts",
  "src/viz/patterns/suggest-chart.ts",
  "src/viz/spec/normalized-viz-spec.ts",
  "src/viz/tokens/scale-token-mapper.ts",
  "src/viz/transforms/stack-transform.ts",
] as const;

const SOURCE_EXTENSIONS = new Set([
  ".cjs",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".mts",
  ".ts",
  ".tsx",
]);

type ModuleReferenceKind = "export" | "import" | "require" | "vi.mock";

interface ModuleReference {
  readonly kind: ModuleReferenceKind;
  readonly line: number;
  readonly specifier: string;
}

function withoutSourceExtension(filePath: string): string {
  return filePath.replace(/\.(?:[cm]?[jt]sx?)$/, "");
}

const legacyPathByTarget = new Map(
  LEGACY_SHIM_PATHS.map((legacyPath) => [
    withoutSourceExtension(resolve(projectRoot, legacyPath)),
    legacyPath,
  ]),
);

function listSourceFiles(): string[] {
  const result = spawnSync(
    "git",
    ["ls-files", "-co", "--exclude-standard", "-z"],
    {
      cwd: projectRoot,
      encoding: "buffer",
      maxBuffer: 16 * 1024 * 1024,
    },
  );

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `git ls-files failed with status ${result.status}: ${result.stderr.toString("utf8")}`,
    );
  }

  return result.stdout
    .toString("utf8")
    .split("\0")
    .filter(Boolean)
    .filter((filePath) => SOURCE_EXTENSIONS.has(extname(filePath)))
    .filter((filePath) => !filePath.startsWith("src/viz/"))
    .map((filePath) => resolve(projectRoot, filePath))
    .filter((filePath) => existsSync(filePath));
}

function literalText(node: ts.Node | undefined): string | null {
  return node && ts.isStringLiteralLike(node) ? node.text : null;
}

function collectModuleReferences(filePath: string): ModuleReference[] {
  const sourceText = readFileSync(filePath, "utf8");
  // Every external path to a module below src/viz necessarily carries `viz` in
  // its relative, @/, or ~/ specifier. Avoid parsing thousands of unrelated
  // files so this repository census stays reliable under full-suite load.
  if (!sourceText.includes("viz")) return [];

  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.getScriptKindFromFileName(filePath),
  );
  const references: ModuleReference[] = [];

  function add(
    kind: ModuleReferenceKind,
    specifierNode: ts.Node | undefined,
  ): void {
    const specifier = literalText(specifierNode);
    if (specifier === null) return;
    const { line } = sourceFile.getLineAndCharacterOfPosition(
      specifierNode!.getStart(sourceFile),
    );
    references.push({ kind, line: line + 1, specifier });
  }

  function visit(node: ts.Node): void {
    if (ts.isImportDeclaration(node)) {
      add("import", node.moduleSpecifier);
    } else if (ts.isExportDeclaration(node)) {
      add("export", node.moduleSpecifier);
    } else if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference)
    ) {
      add("require", node.moduleReference.expression);
    } else if (ts.isCallExpression(node)) {
      if (node.expression.kind === ts.SyntaxKind.ImportKeyword) {
        add("import", node.arguments[0]);
      } else if (
        ts.isIdentifier(node.expression) &&
        node.expression.text === "require"
      ) {
        add("require", node.arguments[0]);
      } else if (
        ts.isPropertyAccessExpression(node.expression) &&
        ts.isIdentifier(node.expression.expression) &&
        node.expression.expression.text === "vi" &&
        node.expression.name.text === "mock"
      ) {
        add("vi.mock", node.arguments[0]);
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return references;
}

function resolveLegacyTarget(
  importer: string,
  specifier: string,
): string | null {
  let candidate: string;
  if (specifier.startsWith(".")) {
    candidate = resolve(dirname(importer), specifier);
  } else if (specifier.startsWith("~/")) {
    candidate = resolve(projectRoot, specifier.slice(2));
  } else if (specifier.startsWith("@/")) {
    candidate = resolve(projectRoot, "src", specifier.slice(2));
  } else if (specifier.startsWith("src/")) {
    candidate = resolve(projectRoot, specifier);
  } else if (specifier.startsWith("/")) {
    candidate = resolve(specifier);
  } else {
    return null;
  }

  const target = withoutSourceExtension(candidate);
  return (
    legacyPathByTarget.get(target) ??
    legacyPathByTarget.get(resolve(target, "index")) ??
    null
  );
}

describe("Sprint 178 viz twin retirement rung 1", () => {
  it("keeps the exact 26 compatibility shims deleted", () => {
    expect(LEGACY_SHIM_PATHS).toHaveLength(26);

    const survivingPaths = LEGACY_SHIM_PATHS.filter((legacyPath) =>
      existsSync(resolve(projectRoot, legacyPath)),
    );
    expect(
      survivingPaths,
      "These forwarding modules were retired after their consumers moved to @oods/viz-core; " +
        "restoring one recreates the twin surface.",
    ).toEqual([]);
  });

  it("rejects external import/export/require/vi.mock references to retired paths", () => {
    const violations = listSourceFiles().flatMap((filePath) =>
      collectModuleReferences(filePath).flatMap((reference) => {
        const legacyTarget = resolveLegacyTarget(filePath, reference.specifier);
        if (!legacyTarget) return [];
        return [
          `${relative(projectRoot, filePath)}:${reference.line} ${reference.kind} ` +
            `${JSON.stringify(reference.specifier)} -> ${legacyTarget}`,
        ];
      }),
    );

    expect(
      violations,
      "Consumers must use @oods/viz-core directly; a legacy path would require reviving a deleted shim.",
    ).toEqual([]);
  }, 60_000);

  it("keeps the public viz barrel on viz-core while hooks remain local", () => {
    const barrelPath = resolve(projectRoot, "src/viz/index.ts");
    const references = collectModuleReferences(barrelPath).map(
      (reference) => reference.specifier,
    );

    expect(references).toContain("@oods/viz-core");
    expect(
      references,
      "React hooks are the intentional src-only part of the published viz namespace.",
    ).toContain("./hooks/index.js");
  });
});
