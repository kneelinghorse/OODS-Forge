// viz.fromText (sprint-132 m03) — the consumer-observable MCP delta. A free-text
// utterance → a Claude parser (ABOVE the deterministic boundary, m02) emits the
// frozen s131 StructuredIntent → routed through the UNCHANGED viz.render → a governed
// chart, with the parsed intent ECHOED (advisory) so the agent can re-run
// viz.render(intent) deterministically. viz.render itself is byte-unchanged; the
// non-determinism is contained to the parse and measured by the m04 accuracy gate.
import { readFileSync } from 'node:fs';
import { getAjv } from '../lib/ajv.js';
import type { VizFromTextInput, VizFromTextOutput, VizRenderInput } from '../schemas/generated.js';
import { handle as vizRenderHandle } from './viz.render.js';
import { parseTextToIntent, type IntentProvider } from '../nlviz/index.js';

// Compile the viz.render INPUT schema ONCE. The parsed intent is routed through this
// AJV boundary — the same gate a direct viz.render caller hits — BEFORE rendering;
// we never call buildFromIntent raw. (Memoized at module scope, like the dispatcher
// compiles per tool, but compiled once here.)
const vizRenderInputSchema = JSON.parse(
  readFileSync(new URL('../schemas/viz.render.input.json', import.meta.url), 'utf8'),
) as Record<string, unknown>;
const validateVizRenderInput = getAjv().compile(vizRenderInputSchema);

export interface VizFromTextOptions {
  /** Inject the intent provider (test seam: offline fixture replay). Defaults to the live Claude provider. */
  provider?: IntentProvider;
}

export async function handle(input: VizFromTextInput, opts: VizFromTextOptions = {}): Promise<VizFromTextOutput> {
  const rows = input.rows as ReadonlyArray<Record<string, unknown>>;

  // 1. Parse the free text into the frozen StructuredIntent (ABOVE the boundary).
  //    May throw NlVizError (out-of-enum goal, provider/key failure) — propagates as
  //    a BAD_REQUEST error envelope from the dispatcher (no intent to echo).
  const intent = await parseTextToIntent(input.text, rows, opts.provider ? { provider: opts.provider } : {});

  // 2. Construct the viz.render input and route it through the viz.render AJV boundary.
  const vizInput: Record<string, unknown> = { intent, rows };
  if (input.output) {
    vizInput.output = input.output;
  }

  if (!validateVizRenderInput(vizInput)) {
    // The parsed intent did NOT pass viz.render's input gate (e.g. a thin-goal request
    // yielded zero measures — measures has minItems:1). Fail loud (Rule 12), but ECHO
    // the parsed intent so the agent sees exactly what was parsed and can correct it.
    const errors = (validateVizRenderInput.errors ?? []).map((e: { instancePath?: string; message?: string }) => ({
      code: 'OODS-V126',
      message: `Parsed intent failed viz.render input validation: ${`${e.instancePath || '/'} ${e.message ?? ''}`.trim()}`,
      severity: 'error' as const,
    }));
    return { status: 'error', spec: {}, warnings: [], errors, intent } as unknown as VizFromTextOutput;
  }

  // 3. Render deterministically via the UNCHANGED viz.render, then echo the advisory intent.
  const rendered = await vizRenderHandle(vizInput as unknown as VizRenderInput);
  return { ...rendered, intent } as unknown as VizFromTextOutput;
}
