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
    const roadmapIndex = read("cmos/foundational-docs/roadmap/README.md");
    const historicalVisionDocs = [
      read("cmos/foundational-docs/mission-graph.md"),
      read("cmos/foundational-docs/overview.md"),
      read("cmos/foundational-docs/strategic-position.md"),
    ];
    const bannerStart = near.indexOf(
      "> **⚠️ FROZEN HISTORY / CURRENT RESET — 2026-08-25; NL→viz arc REVERTED 2026-06-29.**",
    );
    const bannerEnd = near.indexOf("\n\nThis file now answers", bannerStart);

    expect(near).toContain(
      "**Status:** Active — Forge serving horizon for the Shopify-selected direction",
    );
    expect(near).toContain("[Roadmap index](README.md)");
    expect(bannerStart).toBeGreaterThanOrEqual(0);
    expect(bannerEnd).toBeGreaterThan(bannerStart);

    const banner = near.slice(bannerStart, bannerEnd);
    const outsideBanner = `${near.slice(0, bannerStart)}${near.slice(bannerEnd)}`;
    expect(banner).toContain("viz.fromText");
    expect(banner).toContain("typed, structured `viz.render` intent");
    expect(banner).toContain("dimensionRef");
    expect(outsideBanner).not.toContain("NL→viz");
    expect(outsideBanner).not.toContain("viz.fromText");
    expect(outsideBanner).not.toContain("dimensionRef");
    expect(outsideBanner).not.toContain("rewrite remains parked");

    const normalizedNear = near.replace(/^>\s?/gm, "").replace(/\s+/g, " ");
    expect(normalizedNear).toContain(
      'CONSUMER MODEL (Derek, 2026-06-18 — standing constraint, supersedes the s115 "consumer pull" framing): Forge\'s consumer is AGENTS using the Forge tools via MCP. That is who we build for. (1) There is NO external project that PULLs from Forge — do NOT frame any sprint, mission, or value case around "proving a consumer pull" or any other team adopting a Forge output. (2) Forge is NOT a hosted/SaaS service and there are NO current plans to be one; nothing should assume a deployed/reachable Forge endpoint. (3) There are NO plans to use Synthesis-Workbench with the viz/export work — do not assume a Workbench surface. (4) Headless integrations are welcome IN PRINCIPLE but are a SEPARATE initiative that must be discussed explicitly BEFORE any work — as must ANY dependency that would be created for a live production site. Capabilities ship for agent use first; cross-app/production wiring is its own decision, never an implied sprint goal. This is why s115\'s m06 (a cmos-dashboard cutover) was correctly dropped and why the "demand signal / pull" thesis behind it is retracted.',
    );
    expect(near).toContain("19 auto-registered tools plus 6 on-demand tools");
    expect(near).toContain("13 `viz.render` types");
    expect(near).toContain("supports 11 of the 13 chart types");
    expect(near).toContain("5 Cartesian types are `coverage:'certified'`");
    expect(near).toContain("real contrast verdict");
    expect(near).toContain("Shopify's D1–D6 and sprint sequence");
    expect(near).toContain("s96–s107 mission shapes");
    expect(near).not.toContain("no contrast verdict");
    expect(near).not.toContain("**s131 —");
    expect(near).not.toContain("**s132 —");

    expect(roadmapIndex).toContain(
      "live Forge near-horizon planning surface, refreshed **2026-08-25**",
    );
    expect(roadmapIndex).not.toContain("sprint-120 close");
    expect(roadmapIndex).not.toContain("tracks the s108–s120 horizon");
    expect(roadmapIndex).not.toContain("s96–s104 sprint shapes");

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

  it("keeps the open-arcs ledger aligned with the Sprint 178 closures and parks", () => {
    const ledger = read("cmos/planning/forge-open-arcs-ledger-2026-08.md");

    expect(ledger).toContain(
      "92 — 23 open, 56 done, 7 blocked, 5 superseded, 1 unknown",
    );
    expect(ledger).toContain("2 carry, 26 park, 59 close, 5 drop");
    expect(ledger).toContain("next-step #1259 completed");
    expect(ledger).toContain("next-step #1142 completed");
    expect(ledger).toContain("exact pin 138→0");
    expect(ledger).toContain("26 pure shims were deleted");
    expect(ledger).toContain("render-grading implementation remains parked");
    expect(ledger).not.toContain("91 semantic build:stories errors");
    expect(ledger).not.toContain("3 unbridged focus slots need real brand tokens");
    expect(ledger).not.toContain("src/viz twin ~137-site rewire");
  });
});
