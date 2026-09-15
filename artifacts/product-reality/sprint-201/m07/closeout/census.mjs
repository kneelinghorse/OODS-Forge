// s201-m07 censuses, measured from the tree at the closeout head (read-only; the runtime generation census is a separate script).
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = "/Users/systemsystems/.codex/worktrees/s201/OODS-Forge";
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const json = (relative) => JSON.parse(read(relative));
const sha256 = (relative) => createHash("sha256").update(fs.readFileSync(path.join(root, relative))).digest("hex");
const head = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
const base = "c02f3ddcbc6a74dd5e16a5c7a95736f533ca98f7";
const blobSha = (relative) => createHash("sha256").update(execFileSync("git", ["show", `${base}:${relative}`], { cwd: root, maxBuffer: 64 * 1024 * 1024 })).digest("hex");

// Components: the identities of the component ledger; the theme cells were last re-measured in Sprint 200 m02 (1,320) and no component or
// stylesheet identity changed this sprint apart from the PaginationBar narrow layout rule, which the m06 after-capture screenshots carry.
const componentLedger = json("packages/component-contracts/registry/component-capability-ledger.v1.json");
const identities = componentLedger.rows ? componentLedger.rows.length : componentLedger.components?.length;

// Viz: the registries against the base; the golden ledger attributes the two chart-title moves.
const taxonomy = json("packages/viz-core/src/registry/viz-taxonomy.v1.json");
const patterns = json("packages/viz-core/src/registry/viz-patterns.v1.json");
const recipes = json("packages/viz-core/src/registry/viz-recipes.v1.json");
const s199Census = json("artifacts/product-reality/sprint-199/m07/closeout/censuses.json");
const goldenLedger = json("artifacts/product-reality/sprint-201/golden-ledger.json");
const vizRegistryFiles = ["packages/viz-core/src/registry/viz-recipes.v1.json", "packages/viz-core/src/registry/viz-patterns.v1.json", "packages/viz-core/src/registry/viz-taxonomy.v1.json", "packages/viz-core/src/registry/viz-classification.v1.json", "packages/viz-render/certified-matrix.json"];
const vizRegistries = vizRegistryFiles.map((file) => ({ file, sha256: sha256(file), baseSha256: blobSha(file), moved: sha256(file) !== blobSha(file), ledgerEntries: goldenLedger.entries.filter((entry) => entry.file === file).length }));
const renderScopes = recipes.flatMap((row) => row.renderScopes ?? []);
const certifiedMatrix = json("packages/viz-render/certified-matrix.json");

// Tools: the ledger in its s201 mode.
const tools = json("packages/mcp-server/registry/tool-capability-ledger.v1.json");
const typedRows = tools.rows.filter((row) => row.portableOutcome?.outcome === "typed").map((row) => `${row.name} (${row.portableOutcome.code})`);
const executedRows = tools.rows.filter((row) => row.portableOutcome?.outcome === "executed" || row.portableOutcome?.outcome === "pass").length;

// Rosters: canonical objects (the registry the runtime serves) and the retained composition roster.
const runtimeCells = json("packages/mcp-server/registry/runtime-cells.v1.json");
const canonicalObjects = [...new Set(runtimeCells.rows.map((row) => row.object))].sort();
const releaseCells = json("packages/mcp-server/registry/release-cells.v1.json");
const objectFiles = execFileSync("git", ["ls-files", "--", "objects/*/*.object.yaml", "objects/*.object.yaml"], { cwd: root, encoding: "utf8" }).split("\n").filter(Boolean);
const s200Census = json("artifacts/product-reality/sprint-200/m07/closeout/censuses.json");

// Bundle: the frozen archive from part B, when present.
const manifestPath = "artifacts/product-reality/sprint-201/m07/pre-freeze/portable-manifest.json";
const archiveShaPath = "artifacts/product-reality/sprint-201/m07/pre-freeze/portable-archive.sha256";
const manifest = fs.existsSync(path.join(root, manifestPath)) ? json(manifestPath) : null;
const archiveSha = fs.existsSync(path.join(root, archiveShaPath)) ? read(archiveShaPath).trim() : null;

