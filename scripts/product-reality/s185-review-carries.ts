import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

export type Operand =
  | { kind: "absent" }
  | { kind: "literal"; value: string | number | boolean | null }
  | { kind: "expression"; text: string };

export type Repoint = {
  file: string;
  pipelineInvocationOrdinal: number;
  changedField: string[];
  historicalValue: Record<string, Operand>;
  currentValue: Record<string, Operand>;
};

// Compare operands without executing test code. Object/array/call expressions
// remain printable source, so adding a save-object or a future axis is visible.
function operand(expression: ts.Expression, source: ts.SourceFile): Operand {
  if (ts.isStringLiteralLike(expression)) return { kind: "literal", value: expression.text };
  if (ts.isNumericLiteral(expression)) return { kind: "literal", value: Number(expression.text) };
  if (expression.kind === ts.SyntaxKind.TrueKeyword) return { kind: "literal", value: true };
  if (expression.kind === ts.SyntaxKind.FalseKeyword) return { kind: "literal", value: false };
  if (expression.kind === ts.SyntaxKind.NullKeyword) return { kind: "literal", value: null };
  return { kind: "expression", text: ts.createPrinter({ removeComments: true }).printNode(ts.EmitHint.Expression, expression, source) };
}

function pipelineOperands(source: string, file: string, fields: readonly string[]): Record<string, Operand>[] {
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const calls: Record<string, Operand>[] = [];
  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "pipelineHandle") {
      const input = node.arguments[0];
      if (!input || !ts.isObjectLiteralExpression(input)) throw new Error(`${file}: pipelineHandle input must be an object literal`);
      const values: Record<string, Operand> = Object.fromEntries(fields.map((field) => [field, { kind: "absent" }]));
      for (const property of input.properties) {
        // A spread or computed key could overwrite a watched operand. Refuse
        // ambiguity instead of treating it as an unchanged/missing field.
        if (ts.isSpreadAssignment(property) || (property.name && ts.isComputedPropertyName(property.name))) {
          throw new Error(`${file}: cannot rederive spread/computed pipeline operands`);
        }
        const name = property.name;
        if (!name || (!ts.isIdentifier(name) && !ts.isStringLiteral(name))) continue;
        if (!fields.includes(name.text)) continue;
        if (ts.isPropertyAssignment(property)) values[name.text] = operand(property.initializer, ast);
        else if (ts.isShorthandPropertyAssignment(property)) values[name.text] = operand(property.name, ast);
        else throw new Error(`${file}: unsupported watched operand ${name.text}`);
      }
      calls.push(values);
    }
    ts.forEachChild(node, visit);
  };
  visit(ast);
  return calls;
}

export function deriveRepoints(file: string, beforeSource: string, afterSource: string, comparisonFields: readonly string[]): Repoint[] {
  if (!comparisonFields.length || comparisonFields.some((field) => !field.trim()) || new Set(comparisonFields).size !== comparisonFields.length) {
    throw new Error("comparisonFields must be a nonempty list of distinct field names");
  }
  const before = pipelineOperands(beforeSource, file, comparisonFields);
  const after = pipelineOperands(afterSource, file, comparisonFields);
  if (before.length !== after.length) throw new Error(`${file}: invocation count changed; ordinal matching needs review`);
  return after.flatMap((current, index) => {
    const historical = before[index]!;
    const changedField = comparisonFields.filter((field) => JSON.stringify(historical[field]) !== JSON.stringify(current[field]));
    return changedField.length ? [{
      file,
      pipelineInvocationOrdinal: index + 1,
      changedField,
      historicalValue: Object.fromEntries(changedField.map((field) => [field, historical[field]!])),
      currentValue: Object.fromEntries(changedField.map((field) => [field, current[field]!])),
    }] : [];
  });
}

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outputRoot = "artifacts/product-reality/sprint-185/m05/review-carries";
const historicalPath = "artifacts/product-reality/sprint-184/m07/b2-repoint-disposition.json";
const c13Commit = "9cd02da94bd342e269a1d68faa7a9a82c8c2f6f1";
const c13IndexPath = "packages/mcp-server/.oods/schemas/_index.json";

function git(args: string[]): string {
  const result = spawnSync("git", args, { cwd: repositoryRoot, encoding: "utf8" });
  if (result.status !== 0) throw new Error(`git ${args.join(" ")}: ${result.stderr}`);
  return result.stdout;
}

