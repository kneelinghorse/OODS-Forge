// Governed-measure registry loader (sprint-117, Phase-3 resolution).
//
// Reads the standalone DATA artifact at ../schemas/measure-registry.json (bundled
// to dist/schemas/ by the package.json wildcard cp; skip-listed from Generator A
// so it never enters generated.ts), parses it ONCE, and memoizes a Map keyed by
// the governed-measure reference (the value of KpiPanel.measureRef, e.g.
// 'gm.revenue.total'). Mirrors the JSON-load PATTERN of registry.ts
// (fileURLToPath + path.join + try/catch FALLBACK) but resolves CROSS-DIR
// (src/tools -> src/schemas), and adds module-level memoization.
//
// The mcp-server resolver consumes this in a later mission (s117-m02); this loader
// is intentionally UNREFERENCED by dashboard.render handle() when it lands, so the
// artifact re-bakes no dashboard output.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { KpiPanel } from '@oods/viz-core';

// A single governed-measure entry. entityField + aggregate are the AUTHORITATIVE
// compute inputs (they OVERRIDE the author's field/aggregate when resolved);
// defaultComparison/defaultThreshold are author-overridable fallbacks (?? fill).
// The remaining fields are governance/provenance metadata UNREAD by computeKpi.
export interface MeasureEntry {
  /** Canonical measure name. */
  name: string;
  /** The dataset column the measure aggregates — overrides KpiPanel.field. */
  entityField: string;
  /** The point-in-time aggregate — overrides KpiPanel.aggregate. */
  aggregate: NonNullable<KpiPanel['aggregate']>;
  /**
   * Governance classifier (e.g. 'metric' | 'dimension'). DELIBERATELY NOT the
   * overloaded `role` (PatternField.role, pragmatic_role) NOR `semantics`
   * (SemanticMapping) — none of those meanings apply here.
   */
  measureRole: string;
  /** Optional UI label. */
  displayName?: string;
  /** Optional renderer-agnostic number-format hint. */
  format?: string;
  /** Optional unit label. */
  unit?: string;
  /** Author-overridable default comparison (filled only when the panel omits comparison). */
  defaultComparison?: KpiPanel['comparison'];
  /** Author-overridable default threshold (filled only when the panel omits threshold). */
  defaultThreshold?: KpiPanel['threshold'];
  /** Free-text provenance note. */
  provenance?: string;
}

interface MeasureRegistryFile {
  schemaVersion?: string;
  measures?: Record<string, MeasureEntry>;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Loader lives in src/tools/; the artifact in src/schemas/ — cross-dir (mirror
// the registry.ts PATTERN, not its same-dir './registry.json').
const REGISTRY_PATH = path.join(__dirname, '..', 'schemas', 'measure-registry.json');

// Module-level singleton: parse once, memoize.
let cached: Map<string, MeasureEntry> | undefined;

/**
 * Load (and memoize) the governed-measure registry as a Map keyed by measure
 * reference. A FILE read/parse FAILURE falls back to an EMPTY registry (the
 * registry.ts FALLBACK posture) — distinct from a missing measure KEY, which is
 * the resolver's unresolvable-measure hard-error case (OODS-V130, s117-m03).
 */
export function loadMeasureRegistry(): Map<string, MeasureEntry> {
  if (cached) {
    return cached;
  }
  const registry = new Map<string, MeasureEntry>();
  try {
    const raw = fs.readFileSync(REGISTRY_PATH, 'utf8');
    const parsed = JSON.parse(raw) as MeasureRegistryFile;
    if (parsed.measures && typeof parsed.measures === 'object') {
      for (const [key, entry] of Object.entries(parsed.measures)) {
        registry.set(key, entry);
      }
    }
  } catch {
    // Empty registry on read/parse failure: every measureRef then resolves to
    // undefined, surfaced downstream as an unresolvable-measure error — never a
    // silent value:0.
  }
  cached = registry;
  return cached;
}

/**
 * Resolve a governed-measure reference to its entry, or `undefined` when the key
 * is not registered.
 */
export function resolveMeasure(ref: string): MeasureEntry | undefined {
  return loadMeasureRegistry().get(ref);
}