const census = {
  builderSelfCertified: false,
  head,
  base,
  components: { identities, themeCells: 1320, note: "Sprint 200 m02 re-measured all 1,320 cells (6 scopes × 110 identities × 2 frameworks); Sprint 201 changed one stylesheet rule (the PaginationBar grid under 600px) and no component identity; the m06 after-capture screenshots carry the narrow layout in both frameworks." },
  viz: {
    types: taxonomy.summary?.types ?? s199Census.taxonomy?.summary?.types ?? recipes.length,
    recipes: recipes.length, renderScopes: renderScopes.length, renderedScopes: renderScopes.filter((scope) => scope.status === "rendered").length,
    patterns: (patterns.rows ?? patterns.patterns ?? patterns).length,
    certifiedMatrixEpoch: certifiedMatrix.renderHashEpoch, certifiedFamilies: Object.keys(certifiedMatrix.normalizedSvgHashes).length,
    registries: vizRegistries,
    movedThisSprint: vizRegistries.filter((row) => row.moved).map((row) => row.file),
    note: "The recipes registry (sankey and force_graph renderScopes) and the certified matrix (sankey and force_graph) moved once in m06 for the two chart titles (#2060), attributed in sprint-201/golden-ledger.json and m06/certified-matrix; the pattern registry, taxonomy and classification are byte-identical to the base.",
  },
  tools: { entries: tools.summary?.entries ?? tools.rows.length, auto: tools.summary?.auto, onDemand: tools.summary?.onDemand, byTier: tools.summary?.byTier, mode: tools.mode, portableExecution: tools.portableExecution, typedRows, executedRows, n019Closed: !typedRows.some((row) => row.includes("OODS-N019")) },
  rosters: { canonicalObjects: canonicalObjects.length, canonicalRoster: canonicalObjects, canonicalCells: runtimeCells.rows.length, runtimeRegistryHead: runtimeCells.head, runtimeRunId: runtimeCells.runId ?? null, runtimeMovedCells: goldenLedger.entries.filter((entry) => entry.file === "packages/mcp-server/registry/runtime-cells.v1.json" && entry.pin !== "ledger head").length, objectDefinitions: objectFiles.length, releaseCells: releaseCells.rows.length, retainedCompositionObjects: s200Census.rosters?.retainedCompositionObjects ?? null, retainedCells: s200Census.rosters?.retainedCells ?? null },
  goldenLedger: { entries: goldenLedger.entries.length, mustNotMove: goldenLedger.mustNotMove.length, mayMoveOnce: goldenLedger.mayMoveOnce.length, files: [...new Set(goldenLedger.entries.map((entry) => entry.file))] },
  bundle: manifest ? { closurePackages: manifest.sbomLite?.packageCount ?? null, thirdPartyCount: manifest.thirdPartyCount ?? null, payloadTreeEntryCount: manifest.payloadTreeEntryCount ?? null, archiveByteSize: manifest.archive?.byteSize ?? null, archiveSha256: manifest.archive?.sha256 ?? archiveSha, commit: manifest.commit, dirty: manifest.dirty } : { closurePackages: null, archiveSha256: archiveSha, note: "part B not yet run" },
};
fs.writeFileSync(path.join(root, "artifacts/product-reality/sprint-201/m07/closeout/censuses.json"), JSON.stringify(census, null, 2) + "\n");
console.log(JSON.stringify({ identities, viz: { types: census.viz.types, scopes: census.viz.renderedScopes, moved: census.viz.movedThisSprint }, tools: { entries: census.tools.entries, executed: census.tools.executedRows, typed: typedRows }, rosters: { objects: census.rosters.canonicalObjects, cells: census.rosters.canonicalCells, moved: census.rosters.runtimeMovedCells }, ledger: census.goldenLedger.entries, bundle: census.bundle }));
