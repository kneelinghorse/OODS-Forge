#!/usr/bin/env node
// Sprint 185 m01 — nucleus pin inventory.
//
// Joins three sources into artifacts/product-reality/sprint-185/m01/pin-inventory.json:
//   1. the expectation: the grep inventory named in decision #1725;
//   2. the measurement: the red-control summary (the identical single-literal
//      mutation at the sprint base) and the green-control summary (the same
//      mutation after the pins derive);
//   3. the dispositions: per site, what was done and why, with the old source
//      line read from the base commit and the new derivation read from the
//      working tree — never hand-typed.
// Every difference between measured and expected is recorded, not smoothed.

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const args = process.argv.slice(2);
function argument(name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}
const baseCommit = argument("--base") ?? "1118f436345e160437abfedbe73a19f190a92562";
const missionRoot = "artifacts/product-reality/sprint-185/m01";
const outputPath = path.join(repositoryRoot, missionRoot, "pin-inventory.json");

function baseLine(file, line) {
  const result = spawnSync("git", ["show", `${baseCommit}:${file}`], { cwd: repositoryRoot, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(`git show ${baseCommit}:${file} failed: ${result.stderr}`);
  const text = result.stdout.split(/\r?\n/)[line - 1];
  if (text === undefined) throw new Error(`${file}:${line} does not exist at ${baseCommit}`);
  return text;
}

function workingLine(file, needle) {
  const absolutePath = path.join(repositoryRoot, file);
  if (!fs.existsSync(absolutePath)) return null;
  const lines = fs.readFileSync(absolutePath, "utf8").split(/\r?\n/);
  const matches = lines.map((text, index) => ({ text, line: index + 1 })).filter(({ text }) => text.includes(needle));
  if (matches.length !== 1) throw new Error(`${file}: expected exactly one working-tree line containing ${JSON.stringify(needle)}, found ${matches.length}`);
  return matches[0];
}

function readSummary(relativePath) {
  const absolutePath = path.join(repositoryRoot, relativePath);
  return fs.existsSync(absolutePath) ? JSON.parse(fs.readFileSync(absolutePath, "utf8")) : null;
}

// ---------------------------------------------------------------------------
// The expectation: decision #1725's grep inventory, as file:line at the base.
const EXPECTED_BY_1725 = [
  "packages/component-contracts/test/workflow-states.s184.spec.ts:15",
  "packages/component-contracts/test/contract-amendments.s184.spec.ts:23",
  "packages/components-react/test/scenarios.spec.tsx:17",
  "packages/components-vue/test/scenarios.spec.ts:52",
  "packages/components-react/test/ported-package-contract.spec.ts:115",
  "packages/component-styles/test/styles.spec.ts:13",
  "packages/components-react/test/packed-import-evidence.mjs:19",
  "packages/components-react/test/packed-import-evidence.mjs:94",
  "packages/components-react/test/packed-import-evidence.mjs:105",
  "packages/components-vue/test/packed-import.mjs:89",
  "packages/components-vue/test/packed-import.mjs:94",
  "scripts/product-reality/s182-m04-consumer-harness.mjs:321",
  "packages/components-react/test/package-contract.spec.ts:153",
  "packages/components-vue/test/package-contract.spec.ts:102",
  "packages/mcp-server/test/product-reality/ported-freeze.s184.spec.ts:125",
  "packages/mcp-server/test/product-reality/ported-freeze.s184.spec.ts:126",
  "packages/mcp-server/test/product-reality/ported-freeze.s184.spec.ts:149",
  "packages/mcp-server/test/product-reality/independent-review-approval.s183.spec.ts:353",
  "packages/mcp-server/test/product-reality/independent-review-approval.s183.spec.ts:566",
  "packages/mcp-server/test/product-reality/independent-review-approval.s183.spec.ts:568",
  "scripts/product-reality/generate-s182-m05-closeout.mjs:137",
  "scripts/product-reality/generate-s182-m05-closeout.mjs:658",
  "scripts/product-reality/generate-s182-m05-closeout.mjs:722",
  "scripts/product-reality/generate-s183-m06-closeout.mjs:1565",
];

// ---------------------------------------------------------------------------
// The dispositions. `base` is the file:line at the base commit whose text is
// recorded as the old source; `working` is a needle that locates the new
// derivation in the working tree (null when the site was removed).
const SITES = [
  // --- package-internal literal counts and lists -> derive from NUCLEUS_COMPONENT_IDS
  { id: "workflow-states-14", base: "packages/component-contracts/test/workflow-states.s184.spec.ts:15", disposition: "derive",
    working: "expect(Object.keys(componentContracts).sort()).toEqual([...NUCLEUS_COMPONENT_IDS].sort());",
    reason: "Object.keys(componentContracts) was compared to the literal 14; it now equals NUCLEUS_COMPONENT_IDS as a sorted set." },
  { id: "contract-amendments-14", base: "packages/component-contracts/test/contract-amendments.s184.spec.ts:23", disposition: "derive",
    working: "expect(Object.keys(componentContracts).sort()).toEqual([...NUCLEUS_COMPONENT_IDS].sort());",
    reason: "Object.values(componentContracts) was compared to the literal 14; it now equals NUCLEUS_COMPONENT_IDS as a sorted set." },
  { id: "contract-amendments-11", base: "packages/component-contracts/test/contract-amendments.s184.spec.ts:25", disposition: "derive",
    working: "[...NUCLEUS_COMPONENT_IDS].filter((id) => !version11Ids.includes(id)).sort(),",
    reason: "The 1.0.0 contract set was a hand-written 11-id list plus a literal 11; it is now NUCLEUS_COMPONENT_IDS minus the three 1.1.0 ids (Select, Stack, Text — a versioning fact, not nucleus membership)." },
  { id: "contract-amendments-list", base: "packages/component-contracts/test/contract-amendments.s184.spec.ts:28", disposition: "derive",
    working: "[...NUCLEUS_COMPONENT_IDS].filter((id) => !version11Ids.includes(id)).sort(),",
    reason: "First line of the hand-written 1.0.0 id list; replaced by the derivation above." },
  { id: "react-scenarios-14", base: "packages/components-react/test/scenarios.spec.tsx:17", disposition: "derive",
    working: "expect(new Set(sharedScenarios.map(scenario => scenario.id)).size).toBe(NUCLEUS_COMPONENT_IDS.length);",
    reason: "Scenario-id uniqueness was pinned at the literal 14; it now derives from NUCLEUS_COMPONENT_IDS.length." },
  { id: "vue-scenarios-14", base: "packages/components-vue/test/scenarios.spec.ts:52", disposition: "derive",
    working: "expect(new Set(sharedScenarios.map((scenario) => scenario.id)).size).toBe(NUCLEUS_COMPONENT_IDS.length);",
    reason: "Same pin in the Vue scenario spec; same derivation." },
  { id: "react-ported-package-contract-14", base: "packages/components-react/test/ported-package-contract.spec.ts:115", disposition: "derive",
    working: "expect(mainReadiness.rows.map(row => row.componentId)).toEqual([...NUCLEUS_COMPONENT_IDS]);",
    reason: "The main readiness manifest was pinned at 14 rows; its row ids now equal NUCLEUS_COMPONENT_IDS." },
  { id: "styles-14", base: "packages/component-styles/test/styles.spec.ts:13", disposition: "derive",
    working: "expect([...COMPONENT_STYLE_IDS].sort()).toEqual([...NUCLEUS_COMPONENT_IDS].sort());",
    reason: "COMPONENT_STYLE_IDS was pinned at the literal 14; it now equals NUCLEUS_COMPONENT_IDS as a sorted set. @oods/component-contracts became a workspace devDependency of @oods/component-styles for that import." },
  { id: "styles-title-14", base: "packages/component-styles/test/styles.spec.ts:12", disposition: "derive",
    working: "it('covers every nucleus component with token-driven CSS', () => {",
    reason: "Test title carried the literal 14 into reporter output." },
  { id: "react-package-contract-title-14", base: "packages/components-react/test/package-contract.spec.ts:153", disposition: "derive",
    working: "it('publishes one independently derived React emission-eligibility row per nucleus id', () => {",
    reason: "The body already derived (rows equal NUCLEUS_COMPONENT_IDS); only the title carried the literal 14." },
  { id: "vue-package-contract-title-14", base: "packages/components-vue/test/package-contract.spec.ts:102", disposition: "derive",
    working: "it('publishes one independently derived Vue emission-eligibility row per nucleus id', () => {",
    reason: "Same as the React spec: derived body, literal title." },
  { id: "vue-ssr-title-14", base: "packages/components-vue/test/ssr.spec.ts:61", disposition: "derive",
    working: "it('SSR-renders every nucleus component family with semantic markup', async () => {",
    reason: "Not in the #1725 list. The assertion loops NUCLEUS_COMPONENT_IDS already; only the title carried the literal 14." },
  { id: "ported-contracts-expected-list", base: "packages/component-contracts/test/ported-contracts.s184.spec.ts:20", disposition: "retire",
    working: null,
    reason: "Not in the #1725 list. EXPECTED_NUCLEUS_IDS was a hand-written 14-id list asserted equal to NUCLEUS_COMPONENT_IDS itself — a freeze assertion, void under #1722. The contracts/scenarios key-set assertions now derive from NUCLEUS_COMPONENT_IDS; the 22-member union count derives from both id unions." },
  { id: "ported-contracts-freeze-assert", base: "packages/component-contracts/test/ported-contracts.s184.spec.ts:43", disposition: "retire",
    working: null,
    reason: "expect(NUCLEUS_COMPONENT_IDS).toEqual(EXPECTED_NUCLEUS_IDS) asserted the freeze itself (#1722)." },
  { id: "ported-contracts-union-22", base: "packages/component-contracts/test/ported-contracts.s184.spec.ts:55", disposition: "derive",
    working: "NUCLEUS_COMPONENT_IDS.length + PORTED_COMPONENT_IDS.length,",
    reason: "The disjoint-union size was the literal 22; it now derives from both id unions (disjointness is the property under test)." },

  // --- packed consumers and the s182-m04 harness -> derive from the packed @oods/component-contracts tarball
  { id: "react-packed-list-const", base: "packages/components-react/test/packed-import-evidence.mjs:19", disposition: "derive", oldSourceIsLiteral: false,
    working: "const canonicalIds = [...NUCLEUS_COMPONENT_IDS];",
    reason: "Named by #1725: the declaration line of the hand-written canonicalIds list (the literal itself starts on :20, recorded as react-packed-list)." },
  { id: "react-packed-list", base: "packages/components-react/test/packed-import-evidence.mjs:20", disposition: "derive",
    working: "const canonicalIds = [...NUCLEUS_COMPONENT_IDS];",
    reason: "The hand-written canonicalIds list moved into the isolated consumer as [...NUCLEUS_COMPONENT_IDS] imported from the packed @oods/component-contracts tarball, resolved per specifier and rejected if it resolves under the repository root." },
  { id: "react-packed-export-equality", base: "packages/components-react/test/packed-import-evidence.mjs:94", disposition: "derive",
    working: "if (JSON.stringify(runtimeKeys) !== JSON.stringify([...canonicalIds].sort())) {", oldSourceIsLiteral: false,
    reason: "Expression unchanged; its operand canonicalIds now derives from the packed contracts export instead of the hand-written list." },
  { id: "react-packed-readiness-14", base: "packages/components-react/test/packed-import-evidence.mjs:105", disposition: "derive",
    working: "if (JSON.stringify(readiness.rows.map((row) => row.componentId)) !== JSON.stringify(canonicalIds) || readiness.rows.some((row) => row.emissionEligible !== true)) throw new Error('Packed readiness failed.');",
    reason: "readiness.rows.length !== 14 became an exact id comparison against the packed nucleus." },
  { id: "vue-packed-89", base: "packages/components-vue/test/packed-import.mjs:89", disposition: "derive", oldSourceIsLiteral: false,
    working: "for (const target of [import.meta.resolve('@oods/component-contracts'), import.meta.resolve('@oods/components-vue'), cssUrl, import.meta.resolve('@oods/components-vue/readiness')]) {",
    reason: "Named by #1725; at the base this line is the consumer manifest's tarball dependency, not a literal pin — the Vue consumer already derived canonicalIds from the installed contracts. Hardened: the contracts specifier is now resolved and rejected if it resolves under the repository root by path." },
  { id: "vue-packed-94", base: "packages/components-vue/test/packed-import.mjs:94", disposition: "derive", oldSourceIsLiteral: false,
    working: "if (path.startsWith(repositoryRoot + '/')) throw new Error(\\`Resolved repository source: \\${path}\\`);",
    reason: "Named by #1725; at the base this line opens the consumer source template, not a literal pin. Recorded as a measured-vs-expected difference; the repository-root rejection is the hardening applied." },
  { id: "harness-expected-ids", base: "scripts/product-reality/s182-m04-consumer-harness.mjs:292", disposition: "derive",
    working: "const expectedIds = [...roots.contracts.NUCLEUS_COMPONENT_IDS];",
    reason: "Not in the #1725 list by line (the list names :321). The packed root-export proof compared exports to FOUNDATION_V1_IDS (the 14-family showcase constant); it now reads NUCLEUS_COMPONENT_IDS from the packed contracts tarball and rejects a contracts path under the repository root." },
  { id: "harness-readiness-14", base: "scripts/product-reality/s182-m04-consumer-harness.mjs:321", disposition: "derive",
    working: "if (JSON.stringify(readinessIds) !== JSON.stringify(expectedIds) || document.rows.some((row) => row.emissionEligible !== true)) {",
    reason: "document.rows.length !== 14 became an exact id comparison against the packed nucleus." },
  { id: "harness-ledger-14", base: "scripts/product-reality/s182-m04-consumer-harness.mjs:2019", disposition: "derive",
    working: "selectedComponents: FOUNDATION_V1_IDS.length,",
    reason: "Not in the #1725 list. The s182-m04 ledger builder carried literal 14/28 cell counts; they now derive from the showcase constant's length. Not executed by any live spec; changed so no literal count remains in the harness." },
  { id: "harness-showcase-list", base: "scripts/product-reality/s182-m04-consumer-harness.mjs:23", disposition: "keep-as-showcase-fixture",
    working: null,
    reason: "FOUNDATION_V1_IDS enumerates the components of the fixed 14-family Sprint 182 showcase schema (emitted-source, hydration, SSR and visual-evidence checks look for exactly those markers). It describes the fixture, not the nucleus, and no longer stands in for nucleus membership anywhere." },
  { id: "s183-corpus-nucleus-set", base: "scripts/product-reality/s183-m04-saved-schema-corpus.ts:47", disposition: "derive",
    working: "const NUCLEUS_COMPONENTS: ReadonlySet<string> = new Set(NUCLEUS_COMPONENT_IDS);",
    reason: "Not in the #1725 list. The Sprint 183 corpus compiler, which saved-schema-compiler.s183.spec.ts executes live, carried a hand-written 14-id NUCLEUS_COMPONENTS set used to check that every runnable corpus component is in the nucleus; it now derives from NUCLEUS_COMPONENT_IDS. Its Sprint 183 census literals (48 distinct corpus components, 12 runnable, 36 typed-gap) describe the corpus at the Sprint 183 nucleus and are NOT nucleus-size pins retired here; they will move when readiness grows and are carried by name to m03/m04 (rule #1690)." },
  { id: "packed-consumers-spec-14", base: "packages/mcp-server/test/product-reality/packed-consumers.s182.spec.ts:44", disposition: "derive",
    working: "readiness: { react: NUCLEUS_COMPONENT_IDS.length, vue: NUCLEUS_COMPONENT_IDS.length },",
    reason: "Not in the #1725 list. The B-12 proof's readiness counts were literal 14s; they now derive from NUCLEUS_COMPONENT_IDS.length (the consumer itself asserts exact id equality)." },

  // --- mcp-server product-reality specs that enforced the freeze
  { id: "ported-freeze-nucleus-14", base: "packages/mcp-server/test/product-reality/ported-freeze.s184.spec.ts:125", disposition: "retire", working: null,
    reason: "expect(NUCLEUS_COMPONENT_IDS).toHaveLength(14) asserted the freeze (#1722)." },
  { id: "ported-freeze-cells-28", base: "packages/mcp-server/test/product-reality/ported-freeze.s184.spec.ts:126", disposition: "retire", working: null,
    reason: "foundationV1Cells 28 is a property of the frozen Sprint 182 projection, which history-pins.s185.spec.ts now pins byte-exactly; it is not a live gate." },
  { id: "ported-freeze-check-promotion", base: "packages/mcp-server/test/product-reality/ported-freeze.s184.spec.ts:149", disposition: "retire", working: null,
    reason: "Ran generate-s182-m05-closeout.mjs --check-promotion against the live tree; the generator asserts the frozen 14-id nucleus and cannot run at 19 (#1725)." },
  { id: "ported-freeze-check-promotion-assert", base: "packages/mcp-server/test/product-reality/ported-freeze.s184.spec.ts:156", disposition: "retire", working: null,
    reason: "The assertion line of the same --check-promotion test (the red control reports the failure at the expect, the #1725 inventory names the flag argument at :149); the generator answered 'Public nucleus differs from the locked 14 IDs'." },
  { id: "ported-freeze-byte-pins-158a34bf", base: "packages/mcp-server/test/product-reality/ported-freeze.s184.spec.ts:106", disposition: "retire", working: null,
    reason: "Byte-pinned 8 live surfaces and 11 id-list files against the m04 base 158a34bf — a freeze on live source (#1722)." },
  { id: "ported-freeze-inventory-rehash", base: "packages/mcp-server/test/product-reality/ported-freeze.s184.spec.ts:66", disposition: "convert-to-history",
    working: "it('keeps freeze-inventory.json itself byte-identical to its tracked form', () => {",
    reason: "Rehashed 34 live files against the Sprint 184 m01 inventory. The inventory is capture-time evidence (#1695): the test now asserts the inventory file itself is byte-identical to its tracked form and internally consistent." },
  { id: "ira-check-promotion-unverifiable", base: "packages/mcp-server/test/product-reality/independent-review-approval.s183.spec.ts:353", disposition: "retire", working: null,
    reason: "Ran the generator's --check-promotion and buildPromotionProjection against the live tree (reads live baseline and readiness manifests, asserts the frozen 14). Cannot be converted: buildPromotionProjection has no injected-input form and the generator is read-only history." },
  { id: "ira-ledger-directions", base: "packages/mcp-server/test/product-reality/independent-review-approval.s183.spec.ts:360", disposition: "retire", working: null,
    reason: "buildPromotionProjection over the live tree, asserting 28 cells derived from the live nucleus; same reason." },
  { id: "ira-write-promotion", base: "packages/mcp-server/test/product-reality/independent-review-approval.s183.spec.ts:566", disposition: "retire", working: null,
    reason: "Ran --write-promotion, --check and --check-promotion against the live tree, rewriting projection files during a test." },
  { id: "ira-check-promotion-568", base: "packages/mcp-server/test/product-reality/independent-review-approval.s183.spec.ts:568", disposition: "retire", working: null,
    reason: "Part of the same removed test." },
  { id: "ira-invalid-each-generator-call", base: "packages/mcp-server/test/product-reality/independent-review-approval.s183.spec.ts:551", disposition: "retire", working: null,
    reason: "The 15 'returns invalid for %s' cases kept their predicate assertion verbatim; the trailing buildPromotionProjection(...).toThrow call (which read the live tree before rejecting the record) was removed." },
  { id: "ira-history-28", base: "packages/mcp-server/test/product-reality/independent-review-approval.s183.spec.ts:88", disposition: "keep-as-read-only", working: null,
    reason: "Asserts the frozen approval record's 28 cells — a fact about read-only history, not the live nucleus. Kept verbatim; the record is pinned by history-pins.s185.spec.ts." },
  { id: "contract-resolution-entries-14", base: "packages/mcp-server/test/product-reality/contract-resolution.s184.spec.ts:189", disposition: "derive",
    working: "expect(entries).toHaveLength(version11.length + version10.length);",
    reason: "Not in the #1725 list. Object.entries(componentContracts) was pinned at 14 and the 1.0.0 set at 11; both now derive from NUCLEUS_COMPONENT_IDS minus the three 1.1.0 ids." },
  { id: "contract-resolution-readiness-14", base: "packages/mcp-server/test/product-reality/contract-resolution.s184.spec.ts:236", disposition: "convert-to-history",
    working: "['show', `${closeout.measuredImplementationCommit}:${file.path}`],",
    reason: "Not in the #1725 list. rowCount 14 plus measuredSha256 === sha256(live manifest) byte-pinned the live readiness manifests to the Sprint 184 m03 record. The record's digests are now checked against the manifests as they were at the measured implementation commit, so the live surface can grow with the nucleus." },

  // --- frozen generators: history, never executed with a command verb from a live test
  { id: "s182-generator-frozen-nucleus", base: "scripts/product-reality/generate-s182-m05-closeout.mjs:137", disposition: "keep-as-read-only", working: null,
    reason: "FROZEN_NUCLEUS in the Sprint 182 closeout generator; the generator is tracked history and is never invoked with --check, --check-promotion or --write-promotion from a live test (asserted by history-pins.s185.spec.ts). Its frozen constants are still imported." },
  { id: "s182-generator-nucleus-assert", base: "scripts/product-reality/generate-s182-m05-closeout.mjs:658", disposition: "keep-as-read-only", working: null,
    reason: "Same generator; same rule." },
  { id: "s182-generator-readiness-14", base: "scripts/product-reality/generate-s182-m05-closeout.mjs:722", disposition: "keep-as-read-only", working: null,
    reason: "Same generator; same rule." },
  { id: "s183-generator-export-count-14", base: "scripts/product-reality/generate-s183-m06-closeout.mjs:1565", disposition: "keep-as-read-only", working: null,
    reason: "Verifies the Sprint 183 R02 package record (a historical tarball with 14 exports); used only with that historical record, never with a command verb from a live test." },

  // --- showcase fixtures and historical replays that carry a 14 or 28 by construction
  { id: "foundation-fixture-list", base: "packages/mcp-server/test/product-reality/foundation-fixture.s182.ts:3", disposition: "keep-as-showcase-fixture", working: null,
    reason: "FOUNDATION_V1_IDS here enumerates the 14 families of the fixed Sprint 182 showcase schema (18 nodes); codegen-matrix.s182.spec.ts and readiness-ref-enforcement.s184.spec.ts assert fixture properties (componentCount 14, 14 preflight issues for 14 fixture nodes), not nucleus membership." },
  { id: "s183-replay-r02-28", base: "packages/mcp-server/test/product-reality/s183-m06-replay-r02.spec.ts:182", disposition: "keep-as-read-only", working: null,
    reason: "Replays the Sprint 183 R02 resolution record (28 historical cells); reads history, not the live nucleus." },
  { id: "readiness-ref-frozen-consumer-sha", base: "packages/mcp-server/test/product-reality/readiness-ref-enforcement.s184.spec.ts:141", disposition: "keep-as-read-only", working: null,
    reason: "Hashes the frozen Sprint 182 consumer.mjs and reads a tracked m02 report; left intact per the mission charter." },
  { id: "react-visual-evidence-list", base: "packages/components-react/test/visual-evidence.mjs:13", disposition: "keep-as-showcase-fixture", working: null,
    reason: "Enumerates the components its showcase renders for visual evidence; not invoked by any vitest suite or CI job (test:visual only). Allowlisted as a showcase fixture." },
  { id: "vue-visual-evidence-list", base: "packages/components-vue/test/visual-evidence.mjs:13", disposition: "keep-as-showcase-fixture", working: null,
    reason: "Same as the React visual-evidence runner." },
];

const LITERAL_LIST_ALLOWLIST = [
  { file: "scripts/product-reality/generate-s182-foundation.mjs", reason: "Sprint 182 foundation generator (history): wrote the Sprint 182 registry artifacts from the nucleus as locked then; invoked only by capture-s182-final-gates.mjs, never by a live test." },
  { file: "scripts/product-reality/s183-m06-evidence.mjs", reason: "Sprint 183 m06 R02 evidence builder (history): CANONICAL_COMPONENT_IDS names the 14 exports of the Sprint 183 tarballs; replayed by s183-m06-replay-r02.spec.ts against the historical R02 record." },
  { file: "packages/mcp-server/test/product-reality/foundation-fixture.s182.ts", reason: "Sprint 182 showcase fixture: the 14 families the fixed 18-node schema contains." },
  { file: "scripts/product-reality/s182-m04-consumer-harness.mjs", reason: "FOUNDATION_V1_IDS names the showcase families whose markers the emitted-source, SSR, hydration and visual checks look for; nucleus membership in the packed proofs derives from the packed contracts tarball." },
  { file: "packages/components-react/test/visual-evidence.mjs", reason: "Visual-evidence showcase list; not invoked by any suite or CI job." },
  { file: "packages/components-vue/test/visual-evidence.mjs", reason: "Visual-evidence showcase list; not invoked by any suite or CI job." },
];

const REMOVED_TESTS = [
  { file: "packages/mcp-server/test/product-reality/ported-freeze.s184.spec.ts", test: "rehashes every m01 inventory row by class with only the two declared m03 transitions", change: "converted", reason: "Live rehash of 34 files against capture-time evidence (#1695) became a byte-identity check of the inventory file itself plus its internal consistency." },
  { file: "packages/mcp-server/test/product-reality/ported-freeze.s184.spec.ts", test: "keeps every named frozen surface and ID-list pin byte-identical to the m04 base", change: "removed", reason: "Byte-froze live surfaces and id-list files against 158a34bf (#1722)." },
  { file: "packages/mcp-server/test/product-reality/ported-freeze.s184.spec.ts", test: "leaves foundation-v1 at 14 components and 28 promoted cells without a new approval call", change: "removed", reason: "Asserted the nucleus size literal (#1725); the frozen projection is pinned by history-pins.s185.spec.ts instead." },
  { file: "packages/mcp-server/test/product-reality/ported-freeze.s184.spec.ts", test: "keeps the capability baseline structurally byte-exact and check-promotion clean with no writes", change: "removed", reason: "Executed generate-s182-m05-closeout.mjs --check-promotion against the live tree (#1725). Baseline structural integrity is re-asserted by m05's structural-diff spec." },
  { file: "packages/mcp-server/test/product-reality/independent-review-approval.s183.spec.ts", test: "keeps unverifiable approval out of the promotion check", change: "removed", reason: "Executed --check-promotion and buildPromotionProjection over the live tree (#1725)." },
  { file: "packages/mcp-server/test/product-reality/independent-review-approval.s183.spec.ts", test: "discriminates approved and missing records in both ledger directions", change: "removed", reason: "buildPromotionProjection reads the live baseline and readiness manifests and asserts the frozen 14 (#1725)." },
  { file: "packages/mcp-server/test/product-reality/independent-review-approval.s183.spec.ts", test: "publishes approval at new projection paths while the ca8d84bb historical paths remain byte-exact", change: "removed", reason: "Executed --write-promotion, --check and --check-promotion against the live tree (#1725)." },
  { file: "packages/mcp-server/test/product-reality/independent-review-approval.s183.spec.ts", test: "returns invalid for %s (15 cases)", change: "converted", reason: "Predicate assertions kept verbatim with the case count unchanged; the trailing buildPromotionProjection(...).toThrow assertion, which read the live tree before rejecting the record, was removed." },
  { file: "packages/mcp-server/test/product-reality/contract-resolution.s184.spec.ts", test: "preserves the historical readiness manifests while all 178 live refs resolve", change: "converted", reason: "The Sprint 184 m03 digests are now checked against the manifests at the measured implementation commit instead of the live files (#1725)." },
];

// ---------------------------------------------------------------------------
const redControl = readSummary(`${missionRoot}/red-control/summary.json`);
const greenControl = readSummary(`${missionRoot}/green-control/summary.json`);

function failingSiteKeys(summary) {
  return new Set((summary?.failures ?? []).map((failure) => `${failure.file}:${failure.line ?? "?"}`));
}

const redFailures = redControl?.failures ?? [];
const redKeys = failingSiteKeys(redControl);

const sites = SITES.map((site) => {
  const [file, lineText] = site.base.split(":");
  const line = Number(lineText);
  const oldSource = site.oldSourceIsLiteral === false ? null : baseLine(file, line);
  const located = site.working ? workingLine(file, site.working) : null;
  const measured = redFailures.filter((failure) => failure.file === file && failure.line === line);
  return {
    id: site.id,
    file,
    baseLine: line,
    expectedByDecision1725: EXPECTED_BY_1725.includes(site.base),
    measuredInRedControl: measured.length > 0,
    measuredReasons: [...new Set(measured.map((failure) => failure.reason))],
    measuredTests: [...new Set(measured.map((failure) => failure.test ?? failure.code))],
    oldSource,
    baseSourceText: site.oldSourceIsLiteral === false ? baseLine(file, line) : undefined,
    disposition: site.disposition,
    newSource: located?.text ?? null,
    newLine: located?.line ?? null,
    reason: site.reason,
  };
});

const siteKeys = new Set(sites.map((site) => `${site.file}:${site.baseLine}`));
const differences = [];
for (const failure of redFailures) {
  const key = `${failure.file}:${failure.line ?? "?"}`;
  if (siteKeys.has(key)) continue;
  differences.push({
    kind: "measured-not-expected",
    site: key,
    reason: failure.reason,
    check: failure.check,
    test: failure.test ?? failure.code ?? null,
    note: failure.reason === "typescript-totality" || failure.reason === "derived-coverage" || failure.reason === "oods-n015"
      ? "A right-reason failure: the mutation adds an id with no contract, scenario, style or readiness row. Not a pin."
      : "Unexpected failure at the base; disposition recorded below in redControlUnexpected.",
  });
}
for (const expected of EXPECTED_BY_1725) {
  if (!redKeys.has(expected)) {
    const site = sites.find((candidate) => `${candidate.file}:${candidate.baseLine}` === expected);
    differences.push({
      kind: "expected-not-measured",
      site: expected,
      disposition: site?.disposition ?? null,
      note: site
        ? "Named by #1725 but not reached by the +DetailHeader mutation: the literal pins the OLD size on a surface the mutation does not move (readiness rows, root exports, packed scripts and generators are not executed by the suites, or the site is not an assertion). Retired by derivation regardless."
        : "Named by #1725 and not dispositioned — MUST NOT HAPPEN.",
    });
  }
}
for (const site of sites) {
  if (!site.expectedByDecision1725 && site.disposition !== "keep-as-read-only" && site.disposition !== "keep-as-showcase-fixture") {
    differences.push({ kind: "grep-found-beyond-1725", site: `${site.file}:${site.baseLine}`, disposition: site.disposition, measuredInRedControl: site.measuredInRedControl });
  }
}

const inventory = {
  schemaVersion: "1.0.0",
  sprintId: "sprint-185",
  missionId: "s185-m01",
  kind: "nucleus-pin-inventory",
  baseCommit,
  rule: "Every live assertion about nucleus membership derives from NUCLEUS_COMPONENT_IDS (inside packed consumers, from the packed @oods/component-contracts tarball); history stays byte-pinned and is never executed against the live tree (#1722, #1725).",
  expectation: { decision: 1725, sites: EXPECTED_BY_1725 },
  redControl: redControl
    ? {
        summary: `${missionRoot}/red-control/summary.json`,
        measuredHead: redControl.measuredHead,
        status: redControl.status,
        failuresByReason: redControl.failuresByReason,
        failingSites: redControl.failingSites,
        contractsBuild: redControl.contractsBuild,
      }
    : null,
  greenControl: greenControl
    ? {
        summary: `${missionRoot}/green-control/summary.json`,
        measuredHead: greenControl.measuredHead,
        status: greenControl.status,
        greenForTheRightReason: greenControl.greenForTheRightReason,
        failuresByReason: greenControl.failuresByReason,
        frozenLiteralFailures: greenControl.frozenLiteralFailures,
        failingSites: greenControl.failingSites,
      }
    : null,
  countsByDisposition: sites.reduce((counts, site) => ({ ...counts, [site.disposition]: (counts[site.disposition] ?? 0) + 1 }), {}),
  sites,
  differences,
  literalListAllowlist: LITERAL_LIST_ALLOWLIST,
  removedTests: REMOVED_TESTS,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(inventory, null, 2)}\n`);
process.stdout.write(`pin-inventory: ${sites.length} sites, ${differences.length} recorded differences, red=${redControl?.status ?? "absent"}, green=${greenControl?.status ?? "absent"}\n`);
