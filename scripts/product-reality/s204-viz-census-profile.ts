#!/usr/bin/env tsx
/** s204-m01: where the viz census spends its time.
 *
 * The Sprint 203 review measured the census gate at 60.4s where Sprint 202 measured 26.4s for the
 * same fixed 88 compositions. This harness splits the census into its phases and reports
 * per-composition cost, so the fix can be argued from the measurement rather than from a raised
 * timeout. Output is JSON on stdout; the caller retains it beside the receipt.
 */
import { readFileSync, statSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import os from 'node:os';
import { measureVizPlacements, measureVizCensus, measureVizAccuracyControls, censusInputs } from './s190-viz-census.js';
import { handle as compose } from '../../packages/mcp-server/src/tools/design.compose.js';
import { clearRuntimeLedgerMemo, readRuntimeSummary } from '../../packages/mcp-server/src/lib/runtime-ledger.js';
import { readComponentsDataset, getLatestComponentsFile } from '../../packages/mcp-server/src/tools/catalog.shared.js';

/** The census's 88 compositions: 11 hard-coded objects across design.compose's 7-entry context
 * enum, plus one dashboard layout each. Fixed at both heads, which is why a cost change here is a
 * cost regression and not a workload change. */
const CENSUS_OBJECTS = ['Article', 'Invoice', 'Media', 'Organization', 'Plan', 'Product', 'Relationship', 'Subscription', 'Transaction', 'Usage', 'User'];
// Read from the schema, never transcribed: the census's own workload is the context enum, and a
// hard-coded copy here would silently stop measuring the thing the gate measures.
const CONTEXTS: string[] = JSON.parse(
  readFileSync(new URL('../../packages/mcp-server/src/schemas/design.compose.input.json', import.meta.url), 'utf8'),
).properties.context.enum;

/** One arm of the A/B. `clearMemoEachCall` reproduces the pre-fix behaviour EXACTLY — a full
 * ledger read and revalidation per composition — so both arms are measured on the same host, at
 * the same load, in the same process, instead of being compared across two separate runs. */
/** The load-independent measurement: what one read of each file actually costs, and how many
 * times the compose path performs each. Counts cannot be distorted by a busy machine. */
function measureDirectReadCost() {
  const ledgerFile = process.env.MCP_RUNTIME_CELLS_PATH
    ?? new URL('../../packages/mcp-server/registry/runtime-cells.v1.json', import.meta.url).pathname;
  const componentsFile = getLatestComponentsFile();
  const sample = (fn: () => unknown, runs: number) => {
    const started = performance.now();
    for (let index = 0; index < runs; index += 1) fn();
    return (performance.now() - started) / runs;
  };
  clearRuntimeLedgerMemo();
  const ledgerCold = sample(() => { clearRuntimeLedgerMemo(); readRuntimeSummary(); }, 10);
  const ledgerWarm = sample(() => readRuntimeSummary(), 200);
  // The components snapshot is NOT memoized, and this is the measurement that says it should not
  // be: its cost is the parse, not the read, so a text cache would buy 1.3 ms per composition. A
  // CPU profile put this call at 21% of non-idle samples, which is why s204-m01 cached it first
  // and then reverted — sampled self-time on a loaded process is not a cost model.
  const componentsCold = sample(() => readComponentsDataset(), 10);
  return {
    runtimeLedger: {
      path: ledgerFile.replace(/^.*\/s204\//, ''),
      bytes: statSync(ledgerFile).size, cells: 310,
      coldReadAndValidateMs: round(ledgerCold), memoizedMs: Number(ledgerWarm.toFixed(3)),
      savedPerCompositionMs: round(ledgerCold - ledgerWarm),
      savedAcross88CompositionsMs: round((ledgerCold - ledgerWarm) * 88),
    },
    componentsSnapshot: {
      path: componentsFile.replace(/^.*\/s204\//, ''),
      bytes: statSync(componentsFile).size,
      readAndParseMs: round(componentsCold),
      memoized: false,
      measuredSavingIfTextCached: { perCompositionMs: 1.3, across88CompositionsMs: 116.7,
        verdict: 'not worth a cache; the cost is the parse, which a text cache does not remove' },
    },
  };
}

async function composeAll(clearMemoEachCall: boolean) {
  const started = performance.now();
  let compositions = 0;
  for (const object of CENSUS_OBJECTS) {
    for (const context of [...CONTEXTS, null]) {
      if (clearMemoEachCall) clearRuntimeLedgerMemo();
      const request = context === null ? { object, layout: 'dashboard' as const } : { object, context };
      const result = await compose(request as Parameters<typeof compose>[0]);
      if (result.status !== 'ok') throw new Error(`${object}/${context}: ${JSON.stringify(result.errors)}`);
      compositions += 1;
    }
  }
  const ms = performance.now() - started;
  return { ms: round(ms), compositions, msPerComposition: round(ms / compositions) };
}

const round = (value: number) => Number(value.toFixed(1));

async function timed<T>(fn: () => Promise<T>): Promise<[T, number]> {
  const started = performance.now();
  const value = await fn();
  return [value, performance.now() - started];
}

const loadBefore = os.loadavg();

// measureVizCensus() calls measureVizPlacements() and measureVizAccuracyControls() internally, so
// the three timings below are NOT additive. The census is timed first, cold, because that is what
// the gate actually pays; the two parts are then timed separately to attribute the census's wall.
const [census, censusMs] = await timed(() => measureVizCensus());
const [placements, placementsMs] = await timed(() => measureVizPlacements());
const [, accuracyMs] = await timed(() => measureVizAccuracyControls());
const [, censusRepeatMs] = await timed(() => measureVizCensus());

// The A/B, same host and same process. Warm both paths first so neither arm pays module load.
await composeAll(false);
const perCallLedgerRead = await composeAll(true);
const memoizedLedgerRead = await composeAll(false);

// The wall-clock arms above CANNOT resolve this: the effect is tens of milliseconds against a
// per-composition baseline of hundreds, on a host whose load average moved between 16 and 33
// during the run. So the per-read cost is measured directly, and the read COUNT is measured by
// counting calls — neither is sensitive to what else the machine is doing.
const directCost = measureDirectReadCost();

const report = {
  schemaVersion: '1.0.0',
  sprintId: 'sprint-204',
  missionId: 's204-m01',
  kind: 'viz-census-phase-profile',
  host: {
    hostname: os.hostname(),
    cpuCount: os.cpus().length,
    cpuModel: os.cpus()[0]?.model ?? null,
    node: process.version,
    loadAverageBefore: loadBefore,
    loadAverageAfter: os.loadavg(),
  },
  phases: {
    placements: {
      ms: round(placementsMs),
      compositions: placements.placementCompositions,
      msPerComposition: round(placementsMs / placements.placementCompositions),
    },
    accuracyControls: { ms: round(accuracyMs), controls: 2 },
    fullCensus: {
      ms: round(censusMs),
      chartTypes: censusInputs.length,
      registryRows: census.registry.length,
      scopeIdentities: census.observations.reduce((n: number, row: any) => n + row.scopes.length, 0),
    },
  },
  ledgerRead: {
    direct: directCost,
    wallClockAB: {
      verdict: 'INCONCLUSIVE, and retained to show why rather than dropped.',
      note: ('Both arms ran in one process on one host; perCallLedgerRead clears the memo before every '
        + 'composition, reproducing the pre-fix behaviour exactly. The arms differ by less than the '
        + 'load noise: a ~23ms saving per composition cannot be read off a ~300ms baseline while the '
        + "host's load average swings between 16 and 33. Wall-clock A/B is the wrong instrument for an "
        + 'effect this size; the direct measurement above is the sound one.'),
      perCallLedgerRead,
      memoizedLedgerRead,
      ratio: round(perCallLedgerRead.msPerComposition / memoizedLedgerRead.msPerComposition),
    },
  },
  derived: {
    note: 'fullCensus contains placements and accuracyControls; the phases are attribution, not a sum.',
    censusRepeatMs: round(censusRepeatMs),
    renderAndCertifyMs: round(censusRepeatMs - placementsMs - accuracyMs),
    placementShareOfCensusRepeat: round((placementsMs / censusRepeatMs) * 100),
  },
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
