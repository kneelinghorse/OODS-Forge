import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  PORTED_COMPONENT_IDS,
  runS184M04PackedConsumers,
} from '../../../../scripts/product-reality/s184-m04-packed-consumers.mjs';

const temporaryRoots: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => (
    fs.rm(root, { recursive: true, force: true })
  )));
});

describe('Sprint 184 m04 packed ported consumers', () => {
  it(
    'installs only built OODS tarballs in fresh React and Vue consumers and resolves every new subpath externally',
    async () => {
      const root = await fs.mkdtemp(path.join(os.tmpdir(), 'oods-s184-m04-packed-proof-'));
      temporaryRoots.push(root);

      const { report, targetReports } = await runS184M04PackedConsumers(root);

      expect(report).toMatchObject({
        status: 'passed',
        selected: 16,
        passed: 16,
        failed: 0,
        skipped: 0,
        targetCount: 2,
        componentCount: 8,
        surfaceCellCount: 16,
      });
      expect(report.components.map(({ componentId }) => componentId)).toEqual(
        PORTED_COMPONENT_IDS,
      );
      expect(report.components.map(({ anchor }) => anchor)).toEqual(
        PORTED_COMPONENT_IDS.map((componentId) => `#${componentId}`),
      );
      expect(report.components.every(({ generatedConsumer, state }) => (
        generatedConsumer.react === 'passed'
        && generatedConsumer.vue === 'passed'
        && state === 'implemented-evidence-complete'
      ))).toBe(true);

      expect(targetReports.map(({ target }) => target)).toEqual(['react', 'vue']);
      for (const target of targetReports) {
        expect(target).toMatchObject({
          status: 'passed',
          selected: 8,
          passed: 8,
          failed: 0,
          skipped: 0,
          isolation: {
            outsidePnpmWorkspace: true,
            freshNodeModules: true,
            emptyVerifierOwnedNpmConfiguration: true,
            installScripts: false,
            localPackagesFromBuiltTarballsOnly: true,
            workspaceAliases: false,
            workspaceSymlinks: false,
            repositorySourceImports: false,
            allResolvedPathsOutsideRepository: true,
          },
        });
        expect(target.install.localTarballs.map(({ name }) => name)).toEqual([
          '@oods/tokens',
          '@oods/component-contracts',
          '@oods/component-styles',
          `@oods/components-${target.target}`,
        ]);
        expect(target.proof.componentIds).toEqual(PORTED_COMPONENT_IDS);
        expect(target.proof.runtimeIds).toEqual(PORTED_COMPONENT_IDS);
        expect(target.proof.commonJsIds).toEqual(PORTED_COMPONENT_IDS);
        expect(target.proof.readinessIds).toEqual(PORTED_COMPONENT_IDS);
        expect(target.proof.cssComponentIds).toEqual(PORTED_COMPONENT_IDS);
        expect(target.proof.resolutions.map(({ specifier }) => specifier)).toEqual([
          '@oods/component-contracts',
          `@oods/components-${target.target}/ported`,
          `@oods/components-${target.target}/readiness-ported`,
          '@oods/component-styles/css-ported',
        ]);
        expect(target.proof.resolutions.every(({ consumerRelative }) => (
          consumerRelative.startsWith('node_modules/')
        ))).toBe(true);
        expect(target.proof.ssr).toMatchObject({ componentId: 'PriceBadge' });
        expect(target.proof.ssr.html).toContain('data-badge-variant="price"');
      }

      const written = JSON.parse(await fs.readFile(path.join(root, 'report.json'), 'utf8'));
      expect(written).toEqual(report);
      expect(report.overlayReference).toBe(
        'artifacts/product-reality/sprint-184/m04/packed-consumers/report.json',
      );
      expect(report.submittedPackages.map(({ name }) => name)).toEqual([
        '@oods/tokens',
        '@oods/component-contracts',
        '@oods/component-styles',
        '@oods/components-react',
        '@oods/components-vue',
      ]);

      for (const target of ['react', 'vue'] as const) {
        const source = await fs.readFile(path.join(root, target, 'consumer.mjs'), 'utf8');
        expect(source).toContain(`from '@oods/components-${target}/ported'`);
        expect(source).toContain(`from '@oods/components-${target}/readiness-ported'`);
        expect(source).toContain("import.meta.resolve('@oods/component-styles/css-ported')");
        expect(source).not.toContain('/OODS-Forge/');
      }
    },
    900_000,
  );
});
