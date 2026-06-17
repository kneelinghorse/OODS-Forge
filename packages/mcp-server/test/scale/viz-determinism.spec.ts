/**
 * Q1 determinism gate — VIZ half (sprint-110 m05).
 *
 * Extends the map.apply-only scale coverage with the data-aware viz pipeline:
 * at 100/500/1000 rows, the SAME seed must yield a byte-identical
 *   rows -> FieldProfile[] -> SchemaIntent -> ranking -> NormalizedVizSpec.
 *
 * This is the enforcement behind "same rows -> same profile -> same
 * recommendation". It runs under vitest.scale.config (test/scale/**) and rides
 * the #408 closeout gate + the scale-determinism CI job.
 */
import { describe, expect, it } from 'vitest';
import {
  buildVizSpecFromRows,
  inferFieldProfile,
  suggestPatterns,
  toSchemaIntent,
  validateNormalizedVizSpec,
} from '@oods/viz-core';
import { synthesizeVizRows, type VizScaleTier } from './viz-synth.js';

const TIERS: VizScaleTier[] = [100, 500, 1000];
const SEED = 42;

const profileJson = (rows: Array<Record<string, unknown>>) => JSON.stringify(inferFieldProfile(rows));
const intentJson = (rows: Array<Record<string, unknown>>) =>
  JSON.stringify(toSchemaIntent(inferFieldProfile(rows), rows));
const rankingJson = (rows: Array<Record<string, unknown>>) =>
  JSON.stringify(
    suggestPatterns(toSchemaIntent(inferFieldProfile(rows), rows), { limit: 20 }).map((s) => [
      s.pattern.id,
      s.score,
    ]),
  );
const specJson = (rows: Array<Record<string, unknown>>) => JSON.stringify(buildVizSpecFromRows({ rows }).spec);

describe('viz scale-tier determinism', () => {
  for (const tier of TIERS) {
    it(`tier=${tier}: same seed -> byte-identical rows`, () => {
      const a = synthesizeVizRows({ tier, seed: SEED });
      const b = synthesizeVizRows({ tier, seed: SEED });
      expect(JSON.stringify(a)).toEqual(JSON.stringify(b));
      expect(a).toHaveLength(tier);
    });

    it(`tier=${tier}: same seed -> byte-identical FieldProfile[]`, () => {
      const a = synthesizeVizRows({ tier, seed: SEED });
      const b = synthesizeVizRows({ tier, seed: SEED });
      expect(profileJson(a)).toEqual(profileJson(b));
    });

    it(`tier=${tier}: same seed -> byte-identical SchemaIntent`, () => {
      const a = synthesizeVizRows({ tier, seed: SEED });
      const b = synthesizeVizRows({ tier, seed: SEED });
      expect(intentJson(a)).toEqual(intentJson(b));
    });

    it(`tier=${tier}: same seed -> byte-identical recommendation ranking`, () => {
      const a = synthesizeVizRows({ tier, seed: SEED });
      const b = synthesizeVizRows({ tier, seed: SEED });
      expect(rankingJson(a)).toEqual(rankingJson(b));
    });

    it(`tier=${tier}: same seed -> byte-identical, valid NormalizedVizSpec`, () => {
      const rows = synthesizeVizRows({ tier, seed: SEED });
      const rerun = synthesizeVizRows({ tier, seed: SEED });
      expect(specJson(rows)).toEqual(specJson(rerun));
      expect(validateNormalizedVizSpec(buildVizSpecFromRows({ rows }).spec).valid).toBe(true);
    });

    it(`tier=${tier}: different seeds -> different rows (synth is seed-sensitive)`, () => {
      const a = synthesizeVizRows({ tier, seed: 1 });
      const b = synthesizeVizRows({ tier, seed: 2 });
      expect(JSON.stringify(a)).not.toEqual(JSON.stringify(b));
    });
  }
});
