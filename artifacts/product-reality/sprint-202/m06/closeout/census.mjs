// s202-m06 censuses, measured from the tree at the closeout head (read-only; the runtime generation census is a separate script).
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = "/Users/systemsystems/.codex/worktrees/s202/OODS-Forge";
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const json = (relative) => JSON.parse(read(relative));
const exists = (relative) => fs.existsSync(path.join(root, relative));
const sha256 = (relative) => createHash("sha256").update(fs.readFileSync(path.join(root, relative))).digest("hex");
const head = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
/** 04182b116: the Sprint 201 merge, the Sprint 202 base. */
const base = "04182b116703088773ab7e414c6d7d6721c6c24e";
const blobSha = (relative) => createHash("sha256").update(execFileSync("git", ["show", `${base}:${relative}`], { cwd: root, maxBuffer: 64 * 1024 * 1024 })).digest("hex");

// Components: the identities of the component ledger against the base; the theme cells were last re-measured in Sprint 200 m02 (1,320).
const componentLedgerPath = "packages/component-contracts/registry/component-capability-ledger.v1.json";
const componentLedger = json(componentLedgerPath);
const identities = componentLedger.rows ? componentLedger.rows.length : componentLedger.components?.length;
const componentStylesMoved = execFileSync("git", ["diff", "--name-only", base, "HEAD", "--", "packages/component-styles/src"], { cwd: root, encoding: "utf8" }).split("\n").filter(Boolean);

// Viz: the registries against the base; the golden ledger must show the pattern registry and the certified matrix unmoved.
const taxonomy = json("packages/viz-core/src/registry/viz-taxonomy.v1.json");
const patterns = json("packages/viz-core/src/registry/viz-patterns.v1.json");
const recipes = json("packages/viz-core/src/registry/viz-recipes.v1.json");
const s199Census = json("artifacts/product-reality/sprint-199/m07/closeout/censuses.json");
const goldenLedger = json("artifacts/product-reality/sprint-202/golden-ledger.json");
const vizRegistryFiles = ["packages/viz-core/src/registry/viz-recipes.v1.json", "packages/viz-core/src/registry/viz-patterns.v1.json", "packages/viz-core/src/registry/viz-taxonomy.v1.json", "packages/viz-core/src/registry/viz-classification.v1.json", "packages/viz-render/certified-matrix.json"];
const vizRegistries = vizRegistryFiles.map((file) => ({ file, sha256: sha256(file), baseSha256: blobSha(file), moved: sha256(file) !== blobSha(file), ledgerEntries: goldenLedger.entries.filter((entry) => entry.file === file).length }));
const renderScopes = recipes.flatMap((row) => row.renderScopes ?? []);
const certifiedMatrix = json("packages/viz-render/certified-matrix.json");

// Tools: the ledger in its current mode.
const tools = json("packages/mcp-server/registry/tool-capability-ledger.v1.json");
const typedRows = tools.rows.filter((row) => row.portableOutcome?.outcome === "typed").map((row) => `${row.name} (${row.portableOutcome.code})`);
const executedRows = tools.rows.filter((row) => row.portableOutcome?.outcome === "pass").length;

// Rosters: canonical objects (the registry the runtime serves) and the retained composition roster.
const runtimeCells = json("packages/mcp-server/registry/runtime-cells.v1.json");
const canonicalObjects = [...new Set(runtimeCells.rows.map((row) => row.object))].sort();
const releaseCells = json("packages/mcp-server/registry/release-cells.v1.json");
const objectFiles = execFileSync("git", ["ls-files", "--", "objects/*/*.object.yaml", "objects/*.object.yaml"], { cwd: root, encoding: "utf8" }).split("\n").filter(Boolean);
const s200Census = json("artifacts/product-reality/sprint-200/m07/closeout/censuses.json");

// Bundle and the preview app: the frozen archive from part B and its E2E, when present.
const preFreeze = "artifacts/product-reality/sprint-202/m06/pre-freeze";
const manifest = exists(`${preFreeze}/portable-manifest.json`) ? json(`${preFreeze}/portable-manifest.json`) : null;
const archiveSha = exists(`${preFreeze}/portable-archive.sha256`) ? read(`${preFreeze}/portable-archive.sha256`).trim() : null;
const e2e = exists(`${preFreeze}/e2e-host.json`) ? json(`${preFreeze}/e2e-host.json`) : null;
const linux = exists(`${preFreeze}/linux/preview-proof.json`) ? json(`${preFreeze}/linux/preview-proof.json`) : null;

