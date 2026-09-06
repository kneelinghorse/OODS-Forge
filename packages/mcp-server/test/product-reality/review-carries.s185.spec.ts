import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { deriveRepoints, type Repoint } from "../../../../scripts/product-reality/s185-review-carries.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const evidence = "artifacts/product-reality/sprint-185/m05/review-carries";
const read = (relative: string): string => readFileSync(path.join(root, relative), "utf8");
const json = (relative: string) => JSON.parse(read(relative));
const sha = (text: string): string => createHash("sha256").update(text).digest("hex");
const record = json(`${evidence}/s184-additive-review-record.json`);
const current = json(`${evidence}/b2-repoint-disposition.v2.json`);
function git(args: string[]): string {
  const result = spawnSync("git", args, { cwd: root, encoding: "utf8" });
  expect(result.status, result.stderr).toBe(0);
  return result.stdout;
}
function checkReference(reference: { path: string; sha256: string }): void {
  expect(sha(read(reference.path)), reference.path).toBe(reference.sha256);
}
const projected = ({ file, pipelineInvocationOrdinal, changedField, historicalValue, currentValue }: Repoint): Repoint =>
  ({ file, pipelineInvocationOrdinal, changedField, historicalValue, currentValue });

describe("Sprint 185 additive review carries preserve history and expose omitted axes", () => {
  it("rederives 13 historical invocations and 14 axes from the record's comparisonFields", () => {
    expect(current.schemaVersion).toBe(2);
    expect(current.comparisonFields).toEqual(["intent", "context", "framework", "profile", "save"]);
    const files = [...new Set<string>(current.callSites.map((row: Repoint) => row.file))];
    const derived = files.flatMap((file) => deriveRepoints(file,
      git(["show", `${current.repointParent}:${file}`]), git(["show", `${current.repointCommit}:${file}`]), current.comparisonFields));
    expect(derived).toEqual(current.callSites.map(projected));
    expect(derived).toHaveLength(13);
    expect(derived.reduce((sum, row) => sum + row.changedField.length, 0)).toBe(14);
    // This is a real historical omission, not only a synthetic wider type.
    expect(current.callSites.find((row: { id: string }) => row.id === "actions-stripe-vocabulary")).toMatchObject({
      changedField: ["context", "framework"], additionallyDisclosedFields: ["framework"],
      historicalValue: { framework: { kind: "absent" } }, currentValue: { framework: { kind: "literal", value: "html" } },
    });
  });

  it("the list controls discovery of simultaneous context, framework, profile and save changes", () => {
    const before = `pipelineHandle({ context: 'detail', framework: 'react', profile: 'build', save: { name: 'old', tags: ['a'] } });`;
    const after = `pipelineHandle({ context: 'card', framework: 'vue', profile: 'release', save: { name: 'new', tags: ['b'] } });`;
    const derived = deriveRepoints("multi.ts", before, after, current.comparisonFields);
    expect(derived).toHaveLength(1);
    expect(derived[0]!.changedField).toEqual(["context", "framework", "profile", "save"]);
    expect(derived[0]!.historicalValue.save).toMatchObject({ kind: "expression", text: expect.stringContaining("old") });
    expect(derived[0]!.currentValue.save).toMatchObject({ kind: "expression", text: expect.stringContaining("new") });
    const narrowed = deriveRepoints("multi.ts", before, after, ["context"]);
    expect(narrowed[0]!.changedField).toEqual(["context"]);
    expect(narrowed).not.toEqual(derived);
    const dishonest = structuredClone(derived);
    dishonest[0]!.changedField = ["context"];
    expect(dishonest).not.toEqual(derived);
  });

  it("accepts a new list axis without a code change and distinguishes absent, null, false and shorthand", () => {
    const before = "pipelineHandle({ futureAxis: null });";
    const after = "pipelineHandle({ futureAxis: false, save });";
    expect(deriveRepoints("future.ts", before, after, ["futureAxis", "save"])).toEqual([{
      file: "future.ts", pipelineInvocationOrdinal: 1, changedField: ["futureAxis", "save"],
      historicalValue: { futureAxis: { kind: "literal", value: null }, save: { kind: "absent" } },
      currentValue: { futureAxis: { kind: "literal", value: false }, save: { kind: "expression", text: "save" } },
    }]);
    expect(deriveRepoints("future.ts", before, after, ["context"])).toEqual([]);
  });

  it.each([
    ["pipelineHandle(input)", "pipelineHandle({})", ["save"], "object literal"],
    ["pipelineHandle({ ...input })", "pipelineHandle({})", ["save"], "spread/computed"],
    ["pipelineHandle({ ['save']: 'x' })", "pipelineHandle({})", ["save"], "spread/computed"],
    ["pipelineHandle({})", "", ["save"], "invocation count"],
    ["pipelineHandle({})", "pipelineHandle({})", [], "nonempty list"],
    ["pipelineHandle({})", "pipelineHandle({})", ["save", "save"], "distinct field"],
  ] as const)("fails loud on ambiguous comparison input %#", (before, after, fields, error) => {
    expect(() => deriveRepoints("ambiguous.ts", before, after, fields)).toThrow(error);
  });

  it("keeps all referenced Sprint-183/184 artifact bytes at the completed m04 commit", () => {
    checkReference(current.historicalSource);
    const refs = [current.historicalSource, record.c5.historicalAggregate,
      ...record.c5.controls.map((row: { historicalReport: unknown }) => row.historicalReport),
      record.increment3.stateAxis.builder, record.increment3.stateAxis.parity,
      record.increment3.subscriptionWorkflow.report, ...record.increment3.subscriptionWorkflow.schemaReferences];
    for (const reference of refs) {
      checkReference(reference);
      expect(read(reference.path), reference.path).toBe(git(["show", `9fb7882e01cc0067ae6e69ad27330864ad228dd4:${reference.path}`]));
    }
  });

  it("C13 cites the tracked pre-sprint index and exact matching identities, not body pre-existence", () => {
    expect(record.c13.commit).toBe("9cd02da94bd342e269a1d68faa7a9a82c8c2f6f1");
    expect(record.c13.committedAt).toBe("2026-03-15T19:13:31-05:00");
    const indexSource = git(["show", `${record.c13.commit}:${record.c13.indexPath}`]);
    expect(read(record.c13.retainedIndex.path)).toBe(indexSource);
    expect(record.c13.indexBlob).toBe(git(["rev-parse", `${record.c13.commit}:${record.c13.indexPath}`]).trim());
    const index = JSON.parse(indexSource);
    expect(record.c13.subjects.map(({ name, schemaRef, createdAt }: { name: string; schemaRef: string; createdAt: string }) => ({ name, schemaRef, createdAt }))).toEqual([
      { name: "subscription-detail-dark", schemaRef: "compose-a710f0a9", createdAt: "2026-03-15T22:31:17.484Z" },
      { name: "subscription-list-dark", schemaRef: "compose-bc4ef63a", createdAt: "2026-03-15T22:31:17.525Z" },
    ]);
    for (const subject of record.c13.subjects) {
      checkReference(subject.vendored);
      const identity = { name: subject.name, schemaRef: subject.schemaRef, createdAt: subject.createdAt };
      expect(index.schemas.find((entry: { name: string }) => entry.name === subject.name)).toMatchObject(identity);
      expect(json(subject.vendored.path)).toMatchObject(identity);
    }
    expect(record.c13.limitation).toContain("does not establish byte pre-existence");
  });

  it("C5 labels exactly four inherited controls without inventing captured red output", () => {
    const replay = json(record.c5.historicalAggregate.path);
    expect(record.c5.controls.map((row: { id: string }) => row.id)).toEqual(replay.cases
      .filter((row: { sourceMission: string }) => row.sourceMission === "s183-m05").map((row: { id: string }) => row.id));
    expect(record.c5.controls).toHaveLength(4);
    for (const row of record.c5.controls) {
      expect(row).toMatchObject({ disposition: "historical, output never captured", rawRedControlOutput: null, rerunInSprint185: false, countsAsCurrentProof: false });
      expect(readdirSync(path.dirname(path.join(root, row.historicalReport.path))).sort()).toEqual(["report.json"]);
    }
    const contrast = path.join(root, path.dirname(record.c5.historicalAggregate.path), "s182-m01b-brand-b-primary-contrast");
    expect(readdirSync(contrast)).toEqual(expect.arrayContaining(["pre-green.log", "selected-red.log", "restored-green.log"]));
  });

  it("Increment 3 stays PARTIAL because state parity and saved Subscription prove separate subjects", () => {
    expect(record.increment3).toMatchObject({ disposition: "PARTIAL", combinedExitGateDemonstrated: false, states: ["loading", "empty", "error", "success"] });
    const parity = json(record.increment3.stateAxis.parity.path);
    expect(parity.states).toEqual(record.increment3.states);
    expect(parity.computedDifferences).toEqual([]);
    const builder = read(record.increment3.stateAxis.builder.path);
    expect(builder).toContain("function schemaFor(states: readonly WorkflowState[]): UiSchema");
    expect(builder).toContain("screens: states.map(stateBranch)");
    for (const reference of record.increment3.subscriptionWorkflow.schemaReferences) {
      const schema = json(reference.path).schema;
      const states: unknown[] = [];
      const visit = (node: { state?: unknown; children?: unknown[] }): void => {
        if (node.state !== undefined) states.push(node.state);
        for (const child of node.children ?? []) visit(child as Parameters<typeof visit>[0]);
      };
      schema.screens.forEach(visit);
      expect(states, reference.path).toEqual([]);
    }
    expect(json(record.increment3.subscriptionWorkflow.report.path).scopeStatement).toContain("partially discharges");
  });

  it("keeps maintenance, consumer parks and the existing Stage1 forward distinct from completion", () => {
    expect(record.unabsorbedMaintenance.map((row: { id: number }) => row.id)).toEqual([1315, 1318, 1319, 1320, 1321, 1322]);
    expect(record.consumerParks.map((row: { id: number }) => row.id)).toEqual([1371, 1372]);
    for (const row of [...record.unabsorbedMaintenance, ...record.consumerParks]) expect(row).toMatchObject({ status: "pending", completedByThisRecord: false });
    expect(record.stage1PlanningForward).toMatchObject({ messageId: "42a335bd-a2cb-4a84-8b53-157d8dd2a204", createdAt: "2026-09-05T21:25:40.146Z", status: "pending", consumerReportItems: [6, 7], reproducedByForge: false, resentInSprint185Closeout: false });
    checkReference(record.sourceNextSteps);
    checkReference(record.stage1PlanningForward.source);
    expect(json(record.stage1PlanningForward.source.path).body).toContain("Forge has not reproduced");
  });
});
