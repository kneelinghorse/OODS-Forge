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

  it("marks the near roadmap frozen and contains NL-to-viz history in one banner", () => {
    const near = read("cmos/foundational-docs/roadmap/near.md");
    const bannerStart = near.indexOf("> ### ⚠️ NL→viz arc REVERTED 2026-06-29");
    const bannerEnd = near.indexOf(
      "### ✅ Certify-at-emission arc",
      bannerStart,
    );

    expect(near).toContain("**Status:** Frozen at sprint-144");
    expect(near).toContain("FROZEN AT SPRINT-144 — recorded 2026-08-25");
    expect(near).not.toContain("This is the live horizon");
    expect(near).not.toContain("▶ Current arc");
    expect(bannerStart).toBeGreaterThanOrEqual(0);
    expect(bannerEnd).toBeGreaterThan(bannerStart);

    const banner = near.slice(bannerStart, bannerEnd);
    const outsideBanner = `${near.slice(0, bannerStart)}${near.slice(bannerEnd)}`;
    expect(banner).toContain("viz.fromText");
    expect(banner).toContain("typed `viz.render` intent survived");
    expect(outsideBanner).not.toContain("NL→viz");
    expect(outsideBanner).not.toContain("viz.fromText");
    expect(near).not.toContain("**s131 —");
    expect(near).not.toContain("**s132 —");
  });

  it("closes the historical Sprint 41 plan header", () => {
    const sprintPlan = read("cmos/planning/sprint-41-plan.md");

    expect(sprintPlan).toContain("**Status:** Closed (7/7 missions complete)");
    expect(sprintPlan).not.toContain("**Status:** Planning");
  });
});
