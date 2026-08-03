import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge',
  test: {
    include: ['scratchpad/s169-m02/**/*.test.ts'],
    environment: 'node',
  },
});