const census = {
  builderSelfCertified: false,
  head,
  base,
  components: { identities, themeCells: 1320, componentStylesChangedFiles: componentStylesMoved, note: "Sprint 200 m02 re-measured all 1,320 cells (6 scopes × 110 identities × 2 frameworks). Sprint 202 changed no component identity; component-styles changed only for the placed chart's figure (the narrow render shown through a container query, m01), carried by the m01 after receipts." },
  viz: {
    types: taxonomy.summary?.types ?? s199Census.taxonomy?.summary?.types ?? recipes.length,
    recipes: recipes.length, renderScopes: renderScopes.length, renderedScopes: renderScopes.filter((scope) => scope.status === "rendered").length,
    patterns: (patterns.rows ?? patterns.patterns ?? patterns).length,
    certifiedMatrixEpoch: certifiedMatrix.renderHashEpoch, certifiedFamilies: Object.keys(certifiedMatrix.normalizedSvgHashes).length,
    registries: vizRegistries,
    movedThisSprint: vizRegistries.filter((row) => row.moved).map((row) => row.file),
  },
  tools: { entries: tools.summary?.entries ?? tools.rows.length, auto: tools.summary?.auto, onDemand: tools.summary?.onDemand, byTier: tools.summary?.byTier, mode: tools.mode, portableExecution: tools.portableExecution, typedRows, executedRows },
  rosters: { canonicalObjects: canonicalObjects.length, canonicalRoster: canonicalObjects, canonicalCells: runtimeCells.rows.length, runtimeRegistryHead: runtimeCells.head, runtimeRunId: runtimeCells.runId ?? null, runtimeMovedCells: goldenLedger.entries.filter((entry) => entry.file === "packages/mcp-server/registry/runtime-cells.v1.json" && entry.pin !== "ledger head").length, objectDefinitions: objectFiles.length, releaseCells: releaseCells.rows.length, retainedCompositionObjects: s200Census.rosters?.retainedCompositionObjects ?? null, retainedCells: s200Census.rosters?.retainedCells ?? null },
  goldenLedger: { entries: goldenLedger.entries.length, mustNotMove: goldenLedger.mustNotMove.length, mayMoveOnce: goldenLedger.mayMoveOnce.length, files: [...new Set(goldenLedger.entries.map((entry) => entry.file))] },
  bundle: manifest ? { thirdPartyCount: manifest.thirdPartyCount ?? null, closurePackages: manifest.sbomLite?.packageCount ?? null, payloadTreeEntryCount: manifest.payloadTreeEntryCount ?? null, archiveByteSize: manifest.archive?.byteSize ?? null, archiveSha256: manifest.archive?.sha256 ?? archiveSha, commit: manifest.commit, dirty: manifest.dirty } : { archiveSha256: archiveSha, note: "part B not yet run" },
  previewApp: e2e?.calls?.mcpApps?.app ?? null,
  e2e: e2e ? { status: e2e.status, tools: e2e.tools?.count, calls: e2e.calls?.totalAcrossProcesses, negotiated: Boolean(e2e.calls?.mcpApps?.negotiation?.includes("negotiated")), restartTextOnly: Boolean(e2e.lifecycle?.restart?.negotiation?.includes("not advertised")) } : null,
  linux: linux ? { pass: linux.pass, platform: linux.platform, node: linux.node, checks: Object.keys(linux.checks ?? {}).length, checksPassed: Object.values(linux.checks ?? {}).filter(Boolean).length } : null,
};
fs.writeFileSync(path.join(root, "artifacts/product-reality/sprint-202/m06/closeout/censuses.json"), JSON.stringify(census, null, 2) + "\n");
console.log(JSON.stringify({ identities, componentStylesChanged: componentStylesMoved.length, viz: { types: census.viz.types, scopes: census.viz.renderedScopes, patterns: census.viz.patterns, moved: census.viz.movedThisSprint }, tools: { entries: census.tools.entries, mode: census.tools.mode, executed: census.tools.executedRows, typed: typedRows }, rosters: { objects: census.rosters.canonicalObjects, cells: census.rosters.canonicalCells, moved: census.rosters.runtimeMovedCells, release: census.rosters.releaseCells }, ledger: census.goldenLedger.entries, bundle: census.bundle, previewApp: census.previewApp && { bytes: census.previewApp.bytes, revision: census.previewApp.revision }, e2e: census.e2e, linux: census.linux }));