function read(relative: string): string { return readFileSync(path.join(repositoryRoot, relative), "utf8"); }
function json(relative: string) { return JSON.parse(read(relative)); }
function reference(relative: string) { return { path: relative, sha256: createHash("sha256").update(read(relative)).digest("hex") }; }
function write(name: string, value: unknown): void { writeFileSync(path.join(repositoryRoot, outputRoot, name), `${JSON.stringify(value, null, 2)}\n`); }

export function writeReviewCarries(): void {
  const historical = json(historicalPath);
  const comparisonFields = ["intent", "context", "framework", "profile", "save"];
  const rederived: Repoint[] = Object.keys(historical.fileCounts).flatMap((file) => deriveRepoints(
    file, git(["show", `${historical.repointParent}:${file}`]), git(["show", `${historical.repointCommit}:${file}`]), comparisonFields,
  ));
  const callSites = rederived.map((row) => {
    const old = historical.callSites.find((candidate: Repoint) => candidate.file === row.file && candidate.pipelineInvocationOrdinal === row.pipelineInvocationOrdinal);
    if (!old) throw new Error(`Unaccounted historical repoint: ${row.file} #${row.pipelineInvocationOrdinal}`);
    const expectedBefore: Operand = old.historicalValue === null ? { kind: "absent" } : { kind: "literal", value: old.historicalValue };
    if (!row.changedField.includes(old.changedField) ||
        JSON.stringify(row.historicalValue[old.changedField]) !== JSON.stringify(expectedBefore) ||
        JSON.stringify(row.currentValue[old.changedField]) !== JSON.stringify({ kind: "literal", value: old.currentValue })) {
      throw new Error(`Historical v1 agreement failed: ${old.id}`);
    }
    return { id: old.id, selector: old.selector, invocation: old.invocation, ...row, disposition: old.disposition, reason: old.reason,
      additionallyDisclosedFields: row.changedField.filter((field) => field !== old.changedField) };
  });
  if (callSites.length !== historical.callSites.length) throw new Error("Historical repoint count differs");
  write("b2-repoint-disposition.v2.json", {
    schemaVersion: 2, missionId: "s185-m05", nextStepId: 1364,
    historicalSource: reference(historicalPath),
    scope: "Additive representation and rederivation of the same historical repoint commit; historical reasons and outcomes are not current capability claims.",
    reviewedSourceHead: historical.reviewedSourceHead, repointCommit: historical.repointCommit, repointParent: historical.repointParent,
    comparisonFields,
    comparisonRule: "Read every field named in comparisonFields; group all changed axes for one pipelineHandle invocation in changedField. Absent operands differ from explicit null. Expressions are compared as parsed, printed source without evaluation.",
    summary: { invocations: callSites.length, changedAxes: callSites.reduce((count, row) => count + row.changedField.length, 0) },
    additionalAxisDisposition: "The actions-stripe-vocabulary invocation also adds framework: html where the operand was absent. The historical intent/context-only comparison omitted this axis. The additive record discloses the explicit target selection without rewriting historical reasons or measurements.",
    callSites,
    currentTypedOutcomeDisposition: reference("artifacts/product-reality/sprint-185/m04/b2/remeasurement-disposition.json"),
    status: "rederived",
  });

  const indexSource = git(["show", `${c13Commit}:${c13IndexPath}`]);
  writeFileSync(path.join(repositoryRoot, outputRoot, "c13-index-9cd02da9.json"), indexSource);
  const index = JSON.parse(indexSource);
  const subjects = ["subscription-detail-dark", "subscription-list-dark"].map((name) => {
    const vendoredPath = `artifacts/product-reality/sprint-183/m04/saved-schema-store/${name}.json`;
    const vendored = json(vendoredPath);
    const entry = index.schemas.find((candidate: { name: string }) => candidate.name === name);
    if (!entry || entry.schemaRef !== vendored.schemaRef || entry.createdAt !== vendored.createdAt) throw new Error(`C13 identity differs: ${name}`);
    return { name, schemaRef: entry.schemaRef, createdAt: entry.createdAt, vendored: reference(vendoredPath), identityFieldsMatch: true };
  });

  const replayPath = "artifacts/product-reality/sprint-183/m06/mutation-replay/report.json";
  const replay = json(replayPath);
  const inherited = replay.cases.filter((row: { sourceMission: string }) => row.sourceMission === "s183-m05");
  if (inherited.length !== 4) throw new Error("C5 expects exactly four inherited Sprint-183 controls");
  const controls = inherited.map((row: { id: string; framework: string; kind: string; report: string; redGate: string }) => {
    const reportPath = path.posix.join(path.posix.dirname(replayPath), row.report);
    const retainedFiles = readdirSync(path.join(repositoryRoot, path.posix.dirname(reportPath))).sort();
    if (JSON.stringify(retainedFiles) !== JSON.stringify(["report.json"])) throw new Error(`C5 output inventory changed; review disposition: ${row.id}`);
    return { id: row.id, framework: row.framework, kind: row.kind, claimedRedGate: row.redGate,
      historicalReport: reference(reportPath), retainedFiles,
      disposition: "historical, output never captured", rawRedControlOutput: null, rerunInSprint185: false, countsAsCurrentProof: false };
  });
  const nextSteps = json(`${outputRoot}/cmos-next-steps-source.json`);
  const forward = json(`${outputRoot}/stage1-forward-source.json`);
  write("s184-additive-review-record.json", {
    schemaVersion: 1, missionId: "s185-m05", kind: "additive-prior-review-dispositions",
    preservation: "All Sprint-183 and Sprint-184 records remain unchanged; these dispositions neither rerun historical measurements nor replace their recorded status fields.",
    sourceNextSteps: reference(`${outputRoot}/cmos-next-steps-source.json`),
    b2: { nextStepId: 1364, disposition: "list representation and source rederivation added", record: reference(`${outputRoot}/b2-repoint-disposition.v2.json`) },
    c13: {
      nextStepId: 1365, disposition: "identity pre-existence anchored", commit: c13Commit,
      committedAt: git(["show", "-s", "--format=%cI", c13Commit]).trim(), indexPath: c13IndexPath,
      indexBlob: git(["rev-parse", `${c13Commit}:${c13IndexPath}`]).trim(),
      retainedIndex: reference(`${outputRoot}/c13-index-9cd02da9.json`), subjects,
      limitation: "The tracked index proves names, schema references and createdAt identity pre-existed the sprint. It does not establish byte pre-existence of the two schema bodies; no pre-sprint body git object is cited.",
    },
    c5: {
      nextStepId: 1365, disposition: "historical, output never captured", historicalAggregate: reference(replayPath), controls,
      scope: "These are the four inherited s183-m05 red controls in the s183-m06 replay. Serialized browser observations and original m05 build/patch logs do not supply missing replay execution output. The fifth s182 contrast replay has captured logs and is excluded. Current Sprint-185 mutation evidence is separate and does not retroactively repair these carriers.",
    },
    increment3: {
      nextStepId: 1366, disposition: "PARTIAL", combinedExitGateDemonstrated: false,
      states: ["loading", "empty", "error", "success"],
      stateAxis: { subject: "schema built in memory by schemaFor(states)", builder: reference("scripts/product-reality/s184-m05-state-evidence.ts"), parity: reference("artifacts/product-reality/sprint-184/m05/parity-report.json") },
      subscriptionWorkflow: { subject: "saved Subscription list/detail schemas", stateAxis: "state-neutral", report: reference("artifacts/product-reality/sprint-184/m06/closeout-report.json"), schemaReferences: subjects.map(({ vendored }) => vendored) },
      limitation: "The four states and the real saved workflow are separate proof subjects. No single artifact demonstrates the same semantic Subscription workflow in React and Vue with loading, empty, error and success states. Edit/cancel and timeline remain outside the saved-schema proof.",
    },
    unabsorbedMaintenance: nextSteps.pending.filter((row: { id: number }) => [1315, 1318, 1319, 1320, 1321, 1322].includes(row.id)).map((row: { id: number; status: string; content: string }) => ({ ...row, disposition: "unabsorbed maintenance; current CMOS status retained", completedByThisRecord: false })),
    consumerParks: nextSteps.pending.filter((row: { id: number }) => [1371, 1372].includes(row.id)).map((row: { id: number; status: string; content: string }) => ({ ...row, disposition: "parked for named future scope; current CMOS status retained", completedByThisRecord: false })),
    stage1PlanningForward: {
      source: reference(`${outputRoot}/stage1-forward-source.json`), messageId: forward.messageId,
      createdAt: forward.createdAt, status: forward.status, consumerReportItems: [6, 7],
      reproducedByForge: false, resentInSprint185Closeout: false,
      disposition: "Already forwarded for Stage1 planning; retain as reported consumer evidence, not a Forge reproduction or delivery repeated by this script.",
    },
  });
  console.log(JSON.stringify({ status: "written", outputRoot, repoints: callSites.length, c13Subjects: subjects.length, c5HistoricalControls: controls.length, increment3: "PARTIAL" }));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) writeReviewCarries();
