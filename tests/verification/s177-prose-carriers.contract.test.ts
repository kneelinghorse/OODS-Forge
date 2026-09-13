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

    // Sprint 188 closes under its independent review (PS-2026-09-08-011);
    // the workflow runs in both frameworks and usability is explicitly not certified.
    expect(near).toContain(
      "Sprint 188 independently certified and closed by `#1831`; craft carries preserved by `#1832`; capture policy `#1833`",
    );
    expect(normalizedNear).toContain(
      "Sprint 188 is **Completed**, independently certified by review `PS-2026-09-08-011` and decision `#1831`.",
    );
    expect(normalizedNear).toContain(
      "so usable is not certified. The ranked carries are decision `#1832`",
    );

    // Sprint 189 closes under its independent review (PS-2026-09-09-002);
    // criterion 8 (usable) is certified for the Subscription app; residual craft is #1845.
    expect(near).toContain(
      "Sprint 189 independently certified and closed by `#1844`; residual craft carries `#1845`",
    );
    expect(normalizedNear).toContain(
      "Sprint 189 is **Completed**, independently certified by review `PS-2026-09-09-002` and decision `#1844`.",
    );
    expect(normalizedNear).toContain(
      "so criterion 8 is certified for the Subscription app",
    );

    // Sprint 190 closes under its independent review (PS-2026-09-10-001);
    // the visualization public-render surface is closed; residual carries are #1860.
    expect(near).toContain(
      "Sprint 190 independently certified and closed by `#1859`; residual visualization carries `#1860`",
    );
    expect(normalizedNear).toContain(
      "Sprint 190 is **Completed**, independently certified by review `PS-2026-09-10-001` and decision `#1859`.",
    );
    expect(normalizedNear).toContain(
      "so the visualization public-render surface is closed",
    );

    // Sprint 191 closes under its independent review (PS-2026-09-10-008);
    // the carry-forward pay-down is complete; residual carries are #1881.
    expect(near).toContain(
      "Sprint 191 independently certified and closed by `#1880`; residual carries `#1881`",
    );
    expect(normalizedNear).toContain(
      "Sprint 191 is **Completed**, independently certified by review `PS-2026-09-10-008` and decision `#1880`.",
    );
    expect(normalizedNear).toContain(
      "so the carry-forward pay-down is complete and Sprint 191 is closed",
    );

    // Sprint 192 closes under its independent review (PS-2026-09-10-013);
    // component truth is certified; residual carries are #1892.
    expect(near).toContain(
      "Sprint 192 independently certified and closed by `#1891`; residual carries `#1892`",
    );
    expect(normalizedNear).toContain(
      "Sprint 192 is **Completed**, independently certified by review `PS-2026-09-10-013` and decision `#1891`.",
    );
    expect(normalizedNear).toContain(
      "so component truth is certified and Sprint 192 is closed",
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
      "Sprint 191 m04 closes maintenance `#1318`–`#1322`",
    );
    expect(normalizedNear).toContain(
      "## Increment 2 — Sprint 183: Runnable Generation — CLOSED 2026-09-05",
    );
    expect(normalizedNear).toContain(
      "`#1315` remains pending: the reproducible bundle and exact re-pin notices are prepared for Sprint 192 delivery after review, with zero sends.",
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
      "The live roadmap is `near.md`. Since 2026-09-12 it is the multi-phase, multi-sprint plan",
    );
    expect(normalizedIndex).toContain(
      "The program document changes only when Derek changes product direction.",
    );
    expect(normalizedIndex).toContain(
      "`product-reality-program.md` | The program's durable product contract and truth rules.",
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
