> **STALE / CLOSED — resolved (sprint-110 m06 closeout GC, 2026-06-16).**
> The root-cause styling change (commit `12552d3`) was reverted by commit
> `51456b0`, so this blocker no longer reproduces. It only ever affected the
> hierarchy/network components (Sunburst / Treemap / Sankey / ForceGraph), which
> are **outside the @oods/viz-core Phase-1 beachhead** (the 5 marks
> bar/line/area/scatter/heatmap). Phase 1 (data-aware intelligence) did not touch
> these components and the deferred boundary holds. Retained for history; no
> action required. (Refs: decision #698 deferred boundary; #693/#696.)

---

# B40 Blocker: Viz Component Sizing Broken

**Date**: 2025-12-04
**Severity**: High
**Affects**: All hierarchy/network viz components in Storybook

## Problem

All 4 new viz components render incorrectly in Storybook:
- Sunburst
- Treemap
- Sankey
- ForceGraph

Charts appear as tall narrow strips instead of proper dimensions. Titles are cut off. Chart content is tiny in huge empty containers.

## Root Cause

Commit `12552d3` ("Enhance chart components for improved responsiveness") changed the container styling in all 4 components from explicit dimensions to percentage-based width:

```jsx
// BROKEN (current)
style={{ width: '100%', maxWidth: width, height }}

// WORKING (before commit)
style={{ width, height }}
```

When Storybook's canvas constrains the container width, `width: '100%'` becomes narrow while `height` stays at 500-600px. ECharts fills this narrow-tall container, breaking the visualization.

## Affected Files

| File | Line |
|------|------|
| `src/components/viz/Sunburst.tsx` | ~236 |
| `src/components/viz/Treemap.tsx` | ~249 |
| `src/components/viz/Sankey.tsx` | ~236 |
| `src/components/viz/ForceGraph.tsx` | ~248 |

## Recommended Fix

In each file, change the chart container div style from:
```jsx
style={{ width: '100%', maxWidth: width, height }}
```

To:
```jsx
style={{ width, height }}
```

This restores explicit pixel dimensions and fixes the aspect ratio.

## Verification

After fix:
1. Run `pnpm storybook`
2. Navigate to Visualization/Hierarchical/Sunburst
3. Chart should render as ~550x550 square, not tall/narrow strip
4. Repeat for Treemap, Sankey, ForceGraph
