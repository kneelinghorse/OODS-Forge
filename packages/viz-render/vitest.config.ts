import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      // Resolve @oods/viz-render to SOURCE so the package's own tests verify the
      // public barrel without requiring a prior tsup build (mirrors viz-core).
      '@oods/viz-render': path.join(dirname, 'src/index.ts'),
    },
  },
  test: {
    include: ['test/**/*.spec.ts'],
    environment: 'node',
    testTimeout: 20_000,
    // Coverage gate (mirrors @oods/viz-core). Root CI's coverage only includes the
    // repo `src/**`, so this package's emitter would never be MEASURED otherwise;
    // enabled here so the viz-determinism CI step (`pnpm --filter @oods/viz-render
    // test`) enforces it. `all: true` counts untested files at 0% so a new uncovered
    // module is caught. Thresholds are MEASURED FLOORS (~5pts below the actuals).
    coverage: {
      enabled: true,
      provider: 'v8',
      include: ['src/**'],
      all: true,
      reporter: ['text-summary'],
      thresholds: {
        statements: 90,
        branches: 80,
        functions: 90,
        lines: 90,
      },
    },
  },
});
