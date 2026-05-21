import { defineConfig } from 'vitest/config';

// Q1 determinism scale-tier suite. Opt-in via `pnpm --filter @oods/mcp-server
// run test:scale`. Wired as a separate CI check (.github/workflows/ci.yml
// scale-determinism job) per the s105-m03 audit (decision #614). The
// release-gate integration is deferred until s106 + s107 sustain a 3-sprint
// determinism streak per mission-graph V2 axis #7.
export default defineConfig({
  test: {
    include: ['test/scale/**/*.spec.ts'],
    environment: 'node',
    // 1000-tier dry-run measures ~1.2s; budget generously to absorb CI
    // worker variance without serializing.
    testTimeout: 60_000,
    hookTimeout: 60_000,
    setupFiles: ['./test/setup-env.ts'],
  },
});
