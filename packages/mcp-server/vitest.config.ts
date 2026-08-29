import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.spec.ts', 'src/**/*.test.ts'],
    // Scale and ECharts soak suites are opt-in through their dedicated configs.
    // Per the s105-m03 audit (decision #614), scale tests run as a separate
    // CI check before any release-gate integration; folding them into the
    // default suite would couple release stability to determinism work that
    // hasn't yet sustained the 3-sprint streak.
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      'test/scale/**',
      'test/soak/**',
    ],
    environment: 'node',
    testTimeout: 20_000,
    hookTimeout: 180_000,
    setupFiles: ['./test/setup-env.ts'],
  },
});
