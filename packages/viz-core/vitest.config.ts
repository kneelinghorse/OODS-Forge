import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      // Resolve @oods/viz-core to SOURCE so the package's own tests verify the
      // public barrel without requiring a prior tsup build (Q1 determinism).
      '@oods/viz-core': path.join(dirname, 'src/index.ts'),
    },
  },
  test: {
    include: ['test/**/*.spec.ts'],
    environment: 'node',
    testTimeout: 20_000,
  },
});
