// The Claude provider (sprint-132 m02) — runs ABOVE the viz.render tool boundary.
// Two modes: a LIVE provider (Anthropic @anthropic-ai/sdk, forced tool-use) and an
// offline fixture-REPLAY provider (recorded outputs, the default test path — no key,
// no network). Both return the RAW tool input; parser.ts normalizes it.
import Anthropic from '@anthropic-ai/sdk';
import {
  DEFAULT_MODEL,
  INTENT_TOOL,
  SYSTEM_PROMPT,
  buildUserPrompt,
  NlVizError,
  type IntentProvider,
} from './intent-contract.js';

export interface ClaudeProviderOptions {
  /** API key. Defaults to `process.env.ANTHROPIC_API_KEY` (loaded via the existing load-env dotenv pattern). */
  apiKey?: string;
  /** Model id. Defaults to the bare current-Opus id `claude-opus-4-8`. */
  model?: string;
  /** Output cap. The intent is small; defaults to 1024. */
  maxTokens?: number;
  /** Governed `gm.*` refs surfaced to the model so it picks a valid measureRef (or omits one). */
  governedMeasureRefs?: ReadonlyArray<string>;
  /** Inject a pre-built client (test seam — exercises the live extraction path without a network call). */
  client?: Anthropic;
}

/**
 * LIVE provider: calls Claude with a FORCED tool-use request so the model emits the
 * typed intent shape (never prose), and returns the tool-call input. Thinking is
 * intentionally omitted — forced `tool_choice` is incompatible with extended thinking,
 * and Opus 4.8 runs without thinking when the field is absent.
 */
export function createClaudeIntentProvider(opts: ClaudeProviderOptions = {}): IntentProvider {
  const model = opts.model ?? DEFAULT_MODEL;
  const maxTokens = opts.maxTokens ?? 1024;
  const governed = opts.governedMeasureRefs ?? [];
  let client = opts.client;

  return async (text, rows) => {
    if (!client) {
      const apiKey = opts.apiKey ?? process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new NlVizError(
          'ANTHROPIC_API_KEY is not set — live mode unavailable. Use a replay provider (createReplayIntentProvider) for offline tests.',
        );
      }
      client = new Anthropic({ apiKey });
    }

    const message = await client.messages.create({
      model,
      max_tokens: maxTokens,
      system: SYSTEM_PROMPT,
      tools: [INTENT_TOOL],
      tool_choice: { type: 'tool', name: INTENT_TOOL.name },
      messages: [{ role: 'user', content: buildUserPrompt(text, rows, governed) }],
    });

    const block = message.content.find((b) => b.type === 'tool_use' && b.name === INTENT_TOOL.name);
    if (!block || block.type !== 'tool_use') {
      throw new NlVizError(
        `Claude did not emit the ${INTENT_TOOL.name} tool call (stop_reason=${message.stop_reason ?? 'unknown'}).`,
      );
    }
    return block.input;
  };
}

/**
 * Offline REPLAY provider: returns a recorded raw intent for an exact utterance. The
 * default test path — deterministic, no API key, no network (so it runs in secret-less
 * PR CI). The m04 accuracy eval reuses this to replay a labeled corpus.
 */
export function createReplayIntentProvider(fixtures: ReadonlyMap<string, unknown>): IntentProvider {
  return async (text) => {
    if (!fixtures.has(text)) {
      throw new NlVizError(`No replay fixture recorded for utterance: ${JSON.stringify(text)}`);
    }
    return fixtures.get(text);
  };
}
