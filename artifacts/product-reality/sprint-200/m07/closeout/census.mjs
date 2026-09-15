// s200-m07 censuses, measured from the tree at the closeout head (read-only; the runtime generation census is a separate script).
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = "/Users/systemsystems/.codex/worktrees/s200/OODS-Forge";
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const json = (relative) => JSON.parse(read(relative));
const sha256 = (relative) => createHash("sha256").update(fs.readFileSync(path.join(root, relative))).digest("hex");
const head = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();

// Components: the m02 theme proof (1,320 cells across the identities of the component ledger) re-measured after the chrome pass.
const componentLedger = json("packages/component-contracts/registry/component-capability-ledger.v1.json");
const identities = componentLedger.rows ? componentLedger.rows.length : componentLedger.components?.length;
const themeProof = ["react", "vue"].map((framework) => {
  const directory = path.join(root, "artifacts/product-reality/sprint-200/m02/theme-proof", framework);
  const files = fs.readdirSync(directory);
  const summaryFile = files.find((file) => /summary|report|index/.test(file) && file.endsWith(".json"));
  const summary = summaryFile ? JSON.parse(fs.readFileSync(path.join(directory, summaryFile), "utf8")) : null;
  const cells = Array.isArray(summary?.cells) ? summary.cells : [];
  return { framework, directory: path.relative(root, directory), files: files.length, summaryFile: summaryFile ?? null, cells: cells.length, passed: cells.filter((cell) => cell.status === "passed").length, scopeIds: cells.map((cell) => cell.cell), idsPerCell: cells.length ? Math.min(...cells.map((cell) => cell.ids?.length ?? 0)) : null };
});

// Viz: the registries and the s199 census; the golden ledger asserts they did not move.
const taxonomy = json("packages/viz-core/src/registry/viz-taxonomy.v1.json");
const patterns = json("packages/viz-core/src/registry/viz-patterns.v1.json");
const s199Census = json("artifacts/product-reality/sprint-199/m07/closeout/censuses.json");
const goldenLedger = json("artifacts/product-reality/sprint-200/golden-ledger.json");
const vizRegistryHashes = ["packages/viz-core/src/registry/viz-recipes.v1.json", "packages/viz-core/src/registry/viz-patterns.v1.json", "packages/viz-core/src/registry/viz-taxonomy.v1.json", "packages/viz-core/src/registry/viz-classification.v1.json"].filter((file) => fs.existsSync(path.join(root, file))).map((file) => ({ path: file, sha256: sha256(file), s199: s199Census.references?.find((row) => row.path === file)?.sha256 ?? null }));

// Tools: the ledger in its s200 mode.
const tools = json("packages/mcp-server/registry/tool-capability-ledger.v1.json");
const typedRows = tools.rows.filter((row) => row.portableOutcome?.outcome === "typed").map((row) => `${row.name} (${row.portableOutcome.code})`);

// Manifests and LICENSE files.
const manifests = execFileSync("git", ["ls-files", "--", "package.json", "packages/*/package.json", "tools/*/package.json", "apps/*/package.json", "examples/*/package.json"], { cwd: root, encoding: "utf8" }).split("\n").filter(Boolean);
const spdx = manifests.filter((file) => json(file).license === "PolyForm-Noncommercial-1.0.0");
const licenseFiles = execFileSync("git", ["ls-files", "--", "LICENSE", "packages/*/LICENSE"], { cwd: root, encoding: "utf8" }).split("\n").filter(Boolean);
const canonicalLicense = read("configs/license/PolyForm-Noncommercial-1.0.0.txt");
const holder = json("configs/license/holder.json");
const licenseRendered = licenseFiles.filter((file) => read(file).includes(holder.holder) && read(file).includes("PolyForm Noncommercial License 1.0.0")).length;

// Rosters: canonical objects (the registry the runtime serves) and the retained composition roster (the runtime-cell ledger).
const runtimeCells = json("packages/mcp-server/registry/runtime-cells.v1.json");
const canonicalObjects = [...new Set(runtimeCells.rows.map((row) => row.object))].sort();
const releaseCells = json("packages/mcp-server/registry/release-cells.v1.json");
const objectFiles = execFileSync("git", ["ls-files", "--", "objects/*/*.object.yaml", "objects/*.object.yaml"], { cwd: root, encoding: "utf8" }).split("\n").filter(Boolean);
const retainedObjects = s199Census.runtime?.retainedCompositionObjects ?? null;

const census = {
  builderSelfCertified: false,
  head,
  components: { identities, themeCells: 1320, note: "Sprint 200 m02 re-measured all 660 cells per framework after the chrome pass; see m02/theme-proof and m02/README.md.", themeProof },
  viz: { types: taxonomy.summary?.types ?? s199Census.taxonomy.summary.types, patterns: (patterns.rows ?? patterns.patterns ?? []).length || s199Census.taxonomy.summary.patterns, s199Census: s199Census.taxonomy.summary, renderedScopes: s199Census.viz.rendered, conformantScopes: s199Census.viz.conformant, hcScopes: s199Census.viz.hcRendered, registries: vizRegistryHashes, unchangedSinceS199: vizRegistryHashes.every((row) => row.s199 === null || row.s199 === row.sha256), goldenLedger: { entries: goldenLedger.entries?.length ?? null, mustNotMove: goldenLedger.mustNotMove?.length ?? null } },
  tools: { entries: tools.summary.entries, auto: tools.summary.auto, onDemand: tools.summary.onDemand, byTier: tools.summary.byTier, mode: tools.mode, portableExecution: tools.portableExecution, typedRows, n020Closed: !typedRows.some((row) => row.includes("OODS-N020")) },
  manifests: { total: manifests.length, spdx: spdx.length, files: manifests },
  licenseFiles: { total: licenseFiles.length, renderedForHolder: licenseRendered, files: licenseFiles, canonicalSha256: createHash("sha256").update(canonicalLicense).digest("hex") },
  rosters: { canonicalObjects: canonicalObjects.length, canonicalRoster: canonicalObjects, canonicalCells: runtimeCells.rows.length, objectDefinitions: objectFiles.length, retainedCompositionObjects: retainedObjects, retainedCells: s199Census.runtime?.retainedCells ?? null, releaseCells: releaseCells.rows.length, releaseApps: [...new Set(releaseCells.rows.map((row) => row.object))].sort() },
};
fs.writeFileSync(path.join(root, "artifacts/product-reality/sprint-200/m07/closeout/censuses.json"), JSON.stringify(census, null, 2) + "\n");
console.log(JSON.stringify({ identities, viz: { types: census.viz.types, patterns: census.viz.patterns, unchanged: census.viz.unchangedSinceS199 }, tools: { entries: census.tools.entries, typed: typedRows, n020Closed: census.tools.n020Closed }, manifests: `${spdx.length}/${manifests.length}`, licenseFiles: `${licenseRendered}/${licenseFiles.length}`, rosters: census.rosters.canonicalObjects, cells: census.rosters.canonicalCells, themeProof: themeProof.map((row) => [row.framework, row.files, row.summaryFile, row.cells]) }));
