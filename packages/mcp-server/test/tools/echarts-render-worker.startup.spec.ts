import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

describe("MCP startup ECharts render boundary", () => {
  it("registers the server without importing ECharts or evaluating the render worker", () => {
    const serverEntry = new URL("../../src/index.ts", import.meta.url).href;
    const poisonMarker = "OODS_MAIN_REALM_ECHARTS_IMPORT";
    const hookUrl = `data:text/javascript,${encodeURIComponent(`
      export async function resolve(specifier, context, nextResolve) {
        if (specifier === "echarts" || specifier.startsWith("echarts/")) {
          throw new Error(${JSON.stringify(poisonMarker)} + ":" + specifier);
        }
        return nextResolve(specifier, context);
      }
    `)}`;
    const script = `
      import { register } from 'node:module';

      void (async () => {
        register(${JSON.stringify(hookUrl)}, import.meta.url);

        let poisonVerified = false;
        try {
          await import('echarts/core');
        } catch (error) {
          if (!String(error?.message ?? error).includes(${JSON.stringify(poisonMarker)})) {
            throw error;
          }
          poisonVerified = true;
        }
        if (!poisonVerified) {
          throw new Error('ECharts import poison hook did not reject echarts/core');
        }

        await import(${JSON.stringify(serverEntry)});
        const { getEChartsRenderWorkerState } = await import('@oods/viz-render');
        const state = await getEChartsRenderWorkerState();
        process.stdout.write(
          'OODS_STARTUP_PROBE=' + JSON.stringify({ poisonVerified, state }),
          () => process.exit(0),
        );
      })().catch((error) => {
        process.stderr.write(String(error?.stack ?? error), () => process.exit(1));
      });
    `;

    const child = spawnSync(
      process.execPath,
      ["--import", "tsx", "--input-type=module", "--eval", script],
      {
        cwd: fileURLToPath(new URL("../..", import.meta.url)),
        encoding: "utf8",
        timeout: 30_000,
        env: {
          ...process.env,
          MCP_HEALTH_PORT: "0",
          OODS_OTLP_ENDPOINT: "",
        },
      },
    );

    expect(child.error).toBeUndefined();
    expect(child.signal).toBeNull();
    expect(child.status, child.stderr).toBe(0);
    const match = child.stdout.match(/OODS_STARTUP_PROBE=(\{.*\})/);
    expect(match).not.toBeNull();
    const probe = JSON.parse(match?.[1] ?? "{}") as {
      poisonVerified?: boolean;
      state?: Record<string, unknown>;
    };
    expect(probe.poisonVerified).toBe(true);
    expect(probe.state).toMatchObject({
      workerCreated: false,
      echartsLoaded: false,
      spawnCount: 0,
      loadCount: 0,
    });
  });
});
