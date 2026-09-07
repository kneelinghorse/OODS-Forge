import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const projectRoot = fileURLToPath(new URL("../../", import.meta.url));
const read = (path: string) => readFileSync(resolve(projectRoot, path), "utf8");

describe("Sprint 177 prose truth carriers", () => {
  it("documents the caller-owned wrapper required by brand-relative presets", () => {
    const theming = read("docs/theming.md");
    const preset = JSON.parse(
      read("packages/tokens/src/presets/corporate-blue.json"),
    );

    expect(preset.color).toBeUndefined();
    expect(preset.surface).toBeDefined();
    expect(theming).toContain("The preset files are brand-relative");
    expect(theming).toContain('"A": <contents of corporate-blue.json>');
    expect(theming).toContain('"B": <contents of corporate-blue.json>');
    expect(theming).toContain("OODS-V149");
    expect(theming).not.toContain("brand-A-namespaced");
    expect(theming).not.toContain("targeting `color.brand.A.*`");
  });

  it("routes token-helper consumers through the public viz-core export", () => {
    const guide = read("docs/tokens/viz-token-guide.md");
    const publicIndex = read("packages/viz-core/src/index.ts");

    expect(publicIndex).toContain(
      "export * from './tokens/scale-token-mapper.js';",
    );
    expect(guide).toContain("from '@oods/viz-core';");
    expect(guide).not.toContain("@/viz/tokens/scale-token-mapper.js");
    expect(guide).not.toContain("`src/viz/tokens/scale-token-mapper.ts`");
  });

  it("records the shipped BUILD_STALE fix without reviving its workaround", () => {
    const qualityBars = read("cmos/foundational-docs/quality-bars.md");

    expect(qualityBars).toContain("cmos-mcp-pro v1.1.1 shipped");
    expect(qualityBars).toContain("next-step #400 are closed");
    expect(qualityBars).not.toContain("Permanent fix (open");
    expect(qualityBars).not.toContain(
      "still reports BUILD_STALE `dist-missing` at every closeout",
    );
    expect(qualityBars).toContain(
      "[closeout checklist](closeout-checklist.md) carries criterion (e)",
    );
  });

  it("keeps current roadmap authority separate from frozen history and sibling execution", () => {
    const near = read("cmos/foundational-docs/roadmap/near.md");
    const productProgram = read(
      "cmos/foundational-docs/roadmap/product-reality-program.md",
    );
    const roadmapIndex = read("cmos/foundational-docs/roadmap/README.md");
    const historicalVisionDocs = [
      read("cmos/foundational-docs/mission-graph.md"),
      read("cmos/foundational-docs/overview.md"),
      read("cmos/foundational-docs/strategic-position.md"),
    ];
    const normalizedNear = near.replace(/\s+/g, " ");
    const normalizedProgram = productProgram.replace(/\s+/g, " ");
    const normalizedIndex = roadmapIndex.replace(/\s+/g, " ");

    // Sprint 187 closes under its independent review while the program stays
    // Active. Frozen builder receipts and remote CI remain separate evidence.
    expect(near).toContain(
      "**Status:** ACTIVE — program decision `#1652`; Sprint 186 certified by `#1785`; Sprint 187 independently certified and closed by `#1809`; carries preserved by `#1810`",
    );
    expect(normalizedNear).toContain(
      "locked by decision `#1724` at build base `1118f436`",
    );
    expect(normalizedNear).toContain(
      "Sprint 187 is **Completed**, independently certified by review `PS-2026-09-07-002` and decision `#1809`.",
    );
    expect(normalizedNear).toContain(
      "Historical builder receipts retain `builderSelfCertified:false`; they are not relabeled.",
    );
    expect(normalizedNear).toContain(
      "remote acceptance is determined by the checks on the corrected PR head",
    );
    expect(near).toContain(
      "[Forge Product Reality Program](product-reality-program.md)",
    );
    expect(normalizedNear).toContain(
      "Two direction decisions from 2026-09-05 govern this queue. The Sprint 182 promotion freeze is void (`#1722`)",
    );
    expect(normalizedNear).toContain(
      "The current program does not ratify MCP Apps, Figma, Penpot, or a custom canvas; surface selection follows runnable product foundations.",
    );
    expect(normalizedNear).toContain(
      "## Increment 1 — Sprint 182: Product Reality Foundation — CLOSED 2026-09-04",
    );
    expect(normalizedNear).toContain(
      "`foundation-v1` promoted by Derek (decision `#1663`). The 14-component nucleus is real in React and Vue with clean packed-consumer proof.",
    );
    expect(normalizedNear).toContain(
      "Sprint-181 follow-ups `#1315` and `#1318`–`#1322` remain Forge-owned maintenance debt under decision `#1651`",
    );
    expect(normalizedNear).toContain(
      "## Increment 2 — Sprint 183: Runnable Generation — CLOSED 2026-09-05",
    );
    expect(normalizedNear).toContain(
      "they are named at every closeout and must close before an integrated public release",
    );
    expect(normalizedNear).toContain(
      "Numbered because Sprint 184 is independently reviewed and closed.",
    );
    expect(normalizedNear).toContain(
      "**Built and independently reviewed 2026-09-06; CERTIFIED and CLOSED**",
    );

    expect(productProgram).toContain(
      "**Status:** ACTIVE — product direction authorized by CMOS decision `#1652`",
    );
    expect(normalizedProgram).toContain(
      "React and Vue are equal product commitments.",
    );
    expect(normalizedIndex).toContain(
      "The live roadmap is organized around the Forge Product Reality Recovery program.",
    );
    expect(normalizedIndex).toContain(
      "The program document carries the mid- and far-horizon sequence",
    );
    expect(normalizedIndex).toContain(
      "`product-reality-program.md` is the durable direction, authorized **2026-09-03**, and `near.md` is the active sequencing surface, refreshed **2026-09-04**.",
    );

    for (const historicalVision of historicalVisionDocs) {
      expect(historicalVision).toContain(
        "**Status:** Historical vision snapshot — superseded for current sequencing on 2026-08-25",
      );
      expect(historicalVision).toContain(
        "> **Historical vision snapshot (2026-05).**",
      );
      expect(historicalVision).not.toContain("**Status:** Active");
    }
  });

  it("closes the historical Sprint 41 plan header", () => {
    const sprintPlan = read("cmos/planning/sprint-41-plan.md");

    expect(sprintPlan).toContain("**Status:** Closed (7/7 missions complete)");
    expect(sprintPlan).not.toContain("**Status:** Planning");
  });

  it("keeps the open-arcs ledger aligned with the atomic Viz flagship closure", () => {
    const ledger = read("cmos/planning/forge-open-arcs-ledger-2026-08.md");

    expect(ledger).toContain("17 — 0 active, 1 proposed, 9 parked, 7 closed");
    expect(ledger).toContain(
      "95 — 24 open, 58 done, 7 blocked, 5 superseded, 1 unknown",
    );
    expect(ledger).toContain("2 carry, 27 park, 61 close, 5 drop");
    expect(ledger).toContain(
      "[Viz flagship follow-ons](#viz-flagship-follow-ons) — Parked",
    );
    expect(ledger).toContain(
      "m07 dashboard-binding re-queued to s180 with the Shopify ingestion cluster. The consumer ask stays ACCEPTED (Derek 2026-08-28); this is a scheduling deferral, not a rejection. The s179 close records the deferral; the s180 charter carries m07 as a committed opening mission with the per-panel-identity + outputHtmlHash shape and its Rule-9 rows already drafted (per-panel hash isolation; outputHtmlHash perturbation; round-trip certify parity).",
    );
    expect(ledger).toContain("next-step #1259 completed");
    expect(ledger).toContain("next-step #1142 completed");
    expect(ledger).toContain("exact pin 138→0");
    expect(ledger).toContain("26 pure shims were deleted");
    expect(ledger).toContain(
      "ECharts render grading + render determinism — DONE.",
    );
    expect(ledger).toContain(
      "ECharts render-grading follow-ons — PARKED with distinct triggers.",
    );
    expect(ledger).not.toContain(
      "render-grading implementation remains parked",
    );
    expect(ledger).not.toContain("91 semantic build:stories errors");
    expect(ledger).not.toContain(
      "3 unbridged focus slots need real brand tokens",
    );
    expect(ledger).not.toContain("src/viz twin ~137-site rewire");
  });
});
